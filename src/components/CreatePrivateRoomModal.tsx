import {
  ClockIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  LinkIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { Bike, Car, Home, LucideIcon, ShoppingBasket } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Category,
  CreatePrivateRoomRequest,
  Room,
  roomApi,
} from "../services/api";
import { socketService } from "../services/socket";
import { useGameStore } from "../store/gameStore";

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  car: Car,
  letgo: ShoppingBasket,
  motocycle: Bike,
};

interface CreatePrivateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-full max-w-md relative"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Oda Oluşturuldu!
              </h2>

              <div className="flex justify-center">
                <QRCodeSVG value={roomUrl} size={180} />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Oda bağlantısı:</p>
                <div className="flex items-center justify-center space-x-2">
                  <input
                    type="text"
                    value={roomUrl}
                    readOnly
                    className="bg-gray-50 px-4 py-2 rounded-lg text-sm w-full"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <LinkIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <motion.button
                  onClick={onPlay}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 font-medium shadow-lg shadow-yellow-200"
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
}) => {
  const [formData, setFormData] = useState<CreatePrivateRoomRequest>({
    categoryIds: [],
    roundDurationSeconds: 60,
    maxGuessesPerRound: 10,
    minPrice: undefined,
    maxPrice: undefined,
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [createdRoom, setCreatedRoom] = useState<Room | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validateForm = (): string | null => {
    if (formData.categoryIds.length === 0) {
      return "En az bir kategori seçmelisiniz";
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

    return null;
  };

  const redirectToRoom = (roomData: Room) => {
    useGameStore.getState().setRoom(roomData);
    useGameStore.getState().setRoomId(roomData.id);
    navigate(`/oda/${roomData.slug}`);

    setTimeout(() => {
      socketService.joinRoom(roomData.id);
    }, 100);
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
      const response = await roomApi.create(formData);
      setCreatedRoom(response);
      setShowSuccessModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayClick = () => {
    if (createdRoom) {
      redirectToRoom(createdRoom);
      setShowSuccessModal(false);
      onClose();
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <h2 className="text-3xl font-bold mb-8 text-gray-800">
              Özel Oda Oluştur
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-lg font-medium mb-4 text-gray-700">
                  Kategoriler
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((category) => {
                    const IconComponent = category.icon
                      ? iconMap[category.icon.toLowerCase()] || Home
                      : Home;

                    return (
                      <motion.label
                        key={category.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                          formData.categoryIds.includes(category.id)
                            ? "border-yellow-400 bg-yellow-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.categoryIds.includes(category.id)}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              categoryIds: e.target.checked
                                ? [...prev.categoryIds, category.id]
                                : prev.categoryIds.filter(
                                    (id) => id !== category.id
                                  ),
                              minPrice: undefined,
                              maxPrice: undefined,
                            }));
                          }}
                          className="hidden"
                        />
                        <IconComponent size={24} className="text-yellow-400" />
                        <span className="font-medium text-gray-700">
                          {category.name}
                        </span>
                      </motion.label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-gray-700 font-medium">
                    <ClockIcon className="w-5 h-5 text-yellow-500" />
                    <span>Tur Süresi (saniye)</span>
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={120}
                    value={formData.roundDurationSeconds}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        roundDurationSeconds: parseInt(e.target.value),
                      }))
                    }
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-gray-700 font-medium">
                    <LightBulbIcon className="w-5 h-5 text-yellow-500" />
                    <span>Tur Başına Maksimum Tahmin</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={formData.maxGuessesPerRound}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxGuessesPerRound: parseInt(e.target.value),
                      }))
                    }
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
                  />
                </div>

                <AnimatePresence>
                  {formData.categoryIds.length === 1 && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="space-y-2"
                      >
                        <label className="flex items-center space-x-2 text-gray-700 font-medium">
                          <CurrencyDollarIcon className="w-5 h-5 text-yellow-500" />
                          <span>Minimum Fiyat</span>
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={formData.minPrice ?? ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              minPrice:
                                e.target.value === ""
                                  ? undefined
                                  : parseInt(e.target.value),
                            }))
                          }
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
                          required
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="space-y-2"
                      >
                        <label className="flex items-center space-x-2 text-gray-700 font-medium">
                          <CurrencyDollarIcon className="w-5 h-5 text-yellow-500" />
                          <span>Maksimum Fiyat</span>
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={formData.maxPrice ?? ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              maxPrice:
                                e.target.value === ""
                                  ? undefined
                                  : parseInt(e.target.value),
                            }))
                          }
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
                          required
                        />
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium rounded-lg"
                  disabled={loading}
                >
                  İptal
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 disabled:opacity-50 font-medium shadow-lg shadow-yellow-200"
                  disabled={loading}
                >
                  {loading ? "Oluşturuluyor..." : "Oluştur"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
