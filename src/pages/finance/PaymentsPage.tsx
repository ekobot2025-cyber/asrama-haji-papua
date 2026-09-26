import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Plus, Search, Printer, Receipt, 
  CheckCircle2, DollarSign, Download, Eye, FileText, ArrowRight 
} from 'lucide-react';
import { db } from '../../db/database';
import { Payment, Invoice, AppSettings, Reservation } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { terbilang } from '../../utils/terbilang';
import { formatCurrency, formatDateIndo, formatDateTimeIndo } from '../../utils/formatters';

interface PaymentsPageProps {
  initialInvoiceId?: string;
  onNavigate: (page: string, targetId?: string) => void;
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({ initialInvoiceId, onNavigate }) => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<AppSettings>(db.getSettings());
  const [searchTerm, setSearchTerm] = useState('');

  // New Payment Modal
  const [isNewPaymentOpen, setIsNewPaymentOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(initialInvoiceId || '');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<Payment['payment_method']>('TRANSFER_BSI');
  const [receivedFrom, setReceivedFrom] = useState('');
  const [forPurpose, setForPurpose] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Kwitansi Receipt Modal
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const loadData = () => {
    setPayments(db.getPayments());
    setInvoices(db.getInvoices());
    setSettings(db.getSettings());
  };

  useEffect(() => {
    loadData();
    if (initialInvoiceId) {
      const inv = db.getInvoices().find((i) => i.id === initialInvoiceId);
      if (inv) {
        setSelectedInvoiceId(inv.id);
        setAmount(inv.balance_due);
        setReceivedFrom(inv.bill_to_name);
        setForPurpose(`Pembayaran ${inv.invoice_no} (${inv.notes || 'Penginapan Asrama Haji'})`);
        setIsNewPaymentOpen(true);
      }
    }
  }, [initialInvoiceId]);

  const handleInvoiceChange = (invId: string) => {
    setSelectedInvoiceId(invId);
    const inv = invoices.find((i) => i.id === invId);
    if (inv) {
      setAmount(inv.balance_due);
      setReceivedFrom(inv.bill_to_name);
      setForPurpose(`Pelunasan Faktur ${inv.invoice_no}`);
    }
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedInvoiceId || amount <= 0) {
      toast.error('Gagal', 'Silakan pilih tagihan dan tentukan nominal pembayaran yang valid.');
      return;
    }

    const inv = invoices.find((i) => i.id === selectedInvoiceId);
    if (!inv) return;

    const newPay = db.createPayment(
      selectedInvoiceId,
      inv.reservation_id,
      Number(amount),
      paymentMethod,
      receivedFrom,
      forPurpose,
      currentUser,
      paymentNotes
    );

    toast.success(
      'Pembayaran Berhasil Dicatat',
      `Kwitansi resmi ${newPay.receipt_no} diterbitkan senilai ${formatCurrency(newPay.amount)}.`
    );

    setIsNewPaymentOpen(false);
    loadData();
    // Open receipt modal immediately
    setSelectedPayment(newPay);
    setIsReceiptOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const filtered = payments.filter((p) => {
    return (
      p.payment_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.receipt_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.received_from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.for_purpose.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-800" />
            Kasir Pembayaran & Kwitansi Resmi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan setoran penerimaan negara bukan pajak (PNBP), cetak kwitansi berseri resmi, dan konversi terbilang otomatis.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            if (invoices.length > 0) {
              const pendingInv = invoices.find((i) => i.balance_due > 0) || invoices[0];
              handleInvoiceChange(pendingInv.id);
            }
            setIsNewPaymentOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Catat Pembayaran Baru
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nomor kwitansi, bukti pembayaran, nama pembayar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Payments List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Kwitansi & Bayar</th>
                <th className="py-3 px-4">Telah Diterima Dari</th>
                <th className="py-3 px-4">Untuk Keperluan</th>
                <th className="py-3 px-4">Metode Bayar</th>
                <th className="py-3 px-4 text-right">Jumlah (Nominal)</th>
                <th className="py-3 px-4">Petugas / Kasir</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Belum ada riwayat pembayaran yang tercatat.
                  </td>
                </tr>
              ) : (
                filtered.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-emerald-900">{pay.receipt_no}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{pay.payment_no}</p>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900">
                      {pay.received_from}
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-[240px]">
                      <p className="truncate">{pay.for_purpose}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{formatDateIndo(pay.payment_date)}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {pay.payment_method.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                      {formatCurrency(pay.amount)}
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {pay.officer_name}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedPayment(pay);
                          setIsReceiptOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1 font-bold text-[11px]"
                        title="Lihat & Cetak Kwitansi"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Kwitansi</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Input Pembayaran Baru */}
      <Modal
        isOpen={isNewPaymentOpen}
        onClose={() => setIsNewPaymentOpen(false)}
        title="Input Pembayaran & Penerbitan Kwitansi"
        subtitle="Kasir UPT Asrama Haji Provinsi Papua"
        maxWidth="lg"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Pilih Tagihan / Faktur (Invoice) *</label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold"
            >
              <option value="">-- Pilih Invoice --</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoice_no} — {inv.bill_to_name} (Sisa: {formatCurrency(inv.balance_due)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nominal Pembayaran (Rp) *</label>
              <input
                type="number"
                step="50000"
                min="10000"
                required
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-emerald-900 text-sm"
              />
              <p className="text-[10px] text-slate-400 mt-1 italic">
                Terbilang: {amount > 0 ? terbilang(amount) : '-'}
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Metode Pembayaran *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold"
              >
                <option value="TRANSFER_BSI">Transfer Bank Syariah Indonesia (BSI)</option>
                <option value="TRANSFER_BPD_PAPUA">Transfer Bank Papua (BPD)</option>
                <option value="TRANSFER_BRI">Transfer Bank BRI</option>
                <option value="CASH">Kas Tunai (Front Office)</option>
                <option value="QRIS">QRIS Asrama Haji</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Telah Diterima Dari (Nama / Instansi) *</label>
            <input
              type="text"
              required
              value={receivedFrom}
              onChange={(e) => setReceivedFrom(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Untuk Pembayaran (Keperluan) *</label>
            <input
              type="text"
              required
              value={forPurpose}
              onChange={(e) => setForPurpose(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsNewPaymentOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit" icon={<Receipt className="w-4 h-4" />}>
              Terbitkan Kwitansi Resmi
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Cetak Kwitansi Resmi Format Standar A4 / Pemerintah */}
      {selectedPayment && (
        <Modal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          title={`Kwitansi Pembayaran Resmi — ${selectedPayment.receipt_no}`}
          maxWidth="3xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button size="sm" variant="secondary" onClick={() => setIsReceiptOpen(false)}>
                Tutup
              </Button>
              <Button size="sm" variant="primary" onClick={handlePrint} icon={<Printer className="w-4 h-4" />}>
                Cetak Kwitansi (A4)
              </Button>
            </div>
          }
        >
          {/* Printable Kwitansi Sheet */}
          <div className="bg-white p-6 sm:p-8 rounded-xl border-2 border-slate-800 text-slate-900 space-y-6 printable-sheet">
            {/* Kop Surat Resmi */}
            <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-600">
                  KEMENTERIAN AGAMA REPUBLIK INDONESIA
                </p>
                <h2 className="text-base font-black uppercase tracking-tight">
                  {settings.organization_name}
                </h2>
                <p className="text-xs text-slate-600">{settings.address}, {settings.city}</p>
              </div>

              <div className="text-right">
                <span className="text-lg font-black tracking-widest uppercase text-emerald-950 block">
                  KWITANSI
                </span>
                <p className="font-mono text-xs font-bold text-slate-800">{selectedPayment.receipt_no}</p>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-4 gap-2 pb-2 border-b border-dashed border-slate-200">
                <span className="text-slate-500 font-medium">Telah Diterima Dari:</span>
                <span className="col-span-3 font-bold text-sm text-slate-900">{selectedPayment.received_from}</span>
              </div>

              <div className="grid grid-cols-4 gap-2 pb-2 border-b border-dashed border-slate-200">
                <span className="text-slate-500 font-medium">Uang Sejumlah:</span>
                <span className="col-span-3 font-serif italic font-bold text-xs bg-slate-50 p-2 rounded border border-slate-200 text-slate-800">
                  "{selectedPayment.terbilang}"
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 pb-2 border-b border-dashed border-slate-200">
                <span className="text-slate-500 font-medium">Untuk Pembayaran:</span>
                <span className="col-span-3 text-slate-800 leading-relaxed font-semibold">
                  {selectedPayment.for_purpose}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 pb-2 border-b border-dashed border-slate-200">
                <span className="text-slate-500 font-medium">Metode Pembayaran:</span>
                <span className="col-span-3 font-bold text-slate-800">
                  {selectedPayment.payment_method.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Nominal Box & Signature */}
            <div className="flex items-end justify-between pt-4">
              <div className="bg-emerald-50/80 border-2 border-emerald-800 px-6 py-3 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-emerald-900 block">Jumlah Uang:</span>
                <span className="text-2xl font-black font-mono text-emerald-950">
                  {formatCurrency(selectedPayment.amount)}
                </span>
              </div>

              <div className="text-center text-xs">
                <p className="text-slate-600">Jayapura, {formatDateIndo(selectedPayment.payment_date)}</p>
                <p className="text-slate-500 text-[10px] mt-0.5">Bendahara Penerimaan Pembantu</p>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-[10px] text-slate-300 font-serif italic">[ Tanda Tangan & Stempel Resmi ]</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 underline">{selectedPayment.officer_name}</p>
                  <p className="text-[10px] text-slate-500">NIP. 19840212 200801 2 007</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
