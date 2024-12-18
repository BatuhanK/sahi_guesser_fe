import { useEffect } from "react";
import { authApi } from "../services/api";
import { socketService } from "../services/socket";
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
  }, [token, user, logout, setUser]);

  const login = async (username: string, password: string) => {
    const { user, token } = await authApi.login(username, password);
    setUser(user);
    setToken(token.token);

    socketService.reconnect();
  };

  const register = async (username: string, password: string) => {
    const { user, token } = await authApi.register(username, password);
    setUser(user);
    setToken(token.token);

    window.location.reload();

    socketService.reconnect();
  };

  return {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };
}
