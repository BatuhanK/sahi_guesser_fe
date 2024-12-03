import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "info" | "warning" | "error";
  createdAt: Date;
}

interface AnnouncementStore {
  announcements: Announcement[];
  readAnnouncementIds: string[];
  setAnnouncements: (announcements: Announcement[]) => void;
  markAsRead: (id: string) => void;
  getUnreadCount: () => number;
}

export const useAnnouncementStore = create<AnnouncementStore>()(
  persist(
    (set, get) => ({
      announcements: [],
      readAnnouncementIds: [],
      setAnnouncements: (announcements) =>
        set({
          announcements: announcements.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ),
        }),
      markAsRead: (id) =>
        set((state) => ({
          readAnnouncementIds: [...state.readAnnouncementIds, id],
        })),
      getUnreadCount: () => {
        const { announcements, readAnnouncementIds } = get();
        return announcements.filter(
          (announcement) => !readAnnouncementIds.includes(announcement.id)
        ).length;
      },
    }),
    {
      name: "announcement-storage",
    }
  )
);
