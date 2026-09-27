import React, { useState } from 'react';
import { Plus, Receipt, Sparkles, Check, AlertCircle, Coffee, BedDouble, Truck, Landmark, ShieldAlert } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { db } from '../../db/database';
import { Invoice } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';

interface ExtraChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onSuccess: () => void;
}

export const ExtraChargeModal: React.FC<ExtraChargeModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const standardServices = [
    { title: 'Extra Bed (Kasur Tambahan)', category: 'SERVICE' as const, rate: 75000, icon: <BedDouble className="w-4 h-4 text-[#8a6d2b]" /> },
    { title: 'Laundry Pakaian Jamaah (per Kg)', category: 'SERVICE' as const, rate: 25000, icon: <Sparkles className="w-4 h-4 text-blue-700" /> },
    { title: 'Paket Konsumsi / Catering Prasmanan (per Porsi)', category: 'SERVICE' as const, rate: 45000, icon: <Coffee className="w-4 h-4 text-amber-700" /> },
    { title: 'Sewa Aula Pertemuan / Ruang Rapat (per Hari)', category: 'FACILITY' as const, rate: 1500000, icon: <Landmark className="w-4 h-4 text-purple-700" /> },
    { title: 'Shuttle Bandara Sentani Jayapura (per Trip)', category: 'SERVICE' as const, rate: 150000, icon: <Truck className="w-4 h-4 text-slate-700" /> },
    { title: 'Denda Kunci Kamar Hilang / Rusak', category: 'OTHER' as const, rate: 50000, icon: <ShieldAlert className="w-4 h-4 text-rose-700" /> },
  ];

  const [selectedService, setSelectedService] = useState(standardServices[0].title);
  const [description, setDescription] = useState(standardServices[0].title);
  const [category, setCategory] = useState<'SERVICE' | 'FACILITY' | 'OTHER'>('SERVICE');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(standardServices[0].rate);

  const handleSelectPredefined = (item: typeof standardServices[0]) => {
    setSelectedService(item.title);
    setDescription(item.title);
    setCategory(item.category);
    setUnitPrice(item.rate);
  };

  const totalCharge = quantity * unitPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (quantity <= 0 || unitPrice <= 0) {
      toast.error('Data Tidak Valid', 'Jumlah dan tarif satuan harus lebih besar dari 0.');
      return;
    }

    const result = db.addExtraChargeToInvoice(
      invoice.id,
      description,
      category,
      quantity,
      unitPrice,
      currentUser
    );

    if (result.success) {
      toast.success(
        'Layanan Berhasil Ditambahkan',
        `Biaya "${description}" (${quantity} x ${formatCurrency(unitPrice)}) berhasil ditambahkan ke folio ${invoice.invoice_no}.`
      );
      onSuccess();
      onClose();
    } else {
      toast.error('Gagal', 'Terjadi kesalahan saat memposting layanan.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Posting Layanan & Tagihan Ekstra (Guest Folio)"
      subtitle={`Tagihan untuk Faktur: ${invoice.invoice_no} (${invoice.bill_to_name})`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Predefined Hotel Services Pills */}
        <div>
          <label className="block font-bold text-slate-700 mb-2">Pilih Jenis Layanan Cepat (Hotel Standard):</label>
          <div className="grid grid-cols-2 gap-2">
            {standardServices.map((item, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => handleSelectPredefined(item)}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  selectedService === item.title
                    ? 'border-[#c9a961] bg-[#fbf8ee] ring-2 ring-[#c9a961]/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="p-1 rounded-lg bg-white border border-slate-200 shrink-0">
                  {item.icon}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-slate-900 truncate text-[11px]">{item.title}</p>
                  <p className="text-[10px] text-slate-500">{formatCurrency(item.rate)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detailed inputs */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Keterangan Layanan / Tagihan *</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#c9a961] bg-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#c9a961] bg-white"
              >
                <option value="SERVICE">Layanan</option>
                <option value="FACILITY">Fasilitas</option>
                <option value="OTHER">Lain-lain</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Jumlah (Qty) *</label>
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#c9a961] bg-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tarif Satuan (Rp) *</label>
              <input
                type="number"
                min={1000}
                step={5000}
                required
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#c9a961] bg-white font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
            <span className="font-bold text-slate-600">Total Tambahan Folio:</span>
            <span className="font-black text-sm text-[#8a6d2b] font-mono">
              {formatCurrency(totalCharge)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button variant="secondary" size="md" onClick={onClose}>
            Batal
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
          >
            Posting ke Tagihan Tamu
          </Button>
        </div>
      </form>
    </Modal>
  );
};
