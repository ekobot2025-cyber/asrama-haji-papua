import React, { useRef, useState, useEffect } from 'react';
import { 
  Printer, FileText, CheckCircle2, ShieldCheck, Download, 
  Loader2, Eye, RefreshCw, Sparkles 
} from 'lucide-react';
import { Invoice, Reservation } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { formatCurrency, formatDateIndo } from '../../utils/formatters';
import { 
  downloadElementAsPdf, 
  generatePdfBlobFromElement, 
  printElementDirectly 
} from '../../utils/pdfGenerator';
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
  const [viewMode, setViewMode] = useState<'document' | 'pdf'>('document');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const toast = useToast();

  const spkNo = invoice.spk_contract_no || `SPK/AHP/KS/2026/${invoice.id.slice(-4)}`;
  const cleanFilename = `Surat_Perjanjian_SPK_${spkNo.replace(/[\/\\:]/g, '_')}`;

  // Clean up blob URL on close
  useEffect(() => {
    if (!isOpen) {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
        setPdfBlobUrl(null);
      }
      setViewMode('document');
    }
  }, [isOpen]);

  const handleGeneratePdfBlob = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);
    try {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
      const res = await generatePdfBlobFromElement(printRef.current, {
        orientation: 'portrait',
        scale: 2.5,
        fitToSinglePage: true,
      });
      setPdfBlobUrl(res.blobUrl);
      setViewMode('pdf');
      toast.success('Pratinjau PDF Siap', 'Dokumen PDF 1 halaman ditampilkan langsung.');
    } catch (err) {
      console.error('Error generating PDF preview:', err);
      toast.error('Gagal Pratinjau', 'Terjadi kendala saat memuat pratinjau PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDirectPrint = () => {
    if (!printRef.current) return;
    try {
      printElementDirectly(printRef.current, `SPK_${spkNo}`);
      toast.info('Menyiapkan Cetak', 'Dialog cetak dibuka langsung tanpa tab baru.');
    } catch (err) {
      console.error('Direct print error:', err);
      toast.error('Gagal Mencetak', 'Terjadi kesalahan saat memulai pencetakan.');
    }
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);
    try {
      await downloadElementAsPdf(printRef.current, cleanFilename, {
        orientation: 'portrait',
        openInNewTab: false,
        fitToSinglePage: true,
        scale: 2.5,
      });
      toast.success(
        'Dokumen PDF Berhasil Dibuat',
        `File PDF 1 halaman ${cleanFilename}.pdf berhasil diunduh.`
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
      subtitle="Dokumen Hukum Standar 1 Halaman — UPT Asrama Haji Provinsi Papua"
      maxWidth="3xl"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-500 font-semibold">
              No: {spkNo}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Format 1 Halaman (A4)
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Tutup
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDirectPrint}
              icon={<Printer className="w-4 h-4 text-emerald-800" />}
              title="Cetak langsung dokumen tanpa membuka tab baru"
            >
              Cetak Langsung
            </Button>
            <Button
              variant="primary"
              size="sm"
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
      {/* Top Segmented Controls for 1-Page In-Modal Preview */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setViewMode('document')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'document'
                ? 'bg-white text-emerald-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-700" />
            <span>Lembar Dokumen (1 Hal)</span>
          </button>

          <button
            onClick={() => {
              if (pdfBlobUrl) {
                setViewMode('pdf');
              } else {
                handleGeneratePdfBlob();
              }
            }}
            disabled={isGenerating}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'pdf'
                ? 'bg-white text-emerald-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-emerald-700" />
            )}
            <span>Pratinjau PDF Asli (1 Hal)</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 hidden sm:flex items-center gap-1 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Tanpa Tab Baru &bull; Pas 1 Lembar A4</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-slate-100 p-2 sm:p-4 rounded-2xl overflow-y-auto max-h-[72vh]">
        {/* PDF Embedded View inside Modal */}
        {viewMode === 'pdf' && pdfBlobUrl && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs px-2 text-slate-600">
              <span className="font-semibold">Pratinjau File PDF Resmi (1 Halaman):</span>
              <button
                onClick={handleGeneratePdfBlob}
                className="text-emerald-700 hover:underline inline-flex items-center gap-1 text-[11px] font-bold"
              >
                <RefreshCw className="w-3 h-3" /> Segarkan Pratinjau
              </button>
            </div>
            <iframe
              src={`${pdfBlobUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full h-[68vh] rounded-xl border border-slate-300 bg-white shadow-xs"
              title="Pratinjau PDF SPK 1 Halaman"
            />
          </div>
        )}

        {/* Document Sheet (Always in DOM for ref, hidden if viewing PDF iframe) */}
        <div className={viewMode === 'pdf' ? 'hidden' : 'block'}>
          <div 
            ref={printRef} 
            className="bg-white p-5 sm:p-7 text-slate-900 font-sans shadow-xs mx-auto max-w-[760px] border border-slate-200"
            style={{ minHeight: '920px' }}
          >
            {/* Kop Surat Kemenag Papua */}
            <div className="border-b-2 border-emerald-950 pb-2.5 mb-2.5 text-center">
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-800 text-amber-300 flex items-center justify-center font-serif font-black text-lg shadow-xs flex-shrink-0">
                  K
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wide text-slate-900 leading-tight">
                    KEMENTERIAN AGAMA REPUBLIK INDONESIA
                  </h2>
                  <h3 className="text-[11px] font-bold uppercase text-emerald-900 leading-tight mt-0.5">
                    KANTOR WILAYAH KEMENTERIAN AGAMA PROVINSI PAPUA
                  </h3>
                  <p className="text-[9.5px] text-slate-700 font-semibold mt-0.5">
                    UPT ASRAMA HAJI PROVINSI PAPUA
                  </p>
                  <p className="text-[8.5px] text-slate-500">
                    Jl. Asrama Haji No. 01, Jayapura &bull; Telp: (0967) 533451 &bull; Email: asramahaji.papua@kemenag.go.id
                  </p>
                </div>
              </div>
            </div>

            {/* Judul Kontrak */}
            <div className="text-center my-2">
              <h1 className="text-xs font-black text-slate-900 uppercase tracking-wider underline">
                SURAT PERJANJIAN PEMAKAIAN SARANA DAN PRASARANA
              </h1>
              <p className="font-mono text-[10px] font-bold text-emerald-900 mt-0.5">
                NOMOR: {spkNo}
              </p>
            </div>

            <p className="text-justify text-[10px] leading-relaxed mb-2 text-slate-800">
              Pada hari ini, <strong>{formatDateIndo(invoice.issue_date)}</strong>, bertempat di Jayapura, kami yang bertanda tangan di bawah ini:
            </p>

            {/* Pihak I & Pihak II Box */}
            <div className="space-y-1.5 mb-2.5 bg-slate-50/90 p-2.5 rounded-lg border border-slate-200 text-[10px]">
              <div className="grid grid-cols-12 gap-1.5">
                <span className="col-span-3 font-bold text-slate-700">1. Nama Pihak I</span>
                <span className="col-span-9 font-bold text-slate-900">: H. Ahmad Fauzi, S.Ag., M.Si</span>
              </div>
              <div className="grid grid-cols-12 gap-1.5">
                <span className="col-span-3 text-slate-500">Jabatan</span>
                <span className="col-span-9 text-slate-800">: Kepala UPT Asrama Haji Provinsi Papua</span>
              </div>
              <div className="grid grid-cols-12 gap-1.5">
                <span className="col-span-3 text-slate-500">Alamat</span>
                <span className="col-span-9 text-slate-800">: Kompleks Asrama Haji Papua, Jayapura (Selanjutnya disebut <strong>PIHAK PERTAMA</strong>)</span>
              </div>

              <div className="pt-1.5 border-t border-slate-200 mt-1.5 space-y-1.5">
                <div className="grid grid-cols-12 gap-1.5">
                  <span className="col-span-3 font-bold text-slate-700">2. Nama Pihak II</span>
                  <span className="col-span-9 font-bold text-slate-900">: {invoice.bill_to_name}</span>
                </div>
                <div className="grid grid-cols-12 gap-1.5">
                  <span className="col-span-3 text-slate-500">Instansi / Lembaga</span>
                  <span className="col-span-9 text-slate-800">: {invoice.institution_name || 'Mandiri / Panitia Penyelenggara'}</span>
                </div>
                <div className="grid grid-cols-12 gap-1.5">
                  <span className="col-span-3 text-slate-500">Status</span>
                  <span className="col-span-9 text-slate-800">: Pemohon Pemakaian Fasilitas (Selanjutnya disebut <strong>PIHAK KEDUA</strong>)</span>
                </div>
              </div>
            </div>

            <p className="text-justify text-[10px] leading-relaxed mb-2 text-slate-800">
              Kedua belah pihak sepakat mengikatkan diri dalam Perjanjian Sewa Sarana & Prasarana dengan ketentuan pasal-pasal sebagai berikut:
            </p>

            {/* Pasal-Pasal */}
            <div className="space-y-2 mb-3 text-[10px] text-justify leading-relaxed text-slate-700">
              <div>
                <h4 className="font-bold text-slate-900 text-[10.5px]">Pasal 1: Objek dan Tujuan Pemakaian</h4>
                <p>
                  PIHAK PERTAMA menyetujui pemakaian fasilitas Asrama Haji Provinsi Papua kepada PIHAK KEDUA untuk kegiatan <strong>"{reservation?.activity_name || invoice.notes || 'Penginapan dan Pertemuan'}"</strong> sesuai rincian pada Faktur Tagihan No. <strong>{invoice.invoice_no}</strong>.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-[10.5px]">Pasal 2: Biaya Sewa dan Penyetoran PNBP</h4>
                <p>
                  Total biaya sewa yang disepakati adalah sebesar <strong>{formatCurrency(invoice.total_amount)}</strong> yang merupakan Penerimaan Negara Bukan Pajak (PNBP) Kementerian Agama RI melalui <strong>Akun PNBP {invoice.pnbp_account_code || '425112'}</strong> dan disetorkan via Kode Billing SIMPONI <strong>{invoice.simponi_billing_code || '820260926001234'}</strong> atau rekening resmi kas BLU/UPT Asrama Haji Papua.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-[10.5px]">Pasal 3: Ketertiban, Keamanan, dan Norma Syariah</h4>
                <p>
                  PIHAK KEDUA wajib mematuhi seluruh tata tertib lingkungan Asrama Haji, menjaga ketertiban, kebersihan, dilarang merokok di area ruangan ber-AC, serta wajib menjaga norma kesopanan dan ketentuan syariah selama berada di kawasan Asrama Haji Papua.
                </p>
              </div>
            </div>

            {/* Tanda Tangan */}
            <div className="grid grid-cols-2 gap-6 pt-2.5 border-t border-slate-300 text-center text-[10.5px]">
              <div>
                <p className="font-bold text-slate-900">PIHAK KEDUA (PENYEWA)</p>
                <p className="text-[9.5px] text-slate-500">{invoice.institution_name || 'Penanggung Jawab Acara'}</p>
                <div className="h-14 flex items-center justify-center">
                  <span className="text-[9px] text-slate-400 border border-dashed border-slate-300 px-2 py-0.5 rounded">
                    [ Materai Rp 10.000 & Stempel ]
                  </span>
                </div>
                <p className="font-bold text-slate-900 underline">{invoice.bill_to_name}</p>
                <p className="text-[9px] text-slate-400">Penyewa / Penanggung Jawab</p>
              </div>

              <div>
                <p className="font-bold text-slate-900">PIHAK PERTAMA</p>
                <p className="text-[9.5px] text-slate-500">Kepala UPT Asrama Haji Provinsi Papua</p>
                <div className="h-14 flex items-center justify-center">
                  <span className="text-[9px] text-slate-400 italic">
                    [ Tanda Tangan & Cap Dinas Resmi ]
                  </span>
                </div>
                <p className="font-bold text-slate-900 underline">H. Ahmad Fauzi, S.Ag., M.Si</p>
                <p className="text-[9px] text-slate-500 font-mono">NIP. 19740510 200212 1 003</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
