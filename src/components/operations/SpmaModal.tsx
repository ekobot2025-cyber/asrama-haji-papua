import React, { useRef, useState } from 'react';
import { Printer, Download, QrCode, CheckCircle2, Building, BedDouble, ShieldCheck, Tag, ArrowRight, Loader2 } from 'lucide-react';
import { Reservation, Guest, Room, Bed, Building as BuildingType } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { formatDateIndo, maskNik } from '../../utils/formatters';
import { downloadElementAsPdf, printElementDirectly } from '../../utils/pdfGenerator';
import { useToast } from '../../context/ToastContext';

interface SpmaModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
  guest?: Guest;
  room?: Room;
  bed?: Bed;
  building?: BuildingType;
}

export const SpmaModal: React.FC<SpmaModalProps> = ({
  isOpen,
  onClose,
  reservation,
  guest,
  room,
  bed,
  building,
}) => {
  const [activeTab, setActiveTab] = useState<'SPMA' | 'LUGGAGE_TAG'>('SPMA');
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const toast = useToast();

  const spmaNo = reservation.spma_no || `SPMA/AHP/2026/${reservation.id.slice(-4)}`;
  const cleanFilename = `${activeTab === 'SPMA' ? 'Dokumen_SPMA' : 'Label_Bagasi'}_${spmaNo.replace(/[\/\\:]/g, '_')}`;

  const handleDirectPrint = () => {
    if (!printRef.current) return;
    printElementDirectly(printRef.current, cleanFilename, {
      orientation: activeTab === 'SPMA' ? 'portrait' : 'landscape',
    });
    toast.info('Menyiapkan Cetak', 'Dialog cetak dibuka langsung tanpa tab baru.');
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);
    try {
      await downloadElementAsPdf(printRef.current, cleanFilename, {
        orientation: activeTab === 'SPMA' ? 'portrait' : 'landscape',
        openInNewTab: false,
        fitToSinglePage: true,
        scale: 2.5,
      });
      toast.success(
        'Dokumen PDF Berhasil Dibuat',
        `File PDF 1 halaman ${cleanFilename}.pdf telah berhasil diekspor langsung.`
      );
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error('Gagal Ekspor PDF', 'Terjadi kesalahan saat memproses dokumen PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Surat Perintah Masuk Asrama (SPMA) & Tag Bagasi"
      subtitle="Dokumen Penempatan Jemaah & Tamu Resmi Berstandar Munakosah Kemenag"
      maxWidth="2xl"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('SPMA')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                activeTab === 'SPMA'
                  ? 'bg-[#c9a961] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Lembar SPMA Resmi
            </button>
            <button
              onClick={() => setActiveTab('LUGGAGE_TAG')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                activeTab === 'LUGGAGE_TAG'
                  ? 'bg-[#c9a961] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Label Koper / Tas Kabin
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>
              Tutup
            </Button>
            <Button
              variant="outline"
              onClick={handleDirectPrint}
              icon={<Printer className="w-4 h-4 text-[#8a6d2b]" />}
              title="Cetak langsung tanpa membuka tab baru"
            >
              Cetak Langsung
            </Button>
            <Button
              variant="primary"
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              icon={isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            >
              {isGenerating ? 'Membuat PDF...' : 'Unduh Dokumen PDF (.pdf)'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="bg-slate-100 p-2 sm:p-4 rounded-2xl overflow-y-auto max-h-[75vh]">
        <div ref={printRef} className="space-y-4 text-xs text-slate-800 bg-white p-6 sm:p-8 shadow-sm mx-auto max-w-[794px]">
          {activeTab === 'SPMA' ? (
            <div>
            {/* Kop Surat Kemenag Papua */}
            <div className="border-b-2 border-[#c9a961] pb-4 mb-4 text-center">
              <div className="flex items-center justify-center gap-3 mb-1">
                <div className="w-12 h-12 rounded-full bg-[#c9a961] text-amber-300 flex items-center justify-center font-serif font-black text-xl shadow-xs">
                  K
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 leading-tight">
                    KEMENTERIAN AGAMA REPUBLIK INDONESIA
                  </h2>
                  <h3 className="text-xs font-bold uppercase text-[#8a6d2b] leading-tight">
                    KANTOR WILAYAH KEMENTERIAN AGAMA PROVINSI PAPUA
                  </h3>
                  <p className="text-[10px] text-slate-600 font-medium">
                    UPT ASRAMA HAJI PROVINSI PAPUA — Jl. Asrama Haji No. 01, Jayapura
                  </p>
                </div>
              </div>
            </div>

            {/* Judul Dokumen */}
            <div className="text-center my-3">
              <h1 className="text-base font-black text-slate-900 uppercase tracking-wider underline">
                SURAT PERINTAH MASUK ASRAMA (SPMA)
              </h1>
              <p className="font-mono text-[11px] font-bold text-[#8a6d2b] mt-0.5">
                NOMOR: {spmaNo}
              </p>
            </div>

            <p className="text-[11px] text-slate-600 mb-4 leading-relaxed">
              Berdasarkan pendaftaran akomodasi Asrama Haji Provinsi Papua, bersama ini diperintahkan kepada jemaah / tamu berikut untuk memasuki fasilitas asrama sesuai jadwal dan penempatan tempat tidur:
            </p>

            {/* Identitas Jemaah / Tamu */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 print:bg-white print:border-slate-300">
              <div className="space-y-1.5">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Nama Lengkap</span>
                  <span className="font-bold text-slate-900 text-sm">{guest?.full_name || 'Tamu Terdaftar'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Nomor Induk Kependudukan (NIK)</span>
                  <span className="font-mono font-semibold text-slate-800">{guest?.nik ? maskNik(guest.nik) : '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Jenis Kelamin / Syariah</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    guest?.gender === 'L' ? 'bg-blue-100 text-blue-900' : 'bg-rose-100 text-rose-900'
                  }`}>
                    {guest?.gender === 'L' ? 'LAKI-LAKI (IKHWAN)' : 'PEREMPUAN (AKHWAT)'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Asal Daerah / Kabupaten</span>
                  <span className="font-bold text-slate-800">{guest?.regency_city || 'Provinsi Papua'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Kategori / Kegiatan</span>
                  <span className="font-bold text-[#8a6d2b]">{reservation.activity_type} — {reservation.activity_name || 'Akomodasi Asrama Haji'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Periode Menginap</span>
                  <span className="font-medium text-slate-800">
                    {formatDateIndo(reservation.checkin_date)} s/d {formatDateIndo(reservation.checkout_date)}
                  </span>
                </div>
              </div>
            </div>

            {/* Rincian Alokasi Kamar & Bed (Gaya Boarding Pass) */}
            <div className="p-4 rounded-xl border-2 border-[#c9a961] bg-[#fbf8ee] mb-5 print:bg-white">
              <div className="text-[10px] font-bold text-[#8a6d2b] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#8a6d2b]" />
                Alokasi Penempatan Akomodasi Resmi
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white p-3 rounded-lg border border-[#e8dfc8]">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Gedung / Zonasi</span>
                  <span className="font-black text-slate-900 text-base">{building?.name || 'Gedung Akomodasi'}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Kode: {building?.code || 'BLD'}</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-[#e8dfc8]">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Nomor Kamar</span>
                  <span className="font-black text-[#8a6d2b] text-2xl tracking-tight">{room?.room_number || 'A100'}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Kapasitas: {room?.capacity || 4} Bed</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-[#e8dfc8]">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Nomor Tempat Tidur (Bed)</span>
                  <span className="font-black text-amber-700 text-xl font-mono">{bed?.bed_code || `${room?.room_number || 'A100'}-B01`}</span>
                  <span className="text-[10px] text-[#8a6d2b] block font-bold mt-0.5">Satu Tamu / Bed</span>
                </div>
              </div>
            </div>

            {/* QR Code & Legalitas */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <div className="flex items-center gap-3">
                {/* Visual Clean QR Code */}
                <div className="w-20 h-20 bg-slate-900 p-1.5 rounded-xl flex items-center justify-center shrink-0">
                  <div className="w-full h-full bg-white p-1 rounded flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div className="w-3.5 h-3.5 bg-black" />
                      <div className="w-3.5 h-3.5 bg-black" />
                    </div>
                    <div className="flex justify-center items-center font-mono text-[7px] font-black text-center text-slate-900">
                      SIMAHA
                    </div>
                    <div className="flex justify-between">
                      <div className="w-3.5 h-3.5 bg-black" />
                      <div className="w-2 h-2 bg-black" />
                    </div>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-900 block text-xs">Validasi Digital Munakosah</span>
                  <p className="text-[10px] text-slate-500 max-w-[220px] leading-tight">
                    Tunjukkan SPMA ini beserta KTP asli kepada petugas front desk untuk pengambilan kunci kartu kamar.
                  </p>
                  <span className="font-mono text-[9px] text-slate-400 mt-1 block">
                    Payload: {spmaNo}
                  </span>
                </div>
              </div>

              <div className="text-right text-xs">
                <p className="text-slate-600">Jayapura, {formatDateIndo(reservation.reservation_date)}</p>
                <p className="font-bold text-slate-900 mt-0.5">An. Kepala UPT Asrama Haji Papua</p>
                <p className="text-[10px] text-slate-500">Petugas Front Desk & Layanan Kamar</p>
                <div className="h-10 flex items-center justify-end my-1">
                  <span className="font-serif italic font-bold text-[#8a6d2b] border-b border-dashed border-[#c9a961] px-3">
                    [Tervalidasi Sistem SIMAHA]
                  </span>
                </div>
                <p className="font-bold text-slate-900 underline">{reservation.created_by || 'Petugas Penginapan'}</p>
                <p className="text-[9px] text-slate-400 font-mono">NIP. 19850412 201101 1 008</p>
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: Luggage Tag / Label Tas Kabin & Koper */
          <div className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-900 text-xs">
              <p className="font-bold flex items-center gap-1.5 mb-1">
                <Tag className="w-4 h-4 text-amber-700" />
                Standar Labeling Tas Kabin & Bagasi Jemaah (Munakosah PPIH)
              </p>
              <p className="text-[11px] text-amber-800">
                Gunting dan sematkan label ini pada pegangan koper atau tas jemaah agar tim logistik asrama dapat langsung mengantar koper ke kamar dan tempat tidur yang bersangkutan tanpa tertukar.
              </p>
            </div>

            <div className="max-w-md mx-auto border-2 border-dashed border-slate-400 rounded-2xl p-5 bg-white shadow-sm print:border-solid">
              <div className="flex items-center justify-between border-b pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#c9a961] text-amber-300 font-bold text-xs flex items-center justify-center">
                    AH
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-xs">BAGASI AKOMODASI ASRAMA HAJI</h4>
                    <p className="text-[9px] text-slate-500">UPT ASRAMA HAJI PROVINSI PAPUA</p>
                  </div>
                </div>
                <span className="font-mono text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded">
                  {reservation.reservation_no}
                </span>
              </div>

              <div className="bg-slate-900 text-white p-4 rounded-xl text-center mb-3">
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest block">
                  NOMOR KAMAR & TEMPAT TIDUR
                </span>
                <span className="text-3xl font-black font-mono tracking-tight block my-0.5">
                  KAMAR {room?.room_number || 'A100'}
                </span>
                <span className="text-sm font-bold bg-amber-400 text-slate-950 px-3 py-0.5 rounded-full inline-block font-mono">
                  BED: {bed?.bed_code || `${room?.room_number || 'A100'}-B01`}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Nama Tamu / Jemaah:</span>
                  <span className="font-bold text-slate-900">{guest?.full_name || 'Tamu Terdaftar'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Gedung:</span>
                  <span className="font-bold text-[#8a6d2b]">{building?.name || 'Gedung Akomodasi'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Asal Daerah:</span>
                  <span className="font-bold text-slate-800">{guest?.regency_city || 'Provinsi Papua'}</span>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span className="text-slate-500">Rombongan / Instansi:</span>
                  <span className="font-semibold text-slate-700">{reservation.activity_name || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </Modal>
  );
};
