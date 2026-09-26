import React, { useRef } from 'react';
import { Printer, CheckCircle2, QrCode, FileText, Plus, ShieldCheck, ArrowRight } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { formatCurrency, formatDateTimeIndo, formatDateIndo } from '../../utils/formatters';

export interface PosReceiptData {
  receiptNo: string;
  dateTime: string;
  cashierName: string;
  guestName: string;
  institutionName?: string;
  phone?: string;
  roomInfo?: {
    roomNumber: string;
    buildingName: string;
    bedName?: string;
    checkinDate: string;
    checkoutDate: string;
    nights: number;
  };
  items: Array<{
    name: string;
    qty: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  depositAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: string;
  simponiBillingCode?: string;
  cardKeysIssued: number;
}

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PosReceiptData;
  onNewTransaction: () => void;
  onViewSpma?: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  isOpen,
  onClose,
  data,
  onNewTransaction,
  onViewSpma,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method.toUpperCase()) {
      case 'CASH': return 'TUNAI (CASH FRONT DESK)';
      case 'QRIS': return 'QRIS KEMENAG PAPUA';
      case 'TRANSFER': return 'TRANSFER BANK (BSI / BANK PAPUA)';
      case 'SIMPONI': return 'KODE BILLING SIMPONI (MPN-G3)';
      default: return method;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transaksi Kasir Resepsionis Berhasil!"
      subtitle={`No. Resi Kasir: ${data.receiptNo}`}
      maxWidth="md"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onNewTransaction}
              icon={<Plus className="w-4 h-4 text-emerald-800" />}
              className="w-full sm:w-auto"
            >
              Transaksi Baru (F2)
            </Button>
            {onViewSpma && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onViewSpma}
                icon={<FileText className="w-4 h-4 text-indigo-700" />}
                className="w-full sm:w-auto"
              >
                Cetak SPMA
              </Button>
            )}
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4" />}
            className="w-full sm:w-auto shadow-md"
          >
            Cetak Struk Kasir (80mm)
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Success Banner */}
        <div className="flex items-center gap-3 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="leading-snug">
            <p className="font-bold">Check-in & Pembayaran Berhasil Didaftarkan!</p>
            <p className="text-[11px] text-emerald-700">Kamar telah berstatus OCCUPIED dan struk kasir siap dicetak untuk tamu.</p>
          </div>
        </div>

        {/* Authentic Thermal Paper Slip View (80mm / 58mm style) */}
        <div className="flex justify-center bg-slate-100 p-4 rounded-2xl border border-slate-200">
          <div 
            ref={receiptRef}
            className="w-full max-w-[340px] bg-white p-5 rounded shadow-md border border-slate-300 font-mono text-[11px] text-slate-900 leading-relaxed print:w-[80mm] print:border-none print:shadow-none print:p-2"
          >
            {/* Kop Kasir Asrama Haji */}
            <div className="text-center pb-2 border-b border-dashed border-slate-400">
              <p className="text-[10px] tracking-wider uppercase text-slate-500 font-bold">KEMENTERIAN AGAMA RI</p>
              <p className="font-extrabold text-xs text-slate-950 uppercase mt-0.5">UPT ASRAMA HAJI PAPUA</p>
              <p className="text-[10px] text-slate-600 leading-tight">Kotaraja, Abepura, Kota Jayapura</p>
              <p className="text-[9px] text-slate-500">Telp: (0967) 581234 &bull; SIMAHA Papua</p>
            </div>

            {/* Receipt Meta */}
            <div className="py-2 border-b border-dashed border-slate-400 space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>No. Resi</span>
                <span className="font-bold">{data.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu</span>
                <span>{data.dateTime}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir</span>
                <span className="font-medium truncate max-w-[170px]">{data.cashierName}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-dotted border-slate-300">
                <span>Tamu</span>
                <span className="font-bold truncate max-w-[170px]">{data.guestName}</span>
              </div>
              {data.institutionName && (
                <div className="flex justify-between">
                  <span>Instansi</span>
                  <span className="truncate max-w-[170px]">{data.institutionName}</span>
                </div>
              )}
              {data.roomInfo && (
                <div className="flex justify-between text-emerald-900 font-semibold bg-emerald-50 px-1 py-0.5 rounded">
                  <span>Kamar Terpilih</span>
                  <span>{data.roomInfo.roomNumber} ({data.roomInfo.buildingName})</span>
                </div>
              )}
            </div>

            {/* Items Breakdown */}
            <div className="py-2 border-b border-dashed border-slate-400 space-y-1.5">
              <div className="flex justify-between font-bold text-[10px] text-slate-600 pb-0.5 border-b border-dotted border-slate-300">
                <span>DESKRIPSI ITEM</span>
                <span>JUMLAH</span>
              </div>

              {data.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-medium">
                    <span className="truncate max-w-[200px]">{item.name}</span>
                    <span>{formatCurrency(item.totalPrice)}</span>
                  </div>
                  <div className="text-[9px] text-slate-500 flex justify-between pl-2">
                    <span>{item.qty} x @{formatCurrency(item.unitPrice)}</span>
                  </div>
                </div>
              ))}

              {data.depositAmount > 0 && (
                <div className="flex justify-between pt-1 font-semibold text-amber-900 bg-amber-50/80 px-1 py-0.5 rounded">
                  <span>Jaminan Kunci (Deposit)</span>
                  <span>{formatCurrency(data.depositAmount)}</span>
                </div>
              )}
            </div>

            {/* Totals & Payment Settlement */}
            <div className="py-2 border-b border-dashed border-slate-400 space-y-1">
              <div className="flex justify-between text-[10px]">
                <span>Subtotal Item</span>
                <span>{formatCurrency(data.subtotal)}</span>
              </div>

              {data.discountAmount > 0 && (
                <div className="flex justify-between text-[10px] text-emerald-700">
                  <span>Diskon</span>
                  <span>-{formatCurrency(data.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-xs font-black pt-1 border-t border-dotted border-slate-300">
                <span>TOTAL AKHIR</span>
                <span className="font-mono">{formatCurrency(data.totalAmount)}</span>
              </div>

              <div className="flex justify-between text-[10px] pt-1 text-slate-700">
                <span>Metode Bayar</span>
                <span className="font-semibold">{getPaymentMethodLabel(data.paymentMethod)}</span>
              </div>

              <div className="flex justify-between text-[10px]">
                <span>Bayar / Diterima</span>
                <span className="font-bold">{formatCurrency(data.paidAmount)}</span>
              </div>

              <div className="flex justify-between text-[10px] font-bold text-slate-900 bg-slate-100 px-1 py-0.5 rounded">
                <span>Kembalian</span>
                <span>{formatCurrency(data.changeAmount)}</span>
              </div>

              {data.simponiBillingCode && (
                <div className="mt-1 pt-1 border-t border-dotted border-slate-300 text-center">
                  <p className="text-[9px] text-slate-500 uppercase font-semibold">Kode Billing SIMPONI MPN-G3</p>
                  <p className="font-bold text-xs tracking-wider font-mono text-emerald-900">{data.simponiBillingCode}</p>
                </div>
              )}
            </div>

            {/* Keycard Handover & Instructions */}
            <div className="py-2 border-b border-dashed border-slate-400 text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold">
                <span>KUNCI KARTU DISERAHKAN: {data.cardKeysIssued} UNIT</span>
              </div>
              <p className="text-[9px] text-slate-600 leading-tight">
                Simpan struk ini sebagai bukti serah terima kunci. Deposit dikembalikan utuh saat check-out dengan mengembalikan kartu kunci.
              </p>
            </div>

            {/* Barcode & Footer */}
            <div className="pt-3 text-center space-y-1">
              <div className="inline-block p-1 bg-white border border-slate-300 rounded">
                <QrCode className="w-12 h-12 mx-auto text-slate-800" />
              </div>
              <p className="text-[8px] text-slate-400 font-mono tracking-widest uppercase">
                {data.receiptNo}
              </p>
              <p className="text-[9px] font-semibold text-slate-700 mt-1">
                Terima Kasih Atas Kunjungan Anda
              </p>
              <p className="text-[8px] text-slate-500 italic">
                Pelayanan Ramah & Amanah &bull; SIMAHA Papua
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
