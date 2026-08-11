import { Dialog, Transition } from "@headlessui/react";
import { KeyRound, Lock, LogIn, Mail, User, UserPlus, X } from "lucide-react";
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

const inputClass = (hasError?: string) =>
  `block w-full rounded-xl border bg-[var(--bg-tertiary)] pl-10 pr-4 py-2.5 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent ${
    hasError ? "border-[var(--error-text)]" : "border-[var(--border-color)]"
  }`;

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
  const [recaptchaTheme, setRecaptchaTheme] = useState<"light" | "dark">(
    () => (document.body.classList.contains("dark") ? "dark" : "light")
  );

  useEffect(() => {
    if (isOpen) {
      setRecaptchaTheme(
        document.body.classList.contains("dark") ? "dark" : "light"
      );
    }
  }, [isOpen]);

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

  const header =
    view === "forgot"
      ? { Icon: KeyRound, title: "Şifremi Unuttum", subtitle: "Hesabına bağlı e-posta adresini gir, sana 6 haneli bir sıfırlama kodu gönderelim." }
      : view === "reset"
        ? { Icon: KeyRound, title: "Şifreyi Sıfırla", subtitle: `${email} adresine 6 haneli bir sıfırlama kodu gönderdik.` }
        : type === "login"
          ? { Icon: LogIn, title: "Tekrar Hoş Geldin", subtitle: "Hesabına giriş yap ve oyuna devam et." }
          : { Icon: UserPlus, title: "Aramıza Katıl", subtitle: "Hesabını oluştur, tahminlere başla." };

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
            <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
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
            enterFrom="opacity-0 scale-95 translate-y-4"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-4"
          >
            <div className="relative inline-block w-full max-w-md p-6 md:p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-2xl rounded-2xl">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-24 left-1/2 h-48 w-80 max-w-full -translate-x-1/2 rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(var(--accent-rgb), 0.18), transparent)",
                }}
              />

              <button
                onClick={onClose}
                className="icon-btn absolute right-4 top-4 z-10"
                aria-label="Kapat"
              >
                <X size={20} />
              </button>

              <div className="relative mb-6 flex flex-col items-center text-center">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-muted)]">
                  <header.Icon className="h-6 w-6 text-[var(--accent-color)]" />
                </span>
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]"
                >
                  {header.title}
                </Dialog.Title>
                <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                  {header.subtitle}
                </p>
              </div>

              {view === "auth" && (
              <form onSubmit={handleSubmit} className="relative space-y-4">
                {type === "register" && (
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-[var(--text-secondary)]"
                    >
                      E-posta
                    </label>
                    <div className="relative mt-1.5">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={18} />
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ornek@eposta.com"
                        className={inputClass(errors.email)}
                        required
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1.5 text-sm text-[var(--error-text)]">
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
                  <div className="relative mt-1.5">
                    <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={18} />
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="kullaniciadi"
                      className={inputClass(errors.username)}
                      required
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1.5 text-sm text-[var(--error-text)]">
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
                  <div className="relative mt-1.5">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={18} />
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={inputClass(errors.password)}
                      required
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-sm text-[var(--error-text)]">
                      {errors.password}
                    </p>
                  )}
                  {type === "login" && (
                    <div className="mt-1.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setErrors({});
                          setView("forgot");
                        }}
                        className="text-sm font-medium text-[var(--accent-color)] transition-colors hover:text-[var(--accent-hover)]"
                      >
                        Şifremi Unuttum
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  {type === "register" && (
                    <div className="mb-4 flex justify-center">
                      <div>
                        <ReCAPTCHA
                          key={recaptchaTheme}
                          ref={recaptchaRef}
                          sitekey="6LeqFsoqAAAAAIJtaF1-NFlFUv8qn3g0k5JQJHgI"
                          theme={recaptchaTheme}
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
                          <p className="mt-1.5 text-sm text-[var(--error-text)]">
                            {errors.recaptcha}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  <button type="submit" className="btn-accent w-full py-3">
                    {type === "login" ? "Giriş Yap" : "Kayıt Ol"}
                  </button>
                </div>
              </form>
              )}

              {view === "forgot" && (
                <form onSubmit={handleForgotSubmit} className="relative space-y-4">
                  <div>
                    <label
                      htmlFor="forgot-email"
                      className="block text-sm font-medium text-[var(--text-secondary)]"
                    >
                      E-posta
                    </label>
                    <div className="relative mt-1.5">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={18} />
                      <input
                        type="email"
                        id="forgot-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ornek@eposta.com"
                        className={inputClass(errors.email)}
                        required
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1.5 text-sm text-[var(--error-text)]">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-accent w-full py-3 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {isLoading ? "Gönderiliyor..." : "Kod Gönder"}
                    </button>
                    <div className="mt-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setErrors({});
                          setView("auth");
                        }}
                        className="text-sm font-medium text-[var(--accent-color)] transition-colors hover:text-[var(--accent-hover)]"
                      >
                        Giriş Yap'a Dön
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {view === "reset" && (
                <form onSubmit={handleResetSubmit} className="relative space-y-4">
                  <p className="text-sm text-[var(--text-secondary)]">
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
                      className={`mt-1.5 block w-full rounded-xl border bg-[var(--bg-tertiary)] px-4 py-2.5 text-center text-lg font-semibold tracking-[0.5em] text-[var(--text-primary)] placeholder:font-normal placeholder:tracking-normal placeholder:text-[var(--text-tertiary)] shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent ${
                        errors.code
                          ? "border-[var(--error-text)]"
                          : "border-[var(--border-color)]"
                      }`}
                      required
                    />
                    {errors.code && (
                      <p className="mt-1.5 text-sm text-[var(--error-text)]">
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
                    <div className="relative mt-1.5">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={18} />
                      <input
                        type="password"
                        id="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className={inputClass(errors.newPassword)}
                        required
                      />
                    </div>
                    {errors.newPassword && (
                      <p className="mt-1.5 text-sm text-[var(--error-text)]">
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading || resetCode.length !== 6}
                      className="btn-accent w-full py-3 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      Şifreyi Sıfırla
                    </button>
                    <div className="mt-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setErrors({});
                          setView("auth");
                        }}
                        className="text-sm font-medium text-[var(--accent-color)] transition-colors hover:text-[var(--accent-hover)]"
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
