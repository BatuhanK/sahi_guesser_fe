export type GameStatus = "WAITING" | "PLAYING" | "INTERMISSION" | "ENDED";

// Define a base interface for currency details
interface CurrencyDetails {
  currency?: string;
  hideCurrency?: boolean;
}

// Extend existing types with CurrencyDetails
export type HotelsListingDetails = {
  type: "hotels";
  title: string;
  description: string;
  city: string;
  country: string;
  nightlyPrice: number;
  imageUrls: string[];
  keyValues: Record<string, string>;
} & CurrencyDetails; // Extend with CurrencyDetails

export type CarListingDetails = {
  type: "car";
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  imageUrls: string[];
} & CurrencyDetails; // Extend with CurrencyDetails

export type HouseForRentListingDetails = {
  type: "house-for-rent";
  rooms: number;
  squareMeters: number;
  buildingAge: number;
  floor: number;
  city: string;
  district: string;
  imageUrls: string[];
} & CurrencyDetails; // Extend with CurrencyDetails

export type HouseForSaleListingDetails = {
  type: "house-for-sale";
  rooms: number;
  squareMeters: number;
  buildingAge: number;
  floor: number;
  city: string;
  district: string;
  imageUrls: string[];
} & CurrencyDetails; // Extend with CurrencyDetails

export type LetgoListingDetails = {
  type: "letgo";
  title: string;
  description: string;
  imageUrls: string[];
  city: string;
  brand: string;
  keyValues: Record<string, string>;
} & CurrencyDetails; // Extend with CurrencyDetails

export type SportsPlayerListingDetails = {
  type: "sports-player-listing";
  subtype: "football";
  team: string;
  imageUrls: string[];
  keyValues: Record<string, string>;
} & CurrencyDetails; // Extend with CurrencyDetails

export interface Listing {
  id: number;
  title: string;
  details:
    | CarListingDetails
    | HouseForRentListingDetails
    | HouseForSaleListingDetails
    | LetgoListingDetails
    | HotelsListingDetails
    | SportsPlayerListingDetails
}

// --- car-guess (marka/model/yıl tahmini) ---

export type CarGuessKind = "brand" | "model" | "year";

/** car-guess roundStart/gameState içeriği — doğru cevaplar hiç taşınmaz. */
export interface CarGuessContent {
  id: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  imageUrls: string[];
  /** 10 marka seçeneği. */
  brands: string[];
  /** 10 model seçeneği — models[i], brands[i]'nin "model (+ seri)" etiketi. */
  models: string[];
  /** 5 yıl seçeneği (yeniden eskiye). */
  years: number[];
}

/** carGuessResult — sadece tahminciye gelir. */
export interface CarGuessResultPayload {
  kind: CarGuessKind;
  correct: boolean;
}

/** carGuess — odaya yayınlanan tahmin duyurusu (son tahminler akışı). */
export interface CarGuessBroadcastPayload {
  userId: number;
  username: string;
  kind: CarGuessKind;
  correct: boolean;
}

export interface CarGuessCorrectAnswers {
  brand: string;
  model: string;
  year: number;
}

export interface CarGuessPartDetail {
  guess: string | number | null;
  correct: boolean;
  score: number;
}

export interface Player {
  id: string;
  username: string;
  avatar: string;
  score: number;
}

export interface Question {
  question: string;
  options: {
    option: string;
    isCorrect: boolean;
  }[];
  imagePrompt: string;
}

export interface RoomSettings {
  minPrice?: number | null;
  maxPrice?: number | null;
  roundDurationSeconds?: number;
  maxGuessesPerRound?: number;
  isDuel?: boolean;
  currency?: string;
  hideCurrency?: boolean;
}

export interface OnlinePlayer {
  userId: number;
  username: string;
  roomScore: number;
}

export interface RoundEndScoreDetail {
  guess: number | null;
  guessAt?: string | null;
  elapsedTimeMs?: number | null;
  direction?: "correct" | "go_higher" | "go_lower" | null;
  /** price-guess odalarında dolu. */
  correctPrice?: number;
  /** car-guess odalarında dolu (parça başına sonuç + doğru cevaplar). */
  brand?: CarGuessPartDetail;
  model?: CarGuessPartDetail;
  year?: CarGuessPartDetail;
  correctAnswers?: CarGuessCorrectAnswers;
}

export interface RoundEndScore {
  player_id: number;
  username: string;
  score: number;
  room_score_total: number;
  detail: RoundEndScoreDetail;
}

export interface GameStatePayload {
  phase: GameStatus;
  roundNumber: number;
  maxRounds: number | null;
  remainingDuration: number; // milliseconds
  onlinePlayers: OnlinePlayer[];
  /** Büyük odalarda `onlinePlayers` kırpılır (ilk ~100); gerçek toplam burada. */
  onlinePlayersCount?: number;
  settings: RoomSettings;
  content?: Listing | CarGuessContent | null;
}

export interface RoundStartPayload {
  content: Listing | CarGuessContent | null;
  duration: number; // milliseconds
  roundNumber: number;
  maxRounds: number | null;
}

export interface IntermissionStartPayload {
  duration: number; // milliseconds
  roundNumber: number;
  maxRounds: number | null;
}

export interface RoundEndPayload {
  scores: RoundEndScore[];
  roundNumber: number;
}

export interface GuessResultPayload {
  direction: "correct" | "go_higher" | "go_lower";
  guessCount: number;
  remainingGuesses: number;
  userMaxGuessesPerRound: number;
}

export interface MaxGuessesReachedPayload {
  userMaxGuessesPerRound: number;
}

export interface GuessBroadcastPayload {
  userId: number;
  username: string;
  guessCount: number;
}

export interface PlayerJoinedPayload {
  user: {
    userId: number;
    username: string;
    roomScore?: number;
  };
}

export interface PlayerLeftPayload {
  userId: number;
}

/** Büyük odalarda join/leave'ler tek tek yerine bu event'te toplanır. */
export interface PresenceBatchPayload {
  joined: Array<{ userId: number; username: string; roomScore?: number }>;
  left: number[];
  onlinePlayers: number;
}

/** Büyük odalarda correctGuess/incorrectGuess yayınları bu event'te toplanır. */
export interface GuessFeedItem extends GuessBroadcastPayload {
  type: "correctGuess" | "incorrectGuess";
}

export interface GuessFeedPayload {
  guesses: GuessFeedItem[];
}

export interface ChatMessagePayload {
  userId: number;
  username: string;
  message: string;
  sentAt: string;
}

export interface RoomFullPayload {
  roomId: number;
}

export interface RoomCompletedPayload {
  roundNumber: number;
  maxRounds: number;
}

export interface ReconnectRequiredPayload {
  roundNumber: number;
  remainingDuration: number; // milliseconds
}

export interface ErrorPayload {
  message: string;
}

// Inbound messages are wrapped in a `{type, payload}` envelope and
// dispatched on `type`.
export interface ServerMessage {
  type: string;
  payload: unknown;
}
