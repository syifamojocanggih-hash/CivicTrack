import React, { useState } from 'react';
import { LogOut, Menu, X, Shield } from 'lucide-react';
import type { UserProfile } from '../types';

interface NavbarProps {
  currentUser: UserProfile | null;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  onFilterCategory?: (cat: string | null) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  activeNav,
  setActiveNav,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (nav: string, href: string) => {
    setActiveNav(nav);
    setIsMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#DCE0E6] h-14 flex items-center px-4 sm:px-8 transition-all">
      <div className="w-full max-w-[1180px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); handleNavClick('peta', '#hero'); }}
          className="flex items-center gap-2.5 font-['DM_Sans'] font-extrabold text-[18px] text-[#184C78] no-underline tracking-[-0.4px] mr-4 sm:mr-9 shrink-0 group"
        >
          <div className="w-[30px] height-[30px] h-[30px] bg-[#184C78] rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="tracking-tight">CivicTrack</span>
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          <button
            onClick={() => handleNavClick('peta', '#hero')}
            className={`px-3 py-1.5 text-[14px] font-medium rounded-lg transition-colors cursor-pointer ${
              activeNav === 'peta' ? 'text-[#184C78] font-semibold bg-[#F5F7FA]' : 'text-[#6C757D] hover:bg-[#F5F7FA] hover:text-[#212529]'
            }`}
          >
            Peta Proyek
          </button>
          <button
            onClick={() => handleNavClick('daftar', '#recent-projects')}
            className={`px-3 py-1.5 text-[14px] font-medium rounded-lg transition-colors cursor-pointer ${
              activeNav === 'daftar' ? 'text-[#184C78] font-semibold bg-[#F5F7FA]' : 'text-[#6C757D] hover:bg-[#F5F7FA] hover:text-[#212529]'
            }`}
          >
            Daftar Proyek
          </button>
          <button
            onClick={() => handleNavClick('statistik', '#stats')}
            className={`px-3 py-1.5 text-[14px] font-medium rounded-lg transition-colors cursor-pointer ${
              activeNav === 'statistik' ? 'text-[#184C78] font-semibold bg-[#F5F7FA]' : 'text-[#6C757D] hover:bg-[#F5F7FA] hover:text-[#212529]'
            }`}
          >
            Statistik
          </button>
          <button
            onClick={() => handleNavClick('fitur', '#features')}
            className={`px-3 py-1.5 text-[14px] font-medium rounded-lg transition-colors cursor-pointer ${
              activeNav === 'fitur' ? 'text-[#184C78] font-semibold bg-[#F5F7FA]' : 'text-[#6C757D] hover:bg-[#F5F7FA] hover:text-[#212529]'
            }`}
          >
            Fitur &amp; API
          </button>
          <button
            onClick={() => handleNavClick('tentang', '#how-it-works')}
            className={`px-3 py-1.5 text-[14px] font-medium rounded-lg transition-colors cursor-pointer ${
              activeNav === 'tentang' ? 'text-[#184C78] font-semibold bg-[#F5F7FA]' : 'text-[#6C757D] hover:bg-[#F5F7FA] hover:text-[#212529]'
            }`}
          >
            Tentang
          </button>
        </div>

        {/* Right action buttons / User status */}
        <div className="hidden sm:flex items-center gap-2.5">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#EBF4FB] border border-[#c5def2] px-3 py-1 rounded-full text-xs font-medium text-[#184C78]">
                <Shield className="w-3.5 h-3.5 text-[#2980B9]" />
                <span className="font-semibold">{currentUser.nama}</span>
                <span className="text-[11px] opacity-75 capitalize">({currentUser.role.replace('_', ' ')})</span>
              </div>
              <button
                onClick={onLogout}
                title="Keluar"
                className="btn-ghost !h-8 !px-2.5 text-[#6C757D] hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('login')}
                className="btn-ghost"
              >
                Masuk
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="btn-primary shadow-sm"
              >
                Daftar Akun
              </button>
            </>
          )}
        </div>

        {/* Mobile menu hamburger toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-[#184C78] rounded-lg hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-14 left-0 right-0 bg-white border-b border-[#DCE0E6] shadow-lg p-4 flex flex-col gap-2 md:hidden">
          <button
            onClick={() => handleNavClick('peta', '#hero')}
            className="text-left px-3 py-2 text-sm font-medium text-[#212529] hover:bg-[#F5F7FA] rounded-md"
          >
            Peta Proyek
          </button>
          <button
            onClick={() => handleNavClick('daftar', '#recent-projects')}
            className="text-left px-3 py-2 text-sm font-medium text-[#212529] hover:bg-[#F5F7FA] rounded-md"
          >
            Daftar Proyek
          </button>
          <button
            onClick={() => handleNavClick('statistik', '#stats')}
            className="text-left px-3 py-2 text-sm font-medium text-[#212529] hover:bg-[#F5F7FA] rounded-md"
          >
            Statistik
          </button>
          <button
            onClick={() => handleNavClick('fitur', '#features')}
            className="text-left px-3 py-2 text-sm font-medium text-[#212529] hover:bg-[#F5F7FA] rounded-md"
          >
            Fitur &amp; API
          </button>
          <div className="pt-2 border-t border-[#DCE0E6] flex gap-2">
            {currentUser ? (
              <div className="w-full flex items-center justify-between">
                <span className="text-xs font-semibold text-[#184C78]">{currentUser.nama} ({currentUser.role})</span>
                <button onClick={onLogout} className="btn-ghost !h-8 !px-3 text-xs text-red-600">Keluar</button>
              </div>
            ) : (
              <>
                <button onClick={() => { setIsMobileMenuOpen(false); onOpenAuth('login'); }} className="btn-ghost flex-1">Masuk</button>
                <button onClick={() => { setIsMobileMenuOpen(false); onOpenAuth('register'); }} className="btn-primary flex-1">Daftar</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
