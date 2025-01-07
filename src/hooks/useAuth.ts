import { useEffect, useRef } from "react";
import { authApi } from "../services/api";
import { socketService } from "../services/socket";
import { useAuthStore } from "../store/authStore";

export function useAuth() {
  const {
    user,
    token,
    fingerprint,
    setUser,
    setToken,
    clearForcedLogout,
    logout,
  } = useAuthStore();
  const isLoadingRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    if (token && !user && !isLoadingRef.current) {
      isLoadingRef.current = true;

      authApi
        .getCurrentUser()
        .then(({ user, email }) => {
          if (isMounted) {
            user.email = email;
            setUser(user);
          }
        })
        .catch((error) => {
          console.log("auth error", error);
        })
        .finally(() => {
          isLoadingRef.current = false;
        });
    }

    return () => {
      isMounted = false;
    };
  }, [token]); // Only depend on token changes

  // Handle anonymous login with fingerprint
  useEffect(() => {
    const isForcedLogout = localStorage.getItem("forced_logout") === "true";
    let isMounted = true;

    if (
      fingerprint &&
      !user &&
      !token &&
      !isLoadingRef.current &&
      !isForcedLogout
    ) {
      isLoadingRef.current = true;

      authApi
        .anonymousLogin(fingerprint)
        .then(({ user, token, email }) => {
          if (isMounted) {
            user.email = email;
            setUser(user);
            setToken(token.token);
            socketService.reconnect();
          }
        })
        .catch((error) => {
          console.log("anonymous login error", error);
        })
        .finally(() => {
          isLoadingRef.current = false;
        });
    }

    return () => {
      isMounted = false;
    };
  }, [fingerprint]); // Only depend on fingerprint changes

  const login = async (username: string, password: string) => {
    const { user, token } = await authApi.login(username, password);
    clearForcedLogout();
    setUser(user);
    setToken(token.token);

    socketService.reconnect();
  };

  const register = async (
    username: string,
    password: string,
    email: string
  ) => {
    const { user, token } = await authApi.register(
      username,
      password,
      email,
      fingerprint
    );
    clearForcedLogout();
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
