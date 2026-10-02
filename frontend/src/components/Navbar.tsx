import React, { useState } from 'react';
import { LogOut, Menu, X, Shield, Database } from 'lucide-react';
import type { UserProfile } from '../types';

interface NavbarProps {
  currentUser: UserProfile | null;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  onFilterCategory?: (cat: string | null) => void;
  currentView?: 'landing' | 'dashboard' | 'map-explorer';
  onNavigateView?: (view: 'landing' | 'dashboard' | 'map-explorer') => void;
  onOpenOpenData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  activeNav,
  setActiveNav,
  currentView = 'landing',
  onNavigateView,
  onOpenOpenData,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (nav: string, href: string) => {
    setActiveNav(nav);
    setIsMobileMenuOpen(false);
    if (currentView !== 'landing' && onNavigateView) {
      onNavigateView('landing');
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#DCE0E6] h-14 flex items-center px-4 sm:px-8 transition-all">
      <div className="w-full max-w-[1180px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); handleNavClick('beranda', '#hero'); }}
          className="flex items-center gap-2.5 font-['DM_Sans'] font-extrabold text-[18px] text-[#184C78] no-underline tracking-[-0.4px] mr-4 sm:mr-6 shrink-0 group"
        >
          <div className="w-[30px] h-[30px] bg-[#184C78] rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="tracking-tight">CivicTrack</span>
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 flex-1 ml-3">
          <button
            onClick={() => handleNavClick('beranda', '#hero')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeNav === 'beranda' && currentView === 'landing' ? 'text-[#184C78] font-bold bg-[#EBF4FB]' : 'text-[#6C757D] hover:bg-[#F5F7FA] hover:text-[#184C78]'
            }`}
          >
            Beranda
          </button>

          <button
            onClick={() => handleNavClick('daftar', '#recent-projects')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeNav === 'daftar' && currentView === 'landing' ? 'text-[#184C78] font-bold bg-[#EBF4FB]' : 'text-[#6C757D] hover:bg-[#F5F7FA] hover:text-[#184C78]'
            }`}
          >
            Daftar Proyek
          </button>

          <button
            onClick={() => handleNavClick('fitur', '#features')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeNav === 'fitur' && currentView === 'landing' ? 'text-[#184C78] font-bold bg-[#EBF4FB]' : 'text-[#6C757D] hover:bg-[#F5F7FA] hover:text-[#184C78]'
            }`}
          >
            Fitur
          </button>

          <button
            onClick={() => handleNavClick('alur', '#how-it-works')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeNav === 'alur' && currentView === 'landing' ? 'text-[#184C78] font-bold bg-[#EBF4FB]' : 'text-[#6C757D] hover:bg-[#F5F7FA] hover:text-[#184C78]'
            }`}
          >
            Alur Partisipasi
          </button>

          {onOpenOpenData && (
            <button
              onClick={onOpenOpenData}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg text-[#6C757D] hover:bg-[#F5F7FA] hover:text-[#184C78] transition-colors cursor-pointer flex items-center gap-1"
            >
              <Database className="w-3 h-3 text-slate-400" />
              <span>Open Data</span>
            </button>
          )}
        </div>

        {/* Right action buttons / User status */}
        <div className="hidden sm:flex items-center gap-2.5">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateView && onNavigateView('dashboard')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-[#184C78] text-white shadow-xs hover:bg-[#12395b]"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Buka Dashboard</span>
              </button>

              <div className="flex items-center gap-2 bg-[#F5F7FA] border border-[#DCE0E6] px-3 py-1 rounded-full text-xs font-medium text-[#184C78]">
                <span className="font-semibold">{currentUser.nama}</span>
                <span className="text-[10px] text-[#6C757D] capitalize">({currentUser.role.replace('_', ' ')})</span>
              </div>
              <button
                onClick={onLogout}
                title="Keluar"
                className="btn-ghost !h-8 !px-2.5 text-[#6C757D] hover:text-red-600 hover:border-red-200 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('login')}
                className="btn-ghost cursor-pointer"
              >
                Masuk
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="btn-primary shadow-sm cursor-pointer"
              >
                Daftar Akun
              </button>
            </>
          )}
        </div>

        {/* Mobile menu hamburger toggle */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-[#184C78] rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-14 left-0 right-0 bg-white border-b border-[#DCE0E6] shadow-lg p-4 flex flex-col gap-2 lg:hidden animate-fade-in z-50">
          <button
            onClick={() => handleNavClick('beranda', '#hero')}
            className={`text-left px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeNav === 'beranda' ? 'text-[#184C78] font-bold bg-[#EBF4FB]' : 'text-[#212529] hover:bg-[#F5F7FA]'
            }`}
          >
            🏠 Beranda Utama
          </button>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onNavigateView && onNavigateView('map-explorer');
            }}
            className="text-left px-3 py-2 text-sm font-semibold rounded-lg text-slate-700 hover:bg-[#F5F7FA] hover:text-[#184C78] transition-colors"
          >
            🗺️ Peta Spasial
          </button>

          <button
            onClick={() => handleNavClick('daftar', '#recent-projects')}
            className={`text-left px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeNav === 'daftar' ? 'text-[#184C78] font-bold bg-[#EBF4FB]' : 'text-[#212529] hover:bg-[#F5F7FA]'
            }`}
          >
            📋 Daftar Proyek
          </button>

          <button
            onClick={() => handleNavClick('fitur', '#features')}
            className={`text-left px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeNav === 'fitur' ? 'text-[#184C78] font-bold bg-[#EBF4FB]' : 'text-[#212529] hover:bg-[#F5F7FA]'
            }`}
          >
            ✨ Fitur Unggulan
          </button>

          <button
            onClick={() => handleNavClick('alur', '#how-it-works')}
            className={`text-left px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeNav === 'alur' ? 'text-[#184C78] font-bold bg-[#EBF4FB]' : 'text-[#212529] hover:bg-[#F5F7FA]'
            }`}
          >
            🧭 Alur Partisipasi
          </button>

          {onOpenOpenData && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenOpenData();
              }}
              className="text-left px-3 py-2 text-sm font-semibold rounded-lg text-slate-700 hover:bg-[#F5F7FA] flex items-center gap-2"
            >
              <Database className="w-4 h-4 text-slate-400" />
              <span>Open Data REST API</span>
            </button>
          )}

          <div className="pt-2 border-t border-[#DCE0E6] flex flex-col gap-2">
            {currentUser ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-[#184C78]">{currentUser.nama}</span>
                  <span className="text-[10px] text-slate-500 capitalize">({currentUser.role.replace('_', ' ')})</span>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigateView && onNavigateView('dashboard');
                  }}
                  className="w-full py-2 bg-[#184C78] text-white text-xs font-bold rounded-lg text-center shadow-xs"
                >
                  Buka Dashboard
                </button>
                <button onClick={onLogout} className="text-center py-1.5 text-xs text-red-600 hover:underline">
                  Keluar dari Akun
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => { setIsMobileMenuOpen(false); onOpenAuth('login'); }} className="btn-ghost flex-1">Masuk</button>
                <button onClick={() => { setIsMobileMenuOpen(false); onOpenAuth('register'); }} className="btn-primary flex-1">Daftar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
