"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getServiceDisplayIcon, getCleanServiceDescription } from './ServiceModal';
import { API_URL } from '@/lib/api';

type Service = {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
};

type ScheduleConfig = {
  working_days: number[];
  slots: string[];
  slot_interval?: number;
};

export default function BookingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [clientData, setClientData] = useState({ name: '', email: '', phone: '', payment_method: 'cash' });
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  useEffect(() => {
    if (appointmentDate) {
      fetch(`${API_URL}/api/appointments/booked-times?date=${appointmentDate}`)
        .then(res => res.json())
        .then(data => setBookedTimes(data))
        .catch(err => console.error(err));
    } else {
      setBookedTimes([]);
      setAppointmentTime('');
    }
  }, [appointmentDate]);

  const getDayOfWeek = (dateStr: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    }
    return new Date(`${dateStr}T12:00:00`).getDay();
  };

  const isDayClosed = () => {
    if (!appointmentDate || !scheduleConfig) return false;
    const day = getDayOfWeek(appointmentDate);
    if (day === null) return false;
    return !scheduleConfig.working_days.includes(day);
  };

  const generateAvailableHours = () => {
    const rawSlots = scheduleConfig?.slots && scheduleConfig.slots.length > 0
      ? scheduleConfig.slots
      : ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

    const now = new Date();
    // Ajustar para timezone local
    const tzoffset = now.getTimezoneOffset() * 60000; 
    const localISOTime = (new Date(now.getTime() - tzoffset)).toISOString().slice(0, -1);
    const todayStr = localISOTime.split('T')[0];
    
    const isToday = appointmentDate === todayStr;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    return rawSlots.map(slot => {
      // Normalizar slot a HH:mm:ss para la base de datos
      const parts = slot.split(':');
      const hourNum = parseInt(parts[0]);
      const minuteNum = parseInt(parts[1] || '0');
      const timeStr = `${parts[0].padStart(2, '0')}:${(parts[1] || '00').padStart(2, '0')}:00`;

      const isBooked = bookedTimes.some(bt => bt.startsWith(`${parts[0].padStart(2, '0')}:${(parts[1] || '00').padStart(2, '0')}`));
      const isPast = isToday && (hourNum < currentHour || (hourNum === currentHour && minuteNum <= currentMinute));
      
      const displayLabel = new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      return {
        timeStr,
        label: displayLabel,
        disabled: isBooked || isPast
      };
    });
  };

  useEffect(() => {
    if (isOpen) {
      if (services.length === 0) {
        setLoading(true);
        fetch(`${API_URL}/api/services`)
          .then(res => res.json())
          .then(data => {
            setServices(data);
            setLoading(false);
          })
          .catch(err => {
            console.error(err);
            setLoading(false);
          });
      }

      fetch(`${API_URL}/api/schedule`)
        .then(res => res.json())
        .then(data => setScheduleConfig(data))
        .catch(err => console.error('Error fetching schedule:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      client_name: clientData.name,
      client_email: clientData.email,
      client_phone: clientData.phone,
      service_id: selectedService?.id,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      payment_method: clientData.payment_method,
      total_amount: selectedService?.price
    };

    try {
      const res = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        toast.success('¡Turno reservado con éxito!');
        setStep(4); // Success step
      } else {
        toast.error('Hubo un error al reservar el turno. Intenta nuevamente.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedService(null);
    setAppointmentDate('');
    setAppointmentTime('');
    setClientData({ name: '', email: '', phone: '', payment_method: 'cash' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[#FAF9F6] w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#E2DED5]">
          <h2 className="font-display text-2xl font-bold text-[#1A1A1A]">
            {step === 1 && 'Selecciona un Servicio'}
            {step === 2 && 'Elige Fecha y Hora'}
            {step === 3 && 'Tus Datos'}
            {step === 4 && '¡Turno Confirmado!'}
          </h2>
          {step !== 4 && (
            <button onClick={onClose} className="text-[#8B8878] hover:text-[#1A1A1A] transition-colors p-1.5 rounded-full hover:bg-[#EFECE3] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          
          {/* STEP 1: SERVICES */}
          {step === 1 && (
            <div className="flex flex-col gap-3">
              {loading ? (
                <p className="text-center text-[#8B8878] py-8">Cargando servicios...</p>
              ) : (
                services.map(srv => (
                  <div 
                    key={srv.id}
                    onClick={() => { setSelectedService(srv); handleNext(); }}
                    className="p-4 rounded-2xl border border-[#E2DED5] hover:border-[#1A1A1A] hover:bg-white cursor-pointer transition-all flex justify-between items-center group shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#FAF9F6] border border-[#E2DED5] flex items-center justify-center text-[#1A1A1A] group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-xl">
                          {getServiceDisplayIcon(srv)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1A1A1A]">{srv.name}</h4>
                        <p className="text-xs text-[#8B8878]">{srv.duration_minutes} min</p>
                      </div>
                    </div>
                    <span className="font-sans font-bold text-base text-[#1A1A1A]">${srv.price?.toLocaleString('es-AR')}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* STEP 2: DATE & TIME */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-[#5A5A5A] mb-1">Fecha</label>
                <input 
                  type="date" 
                  value={appointmentDate}
                  onChange={(e) => {
                    setAppointmentDate(e.target.value);
                    setAppointmentTime('');
                  }}
                  className="w-full p-3 rounded-xl border border-[#E2DED5] focus:outline-none focus:border-[#1A1A1A] bg-white"
                  min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]}
                />
              </div>
              
              {appointmentDate && isDayClosed() && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl text-amber-700">event_busy</span>
                  <div>
                    <p className="font-bold">El local no atiende este día</p>
                    <p className="text-xs text-amber-800">Por favor selecciona otro día de la semana para tu turno.</p>
                  </div>
                </div>
              )}

              {appointmentDate && !isDayClosed() && (
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">Hora</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {generateAvailableHours().map(slot => (
                      <button
                        key={slot.timeStr}
                        onClick={() => setAppointmentTime(slot.timeStr)}
                        disabled={slot.disabled}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all
                          ${slot.disabled 
                            ? 'border-[#E2DED5] bg-[#EFECE3] text-[#A8A596] cursor-not-allowed opacity-60' 
                            : appointmentTime === slot.timeStr 
                              ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white shadow-md' 
                              : 'border-[#E2DED5] bg-white text-[#1A1A1A] hover:border-[#8B8878]'}
                        `}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: DETAILS */}
          {step === 3 && (
            <form id="booking-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <input required type="text" placeholder="Nombre completo" value={clientData.name} onChange={e => setClientData({...clientData, name: e.target.value})} className="w-full p-3 rounded-xl border border-[#E2DED5] focus:outline-none focus:border-[#1A1A1A] bg-white" />
              </div>
              <div>
                <input required type="email" placeholder="Correo electrónico" value={clientData.email} onChange={e => setClientData({...clientData, email: e.target.value})} className="w-full p-3 rounded-xl border border-[#E2DED5] focus:outline-none focus:border-[#1A1A1A] bg-white" />
              </div>
              <div>
                <input required type="tel" placeholder="Teléfono" value={clientData.phone} onChange={e => setClientData({...clientData, phone: e.target.value})} className="w-full p-3 rounded-xl border border-[#E2DED5] focus:outline-none focus:border-[#1A1A1A] bg-white" />
              </div>
              
              <div className="mt-2">
                <label className="block text-sm font-medium text-[#5A5A5A] mb-2">Método de pago</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setClientData({...clientData, payment_method: 'cash'})} className={`p-3 rounded-xl border ${clientData.payment_method === 'cash' ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white' : 'border-[#E2DED5] bg-white text-[#1A1A1A]'} font-medium transition-colors`}>Efectivo en local</button>
                  <button type="button" onClick={() => setClientData({...clientData, payment_method: 'transfer'})} className={`p-3 rounded-xl border ${clientData.payment_method === 'transfer' ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white' : 'border-[#E2DED5] bg-white text-[#1A1A1A]'} font-medium transition-colors`}>MercadoPago</button>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-[#E2DED5] mt-2">
                <div className="flex justify-between text-sm mb-1"><span className="text-[#5A5A5A]">Servicio</span><span className="font-medium">{selectedService?.name}</span></div>
                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-[#E2DED5]"><span>Total</span><span>${selectedService?.price}</span></div>
              </div>
            </form>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-[#1A1A1A] mb-2">¡Turno Reservado!</h3>
              <p className="text-[#6A6A6A] mb-6">Te hemos enviado un correo a {clientData.email} con los detalles de tu cita.</p>
              <button onClick={resetAndClose} className="bg-[#1A1A1A] text-white px-8 py-3 rounded-full font-medium w-full">Volver al inicio</button>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        {step > 1 && step < 4 && (
          <div className="p-6 border-t border-[#E2DED5] flex gap-3">
            <button onClick={handleBack} className="px-6 py-3 rounded-full font-medium text-[#1A1A1A] bg-[#E2DED5] hover:bg-[#D4D0C5] transition-colors w-1/3">Atrás</button>
            
            {step === 2 && (
              <button disabled={!appointmentDate || !appointmentTime} onClick={handleNext} className="px-6 py-3 rounded-full font-medium text-white bg-[#1A1A1A] hover:bg-black transition-colors w-2/3 disabled:opacity-50">Continuar</button>
            )}
            
            {step === 3 && (
              <button type="submit" form="booking-form" disabled={loading} className="px-6 py-3 rounded-full font-medium text-white bg-[#1A1A1A] hover:bg-black transition-colors w-2/3 disabled:opacity-50">
                {loading ? 'Procesando...' : 'Confirmar Reserva'}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
