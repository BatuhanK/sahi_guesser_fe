import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../services/api";

export function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const hasVerified = useRef(false);

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
        navigate("/");
      } catch (error) {
        console.error("Email doğrulama hatası:", error);
        navigate("/");
      }
    };

    verifyEmail();
  }, [code, navigate]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-accent-color border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-medium">Email doğrulanıyor...</p>
      </div>
    </div>
  );
}
