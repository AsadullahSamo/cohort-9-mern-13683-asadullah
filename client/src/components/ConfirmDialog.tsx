import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, message, onConfirm, onCancel }: ConfirmDialogProps) {
  
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(10,14,31,0.5)", fontFamily: "'Inter', sans-serif" }}
      role="dialog"
      aria-modal="true"
      aria-label="Confirm deletion"
    >
      <div
        className="bg-white rounded-xl p-6 w-100"
        style={{ boxShadow: "0 20px 40px rgba(10,14,31,0.2)", border: "1px solid #EFEFF5" }}
      >
        <p className="mb-5 text-sm" style={{ color: "#1B1F3B" }}>{message}</p>
        <div className="flex justify-end gap-2">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
            style={{ border: "1px solid #E4E4EE", color: "#6B6F86", backgroundColor: "#FFFFFF" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F7F7FB")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FFFFFF")}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer transition-colors"
            style={{ backgroundColor: "#DC2626" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#B91C1C")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#DC2626")}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}