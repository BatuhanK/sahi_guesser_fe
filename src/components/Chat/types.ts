import { RemoteTrack, Room } from "livekit-client";
import type { ChatMessage } from "../../types";
import type { OnlinePlayer } from "../../types/socket";

export interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

export interface AudioState {
  isConnected: boolean;
  isConnecting: boolean;
  room: Room | null;
  error: string | null;
  isMuted: boolean;
  isRoomMuted: boolean;
}

export interface RemoteParticipantState {
  identity: string;
  audioTrack: RemoteTrack | null;
  isMuted: boolean;
  isSpeaking: boolean;
}

export interface MentionState {
  isActive: boolean;
  startPosition: number;
  text: string;
}

export interface ChatMessageProps {
  message: ChatMessage;
  isOwn: boolean;
  showTimestamp: boolean;
  currentUsername?: string | null;
  onMentionClick?: (username: string) => void;
}

export interface ChatHeaderProps {
  onlinePlayers: OnlinePlayer[];
}

export interface ChatInputProps {
  onSubmit: (message: string) => void;
  setMentionHandler: (handler: (username: string) => void) => void;
}

export interface ParticipantsListProps {
  remoteParticipants: Map<string, RemoteParticipantState>;
  onToggleMute: (participantId: string) => void;
}

export interface OnlinePlayersListProps {
  players: OnlinePlayer[];
  isOpen: boolean;
  onClose: () => void;
}

export interface ChatMention {
  userId: string | number;
  username: string;
  indices: [number, number];
} 