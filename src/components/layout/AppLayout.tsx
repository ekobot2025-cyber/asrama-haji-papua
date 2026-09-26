import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { GlobalSearchModal } from './GlobalSearchModal';
import { HelpGuideModal } from '../common/HelpGuideModal';
import { BookOpen, HelpCircle } from 'lucide-react';

interface AppLayoutProps {
  currentPage: string;
  onNavigate: (page: string, targetId?: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentPage,
  onNavigate,
  children,
}) => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Keyboard shortcut Ctrl+K / Cmd+K for search, and F1 / ? for Help SOP
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Search shortcut
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      // F1 or ? (when not typing in an input)
      if (e.key === 'F1') {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
      }
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (e.key === '?' && !isInput) {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onOpenHelpGuide={() => setIsHelpOpen(true)}
      />

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Header
          onOpenMobileMenu={() => setIsOpenMobile(true)}
          onOpenGlobalSearch={() => setIsSearchOpen(true)}
          onOpenHelpGuide={() => setIsHelpOpen(true)}
          onNavigate={onNavigate}
          collapsed={collapsed}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-16">
          {children}
        </main>
      </div>

      {/* Floating Quick Help Guide Trigger Button (Bottom Right) */}
      <div className="fixed bottom-4 right-4 z-20 no-print">
        <button
          onClick={() => setIsHelpOpen(true)}
          title="Buku Panduan & SOP Operasional (Tekan F1)"
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white px-3.5 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 border border-emerald-600/50 group"
        >
          <HelpCircle className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-bold tracking-wide hidden sm:inline">Panduan SOP</span>
          <kbd className="hidden md:inline text-[9px] bg-emerald-900/80 px-1.5 py-0.5 rounded border border-emerald-700/60 font-mono text-emerald-200">
            F1
          </kbd>
        </button>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={onNavigate}
      />

      {/* Interactive SOP & Help Guide Modal */}
      <HelpGuideModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
};
