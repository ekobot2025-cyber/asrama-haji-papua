import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (match) dbUrl = match[1];
  }
}

if (!dbUrl) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const sql = neon(dbUrl);
const SYNC_KEY = 'simaha_papua_production';

async function main() {
  console.log('Fetching cloud state for cleaning...');
  const rows = await sql`
    SELECT payload, version FROM simaha_cloud_sync WHERE key = ${SYNC_KEY} LIMIT 1;
  `;

  if (rows.length === 0) {
    console.error('Record not found for', SYNC_KEY);
    process.exit(1);
  }

  const payload = rows[0].payload;

  // 1. Wipe all operational and transactional dummy data to clean empty arrays
  payload.guests = [];
  payload.groups = [];
  payload.reservations = [];
  payload.roomAssignments = [];
  payload.checkins = [];
  payload.checkouts = [];
  payload.facilityReservations = [];
  payload.invoices = [];
  payload.invoiceItems = [];
  payload.payments = [];
  payload.housekeepingTasks = [];
  payload.maintenanceRequests = [];
  payload.notifications = [];
  payload.auditLogs = [];

  // 2. Ensure only single Super Admin account
  payload.users = [
    {
      id: 'usr-001',
      username: 'superadmin',
      name: 'Super Admin',
      email: 'superadmin@asramahaji.id',
      role: 'SUPER_ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      department: 'Pranata Komputer & IT',
      status: 'ACTIVE',
      last_login: new Date().toISOString(),
      created_at: '2026-01-10T08:00:00Z',
    }
  ];

  // 3. Reset all rooms: M101 and all active rooms to AVAILABLE, occupied_beds = 0
  const inactiveNumbers = ['M117', 'M217', 'M218'];
  if (Array.isArray(payload.rooms)) {
    payload.rooms = payload.rooms.map(room => {
      if (inactiveNumbers.includes(room.room_number)) {
        return {
          ...room,
          status: 'INACTIVE',
          housekeeping_status: 'INSPECTED',
          occupied_beds: 0,
        };
      }
      return {
        ...room,
        status: 'AVAILABLE',
        housekeeping_status: 'READY',
        occupied_beds: 0,
      };
    });
  }

  // 4. Reset all beds: all AVAILABLE (except inactive rooms) and current_guest_id undefined
  if (Array.isArray(payload.beds)) {
    payload.beds = payload.beds.map(bed => {
      const isInactive = inactiveNumbers.some(num => bed.bed_code?.startsWith(num));
      return {
        ...bed,
        status: isInactive ? 'MAINTENANCE' : 'AVAILABLE',
        current_guest_id: undefined,
      };
    });
  }

  // 5. Clean facilities: only the 5 official ones
  payload.facilities = [
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

  // 6. Clean rates: only the 5 official rates
  payload.rates = [
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

  const newVersion = (rows[0].version || 50) + 10; // Bump significantly so all clients sync
  const now = new Date().toISOString();

  await sql`
    UPDATE simaha_cloud_sync
    SET payload = ${JSON.stringify(payload)},
        version = ${newVersion},
        updated_at = ${now}
    WHERE key = ${SYNC_KEY};
  `;

  console.log('✅ SUCCESS: Production Cloud Database cleaned successfully!');
  console.log('- Version:', newVersion);
  console.log('- Guests:', payload.guests.length);
  console.log('- Reservations:', payload.reservations.length);
  console.log('- Invoices:', payload.invoices.length);
  console.log('- Payments:', payload.payments.length);
  console.log('- Checkins:', payload.checkins.length);
  console.log('- Checkouts:', payload.checkouts.length);
  console.log('- Users:', payload.users.length, payload.users.map(u => u.username));
  console.log('- Occupied Rooms:', payload.rooms.filter(r => r.status === 'OCCUPIED').length);
  console.log('- Available Rooms:', payload.rooms.filter(r => r.status === 'AVAILABLE').length);
  console.log('- Inactive Rooms:', payload.rooms.filter(r => r.status === 'INACTIVE').map(r => r.room_number));
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
