import React, { useState } from 'react';
import { 
  Compass, LogIn, ArrowRight, ArrowLeft, Search, Building, BedDouble, 
  Calendar, CheckCircle2, ShieldCheck, MapPin, Phone, Mail, Clock, 
  CreditCard, Sparkles, Users, FileText, ChevronRight, HelpCircle, 
  BookOpen, Star, Award, Coffee, Wifi, Tv, Utensils, Info, Check, 
  Calculator, Tag, Printer, ExternalLink, Menu, X, Landmark, School
} from 'lucide-react';
import { db } from '../../db/database';
import { RoomType, Facility } from '../../types';
import { SelfServiceLookupModal } from '../../components/operations/SelfServiceLookupModal';
import { HelpGuideModal } from '../../components/common/HelpGuideModal';
import { PublicSelfBookingModal } from '../../components/operations/PublicSelfBookingModal';
import { formatCurrency } from '../../utils/formatters';

interface LandingPageProps {
  onGoToLogin: () => void;
  currentUser?: any;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onGoToLogin,
  currentUser 
}) => {
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingCategory, setBookingCategory] = useState<'PENGINAPAN' | 'RUANG_PERTEMUAN'>('PENGINAPAN');
  const [bookingItemId, setBookingItemId] = useState<string>('rt-sup');
  const [bookingUnitCount, setBookingUnitCount] = useState<number>(1);
  const [bookingDuration, setBookingDuration] = useState<number>(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openBookingModal = (category: 'PENGINAPAN' | 'RUANG_PERTEMUAN', itemId?: string, unitCount: number = 1, duration: number = 1) => {
    setBookingCategory(category);
    if (itemId) setBookingItemId(itemId);
    setBookingUnitCount(unitCount);
    setBookingDuration(duration);
    setIsBookingOpen(true);
  };

  // Quick Mini Lookup on Hero
  const [quickQuery, setQuickQuery] = useState('');
  const [quickResult, setQuickResult] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Dynamic Master Data from Database
  const [roomTypes] = useState<RoomType[]>(() => db.getRoomTypes());
  const [facilities] = useState<Facility[]>(() => db.getFacilities());

  const superiorType = roomTypes.find(rt => rt.id === 'rt-sup' || rt.code === 'SUP') || {
    id: 'rt-sup',
    name: 'Superior',
    code: 'SUP',
    category: 'PENGINAPAN' as const,
    description: 'Kamar Superior representatif Gedung Mina',
    default_capacity: 2,
    capacity: 2,
    base_rate_per_night: 300000,
    base_rate: 300000,
    rate_unit: 'PER_NIGHT' as const,
    amenities: ['Double Bed', 'AC', 'Meja', 'Lemari', 'Closet Duduk']
  };

  const standarType = roomTypes.find(rt => rt.id === 'rt-std' || rt.code === 'STD') || {
    id: 'rt-std',
    name: 'Standar',
    code: 'STD',
    category: 'PENGINAPAN' as const,
    description: 'Kamar Standar representatif Gedung Mina',
    default_capacity: 2,
    capacity: 2,
    base_rate_per_night: 250000,
    base_rate: 250000,
    rate_unit: 'PER_NIGHT' as const,
    amenities: ['2 Single Bed', 'AC', 'Meja', 'Lemari', 'Closet Duduk']
  };

  const aulaFacility = facilities.find(f => f.id === 'fac-1' || f.name.toLowerCase().includes('aula')) || {
    id: 'fac-1',
    name: 'Aula',
    type: 'AULA' as const,
    category: 'RUANG_PERTEMUAN' as const,
    location: 'Gedung Serbaguna',
    capacity: 300,
    daily_rate: 3900000,
    rate_unit: 'PER_DAY' as const,
    status: 'AVAILABLE' as const,
    description: 'Aula pertemuan kapasitas s.d 300 orang',
    amenities: ['Sound System', 'Infocus / Proyektor', 'AC', 'Kursi']
  };

  const ruangKelasFacility = facilities.find(f => f.id === 'fac-class' || f.name.toLowerCase().includes('kelas')) || {
    id: 'fac-class',
    name: 'Ruang Kelas',
    type: 'RUANG_RAPAT' as const,
    category: 'RUANG_PERTEMUAN' as const,
    location: 'Gedung Diklat & Pembinaan',
    capacity: 30,
    daily_rate: 650000,
    rate_unit: 'PER_DAY' as const,
    status: 'AVAILABLE' as const,
    description: 'Ruang kelas diklat & bimbingan kapasitas s.d 30 orang',
    amenities: ['Sound System', 'Infocus / Proyektor', 'AC', 'Kursi']
  };

  // Cost Calculator State
  const [calcCategory, setCalcCategory] = useState<'PENGINAPAN' | 'RUANG_PERTEMUAN'>('PENGINAPAN');
  const [calcItemId, setCalcItemId] = useState('rt-sup');
  const [calcUnitCount, setCalcUnitCount] = useState(1);
  const [calcDuration, setCalcDuration] = useState(2);

  const calculateTotal = () => {
    if (calcCategory === 'PENGINAPAN') {
      const selectedRt = roomTypes.find(r => r.id === calcItemId) || superiorType;
      const rate = selectedRt.base_rate_per_night || selectedRt.base_rate || 300000;
      // Formula: Jumlah Malam × Tarif Kamar × Jumlah Kamar
      return calcDuration * rate * calcUnitCount;
    } else {
      const selectedFac = facilities.find(f => f.id === calcItemId) || aulaFacility;
      const rate = selectedFac.daily_rate || 3900000;
      // Formula: Jumlah Hari × Tarif Ruangan × Jumlah Unit
      return calcDuration * rate * calcUnitCount;
    }
  };

  const getSelectedRate = () => {
    if (calcCategory === 'PENGINAPAN') {
      const selectedRt = roomTypes.find(r => r.id === calcItemId) || superiorType;
      return selectedRt.base_rate_per_night || selectedRt.base_rate || 300000;
    } else {
      const selectedFac = facilities.find(f => f.id === calcItemId) || aulaFacility;
      return selectedFac.daily_rate || 3900000;
    }
  };

  const handleQuickSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const queryToSearch = quickQuery.trim() || 'Siti Rahma';
    if (!quickQuery.trim()) {
      setQuickQuery(queryToSearch);
    }
    setHasSearched(true);
    const res = db.lookupAccommodation(queryToSearch);
    setQuickResult(res);
    setIsLookupOpen(true);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1A1410] font-sans selection:bg-[#c9a961] selection:text-[#1A1410]">
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-[#1A1410] via-[#2A2018] to-[#1A1410] text-white text-[11px] py-2 px-4 border-b border-[#c9a961]/20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-stone-300 font-medium">
              UPT Asrama Haji Transit Jayapura &bull; Provinsi Papua (Zona Waktu WIT)
            </span>
          </div>
          <div className="flex items-center gap-4 text-stone-300">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#c9a961]" />
              <span>Front Desk 24 Jam: <strong>(0967) 581-229</strong></span>
            </div>
            <div className="hidden md:flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#c9a961]" />
              <span>Check-in: 14:00 WIT &bull; Check-out: 12:00 WIT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-[#e8dfc8] shadow-2xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
          {/* Logo & Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-[#c9a961] via-[#d4af37] to-[#b8941e] p-0.5 shadow-md flex items-center justify-center shrink-0">
              <img 
                src="/logo.png" 
                alt="Logo Kementerian Haji dan Umrah RI" 
                className="w-full h-full object-contain rounded-full bg-[#1A1410]"
              />
            </div>
            <div className="whitespace-nowrap">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl tracking-tight text-[#1A1410]">SIMAHA</span>
                <span className="text-[10px] font-black bg-[#fbf8ee] text-[#8a6d2b] border border-[#e8dfc8] px-1.5 py-0.5 rounded">
                  PAPUA
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-bold text-[#8a6d2b] leading-tight">
                Kementerian Haji dan Umrah RI
              </p>
              <p className="text-[9px] sm:text-[10px] text-stone-500 font-medium">
                UPT Asrama Haji Transit Jayapura &bull; Provinsi Papua
              </p>
            </div>
          </div>

          {/* Nav Links Desktop */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-bold text-stone-600 shrink-0">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              className="px-2.5 py-1.5 rounded-lg whitespace-nowrap text-[#8a6d2b] hover:bg-[#fbf8ee] transition-colors"
            >
              Beranda
            </button>
            <button 
              onClick={() => scrollToSection('kamar-tarif')} 
              className="px-2.5 py-1.5 rounded-lg whitespace-nowrap hover:text-[#8a6d2b] hover:bg-[#fbf8ee] transition-colors"
            >
              Kamar & Tarif
            </button>
            <button 
              onClick={() => scrollToSection('kalkulator')} 
              className="px-2.5 py-1.5 rounded-lg whitespace-nowrap hover:text-[#8a6d2b] hover:bg-[#fbf8ee] transition-colors"
            >
              Simulasi Biaya
            </button>
            <button 
              onClick={() => scrollToSection('fasilitas')} 
              className="px-2.5 py-1.5 rounded-lg whitespace-nowrap hover:text-[#8a6d2b] hover:bg-[#fbf8ee] transition-colors"
            >
              Fasilitas MICE
            </button>
            <button 
              onClick={() => scrollToSection('layanan-haji')} 
              className="px-2.5 py-1.5 rounded-lg whitespace-nowrap hover:text-[#8a6d2b] hover:bg-[#fbf8ee] transition-colors"
            >
              Layanan Haji
            </button>
            <button 
              onClick={() => scrollToSection('kontak')} 
              className="px-2.5 py-1.5 rounded-lg whitespace-nowrap hover:text-[#8a6d2b] hover:bg-[#fbf8ee] transition-colors"
            >
              Kontak
            </button>
          </nav>

          {/* Action Button: Booking Online, Cek Kamar & Login */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openBookingModal('PENGINAPAN', 'rt-sup')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-[#1A1410] bg-gradient-to-r from-[#f7cf6e] via-[#c9a961] to-[#d4af37] hover:from-[#fbe29a] hover:to-[#c9a961] border border-[#b8941e] transition-all shadow-[0_2px_8px_rgba(201,169,97,0.35)] whitespace-nowrap cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#1A1410] shrink-0" />
              <span>Booking Mandiri</span>
            </button>

            <button
              onClick={() => setIsLookupOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#8a6d2b] bg-[#fbf8ee] hover:bg-[#f4ebd0] border border-[#e8dfc8] transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[#c9a961] shrink-0" />
              <span>Cek Kamar</span>
            </button>

            <button
              onClick={onGoToLogin}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#c9a961] to-[#b8941e] hover:from-[#b8941e] hover:to-[#a27f14] border border-[#c9a961] shadow-[0_2px_8px_rgba(201,169,97,0.3)] hover:shadow-[0_4px_12px_rgba(201,169,97,0.4)] transition-all cursor-pointer group whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform shrink-0" />
              <span>{currentUser ? 'Dashboard' : 'Login'}</span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-stone-700 hover:bg-[#fbf8ee] border border-[#e8dfc8] transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FAF9F5] border-t border-[#e8dfc8] px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2">
            <button 
              onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMobileMenuOpen(false); }} 
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-[#8a6d2b] hover:bg-[#fbf8ee]"
            >
              Beranda
            </button>
            <button 
              onClick={() => { scrollToSection('kamar-tarif'); setMobileMenuOpen(false); }} 
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-stone-700 hover:bg-[#fbf8ee]"
            >
              Kamar & Tarif
            </button>
            <button 
              onClick={() => { scrollToSection('kalkulator'); setMobileMenuOpen(false); }} 
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-stone-700 hover:bg-[#fbf8ee]"
            >
              Simulasi Biaya
            </button>
            <button 
              onClick={() => { scrollToSection('fasilitas'); setMobileMenuOpen(false); }} 
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-stone-700 hover:bg-[#fbf8ee]"
            >
              Fasilitas MICE
            </button>
            <button 
              onClick={() => { scrollToSection('layanan-haji'); setMobileMenuOpen(false); }} 
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-stone-700 hover:bg-[#fbf8ee]"
            >
              Layanan Haji
            </button>
            <button 
              onClick={() => { scrollToSection('kontak'); setMobileMenuOpen(false); }} 
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-stone-700 hover:bg-[#fbf8ee]"
            >
              Kontak & Lokasi
            </button>
            <div className="pt-2 border-t border-[#e8dfc8] flex flex-col gap-2">
              <button
                onClick={() => { openBookingModal('PENGINAPAN', 'rt-sup'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 rounded-xl text-xs font-black text-[#1A1410] bg-gradient-to-r from-[#f7cf6e] to-[#c9a961] text-center shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Booking Mandiri Online</span>
              </button>
              <button
                onClick={() => { setIsLookupOpen(true); setMobileMenuOpen(false); }}
                className="w-full py-2 rounded-xl text-xs font-bold text-[#8a6d2b] bg-[#fbf8ee] border border-[#e8dfc8] text-center"
              >
                Cek Kamar (Kiosk)
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1A1410] via-[#2A2018] to-[#1A1410] text-white pt-14 pb-24 px-4 sm:px-6 lg:px-8 border-b border-[#c9a961]/20">
        {/* Subtle decorative background circles & mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(#c9a961_1px,transparent_1px)] [background-size:28px_28px] opacity-15 pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#c9a961]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 -right-40 w-96 h-96 bg-[#b8941e]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A1410]/90 border border-[#c9a961]/40 text-[#c9a961] text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#c9a961]" />
                <span>Sistem Informasi Manajemen Asrama Haji (SIMAHA) Terpadu Papua</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight sm:leading-[1.15]">
                Pusat Layanan Akomodasi <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f7cf6e] via-[#c9a961] to-[#e8dfc8]">
                  Haji & Penginapan MICE
                </span> <br />
                Provinsi Papua
              </h1>

              <p className="text-sm sm:text-base text-stone-200/90 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Selamat datang di <strong>SIMAHA Papua</strong>. Terpadu melayani embarkasi haji antara, akomodasi kedinasan, kegiatan <strong>MICE</strong> (<em>Meeting, Incentive, Convention & Exhibition</em> — rapat kerja dinas, diklat, bimtek & sewa aula pertemuan), serta penginapan umum berstandar perhotelan syariah dengan kode billing PNBP SIMPONI resmi Kementerian Agama RI.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => openBookingModal('PENGINAPAN', 'rt-sup')}
                  className="px-6 py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-[#f7cf6e] via-[#c9a961] to-[#d4af37] hover:from-[#fbe29a] hover:to-[#c9a961] text-[#1A1410] shadow-[0_4px_16px_rgba(201,169,97,0.4)] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-[#1A1410]" />
                  <span>Booking Kamar / Aula Mandiri</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onGoToLogin}
                  className="px-5 py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white border border-[#c9a961]/40 shadow-sm hover:shadow-[#c9a961]/30 transition-all flex items-center gap-2 cursor-pointer backdrop-blur-xs"
                >
                  <LogIn className="w-4 h-4 text-[#c9a961]" />
                  <span>{currentUser ? 'Dashboard Petugas' : 'Portal Login'}</span>
                </button>

                <button
                  onClick={() => setIsLookupOpen(true)}
                  className="px-4 py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/15 text-white border border-[#c9a961]/30 transition-all flex items-center gap-2 cursor-pointer backdrop-blur-xs"
                >
                  <Search className="w-4 h-4 text-[#c9a961]" />
                  <span>Cek Kamar Jemaah</span>
                </button>

                <button
                  onClick={() => setIsHelpOpen(true)}
                  className="px-4 py-3.5 rounded-xl font-bold text-sm text-[#c9a961] hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4 text-[#c9a961]" />
                  <span>SOP & Panduan</span>
                </button>
              </div>

              {/* Verified Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-stone-300">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#c9a961]" />
                  <span>Tarif Resmi PP PNBP Kemenag</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#c9a961]" />
                  <span>Front Desk POS 24 Jam Nonstop</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-[#c9a961]" />
                  <span>Standar Kebersihan Harian</span>
                </div>
              </div>
            </div>

            {/* Right Hero Card: Quick Room & SPMA Lookup Kiosk */}
            <div className="lg:col-span-5">
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#e8dfc8] text-stone-800">
                <div className="flex items-center justify-between pb-4 border-b border-[#e8dfc8]">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#8a6d2b] bg-[#fbf8ee] border border-[#e8dfc8] px-2 py-0.5 rounded-full">
                      Anjungan Mandiri (Kiosk)
                    </span>
                    <h3 className="text-lg font-black text-stone-900 mt-1">Cek Kamar & Tempat Tidur</h3>
                    <p className="text-xs text-stone-500">Cari penempatan kamar jemaah haji & tamu umum</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#fbf8ee] text-[#8a6d2b] flex items-center justify-center border border-[#e8dfc8]">
                    <Search className="w-5 h-5" />
                  </div>
                </div>

                <form onSubmit={handleQuickSearch} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Nama Lengkap, No. Porsi, atau No. SPMA
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={quickQuery}
                        onChange={(e) => setQuickQuery(e.target.value)}
                        placeholder="Contoh: Siti Rahma / 2800123456"
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#FAF9F5] border border-[#e8dfc8] rounded-xl focus:ring-2 focus:ring-[#c9a961] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    onClick={handleQuickSearch}
                    onMouseDown={(e) => e.preventDefault()}
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#c9a961] to-[#b8941e] hover:from-[#b8941e] hover:to-[#a27f14] text-white shadow-[0_2px_8px_rgba(201,169,97,0.3)] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Periksa Penempatan Sekarang</span>
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                    <span>Uji Coba:</span>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => { 
                          setQuickQuery('Siti Rahma'); 
                          setHasSearched(true); 
                          setQuickResult(db.lookupAccommodation('Siti Rahma')); 
                          setIsLookupOpen(true);
                        }}
                        className="text-[#8a6d2b] hover:underline font-semibold cursor-pointer"
                      >
                        Siti Rahma
                      </button>
                      <span>&bull;</span>
                      <button 
                        type="button" 
                        onClick={() => { 
                          setQuickQuery('Ahmad Dahlan'); 
                          setHasSearched(true); 
                          setQuickResult(db.lookupAccommodation('Ahmad Dahlan')); 
                          setIsLookupOpen(true);
                        }}
                        className="text-[#8a6d2b] hover:underline font-semibold cursor-pointer"
                      >
                        Ahmad Dahlan
                      </button>
                    </div>
                  </div>
                </form>

                {/* Quick Result Preview */}
                {hasSearched && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-[#fbf8ee] border border-[#e8dfc8] text-xs animate-in fade-in duration-200">
                    {quickResult?.found ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#1A1410]">{quickResult.guest.name}</span>
                          <span className="text-[10px] font-black bg-[#f4ebd0] text-[#8a6d2b] px-2 py-0.5 rounded-full border border-[#e8dfc8]">
                            TERALOKASI
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-700 bg-white p-2.5 rounded-xl border border-[#e8dfc8]">
                          <div>
                            <span className="text-stone-400 block text-[10px]">Gedung</span>
                            <strong className="text-stone-900">{quickResult.building?.name || 'Gedung Mina'}</strong>
                          </div>
                          <div>
                            <span className="text-stone-400 block text-[10px]">Kamar / Tempat Tidur</span>
                            <strong className="text-[#8a6d2b]">
                              Kamar {quickResult.room?.roomNumber || 'M101'} &bull; Bed {quickResult.bed?.bedNumber || 'M101-B01'}
                            </strong>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsLookupOpen(true)}
                          className="w-full text-center text-xs font-bold text-[#8a6d2b] hover:underline py-1"
                        >
                          Lihat Detail Lengkap & SPMA Digital &rarr;
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-2 text-stone-500">
                        <p className="font-medium text-xs text-rose-700">Data belum ditemukan.</p>
                        <p className="text-[11px] text-stone-500 mt-0.5">Pastikan nama atau nomor porsi yang dimasukkan sudah terdaftar.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Highlight Stats Counter */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="bg-white/10 backdrop-blur-xs border border-[#c9a961]/20 p-4 rounded-2xl text-center">
              <Building className="w-5 h-5 text-[#c9a961] mx-auto mb-1.5" />
              <div className="text-2xl font-black text-white">Gedung Mina</div>
              <div className="text-[11px] text-stone-300 font-medium">Gedung Utama (2 Lantai)</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-[#c9a961]/20 p-4 rounded-2xl text-center">
              <BedDouble className="w-5 h-5 text-[#c9a961] mx-auto mb-1.5" />
              <div className="text-2xl font-black text-white">32 Kamar</div>
              <div className="text-[11px] text-stone-300 font-medium">2 Superior &bull; 30 Standar</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-[#c9a961]/20 p-4 rounded-2xl text-center">
              <Users className="w-5 h-5 text-[#c9a961] mx-auto mb-1.5" />
              <div className="text-2xl font-black text-white">64 Tempat Tidur</div>
              <div className="text-[11px] text-stone-300 font-medium">Kapasitas Tempat Tidur Resmi</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-[#c9a961]/20 p-4 rounded-2xl text-center">
              <Clock className="w-5 h-5 text-[#c9a961] mx-auto mb-1.5" />
              <div className="text-2xl font-black text-white">14:00 / 12:00</div>
              <div className="text-[11px] text-stone-300 font-medium">Check-in 14.00 &bull; Out 12.00 WIT</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-[#c9a961]/20 p-4 rounded-2xl text-center col-span-2 sm:col-span-1">
              <CreditCard className="w-5 h-5 text-[#c9a961] mx-auto mb-1.5" />
              <div className="text-2xl font-black text-white">SIMPONI</div>
              <div className="text-[11px] text-stone-300 font-medium">100% Terintegrasi PNBP Resmi</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Room Types & Official PNBP Rates */}
      <section id="kamar-tarif" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-black uppercase tracking-widest text-[#8a6d2b] bg-[#fbf8ee] border border-[#e8dfc8] px-3 py-1 rounded-full">
            Tarif Resmi PNBP (PP No. 59/2020)
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-3">
            Pilihan Tipe Kamar & Penginapan
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
            Menyediakan akomodasi nyaman berstandar perhotelan untuk jemaah haji, tamu instansi pemerintah, BUMN, lembaga swasta, maupun masyarakat umum dengan tarif resmi negara.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Kamar Superior */}
          <div className="bg-white rounded-3xl border border-[#e8dfc8] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
            <div className="h-44 bg-gradient-to-tr from-[#1A1410] via-[#2A2018] to-[#382b20] relative p-6 flex flex-col justify-between text-white">
              <div className="flex justify-between items-start">
                <span className="bg-[#c9a961] text-[#1A1410] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-2xs">
                  Tersedia 2 Kamar
                </span>
                <span className="text-[11px] font-bold text-[#c9a961]">Kode PNBP 425111</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white">{superiorType.name}</h3>
                <p className="text-xs text-[#FAF9F5]/80">Gedung Mina &bull; Kapasitas {superiorType.capacity || superiorType.default_capacity} Orang</p>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#1A1410]">{formatCurrency(superiorType.base_rate || superiorType.base_rate_per_night)}</span>
                  <span className="text-xs text-stone-500 font-medium">/ malam</span>
                </div>
                <div className="text-[11px] font-semibold text-[#8a6d2b] bg-[#fbf8ee] px-2.5 py-1 rounded-lg border border-[#e8dfc8]">
                  Check-in: 14.00 WIT &bull; Check-out: 12.00 WIT
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Kamar superior representatif eksklusif hanya tersedia 2 unit di Lantai 1 Gedung Mina (M101 & M102). Cocok untuk tamu VIP, pejabat instansi, atau keluarga.
                </p>
                <div className="pt-2 border-t border-[#e8dfc8] space-y-2 text-xs text-stone-700">
                  {superiorType.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#c9a961] shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#c9a961] shrink-0" />
                    <span>2 Unit Fisik (M101, M102)</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => openBookingModal('PENGINAPAN', superiorType.id, 1, 1)}
                  className="w-full py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-[#c9a961] to-[#b8941e] hover:from-[#b8941e] hover:to-[#a27f14] text-white transition-all text-center shadow-[0_2px_8px_rgba(201,169,97,0.3)] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Booking Mandiri Online</span>
                </button>
                <button 
                  onClick={() => { 
                    setCalcCategory('PENGINAPAN'); 
                    setCalcItemId(superiorType.id); 
                    scrollToSection('kalkulator'); 
                  }}
                  className="w-full py-2 rounded-xl font-bold text-xs bg-[#FAF9F5] hover:bg-[#fbf8ee] text-stone-700 border border-[#e8dfc8] transition-all text-center cursor-pointer"
                >
                  Simulasikan Biaya
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Kamar Standar */}
          <div className="bg-white rounded-3xl border-2 border-[#c9a961] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group relative">
            <div className="absolute top-0 right-0 bg-[#c9a961] text-[#1A1410] font-black text-[10px] uppercase px-4 py-1 rounded-bl-xl shadow-xs z-10">
              Tersedia 30 Kamar
            </div>
            <div className="h-44 bg-gradient-to-tr from-[#2A2018] via-[#382b20] to-[#1A1410] relative p-6 flex flex-col justify-between text-white">
              <div className="flex justify-between items-start">
                <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  Paling Populer
                </span>
                <span className="text-[11px] font-bold text-[#c9a961]">Kode PNBP 425111</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white">{standarType.name}</h3>
                <p className="text-xs text-[#FAF9F5]/80">Gedung Mina &bull; Kapasitas {standarType.capacity || standarType.default_capacity} Orang</p>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#1A1410]">{formatCurrency(standarType.base_rate || standarType.base_rate_per_night)}</span>
                  <span className="text-xs text-stone-500 font-medium">/ malam</span>
                </div>
                <div className="text-[11px] font-semibold text-[#8a6d2b] bg-[#fbf8ee] px-2.5 py-1 rounded-lg border border-[#e8dfc8]">
                  Check-in: 14.00 WIT &bull; Check-out: 12.00 WIT
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Akomodasi standar hotel yang nyaman dan higienis. Tersedia 30 unit di Lantai 1 & Lantai 2 Gedung Mina untuk tamu kedinasan, diklat, bimbingan, maupun umum.
                </p>
                <div className="pt-2 border-t border-[#e8dfc8] space-y-2 text-xs text-stone-700">
                  {standarType.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#c9a961] shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#c9a961] shrink-0" />
                    <span>30 Unit Fisik (M103-M116 & M201-M216)</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => openBookingModal('PENGINAPAN', standarType.id, 1, 1)}
                  className="w-full py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-[#c9a961] to-[#b8941e] hover:from-[#b8941e] hover:to-[#a27f14] text-white transition-all text-center shadow-[0_2px_8px_rgba(201,169,97,0.3)] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Booking Mandiri Online</span>
                </button>
                <button 
                  onClick={() => { 
                    setCalcCategory('PENGINAPAN'); 
                    setCalcItemId(standarType.id); 
                    scrollToSection('kalkulator'); 
                  }}
                  className="w-full py-2 rounded-xl font-bold text-xs bg-[#FAF9F5] hover:bg-[#fbf8ee] text-stone-700 border border-[#e8dfc8] transition-all text-center cursor-pointer"
                >
                  Simulasikan Biaya
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Aula */}
          <div className="bg-white rounded-3xl border border-[#e8dfc8] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
            <div className="h-44 bg-gradient-to-tr from-[#1A1410] via-[#2A2018] to-[#1A1410] relative p-6 flex flex-col justify-between text-white">
              <div className="flex justify-between items-start">
                <span className="bg-[#c9a961]/20 text-[#c9a961] border border-[#c9a961]/40 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  Ruang Pertemuan
                </span>
                <span className="text-[11px] font-bold text-stone-300">Kode PNBP 425112</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white">{aulaFacility.name}</h3>
                <p className="text-xs text-stone-300">Kapasitas Maksimal {aulaFacility.capacity} Orang &bull; Tarif Harian</p>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#1A1410]">{formatCurrency(aulaFacility.daily_rate)}</span>
                  <span className="text-xs text-stone-500 font-medium">/ hari</span>
                </div>
                <div className="text-[11px] font-semibold text-[#8a6d2b] bg-[#fbf8ee] px-2.5 py-1 rounded-lg border border-[#e8dfc8]">
                  Sewa Fasilitas MICE &bull; PP No. 59/2020
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Gedung serbaguna megah untuk konvensi, pelepasan jemaah haji, resepsi, wisuda, rapat akbar dinas, bimbingan teknis, dan pameran.
                </p>
                <div className="pt-2 border-t border-[#e8dfc8] space-y-2 text-xs text-stone-700">
                  {aulaFacility.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#c9a961] shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#c9a961] shrink-0" />
                    <span>Kapasitas s.d {aulaFacility.capacity} Orang</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => openBookingModal('RUANG_PERTEMUAN', aulaFacility.id, 1, 1)}
                  className="w-full py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-[#c9a961] to-[#b8941e] hover:from-[#b8941e] hover:to-[#a27f14] text-white transition-all text-center shadow-[0_2px_8px_rgba(201,169,97,0.3)] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Booking Aula Online</span>
                </button>
                <button 
                  onClick={() => { 
                    setCalcCategory('RUANG_PERTEMUAN'); 
                    setCalcItemId(aulaFacility.id); 
                    scrollToSection('kalkulator'); 
                  }}
                  className="w-full py-2 rounded-xl font-bold text-xs bg-[#FAF9F5] hover:bg-[#fbf8ee] text-stone-700 border border-[#e8dfc8] transition-all text-center cursor-pointer"
                >
                  Simulasikan Biaya
                </button>
              </div>
            </div>
          </div>

          {/* Card 4: Ruang Kelas */}
          <div className="bg-white rounded-3xl border border-[#e8dfc8] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
            <div className="h-44 bg-gradient-to-tr from-[#2A2018] via-[#1A1410] to-[#2A2018] relative p-6 flex flex-col justify-between text-white">
              <div className="flex justify-between items-start">
                <span className="bg-[#c9a961]/20 text-[#c9a961] border border-[#c9a961]/40 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  Ruang Pertemuan
                </span>
                <span className="text-[11px] font-bold text-stone-300">Kode PNBP 425112</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white">{ruangKelasFacility.name}</h3>
                <p className="text-xs text-stone-300">Kapasitas Maksimal {ruangKelasFacility.capacity} Orang &bull; Tarif Harian</p>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#1A1410]">{formatCurrency(ruangKelasFacility.daily_rate)}</span>
                  <span className="text-xs text-stone-500 font-medium">/ hari</span>
                </div>
                <div className="text-[11px] font-semibold text-[#8a6d2b] bg-[#fbf8ee] px-2.5 py-1 rounded-lg border border-[#e8dfc8]">
                  Sewa Fasilitas Diklat &bull; PP No. 59/2020
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Ruang kelas representatif untuk kegiatan bimbingan manasik, diklat kedinasan, pelatihan instansi, dan rapat komite terfokus.
                </p>
                <div className="pt-2 border-t border-[#e8dfc8] space-y-2 text-xs text-stone-700">
                  {ruangKelasFacility.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#c9a961] shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#c9a961] shrink-0" />
                    <span>Kapasitas s.d {ruangKelasFacility.capacity} Peserta</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => openBookingModal('RUANG_PERTEMUAN', ruangKelasFacility.id, 1, 1)}
                  className="w-full py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-[#c9a961] to-[#b8941e] hover:from-[#b8941e] hover:to-[#a27f14] text-white transition-all text-center shadow-[0_2px_8px_rgba(201,169,97,0.3)] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Booking Ruang Kelas Online</span>
                </button>
                <button 
                  onClick={() => { 
                    setCalcCategory('RUANG_PERTEMUAN'); 
                    setCalcItemId(ruangKelasFacility.id); 
                    scrollToSection('kalkulator'); 
                  }}
                  className="w-full py-2 rounded-xl font-bold text-xs bg-[#FAF9F5] hover:bg-[#fbf8ee] text-stone-700 border border-[#e8dfc8] transition-all text-center cursor-pointer"
                >
                  Simulasikan Biaya
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Cost Calculator (Interactive) */}
      <section id="kalkulator" className="py-16 bg-gradient-to-br from-[#1A1410] via-[#2A2018] to-[#1A1410] text-white px-4 sm:px-6 lg:px-8 border-y border-[#c9a961]/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#c9a961] bg-[#c9a961]/20 px-3 py-1 rounded-full border border-[#c9a961]/30">
                Kalkulator Transparan
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">
                Simulasi Estimasi Biaya Sewa
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Hitung estimasi penerimaan negara bukan pajak (PNBP) untuk kebutuhan instansi atau rombongan Anda secara akurat sesuai rumus resmi yang berlaku.
              </p>
              <div className="p-4 rounded-2xl bg-white/5 border border-[#c9a961]/20 text-xs space-y-2">
                <div className="flex items-center gap-2 text-[#c9a961] font-bold">
                  <CreditCard className="w-4 h-4" />
                  <span>Kode Billing SIMPONI Resmi</span>
                </div>
                <p className="text-stone-300 text-[11px]">
                  Pembayaran disetorkan langsung ke Kas Negara menggunakan Surat Setoran Bukan Pajak (SSBP) melalui seluruh Bank Persepsi atau Pos Indonesia.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white text-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl border border-[#e8dfc8]">
              {/* Category Tab Selector */}
              <div className="flex gap-2 p-1 bg-stone-100 rounded-2xl mb-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setCalcCategory('PENGINAPAN');
                    setCalcItemId(superiorType.id);
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    calcCategory === 'PENGINAPAN'
                      ? 'bg-gradient-to-r from-[#c9a961] to-[#b8941e] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <BedDouble className="w-3.5 h-3.5" />
                  <span>Penginapan Kamar (Per Malam)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCalcCategory('RUANG_PERTEMUAN');
                    setCalcItemId(aulaFacility.id);
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    calcCategory === 'RUANG_PERTEMUAN'
                      ? 'bg-gradient-to-r from-[#c9a961] to-[#b8941e] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5" />
                  <span>Ruang Pertemuan (Per Hari)</span>
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1.5">
                    {calcCategory === 'PENGINAPAN' ? 'Pilih Jenis Kamar' : 'Pilih Ruangan Pertemuan'}
                  </label>
                  <select
                    value={calcItemId}
                    onChange={(e) => setCalcItemId(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF9F5] border border-[#e8dfc8] rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#c9a961]"
                  >
                    {calcCategory === 'PENGINAPAN' ? (
                      roomTypes.map((rt) => (
                        <option key={rt.id} value={rt.id}>
                          {rt.name} - {formatCurrency(rt.base_rate_per_night || rt.base_rate || 250000)} / malam (Kapasitas: {rt.default_capacity || rt.capacity || 2} orang)
                        </option>
                      ))
                    ) : (
                      facilities.map((fac) => (
                        <option key={fac.id} value={fac.id}>
                          {fac.name} - {formatCurrency(fac.daily_rate)} / hari (Kapasitas: {fac.capacity} orang)
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1.5">
                      {calcCategory === 'PENGINAPAN' ? 'Jumlah Kamar' : 'Jumlah Unit Ruangan'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={calcUnitCount}
                      onChange={(e) => setCalcUnitCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full p-2.5 bg-[#FAF9F5] border border-[#e8dfc8] rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#c9a961]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1.5">
                      {calcCategory === 'PENGINAPAN' ? 'Jumlah Malam' : 'Jumlah Hari'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={calcDuration}
                      onChange={(e) => setCalcDuration(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full p-2.5 bg-[#FAF9F5] border border-[#e8dfc8] rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#c9a961]"
                    />
                  </div>
                </div>

                {/* Calculation Summary Box */}
                <div className="mt-5 p-4 bg-[#fbf8ee] rounded-2xl border border-[#e8dfc8] space-y-2">
                  <div className="flex justify-between items-center text-stone-600">
                    <span>Tarif Satuan Resmi:</span>
                    <strong className="text-stone-900">
                      {formatCurrency(getSelectedRate())} {calcCategory === 'PENGINAPAN' ? '/ malam' : '/ hari'}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-stone-600">
                    <span>Rumus Perhitungan:</span>
                    <strong className="text-stone-800 text-[11px]">
                      {calcCategory === 'PENGINAPAN' 
                        ? `${calcDuration} Malam × ${formatCurrency(getSelectedRate())} × ${calcUnitCount} Kamar`
                        : `${calcDuration} Hari × ${formatCurrency(getSelectedRate())} × ${calcUnitCount} Unit`
                      }
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-stone-600">
                    <span>Akun PNBP:</span>
                    <strong className="text-[#8a6d2b]">
                      {calcCategory === 'PENGINAPAN' ? '425111 (Jasa Penginapan & Asrama)' : '425112 (Sewa Fasilitas & Ruangan)'}
                    </strong>
                  </div>
                  <div className="pt-2 border-t border-[#e8dfc8] flex justify-between items-center text-sm">
                    <span className="font-bold text-stone-900">Total Estimasi PNBP:</span>
                    <span className="text-xl font-black text-[#8a6d2b]">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => openBookingModal(calcCategory, calcItemId, calcUnitCount, calcDuration)}
                    className="w-full py-3 bg-gradient-to-r from-[#f7cf6e] via-[#c9a961] to-[#b8941e] hover:from-[#fbe29a] hover:to-[#c9a961] text-[#1A1410] rounded-xl font-black text-xs text-center transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_12px_rgba(201,169,97,0.35)]"
                  >
                    <Calendar className="w-4 h-4 text-[#1A1410]" />
                    <span>Lanjutkan ke Formulir Booking Mandiri Online &rarr;</span>
                  </button>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <a
                      href="https://wa.me/6281248001234?text=Halo%20Front%20Desk%20SIMAHA%20Papua,%20saya%20ingin%20reservasi%20penginapan"
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 bg-[#FAF9F5] hover:bg-[#fbf8ee] border border-[#e8dfc8] text-stone-700 rounded-xl font-bold text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Hubungi Front Desk WhatsApp</span>
                    </a>
                    <button
                      onClick={onGoToLogin}
                      className="py-2 px-4 bg-[#FAF9F5] hover:bg-[#fbf8ee] border border-[#e8dfc8] text-stone-700 rounded-xl font-bold transition-colors cursor-pointer text-xs"
                    >
                      Portal Petugas &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Facilities & MICE */}
      <section id="fasilitas" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-black uppercase tracking-widest text-[#8a6d2b] bg-[#fbf8ee] border border-[#e8dfc8] px-3 py-1 rounded-full">
            Fasilitas Terpadu
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-3">
            Kawasan Terintegrasi & Representatif
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
            Menyediakan ekosistem lengkap untuk menunjang kelancaran ibadah, kedinasan, kegiatan konferensi, dan kenyamanan seluruh tamu di Kota Jayapura.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#e8dfc8] shadow-2xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#fbf8ee] text-[#8a6d2b] border border-[#e8dfc8] flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-stone-900 mb-1">Auditorium & Aula Arafah</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Gedung pertemuan megah berkapasitas hingga 1.000 orang, dilengkapi AC Central, Sound System Line Array, dan Videotron LED P2.5 untuk acara seminar, wisuda, atau resepsi pernikahan.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#e8dfc8] shadow-2xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#fbf8ee] text-[#8a6d2b] border border-[#e8dfc8] flex items-center justify-center mb-4">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-stone-900 mb-1">Masjid Al-Mabrur</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Masjid representatif di dalam kawasan asrama haji dengan kapasitas 800 jamaah, penyejuk ruangan, tempat wudhu bersih terpisah, dan imam rawatib untuk kenyamanan ibadah jemaah dan tamu.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#e8dfc8] shadow-2xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#fbf8ee] text-[#8a6d2b] border border-[#e8dfc8] flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-stone-900 mb-1">Poliklinik & Medis Embarkasi</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Pusat penanganan kesehatan jemaah dengan dokter jaga, ruang observasi, obat-obatan standar KKP, dan koordinasi cepat dengan RSUD Jayapura untuk kegawatdaruratan medis.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#e8dfc8] shadow-2xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#fbf8ee] text-[#8a6d2b] border border-[#e8dfc8] flex items-center justify-center mb-4">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-stone-900 mb-1">Dapur Umum & Resto Halal</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Kantin dan layanan katering bersertifikasi halal dengan menu nusantara dan lokal Papua, siap melayani konsumsi prasmanan jemaah kloter haji maupun paket meeting MICE.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#e8dfc8] shadow-2xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#fbf8ee] text-[#8a6d2b] border border-[#e8dfc8] flex items-center justify-center mb-4">
              <Wifi className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-stone-900 mb-1">Konektivitas Fiber Optik & CCTV</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Area asrama dilengkapi jaringan internet Wi-Fi kecepatan tinggi di setiap gedung serta 48 titik kamera pengawas CCTV 24 jam dengan petugas keamanan profesional.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#e8dfc8] shadow-2xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#fbf8ee] text-[#8a6d2b] border border-[#e8dfc8] flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-stone-900 mb-1">Front Desk & Kasir POS 24 Jam</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Layanan penerimaan tamu nonstop dengan sistem kasir cepat 1-layar, pencetakan nota/struk thermal 80mm/58mm, dan integrasi penagihan resmi PNBP Kementerian Agama.
            </p>
          </div>
        </div>
      </section>

      {/* Section: Hajj Service & SPMA Workflow */}
      <section id="layanan-haji" className="py-20 bg-[#FAF9F5] px-4 sm:px-6 lg:px-8 border-y border-[#e8dfc8]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-widest text-[#8a6d2b] bg-[#fbf8ee] border border-[#e8dfc8] px-3 py-1 rounded-full">
              SOP Embarkasi Antara Papua
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-3">
              Alur Penerimaan Jemaah Haji (SPMA Digital)
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
              Mengadopsi sistem Munakosah & SIASAH terpadu guna mempercepat proses penerimaan jemaah dari 29 Kabupaten/Kota se-Tanah Papua tanpa antrean panjang.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            <div className="bg-white p-6 rounded-3xl border border-[#e8dfc8] shadow-xs text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#c9a961] to-[#b8941e] text-white font-black text-sm flex items-center justify-center mx-auto shadow-[0_2px_8px_rgba(201,169,97,0.3)]">
                1
              </div>
              <h4 className="font-black text-sm text-stone-900">Validasi Dokumen & SPMA</h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Jemaah tiba di Aula Penerimaan, diverifikasi melalui QR Code Surat Perintah Masuk Asrama (SPMA) digital.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#e8dfc8] shadow-xs text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#c9a961] to-[#b8941e] text-white font-black text-sm flex items-center justify-center mx-auto shadow-[0_2px_8px_rgba(201,169,97,0.3)]">
                2
              </div>
              <h4 className="font-black text-sm text-stone-900">Pemeriksaan Kesehatan Akhir</h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Pemeriksaan kesehatan oleh Tim Medis Balai Kekarantinaan Kesehatan (BKK) dan pembagian gelang identitas.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#e8dfc8] shadow-xs text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#c9a961] to-[#b8941e] text-white font-black text-sm flex items-center justify-center mx-auto shadow-[0_2px_8px_rgba(201,169,97,0.3)]">
                3
              </div>
              <h4 className="font-black text-sm text-stone-900">Alokasi Kamar & Bagasi</h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Penempatan gedung dan nomor kasur otomatis, koper diberi Luggage Barcode Tag sesuai nomor kamar.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#e8dfc8] shadow-xs text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#c9a961] to-[#b8941e] text-white font-black text-sm flex items-center justify-center mx-auto shadow-[0_2px_8px_rgba(201,169,97,0.3)]">
                4
              </div>
              <h4 className="font-black text-sm text-stone-900">Pemberangkatan ke Bandara</h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Pelepasan resmi kloter menuju Bandara Sentani Jayapura untuk penerbangan ke Embarkasi Makassar (UPG).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Contact & Location */}
      <section id="kontak" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[#1A1410] via-[#2A2018] to-[#1A1410] text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-[#c9a961]/20 overflow-hidden relative">
          <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#c9a961] bg-[#c9a961]/20 px-3 py-1 rounded-full border border-[#c9a961]/30">
                Lokasi & Hubungi Kami
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">
                UPT Asrama Haji Transit Jayapura
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Berlokasi strategis di kawasan Kotaraja Abepura, dekat dengan pusat perkantoran, perbelanjaan, dan akses cepat menuju Bandara Sentani Jayapura.
              </p>

              <div className="space-y-3 text-xs text-stone-300 pt-2">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#c9a961] shrink-0 mt-0.5" />
                  <span>Jl. Raya Kotaraja No. 8, Wai Mhorock, Kec. Abepura, Kota Jayapura, Provinsi Papua 99225</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#c9a961] shrink-0" />
                  <span>Telepon Kantor: (0967) 581-229 &bull; WhatsApp Front Desk: 0812-4800-1234</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#c9a961] shrink-0" />
                  <span>Email: asramahaji.papua@kemenhaj.go.id</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#c9a961] shrink-0" />
                  <span>Layanan Front Desk & Reservasi: 24 Jam Nonstop Setiap Hari</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-[#c9a961]/20 text-center space-y-4">
              <img 
                src="/logo.png" 
                alt="Logo Kementerian Haji dan Umrah RI" 
                className="w-16 h-16 mx-auto object-contain drop-shadow-xl"
              />
              <h3 className="font-black text-lg text-white">Portal Pengguna Sistem SIMAHA</h3>
              <p className="text-xs text-stone-300">
                Akses khusus bagi petugas Front Office, Pengelola Kamar, Housekeeping, Bendahara Keuangan, dan Pejabat Pimpinan.
              </p>
              <button
                onClick={onGoToLogin}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c9a961] to-[#b8941e] hover:from-[#d8b870] hover:to-[#c9a961] text-white font-black text-xs shadow-lg hover:shadow-[#c9a961]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Akun Pegawai / Petugas</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1410] text-stone-400 text-xs py-12 px-4 sm:px-6 lg:px-8 border-t border-[#c9a961]/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Logo Kementerian Haji dan Umrah RI" 
              className="w-10 h-10 object-contain shrink-0"
            />
            <div>
              <p className="font-bold text-stone-200">SIMAHA &bull; Sistem Informasi Manajemen Asrama Haji Papua</p>
              <p className="text-[11px] text-stone-400">Kementerian Haji dan Umrah Republik Indonesia &bull; UPT Asrama Haji Transit Jayapura</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px]">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-[#c9a961] transition-colors">
              Kembali ke Atas &uarr;
            </button>
            <button onClick={() => setIsHelpOpen(true)} className="hover:text-[#c9a961] transition-colors">
              Buku Panduan & SOP
            </button>
            <button onClick={() => setIsLookupOpen(true)} className="hover:text-[#c9a961] transition-colors">
              Cek Kamar Jemaah
            </button>
            <button onClick={onGoToLogin} className="hover:text-[#c9a961] font-bold transition-colors">
              Login &rarr;
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[#c9a961]/15 text-center text-[10px] text-stone-500">
          Hak Cipta &copy; 2026 UPT Asrama Haji Transit Jayapura Provinsi Papua &bull; Seluruh Hak Cipta Dilindungi Undang-Undang.
        </div>
      </footer>

      {/* Jemaah Self Service Lookup Modal */}
      <SelfServiceLookupModal
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
        initialQuery={quickQuery}
      />

      {/* Public Online Self-Booking Modal */}
      <PublicSelfBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialCategory={bookingCategory}
        initialItemId={bookingItemId}
        initialUnitCount={bookingUnitCount}
        initialDuration={bookingDuration}
      />

      {/* SOP & Help Guide Modal */}
      <HelpGuideModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};
