"use client";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmVariant = "primary",
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF9F6] w-full max-w-md rounded-[2rem] p-6 shadow-2xl border border-[#E2DED5] animate-in zoom-in-95 duration-200">
        
        {/* Icon & Title */}
        <div className="flex items-center gap-4 mb-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
            confirmVariant === 'danger' 
              ? 'bg-red-100 text-red-600 border border-red-200' 
              : 'bg-[#EFECE3] text-[#1A1A1A] border border-[#E2DED5]'
          }`}>
            <span className="material-symbols-outlined text-2xl">
              {confirmVariant === 'danger' ? 'warning' : 'help'}
            </span>
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-[#1A1A1A]">{title}</h3>
          </div>
        </div>

        {/* Message */}
        <p className="text-[#6A6A6A] text-sm leading-relaxed mb-6 ml-1">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-[#E2DED5]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl border border-[#E2DED5] bg-white text-[#5A5A5A] text-sm font-semibold hover:bg-[#EFECE3] hover:text-[#1A1A1A] transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-sm disabled:opacity-50 flex items-center gap-2 ${
              confirmVariant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#1A1A1A] hover:bg-black'
            }`}
          >
            {isLoading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Procesando...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
