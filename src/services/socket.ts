import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../store/authStore";
import { useGameStore } from "../store/gameStore";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../types/socket";
import { soundService } from "./soundService";

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
    null;

  connect(): void {
    const token = localStorage.getItem("token");
    let extraHeaders: Record<string, string> = {};
    if (token) {
      extraHeaders = {
        Authorization: `Bearer ${token}`,
      };
    }
    this.socket = io(import.meta.env.VITE_SOCKET_URL, {
      path: "/ws/socket.io/",
      autoConnect: false,
      extraHeaders,
      transportOptions: {
        websocket: {
          extraHeaders,
        },
      },
      transports: ["websocket"],
    });

    // if (!token) {
    //   console.log("No token, not connecting to socket");
    // } else {
    //   this.socket.connect();
    //   this.setupListeners();
    // }

    this.socket.connect();
    this.setupListeners();
  }

  reconnect(): void {
    if (this.socket) {
      // Clean up existing listeners and disconnect
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    // Establish new connection
    this.connect();
  }

  private setupListeners(): void {
    if (!this.socket) return;

    this.socket.on(
      "gameState",
      ({ status, listing, roundStartTime, roundDuration }) => {
        useGameStore.getState().setGameStatus(status);
        useGameStore.getState().setCurrentListing(listing);
        useGameStore
          .getState()
          .setRoundInfo(new Date(roundStartTime), roundDuration);
      }
    );

    this.socket.on("intermissionStart", ({ duration }) => {
      console.log("intermissionDuration", duration);
      useGameStore.getState().setIntermissionDuration(duration);
      soundService.scheduleCountdown(duration);
    });

    this.socket.on("onlinePlayers", ({ players }) => {
      useGameStore.getState().setOnlinePlayers(players);
    });

    this.socket.on("roundStart", ({ listing, duration }) => {
      const state = useGameStore.getState();

      state.setGameStatus("playing");
      state.setFeedback(null);
      state.setHasCorrectGuess(false);
      state.setCurrentListing(listing);
      state.setRoundInfo(new Date(), duration);
      state.setShowResults(false);
      state.setRoundEndScores([]);
      state.setCorrectPrice(null);
      state.setLastGuesses([]);
      state.setCorrectGuesses([]);
      state.setIncorrectGuesses([]);

      soundService.playRoundStart();
    });

    this.socket.on("roundEnd", ({ correctPrice, scores }) => {
      const state = useGameStore.getState();
      const authState = useAuthStore.getState();

      let currentUserScore = 0;
      const onlinePlayers = state.onlinePlayers;
      const updatedOnlinePlayers = onlinePlayers.map((player) => {
        const score = scores.find((s) => s.playerId === player.playerId);
        if (player.userId === authState.user?.id) {
          currentUserScore = score?.userScore || 0;
        }
        return {
          ...player,
          totalScore: score?.userScore || 0,
          roomScore: score?.roomScore || 0,
        };
      });
      state.setOnlinePlayers(updatedOnlinePlayers);
      state.setCorrectPrice(correctPrice);
      state.setRoundEndScores(scores);

      state.setShowResults(true);

      if (authState.user) {
        authState.setUser({
          ...authState.user,
          score: currentUserScore,
        });
      }
    });

    this.socket.on("guessResult", ({ direction }) => {
      useGameStore.getState().setFeedback(direction);
      if (direction === "correct") {
        useGameStore.getState().setHasCorrectGuess(true);
        soundService.playSuccess();
      } else {
        soundService.playFailure();
      }
    });

    this.socket.on("correctGuess", ({ userId, playerId, username }) => {
      const authUser = useAuthStore.getState().user;
      if (userId !== authUser?.id) {
        soundService.playOtherPlayerSuccess();
      }

      useGameStore.getState().addCorrectGuess({
        userId,
        playerId,
        username,
        isCorrect: true,
      });
    });

    this.socket.on("incorrectGuess", ({ userId, playerId, username }) => {
      useGameStore.getState().addIncorrectGuess({
        userId,
        playerId,
        username,
        isCorrect: false,
      });
    });

    this.socket.on("chatMessage", ({ userId, username, message }) => {
      const state = useGameStore.getState();
      useGameStore.getState().setChatMessages(
        [
          ...state.chatMessages,
          {
            id: new Date().getTime().toString(),
            userId,
            username,
            message,
            timestamp: new Date(),
          },
        ].slice(-100)
      );
    });

    this.socket.on(
      "playerJoined",
      ({ userId, playerId, username, roomScore }) => {
        const onlinePlayers = useGameStore.getState().onlinePlayers;
        // check online players and add the new player if not exists.
        const isExists = onlinePlayers.some(
          (player) => player.playerId === playerId
        );
        if (isExists) {
          return;
        }
        useGameStore
          .getState()
          .setOnlinePlayers([
            ...onlinePlayers,
            { userId, playerId, username, roomScore, totalScore: 0 },
          ]);
      }
    );

    this.socket.on("playerLeft", ({ playerId }) => {
      const onlinePlayers = useGameStore.getState().onlinePlayers;
      useGameStore
        .getState()
        .setOnlinePlayers(
          onlinePlayers.filter((player) => player.playerId !== playerId)
        );
    });
    this.socket.on("roomEnd", () => {
      const state = useGameStore.getState();

      state.setRoomId(null);
      state.setCurrentListing(null);
    });
  }

  joinRoom(roomId: number): void {
    this.socket?.emit("joinRoom", { roomId });
    useGameStore.getState().setRoomId(roomId);
  }

  sendMessage(roomId: number, message: string) {
    console.log(message, "--message send message");
    console.log(roomId, "--roomId send message");
    this.socket?.emit("chatMessage", { roomId, message });
  }

  leaveRoom(roomId: number): void {
    this.socket?.emit("leaveRoom", { roomId });
    useGameStore.getState().setRoomId(null);
    useGameStore.getState().setCurrentListing(null);
    soundService.clearCountdownTimeout();
  }

  submitGuess(roomId: number, price: number): void {
    useGameStore.getState().setFeedback(null);
    this.socket?.emit("submitGuess", { roomId, price });
  }

  disconnect(): void {
    soundService.clearCountdownTimeout();
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const socketService = new SocketService();
