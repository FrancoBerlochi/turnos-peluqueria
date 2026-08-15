"use client";

import { useEffect } from 'react';

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  title?: string;
  onClose: () => void;
}

export default function ImageModal({
  isOpen,
  imageUrl,
  title,
  onClose,
}: ImageModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-200 cursor-zoom-out"
    >
      {/* Close Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-6 right-6 z-10 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-sm transition-all flex items-center justify-center w-12 h-12 shadow-lg"
        title="Cerrar (Esc)"
      >
        <span className="material-symbols-outlined text-2xl">close</span>
      </button>

      {/* Image Container */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[88vh] flex flex-col items-center justify-center animate-in zoom-in-95 duration-200 cursor-default"
      >
        <img 
          src={imageUrl} 
          alt={title || 'Corte ampliado'} 
          className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10 select-none"
        />
        {title && (
          <div className="mt-4 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-medium border border-white/15 max-w-md text-center truncate">
            {title}
          </div>
        )}
      </div>
    </div>
  );
}
