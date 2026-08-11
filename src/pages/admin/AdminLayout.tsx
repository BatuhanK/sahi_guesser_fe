import {
  ArrowLeft,
  LayoutDashboard,
  Megaphone,
  Menu,
  Radio,
  Settings,
  Tags,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Loader } from "../../components/ui/Loader";
import { useAuth } from "../../hooks/useAuth";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../store/authStore";
import { AdminAnnouncements } from "./AdminAnnouncements";
import { AdminAppConfig } from "./AdminAppConfig";
import { AdminCategories } from "./AdminCategories";
import { AdminDashboard } from "./AdminDashboard";
import { AdminLive } from "./AdminLive";
import { AdminPlayers } from "./AdminPlayers";

const NAV_ITEMS = [
  { to: "/admin", label: "Genel Bakış", icon: LayoutDashboard, end: true },
  { to: "/admin/canli", label: "Canlı İzleme", icon: Radio, end: false },
  { to: "/admin/oyuncular", label: "Oyuncular", icon: Users, end: false },
  { to: "/admin/duyurular", label: "Duyurular", icon: Megaphone, end: false },
  { to: "/admin/kategoriler", label: "Kategoriler", icon: Tags, end: false },
  { to: "/admin/ayarlar", label: "Uygulama Ayarları", icon: Settings, end: false },
];

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Genel Bakış",
  "/admin/canli": "Canlı İzleme",
  "/admin/oyuncular": "Oyuncular",
  "/admin/duyurular": "Duyurular",
  "/admin/kategoriler": "Kategoriler",
  "/admin/ayarlar": "Uygulama Ayarları",
};

export function AdminLayout() {
  const { user } = useAuth();
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // token var ama user henüz yüklenmediyse auth hâlâ yükleniyor demektir.
  const isAuthLoading = !!token && !user;
  const isAdmin = !!user && user.role === "admin";

  useEffect(() => {
    if (!isAuthLoading && !isAdmin) {
      toast.error("Yetkiniz yok");
      navigate("/", { replace: true });
    }
  }, [isAuthLoading, isAdmin, navigate]);

  // Mobil menü rota değişiminde kapansın.
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <Loader text="Yükleniyor..." />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const pageTitle = PAGE_TITLES[location.pathname] ?? "Yönetim";

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5 border-b border-[var(--border-color)]">
        <span className="text-lg font-extrabold tracking-tight text-[var(--text-primary)]">
          Yönetim Paneli
        </span>
        {!isDesktop && (
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="icon-btn"
            aria-label="Menüyü kapat"
          >
            <X size={20} />
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--accent-muted)] text-[var(--accent-color)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--hover-color)] hover:text-[var(--text-primary)]"
              )
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Masaüstü kenar çubuğu */}
      {isDesktop && (
        <aside className="w-64 shrink-0 border-r border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <div className="sticky top-0 h-screen">{sidebarContent}</div>
        </aside>
      )}

      {/* Mobil kenar çubuğu */}
      {!isDesktop && isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside className="relative z-10 w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)]">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 lg:px-8">
          {!isDesktop && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="icon-btn"
              aria-label="Menüyü aç"
            >
              <Menu size={20} />
            </button>
          )}
          <h1 className="text-lg font-bold text-[var(--text-primary)] flex-1 truncate">
            {pageTitle}
          </h1>
          <Link to="/" className="btn-ghost !px-4 !py-2 text-sm">
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Siteye Dön</span>
          </Link>
        </header>

        <main className="flex-1 p-4 lg:p-8 min-w-0">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="canli" element={<AdminLive />} />
            <Route path="oyuncular" element={<AdminPlayers />} />
            <Route path="duyurular" element={<AdminAnnouncements />} />
            <Route path="kategoriler" element={<AdminCategories />} />
            <Route path="ayarlar" element={<AdminAppConfig />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
