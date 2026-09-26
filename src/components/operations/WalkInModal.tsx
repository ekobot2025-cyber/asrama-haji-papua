import React, { useState, useEffect } from 'react';
import { 
  Hotel, User, Phone, MapPin, CreditCard, ShieldCheck, 
  Key, Calendar, BedDouble, Check, AlertCircle, Sparkles, Building2
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { db } from '../../db/database';
import { Room, Bed, Building, RoomType, Guest, Payment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';

interface WalkInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultRoomId?: string;
}

export const WalkInModal: React.FC<WalkInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultRoomId,
}) => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [availableBeds, setAvailableBeds] = useState<Bed[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

  // Form states
  const [fullName, setFullName] = useState('');
  const [nik, setNik] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [guestType, setGuestType] = useState<Guest['guest_type']>('UMUM');
  const [regencyCity, setRegencyCity] = useState('Kota Jayapura');
  const [institutionName, setInstitutionName] = useState('');

  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedBedId, setSelectedBedId] = useState('');
  const [nights, setNights] = useState(1);
  const [depositAmount, setDepositAmount] = useState(100000);
  const [cardKeys, setCardKeys] = useState(1);

  const [payNow, setPayNow] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<Payment['payment_method']>('CASH');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const allRooms = db.getRooms();
      const allBeds = db.getBeds();
      const blds = db.getBuildings();
      const rTypes = db.getRoomTypes();

      // Only clean and ready available rooms
      const readyRooms = allRooms.filter(
        (r) => r.status === 'AVAILABLE' || (defaultRoomId && r.id === defaultRoomId)
      );

      setAvailableRooms(readyRooms);
      setBuildings(blds);
      setRoomTypes(rTypes);

      const targetRoom = defaultRoomId 
        ? readyRooms.find((r) => r.id === defaultRoomId) || readyRooms[0] 
        : readyRooms[0];

      if (targetRoom) {
        setSelectedRoomId(targetRoom.id);
        const roomBeds = allBeds.filter((b) => b.room_id === targetRoom.id && b.status === 'AVAILABLE');
        setAvailableBeds(roomBeds);
        if (roomBeds.length > 0) {
          setSelectedBedId(roomBeds[0].id);
        }
      }
    }
  }, [isOpen, defaultRoomId]);

  const handleRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId);
    const roomBeds = db.getBeds().filter((b) => b.room_id === roomId && b.status === 'AVAILABLE');
    setAvailableBeds(roomBeds);
    if (roomBeds.length > 0) {
      setSelectedBedId(roomBeds[0].id);
    } else {
      setSelectedBedId('');
    }
  };

  const selectedRoom = availableRooms.find((r) => r.id === selectedRoomId);
  const selectedRoomType = selectedRoom ? roomTypes.find((t) => t.id === selectedRoom.room_type_id) : null;
  const roomRate = selectedRoom?.rate_per_night || 0;
  const totalRoomBill = roomRate * nights;
  const grandTotalAtCheckin = (payNow ? totalRoomBill : 0) + depositAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !selectedBedId) {
      toast.error('Peringatan', 'Silakan pilih kamar dan tempat tidur yang masih tersedia.');
      return;
    }
    if (!currentUser) return;

    setLoading(true);

    try {
      const result = db.createWalkInCheckin({
        guest: {
          fullName,
          nik,
          phone,
          gender,
          guestType,
          regencyCity,
          institutionName: institutionName || undefined,
        },
        roomId: selectedRoomId,
        bedId: selectedBedId,
        nights,
        depositAmount,
        cardKeys,
        initialPaymentAmount: payNow ? totalRoomBill : 0,
        paymentMethod,
        notes,
        user: currentUser,
      });

      setLoading(false);

      if (result.success) {
        toast.success(
          'Check-in Berhasil',
          `Tamu Walk-in ${fullName} berhasil check-in di Kamar ${selectedRoom?.room_number}. Kunci kartu telah diserahkan.`
        );
        onSuccess();
        onClose();
      } else {
        toast.error('Gagal Check-in', result.message);
      }
    } catch (err: any) {
      setLoading(false);
      toast.error('Error', err.message || 'Terjadi kesalahan sistem.');
    }
  };

  const papuaRegencies = [
    'Kota Jayapura',
    'Kabupaten Jayapura (Sentani)',
    'Kabupaten Keerom',
    'Kabupaten Sarmi',
    'Kabupaten Mamberamo Raya',
    'Kabupaten Biak Numfor',
    'Kabupaten Supiori',
    'Kabupaten Kepulauan Yapen (Serui)',
    'Kabupaten Waropen',
    'Kabupaten Mimika (Timika)',
    'Kabupaten Merauke',
    'Kabupaten Nabire',
    'Kabupaten Jayawijaya (Wamena)',
    'Luar Papua (Nasional)',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrasi Tamu Walk-In (Check-in Langsung)"
      subtitle="Front Desk & Penerimaan Tamu Datang Langsung — SIMAHA Papua"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Banner Quick Walk-In */}
        <div className="p-3.5 bg-gradient-to-r from-emerald-900 to-emerald-950 text-white rounded-xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-800 rounded-lg text-amber-400">
              <Hotel className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Layanan Walk-In Hospitality</h4>
              <p className="text-[11px] text-emerald-200">
                Pendaftaran kilat 1 langkah: registrasi tamu, alokasi kamar, penerbitan kartu kunci, dan kuitansi kasir.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded shadow-xs">
            Standar Hotel PMS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Kolom Kiri: Data Tamu */}
          <div className="space-y-3 p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <User className="w-3.5 h-3.5 text-emerald-800" />
              1. Identitas Tamu Menginap
            </h4>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Tamu *</label>
              <input
                type="text"
                required
                placeholder="Nama sesuai KTP..."
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">NIK (16 Digit) *</label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  placeholder="9171xxxxxxxxxxxx"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">No. Handphone / WA *</label>
                <input
                  type="tel"
                  required
                  placeholder="08xxxxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                >
                  <option value="L">👳‍♂️ Laki-laki (Ikhwan)</option>
                  <option value="P">🧕 Perempuan (Akhwat)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori Tamu *</label>
                <select
                  value={guestType}
                  onChange={(e) => setGuestType(e.target.value as Guest['guest_type'])}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                >
                  <option value="UMUM">Umum / Mandiri</option>
                  <option value="KEDINASAN">Tamu Kedinasan (SPJ)</option>
                  <option value="JAMAAH">Jamaah Umrah / Haji</option>
                  <option value="PELATIHAN">Peserta Diklat / Pelatihan</option>
                  <option value="MANASIK">Peserta Manasik</option>
                  <option value="PEGAWAI">Pegawai Kemenag</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Asal Daerah *</label>
                <select
                  value={regencyCity}
                  onChange={(e) => setRegencyCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                >
                  {papuaRegencies.map((reg) => (
                    <option key={reg} value={reg}>{reg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Instansi (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Kemenag Prov. Papua..."
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Pilihan Kamar & Pembayaran */}
          <div className="space-y-3 p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <BedDouble className="w-3.5 h-3.5 text-emerald-800" />
              2. Alokasi Kamar & Menginap
            </h4>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih Kamar Ready (Available) *</label>
              {availableRooms.length === 0 ? (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
                  Tidak ada kamar berstatus AVAILABLE saat ini. Periksa menu Housekeeping.
                </div>
              ) : (
                <select
                  value={selectedRoomId}
                  onChange={(e) => handleRoomChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white font-medium"
                >
                  {availableRooms.map((rm) => {
                    const tName = roomTypes.find((t) => t.id === rm.room_type_id)?.name || 'Kamar';
                    const bld = buildings.find((b) => b.id === rm.building_id)?.name || '';
                    return (
                      <option key={rm.id} value={rm.id}>
                        Kamar {rm.room_number} — {tName} ({bld}) — {formatCurrency(rm.rate_per_night)} / malam
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tempat Tidur (Bed) *</label>
                <select
                  value={selectedBedId}
                  onChange={(e) => setSelectedBedId(e.target.value)}
                  disabled={availableBeds.length === 0}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white font-mono"
                >
                  {availableBeds.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bed_code} (Kosong)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Durasi Menginap *</label>
                <select
                  value={nights}
                  onChange={(e) => setNights(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 10, 14, 30].map((n) => (
                    <option key={n} value={n}>{n} Malam</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kartu Kunci Diserahkan</label>
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={cardKeys}
                  onChange={(e) => setCardKeys(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Uang Deposit Jaminan</label>
                <input
                  type="number"
                  step={25000}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                />
              </div>
            </div>

            {/* Billing Summary Box */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-emerald-950">
              <div className="flex justify-between">
                <span>Tarif Kamar ({nights} malam):</span>
                <span className="font-bold">{formatCurrency(totalRoomBill)}</span>
              </div>
              <div className="flex justify-between">
                <span>Deposit Jaminan Kunci:</span>
                <span className="font-medium">{formatCurrency(depositAmount)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-emerald-200 text-xs">
                <span className="font-extrabold uppercase">Total Diterima di Kasir:</span>
                <span className="font-black text-sm text-emerald-900 font-mono">
                  {formatCurrency(grandTotalAtCheckin)}
                </span>
              </div>
            </div>

            {/* Payment Options */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="payNow"
                  checked={payNow}
                  onChange={(e) => setPayNow(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-600"
                />
                <label htmlFor="payNow" className="font-bold text-slate-800">
                  Bayar Lunas Sewa Kamar Sekarang
                </label>
              </div>

              {payNow && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Metode Pembayaran Kasir</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as Payment['payment_method'])}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 bg-white"
                  >
                    <option value="CASH">💵 Uang Tunai (Cash Front Desk)</option>
                    <option value="TRANSFER_BPD_PAPUA">🏦 Bank Papua (Rek. Penerimaan)</option>
                    <option value="TRANSFER_BSI">🕌 Bank Syariah Indonesia (BSI)</option>
                    <option value="QRIS">📱 QRIS Dinamis</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
            Batal
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading || availableRooms.length === 0}
            icon={<Check className="w-4 h-4" />}
          >
            {loading ? 'Memproses Walk-In...' : 'Eksekusi Check-In Seketika'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
