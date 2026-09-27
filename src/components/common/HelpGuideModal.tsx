import React, { useState } from 'react';
import { 
  BookOpen, Search, X, CheckCircle2, ArrowRight, ShieldCheck, 
  BedDouble, LogIn, LogOut, Sparkles, Wrench, Receipt, 
  HelpCircle, ChevronRight, UserCheck, Users, Landmark, FileText,
  Key, Clock, AlertTriangle, Lightbulb
} from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: string) => void;
}

interface GuideSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  category: string;
  badge: string;
  summary: string;
  steps: {
    title: string;
    description: string;
    role: string;
    tips?: string;
  }[];
  relatedPage?: string;
  pageName?: string;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('flow_overview');

  const guideSections: GuideSection[] = [
    {
      id: 'flow_overview',
      title: 'Alur Kerja Utama (SOP End-to-End)',
      icon: <CheckCircle2 className="w-4 h-4 text-[#c9a961]" />,
      category: 'Umum',
      badge: 'SOP Utama',
      summary: 'Siklus operasional baku pengelolaan penginapan UPT Asrama Haji Papua dari pemesanan awal hingga kepulangan dan pembersihan kamar.',
      steps: [
        {
          title: '1. Pemesanan / Reservasi',
          description: 'Menerima permohonan reservasi dari tamu individu, rombongan manasik, diklat, atau surat kedinasan instansi Kemenag/Pemda.',
          role: 'Petugas / Admin',
          tips: 'Nomor reservasi otomatis dibuat dengan format RSV/AHP/2026/XXXXX.',
        },
        {
          title: '2. Verifikasi & Approval',
          description: 'Admin/Pimpinan memeriksa kelengkapan identitas tamu, ketersediaan kamar, atau surat rekomendasi dinas sebelum menyetujui.',
          role: 'Admin Penginapan',
          tips: 'Reservasi berstatus PENDING diverifikasi menjadi CONFIRMED.',
        },
        {
          title: '3. Penempatan Kamar Syariah (Room Assignment)',
          description: 'Sistem otomatis memisahkan tempat tidur pria (ikhwan) dan wanita (akhwat). Petugas juga dapat memindahkan tempat tidur secara manual.',
          role: 'Admin / Petugas',
          tips: 'Pemisahan gender mutlak berlaku untuk rombongan jamaah/pelatihan.',
        },
        {
          title: '4. Check-in & Kartu Kunci',
          description: 'Menerbitkan kartu fisik kamar, mencatat uang jaminan/deposit tamu, dan sistem mengubah status kamar menjadi OCCUPIED.',
          role: 'Petugas Resepsionis',
          tips: 'Deposit dicatat untuk menjamin kunci fisik dan fasilitas kamar.',
        },
        {
          title: '5. Tagihan & Pembayaran Kasir',
          description: 'Mencetak Faktur (Invoice) dan menerbitkan Kwitansi resmi ber-Terbilang Rupiah untuk bukti pembayaran PNBP.',
          role: 'Bendahara Keuangan',
          tips: 'Pembayaran dapat melalui Bank BPD Papua, BSI, Cash, atau QRIS.',
        },
        {
          title: '6. Check-out & Pengembalian Deposit',
          description: 'Memeriksa keutuhan kunci/kamar, mengembalikan deposit jika aman, dan kamar otomatis berstatus CLEANING (DIRTY).',
          role: 'Petugas Resepsionis',
          tips: 'Notifikasi otomatis terkirim ke divisi Housekeeping saat checkout selesai.',
        },
        {
          title: '7. Housekeeping & Kamar Ready',
          description: 'Petugas kebersihan merapikan kamar (Dirty -> In Cleaning -> Inspected -> Ready -> Available).',
          role: 'Housekeeping',
          tips: 'Kamar yang sudah diinspeksi siap disewakan kembali untuk tamu berikutnya.',
        },
      ],
      relatedPage: 'reservations',
      pageName: 'Kelola Reservasi',
    },
    {
      id: 'syariah_rules',
      title: 'Aturan Penempatan Syariah & Bed-Level',
      icon: <BedDouble className="w-4 h-4 text-[#c9a961]" />,
      category: 'Kamar',
      badge: 'Syariah Compliant',
      summary: 'Panduan tata cara penempatan tempat tidur (bed-level) dan kepatuhan syariah pemisahan gender ikhwan dan akhwat di wisma asrama haji.',
      steps: [
        {
          title: '1. Kapasitas Berbasis Tempat Tidur (Bed-Level)',
          description: 'Setiap kamar di Asrama Haji memiliki kode tempat tidur individual (misal: A101-B01 s.d A101-B04). Tamu disewakan per-tempat tidur atau per-kamar penuh.',
          role: 'Petugas / Admin',
          tips: 'Gedung Arafah, Mina, dan Madinah memiliki 2 hingga 4 tempat tidur per kamar.',
        },
        {
          title: '2. Pemisahan Gender Rombongan',
          description: 'Gunakan tombol "Penempatan Otomatis (Auto-Assign)" dengan centang opsi "Pemisahan Gender Syariah". Sistem akan menempatkan jamaah pria di kamar terpisah dari jamaah wanita.',
          role: 'Admin Penginapan',
          tips: 'Kamar tidak akan mencampur pria dan wanita non-mahram dalam 1 ruangan rombongan.',
        },
        {
          title: '3. Kamar Mandiri / Keluarga',
          description: 'Untuk tamu keluarga sah (suami-istri/anak), kamar tipe VIP atau Standard dapat dibooking penuh (Full Room) dengan verifikasi identitas buku nikah/KTP.',
          role: 'Petugas Resepsionis',
          tips: 'Pastikan memilih tipe tamu KEDINASAN / UMUM untuk keluarga mandiri.',
        },
      ],
      relatedPage: 'room-assignment',
      pageName: 'Penempatan Kamar',
    },
    {
      id: 'checkin_checkout',
      title: 'Prosedur Check-in & Check-out Front Desk',
      icon: <LogIn className="w-4 h-4 text-blue-600" />,
      category: 'Front Desk',
      badge: 'Resepsionis',
      summary: 'Langkah operasional front desk saat tamu tiba di asrama haji dan saat mengembalikan kunci kepulangan.',
      steps: [
        {
          title: '1. Verifikasi Identitas Tamu',
          description: 'Cocokkan KTP/NIK tamu dengan data reservasi. Bila rombongan, minta daftar manifest jamaah yang ditandatangani ketua rombongan (PIC).',
          role: 'Petugas Resepsionis',
          tips: 'NIK disensor secara aman di layar untuk perlindungan data pribadi.',
        },
        {
          title: '2. Input Deposit & Cetak Tanda Terima',
          description: 'Input nominal deposit (standar Rp 50.000 - Rp 100.000 per kunci). Catat nomor seri kartu kunci fisik yang diserahkan.',
          role: 'Petugas Resepsionis',
          tips: 'Deposit dicatat dalam sistem dan wajib dikembalikan saat kunci dikembalikan utuh.',
        },
        {
          title: '3. Prosedur Check-out',
          description: 'Terima kembali kartu kunci, periksa status pelunasan tagihan penginapan. Bila tagihan lunas dan kunci lengkap, klik "Kembalikan Deposit & Check-out".',
          role: 'Petugas Resepsionis',
          tips: 'Sistem langsung memindahkan status kamar ke DIRTY (Housekeeping).',
        },
      ],
      relatedPage: 'checkin',
      pageName: 'Menu Check-in',
    },
    {
      id: 'housekeeping_sop',
      title: 'Alur Kebersihan & Tiket Perbaikan',
      icon: <Sparkles className="w-4 h-4 text-amber-600" />,
      category: 'Housekeeping',
      badge: 'Kebersihan & Sarpras',
      summary: 'Standar kebersihan kamar asrama haji dan alur eskalasi jika ditemukan kerusakan fasilitas (AC, pipa air, tempat tidur).',
      steps: [
        {
          title: '1. Status DIRTY (Kamar Kotor)',
          description: 'Kamar yang baru saja di-checkout tamu otomatis berstatus DIRTY. Petugas kebersihan melihat daftar kamar di menu Housekeeping.',
          role: 'Housekeeping',
          tips: 'Prioritaskan pembersihan kamar yang sudah ada jadwal reservasi hari ini.',
        },
        {
          title: '2. Pembersihan & Ganti Linen (IN CLEANING)',
          description: 'Klik "Mulai Bersihkan". Petugas mengganti sprei tempat tidur, membersihkan kamar mandi, melengkapi sajadah dan perlengkapan ibadah.',
          role: 'Petugas Kebersihan',
          tips: 'Pastikan fasilitas arah kiblat dan sajadah dalam keadaan suci dan bersih.',
        },
        {
          title: '3. Inspeksi Supervisor (INSPECTED & READY)',
          description: 'Supervisor kebersihan memeriksa kelayakan kamar, lalu menandai status INSPECTED. Kamar otomatis menjadi AVAILABLE (siap disewa).',
          role: 'Supervisor Housekeeping',
        },
        {
          title: '4. Penanganan Kerusakan (Maintenance)',
          description: 'Jika ada AC rusak, kran bocor, atau lampu mati, buat Tiket Maintenance. Status kamar otomatis terkunci dari pemesanan (MAINTENANCE).',
          role: 'Teknisi / Sarpras',
          tips: 'Kamar tidak dapat di-assign tamu sampai perbaikan selesai.',
        },
      ],
      relatedPage: 'housekeeping',
      pageName: 'Menu Housekeeping',
    },
    {
      id: 'finance_pnbp',
      title: 'Keuangan, Invoice & Kwitansi PNBP',
      icon: <Receipt className="w-4 h-4 text-[#c9a961]" />,
      category: 'Keuangan',
      badge: 'Kasir & PNBP',
      summary: 'Tata cara penagihan biaya penginapan, penerbitan invoice dinas (SPJ), dan kuitansi resmi bertanda tangan bendahara.',
      steps: [
        {
          title: '1. Penerbitan Faktur / Invoice',
          description: 'Buka menu Invoice & Billing. Sistem otomatis menghitung total malam x tarif kamar atau tarif per orang sesuai SK Tarif Asrama Haji.',
          role: 'Bendahara Keuangan',
          tips: 'Faktur dapat dicetak format A4 untuk syarat administrasi SPJ kedinasan instansi tamu.',
        },
        {
          title: '2. Penerimaan Pembayaran',
          description: 'Pilih faktur yang akan dibayar. Masukkan nominal bayar, pilih rekening penampung resmi (BPD Papua atau Bank Syariah Indonesia / BSI).',
          role: 'Kasir / Bendahara',
          tips: 'Mendukung pembayaran penuh atau uang muka (DP).',
        },
        {
          title: '3. Kwitansi Resmi dengan Terbilang Otomatis',
          description: 'Kwitansi otomatis dicetak dengan kalimat "Terbilang Rupiah" resmi (misal: "Dua Juta Lima Ratus Ribu Rupiah"), dilengkapi ruang tanda tangan Bendahara Penerimaan.',
          role: 'Bendahara Keuangan',
          tips: 'Gunakan tombol "Cetak Kwitansi (A4)" untuk lembar tanda terima fisik.',
        },
      ],
      relatedPage: 'payments',
      pageName: 'Menu Pembayaran',
    },
    {
      id: 'tips_shortcuts',
      title: 'Pintasan Cepat (Keyboard Shortcuts) & Tips',
      icon: <Lightbulb className="w-4 h-4 text-amber-500" />,
      category: 'Bantuan',
      badge: 'Tips Efisiensi',
      summary: 'Panduan navigasi cepat dan fitur rahasia untuk mempercepat pekerjaan harian petugas asrama.',
      steps: [
        {
          title: 'Pencarian Global Instan (Ctrl + K)',
          description: 'Tekan tombol keyboard [Ctrl + K] atau [Cmd + K] kapan saja untuk mencari nomor reservasi, nama tamu, kamar, atau invoice dalam hitungan detik.',
          role: 'Semua Pengguna',
        },
        {
          title: 'Simulasi Peran Cepat (Switch Role)',
          description: 'Klik profil di sudut kanan atas untuk berpindah peran antara Super Admin, Petugas, Bendahara, Housekeeping, atau Pimpinan tanpa perlu logout-login.',
          role: 'Semua Pengguna',
          tips: 'Sangat berguna untuk demonstrasi atau pelatihan staf baru.',
        },
        {
          title: 'Reset Demo Data',
          description: 'Jika sedang latihan dan ingin mengembalikan database ke data awal yang rapi, klik tombol "Reset Demo Data" di sudut kanan atas.',
          role: 'Admin / IT',
        },
        {
          title: 'Peta Status Kamar (Room Board Filter)',
          description: 'Pada menu Room Status Board, klik salah satu kotak angka status (Available, Occupied, Cleaning, Maintenance) untuk memfilter tampilan hanya status tersebut.',
          role: 'Petugas Front Desk',
        },
      ],
      relatedPage: 'room-status-board',
      pageName: 'Room Status Board',
    },
  ];

  const categories = ['all', 'Umum', 'Kamar', 'Front Desk', 'Housekeeping', 'Keuangan', 'Bantuan'];

  const filteredSections = guideSections.filter((sec) => {
    if (activeTab !== 'all' && sec.category !== activeTab) return false;
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      const matchTitle = sec.title.toLowerCase().includes(q);
      const matchSummary = sec.summary.toLowerCase().includes(q);
      const matchSteps = sec.steps.some(
        (s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || (s.tips && s.tips.toLowerCase().includes(q))
      );
      return matchTitle || matchSummary || matchSteps;
    }
    return true;
  });

  const selectedSection = guideSections.find((s) => s.id === selectedSectionId) || guideSections[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buku Panduan & Standar Operasional Prosedur (SOP)"
      subtitle="Panduan Penggunaan Lengkap SIMAHA — Sistem Informasi Manajemen Asrama Haji Provinsi Papua"
      maxWidth="4xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#8a6d2b]" />
            <span>Sesuai Regulasi Kemenag & Standar Pelayanan Minimal Asrama Haji</span>
          </div>
          <Button size="sm" variant="secondary" onClick={onClose}>
            Tutup Panduan
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pb-3 border-b border-slate-200">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari SOP, aturan syariah, deposit, kwitansi..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961] bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === cat
                    ? 'bg-[#c9a961] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'Semua Panduan' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Guide Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 min-h-[420px]">
          {/* Left Column: Topics List */}
          <div className="space-y-2 border-r border-slate-100 pr-3 max-h-[480px] overflow-y-auto">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block px-2">
              Daftar Topik SOP ({filteredSections.length})
            </span>
            {filteredSections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setSelectedSectionId(sec.id)}
                className={`w-full text-left p-3 rounded-xl transition-all border flex flex-col gap-1 ${
                  selectedSectionId === sec.id
                    ? 'bg-[#fbf8ee] border-[#c9a961] ring-2 ring-[#c9a961]/20'
                    : 'bg-white border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {sec.icon}
                    <span className="font-bold text-xs text-slate-900 line-clamp-1">{sec.title}</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {sec.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {sec.summary}
                </p>
              </button>
            ))}
          </div>

          {/* Right Column: Selected Topic Steps */}
          <div className="md:col-span-2 space-y-4 max-h-[480px] overflow-y-auto pr-1">
            {/* Topic Header Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#1A1410] via-[#2A2018] to-[#1A1410] border border-[#c9a961]/30 text-white shadow-sm flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c9a961] text-white">
                    {selectedSection.badge}
                  </span>
                  <span className="text-xs text-[#c9a961] font-medium">Kategori: {selectedSection.category}</span>
                </div>
                <h3 className="text-base font-extrabold mt-1 text-white">{selectedSection.title}</h3>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">{selectedSection.summary}</p>
              </div>

              {selectedSection.relatedPage && onNavigate && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    onNavigate(selectedSection.relatedPage!);
                    onClose();
                  }}
                  className="font-bold shrink-0 ml-3"
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  {selectedSection.pageName || 'Buka Halaman'}
                </Button>
              )}
            </div>

            {/* Steps Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#8a6d2b]" />
                Langkah-Langkah Pelaksanaan SOP
              </h4>

              {selectedSection.steps.map((step, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h5 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#fbf8ee] text-[#8a6d2b] border border-[#e8dfc8] text-[10px] font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      {step.title}
                    </h5>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Penanggung Jawab: <strong className="text-slate-800">{step.role}</strong>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed ml-7">
                    {step.description}
                  </p>

                  {step.tips && (
                    <div className="mt-2 ml-7 p-2 bg-amber-50/80 border border-amber-200/70 rounded-lg flex items-start gap-2 text-[11px] text-amber-900">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span><strong>Tips Operasional:</strong> {step.tips}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
