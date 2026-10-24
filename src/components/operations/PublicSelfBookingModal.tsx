import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, BedDouble, Building, CheckCircle2, AlertCircle, Printer, 
  Download, Sparkles, Clock, CreditCard, ArrowRight, ArrowLeft, Phone, 
  User, MapPin, Landmark, ShieldCheck, Copy, Check, FileText, Share2, 
  Loader2, QrCode, Tag
} from 'lucide-react';
import { db } from '../../db/database';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { RoomType, Facility, Reservation, Guest } from '../../types';
import { formatCurrency, formatDateIndo, maskNik } from '../../utils/formatters';
import { downloadElementAsPdf, printElementDirectly } from '../../utils/pdfGenerator';
import { useToast } from '../../context/ToastContext';

interface PublicSelfBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: 'PENGINAPAN' | 'RUANG_PERTEMUAN';
  initialItemId?: string;
  initialUnitCount?: number;
  initialDuration?: number;
  onSuccessBooking?: (reservation: Reservation) => void;
}

export const PublicSelfBookingModal: React.FC<PublicSelfBookingModalProps> = ({
  isOpen,
  onClose,
  initialCategory = 'PENGINAPAN',
  initialItemId,
  initialUnitCount = 1,
  initialDuration = 1,
  onSuccessBooking,
}) => {
  const toast = useToast();
  const printSlipRef = useRef<HTMLDivElement>(null);

  // Flow Step: 1 = Pilih Layanan & Jadwal, 2 = Data Tamu / Pemesan, 3 = Bukti Konfirmasi
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [copiedBilling, setCopiedBilling] = useState(false);

  // Master Data from DB
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);

  // Step 1 State: Service & Dates
  const [rentalCategory, setRentalCategory] = useState<'PENGINAPAN' | 'RUANG_PERTEMUAN'>(initialCategory);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  
  // Date handling
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  const [checkinDate, setCheckinDate] = useState<string>(todayStr);
  const [checkoutDate, setCheckoutDate] = useState<string>(tomorrowStr);
  const [unitCount, setUnitCount] = useState<number>(initialUnitCount);
  const [totalGuests, setTotalGuests] = useState<number>(2);

  // Step 2 State: Guest / Applicant Information
  const [guestName, setGuestName] = useState('');
  const [nik, setNik] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [guestType, setGuestType] = useState<'UMUM' | 'KEDINASAN' | 'BUMN' | 'PELATIHAN' | 'MANASIK' | 'JAMAAH'>('UMUM');
  const [institutionName, setInstitutionName] = useState('');
  const [regencyCity, setRegencyCity] = useState('Kota Jayapura');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [notes, setNotes] = useState('');

  // Step 3 State: Created Reservation Result
  const [createdReservation, setCreatedReservation] = useState<Reservation | null>(null);
  const [registeredGuest, setRegisteredGuest] = useState<Guest | null>(null);

  // Availability result
  const [availability, setAvailability] = useState<{ available: boolean; message: string }>({
    available: true,
    message: 'Memeriksa ketersediaan...'
  });

  // Load database master types on mount / open
  useEffect(() => {
    if (isOpen) {
      const rTypes = db.getRoomTypes();
      const facs = db.getFacilities().filter(f => f.status !== 'INACTIVE');
      setRoomTypes(rTypes);
      setFacilities(facs);

      // Initialize selected item
      if (initialCategory === 'PENGINAPAN') {
        const found = rTypes.find(r => r.id === initialItemId) || rTypes[0];
        setSelectedItemId(found ? found.id : 'rt-sup');
      } else {
        const found = facs.find(f => f.id === initialItemId) || facs[0];
        setSelectedItemId(found ? found.id : 'fac-1');
      }

      setRentalCategory(initialCategory);
      setUnitCount(Math.max(1, initialUnitCount));
      setCurrentStep(1);
      setCreatedReservation(null);
    }
  }, [isOpen, initialCategory, initialItemId, initialUnitCount]);

  // Adjust dates when category changes
  const handleCategoryChange = (category: 'PENGINAPAN' | 'RUANG_PERTEMUAN') => {
    setRentalCategory(category);
    if (category === 'PENGINAPAN') {
      const defaultRoom = roomTypes[0] || { id: 'rt-sup' };
      setSelectedItemId(defaultRoom.id);
      // Room default: 1 night
      setCheckinDate(todayStr);
      setCheckoutDate(tomorrowStr);
      setUnitCount(1);
    } else {
      const defaultFac = facilities[0] || { id: 'fac-1' };
      setSelectedItemId(defaultFac.id);
      // Meeting room default: same day usage = 1 day
      setCheckinDate(todayStr);
      setCheckoutDate(todayStr);
      setUnitCount(1);
    }
  };

  // Calculate Duration
  const calculateDuration = () => {
    const cin = new Date(checkinDate).getTime();
    const cout = new Date(checkoutDate).getTime();
    const diffDays = Math.round((cout - cin) / (1000 * 60 * 60 * 24));
    
    if (rentalCategory === 'PENGINAPAN') {
      return Math.max(1, diffDays);
    } else {
      return checkinDate === checkoutDate ? 1 : Math.max(1, diffDays);
    }
  };

  const duration = calculateDuration();
  const durationUnit = rentalCategory === 'PENGINAPAN' ? 'MALAM' : 'HARI';

  // Get selected object & snapshot rate
  const selectedRoomType = rentalCategory === 'PENGINAPAN' 
    ? (roomTypes.find(r => r.id === selectedItemId) || roomTypes[0]) 
    : undefined;

  const selectedFacility = rentalCategory === 'RUANG_PERTEMUAN' 
    ? (facilities.find(f => f.id === selectedItemId) || facilities[0]) 
    : undefined;

  const snapshotRate = rentalCategory === 'PENGINAPAN'
    ? (selectedRoomType?.base_rate_per_night || selectedRoomType?.base_rate || 250000)
    : (selectedFacility?.daily_rate || 650000);

  // Strict Separate Formulas:
  // Penginapan: Jumlah Malam × Tarif Kamar × Jumlah Kamar
  // Ruang Pertemuan: Jumlah Hari × Tarif Ruangan × Jumlah Unit
  const totalAmount = duration * snapshotRate * unitCount;

  // Real-time atomic availability check
  useEffect(() => {
    if (!selectedItemId || !checkinDate || !checkoutDate) return;

    if (rentalCategory === 'PENGINAPAN') {
      const check = db.checkRoomAvailability(selectedItemId, checkinDate, checkoutDate, unitCount);
      setAvailability(check);
    } else {
      const check = db.checkFacilityAvailability(selectedItemId, checkinDate, checkoutDate);
      if (!check.available) {
        setAvailability(check);
      } else if (selectedFacility && selectedFacility.capacity && totalGuests > selectedFacility.capacity) {
        setAvailability({
          available: false,
          message: `Kapasitas terlampaui: Jumlah peserta (${totalGuests} orang) melebihi kapasitas maksimal ${selectedFacility.name} (${selectedFacility.capacity} orang).`
        });
      } else {
        setAvailability(check);
      }
    }
  }, [rentalCategory, selectedItemId, checkinDate, checkoutDate, unitCount, totalGuests, selectedFacility]);

  // Handle Form Submission
  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestName.trim()) {
      toast.error('Data Belum Lengkap', 'Nama lengkap pemesan wajib diisi sesuai KTP.');
      return;
    }
    if (!phone.trim()) {
      toast.error('Data Belum Lengkap', 'Nomor WhatsApp / HP wajib diisi untuk konfirmasi.');
      return;
    }

    if (!availability.available) {
      toast.error('Jadwal Tidak Tersedia', availability.message);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Save or Register Guest
      const guest = db.saveGuest({
        full_name: guestName.trim(),
        nik: nik.trim() || '917101' + Math.floor(1000000000 + Math.random() * 9000000000),
        phone: phone.trim(),
        email: email.trim() || undefined,
        guest_type: guestType,
        gender: gender,
        regency_city: regencyCity,
        province: 'Papua',
        address: `${regencyCity}, Papua`,
        notes: `Pemesanan Mandiri Online via Website SIMAHA Papua (${rentalCategory})`
      });
      setRegisteredGuest(guest);

      // 2. Create Reservation via DB
      const result = db.createReservation({
        reservation_type: guestType === 'UMUM' ? 'INDIVIDUAL' : 'INSTANSI',
        rental_category: rentalCategory,
        room_type_id: rentalCategory === 'PENGINAPAN' ? selectedItemId : undefined,
        facility_id: rentalCategory === 'RUANG_PERTEMUAN' ? selectedItemId : undefined,
        unit_count: unitCount,
        duration: duration,
        duration_unit: durationUnit,
        snapshot_rate: snapshotRate,
        total_amount: totalAmount,
        guest_id: guest.id,
        guest_name: guest.full_name,
        activity_type: guestType,
        activity_name: rentalCategory === 'PENGINAPAN'
          ? `Penginapan Mandiri Online: ${selectedRoomType?.name || 'Kamar'}`
          : `Sewa Ruangan Online: ${selectedFacility?.name || 'Ruang Pertemuan'}`,
        checkin_date: checkinDate,
        checkout_date: checkoutDate,
        total_guests: totalGuests,
        male_count: gender === 'L' ? Math.max(1, Math.round(totalGuests / 2)) : Math.floor(totalGuests / 2),
        female_count: gender === 'P' ? Math.max(1, Math.round(totalGuests / 2)) : Math.floor(totalGuests / 2),
        total_rooms_requested: rentalCategory === 'PENGINAPAN' ? unitCount : 0,
        notes: notes ? `${notes} (Instansi: ${institutionName || '-'})` : (institutionName ? `Instansi: ${institutionName}` : 'Booking Mandiri Website SIMAHA'),
        package_type: 'REGULER',
      });

      if (result.success && result.reservation) {
        setCreatedReservation(result.reservation);
        setCurrentStep(3);
        toast.success('Pemesanan Berhasil!', `Nomor Reservasi: ${result.reservation.reservation_no}`);
        if (onSuccessBooking) onSuccessBooking(result.reservation);
      } else {
        toast.error('Pemesanan Gagal', result.message);
      }
    } catch (err: any) {
      console.error('Booking submission error:', err);
      toast.error('Terjadi Kesalahan', err?.message || 'Gagal memproses pemesanan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy billing code
  const handleCopyBillingCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedBilling(true);
    toast.success('Disalin', 'Kode Billing SIMPONI berhasil disalin ke clipboard.');
    setTimeout(() => setCopiedBilling(false), 2500);
  };

  // Print slip
  const handlePrintSlip = () => {
    if (!printSlipRef.current) return;
    printElementDirectly(
      printSlipRef.current, 
      `Bukti_Reservasi_${createdReservation?.reservation_no.replace(/[\/\\:]/g, '_')}`,
      { orientation: 'portrait' }
    );
    toast.info('Menyiapkan Cetak', 'Dialog cetak dokumen reservasi dibuka.');
  };

  // Download PDF
  const handleDownloadSlipPdf = async () => {
    if (!printSlipRef.current) return;
    setIsDownloadingPdf(true);
    try {
      await downloadElementAsPdf(
        printSlipRef.current,
        `Bukti_Reservasi_${createdReservation?.reservation_no.replace(/[\/\\:]/g, '_')}`,
        { orientation: 'portrait', fitToSinglePage: true, scale: 2.5 }
      );
      toast.success('PDF Terunduh', 'Bukti reservasi resmi berhasil diunduh.');
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error('Gagal Ekspor PDF', 'Terjadi kendala saat menyusun berkas PDF.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Send to WhatsApp
  const handleShareWhatsApp = () => {
    if (!createdReservation) return;
    const itemName = rentalCategory === 'PENGINAPAN' ? selectedRoomType?.name : selectedFacility?.name;
    const msg = `*BUKTI RESERVASI ONLINE SIMAHA PAPUA*\n` +
      `-----------------------------------------\n` +
      `No. Reservasi: *${createdReservation.reservation_no}*\n` +
      `No. SPMA: *${createdReservation.spma_no}*\n` +
      `Kode Billing SIMPONI: *${createdReservation.simponi_billing_code}*\n` +
      `Nama Pemesan: *${registeredGuest?.full_name || guestName}*\n` +
      `Layanan: *${itemName}* (${unitCount} Unit)\n` +
      `Jadwal: ${formatDateIndo(checkinDate)} s.d ${formatDateIndo(checkoutDate)} (${duration} ${durationUnit})\n` +
      `Total Biaya: *${formatCurrency(createdReservation.total_amount)}*\n` +
      `Akun PNBP: ${rentalCategory === 'PENGINAPAN' ? '425111' : '425112'}\n` +
      `-----------------------------------------\n` +
      `Mohon tunjukkan bukti ini saat check-in di Front Desk Asrama Haji Transit Jayapura.`;
    
    const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Formulir Reservasi Mandiri Online (Self-Service Booking)"
      subtitle="Pesan kamar penginapan atau ruang pertemuan resmi UPT Asrama Haji Transit Jayapura"
      maxWidth="2xl"
    >
      {/* Step Indicator Header */}
      <div className="mb-5 flex items-center justify-between border-b border-stone-200 pb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
            currentStep === 1 
              ? 'bg-[#c9a961] text-[#1A1410]' 
              : currentStep > 1 ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-600'
          }`}>
            {currentStep > 1 ? '✓' : '1'}
          </span>
          <span className={`font-bold ${currentStep === 1 ? 'text-[#8a6d2b]' : 'text-stone-600'}`}>
            Pilih Layanan & Jadwal
          </span>
        </div>

        <div className="w-8 h-0.5 bg-stone-200" />

        <div className="flex items-center gap-2">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
            currentStep === 2 
              ? 'bg-[#c9a961] text-[#1A1410]' 
              : currentStep > 2 ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-600'
          }`}>
            {currentStep > 2 ? '✓' : '2'}
          </span>
          <span className={`font-bold ${currentStep === 2 ? 'text-[#8a6d2b]' : 'text-stone-600'}`}>
            Data Pemesan
          </span>
        </div>

        <div className="w-8 h-0.5 bg-stone-200" />

        <div className="flex items-center gap-2">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
            currentStep === 3 
              ? 'bg-emerald-600 text-white' 
              : 'bg-stone-200 text-stone-600'
          }`}>
            3
          </span>
          <span className={`font-bold ${currentStep === 3 ? 'text-emerald-700' : 'text-stone-600'}`}>
            Konfirmasi & Billing
          </span>
        </div>
      </div>

      {/* ================= STEP 1: LAYANAN & JADWAL ================= */}
      {currentStep === 1 && (
        <div className="space-y-5 text-xs text-stone-800">
          {/* Category Toggle */}
          <div>
            <label className="block font-bold text-stone-700 mb-1.5">Pilih Kategori Layanan:</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-2xl">
              <button
                type="button"
                onClick={() => handleCategoryChange('PENGINAPAN')}
                className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  rentalCategory === 'PENGINAPAN'
                    ? 'bg-gradient-to-r from-[#c9a961] to-[#b8941e] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <BedDouble className="w-4 h-4" />
                <span>Penginapan Kamar (Per Malam)</span>
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('RUANG_PERTEMUAN')}
                className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  rentalCategory === 'RUANG_PERTEMUAN'
                    ? 'bg-gradient-to-r from-[#c9a961] to-[#b8941e] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Landmark className="w-4 h-4" />
                <span>Ruang Pertemuan / MICE (Per Hari)</span>
              </button>
            </div>
          </div>

          {/* Unit / Room Type Selector */}
          <div>
            <label className="block font-bold text-stone-700 mb-1.5">
              {rentalCategory === 'PENGINAPAN' ? 'Pilih Tipe Kamar:' : 'Pilih Ruangan Pertemuan:'}
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              {rentalCategory === 'PENGINAPAN' ? (
                roomTypes.map((rt) => {
                  const isSelected = selectedItemId === rt.id;
                  const rate = rt.base_rate_per_night || rt.base_rate || 250000;
                  return (
                    <div
                      key={rt.id}
                      onClick={() => setSelectedItemId(rt.id)}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-[#c9a961] bg-[#fbf8ee] shadow-sm' 
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <strong className="text-sm font-black text-stone-900">{rt.name}</strong>
                        <span className="text-[10px] font-bold bg-[#c9a961]/20 text-[#8a6d2b] px-2 py-0.5 rounded-full">
                          {formatCurrency(rate)} / malam
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mb-2">{rt.description || 'Gedung Mina'}</p>
                      <div className="text-[10px] text-stone-600 flex flex-wrap gap-1">
                        {rt.amenities?.slice(0, 3).map((a, i) => (
                          <span key={i} className="bg-stone-100 px-1.5 py-0.5 rounded">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                facilities.map((fac) => {
                  const isSelected = selectedItemId === fac.id;
                  return (
                    <div
                      key={fac.id}
                      onClick={() => setSelectedItemId(fac.id)}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-[#c9a961] bg-[#fbf8ee] shadow-sm' 
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <strong className="text-sm font-black text-stone-900">{fac.name}</strong>
                        <span className="text-[10px] font-bold bg-[#c9a961]/20 text-[#8a6d2b] px-2 py-0.5 rounded-full">
                          {formatCurrency(fac.daily_rate)} / hari
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mb-2">
                        {fac.description || `${fac.location} • Maks. ${fac.capacity} Orang`}
                      </p>
                      <div className="text-[10px] text-stone-600 flex flex-wrap gap-1">
                        <span className="bg-stone-100 px-1.5 py-0.5 rounded font-bold">
                          Kapasitas: {fac.capacity} Org
                        </span>
                        {fac.amenities?.slice(0, 2).map((a, i) => (
                          <span key={i} className="bg-stone-100 px-1.5 py-0.5 rounded">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Dates & Quantities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {rentalCategory === 'PENGINAPAN' ? 'Tanggal Check-in:' : 'Tanggal Mulai Pemakaian:'}
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={todayStr}
                  value={checkinDate}
                  onChange={(e) => {
                    setCheckinDate(e.target.value);
                    if (rentalCategory === 'PENGINAPAN' && e.target.value >= checkoutDate) {
                      const nextDay = new Date(e.target.value);
                      nextDay.setDate(nextDay.getDate() + 1);
                      setCheckoutDate(nextDay.toISOString().split('T')[0]);
                    }
                  }}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-[#c9a961]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {rentalCategory === 'PENGINAPAN' ? 'Tanggal Check-out:' : 'Tanggal Selesai Pemakaian:'}
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={checkinDate}
                  value={checkoutDate}
                  onChange={(e) => setCheckoutDate(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-[#c9a961]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {rentalCategory === 'PENGINAPAN' ? 'Jumlah Kamar:' : 'Jumlah Unit Ruangan:'}
              </label>
              <input
                type="number"
                min="1"
                max={rentalCategory === 'PENGINAPAN' ? (selectedRoomType?.id === 'rt-sup' ? 2 : 30) : 1}
                value={unitCount}
                onChange={(e) => setUnitCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-[#c9a961]"
              />
              <span className="text-[10px] text-stone-500 mt-0.5 block">
                {rentalCategory === 'PENGINAPAN' 
                  ? (selectedRoomType?.id === 'rt-sup' ? 'Kamar Superior tersedia 2 unit (Lantai 1)' : 'Kamar Standar tersedia 30 unit (Lt. 1 & 2)')
                  : 'Sewa ruang pertemuan dihitung per unit'
                }
              </span>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {rentalCategory === 'PENGINAPAN' ? 'Estimasi Total Tamu:' : 'Estimasi Jumlah Peserta:'}
              </label>
              <input
                type="number"
                min="1"
                max={rentalCategory === 'RUANG_PERTEMUAN' ? (selectedFacility?.capacity || 300) : 64}
                value={totalGuests}
                onChange={(e) => setTotalGuests(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-[#c9a961]"
              />
              <span className="text-[10px] text-stone-500 mt-0.5 block">
                {rentalCategory === 'RUANG_PERTEMUAN' 
                  ? `Maksimal kapasitas: ${selectedFacility?.capacity || 300} peserta`
                  : `Kapasitas per kamar: ${selectedRoomType?.capacity || selectedRoomType?.default_capacity || 2} orang`
                }
              </span>
            </div>
          </div>

          {/* Real-time Availability & Conflict Status Card */}
          <div className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
            availability.available 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            {availability.available ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <strong className="block font-bold">
                {availability.available ? 'Jadwal & Unit Tersedia' : 'Pemesanan Tidak Dapat Dilanjutkan'}
              </strong>
              <p className="text-[11px] mt-0.5 leading-relaxed">{availability.message}</p>
            </div>
          </div>

          {/* Price Breakdown Calculation Card */}
          <div className="p-4 bg-[#fbf8ee] rounded-2xl border border-[#e8dfc8] space-y-2">
            <div className="flex justify-between items-center text-stone-600">
              <span>Tarif Resmi Satuan:</span>
              <strong className="text-stone-900">
                {formatCurrency(snapshotRate)} / {durationUnit.toLowerCase()}
              </strong>
            </div>
            <div className="flex justify-between items-center text-stone-600">
              <span>Durasi & Unit:</span>
              <strong className="text-stone-800">
                {duration} {durationUnit} × {unitCount} Unit
              </strong>
            </div>
            <div className="flex justify-between items-center text-stone-600">
              <span>Rumus Perhitungan:</span>
              <strong className="text-stone-800 text-[11px]">
                {rentalCategory === 'PENGINAPAN'
                  ? `${duration} Malam × ${formatCurrency(snapshotRate)} × ${unitCount} Kamar`
                  : `${duration} Hari × ${formatCurrency(snapshotRate)} × ${unitCount} Unit`
                }
              </strong>
            </div>
            <div className="flex justify-between items-center text-stone-600">
              <span>Akun PNBP:</span>
              <strong className="text-[#8a6d2b]">
                {rentalCategory === 'PENGINAPAN' 
                  ? '425111 (Pendapatan Sewa Kamar Asrama Haji)' 
                  : '425112 (Pendapatan Sewa Fasilitas & Ruangan)'
                }
              </strong>
            </div>
            <div className="pt-2 border-t border-[#e8dfc8] flex justify-between items-center text-sm">
              <span className="font-bold text-stone-900">Total Tarif PNBP Resmi:</span>
              <span className="text-xl font-black text-[#8a6d2b]">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="md" onClick={onClose}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={!availability.available}
              onClick={() => setCurrentStep(2)}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Lanjut ke Data Pemesan
            </Button>
          </div>
        </div>
      )}

      {/* ================= STEP 2: DATA PEMESAN ================= */}
      {currentStep === 2 && (
        <form onSubmit={handleSubmitBooking} className="space-y-4 text-xs text-stone-800">
          <div className="p-3 bg-[#fbf8ee] border border-[#e8dfc8] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-stone-500 uppercase font-bold block">Ringkasan Pilihan:</span>
              <strong className="text-stone-900 text-xs">
                {rentalCategory === 'PENGINAPAN' ? selectedRoomType?.name : selectedFacility?.name} &bull; {unitCount} Unit &bull; {duration} {durationUnit}
              </strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-500 uppercase font-bold block">Total Biaya:</span>
              <strong className="text-[#8a6d2b] font-black text-sm">{formatCurrency(totalAmount)}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1">
                Nama Lengkap Pemesan / PIC <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Contoh: Muhammad Yusuf / Dr. Hendra Wijaya"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-[#c9a961]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Nomor KTP (NIK 16 Digit) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                maxLength={16}
                value={nik}
                onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                placeholder="917101xxxxxxxxxx"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-[#c9a961]"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Nomor WhatsApp / HP Aktif <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812-4800-xxxx"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-[#c9a961]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Kategori Pemesan:
              </label>
              <select
                value={guestType}
                onChange={(e) => setGuestType(e.target.value as any)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-[#c9a961]"
              >
                <option value="UMUM">Masyarakat Umum / Pribadi</option>
                <option value="KEDINASAN">Instansi Kedinasan / ASN Pemda</option>
                <option value="BUMN">BUMN / BUMD</option>
                <option value="PELATIHAN">Pelatihan / Diklat / Bimtek</option>
                <option value="MANASIK">Bimbingan Manasik Haji / KBIHU</option>
                <option value="JAMAAH">Jemaah Haji / Transit Mandiri</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Asal Kabupaten / Kota (Papua & Luar Papua):
              </label>
              <select
                value={regencyCity}
                onChange={(e) => setRegencyCity(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-[#c9a961]"
              >
                <option value="Kota Jayapura">Kota Jayapura</option>
                <option value="Kabupaten Jayapura">Kabupaten Jayapura</option>
                <option value="Kabupaten Keerom">Kabupaten Keerom</option>
                <option value="Kabupaten Sarmi">Kabupaten Sarmi</option>
                <option value="Kabupaten Merauke">Kabupaten Merauke</option>
                <option value="Kabupaten Mimika">Kabupaten Mimika</option>
                <option value="Kabupaten Nabire">Kabupaten Nabire</option>
                <option value="Kabupaten Biak Numfor">Kabupaten Biak Numfor</option>
                <option value="Kabupaten Jayawijaya">Kabupaten Jayawijaya</option>
                <option value="Luar Provinsi Papua">Luar Provinsi Papua</option>
              </select>
            </div>

            {guestType !== 'UMUM' && (
              <div className="sm:col-span-2">
                <label className="block font-bold text-stone-700 mb-1">
                  Nama Instansi / Dinas / Perusahaan / Organisasi:
                </label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="Contoh: Dinas Pendidikan Provinsi Papua / Kanwil Kemenag Papua"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-[#c9a961]"
                />
              </div>
            )}

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Jenis Kelamin PIC:
              </label>
              <div className="flex gap-4 pt-1">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="L"
                    checked={gender === 'L'}
                    onChange={() => setGender('L')}
                    className="text-[#c9a961] focus:ring-[#c9a961]"
                  />
                  <span>Laki-laki</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="P"
                    checked={gender === 'P'}
                    onChange={() => setGender('P')}
                    className="text-[#c9a961] focus:ring-[#c9a961]"
                  />
                  <span>Perempuan</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Alamat Email (Opsional):
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-[#c9a961]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1">
                Catatan Tambahan / Keperluan Kegiatan:
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tuliskan jika ada kebutuhan khusus (sound system tambahan, meja rapat, waktu kedatangan, dsb.)"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-[#c9a961]"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
            <span>
              Data Anda aman dan langsung dicatat ke basis data reservasi resmi UPT Asrama Haji Transit Jayapura. Kode billing SIMPONI resmi akan diterbitkan seketika setelah formulir dikirim.
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setCurrentStep(1)}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Kembali
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            >
              {isSubmitting ? 'Menerbitkan Reservasi...' : 'Konfirmasi & Kirim Reservasi'}
            </Button>
          </div>
        </form>
      )}

      {/* ================= STEP 3: DIGITAL CONFIRMATION & SIMPONI ================= */}
      {currentStep === 3 && createdReservation && (
        <div className="space-y-5 text-xs text-stone-800">
          {/* Success Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-black">Reservasi Mandiri Berhasil Didaftarkan!</h3>
                <p className="text-xs text-teal-100">
                  Data telah tersimpan di sistem & Kode Billing SIMPONI telah aktif.
                </p>
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <span className="text-[10px] text-teal-200 block uppercase font-bold">Status:</span>
              <span className="text-xs font-black bg-amber-400 text-stone-900 px-2.5 py-0.5 rounded-full">
                PENDING VERIFIKASI
              </span>
            </div>
          </div>

          {/* Printable Digital Reservation Voucher Slip */}
          <div 
            ref={printSlipRef} 
            className="p-6 bg-white rounded-2xl border-2 border-[#c9a961] shadow-md space-y-4 text-stone-900"
          >
            {/* Header Voucher */}
            <div className="flex items-center justify-between border-b-2 border-stone-200 pb-3">
              <div className="flex items-center gap-3">
                <img 
                  src="/logo.png" 
                  alt="Logo Kemenag" 
                  className="w-10 h-10 object-contain rounded-full bg-[#1A1410] p-0.5" 
                />
                <div>
                  <h4 className="font-black text-sm text-[#1A1410] leading-tight">
                    SIMAHA PAPUA &bull; KEMENTERIAN HAJI & UMRAH RI
                  </h4>
                  <p className="text-[10px] text-stone-600 font-medium">
                    UPT Asrama Haji Transit Jayapura &bull; Bukti Registrasi Reservasi Mandiri
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-stone-400 block">KODE PNBP</span>
                <strong className="text-xs text-[#8a6d2b]">
                  {rentalCategory === 'PENGINAPAN' ? 'AKUN 425111' : 'AKUN 425112'}
                </strong>
              </div>
            </div>

            {/* SIMPONI Billing Highlight Box */}
            <div className="p-3.5 bg-gradient-to-r from-[#1A1410] to-[#2A2018] rounded-xl text-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold block">
                  KODE BILLING SIMPONI (MPN-G3 KEMENKEU)
                </span>
                <div className="text-xl sm:text-2xl font-mono font-black text-[#f7cf6e] tracking-wider mt-0.5">
                  {createdReservation.simponi_billing_code || '82026092600001'}
                </div>
                <span className="text-[10px] text-stone-300">
                  Jatuh Tempo: {formatDateIndo(createdReservation.checkout_date)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyBillingCode(createdReservation.simponi_billing_code || '')}
                className="px-3 py-1.5 bg-[#c9a961] hover:bg-[#d8b870] text-[#1A1410] rounded-lg font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                {copiedBilling ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBilling ? 'Tersalin' : 'Salin Kode'}</span>
              </button>
            </div>

            {/* Data Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] pt-1">
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-stone-500 block text-[10px]">No. Reservasi</span>
                <strong className="text-stone-900 font-bold">{createdReservation.reservation_no}</strong>
              </div>
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-stone-500 block text-[10px]">No. SPMA Digital</span>
                <strong className="text-[#8a6d2b] font-bold">{createdReservation.spma_no}</strong>
              </div>
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-stone-500 block text-[10px]">Pemesan / Tamu</span>
                <strong className="text-stone-900 font-bold">{registeredGuest?.full_name || guestName}</strong>
              </div>
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-stone-500 block text-[10px]">No. WhatsApp</span>
                <strong className="text-stone-900 font-bold">{registeredGuest?.phone || phone}</strong>
              </div>
            </div>

            {/* Booking Details Table */}
            <div className="border border-stone-200 rounded-xl overflow-hidden text-[11px]">
              <table className="w-full text-left">
                <thead className="bg-stone-100 text-stone-700 font-bold">
                  <tr>
                    <th className="p-2.5">Layanan / Unit</th>
                    <th className="p-2.5">Periode Penggunaan</th>
                    <th className="p-2.5 text-center">Durasi & Unit</th>
                    <th className="p-2.5 text-right">Tarif PNBP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  <tr>
                    <td className="p-2.5">
                      <strong className="font-bold text-stone-900 block">
                        {rentalCategory === 'PENGINAPAN' ? selectedRoomType?.name : selectedFacility?.name}
                      </strong>
                      <span className="text-stone-500 text-[10px]">
                        {rentalCategory === 'PENGINAPAN' ? 'Gedung Mina' : selectedFacility?.location}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <div>{formatDateIndo(createdReservation.checkin_date)} s.d</div>
                      <div>{formatDateIndo(createdReservation.checkout_date)}</div>
                    </td>
                    <td className="p-2.5 text-center">
                      <span className="font-semibold">
                        {duration} {durationUnit} × {unitCount} Unit
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-black text-stone-900">
                      {formatCurrency(createdReservation.total_amount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total Amount & Instructions */}
            <div className="p-3 bg-[#fbf8ee] rounded-xl border border-[#e8dfc8] space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-stone-800">Total Tagihan PNBP:</span>
                <span className="text-lg font-black text-[#8a6d2b]">
                  {formatCurrency(createdReservation.total_amount)}
                </span>
              </div>
              <p className="text-stone-600 text-[10px] leading-relaxed pt-1 border-t border-[#e8dfc8]">
                &bull; Tunjukkan bukti ini atau sebutkan <strong>No. Reservasi ({createdReservation.reservation_no})</strong> atau <strong>No. HP ({registeredGuest?.phone || phone})</strong> di Front Desk Asrama Haji Jayapura saat kedatangan.<br />
                &bull; Anda juga dapat melakukan pengecekan penempatan kamar kapan saja melalui Anjungan Mandiri (Munakosah Papua) di beranda website.
              </p>
            </div>
          </div>

          {/* Action Buttons: Print, Download, Share WhatsApp, Done */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={handlePrintSlip}
                icon={<Printer className="w-4 h-4" />}
              >
                Cetak Bukti
              </Button>
              <Button
                variant="outline"
                size="md"
                disabled={isDownloadingPdf}
                onClick={handleDownloadSlipPdf}
                icon={isDownloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              >
                Unduh PDF
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={handleShareWhatsApp}
                icon={<Share2 className="w-4 h-4 text-emerald-600" />}
              >
                Kirim ke WhatsApp
              </Button>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={onClose}
              icon={<Check className="w-4 h-4" />}
            >
              Selesai & Tutup
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
