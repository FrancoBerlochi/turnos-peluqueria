"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import BookingModal from '@/components/BookingModal';
import ImageModal from '@/components/ImageModal';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { getServiceDisplayIcon, getCleanServiceDescription } from '@/components/ServiceModal';
import { API_URL } from '@/lib/api';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [gallery, setGallery] = useState<{id: string, image_url: string, title: string}[]>([]);
  const [services, setServices] = useState<{id: string, name: string, description: string, price: number, duration_minutes: number}[]>([]);
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sendingMessage, setSendingMessage] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSendingMessage(true);
    setTimeout(() => {
      setSendingMessage(false);
      toast.success('¡Gracias por tu mensaje! Nos pondremos en contacto pronto. ✨');
      setContactForm({ name: '', email: '', phone: '', message: '' });
    }, 600);
  };

  useEffect(() => {
    fetch(`${API_URL}/api/gallery`)
      .then(res => res.json())
      .then(data => setGallery(data))
      .catch(err => console.error(err));

    fetch(`${API_URL}/api/services`)
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-[#FAF9F6] text-[#2A2A2A] font-sans selection:bg-[#E2DED5]">
      
      {/* Sticky Navigation Header */}
      <header className="sticky top-0 z-30 w-full bg-[#FAF9F6]/90 backdrop-blur-md border-b border-[#E2DED5]/40 transition-all">
        <nav className="w-full flex justify-between items-center px-6 py-4 md:px-12 max-w-7xl mx-auto">
          <a href="#" className="font-display font-bold text-2xl tracking-tight">PELU<span className="text-[#8B8878] font-light">TURNOS</span></a>
          
          {/* Toggle Button: Hamburger */}
          {!isNavOpen ? (
            <button 
              onClick={() => setIsNavOpen(true)} 
              className="flex items-center gap-2.5 bg-[#1A1A1A] hover:bg-black text-white px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 shadow-md hover:scale-105 cursor-pointer"
              aria-label="Abrir menú"
            >
              <span className="flex flex-col gap-1 w-4">
                <span className="w-full h-0.5 bg-white rounded-full"></span>
                <span className="w-full h-0.5 bg-white rounded-full"></span>
                <span className="w-full h-0.5 bg-white rounded-full"></span>
              </span>
              <span>Menú</span>
            </button>
          ) : (
            <div className="w-10 h-10"></div> /* Placeholder to keep header height */
          )}
        </nav>
      </header>

      {/* Fixed Barber Pole Button when menu is active */}
      {isNavOpen && (
        <button
          onClick={() => setIsNavOpen(false)}
          className="fixed top-3 right-6 sm:right-12 z-50 flex items-center justify-center p-1 rounded-full bg-zinc-900 border-2 border-[#C0BEB8] shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer animate-in zoom-in-75 duration-200"
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

      {/* Navigation Dropdown / Drawer */}
      {isNavOpen && (
        <>
          {/* Backdrop */}
          <div 
            onClick={() => setIsNavOpen(false)} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          />

          {/* Menu Card */}
          <div className="fixed top-20 right-6 sm:right-12 z-50 w-[90vw] max-w-sm bg-[#FAF9F6] rounded-[2.5rem] border border-[#E2DED5] shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 slide-in-from-top-4 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-[#E2DED5] mb-5">
                <div className="font-display font-bold text-xl tracking-tight text-[#1A1A1A]">
                  PELU<span className="text-[#8B8878] font-light">TURNOS</span>
                </div>
                <span className="text-xs text-[#8B8878] font-semibold uppercase tracking-wider">Menú</span>
              </div>

              <nav className="flex flex-col gap-2 mb-6">
                <a 
                  href="#servicios" 
                  onClick={() => setIsNavOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white border border-transparent hover:border-[#E2DED5] text-[#1A1A1A] font-semibold text-base transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#EFECE3] flex items-center justify-center group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-lg">content_cut</span>
                  </div>
                  <span>Servicios</span>
                </a>

                <a 
                  href="#sobre-nosotros" 
                  onClick={() => setIsNavOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white border border-transparent hover:border-[#E2DED5] text-[#1A1A1A] font-semibold text-base transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#EFECE3] flex items-center justify-center group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-lg">storefront</span>
                  </div>
                  <span>Sobre Nosotros</span>
                </a>

                <a 
                  href="#galeria" 
                  onClick={() => setIsNavOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white border border-transparent hover:border-[#E2DED5] text-[#1A1A1A] font-semibold text-base transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#EFECE3] flex items-center justify-center group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-lg">photo_library</span>
                  </div>
                  <span>Nuestro Arte</span>
                </a>

                <a 
                  href="#contacto" 
                  onClick={() => setIsNavOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white border border-transparent hover:border-[#E2DED5] text-[#1A1A1A] font-semibold text-base transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#EFECE3] flex items-center justify-center group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-lg">location_on</span>
                  </div>
                  <span>Contacto</span>
                </a>
              </nav>

              {/* Action Buttons inside menu */}
              <div className="pt-4 border-t border-[#E2DED5] flex flex-col gap-3">
                <button
                  onClick={() => {
                    setIsNavOpen(false);
                    setIsModalOpen(true);
                  }}
                  className="w-full py-3.5 rounded-xl bg-[#1A1A1A] hover:bg-black text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">calendar_month</span>
                  <span>Agendar Turno</span>
                </button>

                <a
                  href="/admin"
                  className="w-full py-2 rounded-xl text-center text-xs font-semibold text-[#8B8878] hover:text-[#1A1A1A] hover:bg-[#EFECE3] transition-colors"
                >
                  Acceso Administrador →
                </a>
              </div>
            </div>
          </>
        )}

      {/* Hero Section */}
      <section className="w-full flex flex-col items-center justify-center pt-20 pb-24 px-6 md:pt-32 md:pb-32 text-center max-w-5xl mx-auto relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[400px] bg-gradient-to-b from-[#EFECE3] to-transparent blur-3xl -z-10 rounded-full opacity-60"></div>
        
        <h1 className="font-display text-5xl md:text-[5.5rem] font-bold tracking-tight leading-[1.05] mb-8 text-[#1A1A1A]">
          Eleva tu estilo. <br /> <span className="text-[#8B8878] italic font-light">Cuida tu esencia.</span>
        </h1>
        <p className="text-[#5A5A5A] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
          La experiencia de salón que mereces. Agenda tu próximo corte de forma intuitiva, rápida y a tu ritmo.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-5 items-center">
          <button onClick={() => setIsModalOpen(true)} className="bg-[#2A2A2A] text-white px-10 py-4 rounded-full font-medium text-lg hover:scale-105 hover:bg-black transition-all duration-300 shadow-lg">
            Agendar Turno
          </button>
          <button className="text-[#2A2A2A] px-8 py-4 font-medium text-lg flex items-center gap-2 hover:text-[#8B8878] transition-colors duration-300">
            Explorar Servicios <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* Services Preview Section */}
      <section id="servicios" className="w-full bg-white py-32 px-6 rounded-t-[3rem] md:rounded-t-[5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] mb-4">Experiencia Premium</h2>
            <p className="text-[#8B8878] max-w-xl mx-auto text-lg">Descubre nuestros servicios más solicitados, pensados para ti.</p>
          </div>
          
          {services.length === 0 ? (
            <div className="text-center py-12 px-6 bg-[#FAF9F6] rounded-[2rem] border border-[#E2DED5] max-w-lg mx-auto">
              <span className="material-symbols-outlined text-4xl text-[#8B8878] mb-3">content_cut</span>
              <p className="text-[#1A1A1A] font-semibold text-lg mb-1">Próximamente nuevos servicios</p>
              <p className="text-[#8B8878] text-sm">El barbero está preparando la lista de cortes y servicios disponibles.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map(srv => (
                <div 
                  key={srv.id}
                  onClick={() => setIsModalOpen(true)} 
                  className="bg-[#FAF9F6] p-10 rounded-[2rem] hover:-translate-y-2 transition-transform duration-500 cursor-pointer shadow-sm border border-transparent hover:border-[#E2DED5] flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-8 group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-2xl text-[#1A1A1A]">
                        {getServiceDisplayIcon(srv)}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl font-bold mb-3 tracking-tight text-[#1A1A1A]">{srv.name}</h3>
                    <p className="text-[#6A6A6A] mb-8 leading-relaxed text-sm">{getCleanServiceDescription(srv.description)}</p>
                  </div>
                  <div className="flex justify-between items-center border-t border-[#E2DED5] pt-6 mt-auto">
                    <span className="font-sans text-xl font-semibold text-[#1A1A1A]">${srv.price?.toLocaleString('es-AR')}</span>
                    <span className="text-xs font-bold text-[#8B8878] tracking-wider uppercase bg-white px-3 py-1.5 rounded-full shadow-sm">{srv.duration_minutes} min</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sobre Nosotros Section */}
      <section id="sobre-nosotros" className="w-full bg-white py-24 px-6 border-t border-[#E2DED5]/60">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#222222] rounded-[3rem] p-8 md:p-16 border border-zinc-800 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center shadow-2xl">
            
            {/* Barber Photo Card */}
            <div className="lg:col-span-5 flex items-center justify-center overflow-hidden rounded-[2.5rem] border border-zinc-800 shadow-2xl bg-[#181818] aspect-[3/4] max-h-[520px]">
              <img 
                src="/about-barber.jpg" 
                alt="Barbero PeluTurnos" 
                className="w-full h-full object-cover select-none"
              />
            </div>

            {/* Content Column */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="mb-4">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest bg-white/10 border border-white/10 px-3.5 py-1.5 rounded-full inline-block">
                  Nuestra Historia
                </span>
              </div>
              
              <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
                Sobre Nosotros
              </h2>
              
              <p className="text-zinc-200 text-lg font-medium leading-relaxed mb-4">
                PeluTurnos nació en 2018 con la visión de crear un espacio donde la tradición de la barbería se fusiona con las tendencias modernas.
              </p>
              
              <p className="text-zinc-400 leading-relaxed mb-4 text-base">
                Nuestro equipo está formado por barberos profesionales con años de experiencia y pasión por su oficio. Nos especializamos en cortes clásicos, modernos y diseños personalizados para todo tipo de cabello y estilo.
              </p>
              
              <p className="text-zinc-400 leading-relaxed mb-10 text-base">
                En PeluTurnos no solo ofrecemos cortes de cabello, sino una experiencia completa donde cada cliente se siente especial y sale con un look que refleja su personalidad.
              </p>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-800">
                <div className="text-left">
                  <div className="font-display text-3xl md:text-4xl font-bold text-white">5+</div>
                  <div className="text-xs text-zinc-400 uppercase font-semibold tracking-wider mt-1">Años de experiencia</div>
                </div>
                <div className="text-left border-l border-zinc-800 pl-4 md:pl-6">
                  <div className="font-display text-3xl md:text-4xl font-bold text-white">100+</div>
                  <div className="text-xs text-zinc-400 uppercase font-semibold tracking-wider mt-1">Clientes satisfechos</div>
                </div>
                <div className="text-left border-l border-zinc-800 pl-4 md:pl-6">
                  <div className="font-display text-3xl md:text-4xl font-bold text-white">4</div>
                  <div className="text-xs text-zinc-400 uppercase font-semibold tracking-wider mt-1">Barberos expertos</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="galeria" className="w-full bg-[#FAF9F6] py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] mb-4">Nuestro Arte</h2>
            <p className="text-[#8B8878] max-w-xl mx-auto text-lg">Desliza para ver nuestros trabajos destacados. Haz clic para agrandar.</p>
          </div>
          
          {gallery.length === 0 ? (
            <p className="text-center text-[#8B8878]">Próximamente más trabajos...</p>
          ) : (
            <div className="px-4">
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={24}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true, dynamicBullets: true }}
                autoplay={{ delay: 4500, disableOnInteraction: false }}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                  },
                  1024: {
                    slidesPerView: 3,
                    spaceBetween: 28,
                  },
                }}
                className="!pb-14"
              >
                {gallery.map(item => (
                  <SwiperSlide key={item.id}>
                    <div 
                      onClick={() => setSelectedImage({ url: item.image_url, title: item.title })}
                      className="relative group rounded-3xl overflow-hidden aspect-[4/5] bg-[#EFECE3] border border-[#E2DED5] flex items-center justify-center cursor-zoom-in shadow-sm hover:shadow-md transition-all"
                    >
                      <img 
                        src={item.image_url} 
                        alt={item.title || 'Corte'} 
                        className="w-full h-full object-contain p-2 select-none transition-opacity duration-200" 
                      />
                      
                      {/* Zoom Indicator Icon on Hover */}
                      <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-md">
                        <span className="material-symbols-outlined text-sm">zoom_in</span>
                      </div>

                      {item.title && (
                        <div className="absolute bottom-3 left-3 right-3 py-2 px-3 rounded-xl bg-black/70 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none text-center">
                          <span className="font-semibold text-sm truncate block">{item.title}</span>
                        </div>
                      )}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="w-full bg-white py-24 px-6 border-t border-[#E2DED5]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Column: Info */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full">
              <div>
                <div className="mb-3">
                  <span className="text-xs font-bold text-[#8B8878] uppercase tracking-widest bg-[#EFECE3] px-3.5 py-1.5 rounded-full inline-block">
                    Encuéntranos
                  </span>
                </div>
                
                <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A] mb-4">
                  Contáctanos
                </h2>
                
                <p className="text-[#6A6A6A] leading-relaxed mb-8 max-w-md">
                  Estamos aquí para responder tus preguntas y ayudarte a obtener ese nuevo look.
                </p>

                {/* Items */}
                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-[#FAF9F6] border border-[#E2DED5] flex items-center justify-center shrink-0 shadow-sm text-[#1A1A1A]">
                      <span className="material-symbols-outlined text-xl">location_on</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#8B8878] mb-0.5">Ubicación</p>
                      <p className="text-sm font-medium text-[#1A1A1A] leading-relaxed">
                        Juan Bautista Alberdi 1530, S2126 Pueblo Esther, Santa Fe
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-[#FAF9F6] border border-[#E2DED5] flex items-center justify-center shrink-0 shadow-sm text-[#1A1A1A]">
                      <span className="material-symbols-outlined text-xl">call</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#8B8878] mb-0.5">Teléfono / WhatsApp</p>
                      <a 
                        href="https://wa.me/543413941580" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-sm font-medium text-[#1A1A1A] hover:text-[#8B8878] transition-colors"
                      >
                        +54 341 394-1580
                      </a>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-[#FAF9F6] border border-[#E2DED5] flex items-center justify-center shrink-0 shadow-sm text-[#1A1A1A]">
                      <span className="material-symbols-outlined text-xl">schedule</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#8B8878] mb-0.5">Horarios de Atención</p>
                      <p className="text-sm text-[#1A1A1A] leading-relaxed">
                        <span className="font-semibold">Lunes:</span> 5:00 PM – 8:30 PM<br />
                        <span className="font-semibold">Martes a Sábado:</span> 10:00 AM – 1:00 PM & 5:00 PM – 8:30 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Buttons */}
              <div className="flex items-center gap-3 pt-8 mt-6 border-t border-[#E2DED5]">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                  title="Instagram"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a 
                  href="https://wa.me/543413941580" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-11 h-11 rounded-2xl bg-[#25D366] text-white flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                  title="WhatsApp"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                  </a>
                </div>
            </div>

            {/* Right Column: Form */}
            <div className="lg:col-span-7 bg-[#FAF9F6] p-8 md:p-12 rounded-[2.5rem] border border-[#E2DED5] shadow-sm">
              <form onSubmit={handleContactSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5A5A5A] mb-2">Nombre</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Tu nombre" 
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full p-3.5 rounded-xl border border-[#E2DED5] bg-white focus:outline-none focus:border-[#1A1A1A] text-sm shadow-sm transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5A5A5A] mb-2">Email</label>
                    <input 
                      required
                      type="email" 
                      placeholder="tu@email.com" 
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full p-3.5 rounded-xl border border-[#E2DED5] bg-white focus:outline-none focus:border-[#1A1A1A] text-sm shadow-sm transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5A5A5A] mb-2">Teléfono</label>
                  <input 
                    type="tel" 
                    placeholder="Tu teléfono" 
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full p-3.5 rounded-xl border border-[#E2DED5] bg-white focus:outline-none focus:border-[#1A1A1A] text-sm shadow-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5A5A5A] mb-2">Mensaje</label>
                  <textarea 
                    required
                    rows={4} 
                    placeholder="Tu mensaje..." 
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full p-3.5 rounded-xl border border-[#E2DED5] bg-white focus:outline-none focus:border-[#1A1A1A] text-sm shadow-sm resize-none transition-colors"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={sendingMessage}
                  className="w-full py-4 rounded-xl bg-[#1A1A1A] hover:bg-black text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {sendingMessage ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Enviando mensaje...</span>
                    </>
                  ) : (
                    <>
                      <span>Enviar Mensaje</span>
                      <span className="material-symbols-outlined text-base">send</span>
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#FAF9F6] py-8 px-6 border-t border-[#E2DED5] text-center text-xs text-[#8B8878]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} PeluTurnos. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#1A1A1A] transition-colors">Instagram</a>
            <a href="https://wa.me/543413941580" target="_blank" rel="noreferrer" className="hover:text-[#1A1A1A] transition-colors">WhatsApp</a>
            <button onClick={() => setIsModalOpen(true)} className="hover:text-[#1A1A1A] transition-colors font-medium">Reservar Turno</button>
          </div>
        </div>
      </footer>

      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* Lightbox / Zoom Modal */}
      <ImageModal
        isOpen={!!selectedImage}
        imageUrl={selectedImage?.url || null}
        title={selectedImage?.title}
        onClose={() => setSelectedImage(null)}
      />
    </main>
  );
}

