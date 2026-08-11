import { Ban, ChevronLeft, ChevronRight, Search, ShieldOff } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/Dialog";
import {
  adminApi,
  type AdminRole,
  type AdminUser,
  type AdminUsersResponse,
} from "../../services/api";
import {
  AdminBadge,
  AdminField,
  AdminInput,
  AdminSelect,
  ConfirmDialog,
} from "./components";
import { formatDateTime } from "./utils";

const PAGE_SIZE = 15;

const ROLE_LABELS: Record<string, string> = {
  user: "Kullanıcı",
  admin: "Admin",
  moderator: "Moderatör",
  junior_moderator: "Junior Moderatör",
};

const ROLE_OPTIONS: AdminRole[] = [
  "user",
  "admin",
  "moderator",
  "junior_moderator",
];

export function AdminPlayers() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [bannedFilter, setBannedFilter] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminUsersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
  const [banMinutes, setBanMinutes] = useState("");
  const [isBanSubmitting, setIsBanSubmitting] = useState(false);
  const [unbanTarget, setUnbanTarget] = useState<AdminUser | null>(null);

  // Arama girdisini 400ms debounce ile sorguya bağla.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await adminApi.getUsers({
          search: debouncedSearch || undefined,
          role: roleFilter || undefined,
          banned:
            bannedFilter === "" ? undefined : bannedFilter === "banned",
          page,
          limit: PAGE_SIZE,
        });
        if (!cancelled) {
          setData(response);
        }
      } catch (error) {
        console.error("Kullanıcılar yüklenemedi:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchUsers();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, roleFilter, bannedFilter, page, reloadKey]);

  const refetch = () => setReloadKey((key) => key + 1);

  const handleRoleChange = async (user: AdminUser, role: AdminRole) => {
    try {
      await adminApi.updateUserRole(user.id, role);
      toast.success(`${user.username} rolü güncellendi`);
      refetch();
    } catch (error) {
      console.error("Rol güncellenemedi:", error);
    }
  };

  const handleBan = async () => {
    if (!banTarget) return;
    setIsBanSubmitting(true);
    try {
      const minutes = banMinutes.trim() === "" ? null : Number(banMinutes);
      await adminApi.banUser(banTarget.id, minutes);
      toast.success(
        minutes === null
          ? `${banTarget.username} süresiz banlandı`
          : `${banTarget.username} ${minutes} dakika banlandı`
      );
      setBanTarget(null);
      setBanMinutes("");
      refetch();
    } catch (error) {
      console.error("Ban işlemi başarısız:", error);
    } finally {
      setIsBanSubmitting(false);
    }
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="space-y-4">
      {/* Filtreler */}
      <div className="surface-card p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
          />
          <AdminInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Kullanıcı adı veya e-posta ara..."
            className="!pl-9"
          />
        </div>
        <AdminSelect
          value={roleFilter}
          onChange={(event) => {
            setRoleFilter(event.target.value);
            setPage(1);
          }}
        >
          <option value="">Tüm Roller</option>
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </AdminSelect>
        <AdminSelect
          value={bannedFilter}
          onChange={(event) => {
            setBannedFilter(event.target.value);
            setPage(1);
          }}
        >
          <option value="">Tümü</option>
          <option value="banned">Banlı</option>
          <option value="active">Banlı Değil</option>
        </AdminSelect>
      </div>

      {/* Tablo */}
      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-tertiary)] border-b border-[var(--border-color)]">
                <th className="px-5 py-3 font-medium">Kullanıcı Adı</th>
                <th className="px-5 py-3 font-medium">E-posta</th>
                <th className="px-5 py-3 font-medium">Rol</th>
                <th className="px-5 py-3 font-medium">Skor</th>
                <th className="px-5 py-3 font-medium">Premium</th>
                <th className="px-5 py-3 font-medium">Son Çevrimiçi</th>
                <th className="px-5 py-3 font-medium">Durum</th>
                <th className="px-5 py-3 font-medium text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !data ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-[var(--text-tertiary)]">
                    Yükleniyor...
                  </td>
                </tr>
              ) : !data || data.users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-[var(--text-tertiary)]">
                    Kullanıcı bulunamadı.
                  </td>
                </tr>
              ) : (
                data.users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--hover-color)] transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-[var(--text-primary)]">
                      {user.username}
                    </td>
                    <td className="px-5 py-3 text-[var(--text-secondary)]">
                      {user.email ?? "-"}
                    </td>
                    <td className="px-5 py-3">
                      <AdminSelect
                        value={user.role}
                        onChange={(event) =>
                          handleRoleChange(user, event.target.value as AdminRole)
                        }
                        className="!py-1.5 text-xs"
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </option>
                        ))}
                      </AdminSelect>
                    </td>
                    <td className="px-5 py-3 text-[var(--text-secondary)]">
                      {user.score.toLocaleString("tr-TR")}
                    </td>
                    <td className="px-5 py-3">
                      {user.isPremium ? (
                        <AdminBadge tone="accent">Premium</AdminBadge>
                      ) : (
                        <span className="text-[var(--text-tertiary)]">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[var(--text-secondary)] whitespace-nowrap">
                      {formatDateTime(user.lastOnlineAt)}
                    </td>
                    <td className="px-5 py-3">
                      {user.isBanned ? (
                        <AdminBadge tone="error">
                          Banlı
                          {user.bannedUntil
                            ? ` (${formatDateTime(user.bannedUntil)})`
                            : " (Süresiz)"}
                        </AdminBadge>
                      ) : (
                        <AdminBadge tone="success">Aktif</AdminBadge>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {user.isBanned ? (
                          <button
                            onClick={() => setUnbanTarget(user)}
                            className="btn-ghost !px-3 !py-1.5 text-xs"
                          >
                            <ShieldOff size={14} />
                            Banı Kaldır
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setBanTarget(user);
                              setBanMinutes("");
                            }}
                            className="btn-ghost !px-3 !py-1.5 text-xs hover:!border-[var(--error-text)] hover:!text-[var(--error-text)]"
                          >
                            <Ban size={14} />
                            Banla
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Sayfalama */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border-color)]">
          <span className="text-sm text-[var(--text-tertiary)]">
            Toplam {(data?.total ?? 0).toLocaleString("tr-TR")} kullanıcı · Sayfa{" "}
            {page}/{totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn-ghost !px-3 !py-1.5 text-sm disabled:opacity-50"
            >
              <ChevronLeft size={14} />
              Önceki
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn-ghost !px-3 !py-1.5 text-sm disabled:opacity-50"
            >
              Sonraki
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Ban dialogu */}
      <Dialog
        open={banTarget !== null}
        onOpenChange={(open) => {
          if (!open) setBanTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{banTarget?.username} kullanıcısını banla</DialogTitle>
            <DialogDescription>
              Süreyi dakika olarak girin. Boş bırakırsanız kullanıcı süresiz
              banlanır.
            </DialogDescription>
          </DialogHeader>
          <AdminField label="Ban süresi (dakika, boş = süresiz)">
            <AdminInput
              type="number"
              min={1}
              value={banMinutes}
              onChange={(event) => setBanMinutes(event.target.value)}
              placeholder="örn. 60"
            />
          </AdminField>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setBanTarget(null)}
              className="btn-ghost"
              disabled={isBanSubmitting}
            >
              Vazgeç
            </button>
            <button
              onClick={handleBan}
              disabled={isBanSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--error-bg)] px-6 py-2.5 font-semibold text-[var(--error-text)] transition-colors hover:bg-[var(--error-hover)] disabled:opacity-50"
            >
              {isBanSubmitting ? "İşleniyor..." : "Banla"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban kaldırma onayı */}
      <ConfirmDialog
        open={unbanTarget !== null}
        onClose={() => setUnbanTarget(null)}
        onConfirm={async () => {
          if (!unbanTarget) return;
          await adminApi.unbanUser(unbanTarget.id);
          toast.success(`${unbanTarget.username} banı kaldırıldı`);
          refetch();
        }}
        title="Banı kaldır"
        description={`${unbanTarget?.username ?? ""} kullanıcısının banı kaldırılacak. Onaylıyor musunuz?`}
        confirmLabel="Banı Kaldır"
      />
    </div>
  );
}
