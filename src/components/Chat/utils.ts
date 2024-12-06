import type { ChatMessage } from "../../types";
import type { User } from "../../types/auth";

export const isOwnMessage = (message: ChatMessage, user: User | null) => {
  return message.username === user?.username;
};

export const shouldShowTimestamp = (messages: ChatMessage[], index: number) => {
  if (index === 0) return true;
  const currentMsg = messages[index];
  const prevMsg = messages[index - 1];

  return (
    prevMsg.userId !== currentMsg.userId ||
    currentMsg.timestamp.getTime() - prevMsg.timestamp.getTime() > 5 * 60 * 1000
  );
};

export const maskNumbers = (text: string): string => {
  // First replace numeric values (including k, m, b suffixes and underscores)
  const masked = text.replace(/\d+[kKmMbB_]?\d*/g, "*");

  // Then replace Turkish number words
  return masked.replace(
    /(bir|üç|dort|dört|beş|alti|altı|yedi|sekiz|dokuz|yirmi|otuz|kırk|kirk|elli|altmış|altmis|yetmiş|yetmis|seksen|doksan|milyon|milyar)/gi,
    "*"
  );
};

export const EMOJI_MAP: Record<string, string> = {
  ":)": "😊",
  ":D": "😃",
  ":(": "😞",
  ":P": "😛",
  ":p": "😛",
  "<3": "❤️",
  ":heart:": "❤️",
  ":+1:": "👍",
  ":-1:": "👎",
  ":thumbsup:": "👍",
  ":thumbsdown:": "👎",
  ":fire:": "🔥",
  ":smile:": "😊",
  ":sad:": "😢",
  ":laugh:": "😂",
  ":wink:": "😉",
  ":ok:": "👌",
  ":wave:": "👋",
  ":clap:": "👏",
  ":rocket:": "🚀",
  ":star:": "⭐",
  ":100:": "💯",
  ":check:": "✅",
  ":x:": "❌",
};

export const convertEmojis = (message: string): string => {
  let result = message;
  Object.entries(EMOJI_MAP).forEach(([shortcut, emoji]) => {
    result = result.replace(
      new RegExp(shortcut.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
      emoji
    );
  });
  return result;
};

export const fuzzySearch = (text: string, query: string): boolean => {
  const pattern = query
    .toLowerCase()
    .split("")
    .map((char) => char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  const regex = new RegExp(pattern);
  return regex.test(text.toLowerCase());
};

export const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

export const initializeIOSAudio = () => {
  const audioContext = new (window.AudioContext ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).webkitAudioContext)();

  const buffer = audioContext.createBuffer(1, 1, 22050);
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start();

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}; 