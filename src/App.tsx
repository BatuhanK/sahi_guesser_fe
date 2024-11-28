import { useState } from "react";
import { AuthModal } from "./components/auth/AuthModals";
import { GameContainer } from "./components/game/GameContainer";
import { Header } from "./components/layout/Header";
import { useAuth } from "./hooks/useAuth";

function App() {
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
  const { login, register } = useAuth();

  const handleAuth = async (username: string, password: string) => {
    try {
      if (authModal === "login") {
        await login(username, password);
      } else if (authModal === "register") {
        await register(username, password);
      }
      setAuthModal(null);
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onOpenAuth={setAuthModal} />

      <main className="max-w-6xl mx-auto p-4">
        <GameContainer />
      </main>

      <AuthModal
        isOpen={authModal !== null}
        onClose={() => setAuthModal(null)}
        type={authModal || "login"}
        onAuth={handleAuth}
      />
    </div>
  );
}

export default App;
