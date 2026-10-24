import React, { useState, useEffect, useRef } from 'react';
import { 
  LogOut, Search, CheckCircle2, AlertTriangle, Key, 
  Receipt, Clock, UserCheck, ShieldCheck, Sparkles,
  CreditCard, DollarSign, Printer, Download, Check, AlertCircle,
  HelpCircle, ArrowRight, User, Home, QrCode
} from 'lucide-react';
import { db } from '../../db/database';
import { Reservation, Guest, Group, RoomAssignment, Room, Invoice, Payment, Checkout } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDateIndo, calculateNights, maskNik } from '../../utils/formatters';
import { downloadElementAsPdf, printElementDirectly } from '../../utils/pdfGenerator';

interface CheckoutPageProps {
  initialReservationId?: string;
  onNavigate: (page: string, targetId?: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ initialReservationId, onNavigate }) => {
  const { currentUser } = useAuth();
  const toast = useToast();
  const clearancePrintRef = useRef<HTMLDivElement>(null);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [assignments, setAssignments] = useState<RoomAssignment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'READY' | 'UNPAID' | 'TODAY'>('ALL');

  // Checkout Modal State
  const [selectedRsv, setSelectedRsv] = useState<Reservation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Checkout Inspection Checklist
  const [keyReturned, setKeyReturned] = useState(true);
  const [roomConditionStatus, setRoomConditionStatus] = useState<'GOOD' | 'DAMAGE' | 'LOST_KEY'>('GOOD');
  const [roomConditionNotes, setRoomConditionNotes] = useState('Kamar rapi, fasilitas lengkap, tidak ada kerusakan');
  const [noBelongingsLeft, setNoBelongingsLeft] = useState(true);
  const [returnDeposit, setReturnDeposit] = useState(true);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [checkoutNotes, setCheckoutNotes] = useState('Tamu selesai menginap & serah terima kunci selesai');

  // Quick Inline Payment State (within Checkout Modal)
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<Payment['payment_method']>('CASH');
  const [payerName, setPayerName] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Clearance Slip View State (Post Checkout)
  const [lastCompletedCheckout, setLastCompletedCheckout] = useState<Checkout | null>(null);
  const [showClearanceSlip, setShowClearanceSlip] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const loadData = () => {
    setReservations(db.getReservations());
    setGuests(db.getGuests());
    setGroups(db.getGroups());
    setAssignments(db.getRoomAssignments());
    setRooms(db.getRooms());
    setInvoices(db.getInvoices());
    setCheckouts(db.getCheckouts());
  };

  useEffect(() => {
    loadData();
    if (initialReservationId) {
      const target = db.getReservations().find((r) => r.id === initialReservationId);
      if (target && target.status === 'CHECKED_IN') {
        handleOpenCheckout(target);
      }
    }
  }, [initialReservationId]);

  const getGuestOrGroupName = (rsv?: Reservation | null): string => {
    if (!rsv) return '';
    if (rsv.group_id) {
      const g = groups.find((grp) => grp.id === rsv.group_id);
      if (g) return g.group_name;
    }
    if (rsv.guest_id) {
      const gst = guests.find((g) => g.id === rsv.guest_id);
      if (gst) return gst.full_name;
    }
    return rsv.guest_name || rsv.activity_name || 'Tamu Asrama Haji';
  };

  const getGuestPhone = (rsv?: Reservation | null): string => {
    if (!rsv) return '';
    if (rsv.guest_id) {
      const gst = guests.find((g) => g.id === rsv.guest_id);
      if (gst) return gst.phone;
    }
    return '-';
  };

  const getAssignedRooms = (rsvId: string) => {
    const rsvAssignments = assignments.filter((a) => a.reservation_id === rsvId && a.status !== 'CANCELLED');
    const roomIds = Array.from(new Set(rsvAssignments.map((a) => a.room_id)));
    return roomIds
      .map((id) => rooms.find((r) => r.id === id)?.room_number)
      .filter(Boolean)
      .join(', ');
  };

  const getReservationInvoice = (rsvId: string) => {
    return invoices.find(i => i.reservation_id === rsvId);
  };

  const handleOpenCheckout = (rsv: Reservation) => {
    setSelectedRsv(rsv);
    setKeyReturned(true);
    setNoBelongingsLeft(true);
    setRoomConditionStatus('GOOD');
    setRoomConditionNotes('Kamar dalam keadaan rapi dan bersih. Fasilitas lengkap tidak ada kerusakan.');
    setReturnDeposit(true);
    setDepositAmount(0);
    setCheckoutNotes('Tamu telah checkout secara resmi dan serah terima kunci lengkap.');
    setPaymentAmount(rsv.remaining_amount || 0);
    setPaymentMethod('CASH');
    setPayerName(getGuestOrGroupName(rsv));
    setShowClearanceSlip(false);
    setIsModalOpen(true);
  };

  // 1-Click Fast Inline Settlement
  const handleQuickPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRsv || !currentUser) return;

    if (paymentAmount <= 0) {
      toast.error('Nominal Tidak Valid', 'Silakan masukkan nominal pembayaran di atas 0.');
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Find invoice or create one
      let targetInvoice = getReservationInvoice(selectedRsv.id);
      if (!targetInvoice) {
        toast.error('Faktur Tidak Ditemukan', 'Memperbarui data tagihan...');
        loadData();
        return;
      }

      const payment = db.createPayment(
        targetInvoice.id,
        selectedRsv.id,
        Number(paymentAmount),
        paymentMethod,
        payerName || getGuestOrGroupName(selectedRsv),
        `Pelunasan Tagihan Check-out Reservasi ${selectedRsv.reservation_no}`,
        currentUser,
        `Pelunasan cepat di meja front desk saat checkout (${paymentMethod})`
      );

      toast.success(
        'Pelunasan Berhasil Diterima!',
        `Kwitansi ${payment.receipt_no} diterbitkan senilai ${formatCurrency(payment.amount)}. Tagihan kini LUNAS.`
      );

      // Refresh data
      loadData();
      const updatedRsv = db.getReservations().find(r => r.id === selectedRsv.id);
      if (updatedRsv) {
        setSelectedRsv(updatedRsv);
      }
    } catch (err: any) {
      toast.error('Gagal Memproses Pembayaran', err?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Execute Official Checkout
  const handleExecuteCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRsv || !currentUser) return;

    if (!keyReturned) {
      toast.error('Kunci Belum Diterima', 'Pastikan kunci kartu kamar telah diserahkan sebelum menyelesaikan checkout.');
      return;
    }

    if (selectedRsv.remaining_amount > 0) {
      const confirmProceed = confirm(
        `Perhatian: Tamu ini masih memiliki sisa tagihan sebesar ${formatCurrency(selectedRsv.remaining_amount)}.\n\nApakah tamu adalah instansi kedinasan yang menggunakan penagihan terpusat (SPK/Invoice Pasca Acara)?\n\nKlik OK untuk tetap melanjutkan checkout atau Batal untuk melunasi tagihan terlebih dahulu.`
      );
      if (!confirmProceed) return;
    }

    const conditionText = roomConditionStatus === 'GOOD' 
      ? roomConditionNotes 
      : roomConditionStatus === 'DAMAGE'
        ? `Kerusakan/Denda: ${roomConditionNotes}`
        : `Kunci/Kartu Hilang: ${roomConditionNotes}`;

    const success = db.checkoutReservation(
      selectedRsv.id,
      conditionText,
      returnDeposit,
      checkoutNotes,
      currentUser,
      depositAmount
    );

    if (success) {
      toast.success(
        'Check-out Berhasil Diselesaikan!',
        `Kamar ${getAssignedRooms(selectedRsv.id)} dialihkan ke Housekeeping (Status DIRTY).`
      );
      loadData();
      
      // Get the created checkout record to show clearance slip
      const latestCheckouts = db.getCheckouts();
      const matched = latestCheckouts.find(c => c.reservation_id === selectedRsv.id) || latestCheckouts[0];
      setLastCompletedCheckout(matched || null);
      setShowClearanceSlip(true);
    } else {
      toast.error('Gagal', 'Terjadi kesalahan saat memproses checkout.');
    }
  };

  // Print Clearance Slip
  const handlePrintSlip = () => {
    if (!clearancePrintRef.current) return;
    printElementDirectly(
      clearancePrintRef.current,
      `Surat_Bebas_Beban_${selectedRsv?.reservation_no.replace(/[\/\\:]/g, '_')}`,
      { orientation: 'portrait' }
    );
    toast.info('Menyiapkan Cetak', 'Dialog cetak dokumen checkout dibuka.');
  };

  // Download PDF Clearance Slip
  const handleDownloadSlipPdf = async () => {
    if (!clearancePrintRef.current || !selectedRsv) return;
    try {
      await downloadElementAsPdf(
        clearancePrintRef.current,
        `Surat_Bebas_Beban_${selectedRsv.reservation_no.replace(/[\/\\:]/g, '_')}`,
        { orientation: 'portrait', fitToSinglePage: true, scale: 2.5 }
      );
      toast.success('PDF Terunduh', 'Surat Tanda Bebas Beban Check-out berhasil diekspor.');
    } catch (err) {
      toast.error('Gagal Ekspor PDF', 'Terjadi kendala saat menyusun dokumen PDF.');
    }
  };

  // Filter Active Checked-In Guests
  const checkedInReservations = reservations.filter((r) => r.status === 'CHECKED_IN');

  const filteredReservations = checkedInReservations.filter((r) => {
    const guestName = getGuestOrGroupName(r).toLowerCase();
    const rsvNo = r.reservation_no.toLowerCase();
    const roomStr = getAssignedRooms(r.id).toLowerCase();
    const matchesSearch = guestName.includes(searchTerm.toLowerCase()) || 
                          rsvNo.includes(searchTerm.toLowerCase()) || 
                          roomStr.includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeTab === 'READY') {
      return r.remaining_amount === 0;
    }
    if (activeTab === 'UNPAID') {
      return r.remaining_amount > 0;
    }
    if (activeTab === 'TODAY') {
      return r.checkout_date <= todayStr;
    }
    return true;
  });

  // Metric counts
  const readyCount = checkedInReservations.filter(r => r.remaining_amount === 0).length;
  const unpaidCount = checkedInReservations.filter(r => r.remaining_amount > 0).length;
  const todayDueCount = checkedInReservations.filter(r => r.checkout_date <= todayStr).length;
  const totalUnpaidAmount = checkedInReservations.reduce((acc, r) => acc + (r.remaining_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Title & Search Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <LogOut className="w-6 h-6 text-[#8a6d2b]" />
            Layanan Check-out & Serah Terima Kamar
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengecekan status pelunasan tagihan, verifikasi kunci kamar, pengembalian deposit, dan penerbitan Surat Tanda Bebas Beban resmi.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama tamu, nomor kamar (M101), atau no. reservasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961] bg-white shadow-2xs"
          />
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Menginap</span>
            <UserCheck className="w-4 h-4 text-[#8a6d2b]" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {checkedInReservations.length} <span className="text-xs text-slate-500 font-normal">Tamu/Rombongan</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Sedang aktif di Gedung Mina</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
            <span>Siap Check-out (Lunas)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-950 mt-1">
            {readyCount} <span className="text-xs text-emerald-700 font-normal">Tamu</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">✓ Bebas beban biaya (Rp 0 sisa)</div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-amber-800 text-xs font-semibold">
            <span>Menunggu Pelunasan</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-950 mt-1">
            {unpaidCount} <span className="text-xs text-amber-700 font-normal">Tamu</span>
          </div>
          <div className="text-[11px] text-amber-800 font-mono font-bold mt-0.5">
            Sisa: {formatCurrency(totalUnpaidAmount)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-blue-800 text-xs font-semibold">
            <span>Jadwal Keluar Hari Ini</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-950 mt-1">
            {todayDueCount} <span className="text-xs text-blue-700 font-normal">Tamu</span>
          </div>
          <div className="text-[11px] text-blue-700 font-medium mt-0.5">Batas waktu s.d 12.00 WIT</div>
        </div>
      </div>

      {/* Modern Filter Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-[#1A1410] text-[#f7cf6e] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Semua Tamu Menginap ({checkedInReservations.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('READY')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'READY'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Siap Check-out Langsung / Lunas ({readyCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('UNPAID')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'UNPAID'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Menunggu Pelunasan ({unpaidCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('TODAY')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'TODAY'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Jadwal Keluar Hari Ini ({todayDueCount})</span>
        </button>
      </div>

      {/* Guest Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReservations.length === 0 ? (
          <div className="col-span-3 p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            <UserCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-600">Tidak ada data tamu yang sesuai dengan filter ini.</p>
            <p className="text-[11px] text-slate-400 mt-1">Coba gunakan kata kunci pencarian lain atau pilih tab "Semua Tamu Menginap".</p>
          </div>
        ) : (
          filteredReservations.map((rsv) => {
            const assignedRoomsStr = getAssignedRooms(rsv.id);
            const nights = calculateNights(rsv.checkin_date, rsv.checkout_date);
            const isSettled = rsv.remaining_amount === 0;
            const isTodayCheckout = rsv.checkout_date <= todayStr;

            return (
              <div
                key={rsv.id}
                className={`p-5 rounded-2xl bg-white border-2 flex flex-col justify-between transition-all shadow-xs hover:shadow-md ${
                  isSettled ? 'border-emerald-200' : 'border-amber-200'
                }`}
              >
                <div>
                  {/* Top Bar Status */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-[#8a6d2b] bg-[#fbf8ee] px-2 py-0.5 rounded border border-[#e8dfc8]">
                      {rsv.reservation_no}
                    </span>
                    {isTodayCheckout && (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200">
                        Keluar Hari Ini
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-black text-slate-900">{getGuestOrGroupName(rsv)}</h3>
                  <p className="text-xs text-slate-500 mb-3">{rsv.activity_name || 'Tamu Menginap Gedung Mina'}</p>

                  {/* Room & Stay Details */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-slate-400" />
                        <span>Kamar Ditempati:</span>
                      </span>
                      <strong className="text-[#8a6d2b] font-bold text-sm">
                        {assignedRoomsStr ? `Kamar ${assignedRoomsStr}` : 'Belum ditentukan'}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Periode Menginap:</span>
                      </span>
                      <span className="font-medium text-slate-700">
                        {nights} Malam ({formatDateIndo(rsv.checkin_date)} s/d {formatDateIndo(rsv.checkout_date)})
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">Total Tarif PNBP:</span>
                      <span className="font-bold text-slate-900">{formatCurrency(rsv.total_amount)}</span>
                    </div>

                    {/* Clear Payment Status Badge */}
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Status Pembayaran:</span>
                      {isSettled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>LUNAS (Rp 0)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Kurang {formatCurrency(rsv.remaining_amount)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  {isSettled ? (
                    <Button
                      size="md"
                      variant="primary"
                      onClick={() => handleOpenCheckout(rsv)}
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black"
                      icon={<LogOut className="w-4 h-4" />}
                    >
                      Check-out Cepat (1-Klik)
                    </Button>
                  ) : (
                    <Button
                      size="md"
                      variant="primary"
                      onClick={() => handleOpenCheckout(rsv)}
                      className="w-full bg-gradient-to-r from-[#c9a961] to-[#b8941e] text-white font-black shadow-xs"
                      icon={<CreditCard className="w-4 h-4" />}
                    >
                      Pelunasan & Check-out
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Smart All-in-One Checkout Modal */}
      {selectedRsv && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Proses Check-out Tamu — ${selectedRsv.reservation_no}`}
          subtitle={`${getGuestOrGroupName(selectedRsv)} • Kamar ${getAssignedRooms(selectedRsv.id)}`}
          maxWidth="xl"
        >
          {!showClearanceSlip ? (
            <div className="space-y-5 text-xs text-slate-800">
              {/* BAGIAN 1: STATUS PEMBAYARAN & PELUNASAN CEPAT */}
              <div className="p-4 rounded-2xl border bg-slate-50 border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#1A1410] text-[#f7cf6e] font-black flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <strong className="text-sm font-black text-slate-900">
                      Status Finansial & Tagihan PNBP
                    </strong>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    Akun PNBP 425111
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Total Tagihan</span>
                    <strong className="text-slate-900 font-bold">{formatCurrency(selectedRsv.total_amount)}</strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Sudah Dibayar</span>
                    <strong className="text-emerald-700 font-bold">{formatCurrency(selectedRsv.paid_amount)}</strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Sisa Tagihan</span>
                    <strong className={selectedRsv.remaining_amount === 0 ? 'text-emerald-700 font-black' : 'text-rose-600 font-black'}>
                      {formatCurrency(selectedRsv.remaining_amount)}
                    </strong>
                  </div>
                </div>

                {/* If Settled (LUNAS) */}
                {selectedRsv.remaining_amount === 0 ? (
                  <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-xl flex items-center gap-3 text-emerald-950 font-medium">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <strong className="block font-black text-xs text-emerald-900">
                        Tagihan LUNAS SEMPURNA (Bebas Beban Finansial)
                      </strong>
                      <span className="text-[11px] text-emerald-800">
                        Seluruh kewajiban pembayaran telah diselesaikan. Tamu dapat langsung menyelesaikan serah terima kamar.
                      </span>
                    </div>
                  </div>
                ) : (
                  /* If Unpaid / Partial: Provide Direct 1-Click Settlement Right Here! */
                  <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-3">
                    <div className="flex items-start gap-2.5 text-amber-900">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-xs font-black block">
                          Perhatian: Terdapat Sisa Tagihan Sebesar {formatCurrency(selectedRsv.remaining_amount)}
                        </strong>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          Selesaikan pelunasan seketika di meja front desk menggunakan formulir kilat di bawah ini tanpa perlu berpindah halaman:
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleQuickPayment} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Kanal / Cara Pembayaran:
                        </label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value as any)}
                          className="w-full p-2 bg-white border border-amber-300 rounded-xl text-xs font-semibold"
                        >
                          <option value="CASH">💵 Uang Tunai (Cash di Front Desk)</option>
                          <option value="QRIS">📱 QRIS Dinamis</option>
                          <option value="TRANSFER_BSI">🏦 Transfer Bank BSI (Penampungan PNBP)</option>
                          <option value="DEBIT_EDC">💳 Kartu Debit / Mesin EDC</option>
                          <option value="SIMPONI_MPN_G3">🏛️ Setoran SIMPONI MPN-G3 Kemenkeu</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Nominal Pelunasan (Rp):
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={selectedRsv.remaining_amount}
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(Number(e.target.value))}
                          className="w-full p-2 bg-white border border-amber-300 rounded-xl text-xs font-bold font-mono"
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-1">
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          disabled={isProcessingPayment}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                          icon={<CreditCard className="w-4 h-4" />}
                        >
                          {isProcessingPayment ? 'Memproses Kwitansi...' : `Terima Pembayaran ${formatCurrency(paymentAmount)} & Lunaskan`}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* BAGIAN 2: VERIFIKASI FISIK KAMAR & KUNCI */}
              <div className="p-4 rounded-2xl border bg-slate-50 border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#1A1410] text-[#f7cf6e] font-black flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <strong className="text-sm font-black text-slate-900">
                      Pemeriksaan Fisik & Serah Terima Kunci
                    </strong>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Kamar {getAssignedRooms(selectedRsv.id)}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={keyReturned}
                      onChange={(e) => setKeyReturned(e.target.checked)}
                      className="w-4 h-4 rounded text-[#8a6d2b] focus:ring-[#c9a961]"
                    />
                    <div className="flex-1">
                      <strong className="text-slate-900 block font-bold">Kunci Fisik / Kartu Akses Kamar Lengkap</strong>
                      <span className="text-[11px] text-slate-500">Kunci telah diserahkan kembali oleh tamu ke petugas Front Desk</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={noBelongingsLeft}
                      onChange={(e) => setNoBelongingsLeft(e.target.checked)}
                      className="w-4 h-4 rounded text-[#8a6d2b] focus:ring-[#c9a961]"
                    />
                    <div className="flex-1">
                      <strong className="text-slate-900 block font-bold">Tidak Ada Barang Tamu yang Tertinggal</strong>
                      <span className="text-[11px] text-slate-500">Tamu telah memeriksa seluruh lemari, laci meja, dan kamar mandi</span>
                    </div>
                  </label>
                </div>

                {/* Condition Selector */}
                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Hasil Pemeriksaan Kondisi Kamar & Fasilitas:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRoomConditionStatus('GOOD');
                        setRoomConditionNotes('Kamar rapi, fasilitas AC, TV, handuk lengkap dan tidak ada kerusakan.');
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                        roomConditionStatus === 'GOOD'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      ✓ Baik & Lengkap
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRoomConditionStatus('DAMAGE');
                        setRoomConditionNotes('Terdapat kerusakan fasilitas kamar...');
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                        roomConditionStatus === 'DAMAGE'
                          ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      ⚠ Ada Kerusakan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRoomConditionStatus('LOST_KEY');
                        setRoomConditionNotes('Kunci kartu fisik hilang / tidak dikembalikan.');
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                        roomConditionStatus === 'LOST_KEY'
                          ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      🔑 Kunci Hilang
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Catatan Khusus Petugas / Kondisi Serah Terima:
                  </label>
                  <input
                    type="text"
                    value={roomConditionNotes}
                    onChange={(e) => setRoomConditionNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleExecuteCheckout}
                  disabled={!keyReturned}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-black"
                  icon={<LogOut className="w-4 h-4" />}
                >
                  Selesaikan Check-out & Terbitkan Surat Bebas Beban
                </Button>
              </div>
            </div>
          ) : (
            /* BAGIAN 3: SURAT TANDA BEBAS BEBAN & CHECK-OUT RESMI (CLEARANCE SLIP) */
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-emerald-800 text-white rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm">Check-out Berhasil Diselesaikan!</h4>
                    <p className="text-[11px] text-emerald-200">
                      Kamar telah dialihkan ke tim kebersihan (Housekeeping) dengan status DIRTY.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-white text-emerald-950 px-2 py-0.5 rounded font-black">
                  STATUS: CHECKED-OUT
                </span>
              </div>

              {/* Printable Clearance Slip */}
              <div
                ref={clearancePrintRef}
                className="p-6 bg-white rounded-2xl border-2 border-[#c9a961] shadow-md space-y-4 text-slate-900"
              >
                {/* Formal Header */}
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src="/logo.png" 
                      alt="Logo Kemenag" 
                      className="w-10 h-10 object-contain rounded-full bg-[#1A1410] p-0.5" 
                    />
                    <div>
                      <h4 className="font-black text-sm text-[#1A1410] leading-tight">
                        UPT ASRAMA HAJI TRANSIT JAYAPURA &bull; PAPUA
                      </h4>
                      <p className="text-[10px] text-slate-600 font-bold">
                        KEMENTERIAN AGAMA / KEMENTERIAN HAJI & UMRAH RI
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">DOKUMEN RESMI</span>
                    <strong className="text-xs text-[#8a6d2b] font-mono">
                      {lastCompletedCheckout?.clearance_slip_no || 'SLIP/CLR/2026/0001'}
                    </strong>
                  </div>
                </div>

                <div className="text-center py-1">
                  <h3 className="text-sm font-black uppercase text-slate-900 tracking-wide">
                    SURAT KETERANGAN BEBAS BEBAN & CHECK-OUT RESMI
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Nomor Bukti Checkout: {lastCompletedCheckout?.checkout_no || 'COUT/2026/0001'}
                  </p>
                </div>

                {/* Details Table */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nama Tamu / Rombongan:</span>
                    <strong className="text-slate-900 font-bold">{getGuestOrGroupName(selectedRsv)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nomor Reservasi:</span>
                    <strong className="text-[#8a6d2b] font-bold font-mono">{selectedRsv.reservation_no}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Kamar yang Dikosongkan:</span>
                    <strong className="text-slate-900 font-bold">Kamar {getAssignedRooms(selectedRsv.id)} (Gedung Mina)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Waktu Check-out:</span>
                    <strong className="text-slate-900 font-bold">
                      {formatDateIndo(lastCompletedCheckout?.checkout_time || todayStr)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Status Tagihan Finansial:</span>
                    <strong className="text-emerald-700 font-black">LUNAS (BEBAS BEBAN PNBP)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Serah Terima Kunci:</span>
                    <strong className="text-slate-900 font-bold">Diterima Lengkap & Sah</strong>
                  </div>
                </div>

                <p className="text-[10px] text-slate-600 leading-relaxed italic border-t border-slate-200 pt-2">
                  Dengan ini diterangkan bahwa tamu di atas telah menyelesaikan seluruh kewajiban administrasi, pembayaran sewa kamar asrama haji, serta menyerahkan kunci kamar dalam kondisi baik kepada petugas Front Desk.
                </p>

                {/* Signature Row */}
                <div className="grid grid-cols-2 gap-6 pt-4 text-[10px] text-center">
                  <div>
                    <p className="text-slate-500">Tamu yang Menginap,</p>
                    <div className="h-12 flex items-end justify-center font-bold text-slate-900">
                      ({getGuestOrGroupName(selectedRsv)})
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-500">Petugas Front Desk,</p>
                    <div className="h-12 flex items-end justify-center font-bold text-slate-900">
                      ({currentUser?.name || 'Petugas UPT Asrama Haji'})
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handlePrintSlip}
                    icon={<Printer className="w-4 h-4" />}
                  >
                    Cetak Surat Bebas Beban
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleDownloadSlipPdf}
                    icon={<Download className="w-4 h-4" />}
                  >
                    Unduh PDF
                  </Button>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsModalOpen(false)}
                  icon={<Check className="w-4 h-4" />}
                >
                  Selesai
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
