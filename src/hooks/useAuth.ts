import { useEffect } from "react";
import { authApi } from "../services/api";
import { socketService } from "../services/socket";
import { useAuthStore } from "../store/authStore";

let fetchUserPromise: Promise<void> | null = null;

function fetchCurrentUser() {
  if (!fetchUserPromise) {
    fetchUserPromise = authApi
      .getCurrentUser()
      .then(({ user, email }) => {
        user.email = email;
        useAuthStore.getState().setUser(user);
      })
      .catch((error) => {
        console.log("auth error", error);
      })
      .finally(() => {
        fetchUserPromise = null;
      });
  }
  return fetchUserPromise;
}

export function useAuth() {
  const { user, token, setUser, setToken, logout } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      fetchCurrentUser();
    }
  }, [token, user]);

  const login = async (username: string, password: string) => {
    const { user, token, email } = await authApi.login(username, password);
    user.email = email;
    setUser(user);
    setToken(token);

    socketService.reconnect();
  };

  const register = async (
    username: string,
    password: string,
    email: string,
    recaptchaResponse: string
  ) => {
    const { user, token } = await authApi.register(username, password, email, recaptchaResponse);
    setUser(user);
    setToken(token);

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
