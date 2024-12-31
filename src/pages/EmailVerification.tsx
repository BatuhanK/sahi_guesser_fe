import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../services/api";
import { useAuthStore } from "../store/authStore";

export function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const hasVerified = useRef(false);
  const { setUser } = useAuthStore();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!code) {
        toast.error("Doğrulama kodu eksik");
        navigate("/");
        return;
      }

      if (hasVerified.current) {
        return;
      }

      hasVerified.current = true;

      try {
        await authApi.verifyEmail(code);
        toast.success("Email doğrulandı!");

        // Fetch updated user data
        try {
          const { user, email } = await authApi.getCurrentUser();
          user.email = email;
          setUser(user);
        } catch (error) {
          console.error("Failed to fetch updated user data:", error);
          // If we can't fetch updated user data, just reload the page
          window.location.href = "/";
          return;
        }

        navigate("/");
      } catch (error) {
        console.error("Email doğrulama hatası:", error);
        navigate("/");
      }
    };

    verifyEmail();
  }, [code, navigate, setUser]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-medium text-[var(--text-primary)]">
          Email doğrulanıyor...
        </p>
      </div>
    </div>
  );
}
