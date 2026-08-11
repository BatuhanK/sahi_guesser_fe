import type { BadgeTone } from "./components";

export function roomStatusBadge(status: string): {
  label: string;
  tone: BadgeTone;
} {
  switch (status) {
    case "PLAYING":
      return { label: "Oynanıyor", tone: "success" };
    case "WAITING":
      return { label: "Bekliyor", tone: "warning" };
    case "INTERMISSION":
      return { label: "Mola", tone: "info" };
    case "FINISHED":
    case "COMPLETED":
      return { label: "Tamamlandı", tone: "neutral" };
    default:
      return { label: status, tone: "neutral" };
  }
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(ts: number): string {
  // ts saniye ya da milisaniye olabilir.
  const ms = ts > 1e12 ? ts : ts * 1000;
  return new Date(ms).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function truncateJson(value: unknown, max = 60): string {
  let text: string;
  try {
    text = JSON.stringify(value);
  } catch {
    text = String(value);
  }
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

export function tryParseJson(
  text: string
): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false };
  }
}
