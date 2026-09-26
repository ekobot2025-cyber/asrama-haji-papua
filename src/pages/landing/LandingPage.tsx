import React, { useState } from 'react';
import { 
  Compass, LogIn, ArrowRight, ArrowLeft, Search, Building, BedDouble, 
  Calendar, CheckCircle2, ShieldCheck, MapPin, Phone, Mail, Clock, 
  CreditCard, Sparkles, Users, FileText, ChevronRight, HelpCircle, 
  BookOpen, Star, Award, Coffee, Wifi, Tv, Utensils, Info, Check, 
  Calculator, Tag, Printer, ExternalLink, Menu, X
} from 'lucide-react';
import { db } from '../../db/database';
import { SelfServiceLookupModal } from '../../components/operations/SelfServiceLookupModal';
import { HelpGuideModal } from '../../components/common/HelpGuideModal';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Quick Mini Lookup on Hero
  const [quickQuery, setQuickQuery] = useState('');
  const [quickResult, setQuickResult] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Cost Calculator State
  const [selectedRoomType, setSelectedRoomType] = useState('deluxe');
  const [numRooms, setNumRooms] = useState(1);
  const [numNights, setNumNights] = useState(2);

  const roomRates = {
    suite: { name: 'VIP / Suite Room', price: 450000, desc: 'King Bed, Living Room, Smart TV 43", Water Heater, Kulkas', capacity: 2, pnbpCode: '425111' },
    deluxe: { name: 'Deluxe Twin Room', price: 300000, desc: 'Twin Bed (2 Kasur), AC Split, Smart TV, Water Heater, Meja Kerja', capacity: 2, pnbpCode: '425111' },
    superior: { name: 'Superior / Kloter Haji (Per Bed)', price: 150000, desc: 'Single Bed di Kamar Bersama (4 Bed), AC, Kamar Mandi Dalam, Locker', capacity: 1, pnbpCode: '425111' },
    aula: { name: 'Aula Serbaguna Arafah (Harian)', price: 5000000, desc: 'Kapasitas s.d 1.000 Peserta, Sound System, AC Central, Videotron', capacity: 1000, pnbpCode: '425112' }
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    setHasSearched(true);
    const res = db.lookupAccommodation(quickQuery.trim());
    setQuickResult(res);
  };

  const calculateTotal = () => {
    const rate = roomRates[selectedRoomType as keyof typeof roomRates]?.price || 0;
    return rate * numRooms * numNights;
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-800 selection:text-white">
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white text-[11px] py-2 px-4 border-b border-emerald-800/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-emerald-950 font-black px-2 py-0.5 rounded text-[10px] tracking-wide uppercase">
              Resmi Kemenag RI
            </span>
            <span className="text-emerald-100 font-medium">
              UPT Asrama Haji Transit Jayapura &bull; Provinsi Papua (Zona Waktu WIT)
            </span>
          </div>
          <div className="flex items-center gap-4 text-emerald-200">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Front Desk 24 Jam: <strong>(0967) 581-229</strong></span>
            </div>
            <div className="hidden md:flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Check-in: 14:00 WIT &bull; Check-out: 12:00 WIT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
          {/* Logo & Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-emerald-700 to-emerald-800 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-emerald-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <Compass className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div className="whitespace-nowrap">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl tracking-tight text-emerald-950">SIMAHA</span>
                <span className="text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded">
                  PAPUA
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-bold text-emerald-800 leading-tight">
                Sistem Informasi Manajemen Asrama Haji
              </p>
              <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium">
                Provinsi Papua &bull; Layanan Perhotelan & Haji
              </p>
            </div>
          </div>

          {/* Nav Links Desktop */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-bold text-slate-600 shrink-0">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              className="px-2.5 py-1.5 rounded-lg whitespace-nowrap text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50 transition-colors"
            >
              Beranda
            </button>
            <button 
              onClick={() => scrollToSection('kamar-tarif')} 
              className="px-2.5 py-1.5 rounded-lg whitespace-nowrap hover:text-emerald-800 hover:bg-slate-100 transition-colors"
            >
              Kamar & Tarif
            </button>
            <button 
              onClick={() => scrollToSection('kalkulator')} 
              className="px-2.5 py-1.5 rounded-lg whitespace-nowrap hover:text-emerald-800 hover:bg-slate-100 transition-colors"
            >
              Simulasi Biaya
            </button>
            <button 
              onClick={() => scrollToSection('fasilitas')} 
              className="px-2.5 py-1.5 rounded-lg whitespace-nowrap hover:text-emerald-800 hover:bg-slate-100 transition-colors"
            >
              Fasilitas MICE
            </button>
            <button 
              onClick={() => scrollToSection('layanan-haji')} 
              className="px-2.5 py-1.5 rounded-lg whitespace-nowrap hover:text-emerald-800 hover:bg-slate-100 transition-colors"
            >
              Layanan Haji
            </button>
            <button 
              onClick={() => scrollToSection('kontak')} 
              className="px-2.5 py-1.5 rounded-lg whitespace-nowrap hover:text-emerald-800 hover:bg-slate-100 transition-colors"
            >
              Kontak
            </button>
          </nav>

          {/* Action Button: Cek Kamar & Login */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsLookupOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Cek Kamar</span>
            </button>

            <button
              onClick={onGoToLogin}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 border border-emerald-700/60 shadow-md hover:shadow-lg transition-all cursor-pointer group whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
              <span>{currentUser ? 'Dashboard' : 'Login'}</span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2">
            <button 
              onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMobileMenuOpen(false); }} 
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-emerald-800 hover:bg-emerald-50"
            >
              Beranda
            </button>
            <button 
              onClick={() => { scrollToSection('kamar-tarif'); setMobileMenuOpen(false); }} 
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Kamar & Tarif
            </button>
            <button 
              onClick={() => { scrollToSection('kalkulator'); setMobileMenuOpen(false); }} 
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Simulasi Biaya
            </button>
            <button 
              onClick={() => { scrollToSection('fasilitas'); setMobileMenuOpen(false); }} 
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Fasilitas MICE
            </button>
            <button 
              onClick={() => { scrollToSection('layanan-haji'); setMobileMenuOpen(false); }} 
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Layanan Haji
            </button>
            <button 
              onClick={() => { scrollToSection('kontak'); setMobileMenuOpen(false); }} 
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Kontak & Lokasi
            </button>
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => { setIsLookupOpen(true); setMobileMenuOpen(false); }}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 text-center"
              >
                Cek Kamar
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-emerald-950 text-white pt-14 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Subtle decorative background circles & mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-700/60 text-amber-300 text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Pelayanan Prima & Standar Hospitality Modern di Bumi Cenderawasih</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight sm:leading-[1.15]">
                Pusat Layanan Akomodasi <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-emerald-200">
                  Haji & Penginapan MICE
                </span> <br />
                Provinsi Papua
              </h1>

              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Selamat datang di <strong>SIMAHA Papua</strong>. Terpadu melayani embarkasi haji antara, akomodasi kedinasan, kegiatan MICE, dan penginapan umum berstandar perhotelan syariah dengan kode billing PNBP SIMPONI resmi Kementerian Agama RI.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={onGoToLogin}
                  className="px-6 py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg hover:shadow-amber-500/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{currentUser ? 'Masuk ke Dashboard Sistem' : 'Masuk ke Portal Sistem'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsLookupOpen(true)}
                  className="px-5 py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all flex items-center gap-2 cursor-pointer backdrop-blur-xs"
                >
                  <Search className="w-4 h-4 text-amber-300" />
                  <span>Cek Kamar Jemaah Mandiri</span>
                </button>

                <button
                  onClick={() => setIsHelpOpen(true)}
                  className="px-4 py-3.5 rounded-xl font-bold text-sm text-emerald-200 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>Buku Panduan & SOP</span>
                </button>
              </div>

              {/* Verified Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-emerald-200/80">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Tarif Resmi PP PNBP Kemenag</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Front Desk POS 24 Jam Nonstop</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>Standar Kebersihan Harian</span>
                </div>
              </div>
            </div>

            {/* Right Hero Card: Quick Room & SPMA Lookup Kiosk */}
            <div className="lg:col-span-5">
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/40 text-slate-800">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Anjungan Mandiri (Kiosk)
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">Cek Kamar & Ranjang</h3>
                    <p className="text-xs text-slate-500">Cari penempatan kamar jemaah haji & tamu umum</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
                    <Search className="w-5 h-5" />
                  </div>
                </div>

                <form onSubmit={handleQuickSearch} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Lengkap, No. Porsi, atau No. SPMA
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={quickQuery}
                        onChange={(e) => setQuickQuery(e.target.value)}
                        placeholder="Contoh: Siti Rahma / 2800123456"
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Periksa Penempatan Sekarang</span>
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Uji Coba:</span>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => { setQuickQuery('Siti Rahma'); setHasSearched(true); setQuickResult(db.lookupAccommodation('Siti Rahma')); }}
                        className="text-emerald-700 hover:underline font-semibold"
                      >
                        Siti Rahma
                      </button>
                      <span>&bull;</span>
                      <button 
                        type="button" 
                        onClick={() => { setQuickQuery('Ahmad Dahlan'); setHasSearched(true); setQuickResult(db.lookupAccommodation('Ahmad Dahlan')); }}
                        className="text-emerald-700 hover:underline font-semibold"
                      >
                        Ahmad Dahlan
                      </button>
                    </div>
                  </div>
                </form>

                {/* Quick Result Preview */}
                {hasSearched && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs animate-in fade-in duration-200">
                    {quickResult?.found ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-900">{quickResult.guest.name}</span>
                          <span className="text-[10px] font-black bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                            TERALOKASI
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 bg-white p-2.5 rounded-xl border border-emerald-100">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Gedung</span>
                            <strong className="text-slate-900">{quickResult.building?.name || 'Gedung Madinah'}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Kamar / Ranjang</span>
                            <strong className="text-emerald-800">
                              Kamar {quickResult.room?.roomNumber || '301'} &bull; Bed {quickResult.bed?.bedNumber || 'B-01'}
                            </strong>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsLookupOpen(true)}
                          className="w-full text-center text-xs font-bold text-emerald-800 hover:text-emerald-950 py-1"
                        >
                          Lihat Detail Lengkap & SPMA Digital &rarr;
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-2 text-slate-500">
                        <p className="font-medium text-xs text-rose-700">Data belum ditemukan.</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Pastikan nama atau nomor porsi yang dimasukkan sudah terdaftar.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Highlight Stats Counter */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-4 rounded-2xl text-center">
              <Building className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
              <div className="text-2xl font-black text-white">5 Gedung</div>
              <div className="text-[11px] text-emerald-200 font-medium">Madinah, Mekkah, Mina, Arafah</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-4 rounded-2xl text-center">
              <BedDouble className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
              <div className="text-2xl font-black text-white">120+ Kamar</div>
              <div className="text-[11px] text-emerald-200 font-medium">Standar Hotel & Kloter Haji</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-4 rounded-2xl text-center">
              <Users className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
              <div className="text-2xl font-black text-white">480+ Ranjang</div>
              <div className="text-[11px] text-emerald-200 font-medium">Kapasitas Tempat Tidur Resmi</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-4 rounded-2xl text-center">
              <Award className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
              <div className="text-2xl font-black text-white">1.000 Peserta</div>
              <div className="text-[11px] text-emerald-200 font-medium">Kapasitas Aula Utama MICE</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-4 rounded-2xl text-center col-span-2 sm:col-span-1">
              <CreditCard className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
              <div className="text-2xl font-black text-white">SIMPONI</div>
              <div className="text-[11px] text-emerald-200 font-medium">100% Terintegrasi PNBP Resmi</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Room Types & Official PNBP Rates */}
      <section id="kamar-tarif" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            Tarif Resmi PNBP (PP No. 59/2020)
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
            Pilihan Tipe Kamar & Penginapan
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Menyediakan akomodasi nyaman berstandar perhotelan untuk jemaah haji, tamu instansi pemerintah, BUMN, lembaga swasta, maupun masyarakat umum dengan tarif resmi negara.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1: VIP Suite */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
            <div className="h-44 bg-gradient-to-tr from-emerald-900 to-emerald-700 relative p-6 flex flex-col justify-between text-white">
              <div className="flex justify-between items-start">
                <span className="bg-amber-400 text-emerald-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-2xs">
                  Kelas Eksekutif
                </span>
                <span className="text-[11px] font-bold text-emerald-100">Kode PNBP 425111</span>
              </div>
              <div>
                <h3 className="text-xl font-black">VIP / Suite Room</h3>
                <p className="text-xs text-emerald-200">Kapasitas 2 Orang &bull; 1 King Bed</p>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-emerald-900">Rp 450.000</span>
                  <span className="text-xs text-slate-500 font-medium">/ malam</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Kamar paling representatif dengan tata ruang luas, cocok untuk pejabat pimpinan, narasumber VIP, dan keluarga.
                </p>
                <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> King Size Bed Berkualitas Tinggi</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> AC Split & Smart TV LED 43"</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Kamar Mandi Dalam & Water Heater</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Kulkas Mini, Sofa Santai & Coffee Maker</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Wi-Fi Berkecepatan Tinggi Gratis</div>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedRoomType('suite'); scrollToSection('kalkulator'); }}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-800 hover:bg-emerald-900 text-white transition-colors text-center"
              >
                Simulasikan Biaya &rarr;
              </button>
            </div>
          </div>

          {/* Card 2: Deluxe Room */}
          <div className="bg-white rounded-3xl border-2 border-emerald-600 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group relative">
            <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-4 py-1 rounded-bl-xl shadow-xs z-10">
              Paling Populer
            </div>
            <div className="h-44 bg-gradient-to-tr from-emerald-800 to-emerald-600 relative p-6 flex flex-col justify-between text-white">
              <div className="flex justify-between items-start">
                <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  Kelas Bisnis / ASN
                </span>
                <span className="text-[11px] font-bold text-emerald-100">Kode PNBP 425111</span>
              </div>
              <div>
                <h3 className="text-xl font-black">Deluxe Twin Room</h3>
                <p className="text-xs text-emerald-200">Kapasitas 2 Orang &bull; 2 Single Bed</p>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-emerald-900">Rp 300.000</span>
                  <span className="text-xs text-slate-500 font-medium">/ malam</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pilihan ideal untuk kegiatan diklat, seminar dinas, perjalanan kerja instansi pemerintah, dan tamu perorangan.
                </p>
                <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> 2 Unit Single Bed (Twin Share)</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> AC Split Individual & TV LED 32"</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Kamar Mandi Dalam & Water Heater</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Meja Kerja & Lemari Pakaian</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Handuk Bersih & Amenities Harian</div>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedRoomType('deluxe'); scrollToSection('kalkulator'); }}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-800 hover:bg-emerald-900 text-white transition-colors text-center"
              >
                Simulasikan Biaya &rarr;
              </button>
            </div>
          </div>

          {/* Card 3: Superior Kloter Haji */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
            <div className="h-44 bg-gradient-to-tr from-slate-800 to-emerald-900 relative p-6 flex flex-col justify-between text-white">
              <div className="flex justify-between items-start">
                <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  Standar Kloter Haji
                </span>
                <span className="text-[11px] font-bold text-slate-300">Kode PNBP 425111</span>
              </div>
              <div>
                <h3 className="text-xl font-black">Superior / Rombongan</h3>
                <p className="text-xs text-slate-300">Kapasitas 4 Bed &bull; Tarif Per Ranjang</p>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-emerald-900">Rp 150.000</span>
                  <span className="text-xs text-slate-500 font-medium">/ orang / malam</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Format kamar jemaah haji & rombongan massal dengan tempat tidur individual yang nyaman dan higienis.
                </p>
                <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> 4 Single Bed dengan Barcode Unik</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Full AC & Sirkulasi Udara Baik</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Kamar Mandi Dalam</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Locker Lemari Pribadi Kunci Sendiri</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Akses Langsung ke Poliklinik & Masjid</div>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedRoomType('superior'); scrollToSection('kalkulator'); }}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-800 hover:bg-emerald-900 text-white transition-colors text-center"
              >
                Simulasikan Biaya &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Cost Calculator (Interactive) */}
      <section id="kalkulator" className="py-16 bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-900 text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/30">
                Kalkulator Transparan
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">
                Simulasi Estimasi Biaya Penginapan
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                Hitung estimasi penerimaan negara bukan pajak (PNBP) untuk kebutuhan instansi atau rombongan Anda secara akurat sebelum membuat Surat Pesanan / SPK.
              </p>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <CreditCard className="w-4 h-4" />
                  <span>Kode Billing SIMPONI Resmi</span>
                </div>
                <p className="text-emerald-200/80 text-[11px]">
                  Pembayaran disetorkan langsung ke Kas Negara menggunakan Surat Setoran Bukan Pajak (SSBP) melalui seluruh Bank Persepsi atau Pos Indonesia.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white text-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Pilih Tipe Kamar / Fasilitas</label>
                  <select
                    value={selectedRoomType}
                    onChange={(e) => setSelectedRoomType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="suite">VIP / Suite Room - Rp 450.000 / malam</option>
                    <option value="deluxe">Deluxe Twin Room - Rp 300.000 / malam</option>
                    <option value="superior">Superior / Kloter Haji - Rp 150.000 / bed / malam</option>
                    <option value="aula">Aula Serbaguna Arafah - Rp 5.000.000 / hari</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      {selectedRoomType === 'superior' ? 'Jumlah Orang / Bed' : selectedRoomType === 'aula' ? 'Jumlah Hari Sewa' : 'Jumlah Kamar'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={numRooms}
                      onChange={(e) => setNumRooms(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Durasi (Malam / Hari)</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={numNights}
                      onChange={(e) => setNumNights(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                {/* Calculation Summary Box */}
                <div className="mt-5 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Tarif Satuan Resmi:</span>
                    <strong className="text-slate-900">{formatCurrency(roomRates[selectedRoomType as keyof typeof roomRates].price)}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Akun PNBP:</span>
                    <strong className="text-emerald-800">{roomRates[selectedRoomType as keyof typeof roomRates].pnbpCode} (Layanan Sewa Aset)</strong>
                  </div>
                  <div className="pt-2 border-t border-emerald-200 flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-900">Total Estimasi PNBP:</span>
                    <span className="text-xl font-black text-emerald-900">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <a
                    href="https://wa.me/6281248001234?text=Halo%20Front%20Desk%20SIMAHA%20Papua,%20saya%20ingin%20reservasi%20penginapan"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-center transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Hubungi Front Desk WhatsApp</span>
                  </a>
                  <button
                    onClick={onGoToLogin}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition-colors"
                  >
                    Petugas POS Kasir &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Facilities & MICE */}
      <section id="fasilitas" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            Fasilitas Terpadu
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
            Kawasan Terintegrasi & Representatif
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Menyediakan ekosistem lengkap untuk menunjang kelancaran ibadah, kedinasan, kegiatan konferensi, dan kenyamanan seluruh tamu di Kota Jayapura.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-slate-900 mb-1">Auditorium & Aula Arafah</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Gedung pertemuan megah berkapasitas hingga 1.000 orang, dilengkapi AC Central, Sound System Line Array, dan Videotron LED P2.5 untuk acara seminar, wisuda, atau resepsi pernikahan.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-slate-900 mb-1">Masjid Al-Mabrur</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Masjid representatif di dalam kawasan asrama haji dengan kapasitas 800 jamaah, penyejuk ruangan, tempat wudhu bersih terpisah, dan imam rawatib untuk kenyamanan ibadah jemaah dan tamu.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-slate-900 mb-1">Poliklinik & Medis Embarkasi</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pusat penanganan kesehatan jemaah dengan dokter jaga, ruang observasi, obat-obatan standar KKP, dan koordinasi cepat dengan RSUD Jayapura untuk kegawatdaruratan medis.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-slate-900 mb-1">Dapur Umum & Resto Halal</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kantin dan layanan katering bersertifikasi halal dengan menu nusantara dan lokal Papua, siap melayani konsumsi prasmanan jemaah kloter haji maupun paket meeting MICE.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4">
              <Wifi className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-slate-900 mb-1">Konektivitas Fiber Optik & CCTV</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Area asrama dilengkapi jaringan internet Wi-Fi kecepatan tinggi di setiap gedung serta 48 titik kamera pengawas CCTV 24 jam dengan petugas keamanan profesional.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-slate-900 mb-1">Front Desk & Kasir POS 24 Jam</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Layanan penerimaan tamu nonstop dengan sistem kasir cepat 1-layar, pencetakan nota/struk thermal 80mm/58mm, dan integrasi penagihan resmi PNBP Kementerian Agama.
            </p>
          </div>
        </div>
      </section>

      {/* Section: Hajj Service & SPMA Workflow */}
      <section id="layanan-haji" className="py-20 bg-slate-100 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-200/70 px-3 py-1 rounded-full">
              SOP Embarkasi Antara Papua
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
              Alur Penerimaan Jemaah Haji (SPMA Digital)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Mengadopsi sistem Munakosah & SIASAH terpadu guna mempercepat proses penerimaan jemaah dari 29 Kabupaten/Kota se-Tanah Papua tanpa antrean panjang.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-800 text-white font-black text-sm flex items-center justify-center mx-auto">
                1
              </div>
              <h4 className="font-black text-sm text-slate-900">Validasi Dokumen & SPMA</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Jemaah tiba di Aula Penerimaan, diverifikasi melalui QR Code Surat Perintah Masuk Asrama (SPMA) digital.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-800 text-white font-black text-sm flex items-center justify-center mx-auto">
                2
              </div>
              <h4 className="font-black text-sm text-slate-900">Pemeriksaan Kesehatan Akhir</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Pemeriksaan kesehatan oleh Tim Medis Balai Kekarantinaan Kesehatan (BKK) dan pembagian gelang identitas.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-800 text-white font-black text-sm flex items-center justify-center mx-auto">
                3
              </div>
              <h4 className="font-black text-sm text-slate-900">Alokasi Kamar & Bagasi</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Penempatan gedung dan nomor kasur otomatis, koper diberi Luggage Barcode Tag sesuai nomor kamar.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-800 text-white font-black text-sm flex items-center justify-center mx-auto">
                4
              </div>
              <h4 className="font-black text-sm text-slate-900">Pemberangkatan ke Bandara</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Pelepasan resmi kloter menuju Bandara Sentani Jayapura untuk penerbangan ke Embarkasi Makassar (UPG).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Contact & Location */}
      <section id="kontak" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden relative">
          <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-300/30">
                Lokasi & Hubungi Kami
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">
                UPT Asrama Haji Transit Jayapura
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                Berlokasi strategis di kawasan Kotaraja Abepura, dekat dengan pusat perkantoran, perbelanjaan, dan akses cepat menuju Bandara Sentani Jayapura.
              </p>

              <div className="space-y-3 text-xs text-emerald-200 pt-2">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Jl. Raya Kotaraja No. 8, Wai Mhorock, Kec. Abepura, Kota Jayapura, Provinsi Papua 99225</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Telepon Kantor: (0967) 581-229 &bull; WhatsApp Front Desk: 0812-4800-1234</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Email: asramahaji.papua@kemenag.go.id</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Layanan Front Desk & Reservasi: 24 Jam Nonstop Setiap Hari</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center space-y-4">
              <Compass className="w-12 h-12 text-amber-400 mx-auto" />
              <h3 className="font-black text-lg text-white">Portal Pengguna Sistem SIMAHA</h3>
              <p className="text-xs text-emerald-100">
                Akses khusus bagi petugas Front Office, Pengelola Kamar, Housekeeping, Bendahara Keuangan, dan Pejabat Pimpinan.
              </p>
              <button
                onClick={onGoToLogin}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Akun Pegawai / Petugas</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-200">SIMAHA &bull; Sistem Informasi Manajemen Asrama Haji Papua</p>
              <p className="text-[11px] text-slate-500">Kementerian Agama Republik Indonesia &bull; UPT Asrama Haji Transit Jayapura</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px]">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">
              Kembali ke Atas &uarr;
            </button>
            <button onClick={() => setIsHelpOpen(true)} className="hover:text-emerald-400 transition-colors">
              Buku Panduan & SOP
            </button>
            <button onClick={() => setIsLookupOpen(true)} className="hover:text-emerald-400 transition-colors">
              Cek Kamar Jemaah
            </button>
            <button onClick={onGoToLogin} className="hover:text-amber-400 font-bold transition-colors">
              Login &rarr;
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-800/80 text-center text-[10px] text-slate-500">
          Hak Cipta &copy; 2026 UPT Asrama Haji Transit Jayapura Provinsi Papua &bull; Seluruh Hak Cipta Dilindungi Undang-Undang.
        </div>
      </footer>

      {/* Jemaah Self Service Lookup Modal */}
      <SelfServiceLookupModal
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
      />

      {/* SOP & Help Guide Modal */}
      <HelpGuideModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};
