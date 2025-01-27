export type GameStatus = "WAITING" | "PLAYING" | "INTERMISSION" | "FINISHED";

export type HotelsListingDetails = {
  type: "hotels";
  title: string;
  description: string;
  city: string;
  country: string;
  nightlyPrice: number;
  imageUrls: string[];
  keyValues: Record<string, string>;
};

export type CarListingDetails = {
  type: "car";
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  imageUrls: string[];
};

export type HouseForRentListingDetails = {
  type: "house-for-rent";
  rooms: number;
  squareMeters: number;
  buildingAge: number;
  floor: number;
  city: string;
  district: string;
  imageUrls: string[];
};

export type HouseForSaleListingDetails = {
  type: "house-for-sale";
  rooms: number;
  squareMeters: number;
  buildingAge: number;
  floor: number;
  city: string;
  district: string;
  imageUrls: string[];
};

export type LetgoListingDetails = {
  type: "letgo";
  title: string;
  description: string;
  imageUrls: string[];
  city: string;
  brand: string;
  keyValues: Record<string, string>;
};

export type SportsPlayerListingDetails = {
  type: "sports-player-listing";
  subtype: "football";
  team: string;
  imageUrls: string[];
  keyValues: Record<string, string>;
};

export interface Listing {
  id: number;
  title: string;
  details:
    | CarListingDetails
    | HouseForRentListingDetails
    | HouseForSaleListingDetails
    | LetgoListingDetails
    | HotelsListingDetails
    | SportsPlayerListingDetails;
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
export interface OnlinePlayer {
  playerId: number;
  userId: number;
  username: string;
  roomScore: number;
  totalScore: number;
  isPremium: boolean;
  premiumLevel: number;
  role: string;
}

export interface RoundEndScore {
  playerId: number;
  userId: number;
  username: string;
  guess: number;
  guessAt?: string | null;
  elapsedTime?: number | null;
  roundScore?: number | undefined;
  roomScore: number;
  userScore: number;
}

export interface ServerToClientEvents {
  gameState: (data: {
    status: GameStatus;
    listing: Listing | null;
    question: Question | null;
    roundStartTime: Date;
    roundDuration: number;
    userMaxGuessesPerRound: number;
  }) => void;
  roomFull: () => void;
  roomEnd: () => void;
  roomEnded: () => void;
  serverShutdown: () => void;
  onlinePlayers: (data: { players: OnlinePlayer[] }) => void;
  roundStart: (data: {
    listing: Listing | null;
    question: Question | null;
    duration: number;
    maxRounds: number;
    roundNumber: number;
  }) => void;
  guessResult: (data: {
    roomId: number;
    direction: "correct" | "go_higher" | "go_lower";
    guessCount: number;
    userMaxGuessesPerRound: number;
    remainingGuesses: number;
  }) => void;
  chatMessage: (data: {
    userId: string;
    username: string;
    message: string;
    isPremium: boolean;
    premiumLevel: number;
    role: string;
  }) => void;
  intermissionStart: (data: {
    duration: number;
    maxRounds: number;
    roundNumber: number;
  }) => void;
  roundEnd: (data: { correctPrice: number; scores: RoundEndScore[] }) => void;
  roomCompleted: (data: { roomId: number }) => void;
  correctGuess: (data: {
    userId: number;
    playerId: number;
    username: string;
    guessCount: number;
  }) => void;
  incorrectGuess: (data: {
    userId: number;
    playerId: number;
    username: string;
    guessCount: number;
  }) => void;

  playerJoined: (data: {
    userId: number;
    playerId: number;
    username: string;
    roomScore: number;
    isPremium: boolean;
    premiumLevel: number;
    role: string
  }) => void;

  playerLeft: (data: {
    userId: number;
    playerId: number;
    username: string;
  }) => void;

  livekitRoomUpdate: (data: {
    roomId: number;
    participants: string[];
    onlineCount: number;
  }) => void;

  userBanned: (data: { userId: number; roomId: number }) => void;

  reconnectRequired: () => void;
}

export interface ClientToServerEvents {
  joinRoom: (data: { roomId: number }) => void;
  leaveRoom: (data: { roomId: number }) => void;
  submitGuess: (data: { roomId: number; price: number }) => void;
  chatMessage: (data: { roomId: number; message: string; }) => void;
}
