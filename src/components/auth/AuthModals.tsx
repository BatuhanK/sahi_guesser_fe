import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import toast from "react-hot-toast";
import { authApi } from "../../services/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "login" | "register";
  onAuth: (username: string, password: string, email?: string, recaptchaResponse?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  type,
  onAuth,
}) => {
  const [view, setView] = useState<"auth" | "forgot" | "reset">("auth");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
    code?: string;
    newPassword?: string;
    recaptcha?: string;
  }>({});
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    if (!isOpen) {
      setView("auth");
      setUsername("");
      setPassword("");
      setEmail("");
      setResetCode("");
      setNewPassword("");
      setIsLoading(false);
      setErrors({});
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (type === "register") {
      if (!email) {
        newErrors.email = "E-posta adresi gereklidir";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "Geçerli bir e-posta adresi giriniz";
      }

      // Validate reCAPTCHA for register form
      if (!recaptchaRef.current?.getValue()) {
        newErrors.recaptcha = "Lütfen robot olmadığınızı doğrulayın";
      }
    }

    if (!username) {
      newErrors.username = "Kullanıcı adı gereklidir";
    } else if (type === "register" && !/^[a-zA-Z0-9]+$/.test(username)) {
      newErrors.username =
        "Kullanıcı adı sadece harf ve rakam içerebilir. Türkçe karakter ya da boşluk vb. karakterler içeremez.";
    }

    if (!password) {
      newErrors.password = "Şifre gereklidir";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (type === "register") {
        const recaptchaResponse = recaptchaRef.current?.getValue();
        onAuth(username, password, email, recaptchaResponse || "");
      } else {
        onAuth(username, password);
      }
    }
  };

  const validateForgotForm = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = "E-posta adresi gereklidir";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Geçerli bir e-posta adresi giriniz";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForgotForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await authApi.forgotPassword(email);
      toast.success(
        response?.message || "Sıfırlama kodu e-postana gönderildi"
      );
      setErrors({});
      setView("reset");
    } catch (error) {
      console.error("Failed to send password reset code:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    if (!/^\d{6}$/.test(resetCode)) {
      newErrors.code = "Lütfen 6 haneli sıfırlama kodunu girin";
    }
    if (!newPassword) {
      newErrors.newPassword = "Şifre gereklidir";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await authApi.resetPassword(email, resetCode, newPassword);
      toast.success(
        response?.message || "Şifren sıfırlandı! Giriş yapabilirsin."
      );
      setUsername(email);
      setPassword("");
      setResetCode("");
      setNewPassword("");
      setErrors({});
      setView("auth");
    } catch (error) {
      console.error("Failed to reset password:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={onClose}
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

          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
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
                  {view === "forgot"
                    ? "Şifremi Unuttum"
                    : view === "reset"
                      ? "Şifreyi Sıfırla"
                      : type === "login"
                        ? "Giriş Yap"
                        : "Kayıt Ol"}
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-[var(--hover-color)] rounded-full transition-colors"
                >
                  <X className="text-[var(--text-primary)]" size={20} />
                </button>
              </div>

              {view === "auth" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {type === "register" && (
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-[var(--text-secondary)]"
                    >
                      E-posta
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`mt-1 block w-full px-3 py-2 bg-[var(--bg-tertiary)] border ${
                        errors.email
                          ? "border-[var(--error-text)]"
                          : "border-[var(--border-color)]"
                      } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent text-[var(--text-primary)]`}
                      required
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-[var(--error-text)]">
                        {errors.email}
                      </p>
                    )}
                  </div>
                )}

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
                      errors.username
                        ? "border-[var(--error-text)]"
                        : "border-[var(--border-color)]"
                    } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent text-[var(--text-primary)]`}
                    required
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-[var(--error-text)]">
                      {errors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[var(--text-secondary)]"
                  >
                    Şifre
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`mt-1 block w-full px-3 py-2 bg-[var(--bg-tertiary)] border ${
                      errors.password
                        ? "border-[var(--error-text)]"
                        : "border-[var(--border-color)]"
                    } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent text-[var(--text-primary)]`}
                    required
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-[var(--error-text)]">
                      {errors.password}
                    </p>
                  )}
                  {type === "login" && (
                    <div className="mt-1 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setErrors({});
                          setView("forgot");
                        }}
                        className="text-sm text-[var(--accent-color)] hover:underline"
                      >
                        Şifremi Unuttum
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  {type === "register" && (
                    <div className="mb-4">
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey="6LeqFsoqAAAAAIJtaF1-NFlFUv8qn3g0k5JQJHgI"
                        theme="light"
                        size="normal"
                        lang="tr"
                        onChange={(value) => {
                          if (!value) {
                            setErrors(prev => ({...prev, recaptcha: "Lütfen robot olmadığınızı doğrulayın"}));
                          } else {
                            setErrors(prev => ({...prev, recaptcha: undefined}));
                          }
                        }}
                      />
                      {errors.recaptcha && (
                        <p className="mt-1 text-sm text-[var(--error-text)]">
                          {errors.recaptcha}
                        </p>
                      )}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)] transition-colors"
                  >
                    {type === "login" ? "Giriş Yap" : "Kayıt Ol"}
                  </button>
                </div>
              </form>
              )}

              {view === "forgot" && (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <p className="text-sm text-[var(--text-secondary)]">
                    Hesabına bağlı e-posta adresini gir, sana 6 haneli bir
                    sıfırlama kodu gönderelim.
                  </p>
                  <div>
                    <label
                      htmlFor="forgot-email"
                      className="block text-sm font-medium text-[var(--text-secondary)]"
                    >
                      E-posta
                    </label>
                    <input
                      type="email"
                      id="forgot-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`mt-1 block w-full px-3 py-2 bg-[var(--bg-tertiary)] border ${
                        errors.email
                          ? "border-[var(--error-text)]"
                          : "border-[var(--border-color)]"
                      } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent text-[var(--text-primary)]`}
                      required
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-[var(--error-text)]">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)] transition-colors disabled:opacity-50"
                    >
                      Kod Gönder
                    </button>
                    <div className="mt-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setErrors({});
                          setView("auth");
                        }}
                        className="text-sm text-[var(--accent-color)] hover:underline"
                      >
                        Giriş Yap'a Dön
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {view === "reset" && (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <p className="text-sm text-[var(--text-secondary)]">
                    {email} adresine 6 haneli bir sıfırlama kodu gönderdik.
                    Lütfen e-postanı kontrol edip kodu ve yeni şifreni aşağıya
                    gir.
                  </p>
                  <div>
                    <label
                      htmlFor="reset-code"
                      className="block text-sm font-medium text-[var(--text-secondary)]"
                    >
                      Sıfırlama Kodu
                    </label>
                    <input
                      type="text"
                      id="reset-code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={resetCode}
                      onChange={(e) =>
                        setResetCode(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="6 haneli kod"
                      className={`mt-1 block w-full px-3 py-2 bg-[var(--bg-tertiary)] border ${
                        errors.code
                          ? "border-[var(--error-text)]"
                          : "border-[var(--border-color)]"
                      } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent text-[var(--text-primary)] text-center text-lg tracking-[0.5em]`}
                      required
                    />
                    {errors.code && (
                      <p className="mt-1 text-sm text-[var(--error-text)]">
                        {errors.code}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="new-password"
                      className="block text-sm font-medium text-[var(--text-secondary)]"
                    >
                      Yeni Şifre
                    </label>
                    <input
                      type="password"
                      id="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`mt-1 block w-full px-3 py-2 bg-[var(--bg-tertiary)] border ${
                        errors.newPassword
                          ? "border-[var(--error-text)]"
                          : "border-[var(--border-color)]"
                      } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent text-[var(--text-primary)]`}
                      required
                    />
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-[var(--error-text)]">
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={isLoading || resetCode.length !== 6}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)] transition-colors disabled:opacity-50"
                    >
                      Şifreyi Sıfırla
                    </button>
                    <div className="mt-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setErrors({});
                          setView("auth");
                        }}
                        className="text-sm text-[var(--accent-color)] hover:underline"
                      >
                        Giriş Yap'a Dön
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
