import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = 
        window.pageYOffset || 
        document.documentElement.scrollTop || 
        document.body.scrollTop || 
        0;

      setVisible(scrollPos > 180);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount in case page is already scrolled
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    document.body.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 no-print">
      <button
        onClick={handleScrollToTop}
        title="Kembali ke Halaman Paling Atas"
        aria-label="Kembali ke Halaman Paling Atas"
        className={`flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-950 via-emerald-800 to-emerald-700 hover:from-emerald-900 hover:to-emerald-600 text-white shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 cursor-pointer group ${
          visible
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-4 scale-75 pointer-events-none'
        }`}
      >
        <ArrowUp className="w-5 h-5 text-amber-300 stroke-[2.8] group-hover:-translate-y-0.5 transition-transform" />
      </button>
    </div>
  );
};
