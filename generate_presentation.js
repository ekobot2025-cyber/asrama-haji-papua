import pptxgen from 'pptxgenjs';

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.author = 'Kementerian Haji dan Umrah RI - UPT Asrama Haji Transit Jayapura';
pres.title = 'Sosialisasi Sistem Informasi Manajemen Asrama Haji (SIMAHA) Papua';

const SHAPES = pres.shapes;

// Color Palette
const C_DARK = '1A1410';       // Dark Brown / Black
const C_GOLD = 'C9A961';       // Metallic Gold
const C_GOLD_DARK = '8A6D2B';  // Deep Gold
const C_CREAM = 'FBF8EE';      // Warm Cream
const C_WHITE = 'FFFFFF';      // Pure White
const C_GRAY_TEXT = '555555';  // Charcoal Gray
const C_BORDER = 'E8DFC8';     // Muted Sand
const C_GREEN = '15803D';      // Emerald
const C_BLUE = '1D4ED8';       // Blue

// Helper function for common header on content slides
function addSlideHeader(slide, title, category = 'SISTEM INFORMASI MANAJEMEN ASRAMA HAJI (SIMAHA) PAPUA') {
  // Top Banner Pill
  slide.addShape(SHAPES.ROUNDED_RECTANGLE, {
    x: 0.8, y: 0.4, w: 5.5, h: 0.35,
    fill: { color: C_CREAM },
    line: { color: C_BORDER, width: 1 },
    rectRadius: 0.1
  });
  slide.addText(category, {
    x: 0.9, y: 0.4, w: 5.3, h: 0.35,
    fontSize: 9, bold: true, color: C_GOLD_DARK,
    valign: 'middle'
  });

  // Slide Title
  slide.addText(title, {
    x: 0.8, y: 0.8, w: 11.5, h: 0.65,
    fontSize: 22, bold: true, color: C_DARK,
    valign: 'top'
  });

  // Thin separator
  slide.addShape(SHAPES.LINE, {
    x: 0.8, y: 1.5, w: 11.7, h: 0,
    line: { color: C_BORDER, width: 1.5 }
  });

  // Bottom Footer
  slide.addText('UPT Asrama Haji Transit Jayapura • Provinsi Papua | Kementerian Haji dan Umrah RI', {
    x: 0.8, y: 7.0, w: 9.0, h: 0.3,
    fontSize: 8.5, color: '888888'
  });
  slide.addText('SIMAHA PAPUA 2026', {
    x: 10.5, y: 7.0, w: 2.0, h: 0.3,
    fontSize: 8.5, bold: true, color: C_GOLD_DARK, align: 'right'
  });
}

// =========================================================================
// SLIDE 1: COVER / TITLE SLIDE
// =========================================================================
const s1 = pres.addSlide();
s1.background = { color: C_DARK };

// Gold decorative line
s1.addShape(SHAPES.RECTANGLE, {
  x: 0.8, y: 1.2, w: 0.15, h: 4.8,
  fill: { color: C_GOLD }
});

s1.addShape(SHAPES.ROUNDED_RECTANGLE, {
  x: 1.2, y: 1.2, w: 4.2, h: 0.4,
  fill: { color: '2A2018' },
  line: { color: C_GOLD, width: 1 },
  rectRadius: 0.1
});
s1.addText('KEMENTERIAN HAJI DAN UMRAH RI', {
  x: 1.3, y: 1.2, w: 4.0, h: 0.4,
  fontSize: 10, bold: true, color: C_GOLD, valign: 'middle'
});

s1.addText('SOSIALISASI SISTEM INFORMASI\nMANAJEMEN ASRAMA HAJI (SIMAHA)', {
  x: 1.2, y: 1.8, w: 11.0, h: 1.8,
  fontSize: 32, bold: true, color: C_WHITE, fontFace: 'Calibri'
});

s1.addText('Transformasi Digital Tata Kelola Akomodasi, Layanan Jemaah Haji Papua,\nSewa Gedung MICE, dan Transparansi Penyetoran PNBP Terintegrasi', {
  x: 1.2, y: 3.7, w: 11.0, h: 0.8,
  fontSize: 14, color: 'D5CEBF'
});

// Card: UPT Info
s1.addShape(SHAPES.ROUNDED_RECTANGLE, {
  x: 1.2, y: 4.8, w: 10.8, h: 1.4,
  fill: { color: '241C15' },
  line: { color: '3D2F22', width: 1 },
  rectRadius: 0.15
});

s1.addText([
  { text: 'UPT Asrama Haji Transit Jayapura — Provinsi Papua\n', options: { bold: true, color: C_WHITE, fontSize: 12 } },
  { text: 'Gedung Mina (32 Kamar) • Aula Utama (300 Pax) • Ruang Kelas (30 Pax) • Front Desk POS & SIMPONI Billing', options: { color: 'B0A894', fontSize: 10 } }
], {
  x: 1.5, y: 4.95, w: 10.2, h: 1.1, valign: 'middle'
});


// =========================================================================
// SLIDE 2: LATAR BELAKANG & URGENSI DIGITALISASI
// =========================================================================
const s2 = pres.addSlide();
s2.background = { color: 'F8F7F2' };
addSlideHeader(s2, 'Latar Belakang & Urgensi Implementasi SIMAHA', 'LANDASAN & LATAR BELAKANG');

const s2Cards = [
  {
    title: '1. Tantangan Pencatatan Manual',
    desc: 'Sebelumnya pencatatan sewa kamar dan peminjaman aula dilakukan secara parsial/buku register manual yang berisiko terjadinya benturan jadwal dan lambatnya rekonsiliasi.',
    tag: 'Efisiensi Operasional',
    tagColor: 'C2410C'
  },
  {
    title: '2. Akuntabilitas & Transparansi PNBP',
    desc: 'Menegakkan PP No. 59 Tahun 2020 tentang tarif sewa aset negara. Seluruh penerimaan terhubung dengan kode billing SIMPONI Kementerian Keuangan untuk setoran langsung ke Kas Negara.',
    tag: 'Kepatuhan Regulasi',
    tagColor: C_GOLD_DARK
  },
  {
    title: '3. Standardisasi Layanan Jemaah',
    desc: 'Menyediakan Surat Perintah Masuk Asrama (SPMA) digital, nomor kasur otomatis, bagasi barcode, dan integrasi pemeriksaan kesehatan untuk kelancaran kloter Embarkasi Antara.',
    tag: 'Pelayanan Prima',
    tagColor: C_GREEN
  }
];

s2Cards.forEach((c, idx) => {
  const xPos = 0.8 + idx * 4.0;
  s2.addShape(SHAPES.ROUNDED_RECTANGLE, {
    x: xPos, y: 1.8, w: 3.7, h: 4.8,
    fill: { color: C_WHITE },
    line: { color: C_BORDER, width: 1.2 },
    rectRadius: 0.15
  });

  // Tag Pill
  s2.addShape(SHAPES.ROUNDED_RECTANGLE, {
    x: xPos + 0.3, y: 2.1, w: 2.5, h: 0.35,
    fill: { color: C_CREAM },
    line: { color: C_BORDER, width: 1 },
    rectRadius: 0.08
  });
  s2.addText(c.tag, {
    x: xPos + 0.3, y: 2.1, w: 2.5, h: 0.35,
    fontSize: 9, bold: true, color: c.tagColor, align: 'center', valign: 'middle'
  });

  s2.addText(c.title, {
    x: xPos + 0.3, y: 2.65, w: 3.1, h: 0.7,
    fontSize: 14, bold: true, color: C_DARK
  });

  s2.addText(c.desc, {
    x: xPos + 0.3, y: 3.45, w: 3.1, h: 2.9,
    fontSize: 11, color: C_GRAY_TEXT, lineSpacing: 18
  });
});


// =========================================================================
// SLIDE 3: ARSITEKTUR EKOSISTEM SIMAHA
// =========================================================================
const s3 = pres.addSlide();
s3.background = { color: 'F8F7F2' };
addSlideHeader(s3, 'Arsitektur Ekosistem & Modul Terpadu SIMAHA', 'ARSITEKTUR SISTEM');

const modules = [
  { num: '01', name: 'Portal Publik & Kalkulator', role: 'Katalog kamar & aula, simulasi PNBP transparan, verifikasi SPMA jemaah secara mandiri.' },
  { num: '02', name: 'Front Desk & Reservasi', role: 'Manajemen pemesanan kamar & ruang pertemuan dengan proteksi anti-double booking atomik.' },
  { num: '03', name: 'Kasir POS Cepat 1-Layar', role: 'Check-in walk-in cepat, pencatatan deposit, cetak struk thermal 80mm/58mm, dan invoice.' },
  { num: '04', name: 'Room Status & Housekeeping', role: 'Papan kontrol kondisi kamar (Ready, Dirty, Cleaning, Inspected, Inactive) realtime.' },
  { num: '05', name: 'Master Tarif & Rate History', role: 'Penyesuaian tarif dinamis ber-SK dengan audit log dan penguncian harga historis (Snapshot Rate).' },
  { num: '06', name: 'Layanan Embarkasi Antara', role: 'Workflow terpadu SPMA, manifes kloter 29 Kab/Kota Papua, dan barcode label koper jemaah.' }
];

modules.forEach((m, idx) => {
  const row = Math.floor(idx / 3);
  const col = idx % 3;
  const x = 0.8 + col * 4.0;
  const y = 1.8 + row * 2.45;

  s3.addShape(SHAPES.ROUNDED_RECTANGLE, {
    x: x, y: y, w: 3.7, h: 2.2,
    fill: { color: C_WHITE },
    line: { color: C_BORDER, width: 1 },
    rectRadius: 0.12
  });

  s3.addShape(SHAPES.ROUNDED_RECTANGLE, {
    x: x + 0.25, y: y + 0.25, w: 0.6, h: 0.45,
    fill: { color: C_GOLD },
    rectRadius: 0.08
  });
  s3.addText(m.num, {
    x: x + 0.25, y: y + 0.25, w: 0.6, h: 0.45,
    fontSize: 11, bold: true, color: C_DARK, align: 'center', valign: 'middle'
  });

  s3.addText(m.name, {
    x: x + 0.95, y: y + 0.25, w: 2.5, h: 0.45,
    fontSize: 12, bold: true, color: C_DARK, valign: 'middle'
  });

  s3.addText(m.role, {
    x: x + 0.25, y: y + 0.8, w: 3.2, h: 1.25,
    fontSize: 10, color: C_GRAY_TEXT, lineSpacing: 16
  });
});


// =========================================================================
// SLIDE 4: MASTER DATA UNIT SEWA SESUAI BROSUR RESMI
// =========================================================================
const s4 = pres.addSlide();
s4.background = { color: 'F8F7F2' };
addSlideHeader(s4, 'Standardisasi Master Data Unit Sewa & Tarif Brosur Resmi', 'MASTER DATA UNIT SEWA');

const units = [
  {
    name: 'KAMAR SUPERIOR',
    category: 'Penginapan (Per Malam)',
    rate: 'Rp 300.000',
    unit: '/ malam',
    cap: '2 Orang (Gedung Mina)',
    qty: '2 Unit (M101 & M102)',
    amenities: 'Double Bed, AC, Meja, Lemari, Closet Duduk, Smart TV LED, Water Heater, WiFi'
  },
  {
    name: 'KAMAR STANDAR',
    category: 'Penginapan (Per Malam)',
    rate: 'Rp 250.000',
    unit: '/ malam',
    cap: '2 Orang (Gedung Mina)',
    qty: '30 Unit (M103–M116 & M201–M216)',
    amenities: '2 Single Bed, AC, Meja, Lemari, Closet Duduk, Smart TV LED, WiFi'
  },
  {
    name: 'AULA UTAMA',
    category: 'Ruang Pertemuan (Per Hari)',
    rate: 'Rp 3.900.000',
    unit: '/ hari',
    cap: 'Maksimal 300 Orang',
    qty: 'Gedung Serbaguna MICE',
    amenities: 'Sound System Wireless, Infocus / Proyektor, AC, Kursi Futura, Panggung Utama'
  },
  {
    name: 'RUANG KELAS',
    category: 'Ruang Pertemuan (Per Hari)',
    rate: 'Rp 650.000',
    unit: '/ hari',
    cap: 'Maksimal 30 Orang',
    qty: 'Gedung Diklat & Bimbingan',
    amenities: 'Sound System, Infocus / Proyektor, AC, Kursi Futura Meja Diklat'
  }
];

units.forEach((u, idx) => {
  const x = 0.8 + idx * 3.0;

  s4.addShape(SHAPES.ROUNDED_RECTANGLE, {
    x: x, y: 1.8, w: 2.8, h: 4.8,
    fill: { color: C_WHITE },
    line: { color: C_BORDER, width: 1.2 },
    rectRadius: 0.15
  });

  // Header Box
  s4.addShape(SHAPES.RECTANGLE, {
    x: x, y: 1.8, w: 2.8, h: 1.0,
    fill: { color: idx < 2 ? C_DARK : '2A2018' }
  });
  s4.addText(u.name, {
    x: x + 0.15, y: 1.9, w: 2.5, h: 0.4,
    fontSize: 12, bold: true, color: C_GOLD, align: 'center'
  });
  s4.addText(u.category, {
    x: x + 0.15, y: 2.3, w: 2.5, h: 0.35,
    fontSize: 8.5, color: C_WHITE, align: 'center'
  });

  // Price Display
  s4.addText(u.rate, {
    x: x + 0.15, y: 2.95, w: 2.5, h: 0.45,
    fontSize: 16, bold: true, color: C_GOLD_DARK, align: 'center'
  });
  s4.addText(u.unit, {
    x: x + 0.15, y: 3.35, w: 2.5, h: 0.25,
    fontSize: 9, color: '777777', align: 'center'
  });

  // Info details
  s4.addShape(SHAPES.LINE, {
    x: x + 0.3, y: 3.7, w: 2.2, h: 0,
    line: { color: C_BORDER, width: 1 }
  });

  s4.addText([
    { text: 'Kapasitas:\n', options: { bold: true, color: C_DARK, fontSize: 8.5 } },
    { text: `${u.cap}\n\n`, options: { color: C_GRAY_TEXT, fontSize: 9 } },
    { text: 'Ketersediaan Fisik:\n', options: { bold: true, color: C_DARK, fontSize: 8.5 } },
    { text: `${u.qty}\n\n`, options: { color: C_GRAY_TEXT, fontSize: 9 } },
    { text: 'Fasilitas Terintegrasi:\n', options: { bold: true, color: C_DARK, fontSize: 8.5 } },
    { text: u.amenities, options: { color: C_GRAY_TEXT, fontSize: 8.5 } }
  ], {
    x: x + 0.2, y: 3.8, w: 2.4, h: 2.7, lineSpacing: 14
  });
});


// =========================================================================
// SLIDE 5: PEMISAHAN FORMULA PERHITUNGAN BIAYA
// =========================================================================
const s5 = pres.addSlide();
s5.background = { color: 'F8F7F2' };
addSlideHeader(s5, 'Pemisahan Rumus Baku Perhitungan Biaya Sewa', 'INTEGRITAS FORMULA TARIF');

// Left Box: Penginapan Kamar
s5.addShape(SHAPES.ROUNDED_RECTANGLE, {
  x: 0.8, y: 1.8, w: 5.6, h: 4.8,
  fill: { color: C_WHITE },
  line: { color: C_BORDER, width: 1.2 },
  rectRadius: 0.15
});
s5.addText('A. RESERVASI PENGINAPAN KAMAR', {
  x: 1.1, y: 2.1, w: 5.0, h: 0.4,
  fontSize: 14, bold: true, color: C_DARK
});
s5.addText('Berlaku untuk Kamar Superior & Kamar Standar (Gedung Mina)', {
  x: 1.1, y: 2.5, w: 5.0, h: 0.35,
  fontSize: 9.5, color: C_GOLD_DARK
});

// Formula Box
s5.addShape(SHAPES.ROUNDED_RECTANGLE, {
  x: 1.1, y: 3.0, w: 5.0, h: 0.9,
  fill: { color: C_CREAM },
  line: { color: C_GOLD, width: 1 },
  rectRadius: 0.1
});
s5.addText('Total Biaya = Jumlah Malam × Tarif Kamar × Jumlah Kamar', {
  x: 1.2, y: 3.0, w: 4.8, h: 0.9,
  fontSize: 12, bold: true, color: C_GOLD_DARK, align: 'center', valign: 'middle'
});

s5.addText([
  { text: 'Ketentuan Baku Penginapan:\n', options: { bold: true, fontSize: 10, color: C_DARK } },
  { text: '• Satuan perhitungan wajib menggunakan durasi malam menginap.\n', options: { fontSize: 9.5, color: C_GRAY_TEXT } },
  { text: '• Waktu resmi check-in: 14.00 WIT dan check-out: 12.00 WIT.\n', options: { fontSize: 9.5, color: C_GRAY_TEXT } },
  { text: '• Contoh simulasi: 2 Kamar Standar × 3 Malam × Rp 250.000 = ', options: { fontSize: 9.5, color: C_GRAY_TEXT } },
  { text: 'Rp 1.500.000\n', options: { bold: true, fontSize: 10, color: C_GOLD_DARK } },
  { text: '• Akun PNBP: 425111 (Jasa Penginapan & Aset Asrama Haji).', options: { fontSize: 9.5, color: C_GRAY_TEXT } }
], {
  x: 1.1, y: 4.1, w: 5.0, h: 2.3, lineSpacing: 18
});

// Right Box: Ruang Pertemuan (Aula & Kelas)
s5.addShape(SHAPES.ROUNDED_RECTANGLE, {
  x: 6.8, y: 1.8, w: 5.7, h: 4.8,
  fill: { color: C_WHITE },
  line: { color: C_BORDER, width: 1.2 },
  rectRadius: 0.15
});
s5.addText('B. RESERVASI RUANG PERTEMUAN (MICE)', {
  x: 7.1, y: 2.1, w: 5.1, h: 0.4,
  fontSize: 14, bold: true, color: C_DARK
});
s5.addText('Berlaku untuk Aula Utama (300 Pax) & Ruang Kelas (30 Pax)', {
  x: 7.1, y: 2.5, w: 5.1, h: 0.35,
  fontSize: 9.5, color: C_GOLD_DARK
});

// Formula Box
s5.addShape(SHAPES.ROUNDED_RECTANGLE, {
  x: 7.1, y: 3.0, w: 5.1, h: 0.9,
  fill: { color: C_CREAM },
  line: { color: C_GOLD, width: 1 },
  rectRadius: 0.1
});
s5.addText('Total Biaya = Jumlah Hari × Tarif Ruangan × Jumlah Unit', {
  x: 7.2, y: 3.0, w: 4.9, h: 0.9,
  fontSize: 12, bold: true, color: C_GOLD_DARK, align: 'center', valign: 'middle'
});

s5.addText([
  { text: 'Ketentuan Baku Ruang Pertemuan:\n', options: { bold: true, fontSize: 10, color: C_DARK } },
  { text: '• Satuan perhitungan wajib menggunakan durasi hari kalender sewa.\n', options: { fontSize: 9.5, color: C_GRAY_TEXT } },
  { text: '• Waktu sewa harian: 08.00 s.d 22.00 WIT (Full Day Event).\n', options: { fontSize: 9.5, color: C_GRAY_TEXT } },
  { text: '• Contoh simulasi: 1 Aula Utama × 2 Hari × Rp 3.900.000 = ', options: { fontSize: 9.5, color: C_GRAY_TEXT } },
  { text: 'Rp 7.800.000\n', options: { bold: true, fontSize: 10, color: C_GOLD_DARK } },
  { text: '• Akun PNBP: 425112 (Sewa Fasilitas, Gedung & Bangunan).', options: { fontSize: 9.5, color: C_GRAY_TEXT } }
], {
  x: 7.1, y: 4.1, w: 5.1, h: 2.3, lineSpacing: 18
});


// =========================================================================
// SLIDE 6: PENGELOLAAN TARIF DINAMIS & RATE HISTORY
// =========================================================================
const s6 = pres.addSlide();
s6.background = { color: 'F8F7F2' };
addSlideHeader(s6, 'Pengelolaan Tarif Dinamis, SK Berlaku, & Rate History', 'KEAMANAN & RIWAYAT TARIF');

const s6Items = [
  {
    title: '1. Pembaruan Tarif Tanpa Koding',
    desc: 'Administrator dapat memperbarui tarif resmi kapan saja melalui dashboard tanpa perlu mengubah kode sumber aplikasi atau hardcode frontend.',
    point: 'Fleksibilitas SK Baru'
  },
  {
    title: '2. Tanggal Berlaku Efektif & Alasan',
    desc: 'Setiap kali dilakukan perubahan tarif, administrator diwajibkan menginput tanggal mulai berlaku (effective date) dan nomor SK/alasan penyesuaian tarif.',
    point: 'Legalitas Formal'
  },
  {
    title: '3. Perlindungan Snapshot Rate',
    desc: 'Transaksi atau Surat Pesanan yang telah diterbitkan di masa lampau tetap mengunci harga saat reservasi dibuat. Tidak terjadi perubahan angka tagihan masa lalu.',
    point: 'Integritas Laporan PNBP'
  },
  {
    title: '4. Audit Trail Lengkap (Rate History)',
    desc: 'Seluruh riwayat perubahan tersimpan permanen pada entitas RateHistory, menampilkan tarif sebelum, tarif sesudah, petugas pengubah, dan waktu perubahan.',
    point: 'Kesiapan Audit BPK / Itjen'
  }
];

s6Items.forEach((item, idx) => {
  const row = Math.floor(idx / 2);
  const col = idx % 2;
  const x = 0.8 + col * 6.0;
  const y = 1.8 + row * 2.45;

  s6.addShape(SHAPES.ROUNDED_RECTANGLE, {
    x: x, y: y, w: 5.7, h: 2.2,
    fill: { color: C_WHITE },
    line: { color: C_BORDER, width: 1.2 },
    rectRadius: 0.12
  });

  s6.addShape(SHAPES.ROUNDED_RECTANGLE, {
    x: x + 0.25, y: y + 0.25, w: 2.3, h: 0.32,
    fill: { color: C_CREAM },
    line: { color: C_BORDER, width: 1 },
    rectRadius: 0.08
  });
  s6.addText(item.point, {
    x: x + 0.25, y: y + 0.25, w: 2.3, h: 0.32,
    fontSize: 9, bold: true, color: C_GOLD_DARK, align: 'center', valign: 'middle'
  });

  s6.addText(item.title, {
    x: x + 0.25, y: y + 0.65, w: 5.2, h: 0.45,
    fontSize: 13, bold: true, color: C_DARK
  });

  s6.addText(item.desc, {
    x: x + 0.25, y: y + 1.15, w: 5.2, h: 0.95,
    fontSize: 10, color: C_GRAY_TEXT, lineSpacing: 16
  });
});


// =========================================================================
// SLIDE 7: PENCEGAHAN DOUBLE BOOKING & KASIR POS
// =========================================================================
const s7 = pres.addSlide();
s7.background = { color: 'F8F7F2' };
addSlideHeader(s7, 'Pencegahan Double-Booking & Fitur Front Desk POS', 'KEANDALAN OPERASIONAL');

// Left Box: Anti Double Booking
s7.addShape(SHAPES.ROUNDED_RECTANGLE, {
  x: 0.8, y: 1.8, w: 5.6, h: 4.8,
  fill: { color: C_WHITE },
  line: { color: C_BORDER, width: 1.2 },
  rectRadius: 0.15
});
s7.addText('PROTEKSI ATOMIK DOUBLE BOOKING', {
  x: 1.1, y: 2.1, w: 5.0, h: 0.4,
  fontSize: 13, bold: true, color: C_DARK
});
s7.addText('Validasi Rentang Tanggal & Kapasitas Realtime', {
  x: 1.1, y: 2.45, w: 5.0, h: 0.35,
  fontSize: 9.5, color: C_GOLD_DARK
});

const dblPoints = [
  'Pencegahan Benturan Kamar Fisik: Sistem membatasi kuota kamar riil (2 Superior & 30 Standar Gedung Mina) secara atomik.',
  'Pencegahan Benturan Jadwal Aula: Bila aula telah terpesan pada rentang tanggal X, sistem langsung menolak reservasi baru dengan rincian nama acara bentrok.',
  'Validasi Batas Kapasitas: Reservasi Aula > 300 orang atau Ruang Kelas > 30 orang otomatis dicegah demi keselamatan dan kenyamanan.',
  'Audit Mutasi Transaksi: Setiap percobaan benturan dicatat ke audit log.'
];

dblPoints.forEach((p, idx) => {
  s7.addShape(SHAPES.OVAL, {
    x: 1.1, y: 3.0 + idx * 0.9, w: 0.2, h: 0.2,
    fill: { color: C_GOLD }
  });
  s7.addText(p, {
    x: 1.4, y: 2.95 + idx * 0.9, w: 4.7, h: 0.8,
    fontSize: 9.5, color: C_GRAY_TEXT, lineSpacing: 16
  });
});

// Right Box: Kasir POS Cepat 1-Layar
s7.addShape(SHAPES.ROUNDED_RECTANGLE, {
  x: 6.8, y: 1.8, w: 5.7, h: 4.8,
  fill: { color: C_WHITE },
  line: { color: C_BORDER, width: 1.2 },
  rectRadius: 0.15
});
s7.addText('KASIR CEPAT 1-LAYAR (FRONT DESK POS)', {
  x: 7.1, y: 2.1, w: 5.1, h: 0.4,
  fontSize: 13, bold: true, color: C_DARK
});
s7.addText('Registrasi Tamu Walk-In Nonstop 24 Jam', {
  x: 7.1, y: 2.45, w: 5.1, h: 0.35,
  fontSize: 9.5, color: C_GOLD_DARK
});

const posPoints = [
  'Proses Check-in < 1 Menit: Input identitas tamu, pilih kamar tersedia, kunci nomor kasur, dan terima deposit dalam 1 formulir ringkas.',
  'Cetak Struk Thermal Standar Bank: Dukungan printer thermal 80mm dan 58mm untuk bukti tanda terima tamu dan bukti serah terima deposit.',
  'Penerbitan Invoice SIMPONI Otomatis: Setiap transaksi menghasilkan kode penagihan resmi PNBP lengkap dengan status lunas atau piutang.',
  'Terintegrasi Housekeeping: Kamar checkout langsung berganti status ke DIRTY untuk dibersihkan petugas secara terjadwal.'
];

posPoints.forEach((p, idx) => {
  s7.addShape(SHAPES.OVAL, {
    x: 7.1, y: 3.0 + idx * 0.9, w: 0.2, h: 0.2,
    fill: { color: C_GOLD }
  });
  s7.addText(p, {
    x: 7.4, y: 2.95 + idx * 0.9, w: 4.8, h: 0.8,
    fontSize: 9.5, color: C_GRAY_TEXT, lineSpacing: 16
  });
});


// =========================================================================
// SLIDE 8: WORKFLOW PENERIMAAN JEMAAH HAJI (SPMA DIGITAL)
// =========================================================================
const s8 = pres.addSlide();
s8.background = { color: 'F8F7F2' };
addSlideHeader(s8, 'Alur Penerimaan Jemaah Haji (SPMA Digital & Embarkasi Antara)', 'LAYANAN OPERASIONAL HAJI');

const spmaSteps = [
  {
    step: 'TAHAP 1',
    title: 'Validasi QR Code SPMA',
    desc: 'Jemaah kloter tiba di gerbang, diverifikasi melalui Surat Perintah Masuk Asrama digital atau Nomor Porsi Haji.',
    icon: 'Scan Dokumen'
  },
  {
    step: 'TAHAP 2',
    title: 'Pemeriksaan Medis BKK',
    desc: 'Pemeriksaan kesehatan akhir oleh Tim Balai Kekarantinaan Kesehatan (BKK) dan penyematan gelang kloter resmi.',
    icon: 'Skrining Sehat'
  },
  {
    step: 'TAHAP 3',
    title: 'Alokasi Kamar & Bagasi',
    desc: 'Penempatan kasur otomatis (pria/wanita terpisah), pencetakan Luggage Barcode Tag agar koper langsung tiba di kamar.',
    icon: 'Distribusi Bed'
  },
  {
    step: 'TAHAP 4',
    title: 'Pelepasan ke Bandara',
    desc: 'Seremoni pelepasan resmi kloter menuju Bandara Sentani Jayapura untuk penerbangan charter ke Embarkasi Makassar (UPG).',
    icon: 'Boarding Kloter'
  }
];

spmaSteps.forEach((st, idx) => {
  const x = 0.8 + idx * 3.0;

  s8.addShape(SHAPES.ROUNDED_RECTANGLE, {
    x: x, y: 2.0, w: 2.8, h: 4.4,
    fill: { color: C_WHITE },
    line: { color: C_BORDER, width: 1.2 },
    rectRadius: 0.15
  });

  // Step Badge
  s8.addShape(SHAPES.ROUNDED_RECTANGLE, {
    x: x + 0.25, y: 2.3, w: 1.2, h: 0.4,
    fill: { color: C_DARK },
    rectRadius: 0.08
  });
  s8.addText(st.step, {
    x: x + 0.25, y: 2.3, w: 1.2, h: 0.4,
    fontSize: 9.5, bold: true, color: C_GOLD, align: 'center', valign: 'middle'
  });

  s8.addText(st.title, {
    x: x + 0.25, y: 2.9, w: 2.3, h: 0.7,
    fontSize: 13, bold: true, color: C_DARK
  });

  s8.addShape(SHAPES.LINE, {
    x: x + 0.25, y: 3.7, w: 2.3, h: 0,
    line: { color: C_BORDER, width: 1 }
  });

  s8.addText(st.desc, {
    x: x + 0.25, y: 3.9, w: 2.3, h: 2.2,
    fontSize: 10, color: C_GRAY_TEXT, lineSpacing: 16
  });
});


// =========================================================================
// SLIDE 9: INTEGRASI PNBP & SETORAN KAS NEGARA
// =========================================================================
const s9 = pres.addSlide();
s9.background = { color: 'F8F7F2' };
addSlideHeader(s9, 'Integrasi PNBP & Penyetoran Kas Negara (SIMPONI MPN-G3)', 'KEUANGAN NEGARA');

const pnbpCards = [
  {
    code: 'AKUN 425111',
    title: 'Pendapatan Jasa Penginapan & Asrama',
    desc: 'Mencakup seluruh penerimaan sewa kamar Superior (Rp 300.000) dan Standar (Rp 250.000) per malam untuk tamu umum, kedinasan, bimbingan manasik, dan instansi luar.',
    color: C_GOLD_DARK
  },
  {
    code: 'AKUN 425112',
    title: 'Pendapatan Sewa Gedung, Bangunan & MICE',
    desc: 'Mencakup seluruh penerimaan sewa fasilitas Aula Utama (Rp 3.900.000/hari) dan Ruang Kelas (Rp 650.000/hari) untuk kegiatan wisuda, seminar, resepsi, dan pelatihan.',
    color: C_BLUE
  },
  {
    code: 'MPN-G3 KEMENKEU',
    title: 'Kode Billing SIMPONI 15-Digit',
    desc: 'Sistem menerbitkan Kode Billing resmi untuk penyetoran langsung ke Kas Negara via teller bank persepsi, ATM, m-Banking, atau loket PT Pos Indonesia dengan bukti SSBP sah.',
    color: C_GREEN
  }
];

pnbpCards.forEach((p, idx) => {
  const x = 0.8 + idx * 4.0;

  s9.addShape(SHAPES.ROUNDED_RECTANGLE, {
    x: x, y: 1.8, w: 3.7, h: 4.8,
    fill: { color: C_WHITE },
    line: { color: C_BORDER, width: 1.2 },
    rectRadius: 0.15
  });

  s9.addShape(SHAPES.ROUNDED_RECTANGLE, {
    x: x + 0.3, y: 2.1, w: 2.4, h: 0.4,
    fill: { color: C_CREAM },
    line: { color: C_BORDER, width: 1 },
    rectRadius: 0.08
  });
  s9.addText(p.code, {
    x: x + 0.3, y: 2.1, w: 2.4, h: 0.4,
    fontSize: 10, bold: true, color: p.color, align: 'center', valign: 'middle'
  });

  s9.addText(p.title, {
    x: x + 0.3, y: 2.7, w: 3.1, h: 0.8,
    fontSize: 13, bold: true, color: C_DARK
  });

  s9.addText(p.desc, {
    x: x + 0.3, y: 3.6, w: 3.1, h: 2.7,
    fontSize: 10.5, color: C_GRAY_TEXT, lineSpacing: 18
  });
});


// =========================================================================
// SLIDE 10: ROLE-BASED ACCESS CONTROL (RBAC)
// =========================================================================
const s10 = pres.addSlide();
s10.background = { color: 'F8F7F2' };
addSlideHeader(s10, 'Pembagian Hak Akses Pengguna Sesuai Tugas & Fungsi (RBAC)', 'KEAMANAN & TATA KELOLA PENGGUNA');

const roles = [
  {
    role: 'SUPERADMIN / KEPALA UPT',
    user: 'admin',
    duties: [
      'Pengelolaan master jenis kamar, nomor kamar fisik, dan fasilitas.',
      'Perubahan tarif resmi dan verifikasi SK masa berlaku.',
      'Audit log aktivitas sistem dan pemantauan pendapatan PNBP.',
      'Konfigurasi akun petugas dan hak akses.'
    ]
  },
  {
    role: 'FRONT DESK / RESEPSIONIS',
    user: 'resepsionis',
    duties: [
      'Pendaftaran reservasi kamar dan ruang pertemuan.',
      'Proses check-in dan checkout tamu dinas / umum.',
      'Penerimaan dan verifikasi SPMA jemaah haji kloter.',
      'Pemeriksaan ketersediaan unit dan cetak SPK / Surat Pesanan.'
    ]
  },
  {
    role: 'BENDAHARA / KASIR POS',
    user: 'kasir',
    duties: [
      'Kasir cepat 1-layar untuk tamu walk-in harian.',
      'Penerbitan invoice dan billing SIMPONI resmi.',
      'Pencatatan uang jaminan (deposit) & pengembalian saat checkout.',
      'Cetak kuitansi dan struk thermal transaksi.'
    ]
  },
  {
    role: 'TIM HOUSEKEEPING',
    user: 'housekeeping',
    duties: [
      'Pembaruan status kebersihan kamar (Ready, Dirty, Cleaning).',
      'Pencatatan kesiapan AC, water heater, sprei, dan handuk.',
      'Pelaporan kebutuhan perbaikan teknis ke bagian pemeliharaan.',
      'Pemeriksaan kesiapan aula sebelum dan sesudah acara.'
    ]
  }
];

roles.forEach((r, idx) => {
  const row = Math.floor(idx / 2);
  const col = idx % 2;
  const x = 0.8 + col * 6.0;
  const y = 1.8 + row * 2.45;

  s10.addShape(SHAPES.ROUNDED_RECTANGLE, {
    x: x, y: y, w: 5.7, h: 2.2,
    fill: { color: C_WHITE },
    line: { color: C_BORDER, width: 1.2 },
    rectRadius: 0.12
  });

  s10.addText(`${r.role} (User: ${r.user})`, {
    x: x + 0.25, y: y + 0.2, w: 5.2, h: 0.35,
    fontSize: 11, bold: true, color: C_DARK
  });

  const dutyText = r.duties.map(d => `• ${d}`).join('\n');
  s10.addText(dutyText, {
    x: x + 0.25, y: y + 0.55, w: 5.2, h: 1.5,
    fontSize: 9, color: C_GRAY_TEXT, lineSpacing: 15
  });
});


// =========================================================================
// SLIDE 11: RENCANA IMPLEMENTASI & ROLLOUT
// =========================================================================
const s11 = pres.addSlide();
s11.background = { color: 'F8F7F2' };
addSlideHeader(s11, 'Roadmap Implementasi & Rencana Operasional UPT', 'RENCANA IMPLEMENTASI');

const roadmap = [
  {
    phase: 'FASE I (Minggu 1)',
    title: 'Sosialisasi & Bimtek Petugas',
    items: '• Pengenalan antarmuka baru bagi staf Front Desk, Kasir, dan Housekeeping.\n• Pelatihan skenario tamu walk-in dan sewa aula instansi.\n• Simulasi penerbitan billing SIMPONI.'
  },
  {
    phase: 'FASE II (Minggu 2)',
    title: 'Uji Coba Lapangan (Parallel Run)',
    items: '• Pencatatan ganda sistem baru bersamaan dengan register lama.\n• Evaluasi waktu check-in jemaah dan responsivitas kasir.\n• Kalibrasi stok kamar fisik dan koordinasi kebersihan.'
  },
  {
    phase: 'FASE III (Minggu 3)',
    title: 'Peralihan Penuh (Full Go-Live)',
    items: '• Seluruh reservasi dan pembayaran menggunakan SIMAHA Papua.\n• Pelaporan realisasi PNBP otomatis per minggu.\n• Dukungan Helpdesk Front Desk 24 jam nonstop.'
  }
];

roadmap.forEach((rm, idx) => {
  const x = 0.8 + idx * 4.0;

  s11.addShape(SHAPES.ROUNDED_RECTANGLE, {
    x: x, y: 1.8, w: 3.7, h: 4.8,
    fill: { color: C_WHITE },
    line: { color: C_BORDER, width: 1.2 },
    rectRadius: 0.15
  });

  s11.addShape(SHAPES.ROUNDED_RECTANGLE, {
    x: x + 0.3, y: 2.1, w: 2.5, h: 0.4,
    fill: { color: C_DARK },
    rectRadius: 0.08
  });
  s11.addText(rm.phase, {
    x: x + 0.3, y: 2.1, w: 2.5, h: 0.4,
    fontSize: 10, bold: true, color: C_GOLD, align: 'center', valign: 'middle'
  });

  s11.addText(rm.title, {
    x: x + 0.3, y: 2.7, w: 3.1, h: 0.8,
    fontSize: 13, bold: true, color: C_DARK
  });

  s11.addShape(SHAPES.LINE, {
    x: x + 0.3, y: 3.6, w: 3.1, h: 0,
    line: { color: C_BORDER, width: 1 }
  });

  s11.addText(rm.items, {
    x: x + 0.3, y: 3.8, w: 3.1, h: 2.5,
    fontSize: 10, color: C_GRAY_TEXT, lineSpacing: 18
  });
});


// =========================================================================
// SLIDE 12: PENUTUP & TANYA JAWAB (Q&A)
// =========================================================================
const s12 = pres.addSlide();
s12.background = { color: C_DARK };

s12.addShape(SHAPES.ROUNDED_RECTANGLE, {
  x: 1.5, y: 1.2, w: 10.3, h: 5.0,
  fill: { color: '241C15' },
  line: { color: C_GOLD, width: 1.5 },
  rectRadius: 0.2
});

s12.addText('TERIMA KASIH', {
  x: 2.0, y: 1.8, w: 9.3, h: 0.8,
  fontSize: 32, bold: true, color: C_GOLD, align: 'center'
});

s12.addText('Sesi Tanya Jawab, Diskusi & Masukan Penyempurnaan', {
  x: 2.0, y: 2.6, w: 9.3, h: 0.5,
  fontSize: 16, bold: true, color: C_WHITE, align: 'center'
});

s12.addText([
  { text: '"Mewujudkan Tata Kelola Aset Asrama Haji yang Akuntabel, Transparan, dan Modern Melayani Jemaah Haji Tanah Papua"\n\n', options: { italic: true, color: 'D5CEBF', fontSize: 11 } },
  { text: 'UPT Asrama Haji Transit Jayapura — Kementerian Haji dan Umrah RI\n', options: { bold: true, color: C_GOLD, fontSize: 12 } },
  { text: 'Front Desk 24 Jam: (0967) 581-229 • WhatsApp: 0812-4800-1234\n', options: { color: C_WHITE, fontSize: 10.5 } },
  { text: 'Aplikasi Online: https://asrama-haji-papua.vercel.app\n', options: { color: C_GOLD, fontSize: 10.5 } },
  { text: 'Akses Lokal Kantor: http://localhost:5173', options: { color: 'B0A894', fontSize: 10.5 } }
], {
  x: 2.0, y: 3.3, w: 9.3, h: 2.6, align: 'center', lineSpacing: 18
});

// Output file
const fileName = 'PRESENTASI_SOSIALISASI_SIMAHA_PAPUA.pptx';
pres.writeFile({ fileName })
  .then(() => {
    console.log(`Presentation saved successfully to: ${fileName}`);
  })
  .catch(err => {
    console.error('Error generating presentation:', err);
    process.exit(1);
  });
