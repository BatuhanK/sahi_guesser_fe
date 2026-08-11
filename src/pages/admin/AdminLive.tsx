import { ExternalLink, Pause, Play, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { adminApi, type AdminRoom, type AdminStats } from "../../services/api";
import {
  adminSocketService,
  type AdminConnectionStatus,
  type AdminFrame,
  type AdminRoomEventPayload,
} from "../../services/adminSocket";
import { cn } from "../../lib/utils";
import { AdminBadge, type BadgeTone } from "./components";
import { formatTime, roomStatusBadge } from "./utils";

const MAX_FEED_ENTRIES = 200;
const MAX_BUFFER_ENTRIES = 500;

type FeedKind = "join" | "leave" | "guess" | "chat" | "lifecycle";
type FeedFilter = "all" | "presence" | "guess" | "chat" | "lifecycle";

interface FeedEntry {
  id: string;
  at: number;
  roomId: number;
  roomSlug: string | null;
  kind: FeedKind;
  text: string;
}

function pickUsername(data: Record<string, unknown>): string {
  if (typeof data.username === "string" && data.username) return data.username;
  const user = data.user as Record<string, unknown> | undefined;
  if (user && typeof user.username === "string" && user.username) {
    return user.username;
  }
  return "Bir oyuncu";
}

function guessSuffix(data: Record<string, unknown>): string {
  return typeof data.guessCount === "number"
    ? ` (${data.guessCount}. tahmin)`
    : "";
}

const CAR_GUESS_KINDS: Record<string, string> = {
  brand: "marka",
  model: "model",
  year: "yıl",
};

function humanizeGuessEvent(
  event: string,
  data: Record<string, unknown>
): string {
  const username = pickUsername(data);
  switch (event) {
    case "correctGuess":
      return `${username} doğru tahmini buldu${guessSuffix(data)}`;
    case "incorrectGuess":
      return `${username} tahmin yaptı${guessSuffix(data)}`;
    default:
      return `${username} tahmin yaptı`;
  }
}

interface ExpandedEvent {
  kind: FeedKind;
  text: string;
  /** Oda kartındaki oyuncu sayısına etkisi (join +1, leave -1). */
  playerDelta: number;
}

function expandRoomEvent(payload: AdminRoomEventPayload): ExpandedEvent[] {
  const data = payload.data ?? {};
  const username = pickUsername(data);
  switch (payload.event) {
    case "playerJoined":
      return [
        { kind: "join", text: `${username} odaya katıldı`, playerDelta: 1 },
      ];
    case "playerLeft":
      return [
        { kind: "leave", text: `${username} odadan ayrıldı`, playerDelta: -1 },
      ];
    case "presenceBatch": {
      const joined = Array.isArray(data.joined) ? data.joined : [];
      const leftUsers = Array.isArray(data.leftUsers) ? data.leftUsers : [];
      const leftIds = Array.isArray(data.left) ? data.left : [];
      const entries: ExpandedEvent[] = [];
      for (const u of joined as Record<string, unknown>[]) {
        entries.push({
          kind: "join",
          text: `${pickUsername(u)} odaya katıldı`,
          playerDelta: 1,
        });
      }
      if (leftUsers.length > 0) {
        for (const u of leftUsers as Record<string, unknown>[]) {
          entries.push({
            kind: "leave",
            text: `${pickUsername(u)} odadan ayrıldı`,
            playerDelta: -1,
          });
        }
      } else {
        for (let i = 0; i < leftIds.length; i += 1) {
          entries.push({
            kind: "leave",
            text: "Bir oyuncu odadan ayrıldı",
            playerDelta: -1,
          });
        }
      }
      return entries;
    }
    case "guessFeed": {
      const guesses = Array.isArray(data.guesses) ? data.guesses : [];
      return (guesses as Record<string, unknown>[]).map((g) => ({
        kind: "guess" as FeedKind,
        text: humanizeGuessEvent(String(g.type ?? "guess"), g),
        playerDelta: 0,
      }));
    }
    case "carGuess": {
      const kind =
        typeof data.kind === "string"
          ? (CAR_GUESS_KINDS[data.kind] ?? data.kind)
          : "parça";
      return [
        {
          kind: "guess",
          text: `${username} araba tahmini yaptı (${kind})`,
          playerDelta: 0,
        },
      ];
    }
    case "maxGuessesReached":
      return [
        {
          kind: "guess",
          text: `${username} tahmin hakkını doldurdu`,
          playerDelta: 0,
        },
      ];
    case "roundStart":
      return [{ kind: "lifecycle", text: "Yeni tur başladı", playerDelta: 0 }];
    case "roundEnd":
      return [{ kind: "lifecycle", text: "Tur sona erdi", playerDelta: 0 }];
    case "intermissionStart":
      return [{ kind: "lifecycle", text: "Mola başladı", playerDelta: 0 }];
    case "roomEnd":
      return [{ kind: "lifecycle", text: "Oda kapandı", playerDelta: 0 }];
    case "roomCompleted":
      return [{ kind: "lifecycle", text: "Oyun tamamlandı", playerDelta: 0 }];
    default:
      return [{ kind: "lifecycle", text: payload.event, playerDelta: 0 }];
  }
}

const kindBadgeTone: Record<FeedKind, { label: string; tone: BadgeTone }> = {
  join: { label: "Katılma", tone: "success" },
  leave: { label: "Ayrılma", tone: "neutral" },
  guess: { label: "Tahmin", tone: "accent" },
  chat: { label: "Chat", tone: "info" },
  lifecycle: { label: "Oda/Tur", tone: "neutral" },
};

const FILTER_CHIPS: { key: FeedFilter; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "presence", label: "Katılma/Ayrılma" },
  { key: "guess", label: "Tahminler" },
  { key: "chat", label: "Chat" },
  { key: "lifecycle", label: "Tur/Oda" },
];

function matchesFilter(entry: FeedEntry, filter: FeedFilter): boolean {
  if (filter === "all") return true;
  if (filter === "presence") return entry.kind === "join" || entry.kind === "leave";
  return entry.kind === filter;
}

const statusDot: Record<AdminConnectionStatus, { label: string; className: string }> = {
  connected: { label: "Bağlı", className: "bg-[var(--success-text)]" },
  connecting: { label: "Bağlanıyor", className: "bg-[var(--warning-text)] animate-pulse" },
  disconnected: { label: "Bağlantı Yok", className: "bg-[var(--text-tertiary)]" },
};

export function AdminLive() {
  const [status, setStatus] = useState<AdminConnectionStatus>(
    adminSocketService.getStatus()
  );
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [latestByRoom, setLatestByRoom] = useState<Record<number, string>>({});
  const [filter, setFilter] = useState<FeedFilter>("all");
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [paused, setPaused] = useState(false);

  const pausedRef = useRef(false);
  const bufferRef = useRef<FeedEntry[]>([]);
  const roomsRef = useRef<AdminRoom[]>([]);
  const counterRef = useRef(0);
  const lastRefreshRef = useRef(0);

  useEffect(() => {
    roomsRef.current = rooms;
  }, [rooms]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Oynanan oda listesini REST'ten tazeler (spam'e karşı 5sn throttle).
    const refreshRooms = () => {
      const now = Date.now();
      if (now - lastRefreshRef.current < 5000) return;
      lastRefreshRef.current = now;
      adminApi
        .getLiveRooms()
        .then((liveRooms) => setRooms(liveRooms))
        .catch(() => {});
    };

    const pushEntry = (entry: FeedEntry) => {
      if (pausedRef.current) {
        bufferRef.current = [entry, ...bufferRef.current].slice(
          0,
          MAX_BUFFER_ENTRIES
        );
        return;
      }
      setEntries((prev) => [entry, ...prev].slice(0, MAX_FEED_ENTRIES));
    };

    const resolveSlug = (roomId: number, slug?: string | null): string | null =>
      slug ?? roomsRef.current.find((room) => room.id === roomId)?.slug ?? null;

    const handleFrame = (frame: AdminFrame) => {
      if (frame.type === "snapshot") {
        const payload = frame.payload as {
          stats: AdminStats;
          rooms: AdminRoom[];
        };
        setStats(payload.stats);
        setRooms(payload.rooms);
        return;
      }

      if (frame.type === "stats") {
        setStats(frame.payload as AdminStats);
        return;
      }

      if (frame.type === "roomEvent") {
        const payload = frame.payload as AdminRoomEventPayload;
        const expanded = expandRoomEvent(payload);
        if (expanded.length === 0) return;
        for (const item of expanded) {
          counterRef.current += 1;
          pushEntry({
            id: `${payload.at}-${counterRef.current}`,
            at: payload.at,
            roomId: payload.roomId,
            roomSlug: resolveSlug(payload.roomId),
            kind: item.kind,
            text: item.text,
          });
        }
        const lastText = expanded[expanded.length - 1].text;
        setLatestByRoom((prev) => ({ ...prev, [payload.roomId]: lastText }));
        const playerDelta = expanded.reduce(
          (sum, item) => sum + item.playerDelta,
          0
        );
        if (payload.event === "roomEnd" || payload.event === "roomCompleted") {
          // Liste sadece oynanan odaları gösterir; biten oda düşer.
          setRooms((prev) => prev.filter((room) => room.id !== payload.roomId));
          return;
        }
        if (
          (payload.event === "roundStart" ||
            payload.event === "intermissionStart") &&
          !roomsRef.current.some((room) => room.id === payload.roomId)
        ) {
          // Sayfa açıkken oynamaya başlayan oda listede yok; tazele.
          refreshRooms();
        }
        setRooms((prev) =>
          prev.map((room) => {
            if (room.id !== payload.roomId) return room;
            const next = { ...room };
            if (playerDelta !== 0) {
              next.playerCount = Math.max(0, room.playerCount + playerDelta);
            }
            if (payload.event === "roundStart") {
              next.status = "PLAYING";
            }
            if (payload.event === "intermissionStart") {
              next.status = "INTERMISSION";
            }
            return next;
          })
        );
        return;
      }

      if (frame.type === "chatMessage") {
        const payload = frame.payload as {
          roomId: number;
          roomSlug: string | null;
          username: string;
          message: string;
          at: number;
        };
        counterRef.current += 1;
        pushEntry({
          id: `chat-${payload.at}-${counterRef.current}`,
          at: payload.at,
          roomId: payload.roomId,
          roomSlug: resolveSlug(payload.roomId, payload.roomSlug),
          kind: "chat",
          text: `${payload.username}: ${payload.message}`,
        });
      }
    };

    adminSocketService.connect(token);
    const unsubscribe = adminSocketService.subscribe(handleFrame);
    const unsubscribeStatus = adminSocketService.subscribeStatus(setStatus);
    setStatus(adminSocketService.getStatus());

    // Snapshot kaçarsa diye REST ile seed (snapshot gelince zaten ezilir).
    refreshRooms();

    return () => {
      unsubscribe();
      unsubscribeStatus();
      adminSocketService.disconnect();
    };
  }, []);

  const handleTogglePause = () => {
    const next = !paused;
    setPaused(next);
    pausedRef.current = next;
    if (!next && bufferRef.current.length > 0) {
      const buffered = bufferRef.current;
      bufferRef.current = [];
      setEntries((prev) =>
        [...buffered, ...prev].slice(0, MAX_FEED_ENTRIES)
      );
    }
  };

  const visibleEntries = entries.filter(
    (entry) =>
      matchesFilter(entry, filter) &&
      (roomFilter === "all" || entry.roomId === Number(roomFilter))
  );

  const connection = statusDot[status];

  return (
    <div className="space-y-4">
      {/* Üst durum çubuğu */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="surface-card flex items-center gap-2 px-4 py-2">
          <span className={cn("w-2.5 h-2.5 rounded-full", connection.className)} />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {connection.label}
          </span>
        </div>
        <div className="surface-card px-4 py-2 text-sm">
          <span className="text-[var(--text-tertiary)]">Çevrimiçi: </span>
          <span className="font-semibold text-[var(--text-primary)]">
            {(stats?.onlineUsers ?? 0).toLocaleString("tr-TR")}
          </span>
        </div>
        <div className="surface-card px-4 py-2 text-sm">
          <span className="text-[var(--text-tertiary)]">Aktif Oda: </span>
          <span className="font-semibold text-[var(--text-primary)]">
            {(stats?.activeRooms ?? 0).toLocaleString("tr-TR")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Olay akışı */}
        <div className="lg:col-span-2 surface-card overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-color)] space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold text-[var(--text-primary)]">
                Olay Akışı
              </h2>
              <button onClick={handleTogglePause} className="btn-ghost !px-4 !py-1.5 text-sm">
                {paused ? <Play size={14} /> : <Pause size={14} />}
                {paused ? "Devam Et" : "Akışı Duraklat"}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {FILTER_CHIPS.map((chip) => (
                <button
                  key={chip.key}
                  onClick={() => setFilter(chip.key)}
                  className={cn(
                    "chip-tab !px-3 !py-1.5 text-xs",
                    filter === chip.key && "chip-tab-active"
                  )}
                >
                  {chip.label}
                </button>
              ))}
              <select
                value={roomFilter}
                onChange={(event) => setRoomFilter(event.target.value)}
                className="rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
              >
                <option value="all">Tüm Odalar</option>
                {rooms.map((room) => (
                  <option key={room.id} value={String(room.id)}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="max-h-[65vh] overflow-y-auto divide-y divide-[var(--border-color)]">
            {visibleEntries.length === 0 ? (
              <div className="p-8 text-center text-sm text-[var(--text-tertiary)]">
                Henüz olay yok. Bağlantı kurulduğunda olaylar burada akacak.
              </div>
            ) : (
              visibleEntries.map((entry) => {
                const badge = kindBadgeTone[entry.kind];
                return (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--hover-color)] transition-colors"
                  >
                    <span className="text-xs text-[var(--text-tertiary)] tabular-nums shrink-0 w-[4.5rem]">
                      {formatTime(entry.at)}
                    </span>
                    {entry.roomSlug ? (
                      <a
                        href={`/oda/${entry.roomSlug}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Odaya git (yeni sekme)"
                        className="shrink-0 max-w-[8rem] truncate rounded-full bg-[var(--bg-tertiary)] px-2 py-0.5 text-xs text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors"
                      >
                        {entry.roomSlug}
                      </a>
                    ) : (
                      <span className="shrink-0 max-w-[8rem] truncate rounded-full bg-[var(--bg-tertiary)] px-2 py-0.5 text-xs text-[var(--text-secondary)]">
                        #{entry.roomId}
                      </span>
                    )}
                    <AdminBadge tone={badge.tone} className="shrink-0">
                      {badge.label}
                    </AdminBadge>
                    <span className="text-[var(--text-primary)] truncate">
                      {entry.text}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Oda kartları */}
        <div className="space-y-3">
          <h2 className="font-semibold text-[var(--text-primary)] px-1">
            Oynanan Odalar ({rooms.length})
          </h2>
          {rooms.length === 0 ? (
            <div className="surface-card p-6 text-center text-sm text-[var(--text-tertiary)]">
              Şu an oynanan oda yok.
            </div>
          ) : (
            rooms.map((room) => {
              const badge = roomStatusBadge(room.status);
              return (
                <div key={room.id} className="surface-card p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-[var(--text-primary)] truncate">
                        {room.name}
                      </div>
                      <div className="text-xs text-[var(--text-tertiary)]">
                        {room.gameType}
                      </div>
                    </div>
                    <AdminBadge tone={badge.tone}>{badge.label}</AdminBadge>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                      <Users size={14} />
                      <span>{room.playerCount} oyuncu</span>
                    </div>
                    <a
                      href={`/oda/${room.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs font-medium text-[var(--accent-color)] hover:underline"
                    >
                      <ExternalLink size={12} />
                      {room.slug}
                    </a>
                  </div>
                  {latestByRoom[room.id] && (
                    <div className="text-xs text-[var(--text-tertiary)] truncate border-t border-[var(--border-color)] pt-2">
                      Son: {latestByRoom[room.id]}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
