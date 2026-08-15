"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { API_URL } from '@/lib/api';

export interface ServiceItem {
  id?: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
}

export const AVAILABLE_SERVICE_ICONS = [
  { id: 'content_cut', label: 'Tijeras', category: 'Corte' },
  { id: 'face_6', label: 'Barba', category: 'Barbería' },
  { id: 'face', label: 'Perfilado', category: 'Rostro' },
  { id: 'palette', label: 'Coloración', category: 'Color' },
  { id: 'brush', label: 'Peinado', category: 'Styling' },
  { id: 'spa', label: 'Spa / Lavado', category: 'Cuidado' },
  { id: 'auto_awesome', label: 'Freestyle', category: 'Especial' },
  { id: 'diamond', label: 'VIP / Premium', category: 'Exclusivo' },
  { id: 'bolt', label: 'Express', category: 'Rápido' },
  { id: 'local_fire_department', label: 'Tendencia', category: 'Moda' },
  { id: 'dry_cleaning', label: 'Toalla Caliente', category: 'Ritual' },
  { id: 'star', label: 'Destacado', category: 'Estrella' },
];

export const parseServiceDescription = (desc?: string) => {
  if (!desc) return { icon: null, cleanDescription: '' };
  const match = desc.match(/^\[icon:([a-z0-9_]+)\]\s*([\s\S]*)$/);
  if (match) {
    return { icon: match[1], cleanDescription: match[2] };
  }
  return { icon: null, cleanDescription: desc };
};

export const getServiceDisplayIcon = (srv: { name: string; description?: string }) => {
  const parsed = parseServiceDescription(srv.description);
  if (parsed.icon) return parsed.icon;
  const lower = (srv.name || '').toLowerCase();
  if (lower.includes('barba') || lower.includes('afeitad')) return 'face_6';
  if (lower.includes('color') || lower.includes('tinte') || lower.includes('mechas') || lower.includes('reflejo')) return 'palette';
  if (lower.includes('peinado') || lower.includes('brush')) return 'brush';
  if (lower.includes('spa') || lower.includes('lavado') || lower.includes('tratamiento')) return 'spa';
  return 'content_cut';
};

export const getCleanServiceDescription = (desc?: string) => {
  return parseServiceDescription(desc).cleanDescription;
};

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
  const [selectedIcon, setSelectedIcon] = useState('content_cut');
  const [price, setPrice] = useState<number | ''>('');
  const [duration, setDuration] = useState<number | ''>(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (serviceToEdit) {
      setName(serviceToEdit.name || '');
      const parsed = parseServiceDescription(serviceToEdit.description);
      setDescription(parsed.cleanDescription);
      setSelectedIcon(parsed.icon || getServiceDisplayIcon(serviceToEdit));
      setPrice(serviceToEdit.price || '');
      setDuration(serviceToEdit.duration_minutes || 30);
    } else {
      setName('');
      setDescription('');
      setSelectedIcon('content_cut');
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
    if (price === '' || isNaN(Number(price)) || Number(price) < 0) {
      toast.error('Ingresa un precio válido (0 o mayor).');
      return;
    }

    setLoading(true);
    const toastId = toast.loading(serviceToEdit ? 'Guardando cambios...' : 'Creando servicio...');

    const formattedDescription = `[icon:${selectedIcon}] ${description.trim()}`;

    try {
      const url = serviceToEdit 
        ? `${API_URL}/api/services/${serviceToEdit.id}` 
        : `${API_URL}/api/services`;
      
      const method = serviceToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: formattedDescription,
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
      <div className="bg-[#FAF9F6] w-full max-w-lg rounded-[2.5rem] p-6 md:p-8 shadow-2xl border border-[#E2DED5] animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-[#E2DED5] mb-6 sticky top-0 bg-[#FAF9F6] z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#1A1A1A] text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-2xl">{selectedIcon}</span>
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
          
          {/* Icon Selector Grid */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5A5A5A]">
                Seleccionar Ícono del Servicio
              </label>
              <span className="text-[11px] text-[#8B8878] font-medium">
                Seleccionado: <strong className="text-[#1A1A1A]">{AVAILABLE_SERVICE_ICONS.find(i => i.id === selectedIcon)?.label}</strong>
              </span>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 p-2 bg-[#EFECE3]/60 rounded-2xl border border-[#E2DED5]">
              {AVAILABLE_SERVICE_ICONS.map((item) => {
                const isSelected = selectedIcon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedIcon(item.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md scale-105'
                        : 'bg-white text-[#1A1A1A] border-[#E2DED5] hover:border-[#1A1A1A]/40 hover:bg-[#FAF9F6]'
                    }`}
                    title={item.label}
                  >
                    <span className="material-symbols-outlined text-2xl mb-1">
                      {item.id}
                    </span>
                    <span className="text-[10px] font-semibold text-center leading-tight truncate w-full">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

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
              className="w-full p-3.5 rounded-xl border border-[#E2DED5] bg-white focus:outline-none focus:border-[#1A1A1A] text-sm shadow-sm font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5A5A5A] mb-1.5">
              Descripción
            </label>
            <textarea
              rows={2}
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
                step="any"
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
                min="1"
                max="480"
                step="any"
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

