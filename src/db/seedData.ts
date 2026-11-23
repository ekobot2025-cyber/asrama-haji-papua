import type { 
  User, Building, Floor, RoomType, Room, Bed, Institution, Guest, Group, 
  Reservation, RoomAssignment, Facility, RateItem, Invoice, InvoiceItem, 
  Payment, HousekeepingTask, MaintenanceRequest, NotificationItem, AuditLog, AppSettings,
  RoomStatus, HousekeepingStatus 
} from '../types/index.ts';

// Dynamic Relative Date Helpers for Real-time Demo Presets
export function getRelativeDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getRelativeIso(offsetDays: number, hours = 10, minutes = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

export const initialSettings: AppSettings = {
  app_name: 'SIMAHA PAPUA',
  app_title: 'SIMAHA — Sistem Informasi Manajemen Asrama Haji',
  app_subtitle: 'Sistem Informasi Manajemen Asrama Haji Provinsi Papua',
  organization_name: 'Unit Pelaksana Teknis Asrama Haji Provinsi Papua',
  address: 'Jl. Raya Sentani - Padang Bulan, Kotaraja, Distrik Abepura',
  city: 'Kota Jayapura',
  province: 'Papua',
  phone: '(0967) 581-229 / +62 812-4898-4433',
  email: 'asramahaji.papua@kemenhaj.go.id',
  head_officer: 'Kepala UPT Asrama Haji Papua',
  head_nip: '19710815 199803 1 004',
  bank_bpd_papua: 'Bank Papua: 100-02-01-88990-1 a/n BPn Asrama Haji Papua',
  bank_bsi: 'Bank Syariah Indonesia: 7123-4567-89 a/n UPT Asrama Haji Jayapura',
  bank_bri: 'Bank Rakyat Indonesia: 0021-01-000888-30-2 a/n Pengelola Asrama Haji Papua',
  checkin_time_default: '14:00',
  checkout_time_default: '12:00',
  timezone: 'Asia/Jayapura (WIT - UTC+9)',
};

export const initialUsers: User[] = [
  {
    id: 'usr-001',
    username: 'superadmin',
    name: 'Super Admin',
    email: 'superadmin@asramahaji.id',
    role: 'SUPER_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    department: 'Pranata Komputer & IT',
    status: 'ACTIVE',
    last_login: '2026-11-21T08:00:00Z',
    created_at: '2026-01-10T08:00:00Z',
  },
];

export const initialBuildings: Building[] = [
  {
    id: 'bld-01',
    code: 'MINA',
    name: 'Gedung Mina',
    total_floors: 2,
    description: 'Gedung akomodasi utama berkapasitas 36 kamar fisik (Lantai 1: M101–M118 dengan M117 Kosong; Lantai 2: M201–M218 dengan 4 Kamar Superior M209, M211, M213, M215 dan M217, M218 Kosong/Belum Tercantum), Check-in: 14.00 WIT, Check-out: 12.00 WIT',
    status: 'ACTIVE',
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const initialFloors: Floor[] = [
  { id: 'flr-01', building_id: 'bld-01', floor_number: 1, name: 'Lantai 1 Gedung Mina' },
  { id: 'flr-02', building_id: 'bld-01', floor_number: 2, name: 'Lantai 2 Gedung Mina' },
];

export const initialRoomTypes: RoomType[] = [
  {
    id: 'rt-spr',
    code: 'SUPERIOR',
    name: 'Superior',
    category: 'PENGINAPAN',
    description: 'Kamar Superior representatif di Lantai 2 (tersedia 4 kamar: M209, M211, M213, dan M215) dengan fasilitas 1 Bed (Double/King Bed), AC, Meja, Lemari, Smart TV, Water Heater, dan Closet Duduk (Check-in: 14.00, Check-out: 12.00 WIT).',
    default_capacity: 2,
    base_rate_per_night: 300000,
    rate_unit: 'PER_NIGHT',
    amenities: ['1 Double/King Bed', 'AC', 'Meja', 'Lemari', 'Closet Duduk', 'Smart TV LED', 'Water Heater', 'WiFi Gratis'],
    image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600',
  },
  {
    id: 'rt-std',
    code: 'STANDAR',
    name: 'Standar',
    category: 'PENGINAPAN',
    description: 'Kamar Standar nyaman (tersedia 32 kamar fisik: Lantai 1 M101–M118 kecuali M117; Lantai 2 M201–M218 kecuali M209, M211, M213, M215 & M217, M218 kosong) dengan fasilitas 2 Bed (Single Bed), AC, Meja, Lemari, dan Closet Duduk (Check-in: 14.00, Check-out: 12.00 WIT).',
    default_capacity: 2,
    base_rate_per_night: 250000,
    rate_unit: 'PER_NIGHT',
    amenities: ['2 Single Bed', 'AC', 'Meja', 'Lemari', 'Closet Duduk', 'WiFi Gratis'],
    image_url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600',
  },
];

export const initialInstitutions: Institution[] = [
  {
    id: 'inst-01',
    name: 'Kantor Wilayah Kementerian Agama Provinsi Papua',
    type: 'KEMENAG',
    address: 'Jl. Raya Abepura - Kotaraja, Kota Jayapura',
    phone: '(0967) 581122',
    contact_person: 'H. Rusli Sanjaya, M.Si. (0812-4820-1122)',
    email: 'papua@kemenag.go.id',
  },
  {
    id: 'inst-02',
    name: 'Pemerintah Daerah Kabupaten Jayapura (Bagian Kesra)',
    type: 'PEMDA',
    address: 'Kompleks Perkantoran Gunung Merah Sentani, Jayapura',
    phone: '(0967) 591230',
    contact_person: 'Yakobus Weya, S.STP (0821-9988-7711)',
    email: 'kesra@jayapurakab.go.id',
  },
  {
    id: 'inst-03',
    name: 'Kantor Kementerian Agama Kabupaten Merauke',
    type: 'KEMENAG',
    address: 'Jl. TMP Trikora, Merauke, Papua Selatan',
    phone: '(0971) 321890',
    contact_person: 'Drs. H. Mulyadi (0813-4455-6677)',
    email: 'kemenag.merauke@kemenag.go.id',
  },
  {
    id: 'inst-04',
    name: 'IAIN Fattahul Muluk Papua',
    type: 'DINAS',
    address: 'Jl. Merauke No. 1, Buper Waena, Kota Jayapura',
    phone: '(0967) 572111',
    contact_person: 'Dr. Hj. Siti Fatimah, M.Ag (0852-5400-3321)',
    email: 'humas@iainpapua.ac.id',
  },
  {
    id: 'inst-05',
    name: 'Balai Penjaminan Mutu Pendidikan (BPMP) Papua',
    type: 'DINAS',
    address: 'Jl. Kotaraja Dalam, Kota Jayapura',
    phone: '(0967) 581555',
    contact_person: 'Maria Kogoya, S.Pd (0812-4099-2311)',
    email: 'bpmp.papua@kemdikbud.go.id',
  },
  {
    id: 'inst-06',
    name: 'Kelompok Bimbingan Ibadah Haji & Umrah (KBIHU) Babussalam Jayapura',
    type: 'KOMUNITAS',
    address: 'Jl. Percetakan Negara No. 45, Jayapura Utara',
    phone: '(0967) 534889',
    contact_person: 'K.H. Ahmad Dahlan (0811-480-998)',
    email: 'kbihu.babussalam@gmail.com',
  },
];

// Helper to generate exactly 36 rooms in Gedung Mina:
// Lantai 1: M101–M118 (18 kamar Standar @ Rp 250.000, 2 Bed; M117 Kosong/Tidak Tersedia)
// Lantai 2: M201–M218 (4 kamar Superior M209, M211, M213, M215 @ Rp 300.000, 1 Bed; M217 & M218 Kosong/Belum Tersedia; lainnya Standar @ Rp 250.000, 2 Bed)
export function generateSeedRoomsAndBeds(): { rooms: Room[]; beds: Bed[] } {
  const rooms: Room[] = [];
  const beds: Bed[] = [];

  const roomConfig = [
    // Gedung Mina - Lantai 1 (18 Kamar: Seluruhnya Kamar Standar @ Rp 250.000, 2 Bed; Kamar M117 Kosong/Tidak Tersedia)
    { num: 'M101', bld: 'bld-01', flr: 'flr-01', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M102', bld: 'bld-01', flr: 'flr-01', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M103', bld: 'bld-01', flr: 'flr-01', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M104', bld: 'bld-01', flr: 'flr-01', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M105', bld: 'bld-01', flr: 'flr-01', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M106', bld: 'bld-01', flr: 'flr-01', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M107', bld: 'bld-01', flr: 'flr-01', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M108', bld: 'bld-01', flr: 'flr-01', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M109', bld: 'bld-01', flr: 'flr-01', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M110', bld: 'bld-01', flr: 'flr-01', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M111', bld: 'bld-01', flr: 'flr-01', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M112', bld: 'bld-01', flr: 'flr-01', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M113', bld: 'bld-01', flr: 'flr-01', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M114', bld: 'bld-01', flr: 'flr-01', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M115', bld: 'bld-01', flr: 'flr-01', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M116', bld: 'bld-01', flr: 'flr-01', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M117', bld: 'bld-01', flr: 'flr-01', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'INACTIVE' as RoomStatus, hk: 'INSPECTED' as HousekeepingStatus, notes: 'Kamar Kosong / Tidak Tersedia (Lantai 1)' },
    { num: 'M118', bld: 'bld-01', flr: 'flr-01', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },

    // Gedung Mina - Lantai 2 (18 Kamar: M209, M211, M213, M215 Superior @ Rp 300.000 1 Bed; M217 & M218 Kosong/Belum Tercantum; lainnya Standar @ Rp 250.000 2 Bed)
    { num: 'M201', bld: 'bld-01', flr: 'flr-02', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M202', bld: 'bld-01', flr: 'flr-02', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M203', bld: 'bld-01', flr: 'flr-02', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M204', bld: 'bld-01', flr: 'flr-02', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M205', bld: 'bld-01', flr: 'flr-02', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M206', bld: 'bld-01', flr: 'flr-02', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M207', bld: 'bld-01', flr: 'flr-02', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M208', bld: 'bld-01', flr: 'flr-02', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M209', bld: 'bld-01', flr: 'flr-02', type: 'rt-spr', beds: 1, cap: 2, rate: 300000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M210', bld: 'bld-01', flr: 'flr-02', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M211', bld: 'bld-01', flr: 'flr-02', type: 'rt-spr', beds: 1, cap: 2, rate: 300000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M212', bld: 'bld-01', flr: 'flr-02', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M213', bld: 'bld-01', flr: 'flr-02', type: 'rt-spr', beds: 1, cap: 2, rate: 300000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M214', bld: 'bld-01', flr: 'flr-02', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M215', bld: 'bld-01', flr: 'flr-02', type: 'rt-spr', beds: 1, cap: 2, rate: 300000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M216', bld: 'bld-01', flr: 'flr-02', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'AVAILABLE' as RoomStatus, hk: 'READY' as HousekeepingStatus },
    { num: 'M217', bld: 'bld-01', flr: 'flr-02', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'INACTIVE' as RoomStatus, hk: 'INSPECTED' as HousekeepingStatus, notes: 'Kamar Kosong / Tidak Tersedia (Lantai 2)' },
    { num: 'M218', bld: 'bld-01', flr: 'flr-02', type: 'rt-std', beds: 2, cap: 2, rate: 250000, status: 'INACTIVE' as RoomStatus, hk: 'INSPECTED' as HousekeepingStatus, notes: 'Kamar Kosong / Belum Tercantum (Tidak Tersedia)' },
  ];

  roomConfig.forEach((cfg, idx) => {
    const roomId = `room-${(idx + 1).toString().padStart(3, '0')}`;
    let occupiedCount = 0;
    const isSuperior = cfg.type === 'rt-spr';
    const isInactive = cfg.status === 'INACTIVE';
    const bedCount = cfg.beds;

    // Generate individual beds
    for (let b = 1; b <= bedCount; b++) {
      const bedCode = `${cfg.num}-B0${b}`;
      const bedId = `bed-${roomId}-${b}`;
      let bStatus: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE' = 'AVAILABLE';

      if (isInactive) {
        bStatus = 'MAINTENANCE';
      } else if (cfg.status === 'OCCUPIED') {
        bStatus = 'OCCUPIED';
      } else if (cfg.status === 'RESERVED') {
        bStatus = 'RESERVED';
      } else if (cfg.status === 'MAINTENANCE') {
        bStatus = 'MAINTENANCE';
      }

      if (bStatus === 'OCCUPIED') {
        occupiedCount++;
      }

      beds.push({
        id: bedId,
        bed_code: bedCode,
        room_id: roomId,
        status: bStatus,
      });
    }

    const roomAmenities = isSuperior
      ? ['1 Double/King Bed', 'AC Dual-Inverter', 'WiFi', 'Kamar Mandi Dalam', 'Water Heater', 'Smart TV LED 43"', 'Kulkas Mini', 'Meja Kerja & Lemari', 'Closet Duduk']
      : ['2 Single Bed', 'AC Individual', 'WiFi', 'Kamar Mandi Dalam', 'Lemari Pakaian', 'Meja & Kursi', 'Closet Duduk'];

    rooms.push({
      id: roomId,
      room_number: cfg.num,
      building_id: cfg.bld,
      floor_id: cfg.flr,
      room_type_id: cfg.type,
      capacity: cfg.cap,
      total_beds: bedCount,
      occupied_beds: occupiedCount,
      rate_per_night: cfg.rate,
      status: cfg.status,
      housekeeping_status: cfg.hk,
      amenities: roomAmenities,
      notes: (cfg as any).notes ? (cfg as any).notes : (cfg.status === 'MAINTENANCE' ? 'Perbaikan unit AC bocor & stop kontak' : undefined),
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-09-26T00:00:00Z',
    });
  });

  return { rooms, beds };
}

export const initialFacilities: Facility[] = [
  {
    id: 'fac-01',
    name: 'Aula (Kegiatan Umum)',
    type: 'AULA',
    category: 'RUANG_PERTEMUAN',
    location: 'Gedung Serbaguna Lantai 1',
    capacity: 300,
    daily_rate: 3900000,
    hourly_rate: 500000,
    rate_unit: 'PER_DAY',
    status: 'AVAILABLE',
    description: 'Aula pertemuan serbaguna untuk pemakaian kegiatan umum, seminar, rapat dinas, diklat, wisuda, dan manasik berkapasitas maksimal 300 orang.',
    amenities: ['Sound System', 'Infocus / Proyektor', 'AC', 'Kursi'],
    image_url: '/images/aula-1.png',
  },
  {
    id: 'fac-01-wedding',
    name: 'Aula (Acara Pernikahan)',
    type: 'AULA',
    category: 'RUANG_PERTEMUAN',
    location: 'Gedung Serbaguna Lantai 1',
    capacity: 300,
    daily_rate: 5000000,
    hourly_rate: 700000,
    rate_unit: 'PER_DAY',
    status: 'AVAILABLE',
    description: 'Sewa Aula representatif untuk resepsi dan akad acara pernikahan (wedding) berkapasitas maksimal 300–500 tamu.',
    amenities: ['Sound System', 'Infocus / Proyektor', 'AC', 'Kursi', 'Area Pelaminan & Resepsi'],
    image_url: '/images/aula-2.png',
  },
  {
    id: 'fac-07',
    name: 'Ruang Kelas',
    type: 'RUANG_KELAS',
    category: 'RUANG_PERTEMUAN',
    location: 'Gedung Diklat Lantai 1',
    capacity: 30,
    daily_rate: 650000,
    hourly_rate: 100000,
    rate_unit: 'PER_DAY',
    status: 'AVAILABLE',
    description: 'Ruang kelas representatif untuk diklat, bimtek, pelatihan intensif, dan rapat teknis berkapasitas maksimal 30 orang.',
    amenities: ['Sound System', 'Infocus / Proyektor', 'AC', 'Kursi'],
    image_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600',
  },
  {
    id: 'fac-04',
    name: 'Masjid Baiturrahim Asrama Haji',
    type: 'MASJID',
    location: 'Kompleks Depan Asrama Haji',
    capacity: 600,
    daily_rate: 0,
    status: 'AVAILABLE',
    description: 'Masjid utama jemaah haji Papua dengan karpet tebal, sound system adzan merdu, tempat wudhu luas dan toilet syar’i.',
    amenities: ['Karpet Tebal Turki', 'Sound System Masjid', 'Tempat Wudhu Terpisah Pria/Wanita', 'Kipas Angin Besar', 'Mimbar Khutbah Jati'],
  },
  {
    id: 'fac-05',
    name: 'Lapangan Terbuka Manasik Haji',
    type: 'LAPANGAN_MANASIK',
    location: 'Area Terbuka Kompleks Timur',
    capacity: 1000,
    daily_rate: 2000000,
    status: 'AVAILABLE',
    description: 'Area praktek manasik haji outdoor dengan replika Ka’bah berskala 1:1, replika bukit Shafa-Marwah, area lontar Jumrah, dan tenda Mina.',
    amenities: ['Replika Ka’bah 1:1', 'Lintasan Sa’i Shafa-Marwah', 'Replika Tugu Jamarat', 'Speaker Outdoor', 'Tenda Transit Peneduh'],
  },
];

export const initialGuests: Guest[] = [];
export const initialGroups: Group[] = [];
export const initialReservations: Reservation[] = [];
export const initialHousekeepingTasks: HousekeepingTask[] = [];
export const initialMaintenanceRequests: MaintenanceRequest[] = [];
export const initialInvoices: Invoice[] = [];
export const initialInvoiceItems: InvoiceItem[] = [];
export const initialPayments: Payment[] = [];

export const initialRates: RateItem[] = [
  {
    id: 'rate-01',
    name: 'Tarif Kamar Superior',
    category: 'KAMAR',
    target_id: 'rt-spr',
    user_type: 'Pejabat / Tamu VIP / Umum',
    unit: 'PER_NIGHT',
    rate: 300000,
    description: 'Tarif sewa kamar Superior per malam (Double Bed, AC, Meja, Lemari, Closet Duduk). Check-in: 14.00, Check-out: 12.00 WIT',
    is_active: true,
    effective_date: '2026-01-01',
  },
  {
    id: 'rate-02',
    name: 'Tarif Kamar Standar',
    category: 'KAMAR',
    target_id: 'rt-std',
    user_type: 'Jemaah Haji / Umum / Diklat',
    unit: 'PER_NIGHT',
    rate: 250000,
    description: 'Tarif sewa kamar Standar per malam (2 Single Bed, AC, Meja, Lemari, Closet Duduk). Check-in: 14.00, Check-out: 12.00 WIT',
    is_active: true,
    effective_date: '2026-01-01',
  },
  {
    id: 'rate-03',
    name: 'Tarif Sewa Aula - Kegiatan Umum',
    category: 'FASILITAS',
    target_id: 'fac-01',
    user_type: 'Instansi Pemerintah / Umum / Ormas',
    unit: 'PER_DAY',
    rate: 3900000,
    description: 'Tarif sewa Aula resmi untuk pemakaian kegiatan umum per hari (Kapasitas maks 300 orang, Sound System, Infocus/Proyektor, AC, Kursi)',
    is_active: true,
    effective_date: '2026-01-01',
  },
  {
    id: 'rate-03b',
    name: 'Tarif Sewa Aula - Acara Pernikahan',
    category: 'FASILITAS',
    target_id: 'fac-01-wedding',
    user_type: 'Masyarakat Umum / Wedding',
    unit: 'PER_DAY',
    rate: 5000000,
    description: 'Tarif sewa Aula resmi untuk acara pernikahan (wedding) per hari (Kapasitas maks 300–500 orang, Sound System, Infocus/Proyektor, AC, Kursi, Area Pelaminan)',
    is_active: true,
    effective_date: '2026-01-01',
  },
  {
    id: 'rate-05',
    name: 'Tarif Sewa Ruang Kelas',
    category: 'FASILITAS',
    target_id: 'fac-07',
    user_type: 'Instansi Pemerintah / Pelatihan / Diklat',
    unit: 'PER_DAY',
    rate: 650000,
    description: 'Tarif sewa Ruang Kelas resmi brosur per hari (Kapasitas maks 30 orang, Sound System, Infocus/Proyektor, AC, Kursi)',
    is_active: true,
    effective_date: '2026-01-01',
  },
];

export const initialNotifications: NotificationItem[] = [];
export const initialAuditLogs: AuditLog[] = [];
