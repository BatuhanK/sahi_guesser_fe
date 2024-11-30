import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { AuthModal } from "./components/auth/AuthModals";
import { GameContainer } from "./components/game/GameContainer";
import { Header } from "./components/layout/Header";
import { useAuth } from "./hooks/useAuth";

function App() {
  const [authModalType, setAuthModalType] = useState<"login" | "register" | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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

  const handleAuth = async (username: string, password: string) => {
    try {
      if (authModalType === "login") {
        await login(username, password);
      } else if (authModalType === "register") {
        await register(username, password);
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

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#333",
            color: "#fff",
          },
          success: {
            duration: 3000,
          },
          error: {
            duration: 4000,
          },
        }}
      />
      <div className="min-h-screen bg-gray-100">
        <Header onOpenAuth={handleOpenAuthModal} />

        <main className="mx-auto p-4" style={{ maxWidth: '90rem' }}>
          <GameContainer />
        </main>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          type={authModalType || "login"}
          onAuth={handleAuth}
        />
      </div>
    </>
  );
}

export default App;
