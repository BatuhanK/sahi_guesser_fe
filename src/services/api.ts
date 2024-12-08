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
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const errorMessage =
      error.response?.data?.message || error.message || "An error occurred";

    const notShowToastUrls = ["/auth/me"];
    if (notShowToastUrls.includes(error.config?.url || "")) {
      return Promise.reject(error);
    }

    toast.error(errorMessage);

    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post("/auth/login", { username, password });
    return response.data;
  },

  register: async (username: string, password: string) => {
    const response = await api.post("/auth/register", { username, password });
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
  roomSettings: {
    maxGuessesPerRound: number;
  };
};

export type Announcement = {
  id: number;
  title: string;
  content: string;
  type: "info" | "warning" | "error";
  createdAt: string;
  updatedAt: string;
};

export type CreatePrivateRoomRequest = {
  categoryIds: number[];
  roundDurationSeconds: number;
  maxGuessesPerRound: number;
  minPrice?: number;
  maxPrice?: number;
};

export const categoryApi = {
  getAll: async () => {
    const response = await api.get<{ categories: Category[] }>("/categories");
    return response.data.categories;
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
};

export const announcementApi = {
  getAll: async () => {
    const response = await api.get<{ announcements: Announcement[] }>(
      "/announcements"
    );
    return response.data.announcements;
  },
};

export default api;
