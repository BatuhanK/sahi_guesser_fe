import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { Room, RoomSummary } from "../services/api";
import { ChatMessage, GuessResult } from "../types";
import type {
  CarGuessContent,
  CarGuessCorrectAnswers,
  CarGuessKind,
  GameStatus,
  Listing,
  OnlinePlayer,
  Player,
  Question,
  RoundEndScore,
} from "../types/socket";

type FeedbackType = "correct" | "go_higher" | "go_lower" | "not_correct" | null;

interface GameState {
  status: GameStatus;
  currentListing: Listing | null;
  currentQuestion: Question | null;
  roundStartTime: Date | null;
  roundDuration: number;
  players: Player[];
  roomId: number | null;
  room: Room | null;
  feedback: FeedbackType;
  hasCorrectGuess: boolean;
  chatMessages: ChatMessage[];
  onlinePlayers: OnlinePlayer[];
  /** Büyük odada `onlinePlayers` kırpılmış olabilir; gerçek toplam burada. */
  onlinePlayersCount: number;
  correctGuesses: GuessResult[];
  incorrectGuesses: GuessResult[];
  correctPrice: number | null;
  roundEndScores: RoundEndScore[];
  guessCount: number;
  lastGuesses: GuessResult[];
  showResults: boolean;
  intermissionDuration: number;
  roomSummary: RoomSummary | null;
  maxRounds: number;
  roundNumber: number;
  showRoomFullModal: boolean;
  /** car-guess round içeriği (10 marka / 10 model / 5 yıl seçenekleri). */
  carContent: CarGuessContent | null;
  /** car-guess: bu round'daki kendi tahminlerim (parça başına tek hak). */
  carGuesses: { brand?: string; model?: string; year?: number };
  /** car-guess: tahmin sonuçlarım (carGuessResult event'i). */
  carResults: { brand?: boolean; model?: boolean; year?: boolean };
  /** car-guess: round sonunda açıklanan doğru cevaplar. */
  carCorrectAnswers: CarGuessCorrectAnswers | null;
  setGameStatus: (status: GameStatus) => void;
  setCurrentListing: (listing: Listing | null) => void;
  setCurrentQuestion: (question: Question | null) => void;
  setRoundInfo: (startTime: Date, duration: number) => void;
  setPlayers: (players: Player[]) => void;
  setRoomId: (roomId: number | null) => void;
  setRoom: (room: Room | null) => void;
  setFeedback: (feedback: FeedbackType) => void;
  setHasCorrectGuess: (hasCorrectGuess: boolean) => void;
  setChatMessages: (chatMessages: ChatMessage[]) => void;
  setOnlinePlayers: (onlinePlayers: OnlinePlayer[]) => void;
  setOnlinePlayersCount: (count: number) => void;
  addCorrectGuess: (guess: GuessResult) => void;
  addIncorrectGuess: (guess: GuessResult) => void;
  /** car-guess tahmin yayını: son tahminlere düşer, doğruysa oyuncuyu
   * "doğru bilenler" grubuna da taşır. */
  addCarGuess: (guess: GuessResult) => void;
  setCorrectPrice: (correctPrice: number | null) => void;
  setRoundEndScores: (roundEndScores: RoundEndScore[]) => void;
  setShowResults: (showResults: boolean) => void;
  setLastGuesses: (lastGuesses: GuessResult[]) => void;
  setCorrectGuesses: (correctGuesses: GuessResult[]) => void;
  setIncorrectGuesses: (incorrectGuesses: GuessResult[]) => void;
  setGuessCount: (guessCount: number) => void;
  setIntermissionDuration: (intermissionDuration: number) => void;
  setRoomSummary: (roomSummary: RoomSummary | null) => void;
  setMaxRounds: (maxRounds: number) => void;
  setRoundNumber: (roundNumber: number) => void;
  setShowRoomFullModal: (show: boolean) => void;
  setRoomMaxGuessesPerRound: (maxGuessesPerRound: number) => void;
  setCarContent: (content: CarGuessContent | null) => void;
  setCarGuess: (kind: CarGuessKind, value: string | number) => void;
  setCarResult: (kind: CarGuessKind, correct: boolean) => void;
  setCarCorrectAnswers: (answers: CarGuessCorrectAnswers | null) => void;
}

export const useGameStore = create<GameState>()(
  devtools((set) => ({
    status: "WAITING",
    currentListing: null,
    currentQuestion: null,
    roundStartTime: null,
    roundDuration: 0,
    players: [],
    roomId: null,
    room: null,
    feedback: null,
    guessCount: 0,
    hasCorrectGuess: false,
    correctGuesses: [],
    incorrectGuesses: [],
    lastGuesses: [],
    chatMessages: [],
    onlinePlayers: [],
    onlinePlayersCount: 0,
    correctPrice: null,
    roundEndScores: [],
    showResults: false,
    intermissionDuration: 0,
    roomSummary: null,
    maxRounds: 0,
    roundNumber: 0,
    showRoomFullModal: false,
    carContent: null,
    carGuesses: {},
    carResults: {},
    carCorrectAnswers: null,
    setGameStatus: (status) =>
      set({
        status,
        hasCorrectGuess: false,
        feedback: null,
        correctGuesses: [],
        incorrectGuesses: [],
      }),
    setCurrentListing: (listing) => {
      set({
        currentListing: listing,
        correctGuesses: [],
        incorrectGuesses: [],
        showResults: false,
        roundEndScores: [],
        correctPrice: null,
      });
    },
    setCurrentQuestion: (question) =>
      set({
        currentQuestion: question,
        correctGuesses: [],
        incorrectGuesses: [],
        showResults: false,
        roundEndScores: [],
        correctPrice: null,
      }),
    setRoundInfo: (startTime, duration) =>
      set({ roundStartTime: startTime, roundDuration: duration }),
    setPlayers: (players) => set({ players }),
    setRoomId: (roomId) => set({ roomId, chatMessages: [] }),
    setGuessCount: (guessCount) => set({ guessCount }),
    setRoom: (room) => set({ room }),
    setFeedback: (feedback) => set({ feedback }),
    setHasCorrectGuess: (hasCorrectGuess) => set({ hasCorrectGuess }),
    setChatMessages: (chatMessages) => set({ chatMessages }),
    setOnlinePlayers: (onlinePlayers) => set({ onlinePlayers }),
    setOnlinePlayersCount: (count) => set({ onlinePlayersCount: count }),
    addCorrectGuess: (guess) =>
      set((state) => ({
        correctGuesses: [...state.correctGuesses, guess],
        lastGuesses: [guess, ...state.lastGuesses].slice(0, 5),
      })),
    addIncorrectGuess: (guess) =>
      set((state) => ({
        incorrectGuesses: [...state.incorrectGuesses, guess],
        lastGuesses: [guess, ...state.lastGuesses].slice(0, 5),
      })),
    addCarGuess: (guess) =>
      set((state) => ({
        lastGuesses: [guess, ...state.lastGuesses].slice(0, 5),
        correctGuesses: guess.isCorrect
          ? [...state.correctGuesses, guess]
          : state.correctGuesses,
      })),

    setCorrectGuesses: (correctGuesses) => set({ correctGuesses }),
    setIncorrectGuesses: (incorrectGuesses) => set({ incorrectGuesses }),
    setLastGuesses: (lastGuesses) => set({ lastGuesses }),
    setCorrectPrice: (correctPrice) => set({ correctPrice }),
    setRoundEndScores: (roundEndScores) => set({ roundEndScores }),
    setShowResults: (showResults) => set({ showResults }),
    setIntermissionDuration: (intermissionDuration) =>
      set({ intermissionDuration }),
    setRoomSummary: (roomSummary) => set({ roomSummary }),
    setMaxRounds: (maxRounds) => set({ maxRounds }),
    setRoundNumber: (roundNumber) => set({ roundNumber }),
    setShowRoomFullModal: (show) => set({ showRoomFullModal: show }),
    setCarContent: (carContent) =>
      set({
        carContent,
        carGuesses: {},
        carResults: {},
        carCorrectAnswers: null,
        correctGuesses: [],
        incorrectGuesses: [],
        showResults: false,
        roundEndScores: [],
      }),
    setCarGuess: (kind, value) =>
      set((state) => ({ carGuesses: { ...state.carGuesses, [kind]: value } })),
    setCarResult: (kind, correct) =>
      set((state) => ({ carResults: { ...state.carResults, [kind]: correct } })),
    setCarCorrectAnswers: (carCorrectAnswers) => set({ carCorrectAnswers }),
    setRoomMaxGuessesPerRound: (maxGuessesPerRound) => {
      const room = useGameStore.getState().room;
      if (room?.settings) {
        const updatedRoom = {
          ...room,
          settings: {
            ...room.settings,
            maxGuessesPerRound
          }
        };
        set({ room: updatedRoom });
      }
    }
  }))
);