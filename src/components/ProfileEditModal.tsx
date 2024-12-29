import { useState } from "react";
import toast from "react-hot-toast";
import { authApi } from "../services/api";
import { Button } from "./ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/Dialog";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleUsernameChange = async () => {
    if (!username.trim()) {
      toast.error("Kullanıcı adı boş olamaz");
      return;
    }

    try {
      setIsLoading(true);
      await authApi.changeUsername(username);
      toast.success("Kullanıcı adı başarıyla değiştirildi");
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Failed to change username:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!password.trim()) {
      toast.error("Şifre boş olamaz");
      return;
    }

    try {
      setIsLoading(true);
      await authApi.changePassword(password);
      toast.success("Şifre başarıyla değiştirildi");
      onClose();
    } catch (error) {
      console.error("Failed to change password:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profil Düzenle</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">
              Kullanıcı Adı Değiştir
            </h3>
            <div className="space-y-2">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Yeni kullanıcı adı"
                className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent text-[var(--text-primary)]"
              />
              <Button
                onClick={handleUsernameChange}
                disabled={isLoading}
                className="w-full"
              >
                Kullanıcı Adını Değiştir
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">
              Şifre Değiştir
            </h3>
            <div className="space-y-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Yeni şifre"
                className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent text-[var(--text-primary)]"
              />
              <Button
                onClick={handlePasswordChange}
                disabled={isLoading}
                className="w-full"
              >
                Şifreyi Değiştir
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
