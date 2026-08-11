import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { adminApi, type AdminAppConfig } from "../../services/api";
import {
  AdminField,
  AdminInput,
  AdminTextarea,
  ConfirmDialog,
} from "./components";
import { formatDateTime, truncateJson, tryParseJson } from "./utils";

interface FormState {
  key: string;
  valueText: string;
}

const EMPTY_FORM: FormState = { key: "", valueText: "" };

export function AdminAppConfig() {
  const [configs, setConfigs] = useState<AdminAppConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const [editing, setEditing] = useState<AdminAppConfig | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminAppConfig | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const data = await adminApi.getAppConfigs();
        if (!cancelled) {
          setConfigs(data);
        }
      } catch (error) {
        console.error("Uygulama ayarları yüklenemedi:", error);
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

  const openEdit = (config: AdminAppConfig) => {
    setEditing(config);
    setForm({
      key: config.key,
      valueText: JSON.stringify(config.value, null, 2) ?? "",
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!editing && !form.key.trim()) {
      toast.error("Anahtar (key) zorunludur");
      return;
    }
    const parsed = tryParseJson(form.valueText);
    if (!parsed.ok) {
      toast.error("Değer geçerli bir JSON olmalıdır");
      return;
    }

    setIsSubmitting(true);
    try {
      const key = editing ? editing.key : form.key.trim();
      await adminApi.putAppConfig(key, parsed.value);
      toast.success(editing ? "Ayar güncellendi" : "Ayar oluşturuldu");
      setIsFormOpen(false);
      refetch();
    } catch (error) {
      console.error("Ayar kaydedilemedi:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-tertiary)]">
          Toplam {configs.length} ayar
        </p>
        <button onClick={openCreate} className="btn-accent !px-5 !py-2 text-sm">
          <Plus size={16} />
          Yeni Config
        </button>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-tertiary)] border-b border-[var(--border-color)]">
                <th className="px-5 py-3 font-medium">Anahtar</th>
                <th className="px-5 py-3 font-medium">Değer</th>
                <th className="px-5 py-3 font-medium">Güncelleme</th>
                <th className="px-5 py-3 font-medium text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-[var(--text-tertiary)]">
                    Yükleniyor...
                  </td>
                </tr>
              ) : configs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-[var(--text-tertiary)]">
                    Kayıtlı ayar bulunamadı.
                  </td>
                </tr>
              ) : (
                configs.map((config) => (
                  <tr
                    key={config.key}
                    className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--hover-color)] transition-colors"
                  >
                    <td className="px-5 py-3 font-mono text-xs font-medium text-[var(--text-primary)]">
                      {config.key}
                    </td>
                    <td className="px-5 py-3 text-[var(--text-secondary)] max-w-[24rem] truncate font-mono text-xs">
                      {truncateJson(config.value, 80)}
                    </td>
                    <td className="px-5 py-3 text-[var(--text-secondary)] whitespace-nowrap">
                      {formatDateTime(config.updatedAt)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(config)}
                          className="icon-btn"
                          aria-label="Düzenle"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(config)}
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
            <DialogTitle>{editing ? "Ayarı Düzenle" : "Yeni Config"}</DialogTitle>
            <DialogDescription>
              Değer JSON formatında olmalıdır (örn. {"true"}, {"123"}, {'{"a":1}'},{" "}
              {'"metin"'}).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <AdminField label="Anahtar (key)">
              <AdminInput
                value={form.key}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, key: event.target.value }))
                }
                placeholder="maintenance_mode"
                disabled={!!editing}
                className="font-mono text-xs disabled:opacity-60"
              />
            </AdminField>
            <AdminField label="Değer (JSON)">
              <AdminTextarea
                rows={8}
                value={form.valueText}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, valueText: event.target.value }))
                }
                placeholder='{"enabled": true}'
                className="font-mono text-xs"
              />
            </AdminField>
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
          await adminApi.deleteAppConfig(deleteTarget.key);
          toast.success("Ayar silindi");
          refetch();
        }}
        title="Ayarı sil"
        description={`"${deleteTarget?.key ?? ""}" anahtarı kalıcı olarak silinecek. Onaylıyor musunuz?`}
        confirmLabel="Sil"
        danger
      />
    </div>
  );
}
