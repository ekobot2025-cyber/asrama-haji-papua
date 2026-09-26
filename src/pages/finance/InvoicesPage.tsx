import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Printer, Plus, CreditCard, 
  Download, Eye, CheckCircle2, AlertCircle, Building2 
} from 'lucide-react';
import { db } from '../../db/database';
import { Invoice, InvoiceItem, AppSettings, Reservation } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ExtraChargeModal } from '../../components/finance/ExtraChargeModal';
import { formatCurrency, formatDateIndo } from '../../utils/formatters';

interface InvoicesPageProps {
  initialInvoiceId?: string;
  onNavigate: (page: string, targetId?: string) => void;
}

export const InvoicesPage: React.FC<InvoicesPageProps> = ({ initialInvoiceId, onNavigate }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(db.getSettings());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Preview invoice modal
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Extra Charge modal
  const [extraChargeInvoice, setExtraChargeInvoice] = useState<Invoice | null>(null);
  const [isExtraChargeOpen, setIsExtraChargeOpen] = useState(false);

  const loadData = () => {
    setInvoices(db.getInvoices());
    setInvoiceItems(db.getInvoiceItems());
    setSettings(db.getSettings());
  };

  useEffect(() => {
    loadData();
    if (initialInvoiceId) {
      const inv = db.getInvoices().find((i) => i.id === initialInvoiceId || i.reservation_id === initialInvoiceId);
      if (inv) {
        setPreviewInvoice(inv);
        setIsPreviewOpen(true);
      }
    }
  }, [initialInvoiceId]);

  const filtered = invoices.filter((inv) => {
    const matchSearch =
      inv.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.bill_to_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.institution_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getItemsForInvoice = (invoiceId: string) => {
    return invoiceItems.filter((i) => i.invoice_id === invoiceId);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-800" />
            Tagihan & Faktur (Invoices)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan invoice resmi sewa akomodasi, penggunaan aula, dan jasa layanan UPT Asrama Haji Papua.
          </p>
        </div>

        <Button
          variant="amber"
          size="sm"
          onClick={() => onNavigate('payments')}
          icon={<CreditCard className="w-4 h-4" />}
        >
          Buka Kasir Pembayaran
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nomor invoice, nama pemesan, instansi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 bg-slate-50/50"
            />
          </div>
        </div>

        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 bg-white"
          >
            <option value="all">Semua Status Invoice</option>
            <option value="PAID">PAID (Lunas)</option>
            <option value="PARTIAL">PARTIAL (Sebagian)</option>
            <option value="UNPAID">UNPAID (Belum Bayar)</option>
          </select>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Invoice</th>
                <th className="py-3 px-4">Ditagihkan Kepada</th>
                <th className="py-3 px-4">Tanggal Terbit & Jatuh Tempo</th>
                <th className="py-3 px-4 text-right">Total Tagihan</th>
                <th className="py-3 px-4 text-right">Sudah Dibayar</th>
                <th className="py-3 px-4 text-right">Sisa Tagihan</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ada data invoice yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {inv.invoice_no}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{inv.bill_to_name}</p>
                      {inv.institution_name && (
                        <p className="text-[11px] text-slate-500 truncate max-w-[200px] mt-0.5">
                          {inv.institution_name}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <p>{formatDateIndo(inv.issue_date)}</p>
                      <p className="text-[10px] text-slate-400">Jatuh Tempo: {formatDateIndo(inv.due_date)}</p>
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(inv.total_amount)}
                    </td>

                    <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                      {formatCurrency(inv.paid_amount)}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-rose-600">
                      {inv.balance_due > 0 ? formatCurrency(inv.balance_due) : 'Rp 0'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <Badge status={inv.status} size="sm" />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setExtraChargeInvoice(inv);
                            setIsExtraChargeOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors inline-flex items-center gap-1 font-semibold text-[11px]"
                          title="Posting Layanan / Extra Charge"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Layanan</span>
                        </button>
                        <button
                          onClick={() => {
                            setPreviewInvoice(inv);
                            setIsPreviewOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
                          title="Lihat & Cetak Faktur"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {inv.balance_due > 0 && (
                          <button
                            onClick={() => onNavigate('payments', inv.id)}
                            className="p-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors"
                            title="Input Pembayaran Kasir"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Print & Preview Modal (A4 Standard Format) */}
      {previewInvoice && (
        <Modal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title={`Faktur Tagihan & Folio Tamu — ${previewInvoice.invoice_no}`}
          maxWidth="4xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => setIsPreviewOpen(false)}>
                  Tutup
                </Button>
                <Button
                  size="sm"
                  variant="amber"
                  onClick={() => {
                    setExtraChargeInvoice(previewInvoice);
                    setIsExtraChargeOpen(true);
                  }}
                  icon={<Plus className="w-4 h-4" />}
                >
                  + Tambah Layanan Folio
                </Button>
              </div>
              <Button size="sm" variant="primary" onClick={handlePrint} icon={<Printer className="w-4 h-4" />}>
                Cetak Invoice (A4)
              </Button>
            </div>
          }
        >
          {/* Printable A4 Document Sheet */}
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 text-slate-800 space-y-6 printable-sheet">
            {/* Government & UPT Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold tracking-widest uppercase text-slate-600">
                  KEMENTERIAN AGAMA REPUBLIK INDONESIA
                </p>
                <h2 className="text-base font-black text-slate-900 uppercase">
                  {settings.organization_name}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">{settings.address}, {settings.city}, {settings.province}</p>
                <p className="text-[11px] text-slate-500">Telp: {settings.phone} &bull; Email: {settings.email}</p>
              </div>

              <div className="text-right">
                <span className="text-xl font-black text-emerald-900 tracking-wider">INVOICE</span>
                <p className="font-mono text-xs font-bold text-slate-800 mt-1">{previewInvoice.invoice_no}</p>
                <div className="mt-1">
                  <Badge status={previewInvoice.status} size="sm" />
                </div>
              </div>
            </div>

            {/* Bill To & Date Grid */}
            <div className="grid grid-cols-2 gap-6 text-xs">
              <div>
                <p className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">DITAGIHKAN KEPADA:</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{previewInvoice.bill_to_name}</p>
                {previewInvoice.institution_name && (
                  <p className="text-slate-600 font-medium">{previewInvoice.institution_name}</p>
                )}
              </div>

              <div className="space-y-1 text-right">
                <p><span className="text-slate-500">Tanggal Terbit:</span> <span className="font-bold">{formatDateIndo(previewInvoice.issue_date)}</span></p>
                <p><span className="text-slate-500">Jatuh Tempo:</span> <span className="font-bold">{formatDateIndo(previewInvoice.due_date)}</span></p>
                <p><span className="text-slate-500">No. Reservasi:</span> <span className="font-mono font-bold">{previewInvoice.reservation_id}</span></p>
              </div>
            </div>

            {/* Invoice Items Table */}
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">Deskripsi Layanan / Fasilitas</th>
                  <th className="py-2.5 px-3 text-center">Jumlah</th>
                  <th className="py-2.5 px-3 text-right">Tarif Satuan</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getItemsForInvoice(previewInvoice.id).map((item, idx) => (
                  <tr key={item.id}>
                    <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2 px-3 font-semibold text-slate-800">{item.description}</td>
                    <td className="py-2 px-3 text-center">{item.quantity} {item.unit}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatCurrency(item.unit_price)}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">{formatCurrency(item.total_price)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                <tr>
                  <td colSpan={4} className="py-2 px-3 text-right">Subtotal:</td>
                  <td className="py-2 px-3 text-right font-mono">{formatCurrency(previewInvoice.subtotal)}</td>
                </tr>
                {previewInvoice.discount_amount > 0 && (
                  <tr>
                    <td colSpan={4} className="py-1 px-3 text-right text-emerald-700">Diskon:</td>
                    <td className="py-1 px-3 text-right font-mono text-emerald-700">-{formatCurrency(previewInvoice.discount_amount)}</td>
                  </tr>
                )}
                <tr className="text-sm bg-emerald-50/60 text-emerald-950 font-black">
                  <td colSpan={4} className="py-2.5 px-3 text-right">TOTAL TAGIHAN:</td>
                  <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(previewInvoice.total_amount)}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="py-1 px-3 text-right text-slate-600">Telah Dibayar:</td>
                  <td className="py-1 px-3 text-right font-mono text-emerald-700">{formatCurrency(previewInvoice.paid_amount)}</td>
                </tr>
                <tr className="text-rose-700">
                  <td colSpan={4} className="py-1.5 px-3 text-right">Sisa Pembayaran (Balance Due):</td>
                  <td className="py-1.5 px-3 text-right font-mono font-black">{formatCurrency(previewInvoice.balance_due)}</td>
                </tr>
              </tfoot>
            </table>

            {/* Bank Accounts & Signature */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-800 text-[11px]">Rekening Pembayaran Resmi:</p>
                <p className="text-[11px] text-slate-600">{settings.bank_bpd_papua}</p>
                <p className="text-[11px] text-slate-600">{settings.bank_bsi}</p>
                <p className="text-[11px] text-slate-600">{settings.bank_bri}</p>
              </div>

              <div className="text-center flex flex-col justify-between">
                <p className="text-slate-600">Jayapura, {formatDateIndo(previewInvoice.issue_date)}</p>
                <p className="text-slate-500 text-[10px]">Bendahara Penerimaan Pembantu</p>
                <div className="h-12" />
                <div>
                  <p className="font-bold text-slate-900 underline">Nurlaila Hasibuan, S.E.</p>
                  <p className="text-[10px] text-slate-500">NIP. 19840212 200801 2 007</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Extra Charge / Guest Folio Modal */}
      {extraChargeInvoice && (
        <ExtraChargeModal
          isOpen={isExtraChargeOpen}
          onClose={() => {
            setIsExtraChargeOpen(false);
            setExtraChargeInvoice(null);
          }}
          invoice={extraChargeInvoice}
          onSuccess={() => {
            loadData();
            if (previewInvoice) {
              const updated = db.getInvoices().find((i) => i.id === previewInvoice.id);
              if (updated) setPreviewInvoice(updated);
            }
          }}
        />
      )}
    </div>
  );
};
