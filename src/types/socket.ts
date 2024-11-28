export type GameStatus = "waiting" | "playing" | "intermission" | "finished";

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

export interface Listing {
  id: number;
  title: string;
  details: CarListingDetails | HouseForRentListingDetails;
}

export interface Player {
  id: string;
  username: string;
  avatar: string;
  score: number;
}

export interface OnlinePlayer {
  playerId: number;
  userId: number;
  username: string;
  roomScore: number;
  totalScore: number;
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
    roundStartTime: Date;
    roundDuration: number;
  }) => void;
  roomEnd: () => void;
  onlinePlayers: (data: { players: OnlinePlayer[] }) => void;
  roundStart: (data: { listing: Listing; duration: number }) => void;
  guessResult: (data: {
    roomId: number;
    direction: "correct" | "go_higher" | "go_lower";
  }) => void;
  chatMessage: (data: {
    userId: string;
    username: string;
    message: string;
  }) => void;
  intermissionStart: (data: { duration: number }) => void;
  roundEnd: (data: { correctPrice: number; scores: RoundEndScore[] }) => void;
  correctGuess: (data: {
    userId: number;
    playerId: number;
    username: string;
  }) => void;
  incorrectGuess: (data: {
    userId: number;
    playerId: number;
    username: string;
  }) => void;

  playerJoined: (data: {
    userId: number;
    playerId: number;
    username: string;
    roomScore: number;
  }) => void;

  playerLeft: (data: {
    userId: number;
    playerId: number;
    username: string;
  }) => void;
}

export interface ClientToServerEvents {
  joinRoom: (data: { roomId: number }) => void;
  leaveRoom: (data: { roomId: number }) => void;
  submitGuess: (data: { roomId: number; price: number }) => void;
  chatMessage: (data: { roomId: number; message: string }) => void;
}
