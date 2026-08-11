import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || window.location.origin + "/api",
  headers: {
    'Cache-Control': 'no-cache'
  }
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
    }>
  ) => {
    const notShowToastUrls = ["/auth/me"];
    if (notShowToastUrls.includes(error.config?.url || "")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 429) {
      toast.error(
        error.response?.data?.message ||
          "Çok fazla istek. Lütfen daha sonra tekrar deneyin."
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
    recaptchaResponse: string
  ) => {
    let fingerprint = localStorage.getItem("fingerprint");
    if (!fingerprint) {
      fingerprint = crypto.randomUUID();
      localStorage.setItem("fingerprint", fingerprint);
    }
    const response = await api.post("/auth/register", {
      username,
      password,
      email,
      fingerprint,
      recaptchaResponse,
    });
    return response.data;
  },

  verifyEmail: async (code: string) => {
    const response = await api.post("/auth/verify-email", { code });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (email: string, code: string, newPassword: string) => {
    const response = await api.post("/auth/reset-password", {
      email,
      code,
      newPassword,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  getLiveKitToken: async (roomId: string): Promise<string> => {
    const response = await api.get(`/auth/livekit-token/${roomId}`);
    return response.data.token;
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
  isSystem: boolean;
  /** "price-guess" | "car-guess" — hangi oyun ekranının açılacağını belirler. */
  gameType: string;
  settings: {
    minPrice?: number | null;
    maxPrice?: number | null;
    roundDurationSeconds?: number;
    maxGuessesPerRound?: number;
    isDuel?: boolean;
    currency?: string;
    hideCurrency?: boolean;
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

export interface CreatePublicRoomRequest {
  categoryIds: number[];
  roundDurationSeconds: number;
  maxGuessesPerRound: number;
  minPrice?: number;
  maxPrice?: number;
  roundCount: number;

  maxPlayers: number; // max 50
  publicName: string; // min 3 char
  publicDescription: string; // min 10 char
}


let getAllCategoriesPromise: Promise<{
  categories: Category[];
  notSystemOnlinePlayerCount: number;
}> | null = null;

export const categoryApi = {
  getAll: async () => {
    if (!getAllCategoriesPromise) {
      getAllCategoriesPromise = api
        .get<{
          categories: Category[];
          notSystemOnlinePlayerCount: number;
        }>("/categories")
        .then((response) => response.data)
        .finally(() => {
          getAllCategoriesPromise = null;
        });
    }
    return getAllCategoriesPromise;
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

  getCarGuessRoom: async (): Promise<{ room: Room }> => {
    const response = await api.get<{ room: Room }>("/car-guess/room");
    return response.data;
  },

  create: async (data: CreatePrivateRoomRequest) => {
    const response = await api.post("/private-game-rooms/create", data);
    return response.data.privateRoom;
  },

  createPublic: async (data: CreatePublicRoomRequest) => {
    const response = await api.post("/public-game-rooms/create", data);
    return response.data.publicRoom;
  },

  getPublicRooms: async () => {
    const response = await api.get("/public-game-rooms");
    return response.data;
  },

  getRoomSummary: async (slug: string): Promise<RoomSummary> => {
    const response = await api.get<RoomSummary>(`/rooms/${slug}/summary`);
    return response.data;
  },

  recreateRoom: async (slug: string): Promise<{ message: string }> => {
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

// ---- Admin ----

export type AdminRole = "user" | "admin" | "moderator" | "junior_moderator";

export interface AdminStats {
  onlineUsers: number;
  activeRooms: number;
  waitingRooms: number;
  playingRooms: number;
  totalUsers: number;
  bannedUsers: number;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string | null;
  role: string;
  score: number;
  isPremium: boolean;
  isBanned: boolean;
  bannedUntil: string | null;
  lastOnlineAt: string | null;
  createdAt: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
}

export interface AdminRoom {
  id: number;
  slug: string;
  name: string;
  gameType: string;
  status: string;
  playerCount: number;
  isPublic: boolean;
}

export type AdminAnnouncementType = "info" | "warning" | "success" | "error";

export interface AdminAnnouncement {
  id: number;
  title: string;
  content: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAnnouncementInput {
  title?: string;
  content?: string;
  type?: AdminAnnouncementType;
  isActive?: boolean;
}

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  isActive: boolean;
  minVersion: string | null;
  metadata: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCategoryInput {
  name?: string;
  slug?: string;
  icon?: string;
  isActive?: boolean;
  minVersion?: string;
  metadata?: unknown;
}

export interface AdminAppConfig {
  key: string;
  value: unknown;
  updatedAt: string;
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get<AdminStats>("/admin/stats");
    return response.data;
  },

  getUsers: async (params: {
    search?: string;
    role?: string;
    banned?: boolean;
    page?: number;
    limit?: number;
  }): Promise<AdminUsersResponse> => {
    const response = await api.get<AdminUsersResponse>("/admin/users", {
      params,
    });
    return response.data;
  },

  updateUserRole: async (id: number, role: AdminRole) => {
    const response = await api.patch(`/admin/users/${id}`, { role });
    return response.data;
  },

  banUser: async (id: number, banMinutes: number | null) => {
    const response = await api.post(`/admin/users/${id}/ban`, { banMinutes });
    return response.data;
  },

  unbanUser: async (id: number) => {
    const response = await api.delete(`/admin/users/${id}/ban`);
    return response.data;
  },

  getAnnouncements: async (): Promise<AdminAnnouncement[]> => {
    const response = await api.get<{ announcements: AdminAnnouncement[] }>(
      "/admin/announcements"
    );
    return response.data.announcements;
  },

  createAnnouncement: async (data: {
    title: string;
    content: string;
    type?: AdminAnnouncementType;
    isActive?: boolean;
  }): Promise<AdminAnnouncement> => {
    const response = await api.post<{ announcement: AdminAnnouncement }>(
      "/admin/announcements",
      data
    );
    return response.data.announcement;
  },

  updateAnnouncement: async (
    id: number,
    data: AdminAnnouncementInput
  ): Promise<AdminAnnouncement> => {
    const response = await api.patch<{ announcement: AdminAnnouncement }>(
      `/admin/announcements/${id}`,
      data
    );
    return response.data.announcement;
  },

  deleteAnnouncement: async (id: number) => {
    const response = await api.delete(`/admin/announcements/${id}`);
    return response.data;
  },

  getCategories: async (): Promise<AdminCategory[]> => {
    const response = await api.get<{ categories: AdminCategory[] }>(
      "/admin/categories"
    );
    return response.data.categories;
  },

  createCategory: async (data: {
    name: string;
    slug?: string;
    icon?: string;
    minVersion?: string;
    metadata?: unknown;
  }): Promise<AdminCategory> => {
    const response = await api.post<{ category: AdminCategory }>(
      "/admin/categories",
      data
    );
    return response.data.category;
  },

  updateCategory: async (
    id: number,
    data: AdminCategoryInput
  ): Promise<AdminCategory> => {
    const response = await api.patch<{ category: AdminCategory }>(
      `/admin/categories/${id}`,
      data
    );
    return response.data.category;
  },

  deleteCategory: async (id: number) => {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
  },

  getAppConfigs: async (): Promise<AdminAppConfig[]> => {
    const response = await api.get<AdminAppConfig[]>("/admin/app-configs");
    return response.data;
  },

  putAppConfig: async (key: string, value: unknown) => {
    const response = await api.put(`/admin/app-configs/${key}`, { value });
    return response.data;
  },

  deleteAppConfig: async (key: string) => {
    const response = await api.delete(`/admin/app-configs/${key}`);
    return response.data;
  },

  getLiveRooms: async (): Promise<AdminRoom[]> => {
    const response = await api.get<AdminRoom[]>("/admin/live/rooms");
    return response.data;
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
