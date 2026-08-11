import type { AdminRoom, AdminStats } from "./api";

const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 30000;

// Mirrors getSocketBaseUrl() in socket.ts: VITE_SOCKET_URL (http→ws),
// local backend in dev, same origin in prod.
const getSocketBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_SOCKET_URL;
  if (envUrl) {
    return envUrl.replace(/^http/, "ws").replace(/\/+$/, "");
  }
  if (import.meta.env.DEV) {
    return "ws://localhost:3000";
  }
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}`;
};

export interface AdminSnapshotPayload {
  stats: AdminStats;
  rooms: AdminRoom[];
}

export interface AdminRoomEventPayload {
  roomId: number;
  event: string;
  data: Record<string, unknown>;
  player: number | null;
  at: number;
}

export interface AdminChatMessagePayload {
  roomId: number;
  /** Backend chat pipeline'ında slug ucuz değil; client snapshot'tan çözer. */
  roomSlug?: string | null;
  userId: number;
  username: string;
  message: string;
  at: number;
}

export type AdminFrame =
  | { type: "snapshot"; payload: AdminSnapshotPayload }
  | { type: "roomEvent"; payload: AdminRoomEventPayload }
  | { type: "chatMessage"; payload: AdminChatMessagePayload }
  | { type: "stats"; payload: AdminStats }
  | { type: string; payload: unknown };

export type AdminConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected";

type FrameListener = (frame: AdminFrame) => void;
type StatusListener = (status: AdminConnectionStatus) => void;

class AdminSocketService {
  private ws: WebSocket | null = null;

  private token: string | null = null;

  private frameListeners: Set<FrameListener> = new Set();

  private statusListeners: Set<StatusListener> = new Set();

  private reconnectAttempts = 0;

  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private intentionalDisconnect = false;

  private status: AdminConnectionStatus = "disconnected";

  connect(token: string): void {
    this.token = token;
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.intentionalDisconnect = false;
    this.setStatus("connecting");

    const url = `${getSocketBaseUrl()}/ws/admin?token=${encodeURIComponent(token)}`;
    this.ws = new WebSocket(url);
    this.ws.onopen = () => this.handleOpen();
    this.ws.onmessage = (event) => this.handleMessage(event);
    this.ws.onclose = () => this.handleClose();
    this.ws.onerror = (event) => {
      console.error("Admin WebSocket error", event);
    };
  }

  disconnect(): void {
    this.intentionalDisconnect = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = 0;
    this.setStatus("disconnected");
  }

  subscribe(listener: FrameListener): () => void {
    this.frameListeners.add(listener);
    return () => {
      this.frameListeners.delete(listener);
    };
  }

  subscribeStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  getStatus(): AdminConnectionStatus {
    return this.status;
  }

  private setStatus(status: AdminConnectionStatus): void {
    this.status = status;
    for (const listener of this.statusListeners) {
      listener(status);
    }
  }

  private handleOpen(): void {
    this.reconnectAttempts = 0;
    this.setStatus("connected");
  }

  private handleClose(): void {
    this.ws = null;
    if (this.intentionalDisconnect) {
      this.setStatus("disconnected");
      return;
    }

    this.setStatus("connecting");
    const delay = Math.min(
      RECONNECT_BASE_DELAY_MS * 2 ** this.reconnectAttempts,
      RECONNECT_MAX_DELAY_MS
    );
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.token) {
        this.connect(this.token);
      }
    }, delay);
  }

  private handleMessage(event: MessageEvent): void {
    let frame: AdminFrame;
    try {
      frame = JSON.parse(event.data);
    } catch {
      console.error("Invalid admin WebSocket message", event.data);
      return;
    }
    if (!frame || typeof frame.type !== "string") return;

    for (const listener of this.frameListeners) {
      listener(frame);
    }
  }
}

export const adminSocketService = new AdminSocketService();
