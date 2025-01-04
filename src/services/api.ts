import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || window.location.origin + "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const fingerprint = localStorage.getItem("fingerprint");
  if (fingerprint) {
    config.headers["x-fingerprint"] = fingerprint;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (
    error: AxiosError<{
      message?: string;
      error?: {
        response?: {
          availableIn?: number;
        };
      };
    }>
  ) => {
    const notShowToastUrls = ["/auth/me"];
    if (notShowToastUrls.includes(error.config?.url || "")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 429) {
      const availableIn =
        error.response?.data?.error?.response?.availableIn || 0;
      toast.error(
        `Aksiyon engellendi. ${availableIn} saniye sonra tekrar deneyin`
      );
      return Promise.reject(error);
    }

    const errorMessage =
      error.response?.data?.message || error.message || "An error occurred";
    toast.error(errorMessage);

    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post("/auth/login", { username, password });
    return response.data;
  },

  register: async (
    username: string,
    password: string,
    email: string,
    fingerprint: string | null
  ) => {
    const response = await api.post("/auth/register", {
      username,
      password,
      email,
      fingerprint,
    });
    return response.data;
  },

  anonymousLogin: async (fingerprint: string) => {
    const response = await api.get(
      "/auth/anonymous?fingerprint=" + fingerprint
    );
    return response.data;
  },

  verifyEmail: async (code: string) => {
    const response = await api.post("/auth/verify-email", { code });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  getLiveKitToken: async (roomId: string): Promise<string> => {
    const response = await api.get(`/auth/livekit-token/${roomId}`);
    return response.data;
  },

  changePassword: async (password: string) => {
    const response = await api.post("/auth/change-password", { password });
    return response.data;
  },

  changeUsername: async (username: string) => {
    const response = await api.post("/auth/change-username", { username });
    return response.data;
  },

  resendVerificationEmail: async () => {
    const response = await api.post("/auth/resend-verification-email");
    return response.data;
  },

  updateEmail: async (email: string) => {
    const response = await api.post("/auth/change-email", { email });
    return response.data;
  },
};

export interface Category {
  id: number;
  name: string;
  onlinePlayerCount?: number;
  icon?: string;
  slug?: string;
}

export type Room = {
  id: number;
  name: string;
  slug: string;
  status: string;
  isSystemRoom: boolean;
  roomSettings: {
    maxGuessesPerRound: number;
  };
};

export type RoomSummaryPlayer = {
  playerId: string;
  userId: string;
  username: string;
  score: number;
};

export type RoomSummary = {
  room: Room;
  players: RoomSummaryPlayer[];
};

export type Announcement = {
  id: number;
  title: string;
  content: string;
  type: "info" | "warning" | "error";
  createdAt: string;
  updatedAt: string;
};

export interface CreatePrivateRoomRequest {
  categoryIds: number[];
  roundDurationSeconds: number;
  maxGuessesPerRound: number;
  minPrice?: number;
  maxPrice?: number;
  roundCount: number;
}

export const categoryApi = {
  getAll: async () => {
    const response = await api.get<{
      categories: Category[];
      notSystemOnlinePlayerCount: number;
    }>("/categories");
    return response.data;
  },

  getRooms: async (slug: string) => {
    const response = await api.get<{ rooms: Room[] }>(
      `/categories/${slug}/rooms`
    );
    return response.data.rooms;
  },
};

export const roomApi = {
  getDetails: async (slug: string) => {
    const response = await api.get(`/rooms/${slug}`);
    return response.data;
  },

  create: async (data: CreatePrivateRoomRequest) => {
    const response = await api.post("/private-game-rooms/create", data);
    return response.data.privateRoom;
  },

  getLivekitRoom: async (
    id: number
  ): Promise<{
    name: string;
    onlineCount: number;
    participants: string[];
  }> => {
    const response = await api.get(`/livekit-rooms/${id}`);
    return response.data;
  },

  getRoomSummary: async (slug: string): Promise<RoomSummary> => {
    const response = await api.get<RoomSummary>(`/rooms/${slug}/summary`);
    return response.data;
  },

  recreateRoom: async (slug: string): Promise<RoomSummary> => {
    const response = await api.post(`/rooms/${slug}/recreate`);
    return response.data;
  },
};

export const announcementApi = {
  getAll: async () => {
    const response = await api.get<{ announcements: Announcement[] }>(
      "/announcements"
    );
    return response.data.announcements;
  },
};

export const feedbackApi = {
  create: async (data: {
    email: string;
    type: "feedback" | "advertisement" | "bug" | "other";
    message: string;
  }) => {
    await api.post("/feedback", data);
    return true;
  },
};

export interface HourlyStats {
  views: Record<string, number>;
  viewers: Record<string, number>;
}

export interface AdVisibilityResponse {
  uniqueViewers: number;
  totalViews: number;
  hourlyStats: HourlyStats;
  currentHour: {
    views: number;
    viewers: number;
  };
}

export const adApi = {
  getVisibilityCount: async (
    identifier: string
  ): Promise<AdVisibilityResponse | null> => {
    try {
      const response = await api.get(`/ad-visibility-count/${identifier}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch ad stats:", error);
      return null;
    }
  },
};

export default api;
