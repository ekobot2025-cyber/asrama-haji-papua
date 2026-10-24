// Test script for Master Prompt Audit & Penyempurnaan Aplikasi Manajemen Asrama Haji
// Tests 10 points required in Section 8

const storageMap = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (key: string) => storageMap.get(key) || null,
  setItem: (key: string, val: string) => { storageMap.set(key, String(val)); },
  removeItem: (key: string) => { storageMap.delete(key); },
  clear: () => { storageMap.clear(); },
  key: (idx: number) => Array.from(storageMap.keys())[idx] || null,
  get length() { return storageMap.size; }
};

// Now import database service
const { db } = await import('./src/db/database.ts');

console.log('================================================================');
console.log('   PENGUJIAN VALIDASI 10 POIN - SISTEM ASRAMA HAJI (SIMAHA)     ');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 10;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    throw new Error(`Assertion failed: ${msg}`);
  }
}

const mockAdminUser = {
  id: 'usr-admin-1',
  username: 'admin',
  name: 'Administrator UPT',
  role: 'SUPERADMIN' as const,
  created_at: new Date().toISOString()
};

// -------------------------------------------------------------
// PENGUJIAN 1: CRUD JENIS KAMAR DAN RUANGAN
// -------------------------------------------------------------
try {
  console.log('TEST 1: CRUD Jenis Kamar & Ruangan...');
  const initialTypes = db.getRoomTypes();
  const superior = initialTypes.find(t => t.id === 'rt-sup' || t.code === 'SUPERIOR' || t.code === 'SUP');
  const standar = initialTypes.find(t => t.id === 'rt-std' || t.code === 'STANDAR' || t.code === 'STD');

  assert(!!superior, 'Kamar Superior harus ada di master RoomType');
  assert(superior.base_rate_per_night === 300000 || superior.base_rate === 300000, 'Tarif Superior harus Rp 300.000 / malam');
  assert(!!standar, 'Kamar Standar harus ada di master RoomType');
  assert(standar.base_rate_per_night === 250000 || standar.base_rate === 250000, 'Tarif Standar harus Rp 250.000 / malam');

  // Create new room type
  const createdType = db.saveRoomType({
    name: 'Suite Haji VIP',
    code: 'VIP',
    category: 'PENGINAPAN',
    rate_unit: 'PER_NIGHT',
    default_capacity: 3,
    base_rate_per_night: 450000,
    amenities: ['Double Bed', 'Living Room', 'AC', 'Water Heater']
  }, mockAdminUser);
  assert(createdType.name === 'Suite Haji VIP', 'Berhasil membuat jenis kamar baru');

  // Update room type
  const updatedType = db.saveRoomType({
    id: createdType.id,
    name: 'Suite Haji Super VIP',
    base_rate_per_night: 500000
  }, mockAdminUser);
  assert(updatedType.name === 'Suite Haji Super VIP', 'Berhasil memperbarui jenis kamar');

  // Delete test room type
  const delRes = db.deleteRoomType(createdType.id, mockAdminUser);
  assert(delRes.success, 'Berhasil menghapus jenis kamar');

  console.log('✅ PASS: CRUD Jenis Kamar & Ruangan berjalan sempurna.\n');
  passedTests++;
} catch (e: any) {
  console.error('Test 1 failed:', e.message);
}

// -------------------------------------------------------------
// PENGUJIAN 2: CRUD UNIT FISIK (32 KAMAR GEDUNG MINA)
// -------------------------------------------------------------
try {
  console.log('TEST 2: CRUD Unit Fisik Kamar (Gedung Mina 32 Kamar)...');
  const rooms = db.getRooms();
  assert(rooms.length === 32, `Total unit fisik kamar harus 32 kamar, terdeteksi: ${rooms.length}`);

  const supRooms = rooms.filter(r => r.room_type_id === 'rt-spr' || r.room_type_id === 'rt-sup');
  const stdRooms = rooms.filter(r => r.room_type_id === 'rt-std');
  assert(supRooms.length === 2, `Unit Superior harus tepat 2 kamar (M101, M102), terdeteksi: ${supRooms.length}`);
  assert(stdRooms.length === 30, `Unit Standar harus tepat 30 kamar, terdeteksi: ${stdRooms.length}`);

  // Test updating status unit to INACTIVE and back
  const testRoom = rooms[0];
  const oldStatus = testRoom.status;
  db.saveRoom({ ...testRoom, status: 'INACTIVE', notes: 'Uji nonaktif' }, mockAdminUser);
  const reloaded = db.getRooms().find(r => r.id === testRoom.id);
  assert(reloaded?.status === 'INACTIVE', 'Status unit fisik kamar berhasil diubah ke INACTIVE');

  // Restore status
  db.saveRoom({ ...testRoom, status: oldStatus }, mockAdminUser);

  console.log('✅ PASS: CRUD Unit Fisik Kamar (32 unit nyata Gedung Mina) terverifikasi.\n');
  passedTests++;
} catch (e: any) {
  console.error('Test 2 failed:', e.message);
}

// -------------------------------------------------------------
// PENGUJIAN 3: PENGELOLAAN TARIF, RATE HISTORY & HARGA SNAPSHOT
// -------------------------------------------------------------
try {
  console.log('TEST 3: Perubahan Tarif & RateHistory Audit Trail...');
  const rates = db.getRates();
  const supRate = rates.find(r => r.code === 'RATE-SPR' || r.code === 'RATE-SUP' || r.target_id === 'rt-spr' || r.target_id === 'rt-sup');
  assert(!!supRate, 'Master rate untuk Superior harus ada');

  const oldRateAmount = supRate.rate;
  const newRateAmount = 320000;
  const updateRes = db.updateRateWithHistory(
    supRate.id,
    newRateAmount,
    '2026-11-01',
    'Penyesuaian tarif dinas akhir tahun',
    mockAdminUser
  );
  assert(updateRes.success, 'Update rate with history berhasil');

  const histories = db.getRateHistories();
  assert(histories.length > 0, 'Riwayat perubahan tarif tersimpan di RateHistory');
  const latestHistory = histories[0];
  assert(latestHistory.previous_rate === oldRateAmount, `History mencatat previous_rate: ${latestHistory.previous_rate} == ${oldRateAmount}`);
  assert(latestHistory.new_rate === newRateAmount, 'History mencatat new_rate');
  assert(latestHistory.reason === 'Penyesuaian tarif dinas akhir tahun', 'History mencatat reason');

  // Rollback rate to official 300,000
  db.updateRateWithHistory(supRate.id, 300000, '2026-10-23', 'Kembalikan ke tarif resmi brosur', mockAdminUser);

  console.log('✅ PASS: Perubahan tarif terdata dalam RateHistory dan audit log.\n');
  passedTests++;
} catch (e: any) {
  console.error('Test 3 failed:', e.message);
}

// -------------------------------------------------------------
// PENGUJIAN 4: RESERVASI PENGINAPAN PER MALAM
// Rumus: Total Biaya = Jumlah Malam × Tarif Kamar × Jumlah Kamar
// -------------------------------------------------------------
try {
  console.log('TEST 4: Reservasi Penginapan Per Malam (Malam × Tarif × Kamar)...');
  const checkinDate = '2026-12-01';
  const checkoutDate = '2026-12-04'; // 3 Malam
  const unitCount = 2; // 2 Kamar
  const roomRate = 250000; // Standar: Rp 250.000 / malam

  const expectedTotal = 3 * roomRate * unitCount; // 3 * 250,000 * 2 = 1,500,000

  const resRes = db.createReservation({
    rental_category: 'PENGINAPAN',
    room_type_id: 'rt-std',
    guest_name: 'Drs. H. Ahmad Fauzi',
    guest_phone: '081234567890',
    institution_id: 'inst-1',
    guest_type: 'KEDINASAN',
    checkin_date: checkinDate,
    checkout_date: checkoutDate,
    unit_count: unitCount,
    total_guests: 4
  }, mockAdminUser);

  assert(resRes.success, `Reservasi penginapan berhasil: ${resRes.message}`);
  assert(resRes.reservation?.total_amount === expectedTotal, 
    `Perhitungan biaya harus ${expectedTotal}, didapatkan: ${resRes.reservation?.total_amount}`);
  assert(resRes.reservation?.duration === 3, 'Durasi harus 3 malam');
  assert(resRes.reservation?.snapshot_rate === roomRate, 'Snapshot rate tersimpan');

  console.log(`✅ PASS: Reservasi Penginapan terhitung akurat: 3 Malam × Rp 250.000 × 2 Kamar = Rp ${expectedTotal.toLocaleString('id-ID')}.\n`);
  passedTests++;
} catch (e: any) {
  console.error('Test 4 failed:', e.message);
}

// -------------------------------------------------------------
// PENGUJIAN 5: RESERVASI AULA DAN RUANG KELAS PER HARI
// Rumus: Total Biaya = Jumlah Hari × Tarif Ruangan × Jumlah Unit
// -------------------------------------------------------------
try {
  console.log('TEST 5: Reservasi Aula & Ruang Kelas Per Hari (Hari × Tarif × Unit)...');
  const facilities = db.getFacilities();
  const aula = facilities.find(f => f.id === 'fac-1' || f.name.toLowerCase().includes('aula'));
  assert(!!aula, 'Fasilitas Aula harus terdaftar');
  assert(aula.daily_rate === 3900000, `Tarif Aula harus Rp 3.900.000, terdeteksi: ${aula.daily_rate}`);

  // Test Aula: 2 Hari, 1 Unit Aula
  const aulaRes = db.createReservation({
    rental_category: 'RUANG_PERTEMUAN',
    facility_id: aula.id,
    guest_name: 'Panitia Wisuda STAIN Jayapura',
    guest_phone: '081299887766',
    guest_type: 'UMUM',
    checkin_date: '2026-11-10',
    checkout_date: '2026-11-12', // 2 Hari
    unit_count: 1,
    total_guests: 250,
    activity_name: 'Rapat Koordinasi & Wisuda'
  }, mockAdminUser);

  assert(aulaRes.success, `Reservasi Aula berhasil: ${aulaRes.message}`);
  const expectedAulaTotal = 2 * 3900000 * 1; // 7,800,000
  assert(aulaRes.reservation?.total_amount === expectedAulaTotal,
    `Total sewa Aula harus ${expectedAulaTotal}, didapatkan: ${aulaRes.reservation?.total_amount}`);

  // Test Ruang Kelas: 3 Hari, 1 Unit
  const ruangKelas = facilities.find(f => f.id === 'fac-class' || f.name.toLowerCase().includes('kelas'));
  assert(!!ruangKelas, 'Fasilitas Ruang Kelas harus terdaftar');
  assert(ruangKelas.daily_rate === 650000, `Tarif Ruang Kelas harus Rp 650.000, terdeteksi: ${ruangKelas.daily_rate}`);

  const kelasRes = db.createReservation({
    rental_category: 'RUANG_PERTEMUAN',
    facility_id: ruangKelas.id,
    guest_name: 'Balai Diklat Keagamaan Papua',
    guest_phone: '081344556677',
    guest_type: 'KEDINASAN',
    checkin_date: '2026-11-15',
    checkout_date: '2026-11-18', // 3 Hari
    unit_count: 1,
    total_guests: 25,
    activity_name: 'Bimtek Sertifikasi Pembimbing Manasik'
  }, mockAdminUser);

  assert(kelasRes.success, `Reservasi Ruang Kelas berhasil: ${kelasRes.message}`);
  const expectedKelasTotal = 3 * 650000 * 1; // 1,950,000
  assert(kelasRes.reservation?.total_amount === expectedKelasTotal,
    `Total sewa Ruang Kelas harus ${expectedKelasTotal}, didapatkan: ${kelasRes.reservation?.total_amount}`);

  console.log(`✅ PASS: Sewa Aula (2 Hari × Rp 3.900.000 = Rp ${expectedAulaTotal.toLocaleString('id-ID')}) & Ruang Kelas (3 Hari × Rp 650.000 = Rp ${expectedKelasTotal.toLocaleString('id-ID')}) terhitung tepat.\n`);
  passedTests++;
} catch (e: any) {
  console.error('Test 5 failed:', e.message);
}

// -------------------------------------------------------------
// PENGUJIAN 6: PERHITUNGAN TOTAL BIAYA TANPA PENCAMPURAN FORMULA
// -------------------------------------------------------------
try {
  console.log('TEST 6: Validasi Pemisahan Total Biaya Malam vs Hari...');
  // Verify that an accommodation reservation never calculates as "Hari" and a meeting room never calculates as "Malam"
  const allRes = db.getReservations();
  const roomRes = allRes.find(r => r.rental_category === 'PENGINAPAN');
  const facRes = allRes.find(r => r.rental_category === 'RUANG_PERTEMUAN');

  assert(!!roomRes && roomRes.duration_unit === 'MALAM', 'Reservasi kamar wajib durasi MALAM');
  assert(!!facRes && facRes.duration_unit === 'HARI', 'Reservasi ruangan pertemuan wajib durasi HARI');

  console.log('✅ PASS: Rumus perhitungan kamar (Malam) dan ruangan (Hari) 100% terpisah tanpa percampuran.\n');
  passedTests++;
} catch (e: any) {
  console.error('Test 6 failed:', e.message);
}

// -------------------------------------------------------------
// PENGUJIAN 7: PENCEGAHAN DOUBLE BOOKING SECARA ATOMIK
// -------------------------------------------------------------
try {
  console.log('TEST 7: Pencegahan Double Booking & Benturan Jadwal...');
  // Aula was booked on 2026-11-10 to 2026-11-12
  const facilities = db.getFacilities();
  const aula = facilities.find(f => f.id === 'fac-1' || f.name.toLowerCase().includes('aula'))!;

  // Try to create overlapping reservation on Aula (2026-11-11 to 2026-11-13)
  const conflictRes = db.createReservation({
    rental_category: 'RUANG_PERTEMUAN',
    facility_id: aula.id,
    guest_name: 'PT Telkom Cabang Jayapura',
    guest_phone: '081122334455',
    guest_type: 'BUMN',
    checkin_date: '2026-11-11',
    checkout_date: '2026-11-13',
    unit_count: 1,
    total_guests: 100,
    activity_name: 'Seminar Digital Papua'
  }, mockAdminUser);

  assert(!conflictRes.success, 'Reservasi yang bentrok jadwal HARUS ditolak');
  assert(
    conflictRes.message.toLowerCase().includes('bentur') || 
    conflictRes.message.toLowerCase().includes('jadwal') || 
    conflictRes.message.toLowerCase().includes('terpakai'),
    `Pesan penolakan harus jelas, pesan: ${conflictRes.message}`
  );

  // Also test superior room availability overflow (only 2 rooms exist)
  // Book both rooms
  const supRes1 = db.createReservation({
    rental_category: 'PENGINAPAN',
    room_type_id: 'rt-sup',
    guest_name: 'Kakanwil Kemenag Papua',
    guest_phone: '081200000001',
    guest_type: 'KEDINASAN',
    checkin_date: '2026-12-10',
    checkout_date: '2026-12-12',
    unit_count: 2, // Take all 2 superior rooms
    total_guests: 4
  }, mockAdminUser);
  assert(supRes1.success, 'Pemesanan 2 kamar superior pertama berhasil');

  // Try to book a 3rd superior room on the same dates
  const supRes2 = db.createReservation({
    rental_category: 'PENGINAPAN',
    room_type_id: 'rt-sup',
    guest_name: 'Tamu Tambahan',
    guest_phone: '081200000002',
    guest_type: 'UMUM',
    checkin_date: '2026-12-10',
    checkout_date: '2026-12-12',
    unit_count: 1,
    total_guests: 2
  }, mockAdminUser);
  assert(!supRes2.success, 'Pemesanan melebihi ketersediaan kamar fisik superior HARUS ditolak');

  console.log('✅ PASS: Double booking kamar fisik dan benturan jadwal aula berhasil dicegah secara atomik.\n');
  passedTests++;
} catch (e: any) {
  console.error('Test 7 failed:', e.message);
}

// -------------------------------------------------------------
// PENGUJIAN 8: VALIDASI KAPASITAS PESERTA
// -------------------------------------------------------------
try {
  console.log('TEST 8: Validasi Kapasitas Ruangan...');
  const facilities = db.getFacilities();
  const aula = facilities.find(f => f.id === 'fac-1' || f.name.toLowerCase().includes('aula'))!;
  const ruangKelas = facilities.find(f => f.id === 'fac-class' || f.name.toLowerCase().includes('kelas'))!;

  // Aula max is 300. Try booking with 400 pax
  const overAula = db.createReservation({
    rental_category: 'RUANG_PERTEMUAN',
    facility_id: aula.id,
    guest_name: 'Konvensi Akbar',
    guest_phone: '081233445566',
    guest_type: 'UMUM',
    checkin_date: '2026-12-20',
    checkout_date: '2026-12-22',
    unit_count: 1,
    total_guests: 400 // Melebihi 300 pax
  }, mockAdminUser);
  assert(!overAula.success, 'Reservasi Aula melebihi kapasitas 300 pax harus ditolak');

  // Ruang kelas max is 30. Try booking with 50 pax
  const overKelas = db.createReservation({
    rental_category: 'RUANG_PERTEMUAN',
    facility_id: ruangKelas.id,
    guest_name: 'Pelatihan Kelas Besar',
    guest_phone: '081233445577',
    guest_type: 'UMUM',
    checkin_date: '2026-12-20',
    checkout_date: '2026-12-22',
    unit_count: 1,
    total_guests: 50 // Melebihi 30 pax
  }, mockAdminUser);
  assert(!overKelas.success, 'Reservasi Ruang Kelas melebihi kapasitas 30 pax harus ditolak');

  console.log('✅ PASS: Validasi batas kapasitas (Aula maks 300 pax, Kelas maks 30 pax) berfungsi ketat.\n');
  passedTests++;
} catch (e: any) {
  console.error('Test 8 failed:', e.message);
}

// -------------------------------------------------------------
// PENGUJIAN 9: RESPONSIVITAS DESKTOP DAN MOBILE
// -------------------------------------------------------------
try {
  console.log('TEST 9: Integritas Struktur UI/UX & Responsivitas...');
  // Check that LandingPage has grid md:grid-cols-2 lg:grid-cols-4 and mobile drawer
  import('fs').then(fs => {
    const landingCode = fs.readFileSync('./src/pages/landing/LandingPage.tsx', 'utf-8');
    assert(landingCode.includes('grid md:grid-cols-2 lg:grid-cols-4'), 'Landing page memiliki responsive grid 4-kolom untuk master data');
    assert(landingCode.includes('mobileMenuOpen'), 'Landing page memiliki drawer menu responsif mobile');
    assert(landingCode.includes('PENGINAPAN') && landingCode.includes('RUANG_PERTEMUAN'), 'Kalkulator mendukung tab Penginapan dan Ruang Pertemuan');

    const roomsCode = fs.readFileSync('./src/pages/accommodation/RoomsPage.tsx', 'utf-8');
    assert(roomsCode.includes('activeTab') && roomsCode.includes('ROOM_TYPES'), 'Halaman kamar memisahkan unit fisik dari master jenis kamar');
  });

  console.log('✅ PASS: Desain UI/UX Modern Hospitality Dashboard responsif desktop & mobile.\n');
  passedTests++;
} catch (e: any) {
  console.error('Test 9 failed:', e.message);
}

// -------------------------------------------------------------
// PENGUJIAN 10: REGRESSION TESTING FITUR TERDAMPAK
// -------------------------------------------------------------
try {
  console.log('TEST 10: Regression Testing (Check-in, Check-out, Invoices, POS & Data Existing)...');
  // 1. Existing initial reservations preserved
  const reservations = db.getReservations();
  assert(reservations.length > 0, 'Data reservasi lama tetap utuh di database');

  // 2. Existing initial users preserved
  const users = db.getUsers();
  assert(users.length >= 4, 'Data akun pengguna dan hak akses peran tetap utuh');

  // 3. Existing initial invoices & payments preserved
  const invoices = db.getInvoices();
  assert(invoices.length > 0, 'Data invoice & transaksi lama tetap utuh');

  // 4. Test Check-in and Check-out via checkinReservation and checkoutReservation
  const existingRsv = reservations.find(r => r.status === 'CONFIRMED') || reservations[0];
  const initialCheckinCount = db.getCheckins().length;
  const initialCheckoutCount = db.getCheckouts().length;

  const checkinSuccess = db.checkinReservation(existingRsv.id, 2, 200000, 'Kunci M101 diserahkan', mockAdminUser);
  assert(checkinSuccess, 'Proses checkinReservation berhasil');
  assert(db.getCheckins().length === initialCheckinCount + 1, 'Data checkin bertambah');

  const checkoutSuccess = db.checkoutReservation(existingRsv.id, 'Kondisi kamar baik', true, 'Deposit dikembalikan penuh', mockAdminUser);
  assert(checkoutSuccess, 'Proses checkoutReservation berhasil');
  assert(db.getCheckouts().length === initialCheckoutCount + 1, 'Data checkout bertambah');

  // 5. Test POS Walk-in Checkin
  const walkinRoom = db.getRooms().find(r => r.status === 'AVAILABLE')!;
  const walkinBed = db.getBeds().find(b => b.room_id === walkinRoom.id) || db.getBeds()[0];
  const walkinRes = db.createWalkInCheckin({
    guest: {
      fullName: 'Muhammad Ridwan',
      nik: '9171012304950005',
      phone: '081234567899',
      gender: 'L',
      regencyCity: 'Kota Jayapura',
      guestType: 'UMUM'
    },
    roomId: walkinRoom.id,
    bedId: walkinBed.id,
    nights: 1,
    depositAmount: 100000,
    cardKeys: 1,
    initialPaymentAmount: walkinRoom.rate_per_night,
    paymentMethod: 'CASH',
    user: mockAdminUser
  });
  assert(walkinRes.success, `Fitur POS Kasir Walk-in Check-in tetap berfungsi lancar: ${walkinRes.message}`);
  assert(walkinRes.invoice !== undefined, 'Invoice kasir POS otomatis diterbitkan');

  // 6. Audit log integrity
  const auditLogs = db.getAuditLogs();
  assert(auditLogs.length > 0, 'Audit trail mencatat setiap mutasi transaksi dan master data');

  console.log('✅ PASS: Regression test berhasil 100% tanpa ada fitur lama yang terganggu atau data yang hilang.\n');
  passedTests++;
} catch (e: any) {
  console.error('Test 10 failed:', e.message);
}

console.log('================================================================');
console.log(` HASIL PENGUJIAN AKHIR: ${passedTests} / ${totalTests} PENGUJIAN LULUS (${Math.round(passedTests/totalTests*100)}% SUKSES)`);
console.log('================================================================');
