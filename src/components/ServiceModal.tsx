"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export interface ServiceItem {
  id?: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
}

interface ServiceModalProps {
  isOpen: boolean;
  serviceToEdit: ServiceItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ServiceModal({
  isOpen,
  serviceToEdit,
  onClose,
  onSuccess,
}: ServiceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [duration, setDuration] = useState<number | ''>(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (serviceToEdit) {
      setName(serviceToEdit.name || '');
      setDescription(serviceToEdit.description || '');
      setPrice(serviceToEdit.price || '');
      setDuration(serviceToEdit.duration_minutes || 30);
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setDuration(30);
    }
  }, [serviceToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('El nombre del servicio es obligatorio.');
      return;
    }
    if (!price || Number(price) <= 0) {
      toast.error('Ingresa un precio válido.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading(serviceToEdit ? 'Guardando cambios...' : 'Creando servicio...');

    try {
      const url = serviceToEdit 
        ? `http://localhost:3001/api/services/${serviceToEdit.id}` 
        : 'http://localhost:3001/api/services';
      
      const method = serviceToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          price: Number(price),
          duration_minutes: Number(duration) || 30,
        }),
      });

      if (!res.ok) throw new Error('Error al guardar el servicio');

      toast.update(toastId, {
        render: serviceToEdit ? '¡Servicio actualizado con éxito! ✨' : '¡Servicio creado con éxito! ✨',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.update(toastId, {
        render: 'Error al procesar la solicitud.',
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF9F6] w-full max-w-lg rounded-[2.5rem] p-6 md:p-8 shadow-2xl border border-[#E2DED5] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-[#E2DED5] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EFECE3] border border-[#E2DED5] flex items-center justify-center text-[#1A1A1A]">
              <span className="material-symbols-outlined text-xl">content_cut</span>
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold text-[#1A1A1A]">
                {serviceToEdit ? 'Editar Servicio' : 'Nuevo Servicio'}
              </h3>
              <p className="text-xs text-[#8B8878]">
                {serviceToEdit ? 'Modifica los detalles del corte' : 'Agrega un nuevo corte al catálogo'}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            disabled={loading}
            className="text-[#8B8878] hover:text-[#1A1A1A] transition-colors p-1.5 rounded-full hover:bg-[#EFECE3] flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5A5A5A] mb-1.5">
              Nombre del Servicio <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Corte Clásico, Degradé (Fade), etc."
              disabled={loading}
              className="w-full p-3.5 rounded-xl border border-[#E2DED5] bg-white focus:outline-none focus:border-[#1A1A1A] text-sm shadow-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5A5A5A] mb-1.5">
              Descripción
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Asesoría de imagen, corte preciso a tijera o máquina y styling final."
              disabled={loading}
              className="w-full p-3.5 rounded-xl border border-[#E2DED5] bg-white focus:outline-none focus:border-[#1A1A1A] text-sm shadow-sm resize-none"
            />
          </div>

          {/* Price & Duration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5A5A5A] mb-1.5">
                Precio ($ ARS) <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="number"
                min="0"
                step="500"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Ej: 10000"
                disabled={loading}
                className="w-full p-3.5 rounded-xl border border-[#E2DED5] bg-white focus:outline-none focus:border-[#1A1A1A] text-sm shadow-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5A5A5A] mb-1.5">
                Duración (Minutos) <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="number"
                min="10"
                max="240"
                step="5"
                value={duration}
                onChange={(e) => setDuration(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Ej: 30"
                disabled={loading}
                className="w-full p-3.5 rounded-xl border border-[#E2DED5] bg-white focus:outline-none focus:border-[#1A1A1A] text-sm shadow-sm"
              />
            </div>
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
                serviceToEdit ? 'Guardar Cambios' : 'Crear Servicio'
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
