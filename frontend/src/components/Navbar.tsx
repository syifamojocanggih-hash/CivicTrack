import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Menu, X, Shield, Database, Bell, Check } from 'lucide-react';
import type { UserProfile, ApiNotificationItem } from '../types';
import { apiService } from '../services/api';
import { CivicTrackLogo } from './CivicTrackLogo';

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
  onSelectProjectNotification?: (proyekId: number) => void;
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
  onSelectProjectNotification,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<ApiNotificationItem[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Polling notifikasi berkala saat pengguna sedang login
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }

    const fetchNotifs = () => {
      apiService.getNotifications().then((res) => {
        setNotifications(res);
      }).catch(() => {});
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000); // 30s interval
    return () => clearInterval(interval);
  }, [currentUser]);

  // Tutup dropdown saat klik di luar area notifikasi
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
    };
    if (showNotifMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifMenu]);

  const handleNotificationClick = async (item: ApiNotificationItem) => {
    if (!item.is_read) {
      await apiService.markNotificationRead(item.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
      );
    }
    if (item.proyek_id && onSelectProjectNotification) {
      onSelectProjectNotification(item.proyek_id);
      setShowNotifMenu(false);
    }
  };

  const handleMarkAllRead = async () => {
    await apiService.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (diff < 60) return 'Baru saja';
      if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
      return `${Math.floor(diff / 86400)} hari lalu`;
    } catch {
      return dateStr;
    }
  };

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
          className="flex items-center no-underline mr-4 sm:mr-6 shrink-0 group"
          title="CivicTrack Beranda"
        >
          <CivicTrackLogo size="sm" />
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
              {/* Notification Bell with Badge & Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="relative p-2 text-[#6C757D] hover:text-[#184C78] hover:bg-[#F5F7FA] rounded-lg transition-colors cursor-pointer"
                  title="Notifikasi Pembaruan Proyek"
                  aria-label="Notifikasi Pembaruan Proyek"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 bg-[#E74C3C] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifMenu && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-[#DCE0E6] p-3.5 z-50 animate-fade-in">
                    <div className="flex items-center justify-between pb-2.5 border-b border-[#DCE0E6]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#184C78]">Notifikasi Pembaruan</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold bg-[#FDEDEC] text-[#E74C3C] px-2 py-0.5 rounded-full border border-red-200">
                            {unreadCount} Baru
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-semibold text-[#2980B9] hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Tandai Semua Dibaca</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 mt-2.5 max-h-72 overflow-y-auto text-xs pr-1">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-slate-400">
                          <Bell className="w-6 h-6 mx-auto mb-2 opacity-30" />
                          <p className="text-[11px] font-medium">Belum ada notifikasi pembaruan</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Ikuti proyek untuk menerima notifikasi tahapan & progres.</p>
                        </div>
                      ) : (
                        notifications.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleNotificationClick(item)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                              !item.is_read
                                ? 'bg-[#EBF4FB]/70 border-[#2980B9]/30 hover:bg-[#EBF4FB]'
                                : 'bg-[#F5F7FA] border-transparent hover:bg-slate-100 opacity-85'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1 mb-1">
                              <div className="font-bold text-[#184C78] text-[12px] flex items-center gap-1.5">
                                {!item.is_read && <span className="w-2 h-2 rounded-full bg-[#2980B9] shrink-0" />}
                                <span className="truncate max-w-[190px]">{item.nama_proyek ? `📍 ${item.nama_proyek}` : 'CivicTrack Info'}</span>
                              </div>
                              <span className="text-[10px] text-[#6C757D] shrink-0 font-mono">
                                {formatRelativeTime(item.created_at)}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#495057] leading-relaxed">{item.pesan}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

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
