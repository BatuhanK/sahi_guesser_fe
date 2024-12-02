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

    if (error.config?.url !== "/auth/me" || error.response?.status !== 401) {
      toast.error(errorMessage);
    }

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

export type Category = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  onlinePlayerCount: number;
};

export type Room = {
  id: number;
  name: string;
  slug: string;
  status: string;
  roomSettings: {
    maxGuessesPerRound: number;
  };
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
  getDetails: async (id: number) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },
};

export default api;
