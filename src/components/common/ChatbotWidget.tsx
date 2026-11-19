import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, RotateCcw } from 'lucide-react';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  time?: string;
}

const WA = 'https://wa.me/6281248001234';
const SUGGESTIONS = [
  'Berapa tarif kamar?',
  'Bagaimana cara booking online?',
  'Fasilitas apa saja yang tersedia?',
  'Jam check-in & check-out?',
  'Bisa sewa aula pertemuan?',
  'Metode pembayaran SIMPONI?',
  'Lokasi & kontak Front Desk?',
];

const INITIAL_MSG: Msg = {
  role: 'assistant',
  content: 'Assalamu\'alaikum! Saya Asisten Virtual SIMAHA Papua, siap membantu 24/7.\n\nAda yang dapat kami bantu seputar tarif kamar Gedung Mina, fasilitas aula, simulasi manasik haji, atau tata cara booking online?',
  time: 'Sekarang',
};

export const ChatbotWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([INITIAL_MSG]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, open, loading]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;

    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const userMsg: Msg = { role: 'user', content, time: timeStr };
    const next: Msg[] = [...msgs, userMsg];
    setMsgs(next);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next
            .filter((m) => m.content !== INITIAL_MSG.content)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const j = await res.json();
      const replyContent = j?.reply || 'Maaf, belum dapat memproses jawaban saat ini. Silakan hubungi Front Desk via WhatsApp.';
      const botTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setMsgs([...next, { role: 'assistant', content: replyContent, time: botTime }]);
    } catch {
      setMsgs([
        ...next,
        {
          role: 'assistant',
          content: 'Maaf, koneksi sedang terganggu. Silakan hubungi langsung Front Desk via WhatsApp di 0812-4800-1234 atau telepon (0967) 581-229.',
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMsgs([INITIAL_MSG]);
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-[60] w-[calc(100vw-2rem)] sm:w-96 h-[72vh] max-h-[580px] flex flex-col rounded-2xl bg-white shadow-2xl border border-[#e8dfc8] overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-[#8a6d2b] to-[#c9a961] text-white shadow-xs">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-bold leading-tight truncate">Asisten SIMAHA Papua</div>
              <div className="text-[10px] text-amber-100/90 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Layanan Informasi 24/7
              </div>
            </div>
            <button
              onClick={handleResetChat}
              title="Mulai Ulang Percakapan"
              aria-label="Mulai ulang chat"
              className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setOpen(false)}
              aria-label="Tutup chat"
              className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[#FAF9F5]">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap shadow-2xs ${
                    m.role === 'user'
                      ? 'bg-[#b8941e] text-white rounded-br-xs font-normal'
                      : 'bg-white border border-[#e8dfc8] text-stone-800 rounded-bl-xs'
                  }`}
                >
                  {m.content}
                  {m.time && (
                    <div
                      className={`text-[9px] mt-1 text-right ${
                        m.role === 'user' ? 'text-amber-100/80' : 'text-stone-400'
                      }`}
                    >
                      {m.time}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="px-3.5 py-2 rounded-2xl bg-white border border-[#e8dfc8] text-xs text-stone-500 flex items-center gap-2 shadow-2xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8a6d2b]" />
                  <span>Sedang merespons...</span>
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Quick Suggestions Chips (Horizontal scroll) */}
          <div className="px-3 py-1.5 bg-[#fbf8ee] border-t border-[#e8dfc8] overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={loading}
                className="text-[10.5px] px-2.5 py-1 rounded-full bg-white border border-[#c9a961]/40 text-[#8a6d2b] hover:bg-[#f4ebd0] whitespace-nowrap transition-colors shadow-2xs shrink-0 cursor-pointer disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Footer Input */}
          <div className="border-t border-[#e8dfc8] bg-white p-2.5 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={500}
                placeholder="Ketik pertanyaan seputar asrama haji..."
                className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-[#e8dfc8] focus:outline-none focus:ring-2 focus:ring-[#c9a961]/40 bg-[#FAF9F5] focus:bg-white text-stone-800 transition-all placeholder:text-stone-400"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Kirim"
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#c9a961] to-[#b8941e] hover:from-[#b8941e] hover:to-[#8a6d2b] text-white disabled:opacity-40 transition-all shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="flex items-center justify-between mt-1.5 px-1">
              <span className="text-[9.5px] text-stone-400">UPT Asrama Haji Papua</span>
              <a
                href={WA}
                target="_blank"
                rel="noreferrer"
                className="text-[9.5px] font-medium text-[#8a6d2b] hover:underline"
              >
                Bicara dg Petugas (WA)
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Buka Chatbot Layanan 24/7"
        title="Buka Chatbot Layanan Informasi 24/7"
        className="fixed bottom-6 right-4 sm:right-6 z-[60] w-14 h-14 rounded-full bg-gradient-to-br from-[#c9a961] via-[#b8941e] to-[#8a6d2b] text-white shadow-[0_6px_20px_rgba(184,148,30,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer ring-2 ring-white/60"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </>
  );
};
