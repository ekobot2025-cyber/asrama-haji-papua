import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  ShadingType,
  ImageRun,
} from 'docx';
import fs from 'fs';
import path from 'path';
import sizeOf from 'image-size';

const GOLD = 'C9A961';
const DARK_NAVY = '0F172A';
const SLATE_GRAY = '475569';
const LIGHT_BG = 'F8FAFC';
const BORDER_COLOR = 'CBD5E1';

const CHARTS = {
  rbac: `graph TD
    Start(["Mulai / Kunjungan Web"]) --> LP["Landing Page Publik (asrama-haji-papua.vercel.app)"]
    LP --> Info["Informasi Kamar Gedung Mina, Fasilitas & Tarif"]
    LP --> LoginPrompt["Klik Masuk Portal Petugas"]
    LoginPrompt --> AuthForm{"Verifikasi Akun (Username & Sandi)"}
    AuthForm -- "Kredensial Salah" --> LoginErr["Peringatan Login Gagal"]
    LoginErr --> AuthForm
    AuthForm -- "Kredensial Benar" --> RoleCheck{"Evaluasi Peran Akun (RBAC)"}
    RoleCheck -- "SUPER_ADMIN" --> NavAdmin["Dashboard Sistem & Master Data"]
    RoleCheck -- "ADMIN_PENGINAPAN" --> NavPenginapan["Dashboard Operasional & Tarif"]
    RoleCheck -- "RESEPSIONIS" --> NavResepsionis["Front Desk POS & Check-In"]
    RoleCheck -- "HOUSEKEEPING" --> NavHK["Papan Status Kamar & Kebersihan"]
    RoleCheck -- "KEUANGAN" --> NavKeuangan["Faktur Tagihan & Rekap PNBP"]
    RoleCheck -- "PIMPINAN" --> NavPimpinan["Executive Dashboard & Laporan"]`,

  guestLifecycle: `graph TD
    subgraph S1["Fase 1: Reservasi & Administrasi"]
        R1["Permohonan Sewa (Individu / Instansi / Jamaah)"] --> R2["Input Data Tamu / PIC & Jadwal"]
        R2 --> R3["Pilih Kategori Paket (Reguler / Bimtek / Manasik)"]
        R3 --> R4{"Cek Ketersediaan Kamar Gedung Mina"}
        R4 -- "Penuh" --> R4b["Penyesuaian Jadwal / Tunggu"]
        R4b --> R2
        R4 -- "Tersedia" --> R5["Simpan Reservasi (PENDING/VERIFIED)"]
        R5 --> R6["Verifikasi Administrasi & Terbitkan SPMA"]
        R6 --> R7["Alokasi Kamar & Ranjang (Bed Assignment)"]
        R7 --> R8["Status Reservasi: CONFIRMED"]
    end
    subgraph S2["Fase 2: Kedatangan & Check-In"]
        R8 --> C1["Tamu Tiba di Meja Resepsionis / POS"]
        C1 --> C2["Verifikasi NIK Tamu & Nomor SPMA"]
        C2 --> C3["Pencatatan Deposit & Serah Kunci Kartu"]
        C3 --> C4["Resepsionis Eksekusi Check-In"]
        C4 --> C5["Status Reservasi: CHECKED_IN"]
        C5 --> C6["Status Kamar Berubah Menjadi: OCCUPIED"]
    end
    subgraph S3["Fase 3: Masa Tinggal (In-House Stay)"]
        C6 --> S_Stay["Tamu Menginap & Menggunakan Fasilitas"]
        S_Stay -.-> S_Mnt["Ada Kendala? Buat Tiket Maintenance"]
        S_Stay -.-> S_HK["Layanan Kebersihan & Ganti Linen"]
    end
    subgraph S4["Fase 4: Kepulangan & Check-Out"]
        S_Stay --> O1["Tamu Menuju Front Desk untuk Check-Out"]
        O1 --> O2["Inspeksi Fisik Kondisi Kamar"]
        O2 --> O3{"Ada Kerusakan / Biaya Tambahan?"}
        O3 -- "Ya" --> O4["Tambahkan Item Tagihan pada Invoice"]
        O3 -- "Tidak" --> O5["Pengembalian Uang Jaminan (Deposit)"]
        O4 --> O5
        O5 --> O6{"Sisa Tagihan Lunas?"}
        O6 -- "Belum" --> PayFlow["Proses Pembayaran di Kasir"]
        PayFlow --> O7["Cetak Kwitansi / Bukti Lunas"]
        O6 -- "Lunas" --> O7
        O7 --> O8["Update Status: CHECKED_OUT"]
        O8 --> O9["Status Kamar Berubah: DIRTY / CLEANING"]
    end`,

  finance: `graph TD
    F1["Pemicu: Reservasi Dikonfirmasi / Check-Out"] --> F2["Penerbitan Invoice Tagihan (INV/AHP/...)"]
    F2 --> F3["Kalkulasi Otomatis: Tarif Kamar + Fasilitas + Ekstra"]
    F3 --> F4["Pemetaan Akun PNBP (Kode 425111 / 425112 / 425113)"]
    F4 --> F5["Generate 15 Digit Kode Billing SIMPONI (MPN-G3)"]
    F5 --> F6{"Metode Pembayaran Tamu"}
    F6 -- "Tunai" --> P1["Kasir Menerima Uang Tunai"]
    F6 -- "Transfer Bank" --> P2["Transfer ke Rekening Resmi (BPD Papua / BSI / BRI)"]
    F6 -- "QRIS" --> P3["Pindai QRIS Resmi Asrama Haji"]
    P1 --> V1["Verifikasi & Konfirmasi Petugas Keuangan"]
    P2 --> V1
    P3 --> V1
    V1 --> S1["Update Status Invoice: PAID"]
    S1 --> S2["Generate Kwitansi Resmi (KWT/AHP/...)"]
    S2 --> S3["Konversi Nominal ke Terbilang Otomatis"]
    S3 --> S4["Cetak / Unduh PDF Kwitansi Resmi"]
    S4 --> S5["Sinkronisasi ke Laporan Realisasi PNBP & LRA"]`,

  housekeeping: `graph TD
    subgraph HK["Siklus Housekeeping (Kebersihan Kamar)"]
        H1["1. DIRTY (Pasca Check-Out / Kamar Kotor)"] --> H2["2. IN_CLEANING (Pembersihan, Ganti Linen, Sanitasi)"]
        H2 --> H3["3. INSPECTED (Pemeriksaan Supervisor)"]
        H3 --> H4["4. READY / AVAILABLE (Siap Ditempati Tamu Baru)"]
    end
    subgraph MNT["Siklus Pemeliharaan (Maintenance)"]
        M1["Laporan Kerusakan (AC, Plumbing, Listrik, Mebel)"] --> M2["Tiket Dibuat (MNT/AHP/...) dengan Prioritas"]
        M2 --> M3["Kamar Ditandai Status: MAINTENANCE"]
        M3 --> M4["Teknisi Melakukan Tindakan Perbaikan"]
        M4 --> M5["Tiket Diselesaikan (COMPLETED)"]
        M5 --> H1
    end`,
};

async function downloadChartImage(code, filename) {
  const assetsDir = path.resolve('assets/flowcharts');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const filePath = path.join(assetsDir, filename);
  console.log(`Downloading flowchart: ${filename}...`);

  const payload = Buffer.from(
    JSON.stringify({
      code,
      mermaid: {
        theme: 'neutral',
      },
    }),
    'utf-8'
  ).toString('base64');

  const url = `https://mermaid.ink/img/${payload}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download chart ${filename}: HTTP ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
  console.log(`Chart saved to: ${filePath}`);
  return filePath;
}

function createImageBlock(imagePath, captionText) {
  const imageBuffer = fs.readFileSync(imagePath);
  const dimensions = sizeOf(imageBuffer);

  const maxDisplayWidth = 560; // Max width in points for standard margin page
  let targetWidth = dimensions.width;
  let targetHeight = dimensions.height;

  if (targetWidth > maxDisplayWidth) {
    const ratio = maxDisplayWidth / targetWidth;
    targetWidth = maxDisplayWidth;
    targetHeight = Math.round(targetHeight * ratio);
  }

  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 180, after: 100 },
      children: [
        new ImageRun({
          data: imageBuffer,
          transformation: {
            width: targetWidth,
            height: targetHeight,
          },
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 180 },
      children: [
        new TextRun({
          text: captionText,
          italics: true,
          bold: true,
          size: 19,
          color: GOLD,
          font: 'Segoe UI',
        }),
      ],
    }),
  ];
}

function createHeading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 150 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 32,
        color: DARK_NAVY,
        font: 'Segoe UI',
      }),
    ],
  });
}

function createHeading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 26,
        color: GOLD,
        font: 'Segoe UI',
      }),
    ],
  });
}

function createParagraph(text, options = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 100 },
    alignment: options.alignment || AlignmentType.LEFT,
    children: [
      new TextRun({
        text,
        size: options.size || 21,
        color: options.color || SLATE_GRAY,
        font: 'Segoe UI',
        bold: options.bold || false,
        italics: options.italic || false,
      }),
    ],
  });
}

function createBullet(title, description) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 60 },
    children: [
      new TextRun({
        text: title + ': ',
        bold: true,
        color: DARK_NAVY,
        size: 21,
        font: 'Segoe UI',
      }),
      new TextRun({
        text: description,
        color: SLATE_GRAY,
        size: 21,
        font: 'Segoe UI',
      }),
    ],
  });
}

function createCalloutBox(title, steps) {
  const tableRows = [];

  tableRows.push(
    new TableRow({
      children: [
        new TableCell({
          shading: { type: ShadingType.CLEAR, fill: 'FEF9C3' },
          margins: { top: 120, bottom: 80, left: 160, right: 160 },
          children: [
            new Paragraph({
              spacing: { before: 40, after: 40 },
              children: [
                new TextRun({
                  text: '📌 ' + title,
                  bold: true,
                  size: 22,
                  color: '854D0E',
                  font: 'Segoe UI',
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  const stepParagraphs = steps.map((s, idx) => {
    return new Paragraph({
      spacing: { before: 40, after: 40 },
      children: [
        new TextRun({
          text: `[Langkah ${idx + 1}] `,
          bold: true,
          color: DARK_NAVY,
          size: 20,
          font: 'Segoe UI',
        }),
        new TextRun({
          text: s,
          color: SLATE_GRAY,
          size: 20,
          font: 'Segoe UI',
        }),
      ],
    });
  });

  tableRows.push(
    new TableRow({
      children: [
        new TableCell({
          shading: { type: ShadingType.CLEAR, fill: LIGHT_BG },
          margins: { top: 120, bottom: 120, left: 160, right: 160 },
          children: stepParagraphs,
        }),
      ],
    })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: GOLD },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD },
      left: { style: BorderStyle.SINGLE, size: 12, color: GOLD },
      right: { style: BorderStyle.SINGLE, size: 6, color: GOLD },
    },
    rows: tableRows,
  });
}

function createTable(headers, rowsData) {
  const headerCells = headers.map(
    (h) =>
      new TableCell({
        shading: { type: ShadingType.CLEAR, fill: DARK_NAVY },
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: h,
                bold: true,
                color: 'FFFFFF',
                size: 20,
                font: 'Segoe UI',
              }),
            ],
          }),
        ],
      })
  );

  const tableRows = [new TableRow({ children: headerCells })];

  rowsData.forEach((row, rowIndex) => {
    const isEven = rowIndex % 2 === 0;
    const cells = row.map((cellText, colIndex) => {
      return new TableCell({
        shading: {
          type: ShadingType.CLEAR,
          fill: isEven ? 'FFFFFF' : LIGHT_BG,
        },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        children: [
          new Paragraph({
            alignment: colIndex === 0 ? AlignmentType.LEFT : AlignmentType.LEFT,
            children: [
              new TextRun({
                text: cellText,
                color: colIndex === 0 ? DARK_NAVY : SLATE_GRAY,
                bold: colIndex === 0,
                size: 19,
                font: 'Segoe UI',
              }),
            ],
          }),
        ],
      });
    });
    tableRows.push(new TableRow({ children: cells }));
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
      left: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
      right: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
    },
    rows: tableRows,
  });
}

async function buildDocWithImages() {
  console.log('--- Step 1: Downloading visual flowchart images ---');
  const imgRbac = await downloadChartImage(CHARTS.rbac, 'flowchart_1_rbac.jpg');
  const imgGuest = await downloadChartImage(CHARTS.guestLifecycle, 'flowchart_2_guest_lifecycle.jpg');
  const imgFinance = await downloadChartImage(CHARTS.finance, 'flowchart_3_finance_pnbp.jpg');
  const imgHousekeeping = await downloadChartImage(CHARTS.housekeeping, 'flowchart_4_housekeeping.jpg');

  console.log('--- Step 2: Assembling Word document with embedded flowchart images ---');

  const doc = new Document({
    creator: 'Antigravity AI - Kementerian Haji dan Umrah RI',
    title: 'Dokumentasi & Flowchart Lengkap SIPAH Papua',
    description: 'Sistem Informasi Pengelolaan Asrama Haji Papua',
    styles: {
      default: {
        document: {
          run: {
            font: 'Segoe UI',
            size: 21,
            color: SLATE_GRAY,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: [
          // Header / Cover
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({
                text: 'KEMENTERIAN HAJI DAN UMRAH REPUBLIK INDONESIA',
                bold: true,
                size: 24,
                color: GOLD,
                font: 'Segoe UI',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 120 },
            children: [
              new TextRun({
                text: 'UNIT PELAKSANA TEKNIS (UPT) ASRAMA HAJI TRANSIT JAYAPURA - PAPUA',
                bold: true,
                size: 22,
                color: DARK_NAVY,
                font: 'Segoe UI',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: '═══════════════════════════════════════════════════════════',
                color: GOLD,
                size: 18,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 180, after: 100 },
            children: [
              new TextRun({
                text: 'DOKUMEN SPESIFIKASI OPERASIONAL & FLOWCHART LENGKAP',
                bold: true,
                size: 30,
                color: DARK_NAVY,
                font: 'Segoe UI',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 300 },
            children: [
              new TextRun({
                text: 'SISTEM INFORMASI PENGELOLAAN ASRAMA HAJI PAPUA (SIPAH PAPUA)',
                bold: true,
                size: 24,
                color: GOLD,
                font: 'Segoe UI',
              }),
            ],
          }),

          // Metadata Info Box
          createTable(
            ['Atribut Dokumen', 'Rincian Sistem'],
            [
              ['Nama Sistem', 'SIPAH Papua (Sistem Informasi Pengelolaan Asrama Haji Papua)'],
              ['Tautan Produksi (Live)', 'https://asrama-haji-papua.vercel.app'],
              ['Tautan Pengembangan Lokal', 'http://localhost:5173/'],
              ['Repositori Source Code', 'https://github.com/ekobot2025-cyber/asrama-haji-papua.git'],
              ['Versi & Tanggal Dokumen', 'Versi 1.1 - Dilengkapi Gambar Flowchart (Oktober 2026)'],
              ['Basis Arsitektur', 'React 18 + TypeScript + Tailwind CSS (Vite Engine)'],
              ['Standar Desain & Warna', 'Kiswah Gold (#C9A961) & Charcoal Navy (#0F172A)'],
            ]
          ),

          new Paragraph({ spacing: { before: 300, after: 100 } }),

          // BAB I
          createHeading1('BAB I. PENDAHULUAN & RUANG LINGKUP APLIKASI'),
          createParagraph(
            'Sistem Informasi Pengelolaan Asrama Haji Papua (SIPAH Papua) dirancang khusus untuk memodernisasi dan mengotomatisasi seluruh kegiatan operasional pada Unit Pelaksana Teknis (UPT) Asrama Haji Transit Jayapura. Sistem ini mengintegrasikan seluruh lini layanan, mulai dari pemesanan awal oleh jamaah atau instansi, penatausahaan kamar, check-in resepsionis, pengawasan kebersihan harian (housekeeping), hingga tata kelola keuangan Penerimaan Negara Bukan Pajak (PNBP) dengan standar SIMPONI Kementerian Keuangan RI.'
          ),

          createHeading2('1.1. Profil Aset Penginapan & Fasilitas Utama'),
          createParagraph(
            'Sistem telah dikonfigurasi secara presisi sesuai dengan kapasitas riil UPT Asrama Haji Jayapura:'
          ),
          createBullet(
            'Gedung Mina (Total 32 Kamar)',
            'Terdiri atas 2 Kamar Kelas Superior (Tarif resmi Rp 300.000 / malam) dan 30 Kamar Kelas Standar (Tarif resmi Rp 250.000 / malam) dengan ketentuan standar Check-in Pukul 14.00 WIT dan Check-out Pukul 12.00 WIT.'
          ),
          createBullet(
            'Fasilitas Penunjang Lengkap',
            'Aula Utama Serbaguna, Ruang Rapat VVIP, Ruang Kelas Diklat/Bimtek, Masjid Asrama Haji, Ruang Makan Prasmanan, serta Lapangan Manasik Haji Terbuka.'
          ),
          createBullet(
            'Segmentasi Pengguna Layanan',
            'Jamaah Calon Haji Reguler & Khusus, Kegiatan Bimtek Kemenag/Pemda Papua, Rombongan Manasik, Tamu Kedinasan, serta Masyarakat Umum.'
          ),

          // BAB II
          createHeading1('BAB II. ARSITEKTUR PERAN & HAK AKSES PENGGUNA (RBAC)'),
          createParagraph(
            'Untuk menjamin keamanan data dan akuntabilitas kerja, SIPAH Papua menerapkan Role-Based Access Control (RBAC Guard) yang membagi hak akses ke dalam 6 tingkatan peran:'
          ),

          createTable(
            ['Peran Pengguna (Role)', 'Tanggung Jawab Operasional', 'Hak Akses Modul Utama'],
            [
              [
                'SUPER_ADMIN',
                'Pengelola sistem tingkat tertinggi, bertanggung jawab atas konfigurasi dan pemeliharaan platform.',
                'Akses 100% seluruh modul, Manajemen User, Log Audit, Konfigurasi Sistem, Master Data.',
              ],
              [
                'ADMIN_PENGINAPAN',
                'Kepala tata usaha / manajer operasional asrama yang mengontrol tarif, master data, dan reservasi.',
                'Dashboard Utama, Master Gedung & Kamar, Master Tarif, Manajemen Reservasi, Laporan.',
              ],
              [
                'RESEPSIONIS',
                'Petugas meja depan (Front Desk) yang melayani tamu walk-in maupun pemesanan terkonfirmasi.',
                'Front Desk POS, Kalender Reservasi, Check-in, Check-out, Room Assignment, Data Tamu.',
              ],
              [
                'HOUSEKEEPING',
                'Petugas kebersihan dan inspektur kamar yang menjaga kesiapan kamar siap huni.',
                'Papan Status Kamar (Room Status Board), Daftar Tugas Pembersihan, Laporan Kerusakan.',
              ],
              [
                'KEUANGAN',
                'Bendahara penerimaan PNBP yang memproses penagihan, kode billing, dan kwitansi.',
                'Faktur Tagihan (Invoices), Kasir Pembayaran, Kwitansi PDF, Rekapitulasi Realisasi PNBP.',
              ],
              [
                'PIMPINAN',
                'Kepala Kanwil Kemenag / Kepala UPT yang memerlukan visibilitas kinerja real-time.',
                'Executive Dashboard, Grafik Okupansi Harian/Bulanan, Laporan Realisasi Pendapatan.',
              ],
            ]
          ),

          new Paragraph({ spacing: { before: 200, after: 100 } }),
          createHeading2('2.1. Bagan Gambar Flowchart: Hak Akses & Navigasi Pengguna'),
          createParagraph(
            'Bagan berikut menampilkan alur visual autentikasi dan penentuan hak akses pengguna berdasarkan peran akun:'
          ),
          ...createImageBlock(
            imgRbac,
            'Gambar 1: Flowchart Autentikasi & Routing Hak Akses (RBAC Guard) SIPAH Papua'
          ),

          createCalloutBox('Prosedur Akses Pengguna ke Modul Sistem', [
            'Pengguna membuka web (Landing Page) lalu mengklik tombol "Masuk Portal Petugas".',
            'Sistem memverifikasi identitas pengguna melalui form login terenkripsi.',
            'Jika otentikasi sukses, sistem memeriksa peran aktif pengguna (CurrentUser.role).',
            'Pengguna otomatis diarahkan ke menu kerja default (misal: Resepsionis -> Front Desk POS, Housekeeping -> Status Kamar, dsb).',
            'Jika pengguna mencoba mengakses menu di luar hak otorisasinya, sistem menampilkan layar penolakan "RBAC Guard: Hak Akses Tidak Memadai".',
          ]),

          // BAB III
          createHeading1('BAB III. SIKLUS HIDUP TAMU & OPERASIONAL PENGINAPAN'),
          createParagraph(
            'Siklus operasional penginapan berjalan secara terstruktur dan terpadu mulai dari pemesanan awal hingga penyelesaian pasca check-out.'
          ),

          createHeading2('3.1. Bagan Gambar Flowchart: Siklus Tamu End-to-End'),
          createParagraph(
            'Bagan alur kerja lengkap operasional penginapan dari Fase 1 (Reservasi) sampai dengan Fase 4 (Check-Out & Kebersihan):'
          ),
          ...createImageBlock(
            imgGuest,
            'Gambar 2: Flowchart Siklus Tamu & Operasional Penginapan Gedung Mina'
          ),

          createHeading2('3.2. Rincian Langkah Operasional Tamu'),
          createCalloutBox('Alur Kerja Pemesanan & Penerbitan SPMA', [
            'Penerimaan Permohonan: Tamu perorangan, panitia bimtek, atau rombongan manasik mengajukan kebutuhan menginap.',
            'Pencatatan Data: Petugas menginput profil tamu/PIC, instansi, jadwal check-in/out, dan jumlah ranjang.',
            'Cek Ketersediaan: Sistem otomatis memvalidasi ketersediaan kamar pada Gedung Mina sesuai tanggal yang diminta.',
            'Penetapan Status: Reservasi disimpan dengan status PENDING / VERIFIED.',
            'Penerbitan Dokumen: Sistem menerbitkan Surat Penetapan Masuk Asrama (SPMA) bernomor resmi.',
            'Alokasi Ranjang (Bed Assignment): Penentuan nomor kamar dan ranjang dengan pemisahan jamaah pria dan wanita.',
            'Status Akhir: Reservasi berstatus CONFIRMED (Siap Check-in).',
          ]),

          new Paragraph({ spacing: { before: 180, after: 60 } }),
          createCalloutBox('Alur Kerja Front Desk Check-In & Check-Out', [
            'Tamu tiba di Front Desk dan diverifikasi NIK serta nomor SPMA-nya.',
            'Petugas menginput nominal deposit dan jumlah kartu kunci fisik yang diserahkan.',
            'Check-In dieksekusi: Status Reservasi menjadi CHECKED_IN dan kamar otomatis menjadi OCCUPIED.',
            'Saat Check-Out: Petugas menginspeksi kamar, memeriksa tagihan, dan mengembalikan uang jaminan deposit.',
            'Pelunasan tagihan sisa diproses di kasir, dan kamar otomatis ditandai DIRTY untuk diteruskan ke tim kebersihan.',
          ]),

          // BAB IV
          createHeading1('BAB IV. ALUR PENATAUSAHAAN KEUANGAN & PNBP SIMPONI'),
          createParagraph(
            'Sebagai instansi pemerintah di bawah Kementerian Agama dan Kementerian Haji RI, penatausahaan pendapatan wajib mematuhi ketentuan Penerimaan Negara Bukan Pajak (PNBP).'
          ),

          createHeading2('4.1. Struktur Akun PNBP & Kode Billing SIMPONI'),
          createTable(
            ['Kode Akun PNBP', 'Nama Akun Pendapatan', 'Deskripsi Penggunaan'],
            [
              ['425111', 'Pendapatan Sewa Kamar Asrama Haji', 'Sewa 32 kamar Gedung Mina (Superior & Standar)'],
              ['425112', 'Pendapatan Sewa Gedung & Fasilitas', 'Sewa Aula, Ruang Rapat, Ruang Kelas, & Lapangan'],
              ['425113', 'Pendapatan Jasa Layanan Lainnya', 'Layanan kebersihan khusus, sewa peralatan, konsumsi'],
            ]
          ),

          new Paragraph({ spacing: { before: 160, after: 80 } }),
          createHeading2('4.2. Bagan Gambar Flowchart: Keuangan & Billing SIMPONI'),
          createParagraph(
            'Bagan berikut mengilustrasikan siklus penagihan, pembuatan kode billing SIMPONI, verifikasi kanal pembayaran, hingga penerbitan kwitansi:'
          ),
          ...createImageBlock(
            imgFinance,
            'Gambar 3: Flowchart Penatausahaan Keuangan, Billing SIMPONI & Kwitansi PNBP'
          ),

          createCalloutBox('Siklus Penagihan & Penerimaan Kas/Bank', [
            'Penerbitan Invoice: Sistem mengompilasi total sewa kamar dan fasilitas ke dalam Invoice resmi (INV/AHP/...).',
            'Generate Kode SIMPONI: Sistem menghasilkan 15 digit Kode Billing SIMPONI MPN-G3 untuk setoran kas negara.',
            'Pilihan Metode Bayar: Tamu membayar via Tunai (Cash), Transfer Rekening Resmi (BPD Papua / BSI / BRI), atau QRIS.',
            'Pencatatan Kasir: Bendahara memverifikasi dana masuk dan mencatat nomor transaksi.',
            'Penerbitan Kwitansi: Sistem mencetak Kwitansi Resmi (KWT/AHP/...) dengan fungsi terbilang huruf otomatis dan ekspor PDF.',
          ]),

          // BAB V
          createHeading1('BAB V. SIKLUS HOUSEKEEPING & PEMELIHARAAN (MAINTENANCE)'),
          createParagraph(
            'Kualitas layanan kamar dijaga melalui tata kelola kebersihan 4 tahap serta sistem tiket pemeliharaan sarana yang terukur.'
          ),

          createHeading2('5.1. Bagan Gambar Flowchart: Housekeeping & Tiket Maintenance'),
          createParagraph(
            'Bagan berikut menampilkan alur pergantian status kamar pasca check-out serta penanganan tiket kerusakan fasilitas:'
          ),
          ...createImageBlock(
            imgHousekeeping,
            'Gambar 4: Flowchart Siklus Housekeeping & Penanganan Tiket Maintenance'
          ),

          createHeading2('5.2. Siklus 4 Tahap Kebersihan Kamar'),
          createTable(
            ['Status Kamar', 'Penanggung Jawab', 'Tindakan yang Dilakukan'],
            [
              [
                '1. DIRTY',
                'Sistem Otomatis / Resepsionis',
                'Status awal sesaat setelah tamu check-out. Kamar membutuhkan pembersihan menyeluruh.',
              ],
              [
                '2. IN_CLEANING',
                'Petugas Housekeeping',
                'Pembersihan lantai, penggantian sprei/linen bersih, sanitasi kamar mandi, dan penyemprotan aroma.',
              ],
              [
                '3. INSPECTED',
                'Supervisor / Kepala Asrama',
                'Pemeriksaan mutu kebersihan sesuai checklist standar operasional UPT Asrama Haji.',
              ],
              [
                '4. READY (AVAILABLE)',
                'Sistem / Meja Resepsionis',
                'Kamar dinyatakan bersih sempurna dan siap dijual/ditempati kembali oleh tamu berikutnya.',
              ],
            ]
          ),

          // BAB VI
          createHeading1('BAB VI. EXECUTIVE DASHBOARD & PELAPORAN PIMPINAN'),
          createParagraph(
            'Modul Pimpinan menyajikan ringkasan kinerja strategis dalam bentuk visual grafik dan tabel analitik:'
          ),
          createBullet(
            'Tingkat Penghunian Kamar (TPK / Occupancy Rate)',
            'Persentase kamar terpakai harian dan bulanan terhadap total 32 kamar Gedung Mina.'
          ),
          createBullet(
            'Realisasi Pendapatan PNBP',
            'Total penerimaan sewa kamar dan sewa fasilitas yang terbagi menurut akun penerimaan negara.'
          ),
          createBullet(
            'Demografi Asal Tamu',
            'Sebaran tamu berdasarkan Kabupaten/Kota di wilayah Papua (Kota Jayapura, Kab. Jayapura, Merauke, Mimika, dsb).'
          ),
          createBullet(
            'Ekspor Laporan Resmi',
            'Pencetakan laporan berkala dalam format PDF dan Excel untuk keperluan audit dan pertanggungjawaban dinas.'
          ),

          // BAB VII
          createHeading1('BAB VII. PETUNJUK AKSES & PENGOPERASIAN SISTEM'),
          createParagraph(
            'Sistem dapat diakses melalui dua kanal resmi sesuai kebutuhan operasional:'
          ),
          createBullet(
            'Kanal Cloud Publik (Vercel)',
            'Dapat diakses 24/7 melalui tautan: https://asrama-haji-papua.vercel.app'
          ),
          createBullet(
            'Kanal Jaringan Lokal / Offline Server',
            'Dapat dijalankan di lingkungan lokal/intranet melalui alamat: http://localhost:5173/'
          ),

          new Paragraph({ spacing: { before: 240, after: 100 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: '— DOKUMEN RESMI TATA KELOLA SIPAH PAPUA —',
                bold: true,
                size: 20,
                color: GOLD,
                font: 'Segoe UI',
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.resolve('DOKUMENTASI_DAN_FLOWCHART_SIPAH_PAPUA.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Document successfully written to: ${outputPath} (Size: ${buffer.byteLength} bytes)`);
}

buildDocWithImages().catch((err) => {
  console.error('Error building docx with images:', err);
  process.exit(1);
});
