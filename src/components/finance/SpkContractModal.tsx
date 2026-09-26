import React, { useRef, useState } from 'react';
import { Printer, FileText, CheckCircle2, ShieldCheck, Download, Loader2 } from 'lucide-react';
import { Invoice, Reservation } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { formatCurrency, formatDateIndo } from '../../utils/formatters';
import { downloadElementAsPdf } from '../../utils/pdfGenerator';
import { useToast } from '../../context/ToastContext';

interface SpkContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  reservation?: Reservation;
}

export const SpkContractModal: React.FC<SpkContractModalProps> = ({
  isOpen,
  onClose,
  invoice,
  reservation,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const toast = useToast();

  const spkNo = invoice.spk_contract_no || `SPK/AHP/KS/2026/${invoice.id.slice(-4)}`;
  const cleanFilename = `Surat_Perjanjian_SPK_${spkNo.replace(/[\/\\:]/g, '_')}`;

  const handleDownloadPdf = async (openInNewTab = false) => {
    if (!printRef.current) return;
    setIsGenerating(true);
    try {
      await downloadElementAsPdf(printRef.current, cleanFilename, {
        orientation: 'portrait',
        openInNewTab: openInNewTab,
        scale: 2.5,
      });
      toast.success(
        'Dokumen PDF Berhasil Dibuat',
        `File PDF ${cleanFilename}.pdf telah berhasil diekspor langsung.`
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
      title="Surat Perjanjian Sewa Sarana & Prasarana (SPK)"
      subtitle="Standar Dokumen Hukum & Akuntabilitas PNBP UPT Asrama Haji Papua"
      maxWidth="2xl"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
          <span className="font-mono text-xs text-slate-500">
            Nomor: {spkNo}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>
              Tutup
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDownloadPdf(true)}
              disabled={isGenerating}
              icon={<Printer className="w-4 h-4 text-emerald-800" />}
              title="Buka dokumen PDF di tab baru untuk dicetak"
            >
              Pratinjau PDF
            </Button>
            <Button
              variant="primary"
              onClick={() => handleDownloadPdf(false)}
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
        <div 
          ref={printRef} 
          className="bg-white p-6 sm:p-8 text-xs text-slate-900 leading-relaxed font-sans shadow-sm mx-auto max-w-[794px]"
        >
          {/* Kop Surat Kemenag Papua */}
          <div className="border-b-2 border-emerald-950 pb-4 mb-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-full bg-emerald-800 text-amber-300 flex items-center justify-center font-serif font-black text-xl shadow-xs">
                K
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 leading-tight">
                  KEMENTERIAN AGAMA REPUBLIK INDONESIA
                </h2>
                <h3 className="text-xs font-bold uppercase text-emerald-900 leading-tight">
                  KANTOR WILAYAH KEMENTERIAN AGAMA PROVINSI PAPUA
                </h3>
                <p className="text-[10px] text-slate-600 font-medium">
                  UPT ASRAMA HAJI PROVINSI PAPUA — Jl. Asrama Haji No. 01, Jayapura
                </p>
              </div>
            </div>
          </div>

          {/* Judul Kontrak */}
          <div className="text-center my-3">
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-wider underline">
              SURAT PERJANJIAN PEMAKAIAN SARANA DAN PRASARANA
            </h1>
            <p className="font-mono text-[11px] font-bold text-emerald-900 mt-0.5">
              NOMOR: {spkNo}
            </p>
          </div>

          <p className="text-justify mb-3">
            Pada hari ini, <strong>{formatDateIndo(invoice.issue_date)}</strong>, bertempat di Jayapura, kami yang bertanda tangan di bawah ini:
          </p>

          <div className="space-y-2 mb-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 print:bg-white">
            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-3 font-bold text-slate-700">1. Nama Pihak I</span>
              <span className="col-span-9 font-bold text-slate-900">: H. Ahmad Fauzi, S.Ag., M.Si</span>
            </div>
            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-3 text-slate-500">Jabatan</span>
              <span className="col-span-9 text-slate-800">: Kepala UPT Asrama Haji Provinsi Papua</span>
            </div>
            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-3 text-slate-500">Alamat</span>
              <span className="col-span-9 text-slate-800">: Kompleks Asrama Haji Papua, Jayapura (Selanjutnya disebut <strong>PIHAK PERTAMA</strong>)</span>
            </div>

            <div className="pt-2 border-t border-slate-200 mt-2">
              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-3 font-bold text-slate-700">2. Nama Pihak II</span>
                <span className="col-span-9 font-bold text-slate-900">: {invoice.bill_to_name}</span>
              </div>
              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-3 text-slate-500">Instansi / Lembaga</span>
                <span className="col-span-9 text-slate-800">: {invoice.institution_name || 'Mandiri / Panitia Kegiatan'}</span>
              </div>
              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-3 text-slate-500">Status</span>
                <span className="col-span-9 text-slate-800">: Pemohon Pemakaian Fasilitas (Selanjutnya disebut <strong>PIHAK KEDUA</strong>)</span>
              </div>
            </div>
          </div>

          <p className="text-justify mb-3">
            Kedua belah pihak sepakat mengikatkan diri dalam Perjanjian Sewa Sarana & Prasarana dengan ketentuan pasal-pasal sebagai berikut:
          </p>

          <div className="space-y-3 mb-5">
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Pasal 1: Objek dan Tujuan Pemakaian</h4>
              <p className="text-slate-600 text-justify">
                PIHAK PERTAMA menyetujui pemakaian fasilitas Asrama Haji Provinsi Papua kepada PIHAK KEDUA untuk keperluan kegiatan <strong>"{reservation?.activity_name || invoice.notes || 'Penginapan dan Pertemuan'}"</strong> sesuai dengan rincian pada Faktur Tagihan No. <strong>{invoice.invoice_no}</strong>.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-xs">Pasal 2: Biaya Sewa dan Penyetoran PNBP</h4>
              <p className="text-slate-600 text-justify">
                Total biaya sewa yang disepakati adalah sebesar <strong>{formatCurrency(invoice.total_amount)}</strong> yang merupakan Penerimaan Negara Bukan Pajak (PNBP) Kementerian Agama RI melalui <strong>Akun PNBP {invoice.pnbp_account_code || '425112'}</strong> dan disetorkan via Kode Billing SIMPONI <strong>{invoice.simponi_billing_code || '820260926001234'}</strong> atau rekening resmi kas BLU/UPT Asrama Haji Papua.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-xs">Pasal 3: Ketertiban, Keamanan, dan Norma Syariah</h4>
              <p className="text-slate-600 text-justify">
                PIHAK KEDUA wajib mematuhi seluruh tata tertib lingkungan Asrama Haji, menjaga ketertiban, kebersihan, dilarang merokok di area ruangan ber-AC, serta wajib menjaga norma kesopanan dan ketentuan syariah selama berada di kawasan Asrama Haji Papua.
              </p>
            </div>
          </div>

          {/* Tanda Tangan */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-center">
            <div>
              <p className="font-bold text-slate-900">PIHAK KEDUA (PENYEWA)</p>
              <p className="text-[10px] text-slate-500 mb-12">{invoice.institution_name || 'Penanggung Jawab Acara'}</p>
              <p className="font-bold text-slate-900 underline">{invoice.bill_to_name}</p>
              <p className="text-[10px] text-slate-400">Materai Rp 10.000 & Stempel</p>
            </div>

            <div>
              <p className="font-bold text-slate-900">PIHAK PERTAMA</p>
              <p className="text-[10px] text-slate-500 mb-12">Kepala UPT Asrama Haji Provinsi Papua</p>
              <p className="font-bold text-slate-900 underline">H. Ahmad Fauzi, S.Ag., M.Si</p>
              <p className="text-[10px] text-slate-400 font-mono">NIP. 19740510 200212 1 003</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
