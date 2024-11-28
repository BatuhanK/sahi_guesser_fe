import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.1.11:3333",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
};

export const categoryApi = {
  getAll: async () => {
    const response = await api.get("/categories");
    return response.data;
  },

  getRooms: async (slug: string) => {
    const response = await api.get(`/categories/${slug}/rooms`);
    return response.data;
  },
};

export const roomApi = {
  getDetails: async (id: number) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },
};

export default api;
