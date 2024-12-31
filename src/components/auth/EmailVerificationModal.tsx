import { useState } from "react";
import toast from "react-hot-toast";
import { authApi } from "../../services/api";
import { Button } from "../ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/Dialog";

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "verify" | "set";
  currentEmail?: string;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  type,
  currentEmail,
}) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResendVerification = async () => {
    try {
      setIsLoading(true);
      await authApi.resendVerificationEmail();
      toast.success("Doğrulama e-postası gönderildi!");
      onClose();
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
                {currentEmail} adresine bir doğrulama e-postası gönderdik.
                Lütfen e-postanızı kontrol edin ve doğrulama bağlantısına
                tıklayın.
              </p>
              <Button
                onClick={handleResendVerification}
                disabled={isLoading}
                className="w-full"
              >
                Doğrulama E-postasını Tekrar Gönder
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
