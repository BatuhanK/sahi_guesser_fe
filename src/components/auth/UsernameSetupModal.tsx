import { Dialog, Transition } from "@headlessui/react";
import { AxiosError } from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

interface UsernameSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ErrorResponse {
  message?: string;
}

export const UsernameSetupModal: React.FC<UsernameSetupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { firebaseAuthTokenLogin, pendingFirebaseToken } = useAuth();

  const validateUsername = () => {
    if (!username) {
      setError("Kullanıcı adı gereklidir");
      return false;
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      setError("Kullanıcı adı sadece harf ve rakam içerebilir. Türkçe karakter ya da boşluk vb. karakterler içeremez.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit clicked', { username, pendingFirebaseToken, isLoading });
    
    if (!validateUsername() || !pendingFirebaseToken || isLoading) {
      console.log('Validation failed', { 
        validationPassed: validateUsername(), 
        hasPendingToken: !!pendingFirebaseToken, 
        isLoading 
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Calling firebaseAuthTokenLogin with:', { pendingFirebaseToken, username });
      const response = await firebaseAuthTokenLogin(pendingFirebaseToken, username);
      console.log('Login response:', response);
      
      if (response) {
        toast.success("Giriş başarılı!");
        onClose();
      }
    } catch (error) {
      console.error("Error setting username:", error);
      const axiosError = error as AxiosError<ErrorResponse>;
      setError(axiosError.response?.data?.message || "Kullanıcı adı ayarlanırken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[60] overflow-y-auto"
        onClose={() => {}}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>

          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-[var(--bg-secondary)] shadow-xl rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium text-[var(--text-primary)]"
                >
                  Kullanıcı Adı Belirle
                </Dialog.Title>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-[var(--text-secondary)]"
                  >
                    Kullanıcı Adı
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`mt-1 block w-full px-3 py-2 bg-[var(--bg-tertiary)] border ${
                      error ? "border-[var(--error-text)]" : "border-[var(--border-color)]"
                    } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent text-[var(--text-primary)]`}
                    required
                    disabled={isLoading}
                  />
                  {error && (
                    <p className="mt-1 text-sm text-[var(--error-text)]">{error}</p>
                  )}
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? "Kaydediliyor..." : "Kullanıcı Adını Kaydet"}
                  </button>
                </div>
              </form>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}; 