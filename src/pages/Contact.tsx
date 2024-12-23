import { useState } from "react";
import toast from "react-hot-toast";
import { feedbackApi } from "../services/api";
import { X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const MIN_MESSAGE_LENGTH = 25;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const Contact = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClose = () => {
    // Eğer önceki sayfa oyun sayfası ise oraya geri dön
    if (location.state?.from === '/') {
      navigate('/');
    } else {
      navigate(-1); // değilse normal geri git
    }
  };

  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    type: "feedback" as const,
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    message: "",
    email: "",
  });

  const validateEmail = (email: string) => {
    if (!email) {
      return "E-posta adresi gereklidir.";
    }
    if (!EMAIL_REGEX.test(email)) {
      return "Geçerli bir e-posta adresi giriniz.";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(formData.email);
    const messageError =
      formData.message.length < MIN_MESSAGE_LENGTH
        ? `Mesajınız en az ${MIN_MESSAGE_LENGTH} karakter olmalıdır.`
        : "";

    setErrors({
      email: emailError,
      message: messageError,
    });

    if (emailError || messageError) {
      return;
    }

    setIsSubmitting(true);

    try {
      await feedbackApi.create(formData);
      toast.success("Mesajınız başarıyla gönderildi!");
      setFormData({
        email: "",
        type: "feedback",
        message: "",
      });
      setErrors({ email: "", message: "" });
    } catch (error) {
      console.error("Feedback submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "message") {
      setErrors((prev) => ({
        ...prev,
        message:
          value.length < MIN_MESSAGE_LENGTH
            ? `Mesajınız en az ${MIN_MESSAGE_LENGTH} karakter olmalıdır. (${value.length}/${MIN_MESSAGE_LENGTH})`
            : "",
      }));
    }

    if (name === "email") {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(value),
      }));
    }
  };

  const isFormValid =
    !errors.email &&
    !errors.message &&
    formData.message.length >= MIN_MESSAGE_LENGTH;

  if (!showForm) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 relative">
      <button
        onClick={handleClose}
        className="absolute -top-2 -right-2 p-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--hover-color)] transition-colors duration-200"
        title="Kapat"
      >
        <X size={18} className="text-[var(--text-secondary)]" />
      </button>

      <h1 className="text-3xl font-bold mb-6">İletişim</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
          >
            E-posta Adresiniz
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.email
                ? "border-[var(--error-text)]"
                : "border-[var(--border-color)]"
            } bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]`}
          />
          {errors.email && (
            <p className="mt-2 text-sm text-[var(--error-text)]">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
          >
            İletişim Konusu
          </label>
          <select
            id="type"
            name="type"
            required
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
          >
            <option value="feedback">Genel Geri Bildirim</option>
            <option value="bug">Hata Bildirimi</option>
            <option value="advertisement">Reklam ve İş Birliği</option>
            <option value="other">Diğer</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
          >
            Mesajınız
          </label>
          <textarea
            id="message"
            name="message"
            required
            value={formData.message}
            onChange={handleChange}
            rows={6}
            minLength={MIN_MESSAGE_LENGTH}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.message
                ? "border-[var(--error-text)]"
                : "border-[var(--border-color)]"
            } bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]`}
          />
          {errors.message && (
            <p className="mt-2 text-sm text-[var(--error-text)]">
              {errors.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          className="w-full bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-black font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Gönderiliyor..." : "Gönder"}
        </button>
      </form>
    </div>
  );
};
