"use client";

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ConfirmModal';
import ImageModal from '@/components/ImageModal';
import EditImageModal from '@/components/EditImageModal';
import ServiceModal, { ServiceItem } from '@/components/ServiceModal';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

type Appointment = {
  id: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  payment_method: string;
  total_amount: number;
  services: {
    name: string;
    price: number;
    duration_minutes: number;
  };
};

const getServiceIcon = (name: string) => {
  const lower = (name || '').toLowerCase();
  if (lower.includes('barba') || lower.includes('afeitad')) return 'face_6';
  if (lower.includes('color') || lower.includes('tinte') || lower.includes('mechas') || lower.includes('reflejo')) return 'palette';
  if (lower.includes('peinado') || lower.includes('brush')) return 'brush';
  if (lower.includes('spa') || lower.includes('lavado') || lower.includes('tratamiento')) return 'spa';
  return 'content_cut';
};

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [gallery, setGallery] = useState<{id: string, image_url: string, title: string}[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);
  const [editingItem, setEditingItem] = useState<{ id: string; image_url: string; title: string } | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<ServiceItem | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'gallery'>('appointments');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    confirmVariant?: 'primary' | 'danger';
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    confirmVariant: 'primary',
    onConfirm: async () => {},
  });
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  const fetchAppointments = async (showToast = false) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/appointments');
      const data = await res.json();
      setAppointments(data);
      if (showToast) toast.info('Turnos actualizados.');
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar la lista de turnos.');
    } finally {
      setLoading(false);
    }
  };

  const fetchGallery = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/gallery');
      const data = await res.json();
      setGallery(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchServices = async (showToast = false) => {
    try {
      const res = await fetch('http://localhost:3001/api/services');
      const data = await res.json();
      setServices(data);
      if (showToast) toast.info('Servicios actualizados.');
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar los servicios.');
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchGallery();
    fetchServices();
  }, []);

  const openApproveModal = (app: Appointment) => {
    setConfirmModal({
      isOpen: true,
      title: '¿Aprobar pago en efectivo?',
      message: `Estás a punto de confirmar el turno de ${app.client_name} (${app.services?.name}) por un total de $${app.total_amount}.`,
      confirmText: 'Aprobar Pago',
      confirmVariant: 'primary',
      onConfirm: async () => {
        setIsConfirmLoading(true);
        try {
          const res = await fetch(`http://localhost:3001/api/appointments/${app.id}/approve`, { method: 'PUT' });
          if (!res.ok) throw new Error('Failed to approve');
          toast.success(`¡Turno de ${app.client_name} aprobado con éxito! 🎉`);
          await fetchAppointments();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error(error);
          toast.error('Hubo un error al aprobar el pago.');
        } finally {
          setIsConfirmLoading(false);
        }
      }
    });
  };

  const openCancelModal = (app: Appointment) => {
    setConfirmModal({
      isOpen: true,
      title: '¿Cancelar este turno?',
      message: `¿Estás seguro de que deseas cancelar el turno de ${app.client_name} para el día ${app.appointment_date} a las ${app.appointment_time}?`,
      confirmText: 'Sí, cancelar turno',
      confirmVariant: 'danger',
      onConfirm: async () => {
        setIsConfirmLoading(true);
        try {
          const res = await fetch(`http://localhost:3001/api/appointments/${app.id}/cancel`, { method: 'PUT' });
          if (!res.ok) throw new Error('Failed to cancel');
          toast.success(`Turno de ${app.client_name} cancelado.`);
          await fetchAppointments();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error(error);
          toast.error('Hubo un error al cancelar el turno.');
        } finally {
          setIsConfirmLoading(false);
        }
      }
    });
  };

  const openDeleteGalleryModal = (item: { id: string; image_url: string; title: string }) => {
    setConfirmModal({
      isOpen: true,
      title: '¿Eliminar foto de la galería?',
      message: `¿Estás seguro de que deseas eliminar esta foto ("${item.title || 'Sin título'}")? Se borrará definitivamente.`,
      confirmText: 'Sí, eliminar foto',
      confirmVariant: 'danger',
      onConfirm: async () => {
        setIsConfirmLoading(true);
        try {
          const res = await fetch(`http://localhost:3001/api/gallery/${item.id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete');
          toast.success('Foto eliminada correctamente.');
          await fetchGallery();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error(error);
          toast.error('Hubo un error al eliminar la foto.');
        } finally {
          setIsConfirmLoading(false);
        }
      }
    });
  };

  const openDeleteServiceModal = (service: ServiceItem) => {
    setConfirmModal({
      isOpen: true,
      title: '¿Eliminar servicio?',
      message: `¿Estás seguro de que deseas eliminar "${service.name}"? Esta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar servicio',
      confirmVariant: 'danger',
      onConfirm: async () => {
        setIsConfirmLoading(true);
        try {
          const res = await fetch(`http://localhost:3001/api/services/${service.id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete');
          toast.success('¡Servicio eliminado con éxito!');
          await fetchServices();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error(error);
          toast.error('Hubo un error al eliminar el servicio.');
        } finally {
          setIsConfirmLoading(false);
        }
      }
    });
  };

  const handleUploadImage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem('image') as HTMLInputElement;
    const descInput = form.elements.namedItem('description') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      toast.warning('Por favor selecciona una imagen para subir.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('description', descInput?.value || '');

    setUploadingImage(true);
    const toastId = toast.loading('Subiendo imagen a Cloudinary...');

    try {
      const res = await fetch('http://localhost:3001/api/gallery', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Error al subir');

      toast.update(toastId, {
        render: '¡Imagen subida a la galería con éxito! 📸',
        type: 'success',
        isLoading: false,
        autoClose: 3500,
      });

      form.reset();
      await fetchGallery();
    } catch (error) {
      console.error(error);
      toast.update(toastId, {
        render: 'Error al subir la imagen. Revisa tu conexión o archivo.',
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed');
  const cancelledAppointments = appointments.filter(a => a.status === 'cancelled');

  const filteredAppointments = appointments.filter(a => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  const renderTable = (items: Appointment[], emptyText: string) => (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E2DED5] overflow-hidden mb-8">
      {/* Mobile scroll hint */}
      <div className="md:hidden px-4 py-2 bg-[#EFECE3]/50 border-b border-[#E2DED5] flex items-center justify-between text-xs text-[#8B8878]">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">swipe</span>
          Desliza hacia los lados para ver todas las columnas
        </span>
      </div>
      <div className="overflow-x-auto w-full custom-scrollbar pb-2">
        <table className="w-full min-w-[760px] text-left border-collapse">
          <thead>
            <tr className="bg-[#EFECE3] text-[#5A5A5A] text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold whitespace-nowrap">Cliente</th>
              <th className="p-4 font-semibold whitespace-nowrap">Servicio</th>
              <th className="p-4 font-semibold whitespace-nowrap">Fecha y Hora</th>
              <th className="p-4 font-semibold whitespace-nowrap">Pago</th>
              <th className="p-4 font-semibold whitespace-nowrap">Estado</th>
              <th className="p-4 font-semibold text-right whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2DED5]">
            {items.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-[#8B8878] text-sm">{emptyText}</td></tr>
            ) : items.map(app => (
              <tr key={app.id} className="hover:bg-[#FAF9F6] transition-colors">
                <td className="p-4">
                  <p className="font-bold text-[#1A1A1A]">{app.client_name}</p>
                  <p className="text-xs text-[#6A6A6A]">{app.client_phone} | {app.client_email}</p>
                </td>
                <td className="p-4">
                  <p className="font-medium text-[#2A2A2A]">{app.services?.name}</p>
                  <p className="text-sm font-bold text-[#8B8878]">${app.total_amount}</p>
                </td>
                <td className="p-4 whitespace-nowrap">
                  <p className="font-medium text-[#2A2A2A]">{app.appointment_date}</p>
                  <p className="text-sm text-[#6A6A6A]">{app.appointment_time}</p>
                </td>
                <td className="p-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${app.payment_method === 'cash' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                    {app.payment_method === 'cash' ? 'Efectivo' : 'MercadoPago'}
                  </span>
                </td>
                <td className="p-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    app.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    app.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {app.status === 'pending' ? (
                      <>
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        <span>Pendiente</span>
                      </>
                    ) : app.status === 'confirmed' ? (
                      <>
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        <span>Aprobado</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-xs">cancel</span>
                        <span>Cancelado</span>
                      </>
                    )}
                  </span>
                </td>
                <td className="p-4 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-2">
                    {app.status === 'pending' && (
                      <button onClick={() => openApproveModal(app)} className="bg-[#1A1A1A] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-black transition-colors shadow-sm whitespace-nowrap">
                        Aprobar
                      </button>
                    )}
                    {app.status !== 'cancelled' && (
                      <button onClick={() => openCancelModal(app)} className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors whitespace-nowrap">
                        Cancelar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans text-[#2A2A2A]">
      {/* Admin Nav */}
      <header className="sticky top-0 z-30 bg-[#1A1A1A] text-white px-6 md:px-8 py-3.5 shadow-md border-b border-zinc-800 transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <a href="/admin" className="font-display font-bold text-xl tracking-tight flex items-center">
              PELU<span className="text-[#8B8878] font-light">TURNOS</span>
              <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded ml-2 uppercase font-bold tracking-wider">Admin</span>
            </a>
          </div>

          {/* Hamburger / Barber Pole Menu Button */}
          {!isNavOpen ? (
            <button 
              onClick={() => setIsNavOpen(true)} 
              className="flex items-center gap-2.5 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 shadow-md hover:scale-105 cursor-pointer border border-zinc-700"
              aria-label="Abrir menú de navegación"
            >
              <span className="flex flex-col gap-1 w-4">
                <span className="w-full h-0.5 bg-white rounded-full"></span>
                <span className="w-full h-0.5 bg-white rounded-full"></span>
                <span className="w-full h-0.5 bg-white rounded-full"></span>
              </span>
              <span className="font-semibold text-xs capitalize">
                {activeTab === 'appointments' ? 'Turnos' : activeTab === 'services' ? 'Servicios' : 'Galería'}
              </span>
            </button>
          ) : (
            <div className="w-10 h-10"></div>
          )}
        </div>
      </header>

      {/* Fixed Barber Pole Button when menu is active in Admin */}
      {isNavOpen && (
        <button
          onClick={() => setIsNavOpen(false)}
          className="fixed top-3 right-6 md:right-8 z-50 flex items-center justify-center p-1 rounded-full bg-zinc-900 border-2 border-[#C0BEB8] shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer animate-in zoom-in-75 duration-200"
          title="Cerrar menú"
          aria-label="Cerrar menú"
        >
          {/* The Authentic Barber Pole Capsule */}
          <div className="w-8 h-14 sm:w-9 sm:h-16 rounded-full border-[3px] border-[#A8A59E] p-0.5 bg-[#121212] flex items-center justify-center overflow-hidden relative shadow-inner">
            {/* Rotating Inner Cylinder */}
            <div className="w-full h-full rounded-full barber-pole relative overflow-hidden">
              {/* 3D Glass Cylinder highlight reflection */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-black/35 pointer-events-none rounded-full"></div>
            </div>
          </div>

          {/* Close badge */}
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold shadow-md">
            <span className="material-symbols-outlined text-xs">close</span>
          </div>
        </button>
      )}

      {/* Navigation Dropdown / Drawer for Admin */}
      {isNavOpen && (
        <>
          {/* Backdrop */}
          <div 
            onClick={() => setIsNavOpen(false)} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          />

          {/* Menu Card */}
          <div className="fixed top-20 right-6 sm:right-8 z-50 w-[90vw] max-w-sm bg-[#FAF9F6] rounded-[2.5rem] border border-[#E2DED5] shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 slide-in-from-top-4 duration-200 text-[#2A2A2A]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2DED5] mb-5">
              <div className="font-display font-bold text-xl tracking-tight text-[#1A1A1A]">
                PELU<span className="text-[#8B8878] font-light">TURNOS</span>
                <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded ml-2 uppercase font-bold">Admin</span>
              </div>
              <span className="text-xs text-[#8B8878] font-semibold uppercase tracking-wider">Panel</span>
            </div>

            <nav className="flex flex-col gap-2.5 mb-6">
              <button 
                onClick={() => {
                  setActiveTab('appointments');
                  setIsNavOpen(false);
                }}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left w-full ${
                  activeTab === 'appointments' 
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-sm' 
                    : 'bg-white border-[#E2DED5] text-[#1A1A1A] hover:bg-[#EFECE3]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeTab === 'appointments' ? 'bg-white/20 text-white' : 'bg-[#EFECE3] text-[#1A1A1A]'}`}>
                    <span className="material-symbols-outlined text-lg">calendar_month</span>
                  </div>
                  <span className="font-semibold text-base">Gestión de Turnos</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeTab === 'appointments' ? 'bg-white text-black' : 'bg-[#EFECE3] text-[#5A5A5A]'}`}>
                  {appointments.length}
                </span>
              </button>

              <button 
                onClick={() => {
                  setActiveTab('services');
                  setIsNavOpen(false);
                }}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left w-full ${
                  activeTab === 'services' 
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-sm' 
                    : 'bg-white border-[#E2DED5] text-[#1A1A1A] hover:bg-[#EFECE3]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeTab === 'services' ? 'bg-white/20 text-white' : 'bg-[#EFECE3] text-[#1A1A1A]'}`}>
                    <span className="material-symbols-outlined text-lg">content_cut</span>
                  </div>
                  <span className="font-semibold text-base">Servicios y Cortes</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeTab === 'services' ? 'bg-white text-black' : 'bg-[#EFECE3] text-[#5A5A5A]'}`}>
                  {services.length}
                </span>
              </button>

              <button 
                onClick={() => {
                  setActiveTab('gallery');
                  setIsNavOpen(false);
                }}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left w-full ${
                  activeTab === 'gallery' 
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-sm' 
                    : 'bg-white border-[#E2DED5] text-[#1A1A1A] hover:bg-[#EFECE3]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeTab === 'gallery' ? 'bg-white/20 text-white' : 'bg-[#EFECE3] text-[#1A1A1A]'}`}>
                    <span className="material-symbols-outlined text-lg">photo_library</span>
                  </div>
                  <span className="font-semibold text-base">Galería de Fotos</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeTab === 'gallery' ? 'bg-white text-black' : 'bg-[#EFECE3] text-[#5A5A5A]'}`}>
                  {gallery.length}
                </span>
              </button>
            </nav>

            {/* Footer Link to Landing Page */}
            <div className="pt-4 border-t border-[#E2DED5]">
              <a
                href="/"
                className="w-full py-3 rounded-xl bg-[#EFECE3] hover:bg-[#E2DED5] text-[#1A1A1A] font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">storefront</span>
                <span>Ir a la Web Principal</span>
              </a>
            </div>
          </div>
        </>
      )}

      <main className="max-w-7xl mx-auto p-8">
        
        {/* APPOINTMENTS TAB */}
        {activeTab === 'appointments' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
              <div>
                <h1 className="font-display text-4xl font-bold mb-2">Gestión de Turnos</h1>
                <p className="text-[#6A6A6A]">Administra las reservas divididas por estado.</p>
              </div>
              <button onClick={() => fetchAppointments(true)} className="bg-white border border-[#E2DED5] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#EFECE3] transition-colors shadow-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">sync</span>
                Refrescar
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 bg-[#EFECE3] p-1.5 rounded-2xl w-fit">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${statusFilter === 'all' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#6A6A6A] hover:text-[#1A1A1A]'}`}
              >
                Todos ({appointments.length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${statusFilter === 'pending' ? 'bg-amber-100 text-amber-900 shadow-sm border border-amber-200' : 'text-[#6A6A6A] hover:text-amber-800'}`}
              >
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span>Pendientes</span>
                <span className="bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-full text-[10px]">{pendingAppointments.length}</span>
              </button>
              <button
                onClick={() => setStatusFilter('confirmed')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${statusFilter === 'confirmed' ? 'bg-green-100 text-green-800 shadow-sm border border-green-200' : 'text-[#6A6A6A] hover:text-green-800'}`}
              >
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>Confirmados</span>
                <span className="bg-green-200 text-green-900 px-1.5 py-0.5 rounded-full text-[10px]">{confirmedAppointments.length}</span>
              </button>
              <button
                onClick={() => setStatusFilter('cancelled')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${statusFilter === 'cancelled' ? 'bg-red-100 text-red-800 shadow-sm border border-red-200' : 'text-[#6A6A6A] hover:text-red-800'}`}
              >
                <span className="material-symbols-outlined text-sm">cancel</span>
                <span>Cancelados</span>
                <span className="bg-red-200 text-red-900 px-1.5 py-0.5 rounded-full text-[10px]">{cancelledAppointments.length}</span>
              </button>
            </div>

            {loading ? (
              <p className="text-[#8B8878] py-10 text-center">Cargando turnos...</p>
            ) : statusFilter === 'all' ? (
              <div className="space-y-10">
                {/* Bloque 1: Pendientes */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
                    <h2 className="font-display text-xl font-bold text-[#1A1A1A]">Turnos Pendientes de Aprobación</h2>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-bold">{pendingAppointments.length}</span>
                  </div>
                  {renderTable(pendingAppointments, 'No hay turnos pendientes en este momento.')}
                </div>

                {/* Bloque 2: Aprobados / Confirmados */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <h2 className="font-display text-xl font-bold text-[#1A1A1A]">Turnos Confirmados / Aprobados</h2>
                    <span className="text-xs bg-green-100 text-green-800 px-2.5 py-1 rounded-full font-bold">{confirmedAppointments.length}</span>
                  </div>
                  {renderTable(confirmedAppointments, 'No hay turnos confirmados aún.')}
                </div>

                {/* Bloque 3: Cancelados */}
                {cancelledAppointments.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <h2 className="font-display text-xl font-bold text-[#6A6A6A]">Historial de Cancelados</h2>
                      <span className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full font-bold">{cancelledAppointments.length}</span>
                    </div>
                    {renderTable(cancelledAppointments, 'No hay turnos cancelados.')}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {renderTable(filteredAppointments, `No hay turnos con estado: ${statusFilter}`)}
              </div>
            )}
          </div>
        )}

        {/* SERVICES TAB */}
        {activeTab === 'services' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
              <div>
                <h1 className="font-display text-4xl font-bold mb-2">Gestión de Servicios y Cortes</h1>
                <p className="text-[#6A6A6A]">Administra los cortes, descripciones, precios y tiempos de atención.</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => fetchServices(true)} 
                  className="bg-white border border-[#E2DED5] px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#EFECE3] transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">sync</span>
                  Refrescar
                </button>
                <button
                  onClick={() => {
                    setServiceToEdit(null);
                    setIsServiceModalOpen(true);
                  }}
                  className="bg-[#1A1A1A] hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>Nuevo Servicio</span>
                </button>
              </div>
            </div>

            {/* Services Grid */}
            {services.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#E2DED5] shadow-sm">
                <p className="text-[#8B8878] mb-4">No tienes servicios cargados aún.</p>
                <button
                  onClick={() => {
                    setServiceToEdit(null);
                    setIsServiceModalOpen(true);
                  }}
                  className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm"
                >
                  Crear primer servicio
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map(srv => (
                  <div 
                    key={srv.id} 
                    className="bg-white p-8 rounded-[2rem] border border-[#E2DED5] shadow-sm flex flex-col justify-between hover:shadow-md transition-all relative group"
                  >
                    <div>
                      {/* Top Row: Icon + Action Buttons */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 bg-[#FAF9F6] border border-[#E2DED5] rounded-2xl flex items-center justify-center shadow-sm">
                          <span className="material-symbols-outlined text-2xl text-[#1A1A1A]">
                            {getServiceIcon(srv.name)}
                          </span>
                        </div>

                        {/* Action Buttons Overlay */}
                        <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => {
                              setServiceToEdit(srv);
                              setIsServiceModalOpen(true);
                            }}
                            className="w-9 h-9 md:w-8 md:h-8 rounded-full bg-black/80 hover:bg-black active:scale-95 text-white flex items-center justify-center shadow-md transition-all"
                            title="Editar servicio"
                          >
                            <span className="material-symbols-outlined text-base md:text-sm">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteServiceModal(srv)}
                            className="w-9 h-9 md:w-8 md:h-8 rounded-full bg-red-600/90 hover:bg-red-600 active:scale-95 text-white flex items-center justify-center shadow-md transition-all"
                            title="Eliminar servicio"
                          >
                            <span className="material-symbols-outlined text-base md:text-sm">delete</span>
                          </button>
                        </div>
                      </div>

                      <h3 className="font-display text-2xl font-bold mb-2 tracking-tight text-[#1A1A1A]">
                        {srv.name}
                      </h3>
                      <p className="text-[#6A6A6A] mb-8 leading-relaxed text-sm">
                        {srv.description || 'Sin descripción'}
                      </p>
                    </div>

                    <div className="flex justify-between items-center border-t border-[#E2DED5] pt-6 mt-auto">
                      <span className="font-sans text-xl font-bold text-[#1A1A1A]">
                        ${srv.price?.toLocaleString('es-AR')}
                      </span>
                      <span className="text-xs font-bold text-[#8B8878] tracking-wider uppercase bg-[#EFECE3] px-3 py-1.5 rounded-full shadow-sm">
                        {srv.duration_minutes} MIN
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* GALLERY TAB */}
        {activeTab === 'gallery' && (
          <div>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="font-display text-4xl font-bold mb-2">Galería de Cortes</h1>
                <p className="text-[#6A6A6A]">Sube fotos de tus mejores trabajos para que los clientes los vean.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Formulario de Subida */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E2DED5] h-fit">
                <h2 className="font-bold text-xl mb-4">Subir nuevo corte</h2>
                <form id="upload-form" onSubmit={handleUploadImage} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-1">Imagen (JPG, PNG)</label>
                    <input required name="image" type="file" accept="image/*" disabled={uploadingImage} className="w-full text-sm text-[#5A5A5A] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#EFECE3] file:text-[#1A1A1A] hover:file:bg-[#E2DED5] cursor-pointer disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5A5A5A] mb-1">Descripción corta (opcional)</label>
                    <input name="description" type="text" disabled={uploadingImage} placeholder="Ej: Degradado con navaja" className="w-full p-3 rounded-xl border border-[#E2DED5] focus:outline-none focus:border-[#1A1A1A] disabled:opacity-50" />
                  </div>
                  <button id="upload-btn" type="submit" disabled={uploadingImage} className="mt-2 bg-[#1A1A1A] text-white px-4 py-3 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {uploadingImage ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Subiendo imagen...</span>
                      </>
                    ) : (
                      'Subir Imagen'
                    )}
                  </button>
                </form>
              </div>

              {/* Grid / Slider de Galería */}
              <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-[#E2DED5]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-xl">Fotos subidas ({gallery.length})</h2>
                  <span className="text-xs text-[#8B8878]">Desliza para ver más</span>
                </div>
                
                {gallery.length === 0 ? (
                  <p className="text-[#8B8878] text-sm py-8 text-center">No has subido fotos todavía.</p>
                ) : (
                  <div className="px-2">
                    <Swiper
                      modules={[Navigation, Pagination]}
                      spaceBetween={16}
                      slidesPerView={1}
                      navigation
                      pagination={{ clickable: true, dynamicBullets: true }}
                      breakpoints={{
                        640: {
                          slidesPerView: 2,
                          spaceBetween: 16,
                        },
                        1024: {
                          slidesPerView: 3,
                          spaceBetween: 16,
                        },
                      }}
                      className="!pb-12"
                    >
                      {gallery.map(item => (
                        <SwiperSlide key={item.id}>
                          <div 
                            onClick={() => setSelectedImage({ url: item.image_url, title: item.title })}
                            className="relative group rounded-2xl overflow-hidden aspect-square bg-[#EFECE3] border border-[#E2DED5] flex items-center justify-center cursor-zoom-in shadow-sm hover:shadow-md transition-all"
                          >
                            <img 
                              src={item.image_url} 
                              alt={item.title || 'Corte'} 
                              className="w-full h-full object-contain p-2 select-none transition-opacity duration-200" 
                            />
                            
                            {/* Action Buttons Overlay */}
                            <div className="absolute top-2 right-2 flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingItem(item);
                                }}
                                className="w-9 h-9 md:w-8 md:h-8 rounded-full bg-black/80 hover:bg-black active:scale-95 text-white flex items-center justify-center shadow-md transition-all"
                                title="Editar foto y descripción"
                              >
                                <span className="material-symbols-outlined text-base md:text-sm">edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDeleteGalleryModal(item);
                                }}
                                className="w-9 h-9 md:w-8 md:h-8 rounded-full bg-red-600/90 hover:bg-red-600 active:scale-95 text-white flex items-center justify-center shadow-md transition-all"
                                title="Eliminar foto"
                              >
                                <span className="material-symbols-outlined text-base md:text-sm">delete</span>
                              </button>
                            </div>

                            {item.title && (
                              <div className="absolute bottom-2 left-2 right-2 py-1.5 px-2 rounded-lg bg-black/75 backdrop-blur-md text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 pointer-events-none text-center">
                                <span className="font-semibold text-xs truncate block">{item.title}</span>
                              </div>
                            )}
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Confirmation Modal Component */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmVariant={confirmModal.confirmVariant}
        isLoading={isConfirmLoading}
        onConfirm={confirmModal.onConfirm}
        onClose={() => {
          if (!isConfirmLoading) {
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
          }
        }}
      />

      {/* Service Modal Component (Create / Edit) */}
      <ServiceModal
        isOpen={isServiceModalOpen}
        serviceToEdit={serviceToEdit}
        onClose={() => {
          setIsServiceModalOpen(false);
          setServiceToEdit(null);
        }}
        onSuccess={fetchServices}
      />

      {/* Edit Image Modal Component */}
      <EditImageModal
        isOpen={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSaveSuccess={fetchGallery}
      />

      {/* Image Lightbox Modal */}
      <ImageModal
        isOpen={!!selectedImage}
        imageUrl={selectedImage?.url || null}
        title={selectedImage?.title}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}
