import debounce from "lodash/debounce";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import { useGameStore } from "../store/gameStore";
import type { ChatMessage } from "../types";
import type {
  CarGuessBroadcastPayload,
  CarGuessContent,
  CarGuessKind,
  CarGuessResultPayload,
  ChatMessagePayload,
  ErrorPayload,
  GameStatePayload,
  GuessBroadcastPayload,
  GuessFeedPayload,
  GuessResultPayload,
  IntermissionStartPayload,
  MaxGuessesReachedPayload,
  PlayerJoinedPayload,
  PlayerLeftPayload,
  PresenceBatchPayload,
  RoundEndPayload,
  RoundStartPayload,
} from "../types/socket";
import { analyticsService } from "./analytics";
import { roomApi } from "./api";
import { soundService } from "./soundService";

const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 30000;

/** Round içeriği car-guess şeklinde mi? (seçenek listesi taşır) */
const isCarGuessContent = (content: unknown): content is CarGuessContent =>
  !!content &&
  typeof content === "object" &&
  Array.isArray((content as CarGuessContent).brands);

// VITE_SOCKET_URL is a ws(s) base (http(s) is accepted and converted).
// Defaults mirror VITE_API_URL handling: local backend in dev, same origin in prod.
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

class SocketService {
  private ws: WebSocket | null = null;

  private roomId: number | null = null;

  private optimisticMessageIds: Set<string> = new Set();

  private reconnectAttempts = 0;

  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private intentionalDisconnect = false;

  connect(): void {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.intentionalDisconnect = false;

    const token = localStorage.getItem("token");
    const url = `${getSocketBaseUrl()}/ws${token ? `?token=${encodeURIComponent(token)}` : ""}`;

    this.ws = new WebSocket(url);
    this.ws.onopen = () => this.handleOpen();
    this.ws.onmessage = (event) => this.handleMessage(event);
    this.ws.onclose = () => this.handleClose();
    this.ws.onerror = (event) => {
      console.error("WebSocket error", event);
    };
  }

  reconnect(): void {
    this.teardown();
    this.reconnectAttempts = 0;

    // Establish new connection
    this.connect();
  }

  private teardown(): void {
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
  }

  private handleOpen(): void {
    const hadReconnect = this.reconnectAttempts > 0;
    this.reconnectAttempts = 0;

    // Re-join the current room after a (re)connect — replaces the old
    // socket.io auto-reconnect + `reconnect` handler behavior.
    if (hadReconnect || this.roomId !== null) {
      const roomId = useGameStore.getState().roomId ?? this.roomId;
      if (roomId) {
        this.roomId = null; // force the join even if the id is unchanged
        this.joinRoom(roomId, true);
      }
    }
  }

  private handleClose(): void {
    this.ws = null;
    if (this.intentionalDisconnect) {
      return;
    }

    const delay = Math.min(
      RECONNECT_BASE_DELAY_MS * 2 ** this.reconnectAttempts,
      RECONNECT_MAX_DELAY_MS
    );
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private send(type: string, payload: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  private handleMessage(event: MessageEvent): void {
    let msg: { type?: string; payload?: unknown };
    try {
      msg = JSON.parse(event.data);
    } catch {
      console.error("Invalid WebSocket message", event.data);
      return;
    }
    if (!msg.type) return;

    const payload = msg.payload as never;
    switch (msg.type) {
      case "gameState":
        this.onGameState(payload);
        break;
      case "intermissionStart":
        this.onIntermissionStart(payload);
        break;
      case "roundStart":
        this.onRoundStart(payload);
        break;
      case "roundEnd":
        this.onRoundEnd(payload);
        break;
      case "roomFull":
        useGameStore.getState().setShowRoomFullModal(true);
        break;
      case "guessResult":
        this.onGuessResult(payload);
        break;
      case "carGuessResult":
        this.onCarGuessResult(payload);
        break;
      case "carGuess":
        this.onCarGuess(payload);
        break;
      case "maxGuessesReached":
        this.onMaxGuessesReached(payload);
        break;
      case "correctGuess":
        this.onCorrectGuess(payload);
        break;
      case "incorrectGuess":
        this.onIncorrectGuess(payload);
        break;
      case "chatMessage":
        this.onChatMessage(payload);
        break;
      case "playerJoined":
        this.onPlayerJoined(payload);
        break;
      case "playerLeft":
        this.onPlayerLeft(payload);
        break;
      case "presenceBatch":
        this.onPresenceBatch(payload);
        break;
      case "guessFeed":
        this.onGuessFeed(payload);
        break;
      case "roomEnd":
        this.onRoomEnd();
        break;
      case "roomCompleted":
        this.onRoomCompleted();
        break;
      case "reconnectRequired":
        this.onReconnectRequired();
        break;
      case "error":
        this.onError(payload);
        break;
      default:
        break;
    }
  }

  private onGameState(payload: GameStatePayload): void {
    const state = useGameStore.getState();
    state.setGameStatus(payload.phase);
    if (payload.settings?.maxGuessesPerRound != null) {
      state.setRoomMaxGuessesPerRound(payload.settings.maxGuessesPerRound);
    }
    if (payload.content) {
      if (isCarGuessContent(payload.content)) {
        state.setCarContent(payload.content);
      } else {
        state.setCurrentListing(payload.content);
      }
    }
    state.setOnlinePlayers(payload.onlinePlayers ?? []);
    // Büyük odada liste kırpılmış gelir; gerçek toplam ayrı alandan.
    state.setOnlinePlayersCount(
      payload.onlinePlayersCount ?? (payload.onlinePlayers ?? []).length
    );
    state.setRoundInfo(new Date(), payload.remainingDuration ?? 0);
    state.setMaxRounds(payload.maxRounds ?? 0);
    state.setRoundNumber(payload.roundNumber ?? 0);
    state.setRoomSummary(null);
    if (payload.content) {
      analyticsService.trackRoundStart(
        payload.content.id.toString(),
        isCarGuessContent(payload.content) ? "car-guess" : payload.content.details.type
      );
    }
  }

  private onIntermissionStart(payload: IntermissionStartPayload): void {
    const state = useGameStore.getState();

    state.setIntermissionDuration(payload.duration);
    state.setGameStatus("INTERMISSION");
    soundService.scheduleCountdown(payload.duration);
    state.setMaxRounds(payload.maxRounds ?? 0);
    state.setRoundNumber(payload.roundNumber);
  }

  private onRoundStart(payload: RoundStartPayload): void {
    const state = useGameStore.getState();

    state.setRoomSummary(null);
    state.setGuessCount(0);
    state.setGameStatus("PLAYING");
    state.setFeedback(null);
    state.setHasCorrectGuess(false);

    if (payload.content) {
      if (isCarGuessContent(payload.content)) {
        state.setCarContent(payload.content);
      } else {
        state.setCurrentListing(payload.content);
      }
    }
    state.setRoundInfo(new Date(), payload.duration);
    state.setShowResults(false);
    state.setRoundEndScores([]);
    state.setCorrectPrice(null);
    state.setLastGuesses([]);
    state.setCorrectGuesses([]);
    state.setIncorrectGuesses([]);

    state.setMaxRounds(payload.maxRounds ?? 0);
    state.setRoundNumber(payload.roundNumber);

    if (payload.content) {
      analyticsService.trackRoundStart(
        payload.content.id.toString(),
        isCarGuessContent(payload.content) ? "car-guess" : payload.content.details.type
      );
    }

    soundService.playRoundStart();
  }

  private onRoundEnd(payload: RoundEndPayload): void {
    const state = useGameStore.getState();
    const { scores } = payload;

    const onlinePlayers = state.onlinePlayers;
    const updatedOnlinePlayers = onlinePlayers.map((player) => {
      const score = scores.find((s) => s.player_id === player.userId);
      return {
        ...player,
        roomScore: score?.room_score_total ?? player.roomScore,
      };
    });
    state.setOnlinePlayers(updatedOnlinePlayers);
    state.setCorrectPrice(scores[0]?.detail?.correctPrice ?? null);
    state.setRoundEndScores(scores);

    // car-guess: doğru cevaplar her skorun detail'inde aynı şekilde taşınır.
    const carAnswers = scores[0]?.detail?.correctAnswers;
    if (carAnswers) {
      state.setCarCorrectAnswers(carAnswers);
    }

    state.setShowResults(true);
  }

  private onCarGuessResult(payload: CarGuessResultPayload): void {
    useGameStore.getState().setCarResult(payload.kind, payload.correct);
    if (payload.correct) {
      soundService.playSuccess();
    } else {
      soundService.playFailure();
    }
  }

  /** car-guess tahmin yayını — son tahminler akışına düşer. */
  private onCarGuess(payload: CarGuessBroadcastPayload): void {
    const authUser = useAuthStore.getState().user;
    if (payload.correct && payload.userId !== authUser?.id) {
      soundService.playOtherPlayerSuccess();
    }
    useGameStore.getState().addCarGuess({
      userId: payload.userId,
      username: payload.username,
      isCorrect: payload.correct,
      kind: payload.kind,
    });
  }

  // Debounce the guess result handler
  private debouncedGuessResult = debounce(
    (direction: "correct" | "go_higher" | "go_lower") => {
      useGameStore.getState().setFeedback(direction);
      if (direction === "correct") {
        useGameStore.getState().setHasCorrectGuess(true);
        soundService.playSuccess();
      } else {
        soundService.playFailure();
      }
    },
    100,
    { leading: true, trailing: false }
  );

  private onGuessResult(payload: GuessResultPayload): void {
    const state = useGameStore.getState();
    this.debouncedGuessResult(payload.direction);

    state.setGuessCount(payload.guessCount);
    state.setRoomMaxGuessesPerRound(payload.userMaxGuessesPerRound);
  }

  private onMaxGuessesReached(payload: MaxGuessesReachedPayload): void {
    useGameStore
      .getState()
      .setRoomMaxGuessesPerRound(payload.userMaxGuessesPerRound);
  }

  private onCorrectGuess(payload: GuessBroadcastPayload): void {
    const authUser = useAuthStore.getState().user;
    if (payload.userId !== authUser?.id) {
      soundService.playOtherPlayerSuccess();
    }

    useGameStore.getState().addCorrectGuess({
      userId: payload.userId,
      username: payload.username,
      isCorrect: true,
    });
  }

  // Batch incorrect guesses
  private incorrectGuessBuffer: Array<{
    userId: number;
    username: string;
    isCorrect: false;
  }> = [];

  private flushIncorrectGuesses = debounce(() => {
    if (this.incorrectGuessBuffer.length > 0) {
      useGameStore.getState().setIncorrectGuesses(
        this.incorrectGuessBuffer.map((guess) => ({
          ...guess,
          isCorrect: false,
        }))
      );
      useGameStore
        .getState()
        .setLastGuesses(
          [
            ...this.incorrectGuessBuffer,
            ...useGameStore.getState().lastGuesses,
          ].slice(0, 5)
        );
      this.incorrectGuessBuffer = [];
    }
  }, 100);

  private onIncorrectGuess(payload: GuessBroadcastPayload): void {
    this.incorrectGuessBuffer.push({
      userId: payload.userId,
      username: payload.username,
      isCorrect: false,
    });
    this.flushIncorrectGuesses();
  }

  // Message buffer and debounced flush function
  private chatMessageBuffer: Array<ChatMessage> = [];

  private flushChatMessages = debounce(() => {
    if (this.chatMessageBuffer.length > 0) {
      const state = useGameStore.getState();
      useGameStore
        .getState()
        .setChatMessages(
          [...state.chatMessages, ...this.chatMessageBuffer].slice(-100)
        );
      this.chatMessageBuffer = [];
    }
  }, 100);

  private onChatMessage(payload: ChatMessagePayload): void {
    const state = useGameStore.getState();
    const { userId, username, message, sentAt } = payload;

    const optimisticMessageId = Array.from(this.optimisticMessageIds).find(
      (id) => {
        const msg = state.chatMessages.find((m) => m.id === id);
        return (
          msg && msg.userId === userId.toString() && msg.message === message
        );
      }
    );

    if (optimisticMessageId) {
      // Remove the optimistic message ID from tracking
      this.optimisticMessageIds.delete(optimisticMessageId);

      // Filter out the optimistic message
      const filteredMessages = state.chatMessages.filter(
        (msg) => msg.id !== optimisticMessageId
      );

      // Add the server message
      const serverMessage = {
        id: new Date().getTime().toString(),
        userId: userId.toString(),
        username,
        message,
        timestamp: new Date(sentAt),
      };

      useGameStore
        .getState()
        .setChatMessages([...filteredMessages, serverMessage].slice(-100));
    } else {
      this.chatMessageBuffer.push({
        id: new Date().getTime().toString(),
        userId: userId.toString(),
        username,
        message,
        timestamp: new Date(sentAt),
      });
      this.flushChatMessages();
    }

    if (this.roomId) {
      analyticsService.trackChatMessage(this.roomId.toString());
    }
  }

  private onPlayerJoined(payload: PlayerJoinedPayload): void {
    const { user } = payload;
    const onlinePlayers = useGameStore.getState().onlinePlayers;
    // The joining client can receive its own broadcast (race) — be idempotent.
    const isExists = onlinePlayers.some(
      (player) => player.userId === user.userId
    );
    if (isExists) {
      return;
    }
    const next = [
      ...onlinePlayers,
      { userId: user.userId, username: user.username, roomScore: user.roomScore ?? 0 },
    ];
    const state = useGameStore.getState();
    state.setOnlinePlayers(next);
    // Küçük odada liste kırpılmaz; sayı liste uzunluğuyla aynı.
    state.setOnlinePlayersCount(next.length);
  }

  private onPlayerLeft(payload: PlayerLeftPayload): void {
    const onlinePlayers = useGameStore.getState().onlinePlayers;
    const next = onlinePlayers.filter(
      (player) => player.userId !== payload.userId
    );
    const state = useGameStore.getState();
    state.setOnlinePlayers(next);
    state.setOnlinePlayersCount(next.length);
  }

  /** Büyük odalarda join/leave'ler batch halinde gelir (presenceBatch). */
  private onPresenceBatch(payload: PresenceBatchPayload): void {
    const state = useGameStore.getState();
    const leftSet = new Set(payload.left);
    const existing = new Set(state.onlinePlayers.map((p) => p.userId));
    const kept = state.onlinePlayers.filter((p) => !leftSet.has(p.userId));
    const added = payload.joined
      .filter((u) => !existing.has(u.userId) && !leftSet.has(u.userId))
      .map((u) => ({ userId: u.userId, username: u.username, roomScore: u.roomScore ?? 0 }));
    state.setOnlinePlayers([...kept, ...added]);
    state.setOnlinePlayersCount(payload.onlinePlayers);
  }

  /** Büyük odalarda tahmin yayınları batch halinde gelir (guessFeed). */
  private onGuessFeed(payload: GuessFeedPayload): void {
    for (const guess of payload.guesses) {
      if (guess.type === "correctGuess") {
        this.onCorrectGuess(guess);
      } else {
        this.onIncorrectGuess(guess);
      }
    }
  }

  private onRoomEnd(): void {
    const state = useGameStore.getState();

    state.setRoomId(null);
    state.setRoom(null);
    state.setCurrentListing(null);
    state.setCurrentQuestion(null);
    state.setCarContent(null);
    this.roomId = null;
  }

  private onReconnectRequired(): void {
    try {
      const state = useGameStore.getState();
      const roomId = state.roomId;
      if (roomId) {
        this.joinRoom(roomId, true);
      }
    } catch (error) {
      console.error("Error reconnecting to socket", error);
    }
  }

  private async onRoomCompleted(): Promise<void> {
    const state = useGameStore.getState();
    if (state.room && state.roomId) {
      const summary = await roomApi.getRoomSummary(state.room.slug);
      state.setRoomSummary(summary);
    }
  }

  private onError(payload: ErrorPayload): void {
    if (payload?.message) {
      toast.error(payload.message);
    }
  }

  joinRoom(roomId: number, isReconnect: boolean = false): void {
    if (this.roomId !== roomId || isReconnect) {
      this.roomId = roomId;
      useGameStore.getState().setRoomId(roomId);
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        // Socket not ready yet — handleOpen() re-joins `this.roomId`.
        this.connect();
        return;
      }
      this.send("joinRoom", { roomId });
    } else {
      console.log("Room already joined", roomId);
    }
  }

  sendMessage(message: string) {
    const authState = useAuthStore.getState();
    const user = authState.user;

    if (user) {
      // Add optimistic message
      const optimisticId = `${new Date().getTime()}-${Math.random()}`;
      const optimisticMessage = {
        id: optimisticId,
        userId: user.id.toString(),
        username: user.username,
        message,
        timestamp: new Date(),
      };

      // Track the optimistic message ID
      this.optimisticMessageIds.add(optimisticId);

      useGameStore
        .getState()
        .setChatMessages(
          [...useGameStore.getState().chatMessages, optimisticMessage].slice(
            -100
          )
        );
    }

    this.send("chatMessage", { message });
  }

  leaveRoom(): void {
    this.send("leaveRoom", {});
    this.roomId = null;
    const state = useGameStore.getState();
    state.setRoomId(null);
    state.setShowRoomFullModal(false);

    state.setCurrentListing(null);
    state.setCurrentQuestion(null);
    state.setCarContent(null);
    soundService.clearCountdownTimeout();
  }

  submitGuess(price: number): void {
    this.send("answer", { data: { price } });
  }

  /** car-guess: tek parça tahmini (brand/model/year) — basıldığı an gönderilir. */
  submitCarGuess(kind: CarGuessKind, value: string | number): void {
    this.send("answer", { data: { kind, value } });
  }

  disconnect(): void {
    soundService.clearCountdownTimeout();
    this.teardown();
    this.reconnectAttempts = 0;
    useGameStore.getState().setShowRoomFullModal(false);
  }
}

export const socketService = new SocketService();
