// Mock localStorage for Node.js test environment
const storageMap = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (key: string) => storageMap.get(key) || null,
  setItem: (key: string, val: string) => { storageMap.set(key, String(val)); },
  removeItem: (key: string) => { storageMap.delete(key); },
  clear: () => { storageMap.clear(); },
  key: (idx: number) => Array.from(storageMap.keys())[idx] || null,
  get length() { return storageMap.size; }
};

const { db } = await import('./src/db/database.ts');

console.log('=== TEST SUITE: ONLINE PUBLIC SELF-BOOKING (SIMAHA PAPUA) ===\n');

// 1. Test Room Booking (Penginapan Kamar Superior)
console.log('1. Testing Public Room Booking (Superior @ Rp 300.000)...');
const guestRoom = db.saveGuest({
  full_name: 'Dr. Zulkifli Harahap, M.Pd',
  nik: '9171011508850005',
  phone: '081248998877',
  guest_type: 'KEDINASAN',
  regency_city: 'Kota Jayapura',
  province: 'Papua',
  address: 'Kotaraja, Jayapura',
});

const roomBooking = db.createReservation({
  reservation_type: 'INDIVIDUAL',
  rental_category: 'PENGINAPAN',
  room_type_id: 'rt-sup',
  unit_count: 1,
  duration: 2,
  duration_unit: 'MALAM',
  checkin_date: '2026-11-10',
  checkout_date: '2026-11-12',
  total_guests: 2,
  guest_id: guestRoom.id,
  guest_name: guestRoom.full_name,
  notes: 'Tamu Kedinasan Balai Diklat Keagamaan Papua'
});

console.log('Result Room Booking:', roomBooking.success ? 'SUCCESS' : 'FAILED');
console.log('Message:', roomBooking.message);
console.log('Reservation No:', roomBooking.reservation?.reservation_no);
console.log('SIMPONI Billing Code:', roomBooking.reservation?.simponi_billing_code);
console.log('Created By:', roomBooking.reservation?.created_by);
console.log('Total Amount:', roomBooking.reservation?.total_amount);

if (!roomBooking.success || !roomBooking.reservation?.simponi_billing_code) {
  throw new Error('Test 1 failed: Room booking failed or missing billing code');
}

// 2. Test Conflict Prevention on Double Booking
console.log('\n2. Testing Double Booking Conflict Detection on Room...');
const conflictBooking = db.createReservation({
  reservation_type: 'INDIVIDUAL',
  rental_category: 'PENGINAPAN',
  room_type_id: 'rt-sup',
  unit_count: 2, // Superior only has 2 units, 1 is booked above, so requesting 2 should fail
  duration: 2,
  duration_unit: 'MALAM',
  checkin_date: '2026-11-10',
  checkout_date: '2026-11-12',
  total_guests: 4,
  guest_name: 'Tamu Uji Coba'
});

console.log('Conflict Booking Allowed?:', conflictBooking.success);
console.log('Conflict Message:', conflictBooking.message);
if (conflictBooking.success) {
  throw new Error('Test 2 failed: Double booking was allowed when units were insufficient');
}

// 3. Test Facility Booking (Ruang Pertemuan Aula @ Rp 3.900.000)
console.log('\n3. Testing Public Facility Booking (Aula Utama MICE)...');
const facBooking = db.createReservation({
  reservation_type: 'INSTANSI',
  rental_category: 'RUANG_PERTEMUAN',
  facility_id: 'fac-1',
  unit_count: 1,
  duration: 1,
  duration_unit: 'HARI',
  checkin_date: '2026-11-20',
  checkout_date: '2026-11-20',
  total_guests: 250,
  guest_name: 'Dinas Kebudayaan Papua',
  notes: 'Seminar Budaya & Kerukunan Umat Beragama'
});

console.log('Result Facility Booking:', facBooking.success ? 'SUCCESS' : 'FAILED');
console.log('Message:', facBooking.message);
console.log('Reservation No:', facBooking.reservation?.reservation_no);
console.log('SIMPONI Billing Code:', facBooking.reservation?.simponi_billing_code);
console.log('Total Amount:', facBooking.reservation?.total_amount);

if (!facBooking.success || facBooking.reservation?.total_amount !== 3900000) {
  throw new Error('Test 3 failed: Facility booking failed or incorrect rate');
}

// 4. Test Facility Capacity Exceeded
console.log('\n4. Testing Facility Capacity Validation (Aula max 300 pax)...');
const overCapacityBooking = db.createReservation({
  reservation_type: 'INSTANSI',
  rental_category: 'RUANG_PERTEMUAN',
  facility_id: 'fac-1',
  unit_count: 1,
  duration: 1,
  duration_unit: 'HARI',
  checkin_date: '2026-11-25',
  checkout_date: '2026-11-25',
  total_guests: 500, // Exceeds 300
  guest_name: 'Rombongan Terlalu Besar'
});

console.log('Over-capacity Booking Allowed?:', overCapacityBooking.success);
console.log('Message:', overCapacityBooking.message);
if (overCapacityBooking.success) {
  throw new Error('Test 4 failed: Over capacity booking was allowed');
}

// 5. Test Lookup via Kiosk
console.log('\n5. Testing Munakosah Kiosk Lookup with Phone / Reservation No...');
const lookupByPhone = db.lookupAccommodation('081248998877');
console.log('Lookup by phone found?:', lookupByPhone.found);
console.log('Matched Guest:', lookupByPhone.guest?.full_name);
console.log('Matched Reservation:', lookupByPhone.reservation?.reservation_no);

if (!lookupByPhone.found) {
  throw new Error('Test 5 failed: Could not lookup booking by phone number');
}

console.log('\n>>> ALL 5/5 PUBLIC SELF-BOOKING TESTS PASSED PERFECTLY! <<<');
