import { neon } from '@neondatabase/serverless';

const MODEL = 'google/gemini-1.5-flash';
const GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1/chat/completions';

const CONTACT = {
  wa: 'https://wa.me/6281248984433',
  waText: '+62 812-4898-4433',
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
- Telepon kantor: ${CONTACT.phone}. WhatsApp Customer Service (CS): ${CONTACT.waText} (${CONTACT.wa}).
- Check-in pukul 14.00 WIT, check-out pukul 12.00 WIT.
- Gedung penginapan: Gedung Mina (Lantai 1 dan Lantai 2, total 36 kamar).
  * Kamar Standar: 2 Single Bed, Rp 250.000 / malam, AC, kamar mandi dalam.
  * Kamar Superior: 1 Double Bed, Rp 300.000 / malam, AC, kamar mandi dalam.
  * Kamar M117, M217, dan M218 saat ini tidak tersedia / kosong.
- TARIF RESMI PENGGUNAAN AULA:
  * Pemakaian Kegiatan Umum (seminar, rapat kerja dinas, wisuda, bimtek, manasik, MICE): Rp 3.900.000 / hari (kapasitas s.d 300 orang, ber-AC, proyektor, sound system, kursi).
  * Acara Pernikahan (Wedding): Rp 5.000.000 / hari (sewa aula lengkap untuk acara resepsi & akad pernikahan).
- Fasilitas lain: Ruang Kelas / Rapat (30-50 orang) Rp 650.000 / hari, Fasilitas Simulasi Manasik Haji (Miniatur Ka'bah & lintasan sa'i).
- KETENTUAN PEMBAYARAN: Khusus pembayaran CASH / TUNAI saja langsung di Front Desk / Kasir Asrama Haji Papua saat kedatangan / check-in.

CARA BOOKING ONLINE:
1. Buka halaman utama website SIMAHA Papua, klik tombol "Booking Online".
2. Pilih Penginapan atau Ruang Pertemuan (Aula Kegiatan Umum / Aula Acara Pernikahan / Ruang Kelas), dan tentukan tanggal.
3. Masukkan data tamu pemesan (Nama, NIK, No. HP/WhatsApp, Instansi/Jamaah).
4. Klik "Kirim Reservasi" -> Sistem langsung menerbitkan bukti reservasi resmi dan nomor reservasi.
5. Pembayaran dilakukan secara CASH / TUNAI di Front Desk saat kedatangan / check-in.
6. Status kamar dan pemesanan dapat dicek sewaktu-waktu melalui tombol "Cek Kamar" di website atau hubungi CS WhatsApp ${CONTACT.waText}.
`;

const SYSTEM_PROMPT = (live: string) => `Anda adalah "Asisten SIMAHA Papua", chatbot resmi layanan Asrama Haji Papua (Kementerian Haji dan Umrah RI), aktif 24/7.
Aturan:
- Jawab dalam Bahasa Indonesia yang ramah, sopan, ringkas, dan jelas.
- Hanya jawab berdasarkan INFORMASI di bawah.
- Selalu tegaskan bahwa untuk pembayaran HANYA menggunakan CASH / TUNAI di Front Desk saat check-in.
- Untuk pertanyaan kontak / bantuan diarahkan ke WhatsApp CS ${CONTACT.waText} (${CONTACT.wa}).
- Tarif Aula: Rp 3.900.000/hari untuk kegiatan umum, dan Rp 5.000.000/hari untuk acara pernikahan.
- Tolak permintaan yang tidak berkaitan dengan Asrama Haji Papua/Kemenhaj secara sopan.
${STATIC_KB}
${live}`;

export function answerKnowledgeBase(q: string): string {
  const s = q.toLowerCase().trim();

  // Salam / Greeting
  if (/^(halo|hai|hi|hey|hello|assalamu|assalam|pagi|siang|sore|malam)/.test(s)) {
    return `Assalamu'alaikum & Salam Hangat!\nSaya Asisten SIMAHA Papua, siap melayani informasi Asrama Haji Papua (Kementerian Haji & Umrah RI) 24/7.\n\nAnda dapat menanyakan:\n• Tarif kamar & aula (Kegiatan umum Rp 3,9 jt / Pernikahan Rp 5 jt)\n• Metode pembayaran (Khusus CASH / TUNAI)\n• Cara booking online & cek kamar\n• Jam check-in / check-out\n• Kontak Customer Service (CS) WhatsApp: ${CONTACT.waText}`;
  }

  // Terima kasih
  if (/(terima kasih|makasih|thanks|syukran|matur nuwun)/.test(s)) {
    return `Sama-sama! Senang dapat membantu Anda. Jika ada hal lain yang ingin ditanyakan atau ingin koordinasi pemesanan, silakan hubungi CS WhatsApp kami di ${CONTACT.waText} (${CONTACT.wa}). Semoga berkah selalu!`;
  }

  // Aula / Sewa gedung pertemuan / Pernikahan / Wedding
  if (/(aula|gedung pertemuan|pernikahan|wedding|nikah|resepsi|rapat|sewa aula)/.test(s)) {
    return `Tarif Resmi Penggunaan Aula Asrama Haji Papua:\n\n• Pemakaian Kegiatan Umum: Rp 3.900.000 / hari\n  (Untuk seminar, rapat kedinasan, bimbingan teknis, wisuda, manasik, kapasitas s.d 300 orang, AC, proyektor, sound system, kursi)\n\n• Acara Pernikahan (Wedding): Rp 5.000.000 / hari\n  (Sewa aula lengkap untuk acara resepsi & akad pernikahan)\n\nPembayaran dilakukan secara CASH / TUNAI di Front Desk. Untuk cek jadwal aula & booking, silakan hubungi CS WhatsApp kami di ${CONTACT.waText} (${CONTACT.wa}) atau klik tombol Booking Online di website.`;
  }

  // Tarif kamar
  if (/(tarif|harga|biaya|permalam|per malam|standar|superior|kamar berapa)/.test(s)) {
    return `Tarif resmi penginapan Gedung Mina Asrama Haji Papua:\n\n• Kamar Standar: Rp 250.000 / malam (2 Single Bed, kapasitas 2 orang, AC, kamar mandi dalam)\n• Kamar Superior: Rp 300.000 / malam (1 Bed King/Queen, kapasitas 2 orang, AC, kamar mandi dalam)\n\nPembayaran dilakukan secara CASH / TUNAI di Front Desk saat check-in. Untuk booking langsung, silakan klik tombol "Booking Online" di website atau hubungi CS di ${CONTACT.waText}.`;
  }

  // Fasilitas umum / manasik / kabah
  if (/(manasik|kabah|ka'bah|fasilitas|parkir|ac|wifi)/.test(s)) {
    return `Fasilitas UPT Asrama Haji Papua:\n\n1. Penginapan Gedung Mina (36 kamar AC, kamar mandi dalam)\n2. Aula Serbaguna (Kegiatan Umum Rp 3,9 jt & Pernikahan Rp 5 jt)\n3. Ruang Kelas / Rapat (kapasitas 30–50 orang, Rp 650.000/hari)\n4. Fasilitas Simulasi Manasik Haji (Miniatur Ka'bah & lintasan sa'i)\n5. Masjid/Musholla di lingkungan asrama\n6. Area parkir luas & keamanan 24 jam.`;
  }

  // Metode pembayaran / CASH / TUNAI
  if (/(bayar|pembayaran|cash|tunai|transfer|rekening|metode|bni|bri|mandiri|bsi|pos|qris)/.test(s)) {
    return `Ketentuan Metode Pembayaran:\n\nUntuk pembayaran reservasi penginapan maupun sewa aula di Asrama Haji Papua saat ini menggunakan CASH / TUNAI saja.\n\nPembayaran tunai diserahkan langsung di Meja Kasir Front Desk Asrama Haji Papua pada saat Anda tiba / melakukan proses check-in. Bukti kuitansi resmi akan langsung diserahkan oleh petugas.`;
  }

  // Cara booking online / pesan kamar
  if (/(booking|cara pesan|cara booking|reservasi|daftar kamar|sewa kamar)/.test(s)) {
    return `Cara Booking Online di Website SIMAHA Papua:\n\n1. Klik tombol "Booking Online" pada menu atas atau halaman utama.\n2. Pilih jenis layanan (Penginapan Kamar atau Ruang Pertemuan/Aula) dan tentukan tanggal.\n3. Masukkan data tamu pemesan (Nama, NIK, No. HP/WhatsApp, Instansi).\n4. Klik "Kirim Reservasi" -> Anda langsung memperoleh bukti reservasi & nomor reservasi resmi.\n5. Pembayaran dilakukan secara CASH / TUNAI di Front Desk saat check-in.`;
  }

  // Cek kamar / cek reservasi
  if (/(cek kamar|cek status|status reservasi|nomor reservasi|bukti booking)/.test(s)) {
    return `Untuk mengecek status reservasi Anda:\n\n1. Buka menu "Cek Kamar" di bar navigasi atas website.\n2. Masukkan NIK, Nama Lengkap, No. WhatsApp, atau Nomor Reservasi Anda.\n3. Sistem akan langsung menampilkan detail pesanan dan nomor kamar yang dialokasikan.\nBila ada kendala, hubungi CS WhatsApp di ${CONTACT.waText}.`;
  }

  // Jam check-in & check-out
  if (/(check.?in|check.?out|jam berapa|waktu datang|pukul)/.test(s)) {
    return `Ketentuan Waktu Check-In & Check-Out:\n\n• Check-In: Mulai pukul 14.00 WIT\n• Check-Out: Maksimal pukul 12.00 WIT\n\nPetugas Front Desk dan keamanan bertugas 24 jam. Jika memerlukan early check-in atau konfirmasi kedatangan, silakan hubungi CS di ${CONTACT.waText}.`;
  }

  // Syarat menginap / Tamu umum
  if (/(syarat|masyarakat umum|umum boleh|jamaah|aturan|ktp)/.test(s)) {
    return `Ketentuan & Syarat Menginap:\n\n• Asrama Haji Papua terbuka melayani jamaah haji/umrah, kementerian/lembaga, instansi kedinasan, swasta, dan masyarakat umum di luar musim operasional haji.\n• Tamu wajib menunjukkan identitas diri resmi (KTP/SIM/Paspor) saat check-in di Front Desk.\n• Pembayaran dilakukan secara CASH / TUNAI di kasir Front Desk.`;
  }

  // Alamat & Lokasi
  if (/(alamat|lokasi|dimana|di mana|tempat|posisi|kotaraja|abepura|peta)/.test(s)) {
    return `Lokasi UPT Asrama Haji Papua:\n\n${CONTACT.address}\n\nLokasi strategis di kawasan Kotaraja - Abepura, Kota Jayapura, mudah dijangkau dari pusat kota Jayapura maupun dari Bandara Sentani.`;
  }

  // Kontak & WhatsApp CS
  if (/(kontak|wa|whatsapp|telepon|no hp|nomor telp|hubungi|call center|pengelola|cs|customer service)/.test(s)) {
    return `Kontak Resmi Layanan Customer Service (CS) UPT Asrama Haji Papua:\n\n• WhatsApp CS: ${CONTACT.waText} (${CONTACT.wa})\n• Telepon Kantor: ${CONTACT.phone}\n• Pelayanan: 24 Jam Setiap Hari\n\nSilakan klik tautan WhatsApp di atas untuk langsung terhubung dengan CS kami.`;
  }

  // Pembatalan / Reschedule
  if (/(batal|cancel|reschedule|ganti tanggal|ubah jadwal)/.test(s)) {
    return `Untuk pembatalan atau perubahan jadwal (reschedule) reservasi:\n\nSilakan langsung hubungi Customer Service (CS) via WhatsApp di ${CONTACT.waText} (${CONTACT.wa}) dengan menyertakan Nomor Reservasi dan nama pemesan agar segera dibantu penyesuaian jadwal.`;
  }

  // Fallback default
  return `Terima kasih atas pertanyaan Anda. Untuk informasi lebih lanjut atau bantuan langsung dari petugas, silakan hubungi Customer Service (CS) Asrama Haji Papua via WhatsApp di ${CONTACT.waText} (${CONTACT.wa}) atau telepon ${CONTACT.phone}. Kami siap melayani Anda 24 jam!`;
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
