import { neon } from '@neondatabase/serverless';

const MODEL = 'google/gemini-1.5-flash';
const GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1/chat/completions';

const CONTACT = {
  wa: 'https://wa.me/6281248001234',
  waText: '0812-4800-1234',
  phone: '(0967) 581-229',
  address: 'Jl. Raya Kotaraja No. 8, Wai Mhorock, Kec. Abepura, Kota Jayapura, Provinsi Papua 99225',
};

const rupiah = (n: number) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

// In-memory rate limiter: 25 requests / minute / IP
const hits = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 25;
}

async function loadLiveFacts(): Promise<string> {
  try {
    if (!process.env.DATABASE_URL) return '';
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`SELECT payload FROM simaha_cloud_sync WHERE key = 'simaha_papua_production' LIMIT 1;`;
    const p: any = rows[0]?.payload;
    if (!p) return '';
    const types = (p.roomTypes || [])
      .filter((t: any) => (t.category || 'PENGINAPAN') === 'PENGINAPAN')
      .map((t: any) => `- ${t.name}: ${rupiah(t.base_rate_per_night || t.base_rate)} per malam, kapasitas ${t.default_capacity || t.capacity || 2} orang (${t.description || ''})`);
    const facs = (p.facilities || [])
      .filter((f: any) => f.status !== 'INACTIVE')
      .map((f: any) => `- ${f.name} (${f.location || '-'}): kapasitas ${f.capacity} orang, ${rupiah(f.daily_rate)} per hari`);
    const rooms = (p.rooms || []);
    const active = rooms.filter((r: any) => r.status !== 'INACTIVE').length;
    return `TARIF & DATA REALTIME DARI DATABASE:\n${types.join('\n')}\nKamar aktif: ${active} dari ${rooms.length} kamar Gedung Mina.\n\nFASILITAS & GEDUNG PERTEMUAN:\n${facs.join('\n')}`;
  } catch {
    return '';
  }
}

const STATIC_KB = `
INFORMASI UMUM:
- Nama layanan: SIMAHA Papua - Sistem Informasi Manajemen Asrama Haji, UPT Asrama Haji Papua, Kementerian Haji dan Umrah Republik Indonesia.
- Alamat: ${CONTACT.address}
- Telepon kantor: ${CONTACT.phone}. WhatsApp Front Desk: ${CONTACT.waText} (${CONTACT.wa}).
- Check-in pukul 14.00 WIT, check-out pukul 12.00 WIT.
- Gedung penginapan: Gedung Mina (Lantai 1 dan Lantai 2, total 36 kamar).
  * Kamar Standar: 2 Single Bed, Rp 250.000 / malam, AC, kamar mandi dalam.
  * Kamar Superior: 1 Double Bed, Rp 300.000 / malam, AC, kamar mandi dalam.
  * Kamar M117, M217, dan M218 saat ini tidak tersedia / kosong.
- Fasilitas kegiatan: Aula Pertemuan (kapasitas hingga 500 orang), Ruang Kelas/Rapat (30-50 orang), dan Fasilitas Simulasi Manasik Haji (Miniatur Ka'bah & lintasan sa'i).
- Penerimaan pembayaran: Resmi masuk ke Kas Negara sebagai PNBP (Penerimaan Negara Bukan Pajak) Kementerian Haji dan Umrah melalui Kode Billing SIMPONI.

CARA BOOKING ONLINE:
1. Buka halaman utama website SIMAHA Papua, klik tombol "Booking Online".
2. Pilih Penginapan atau Ruang Pertemuan, tanggal check-in & check-out, serta tipe kamar.
3. Masukkan data tamu pemesan (Nama, NIK, No. HP/WhatsApp, Instansi/Jamaah).
4. Klik "Kirim Reservasi" -> Sistem langsung menerbitkan Nomor Reservasi dan Kode Billing SIMPONI.
5. Pembayaran dilakukan lewat bank (Teller, ATM, Mobile Banking: Mandiri, BRI, BNI, BSI, dll.) atau Kantor Pos menggunakan kode billing SIMPONI.
6. Status kamar dan pembayaran dapat dicek sewaktu-waktu melalui tombol "Cek Kamar" di website.
`;

const SYSTEM_PROMPT = (live: string) => `Anda adalah "Asisten SIMAHA Papua", chatbot resmi layanan Asrama Haji Papua (Kementerian Haji dan Umrah RI), aktif 24/7.
Aturan:
- Jawab dalam Bahasa Indonesia yang ramah, sopan, ringkas, dan jelas.
- Hanya jawab berdasarkan INFORMASI di bawah. Jangan mengarang tarif atau kebijakan yang tidak ada.
- Jangan meminta data rahasia pengunjung (password, PIN).
- Anda TIDAK dapat mengubah database langsung dari percakapan ini. Arahkan pengguna ke tombol "Booking Online" atau "Cek Kamar".
- Jika pertanyaan di luar topik atau butuh penanganan khusus, arahkan dengan sopan ke WhatsApp Front Desk ${CONTACT.waText} (${CONTACT.wa}) atau telepon ${CONTACT.phone}.
${STATIC_KB}
${live}`;

export function answerKnowledgeBase(q: string): string {
  const s = q.toLowerCase().trim();

  // Salam / Greeting
  if (/^(halo|hai|hi|hey|hello|assalamu|assalam|pagi|siang|sore|malam)/.test(s)) {
    return `Assalamu'alaikum & Salam Hangat!\nSaya Asisten SIMAHA Papua, siap melayani informasi Asrama Haji Papua (Kementerian Haji & Umrah RI) 24/7.\n\nAnda dapat menanyakan:\n• Tarif kamar & fasilitas\n• Cara booking online & cek kamar\n• Jam check-in / check-out\n• Fasilitas aula & manasik haji\n• Lokasi & kontak pengelola`;
  }

  // Terima kasih
  if (/(terima kasih|makasih|thanks|syukran|matur nuwun)/.test(s)) {
    return `Sama-sama! Senang dapat membantu Anda. Jika ada hal lain yang ingin ditanyakan seputar Asrama Haji Papua, jangan ragu untuk bertanya kembali. Semoga hari Anda berkah dan lancar!`;
  }

  // Tarif kamar
  if (/(tarif|harga|biaya|permalam|per malam|standar|superior|kamar berapa)/.test(s) && !/(aula|gedung pertemuan|ruang kelas|sewa aula)/.test(s)) {
    return `Tarif resmi penginapan Gedung Mina Asrama Haji Papua:\n\n• Kamar Standar: Rp 250.000 / malam (2 Single Bed, kapasitas 2 orang, AC, kamar mandi dalam)\n• Kamar Superior: Rp 300.000 / malam (1 Bed King/Queen, kapasitas 2 orang, AC, kamar mandi dalam)\n\nSemua pembayaran disetor resmi ke Kas Negara sebagai PNBP Kemenhaj RI via SIMPONI. Untuk booking langsung, silakan klik tombol "Booking Online" di halaman utama website.`;
  }

  // Aula / Fasilitas pertemuan / Manasik
  if (/(aula|gedung pertemuan|ruang rapat|ruang kelas|manasik|kabah|ka'bah|pertemuan)/.test(s)) {
    return `Fasilitas Kegiatan & Pertemuan UPT Asrama Haji Papua:\n\n1. Aula Pertemuan Utama: Kapasitas s.d 500 orang, ber-AC, sound system, panggung, dan kursi.\n2. Ruang Kelas / Rapat: Kapasitas 30–50 orang untuk bimbingan, pelatihan, atau rapat dinas.\n3. Fasilitas Manasik Haji: Miniatur Ka'bah & lintasan sa'i untuk latihan manasik jamaah, sekolah/madrasah, dan KBIHU.\n\nSimulasi tarif sewa aula/ruang kelas dapat Anda coba langsung di menu "Kalkulator Tarif" pada halaman utama, atau hubungi Front Desk: ${CONTACT.waText}.`;
  }

  // Fasilitas umum / kamar mandi / AC / Wifi / Parkir
  if (/(fasilitas|ac|wifi|parkir|kamar mandi|makan|sarapan)/.test(s)) {
    return `Fasilitas UPT Asrama Haji Papua:\n\n• Penginapan ber-AC dengan kamar mandi dalam bersih\n• Miniatur Ka'bah & lintasan simulasi manasik haji\n• Aula pertemuan besar & ruang kelas/rapat\n• Masjid/Musholla di lingkungan asrama\n• Area parkir kendaraan roda 4 dan roda 2 yang luas dan terjaga 24 jam\n• Akses listrik genset cadangan & air bersih PDAM`;
  }

  // Cara booking online / pesan kamar
  if (/(booking|cara pesan|cara booking|reservasi|daftar kamar|sewa kamar)/.test(s)) {
    return `Cara Booking Online di Website SIMAHA Papua:\n\n1. Klik tombol "Booking Online" pada menu atas atau halaman utama.\n2. Pilih jenis layanan (Penginapan atau Ruang Pertemuan) dan tentukan tanggal.\n3. Masukkan data tamu (Nama, NIK, No. HP/WhatsApp, Instansi/KBIHU).\n4. Klik "Kirim Reservasi" -> Anda langsung memperoleh Nomor Reservasi dan Kode Billing SIMPONI.\n5. Lakukan pembayaran melalui bank/pos, lalu cek status kamar Anda melalui tombol "Cek Kamar".`;
  }

  // Cek kamar / cek reservasi
  if (/(cek kamar|cek status|status reservasi|nomor reservasi|bukti booking)/.test(s)) {
    return `Untuk mengecek status reservasi Anda:\n\n1. Buka menu "Cek Kamar" di bar navigasi atas website.\n2. Masukkan NIK, Nama Lengkap, No. WhatsApp, atau Nomor Reservasi Anda.\n3. Sistem akan langsung menampilkan detail pesanan, status verifikasi, dan nomor kamar yang dialokasikan.`;
  }

  // Jam check-in & check-out
  if (/(check.?in|check.?out|jam berapa|waktu datang|pukul)/.test(s)) {
    return `Ketentuan Waktu Check-In & Check-Out:\n\n• Check-In: Mulai pukul 14.00 WIT\n• Check-Out: Maksimal pukul 12.00 WIT\n\nPetugas Front Desk dan keamanan bertugas 24 jam. Jika Anda tiba lebih awal (early check-in) atau memerlukan perpanjangan waktu, mohon konfirmasi terlebih dahulu dengan petugas di ${CONTACT.waText}.`;
  }

  // Cara pembayaran / SIMPONI / Rekening / Transfer
  if (/(bayar|pembayaran|simponi|transfer|rekening|metode|bni|bri|mandiri|bsi|pos)/.test(s)) {
    return `Sistem Pembayaran Resmi (PNBP - SIMPONI):\n\nPembayaran tidak melalui rekening pribadi perorangan, melainkan menggunakan Kode Billing SIMPONI Kementerian Haji & Umrah RI yang terbit otomatis saat reservasi.\n\nCara bayar:\n• ATM / Teller Bank (Mandiri, BRI, BNI, BSI, BCA, Bank Papua, dll.)\n• Mobile Banking (menu Pembayaran PNBP/Penerimaan Negara)\n• Kantor Pos Indonesia\n\nSetelah dibayar, sistem akan memvalidasi NTPN (Nomor Transaksi Penerimaan Negara).`;
  }

  // Syarat menginap / Tamu umum
  if (/(syarat|masyarakat umum|umum boleh|jamaah|aturan|ktp)/.test(s)) {
    return `Ketentuan & Syarat Menginap:\n\n• Asrama Haji Papua melayani jamaah haji/umrah, kementerian/lembaga, instansi kedinasan, swasta, dan masyarakat umum di luar musim operasional haji.\n• Tamu wajib menunjukkan identitas diri resmi (KTP/SIM/Paspor) saat check-in di Front Desk.\n• Menjaga ketertiban, kebersihan, dan norma kesopanan di lingkungan UPT Asrama Haji Papua.`;
  }

  // Alamat & Lokasi
  if (/(alamat|lokasi|dimana|di mana|tempat|posisi|kotaraja|abepura|peta)/.test(s)) {
    return `Lokasi UPT Asrama Haji Papua:\n\n${CONTACT.address}\n\nLokasi strategis di kawasan Kotaraja - Abepura, Kota Jayapura, mudah dijangkau dari pusat kota Jayapura maupun dari Bandara Sentani.`;
  }

  // Kontak & WhatsApp
  if (/(kontak|wa|whatsapp|telepon|no hp|nomor telp|hubungi|call center|pengelola)/.test(s)) {
    return `Kontak Layanan UPT Asrama Haji Papua:\n\n• WhatsApp Front Desk: ${CONTACT.waText} (${CONTACT.wa})\n• Telepon Kantor: ${CONTACT.phone}\n• Pelayanan: 24 Jam Setiap Hari\n• Email/Web: Sistem SIMAHA Papua Online`;
  }

  // Pembatalan / Reschedule
  if (/(batal|cancel|reschedule|ganti tanggal|ubah jadwal)/.test(s)) {
    return `Untuk pembatalan atau perubahan jadwal (reschedule) reservasi:\n\nSilakan hubungi petugas Front Desk melalui WhatsApp di ${CONTACT.waText} (${CONTACT.wa}) dengan menyertakan Nomor Reservasi dan NIK pemesan agar dapat dibantu penyesuaian jadwal sesuai ketersediaan kamar.`;
  }

  // Fallback default
  return `Terima kasih atas pertanyaan Anda. Untuk informasi lebih mendalam atau bantuan khusus mengenai hal ini, Anda dapat langsung menghubungi Petugas Front Desk Asrama Haji Papua via WhatsApp di ${CONTACT.waText} (${CONTACT.wa}) atau telepon ${CONTACT.phone}. Kami siap melayani Anda 24 jam!`;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ reply: 'Method Not Allowed' });

  const ip = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  if (limited(ip)) return res.status(429).json({ reply: 'Terlalu banyak pesan. Mohon coba lagi sebentar lagi.' });

  let body: any = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const incoming = Array.isArray(body?.messages) ? body.messages : [];
  const messages = incoming
    .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-8)
    .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 600) }));
  const last = [...messages].reverse().find((m: any) => m.role === 'user');
  if (!last) return res.status(400).json({ reply: 'Pesan kosong.' });

  const geminiKey = process.env.GEMINI_API_KEY;
  const oidcOrGateway = req.headers['x-vercel-oidc-token'] || process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;

  // 1. If direct GEMINI_API_KEY is available, call Google Gemini REST API
  if (geminiKey) {
    try {
      const live = await loadLiveFacts();
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 18_000);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const r = await fetch(url, {
        method: 'POST',
        signal: ctl.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT(live) }] },
          contents: messages.map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
          },
        }),
      });
      clearTimeout(timer);
      if (r.ok) {
        const j: any = await r.json();
        const text = j?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          return res.status(200).json({ reply: text, mode: 'gemini-direct' });
        }
      }
    } catch {
      // Fall through to AI Gateway or KB fallback
    }
  }

  // 2. If AI Gateway or Vercel OIDC is available, call AI Gateway
  if (oidcOrGateway) {
    try {
      const live = await loadLiveFacts();
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 18_000);
      const r = await fetch(GATEWAY_URL, {
        method: 'POST',
        signal: ctl.signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${oidcOrGateway}` },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 500,
          temperature: 0.3,
          messages: [{ role: 'system', content: SYSTEM_PROMPT(live) }, ...messages],
        }),
      });
      clearTimeout(timer);
      if (r.ok) {
        const j: any = await r.json();
        const reply = j?.choices?.[0]?.message?.content?.trim();
        if (reply) {
          return res.status(200).json({ reply, mode: 'ai-gateway' });
        }
      }
    } catch {
      // Fall through to KB fallback
    }
  }

  // 3. Ultra-fast, highly accurate offline knowledge base
  const fallback = answerKnowledgeBase(last.content);
  return res.status(200).json({ reply: fallback, mode: 'knowledge-base' });
}
