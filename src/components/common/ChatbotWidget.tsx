import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';

interface Msg { role: 'user' | 'assistant'; content: string }

const WA = 'https://wa.me/6281248001234';
const SUGGESTIONS = ['Berapa tarif kamar?', 'Bagaimana cara booking online?', 'Jam check-in & check-out?', 'Fasilitas apa saja yang tersedia?'];

export const ChatbotWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'assistant', content: 'Assalamualaikum! Saya Asisten SIMAHA Papua, siap membantu 24 jam. Tanyakan seputar tarif, fasilitas, cara booking, atau info Asrama Haji Papua.' },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, open, loading]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    const next: Msg[] = [...msgs, { role: 'user', content }];
    setMsgs(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(1) }),
      });
      const j = await res.json();
      setMsgs([...next, { role: 'assistant', content: j.reply || 'Maaf, terjadi kendala.' }]);
    } catch {
      setMsgs([...next, { role: 'assistant', content: 'Maaf, koneksi bermasalah. Silakan hubungi Front Desk via WhatsApp 0812-4800-1234.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-[60] w-[calc(100vw-2rem)] sm:w-96 h-[70vh] max-h-[560px] flex flex-col rounded-2xl bg-white shadow-2xl border border-[#e8dfc8] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#8a6d2b] to-[#c9a961] text-white">
            <Bot className="w-5 h-5" />
            <div className="flex-1">
              <div className="text-sm font-bold leading-tight">Asisten SIMAHA Papua</div>
              <div className="text-[10px] opacity-90 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-300" /> Online 24/7</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Tutup chat" className="p-1 rounded hover:bg-white/20"><X className="w-4 h-4" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#FAF9F5]">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-[#b8941e] text-white rounded-br-sm' : 'bg-white border border-[#e8dfc8] text-stone-800 rounded-bl-sm'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start"><div className="px-3 py-2 rounded-2xl bg-white border border-[#e8dfc8] text-xs text-stone-500 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Mengetik...</div></div>
            )}
            {msgs.length === 1 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-[#c9a961]/50 text-[#8a6d2b] hover:bg-[#fbf8ee]">{s}</button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-[#e8dfc8] bg-white p-2">
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={500}
                placeholder="Tulis pertanyaan Anda..."
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-[#e8dfc8] focus:outline-none focus:ring-2 focus:ring-[#c9a961]/40"
              />
              <button type="submit" disabled={loading || !input.trim()} aria-label="Kirim" className="px-3 rounded-xl bg-[#b8941e] text-white disabled:opacity-50"><Send className="w-4 h-4" /></button>
            </form>
            <a href={WA} target="_blank" rel="noreferrer" className="block text-center text-[10px] text-stone-500 hover:text-[#8a6d2b] mt-1.5">Butuh petugas? Hubungi Front Desk via WhatsApp</a>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Buka chatbot"
        className="fixed bottom-6 right-4 sm:right-6 z-[60] w-14 h-14 rounded-full bg-gradient-to-br from-[#c9a961] to-[#8a6d2b] text-white shadow-xl flex items-center justify-center hover:scale-105 transition-transform"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </>
  );
};
