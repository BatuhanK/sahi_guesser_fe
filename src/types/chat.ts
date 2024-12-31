export interface ChatMention {
  userId: string | number;
  username: string;
  indices: [number, number];
}
