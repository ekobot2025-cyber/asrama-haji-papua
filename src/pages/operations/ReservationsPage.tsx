import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, Plus, Search, Filter, Eye, CheckCircle2, 
  XCircle, UserCheck, LogIn, LogOut, Printer, Calendar, Users, 
  Briefcase, Landmark, FileText, ChevronRight, AlertTriangle, BedDouble 
} from 'lucide-react';
import { db } from '../../db/database';
import { Reservation, Guest, Group, Institution, ReservationStatus, Building, Room, Bed, RoomAssignment } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Pagination } from '../../components/common/Pagination';
import { SpmaModal } from '../../components/operations/SpmaModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDateIndo, calculateNights } from '../../utils/formatters';

interface ReservationsPageProps {
  onNavigate: (page: string, targetId?: string) => void;
  initialTargetId?: string;
}

export const ReservationsPage: React.FC<ReservationsPageProps> = ({ onNavigate, initialTargetId }) => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [roomAssignments, setRoomAssignments] = useState<RoomAssignment[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);

  // SPMA Modal state
  const [spmaTarget, setSpmaTarget] = useState<Reservation | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // New Reservation Modal state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [rentalCategory, setRentalCategory] = useState<'PENGINAPAN' | 'RUANG_PERTEMUAN'>('PENGINAPAN');
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>('rt-std');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('fac-01');

  const [newFormData, setNewFormData] = useState({
    reservation_type: 'INDIVIDUAL' as 'INDIVIDUAL' | 'ROMBONGAN' | 'INSTANSI' | 'KEGIATAN',
    package_type: 'REGULER' as 'REGULER' | 'FULLBOARD_DIKLAT' | 'MANASIK_AKBAR' | 'HALFDAY_MEETING',
    pic_name: '',
    pic_phone: '',
    pic_email: '',
    institution_id: '',
    activity_type: 'KEDINASAN',
    activity_name: '',
    checkin_date: '2026-09-27',
    checkout_date: '2026-09-30',
    total_guests: 1,
    male_count: 1,
    female_count: 0,
    unit_count: 1,
    facility_requirements: '',
    notes: '',
  });

  // Verification dialog
  const [verifyModal, setVerifyModal] = useState<{
    isOpen: boolean;
    reservation?: Reservation;
    isApprove: boolean;
  }>({ isOpen: false, isApprove: true });

  const loadData = () => {
    setReservations(db.getReservations());
    setGuests(db.getGuests());
    setGroups(db.getGroups());
    setInstitutions(db.getInstitutions());
    setRooms(db.getRooms());
    setBeds(db.getBeds());
    setBuildings(db.getBuildings());
    setRoomAssignments(db.getRoomAssignments());
    setRoomTypes(db.getRoomTypes());
    setFacilities(db.getFacilities());
  };

  useEffect(() => {
    loadData();
    if (initialTargetId === 'new') {
      setIsNewModalOpen(true);
    }
  }, [initialTargetId]);

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
    return rsv.activity_name || 'Tamu Asrama Haji';
  };

  const getInstitutionName = (rsv?: Reservation | null): string => {
    if (!rsv) return '';
    if (!rsv.institution_id) return 'Mandiri / Pribadi';
    const inst = institutions.find((i) => i.id === rsv.institution_id);
    return inst ? inst.name : 'Instansi';
  };

  // Filter reservations
  const filtered = reservations.filter((r) => {
    const matchSearch =
      r.reservation_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getGuestOrGroupName(r).toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.activity_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchType = typeFilter === 'all' || r.reservation_type === typeFilter;

    return matchSearch && matchStatus && matchType;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!newFormData.pic_name) {
      toast.error('Gagal', 'Nama Pemesan / PIC wajib diisi.');
      return;
    }

    // Register or find guest
    const guest = db.saveGuest({
      full_name: newFormData.pic_name,
      phone: newFormData.pic_phone,
      email: newFormData.pic_email,
      institution_id: newFormData.institution_id || undefined,
      guest_type: newFormData.reservation_type === 'ROMBONGAN' ? 'ROMBONGAN' : 'KEDINASAN',
    });

    let groupId: string | undefined = undefined;
    if (newFormData.reservation_type === 'ROMBONGAN' || newFormData.reservation_type === 'KEGIATAN') {
      const group = db.saveGroup({
        group_name: newFormData.activity_name || `Rombongan ${newFormData.pic_name}`,
        activity_name: newFormData.activity_name || 'Kegiatan Asrama Haji',
        institution_id: newFormData.institution_id || undefined,
        pic_name: newFormData.pic_name,
        pic_phone: newFormData.pic_phone,
        pic_email: newFormData.pic_email,
        total_members: newFormData.total_guests,
        male_count: newFormData.male_count,
        female_count: newFormData.female_count,
        checkin_date: newFormData.checkin_date,
        checkout_date: newFormData.checkout_date,
      });
      groupId = group.id;
    }

    const cinTime = new Date(newFormData.checkin_date).getTime();
    const coutTime = new Date(newFormData.checkout_date).getTime();
    const nights = Math.max(1, Math.round((coutTime - cinTime) / (1000 * 60 * 60 * 24)));
    const days = newFormData.checkin_date === newFormData.checkout_date ? 1 : nights;

    let snapshotRate = 0;
    let duration = 1;
    let durationUnit: 'MALAM' | 'HARI' = 'MALAM';

    if (rentalCategory === 'PENGINAPAN') {
      const rType = roomTypes.find(rt => rt.id === selectedRoomTypeId);
      snapshotRate = rType?.base_rate_per_night || 250000;
      duration = nights;
      durationUnit = 'MALAM';
    } else {
      const fac = facilities.find(f => f.id === selectedFacilityId);
      snapshotRate = fac?.daily_rate || 3900000;
      duration = days;
      durationUnit = 'HARI';
    }

    const totalAmt = duration * snapshotRate * Number(newFormData.unit_count);

    const result = db.createReservation(
      {
        reservation_type: newFormData.reservation_type,
        rental_category: rentalCategory,
        room_type_id: rentalCategory === 'PENGINAPAN' ? selectedRoomTypeId : undefined,
        facility_id: rentalCategory === 'RUANG_PERTEMUAN' ? selectedFacilityId : undefined,
        unit_count: Number(newFormData.unit_count),
        duration: duration,
        duration_unit: durationUnit,
        snapshot_rate: snapshotRate,
        total_amount: totalAmt,
        guest_id: guest.id,
        group_id: groupId,
        institution_id: newFormData.institution_id || undefined,
        activity_type: newFormData.activity_type,
        activity_name: newFormData.activity_name || (rentalCategory === 'PENGINAPAN' ? `Penginapan Kamar ${roomTypes.find(rt => rt.id === selectedRoomTypeId)?.name || ''}` : `Sewa Ruangan ${facilities.find(f => f.id === selectedFacilityId)?.name || ''}`),
        checkin_date: newFormData.checkin_date,
        checkout_date: newFormData.checkout_date,
        total_guests: Number(newFormData.total_guests),
        male_count: Number(newFormData.male_count),
        female_count: Number(newFormData.female_count),
        total_rooms_requested: rentalCategory === 'PENGINAPAN' ? Number(newFormData.unit_count) : 0,
        facility_requirements: rentalCategory === 'RUANG_PERTEMUAN' ? facilities.find(f => f.id === selectedFacilityId)?.name : newFormData.facility_requirements,
        notes: newFormData.notes,
        package_type: newFormData.package_type,
      },
      currentUser
    );

    if (result.success) {
      toast.success('Reservasi Berhasil', result.message);
      setIsNewModalOpen(false);
      loadData();
    } else {
      toast.error('Pemesanan Ditolak', result.message);
    }
  };

  const handleConfirmVerification = () => {
    if (!verifyModal.reservation || !currentUser) return;
    const success = db.verifyReservation(
      verifyModal.reservation.id,
      currentUser,
      verifyModal.isApprove,
      verifyModal.isApprove ? 'Disetujui oleh petugas' : 'Ditolak permohonan'
    );
    if (success) {
      toast.success(
        verifyModal.isApprove ? 'Reservasi Disetujui' : 'Reservasi Ditolak',
        `Reservasi ${verifyModal.reservation.reservation_no} berhasil diperbarui.`
      );
      setVerifyModal({ isOpen: false, isApprove: true });
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-[#8a6d2b]" />
            Pengelolaan Reservasi & Pendaftaran Tamu
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola permohonan reservasi individu, rombongan jamaah haji, instansi kedinasan, dan kegiatan keagamaan.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsNewModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Tambah Reservasi Baru
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] flex flex-wrap items-center gap-3.5">
        {/* Search */}
        <div className="flex-1 min-w-[240px]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari nomor reservasi, nama pemesan, rombongan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 text-xs border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a961] bg-slate-50/50"
            />
          </div>
        </div>

        {/* Filter Status */}
        <div className="w-full sm:w-44">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a961] bg-white"
          >
            <option value="all">Semua Status</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="CHECKED_IN">CHECKED_IN</option>
            <option value="CHECKED_OUT">CHECKED_OUT</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>

        {/* Filter Tipe */}
        <div className="w-full sm:w-44">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a961] bg-white"
          >
            <option value="all">Semua Jenis Reservasi</option>
            <option value="INDIVIDUAL">Individu</option>
            <option value="ROMBONGAN">Rombongan</option>
            <option value="INSTANSI">Instansi</option>
            <option value="KEGIATAN">Kegiatan / Bimtek</option>
          </select>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="py-4 px-4">No. Reservasi</th>
                <th className="py-4 px-4">Tamu / Rombongan</th>
                <th className="py-4 px-4">Instansi & Kegiatan</th>
                <th className="py-4 px-4">Periode Menginap</th>
                <th className="py-4 px-4 text-center">Tamu / Kamar</th>
                <th className="py-4 px-4">Status & Pembayaran</th>
                <th className="py-4 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada reservasi yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                paginatedData.map((rsv) => (
                  <tr key={rsv.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* No Reservasi */}
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <span className="font-mono text-[#8a6d2b]">{rsv.reservation_no}</span>
                      <p className="text-[10px] text-slate-400 font-normal mt-0.5">{formatDateIndo(rsv.reservation_date)}</p>
                    </td>

                    {/* Tamu / Rombongan */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{getGuestOrGroupName(rsv)}</div>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium mt-1 inline-block">
                        {rsv.reservation_type}
                      </span>
                    </td>

                    {/* Instansi & Kegiatan */}
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium truncate max-w-[200px]">{getInstitutionName(rsv)}</div>
                      <p className="text-[11px] text-slate-500 truncate max-w-[200px] mt-0.5">{rsv.activity_name || '-'}</p>
                    </td>

                    {/* Periode */}
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">
                        {formatDateIndo(rsv.checkin_date)} — {formatDateIndo(rsv.checkout_date)}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {calculateNights(rsv.checkin_date, rsv.checkout_date)} Malam
                      </p>
                    </td>

                    {/* Tamu / Kamar */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-slate-900">{rsv.total_guests} Tamu</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        ({rsv.male_count}L / {rsv.female_count}P) &bull; {rsv.total_rooms_requested} Kamar
                      </p>
                    </td>

                    {/* Status & Bayar */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <Badge status={rsv.status} size="sm" />
                        <span className={`text-[10px] font-semibold ${rsv.payment_status === 'PAID' ? 'text-[#8a6d2b]' : 'text-amber-700'}`}>
                          {rsv.payment_status === 'PAID' ? 'Lunas' : `Sisa: ${formatCurrency(rsv.remaining_amount)}`}
                        </span>
                      </div>
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* If Pending: Verify button */}
                        {rsv.status === 'PENDING' && (
                          <button
                            onClick={() => setVerifyModal({ isOpen: true, reservation: rsv, isApprove: true })}
                            className="p-1.5 rounded-lg bg-[#fbf8ee] text-[#8a6d2b] hover:bg-[#f4ebd0] transition-colors"
                            title="Verifikasi & Setujui"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Room Assignment */}
                        {(rsv.status === 'CONFIRMED' || rsv.status === 'CHECKED_IN') && (
                          <button
                            onClick={() => onNavigate('room-assignment', rsv.id)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors"
                            title="Penempatan Kamar & Bed"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}

                        {/* Check-in Quick Button */}
                        {rsv.status === 'CONFIRMED' && (
                          <button
                            onClick={() => onNavigate('checkin', rsv.id)}
                            className="p-1.5 rounded-lg bg-[#fbf8ee] text-[#8a6d2b] hover:bg-[#f4ebd0] transition-colors"
                            title="Proses Check-in"
                          >
                            <LogIn className="w-4 h-4" />
                          </button>
                        )}

                        {/* Check-out Quick Button */}
                        {rsv.status === 'CHECKED_IN' && (
                          <button
                            onClick={() => onNavigate('checkout', rsv.id)}
                            className="p-1.5 rounded-lg bg-orange-50 text-orange-800 hover:bg-orange-100 transition-colors"
                            title="Proses Check-out Tamu"
                          >
                            <LogOut className="w-4 h-4" />
                          </button>
                        )}

                        {/* Cetak SPMA & Tag Bagasi (Munakosah) */}
                        <button
                          onClick={() => setSpmaTarget(rsv)}
                          className="p-1.5 rounded-lg bg-[#fbf8ee] text-[#8a6d2b] hover:bg-[#f4ebd0] transition-colors"
                          title="Cetak SPMA & Label Bagasi Koper (Munakosah)"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Invoice & Kwitansi */}
                        <button
                          onClick={() => onNavigate('invoices', rsv.id)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                          title="Lihat Tagihan / Invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal Tambah Reservasi Baru */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Form Pendaftaran Reservasi Baru"
        subtitle="Sistem Informasi Penginapan Asrama Haji Papua"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateReservation} className="space-y-4 text-xs">
          {/* Category Tabs: Penginapan vs Ruang Pertemuan */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setRentalCategory('PENGINAPAN')}
              className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                rentalCategory === 'PENGINAPAN'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <BedDouble className="w-4 h-4 text-[#8a6d2b]" />
              <span>Penginapan Kamar (Per Malam)</span>
            </button>
            <button
              type="button"
              onClick={() => setRentalCategory('RUANG_PERTEMUAN')}
              className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                rentalCategory === 'RUANG_PERTEMUAN'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Landmark className="w-4 h-4 text-[#8a6d2b]" />
              <span>Ruang Pertemuan (Per Hari)</span>
            </button>
          </div>

          {/* Unit Selection based on Category */}
          {rentalCategory === 'PENGINAPAN' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/60">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Jenis Kamar *</label>
                <select
                  value={selectedRoomTypeId}
                  onChange={(e) => setSelectedRoomTypeId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#c9a961] rounded-xl bg-white font-bold text-slate-800 text-xs focus:ring-2 focus:ring-[#c9a961]"
                >
                  {roomTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.name} — {formatCurrency(rt.base_rate_per_night)} / Malam
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {roomTypes.find(rt => rt.id === selectedRoomTypeId)?.description || ''}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jumlah Kamar Dipesan *</label>
                <input
                  type="number"
                  min="1"
                  max="32"
                  required
                  value={newFormData.unit_count}
                  onChange={(e) => setNewFormData({ ...newFormData, unit_count: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold text-slate-800 focus:ring-2 focus:ring-[#c9a961]"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Total aset: Gedung Mina 32 Kamar (2 Superior & 30 Standar)
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-blue-50/50 p-3.5 rounded-2xl border border-blue-200/60">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Ruang Pertemuan *</label>
                <select
                  value={selectedFacilityId}
                  onChange={(e) => setSelectedFacilityId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#c9a961] rounded-xl bg-white font-bold text-slate-800 text-xs focus:ring-2 focus:ring-[#c9a961]"
                >
                  {facilities
                    .filter(f => f.category === 'RUANG_PERTEMUAN' || f.type === 'AULA' || f.type === 'RUANG_KELAS' || f.type === 'RUANG_RAPAT')
                    .map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.name} — {formatCurrency(fac.daily_rate)} / Hari (Kapasitas: {fac.capacity} pax)
                      </option>
                    ))}
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {facilities.find(f => f.id === selectedFacilityId)?.description || ''}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jumlah Unit Ruangan *</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  required
                  value={newFormData.unit_count}
                  onChange={(e) => setNewFormData({ ...newFormData, unit_count: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold text-slate-800 focus:ring-2 focus:ring-[#c9a961]"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Standar MICE & Kegiatan Diklat / Pelatihan Keagamaan
                </span>
              </div>
            </div>
          )}

          {/* Dates Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {rentalCategory === 'PENGINAPAN' ? 'Tanggal Check-in *' : 'Tanggal Mulai Pemakaian *'}
              </label>
              <input
                type="date"
                required
                value={newFormData.checkin_date}
                onChange={(e) => setNewFormData({ ...newFormData, checkin_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {rentalCategory === 'PENGINAPAN' ? 'Tanggal Check-out *' : 'Tanggal Selesai Pemakaian *'}
              </label>
              <input
                type="date"
                required
                value={newFormData.checkout_date}
                onChange={(e) => setNewFormData({ ...newFormData, checkout_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
              />
            </div>
          </div>

          {/* Dynamic Cost & Availability Summary Card */}
          {(() => {
            const cinTime = new Date(newFormData.checkin_date).getTime();
            const coutTime = new Date(newFormData.checkout_date).getTime();
            const nights = Math.max(1, Math.round((coutTime - cinTime) / (1000 * 60 * 60 * 24)));
            const days = newFormData.checkin_date === newFormData.checkout_date ? 1 : nights;

            const activeRate = rentalCategory === 'PENGINAPAN'
              ? (roomTypes.find(rt => rt.id === selectedRoomTypeId)?.base_rate_per_night || 250000)
              : (facilities.find(f => f.id === selectedFacilityId)?.daily_rate || 3900000);

            const activeDuration = rentalCategory === 'PENGINAPAN' ? nights : days;
            const activeUnit = rentalCategory === 'PENGINAPAN' ? 'Malam' : 'Hari';
            const totalCost = activeDuration * activeRate * Number(newFormData.unit_count);

            const roomAvail = rentalCategory === 'PENGINAPAN' 
              ? db.checkRoomAvailability(selectedRoomTypeId, newFormData.checkin_date, newFormData.checkout_date, Number(newFormData.unit_count))
              : null;

            const facAvail = rentalCategory === 'RUANG_PERTEMUAN'
              ? db.checkFacilityAvailability(selectedFacilityId, newFormData.checkin_date, newFormData.checkout_date)
              : null;

            const selectedFacilityObj = facilities.find(f => f.id === selectedFacilityId);
            const isCapacityExceeded = rentalCategory === 'RUANG_PERTEMUAN' && selectedFacilityObj?.capacity && newFormData.total_guests > selectedFacilityObj.capacity;

            return (
              <div className="bg-[#fbf8ee] p-4 rounded-2xl border border-[#e8dfc8] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">
                    Kalkulasi Biaya Resmi ({rentalCategory === 'PENGINAPAN' ? 'Per Malam' : 'Per Hari'}):
                  </span>
                  <span className="font-mono font-bold text-[#8a6d2b]">
                    {formatCurrency(activeRate)} / {activeUnit}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1 border-t border-[#e8dfc8]">
                  <span className="text-xs text-slate-600">
                    {activeDuration} {activeUnit} × {formatCurrency(activeRate)} × {newFormData.unit_count} {rentalCategory === 'PENGINAPAN' ? 'Kamar' : 'Unit'}
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total Estimasi PNBP:</span>
                    <strong className="text-lg font-black text-[#8a6d2b]">
                      {formatCurrency(totalCost)}
                    </strong>
                  </div>
                </div>

                {/* Realtime conflict & availability badges */}
                {roomAvail && (
                  <div className={`p-2 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 ${
                    roomAvail.available 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {roomAvail.available ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                    <span>{roomAvail.message}</span>
                  </div>
                )}

                {facAvail && (
                  <div className={`p-2 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 ${
                    facAvail.available 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {facAvail.available ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                    <span>{facAvail.message}</span>
                  </div>
                )}

                {isCapacityExceeded && (
                  <div className="p-2 rounded-xl text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>
                      Jumlah peserta ({newFormData.total_guests} orang) melampaui kapasitas maksimal {selectedFacilityObj?.name} ({selectedFacilityObj?.capacity} orang).
                    </span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* PIC Data & Guest Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Pemesan / PIC *</label>
              <input
                type="text"
                placeholder="Nama Lengkap PIC"
                required
                value={newFormData.pic_name}
                onChange={(e) => setNewFormData({ ...newFormData, pic_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp / HP *</label>
              <input
                type="text"
                placeholder="0812-xxxx-xxxx"
                required
                value={newFormData.pic_phone}
                onChange={(e) => setNewFormData({ ...newFormData, pic_phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Instansi Asal</label>
              <select
                value={newFormData.institution_id}
                onChange={(e) => setNewFormData({ ...newFormData, institution_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
              >
                <option value="">Pribadi / Umum</option>
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Activity / Event Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Agenda / Kegiatan / Rombongan</label>
            <input
              type="text"
              placeholder="Contoh: Pembekalan Karu Karom / Diklat Guru Madrasah Papua"
              value={newFormData.activity_name}
              onChange={(e) => setNewFormData({ ...newFormData, activity_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
            />
          </div>

          {/* Guest breakdown: Total, Male, Female */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Total Tamu / Peserta</label>
              <input
                type="number"
                min="1"
                value={newFormData.total_guests}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setNewFormData({
                    ...newFormData,
                    total_guests: val,
                    male_count: Math.ceil(val / 2),
                    female_count: Math.floor(val / 2),
                  });
                }}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jumlah Pria (L)</label>
              <input
                type="number"
                min="0"
                value={newFormData.male_count}
                onChange={(e) => setNewFormData({ ...newFormData, male_count: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jumlah Wanita (P)</label>
              <input
                type="number"
                min="0"
                value={newFormData.female_count}
                onChange={(e) => setNewFormData({ ...newFormData, female_count: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan</label>
            <textarea
              rows={2}
              placeholder="Kebutuhan khusus atau catatan operasional..."
              value={newFormData.notes}
              onChange={(e) => setNewFormData({ ...newFormData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsNewModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Reservasi
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={verifyModal.isOpen}
        onClose={() => setVerifyModal({ isOpen: false, isApprove: true })}
        onConfirm={handleConfirmVerification}
        title={verifyModal.isApprove ? 'Verifikasi & Setujui Reservasi' : 'Tolak Reservasi'}
        message={
          verifyModal.isApprove
            ? `Apakah Anda ingin menyetujui reservasi ${verifyModal.reservation?.reservation_no}? Status akan menjadi CONFIRMED dan siap ditempatkan kamar.`
            : `Apakah Anda ingin menolak reservasi ${verifyModal.reservation?.reservation_no}?`
        }
        confirmText={verifyModal.isApprove ? 'Setujui Reservasi' : 'Tolak Permohonan'}
        variant={verifyModal.isApprove ? 'primary' : 'danger'}
      />

      {/* SPMA & Tag Bagasi Modal Munakosah */}
      {spmaTarget && (
        <SpmaModal
          isOpen={!!spmaTarget}
          onClose={() => setSpmaTarget(null)}
          reservation={spmaTarget}
          guest={guests.find((g) => g.id === spmaTarget.guest_id)}
          room={(() => {
            const assign = roomAssignments.find((a) => a.reservation_id === spmaTarget.id);
            return rooms.find((r) => r.id === assign?.room_id) || rooms[0];
          })()}
          bed={(() => {
            const assign = roomAssignments.find((a) => a.reservation_id === spmaTarget.id);
            return beds.find((b) => b.id === assign?.bed_id) || beds[0];
          })()}
          building={(() => {
            const assign = roomAssignments.find((a) => a.reservation_id === spmaTarget.id);
            const r = rooms.find((rm) => rm.id === assign?.room_id) || rooms[0];
            return buildings.find((b) => b.id === r?.building_id) || buildings[0];
          })()}
        />
      )}
    </div>
  );
};
