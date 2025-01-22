import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./Dialog";

interface RoomFullModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoomFullModal: React.FC<RoomFullModalProps> = ({
  isOpen,
  onClose,
}) => {
  console.log("RoomFullModal props:", { isOpen });
  const navigate = useNavigate();

  const handleClose = () => {
    onClose();
    navigate("/kullanici-odalari");
    window.location.reload();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Oda Dolu</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-[var(--text-primary)]">
            Maalesef bu oda dolu. Lütfen başka oda deneyin.
          </p>
          <div className="flex justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
            >
              Tamam
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 