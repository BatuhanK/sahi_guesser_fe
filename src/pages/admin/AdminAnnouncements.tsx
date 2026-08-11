import { Megaphone, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/Dialog";
import {
  adminApi,
  type AdminAnnouncement,
  type AdminAnnouncementType,
} from "../../services/api";
import {
  AdminBadge,
  AdminField,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  AdminToggle,
  ConfirmDialog,
  type BadgeTone,
} from "./components";
import { formatDateTime } from "./utils";

const TYPE_META: Record<string, { label: string; tone: BadgeTone }> = {
  info: { label: "Bilgi", tone: "info" },
  warning: { label: "Uyarı", tone: "warning" },
  success: { label: "Başarı", tone: "success" },
  error: { label: "Hata", tone: "error" },
};

interface FormState {
  title: string;
  content: string;
  type: AdminAnnouncementType;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  title: "",
  content: "",
  type: "info",
  isActive: true,
};

export function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const [editing, setEditing] = useState<AdminAnnouncement | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminAnnouncement | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const data = await adminApi.getAnnouncements();
        if (!cancelled) {
          setAnnouncements(data);
        }
      } catch (error) {
        console.error("Duyurular yüklenemedi:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const refetch = () => setReloadKey((key) => key + 1);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEdit = (announcement: AdminAnnouncement) => {
    setEditing(announcement);
    setForm({
      title: announcement.title,
      content: announcement.content,
      type: (announcement.type as AdminAnnouncementType) || "info",
      isActive: announcement.isActive,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Başlık ve içerik zorunludur");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editing) {
        await adminApi.updateAnnouncement(editing.id, form);
        toast.success("Duyuru güncellendi");
      } else {
        await adminApi.createAnnouncement({
          title: form.title.trim(),
          content: form.content.trim(),
          type: form.type,
          isActive: form.isActive,
        });
        toast.success("Duyuru oluşturuldu");
      }
      setIsFormOpen(false);
      refetch();
    } catch (error) {
      console.error("Duyuru kaydedilemedi:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-tertiary)]">
          Toplam {announcements.length} duyuru
        </p>
        <button onClick={openCreate} className="btn-accent !px-5 !py-2 text-sm">
          <Plus size={16} />
          Yeni Duyuru
        </button>
      </div>

      {isLoading ? (
        <div className="surface-card p-10 text-center text-[var(--text-tertiary)]">
          Yükleniyor...
        </div>
      ) : announcements.length === 0 ? (
        <div className="surface-card p-10 flex flex-col items-center gap-3 text-center">
          <Megaphone className="w-10 h-10 text-[var(--text-tertiary)]" />
          <p className="text-[var(--text-secondary)]">Henüz duyuru yok.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => {
            const typeMeta = TYPE_META[announcement.type] ?? TYPE_META.info;
            return (
              <div key={announcement.id} className="surface-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-[var(--text-primary)]">
                        {announcement.title}
                      </h3>
                      <AdminBadge tone={typeMeta.tone}>{typeMeta.label}</AdminBadge>
                      <AdminBadge tone={announcement.isActive ? "success" : "neutral"}>
                        {announcement.isActive ? "Aktif" : "Pasif"}
                      </AdminBadge>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      Oluşturulma: {formatDateTime(announcement.createdAt)} ·
                      Güncelleme: {formatDateTime(announcement.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(announcement)}
                      className="icon-btn"
                      aria-label="Düzenle"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(announcement)}
                      className="icon-btn hover:!text-[var(--error-text)]"
                      aria-label="Sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Oluştur / düzenle dialogu */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) setIsFormOpen(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Duyuruyu Düzenle" : "Yeni Duyuru"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <AdminField label="Başlık">
              <AdminInput
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Duyuru başlığı"
              />
            </AdminField>
            <AdminField label="İçerik">
              <AdminTextarea
                rows={5}
                value={form.content}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, content: event.target.value }))
                }
                placeholder="Duyuru içeriği"
              />
            </AdminField>
            <div className="flex items-center gap-4">
              <AdminField label="Tip">
                <AdminSelect
                  value={form.type}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      type: event.target.value as AdminAnnouncementType,
                    }))
                  }
                >
                  <option value="info">Bilgi</option>
                  <option value="warning">Uyarı</option>
                  <option value="success">Başarı</option>
                  <option value="error">Hata</option>
                </AdminSelect>
              </AdminField>
              <div className="flex items-center gap-2 pt-6">
                <AdminToggle
                  checked={form.isActive}
                  onChange={(checked) =>
                    setForm((prev) => ({ ...prev, isActive: checked }))
                  }
                />
                <span className="text-sm text-[var(--text-secondary)]">Aktif</span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setIsFormOpen(false)}
              className="btn-ghost"
              disabled={isSubmitting}
            >
              Vazgeç
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-accent disabled:opacity-50"
            >
              {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Silme onayı */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await adminApi.deleteAnnouncement(deleteTarget.id);
          toast.success("Duyuru silindi");
          refetch();
        }}
        title="Duyuruyu sil"
        description={`"${deleteTarget?.title ?? ""}" duyurusu kalıcı olarak silinecek. Onaylıyor musunuz?`}
        confirmLabel="Sil"
        danger
      />
    </div>
  );
}
