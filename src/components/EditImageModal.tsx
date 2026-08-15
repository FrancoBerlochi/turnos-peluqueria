"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface EditImageModalProps {
  isOpen: boolean;
  item: { id: string; image_url: string; title: string } | null;
  onClose: () => void;
  onSaveSuccess: () => void;
}

export default function EditImageModal({
  isOpen,
  item,
  onClose,
  onSaveSuccess,
}: EditImageModalProps) {
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setDescription(item.title || '');
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [item, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setLoading(true);
    const toastId = toast.loading('Guardando cambios en la foto...');

    const formData = new FormData();
    formData.append('description', description);
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    try {
      const res = await fetch(`http://localhost:3001/api/gallery/${item.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) throw new Error('Error al actualizar');

      toast.update(toastId, {
        render: '¡Foto actualizada con éxito! ✨',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });

      onSaveSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.update(toastId, {
        render: 'Error al actualizar la foto.',
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF9F6] w-full max-w-lg rounded-[2rem] p-6 md:p-8 shadow-2xl border border-[#E2DED5] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-[#E2DED5] mb-6">
          <h3 className="font-display text-2xl font-bold text-[#1A1A1A]">Editar Foto</h3>
          <button 
            type="button" 
            onClick={onClose} 
            disabled={loading}
            className="text-[#8B8878] hover:text-[#1A1A1A] transition-colors p-1 flex items-center justify-center rounded-full hover:bg-[#EFECE3]"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Current & New Preview */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-[#E2DED5]">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-[#EFECE3] border border-[#E2DED5] flex items-center justify-center shrink-0">
              <img 
                src={previewUrl || item.image_url} 
                alt="Vista previa" 
                className="w-full h-full object-contain p-1"
              />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-[#8B8878] uppercase mb-1">
                {previewUrl ? 'Nueva Imagen Seleccionada' : 'Imagen Actual'}
              </p>
              <label className="text-xs bg-[#EFECE3] text-[#1A1A1A] font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:bg-[#E2DED5] transition-colors inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">add_photo_alternate</span>
                <span>Cambiar Imagen</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                  disabled={loading}
                />
              </label>
              {selectedFile && (
                <p className="text-[11px] text-[#6A6A6A] mt-1 truncate">{selectedFile.name}</p>
              )}
            </div>
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-semibold text-[#5A5A5A] mb-1.5">
              Descripción o Título
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Degradado con navaja"
              disabled={loading}
              className="w-full p-3 rounded-xl border border-[#E2DED5] bg-white focus:outline-none focus:border-[#1A1A1A] text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E2DED5] mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-[#E2DED5] bg-white text-[#5A5A5A] text-sm font-semibold hover:bg-[#EFECE3] hover:text-[#1A1A1A] transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#1A1A1A] text-white text-sm font-bold hover:bg-black transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Guardando...</span>
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
