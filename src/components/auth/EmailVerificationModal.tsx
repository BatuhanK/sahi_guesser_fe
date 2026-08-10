import { useState } from "react";
import toast from "react-hot-toast";
import { authApi } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/Dialog";

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "verify" | "set";
  currentEmail?: string | null;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  type,
  currentEmail,
}) => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (!/^\d{6}$/.test(code.trim())) {
      toast.error("Lütfen 6 haneli doğrulama kodunu girin");
      return;
    }

    try {
      setIsLoading(true);
      await authApi.verifyEmail(code.trim());
      toast.success("Email doğrulandı!");

      const user = useAuthStore.getState().user;
      if (user) {
        useAuthStore.getState().setUser({ ...user, emailVerified: true });
      }
      onClose();
    } catch (error) {
      console.error("Failed to verify email:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setIsLoading(true);
      await authApi.resendVerificationEmail();
      toast.success("Doğrulama e-postası gönderildi!");
    } catch (error) {
      console.error("Failed to resend verification email:", error);
      toast.error("E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetEmail = async () => {
    if (!email.trim()) {
      toast.error("E-posta adresi boş olamaz");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Geçerli bir e-posta adresi giriniz");
      return;
    }

    try {
      setIsLoading(true);
      await authApi.updateEmail(email);
      toast.success("E-posta adresi güncellendi!");
      onClose();
    } catch (error) {
      console.error("Failed to update email:", error);
      toast.error("E-posta güncellenemedi. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {type === "verify" ? "E-posta Doğrulama" : "E-posta Ayarla"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {type === "verify" ? (
            <div className="space-y-4">
              <p className="text-[var(--text-secondary)]">
                {currentEmail} adresine 6 haneli bir doğrulama kodu gönderdik.
                Lütfen e-postanızı kontrol edin ve kodu aşağıya girin.
              </p>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="6 haneli kod"
                className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent text-[var(--text-primary)] text-center text-lg tracking-[0.5em]"
              />
              <Button
                onClick={handleVerify}
                disabled={isLoading || code.length !== 6}
                className="w-full"
              >
                Doğrula
              </Button>
              <Button
                onClick={handleResendVerification}
                disabled={isLoading}
                className="w-full"
              >
                Doğrulama Kodunu Tekrar Gönder
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[var(--text-secondary)]">
                Lütfen e-posta adresinizi girin. Bu adres hesabınızla
                ilişkilendirilecek ve önemli bildirimler için kullanılacaktır.
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresiniz"
                className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent text-[var(--text-primary)]"
              />
              <Button
                onClick={handleSetEmail}
                disabled={isLoading}
                className="w-full"
              >
                E-posta Adresini Kaydet
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
