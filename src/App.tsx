import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import { AuthModal } from "./components/auth/AuthModals";
import { EmailVerificationModal } from "./components/auth/EmailVerificationModal";
import { GameContainer } from "./components/game/GameContainer";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { useAuth } from "./hooks/useAuth";
import { Contact } from "./pages/Contact";
import { EmailVerification } from "./pages/EmailVerification";
import { Terms } from "./pages/Terms";
import { analyticsService } from "./services/analytics";
import { useAuthStore } from "./store/authStore";

// Initialize GA4
analyticsService.initialize(
  import.meta.env.VITE_GA_MEASUREMENT_ID || "G-HM92SBLYN7"
);

// Analytics wrapper component
function AnalyticsWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    analyticsService.trackPageView(location.pathname);
  }, [location]);

  return <>{children}</>;
}

// Initialize FingerprintJS
function FingerprintWrapper({ children }: { children: React.ReactNode }) {
  const setFingerprint = useAuthStore((state) => state.setFingerprint);

  useEffect(() => {
    // Check localStorage first
    const storedFingerprint = localStorage.getItem("fingerprint");
    if (storedFingerprint) {
      setFingerprint(storedFingerprint);
      return;
    }

    // If no fingerprint in localStorage, initialize FingerprintJS

    const uuid = uuidv4()
    localStorage.setItem("fingerprint", uuid)
    setFingerprint(uuid)

  }, [setFingerprint]);

  return <>{children}</>;
}

// Email verification wrapper component
function EmailVerificationWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user } = useAuth();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModalType, setEmailModalType] = useState<"verify" | "set">(
    "verify"
  );

  useEffect(() => {
    // Don't show verification modal if user is on the verification page
    if (location.pathname === "/email-dogrula") {
      return;
    }

    if (user) {
      const modalShownCount = parseInt(
        localStorage.getItem(`emailModal_${user.id}`) || "0"
      );

      if (modalShownCount >= 3) {
        return; // Don't show modal if it's been shown 3 times already
      }

      if (!user.email) {
        setEmailModalType("set");
        setShowEmailModal(true);
        localStorage.setItem(
          `emailModal_${user.id}`,
          String(modalShownCount + 1)
        );
      } else if (!user.emailVerified) {
        setEmailModalType("verify");
        setShowEmailModal(true);
        localStorage.setItem(
          `emailModal_${user.id}`,
          String(modalShownCount + 1)
        );
      }
    }
  }, [user, location.pathname]);

  return (
    <>
      {children}
      <EmailVerificationModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        type={emailModalType}
        currentEmail={user?.email}
      />
    </>
  );
}

// CSS variables for theming
const setThemeColors = (isDark: boolean) => {
  const root = document.documentElement;
  if (isDark) {
    root.style.setProperty("--bg-primary", "#1a1a1a");
    root.style.setProperty("--bg-secondary", "#2d2d2d");
    root.style.setProperty("--bg-tertiary", "#333333");
    root.style.setProperty("--text-primary", "#ffffff");
    root.style.setProperty("--text-secondary", "#e0e0e0");
    root.style.setProperty("--text-tertiary", "#a0a0a0");
    root.style.setProperty("--border-color", "#404040");
    root.style.setProperty("--hover-color", "#3d3d3d");
    root.style.setProperty("--accent-color", "#fbbf24");
    root.style.setProperty("--accent-hover", "#f59e0b");
    root.style.setProperty("--accent-muted", "#78350f");
    root.style.setProperty("--accent-rgb", "251, 191, 36");
    root.style.setProperty("--success-bg", "#064e3b");
    root.style.setProperty("--success-text", "#34d399");
    root.style.setProperty("--success-hover", "#065f46");
    root.style.setProperty("--success-muted", "#064e3b");
    root.style.setProperty("--error-bg", "#7f1d1d");
    root.style.setProperty("--error-text", "#f87171");
    root.style.setProperty("--error-hover", "#991b1b");
    root.style.setProperty("--error-muted", "#7f1d1d");
    root.style.setProperty("--warning-bg", "#78350f");
    root.style.setProperty("--warning-text", "#fbbf24");
    root.style.setProperty("--warning-hover", "#92400e");
    root.style.setProperty("--warning-muted", "#78350f");
    root.style.setProperty("--info-bg", "#1e3a8a");
    root.style.setProperty("--info-text", "#60a5fa");
    root.style.setProperty("--info-hover", "#1e40af");
    root.style.setProperty("--info-muted", "#1e3a8a");
  } else {
    root.style.setProperty("--bg-primary", "#f3f4f6");
    root.style.setProperty("--bg-secondary", "#ffffff");
    root.style.setProperty("--bg-tertiary", "#f9fafb");
    root.style.setProperty("--text-primary", "#111827");
    root.style.setProperty("--text-secondary", "#4b5563");
    root.style.setProperty("--text-tertiary", "#6b7280");
    root.style.setProperty("--border-color", "#e5e7eb");
    root.style.setProperty("--hover-color", "#f3f4f6");
    root.style.setProperty("--accent-color", "#fbbf24");
    root.style.setProperty("--accent-hover", "#f59e0b");
    root.style.setProperty("--accent-muted", "#fff7ed");
    root.style.setProperty("--accent-rgb", "251, 191, 36");
    root.style.setProperty("--success-bg", "#ecfdf5");
    root.style.setProperty("--success-text", "#059669");
    root.style.setProperty("--success-hover", "#dcfce7");
    root.style.setProperty("--success-muted", "#f0fdf4");
    root.style.setProperty("--error-bg", "#fef2f2");
    root.style.setProperty("--error-text", "#dc2626");
    root.style.setProperty("--error-hover", "#fee2e2");
    root.style.setProperty("--error-muted", "#fef2f2");
    root.style.setProperty("--warning-bg", "#fffbeb");
    root.style.setProperty("--warning-text", "#d97706");
    root.style.setProperty("--warning-hover", "#fef3c7");
    root.style.setProperty("--warning-muted", "#fffbeb");
    root.style.setProperty("--info-bg", "#eff6ff");
    root.style.setProperty("--info-text", "#2563eb");
    root.style.setProperty("--info-hover", "#dbeafe");
    root.style.setProperty("--info-muted", "#eff6ff");
  }
};

function App() {
  const [authModalType, setAuthModalType] = useState<
    "login" | "register" | null
  >(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check local storage first
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    // Fall back to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const { login, register } = useAuth();

  useEffect(() => {
    const updateHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    updateHeight();

    window.addEventListener("resize", updateHeight);
    window.addEventListener("orientationchange", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
      window.removeEventListener("orientationchange", updateHeight);
    };
  }, []);

  // Handle theme changes
  useEffect(() => {
    setThemeColors(isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");

    // Update body class for global styling
    document.body.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const handleAuth = async (
    username: string,
    password: string,
    email?: string
  ) => {
    try {
      if (authModalType === "login") {
        await login(username, password);
        analyticsService.trackLogin("regular");
      } else if (authModalType === "register") {
        if (!email) {
          throw new Error("Email is required for registration");
        }
        await register(username, password, email);
        analyticsService.trackRegistration();
      }
      setIsAuthModalOpen(false);
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  const handleOpenAuthModal = (authType: "login" | "register") => {
    setIsAuthModalOpen(true);
    setAuthModalType(authType);
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    analyticsService.trackThemeToggle(newTheme ? "dark" : "light");
  };

  return (
    <BrowserRouter>
      <AnalyticsWrapper>
        <FingerprintWrapper>
          <EmailVerificationWrapper>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: isDarkMode ? "var(--bg-secondary)" : "#333",
                  color: isDarkMode ? "var(--text-primary)" : "#fff",
                },
                success: {
                  duration: 3000,
                  style: {
                    background: "var(--success-bg)",
                    color: "var(--success-text)",
                  },
                },
                error: {
                  duration: 4000,
                  style: {
                    background: "var(--error-bg)",
                    color: "var(--error-text)",
                  },
                },
              }}
            />
            <div
              className="min-h-screen flex flex-col transition-colors duration-200"
              style={{
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            >
              <Header
                onOpenAuth={handleOpenAuthModal}
                isDarkMode={isDarkMode}
                onToggleTheme={toggleTheme}
              />
              <main
                className="flex-1 mx-auto w-full p-4"
                style={{ maxWidth: "95rem" }}
              >
                <Routes>
                  <Route path="/" element={<GameContainer />} />
                  <Route path="/oda/:slug" element={<GameContainer />} />
                  <Route path="/iletisim" element={<Contact />} />
                  <Route
                    path="/email-dogrula"
                    element={<EmailVerification />}
                  />
                  <Route path="/sozlesmeler" element={<Terms />} />
                </Routes>
              </main>
              <Footer />
              <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                type={authModalType || "login"}
                onAuth={handleAuth}
              />
            </div>
          </EmailVerificationWrapper>
        </FingerprintWrapper>
      </AnalyticsWrapper>
    </BrowserRouter>
  );
}

export default App;
