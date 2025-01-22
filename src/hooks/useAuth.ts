import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { authApi } from "../services/api";
import { socketService } from "../services/socket";
import { useAuthStore } from "../store/authStore";

export function useAuth() {
  const { 
    user, 
    token, 
    setUser, 
    setToken, 
    logout,
    pendingFirebaseToken,
    setPendingFirebaseToken
  } = useAuthStore();
  const isLoadingRef = useRef(false);
  const [mustSetUsername, setMustSetUsername] = useState(false);

  useEffect(() => {
    if (!token || user || isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    let isCancelled = false;

    const fetchUser = async () => {
      try {
        const response = await authApi.getCurrentUser();
        
        // If component unmounted or effect re-ran, don't update state
        if (isCancelled) {
          return;
        }

        const { user: userData, email, isBanned, bannedUntilTs } = response;
        
        if (isBanned) {
          const remaningTime = bannedUntilTs - Date.now();
          const remaningTimeInMinutes = Math.floor(remaningTime / 60000);
          if (remaningTimeInMinutes !== 0) {
            toast.error(`${remaningTimeInMinutes} dakika daha banlısınız. Sonra tekrar deneyin`);
          } else {
            const remaningTimeInSeconds = Math.floor(remaningTime / 1000);
            toast.error(`${remaningTimeInSeconds} saniye daha banlısınız. Sonra tekrar deneyin`);
          }
        }

        userData.email = email;
        setUser(userData);
      } catch (error) {
        if (!isCancelled) {
          console.error("Auth error:", error);
          logout();
        }
      } finally {
        if (!isCancelled) {
          isLoadingRef.current = false;
        }
      }
    };

    fetchUser();

    return () => {
      isCancelled = true;
      isLoadingRef.current = false;
    };
  }, [token]);  // Only depend on token since user changes are handled within the effect

  const login = async (username: string, password: string) => {
    const { user, token, email } = await authApi.login(username, password);
    user.email = email;
    setUser(user);
    setToken(token.token);

    socketService.reconnect();
  };

  const register = async (
    username: string,
    password: string,
    email: string
  ) => {
    const { user, token } = await authApi.register(username, password, email);
    setUser(user);
    setToken(token.token);

    window.location.reload();

    socketService.reconnect();
  };

  const firebaseAuthTokenLogin = async (firebaseToken: string, username?: string) => {
    console.log('firebaseAuthTokenLogin called with:', { firebaseToken, username });
    try {
      const response = await authApi.loginWithFirebase(firebaseToken, username);
      console.log('API response:', response);

      if (response.mustSetUsername) {
        console.log('Must set username');
        setMustSetUsername(true);
        setPendingFirebaseToken(firebaseToken);
        return;
      }

      setPendingFirebaseToken(null);
      const user = response.user;
      user.email = response.email;
      setUser(user);
      setToken(response.token.token);
      socketService.reconnect();

      return user;
    } catch (error) {
      console.error("Firebase auth error:", error);
      throw error;
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    firebaseAuthTokenLogin,
    mustSetUsername,
    pendingFirebaseToken,
    setMustSetUsername: (value: boolean) => {
      setMustSetUsername(value);
      if (!value) {
        setPendingFirebaseToken(null);
      }
    },
  };
}