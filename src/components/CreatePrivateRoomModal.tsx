import {
  ClockIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  LinkIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  Category,
  CreatePrivateRoomRequest,
  Room,
  roomApi,
} from "../services/api";
import { iconMap } from "./ui/iconmap";

interface CreatePrivateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  defaultPublic?: boolean;
}

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomData: Room;
  onPlay: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  roomData,
  onPlay,
}) => {
  const roomUrl = `${window.location.origin}/oda/${roomData.slug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomUrl);
    toast.success("Oda bağlantısı kopyalandı!");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[var(--bg-secondary)] rounded-xl p-6 w-full max-w-md relative"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                Oda Oluşturuldu!
              </h2>

              <div className="flex justify-center">
                <div className="p-4 bg-[var(--bg-primary)] rounded-lg">
                  <QRCodeSVG value={roomUrl} size={180} />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-[var(--text-secondary)]">
                  Oda bağlantısı:
                </p>
                <div className="flex items-center justify-center space-x-2">
                  <input
                    type="text"
                    value={roomUrl}
                    readOnly
                    className="bg-[var(--bg-tertiary)] text-[var(--text-primary)] px-4 py-2 rounded-lg text-sm w-full border border-[var(--border-color)]"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-[var(--hover-color)] rounded-lg transition-colors text-[var(--text-secondary)]"
                  >
                    <LinkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <motion.button
                  onClick={onPlay}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 bg-[var(--accent-color)] text-white rounded-lg hover:bg-[var(--accent-hover)] font-medium shadow-lg"
                >
                  Oyuna Başla
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const CreatePrivateRoomModal: React.FC<CreatePrivateRoomModalProps> = ({
  isOpen,
  onClose,
  categories,
  defaultPublic = false,
}) => {
  const [formData, setFormData] = useState<CreatePrivateRoomRequest>({
    categoryIds: [],
    roundDurationSeconds: 60,
    maxGuessesPerRound: 10,
    minPrice: undefined,
    maxPrice: undefined,
    roundCount: 20,
  });

  const [isPublic, setIsPublic] = useState(defaultPublic);
  const [publicData, setPublicData] = useState({
    maxPlayers: 10,
    publicName: "",
    publicDescription: "",
  });

  const [loading, setLoading] = useState(false);
  const [createdRoom, setCreatedRoom] = useState<Room | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validateForm = (): string | null => {
    if (formData.categoryIds.length === 0) {
      return "En az bir kategori seçmelisiniz";
    }

    const selectedCategories = categories.filter((cat) =>
      formData.categoryIds.includes(cat.id)
    );
    const hasRental = selectedCategories.some(
      (cat) => cat.slug === "kiralik-evler"
    );
    const hasSale = selectedCategories.some(
      (cat) => cat.slug === "satilik-evler"
    );

    if (hasRental && hasSale) {
      return "Henüz satılık ve kiralık evler aynı anda seçilemiyor";
    }

    if (
      formData.roundDurationSeconds < 10 ||
      formData.roundDurationSeconds > 120
    ) {
      return "Tur süresi 10-120 saniye arasında olmalıdır";
    }

    if (formData.maxGuessesPerRound < 1 || formData.maxGuessesPerRound > 50) {
      return "Tur başına tahmin sayısı 1-50 arasında olmalıdır";
    }

    if (formData.roundCount < 10 || formData.roundCount > 50) {
      return "Tur sayısı 10-50 arasında olmalıdır";
    }

    if (formData.categoryIds.length === 1) {
      if (formData.minPrice === undefined || formData.maxPrice === undefined) {
        return "Tek kategori seçiminde minimum ve maximum fiyat zorunludur";
      }

      if (formData.minPrice < 0) {
        return "Minimum fiyat 0'dan küçük olamaz";
      }

      if (formData.maxPrice <= formData.minPrice) {
        return "Maksimum fiyat minimum fiyattan büyük olmalıdır";
      }
    } else if (
      formData.minPrice !== undefined ||
      formData.maxPrice !== undefined
    ) {
      return "Birden fazla kategori seçiminde fiyat filtreleri kullanılamaz";
    }

    if (isPublic) {
      if (publicData.maxPlayers < 2 || publicData.maxPlayers > 50) {
        return "Maksimum oyuncu sayısı 2-50 arasında olmalıdır";
      }

      if (publicData.publicName.length < 3) {
        return "Oda adı en az 3 karakter olmalıdır";
      }

      if (publicData.publicDescription.length < 10) {
        return "Oda açıklaması en az 10 karakter olmalıdır";
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setLoading(true);
      if (isPublic) {
        const response = await roomApi.createPublic({
          ...formData,
          ...publicData,
        });
        setCreatedRoom(response);
      } else {
        const response = await roomApi.create(formData);
        setCreatedRoom(response);
      }
      setShowSuccessModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayClick = () => {
    if (createdRoom) {
      setTimeout(() => {
        window.location.replace(`/oda/${createdRoom.slug}`);
      }, 100);
    }
  };

  if (showSuccessModal && createdRoom) {
    return (
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        roomData={createdRoom}
        onPlay={handlePlayClick}
      />
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[var(--bg-secondary)] rounded-xl p-6 w-full max-w-2xl relative overflow-y-auto max-h-[90vh]"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">
              {isPublic ? "Açık Oda Oluştur" : "Özel Oda Oluştur"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)]">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-medium text-[var(--text-primary)]">Dışarıya açık olsun</div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      Diğer oyuncular odanızı görebilir ve katılabilir
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-5 h-5 rounded border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--accent-color)]"
                  />
                </label>
              </div>

              {isPublic && (
                <div className="space-y-4 p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-color)]">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-[var(--text-primary)]">
                      Oda Adı
                    </label>
                    <input
                      type="text"
                      value={publicData.publicName}
                      onChange={(e) =>
                        setPublicData({
                          ...publicData,
                          publicName: e.target.value,
                        })
                      }
                      placeholder="Örn: Hızlı Oyun"
                      className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                      minLength={3}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-[var(--text-primary)]">
                      Oda Açıklaması
                    </label>
                    <textarea
                      value={publicData.publicDescription}
                      onChange={(e) =>
                        setPublicData({
                          ...publicData,
                          publicDescription: e.target.value,
                        })
                      }
                      placeholder="Oda hakkında kısa bir açıklama yazın"
                      className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] resize-none"
                      rows={3}
                      minLength={10}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-[var(--text-primary)]">
                      Maksimum Oyuncu Sayısı
                    </label>
                    <input
                      type="number"
                      value={publicData.maxPlayers}
                      onChange={(e) =>
                        setPublicData({
                          ...publicData,
                          maxPlayers: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                      min={2}
                      max={50}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block mb-2 font-medium text-[var(--text-primary)]">
                  Kategoriler
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.map((category) => {
                    const Icon = category.icon && iconMap[category.icon];
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => {
                          const newCategoryIds = formData.categoryIds.includes(
                            category.id
                          )
                            ? formData.categoryIds.filter(
                                (id) => id !== category.id
                              )
                            : [...formData.categoryIds, category.id];

                          setFormData({
                            ...formData,
                            categoryIds: newCategoryIds,
                            minPrice:
                              newCategoryIds.length !== 1
                                ? undefined
                                : formData.minPrice,
                            maxPrice:
                              newCategoryIds.length !== 1
                                ? undefined
                                : formData.maxPrice,
                          });
                        }}
                        className={`flex items-center gap-2 p-3 rounded-xl border ${
                          formData.categoryIds.includes(category.id)
                            ? "border-[var(--accent-color)] bg-[var(--accent-muted)] text-[var(--accent-color)]"
                            : "border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--hover-color)]"
                        } transition-colors`}
                      >
                        {Icon && <Icon className="w-5 h-5" />}
                        <span>{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block mb-3 font-medium text-[var(--text-primary)]">
                    Oyun Ayarları
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-[var(--text-secondary)] mb-2">
                        Tur Sayısı
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.roundCount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              roundCount: parseInt(e.target.value),
                            })
                          }
                          className="w-full pl-9 pr-2 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-center"
                          min={10}
                          max={50}
                        />
                        <ClockIcon className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-[var(--text-secondary)] mb-2">
                        Tur Süresi
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.roundDurationSeconds}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              roundDurationSeconds: parseInt(e.target.value),
                            })
                          }
                          className="w-full pl-9 pr-2 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-center"
                          min={10}
                          max={120}
                        />
                        <ClockIcon className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-[var(--text-secondary)] mb-2">
                        Tahmin Sayısı
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.maxGuessesPerRound}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maxGuessesPerRound: parseInt(e.target.value),
                            })
                          }
                          className="w-full pl-9 pr-2 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-center"
                          min={1}
                          max={50}
                        />
                        <LightBulbIcon className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                      </div>
                    </div>
                  </div>
                </div>

                {formData.categoryIds.length === 1 && (
                  <div>
                    <label className="block mb-3 font-medium text-[var(--text-primary)]">
                      Fiyat Aralığı
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.minPrice}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              minPrice: parseInt(e.target.value),
                            })
                          }
                          placeholder="Min"
                          className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                          min={0}
                        />
                        <CurrencyDollarIcon className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                      </div>

                      <div className="relative">
                        <input
                          type="number"
                          value={formData.maxPrice}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maxPrice: parseInt(e.target.value),
                            })
                          }
                          placeholder="Max"
                          className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                          min={0}
                        />
                        <CurrencyDollarIcon className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 bg-[var(--accent-color)] text-white rounded-lg hover:bg-[var(--accent-hover)] font-medium shadow-lg disabled:opacity-50"
                >
                  {loading ? "Oluşturuluyor..." : "Oda Oluştur"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
