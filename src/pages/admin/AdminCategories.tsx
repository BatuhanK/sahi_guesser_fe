import { Pencil, Plus, Trash2 } from "lucide-react";
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
  type AdminCategory,
} from "../../services/api";
import {
  AdminBadge,
  AdminField,
  AdminInput,
  AdminTextarea,
  AdminToggle,
  ConfirmDialog,
} from "./components";
import { tryParseJson, truncateJson } from "./utils";

interface FormState {
  name: string;
  slug: string;
  icon: string;
  minVersion: string;
  metadataText: string;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  name: "",
  slug: "",
  icon: "",
  minVersion: "",
  metadataText: "",
  isActive: true,
};

export function AdminCategories() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const data = await adminApi.getCategories();
        if (!cancelled) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Kategoriler yüklenemedi:", error);
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

  const openEdit = (category: AdminCategory) => {
    setEditing(category);
    setForm({
      name: category.name,
      slug: category.slug ?? "",
      icon: category.icon ?? "",
      minVersion: category.minVersion ?? "",
      metadataText:
        category.metadata != null
          ? JSON.stringify(category.metadata, null, 2)
          : "",
      isActive: category.isActive,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Kategori adı zorunludur");
      return;
    }
    let metadata: unknown = undefined;
    if (form.metadataText.trim() !== "") {
      const parsed = tryParseJson(form.metadataText);
      if (!parsed.ok) {
        toast.error("Metadata geçerli bir JSON olmalıdır");
        return;
      }
      metadata = parsed.value;
    }

    setIsSubmitting(true);
    try {
      if (editing) {
        await adminApi.updateCategory(editing.id, {
          name: form.name.trim(),
          icon: form.icon.trim() || undefined,
          isActive: form.isActive,
          minVersion: form.minVersion.trim() || undefined,
          metadata,
        });
        toast.success("Kategori güncellendi");
      } else {
        await adminApi.createCategory({
          name: form.name.trim(),
          slug: form.slug.trim() || undefined,
          icon: form.icon.trim() || undefined,
          minVersion: form.minVersion.trim() || undefined,
          metadata,
        });
        toast.success("Kategori oluşturuldu");
      }
      setIsFormOpen(false);
      refetch();
    } catch (error) {
      console.error("Kategori kaydedilemedi:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (category: AdminCategory, isActive: boolean) => {
    try {
      await adminApi.updateCategory(category.id, { isActive });
      setCategories((prev) =>
        prev.map((item) => (item.id === category.id ? { ...item, isActive } : item))
      );
      toast.success(isActive ? "Kategori aktifleştirildi" : "Kategori pasifleştirildi");
    } catch (error) {
      console.error("Kategori durumu güncellenemedi:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-tertiary)]">
          Toplam {categories.length} kategori
        </p>
        <button onClick={openCreate} className="btn-accent !px-5 !py-2 text-sm">
          <Plus size={16} />
          Yeni Kategori
        </button>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-tertiary)] border-b border-[var(--border-color)]">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">İkon</th>
                <th className="px-5 py-3 font-medium">Ad</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium">Min. Sürüm</th>
                <th className="px-5 py-3 font-medium">Metadata</th>
                <th className="px-5 py-3 font-medium">Aktif</th>
                <th className="px-5 py-3 font-medium text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-[var(--text-tertiary)]">
                    Yükleniyor...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-[var(--text-tertiary)]">
                    Kategori bulunamadı.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--hover-color)] transition-colors"
                  >
                    <td className="px-5 py-3 text-[var(--text-tertiary)]">
                      {category.id}
                    </td>
                    <td className="px-5 py-3 text-[var(--text-secondary)]">
                      {category.icon ?? "-"}
                    </td>
                    <td className="px-5 py-3 font-medium text-[var(--text-primary)]">
                      {category.name}
                      {!category.isActive && (
                        <AdminBadge tone="neutral" className="ml-2">
                          Pasif
                        </AdminBadge>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[var(--text-secondary)]">
                      {category.slug}
                    </td>
                    <td className="px-5 py-3 text-[var(--text-secondary)]">
                      {category.minVersion ?? "-"}
                    </td>
                    <td className="px-5 py-3 text-[var(--text-tertiary)] max-w-[12rem] truncate">
                      {category.metadata != null
                        ? truncateJson(category.metadata, 40)
                        : "-"}
                    </td>
                    <td className="px-5 py-3">
                      <AdminToggle
                        checked={category.isActive}
                        onChange={(checked) => handleToggleActive(category, checked)}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(category)}
                          className="icon-btn"
                          aria-label="Düzenle"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(category)}
                          className="icon-btn hover:!text-[var(--error-text)]"
                          aria-label="Sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
              {editing ? "Kategoriyi Düzenle" : "Yeni Kategori"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <AdminField label="Ad">
              <AdminInput
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Kategori adı"
              />
            </AdminField>
            {!editing && (
              <AdminField label="Slug (opsiyonel, boş bırakılırsa otomatik)">
                <AdminInput
                  value={form.slug}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, slug: event.target.value }))
                  }
                  placeholder="ornek-kategori"
                />
              </AdminField>
            )}
            <div className="grid grid-cols-2 gap-4">
              <AdminField label="İkon (opsiyonel)">
                <AdminInput
                  value={form.icon}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, icon: event.target.value }))
                  }
                  placeholder="car"
                />
              </AdminField>
              <AdminField label="Min. Sürüm (opsiyonel)">
                <AdminInput
                  value={form.minVersion}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      minVersion: event.target.value,
                    }))
                  }
                  placeholder="1.0.0"
                />
              </AdminField>
            </div>
            <AdminField label="Metadata (JSON, opsiyonel)">
              <AdminTextarea
                rows={4}
                value={form.metadataText}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    metadataText: event.target.value,
                  }))
                }
                placeholder='{"key": "value"}'
                className="font-mono text-xs"
              />
            </AdminField>
            <div className="flex items-center gap-2">
              <AdminToggle
                checked={form.isActive}
                onChange={(checked) =>
                  setForm((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <span className="text-sm text-[var(--text-secondary)]">Aktif</span>
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
          try {
            await adminApi.deleteCategory(deleteTarget.id);
            toast.success("Kategori silindi");
            refetch();
          } catch (error) {
            // Sunucu 409 dönerse (bağlı kayıtlar) interceptor mesajı gösterir.
            console.error("Kategori silinemedi:", error);
            throw error;
          }
        }}
        title="Kategoriyi sil"
        description={`"${deleteTarget?.name ?? ""}" kategorisi kalıcı olarak silinecek. Onaylıyor musunuz?`}
        confirmLabel="Sil"
        danger
      />
    </div>
  );
}
