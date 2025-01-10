import { AlertOctagon, AlertTriangle, CheckCircle2, Info, Megaphone, PartyPopper } from "lucide-react";

export type AnnouncementType = "info" | "warning" | "error" | "success" | "announcement" | "celebration";

export const getAnnouncementIcon = (type: AnnouncementType) => {
  switch (type) {
    case "warning":
      return <AlertTriangle className="text-[var(--warning-text)]" size={20} />;
    case "error":
      return <AlertOctagon className="text-[var(--error-text)]" size={20} />;
    case "success":
      return <CheckCircle2 className="text-[var(--accent-color)]" size={20} />;
    case "announcement":
      return <Megaphone className="text-[var(--text-primary)]" size={20} />;
    case "celebration":
      return <PartyPopper className="text-[var(--warning-text)]" size={20} />;
    default:
      return <Info className="text-[var(--info-text)]" size={20} />;
  }
};

export const getAnnouncementColors = (type: AnnouncementType) => {
  switch (type) {
    case "warning":
      return {
        bg: "bg-[var(--warning-bg)]",
        border: "border-[var(--warning-text)]",
        hover: "hover:bg-[var(--warning-hover)]",
      };
    case "error":
      return {
        bg: "bg-[var(--error-bg)]",
        border: "border-[var(--error-text)]",
        hover: "hover:bg-[var(--error-hover)]",
      };
    case "success":
      return {
        bg: "bg-[var(--accent-color)]/10",
        border: "border-[var(--accent-color)]",
        hover: "hover:bg-[var(--accent-color)]/20",
      };
    case "announcement":
      return {
        bg: "bg-[var(--bg-primary)]",
        border: "border-[var(--text-primary)]",
        hover: "hover:bg-[var(--bg-hover)]",
      };
    case "celebration":
      return {
        bg: "bg-[var(--warning-bg)]",
        border: "border-[var(--warning-text)]",
        hover: "hover:bg-[var(--warning-hover)]",
      };
    default:
      return {
        bg: "bg-[var(--info-bg)]",
        border: "border-[var(--info-text)]",
        hover: "hover:bg-[var(--info-hover)]",
      };
  }
}; 