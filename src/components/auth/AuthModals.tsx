import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
    recaptcha?: string;
  }>({});
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    if (!isOpen) {
      setUsername("");
      setPassword("");
      setEmail("");
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
                  {type === "login" ? "Giriş Yap" : "Kayıt Ol"}
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-[var(--hover-color)] rounded-full transition-colors"
                >
                  <X className="text-[var(--text-primary)]" size={20} />
                </button>
              </div>

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
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
