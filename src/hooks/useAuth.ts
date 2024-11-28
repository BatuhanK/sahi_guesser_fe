import { useEffect } from "react";
import { authApi } from "../services/api";
import { useAuthStore } from "../store/authStore";

export function useAuth() {
  const { user, token, setUser, setToken, logout } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      authApi
        .getCurrentUser()
        .then(({ user }) => setUser(user))
        .catch(() => logout());
    }
  }, [token, user]);

  const login = async (username: string, password: string) => {
    const { user, token } = await authApi.login(username, password);
    setUser(user);
    setToken(token.token);
  };

  const register = async (username: string, password: string) => {
    const { user, token } = await authApi.register(username, password);
    setUser(user);
    setToken(token.token);
  };

  return {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };
}
