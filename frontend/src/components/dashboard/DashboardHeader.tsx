import React, { useState } from 'react';
import {
  Menu,
  Bell,
  LogOut,
  User,
  Building2,
  HardHat,
  Check,
  ChevronDown,
  Compass,
} from 'lucide-react';
import type { UserProfile, UserRole, NotificationItem } from '../../types';
import { MOCK_DYNAMIC_NOTIFICATIONS } from '../../data/dashboardMockData';

interface DashboardHeaderProps {
  currentUser: UserProfile;
  onBackToLanding: () => void;
  onOpenMapExplorer?: () => void;
  onLogout: () => void;
  onSwitchRole: (role: UserRole) => void;
  onSelectProjectNotification?: (projectId: number) => void;
  onToggleMobileSidebar: () => void;
  activeNavTitle?: string;
  unreadCount?: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentUser,
  onBackToLanding,
  onOpenMapExplorer,
  onLogout,
  onSwitchRole,
  onSelectProjectNotification,
  onToggleMobileSidebar,
  activeNavTitle = 'Dashboard Utama',
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_DYNAMIC_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.dibaca).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, dibaca: true })));
  };

  const handleNotificationClick = (item: NotificationItem) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, dibaca: true } : n))
    );
    if (item.proyek_id && onSelectProjectNotification) {
      onSelectProjectNotification(item.proyek_id);
      setShowNotifMenu(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'aparatur_pemerintah':
      case 'pimpinan_instansi':
        return {
          label: 'Aparatur Pemerintah',
          icon: <Building2 className="w-3.5 h-3.5 text-[#184C78]" />,
          bg: 'bg-[#EBF4FB] text-[#184C78] border-[#c5def2]',
        };
      case 'penanggung_jawab':
      case 'admin_dinas':
      case 'pemerintah':
        return {
          label: 'Penanggung Jawab Proyek',
          icon: <HardHat className="w-3.5 h-3.5 text-[#D97706]" />,
          bg: 'bg-[#FEF3E7] text-[#B45309] border-[#FCD34D]',
        };
      case 'warga':
      default:
        return {
          label: 'Warga Masyarakat',
          icon: <User className="w-3.5 h-3.5 text-[#2980B9]" />,
          bg: 'bg-[#EBF4FB] text-[#184C78] border-[#c5def2]',
        };
    }
  };

  const currentBadge = getRoleBadge(currentUser.role);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#DCE0E6] shadow-2xs h-16 flex items-center px-4 sm:px-6">
      <div className="w-full flex items-center justify-between">
        {/* Left: Mobile Sidebar Toggle + Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Buka Menu Sidebar"
          >
            <Menu className="w-5 h-5 text-[#184C78]" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 hidden sm:inline">CivicTrack /</span>
              <h1 className="font-['DM_Sans'] font-bold text-base sm:text-lg text-[#184C78] leading-tight">
                {activeNavTitle}
              </h1>
            </div>
            <p className="text-[11px] text-[#6C757D] hidden md:block leading-tight">
              Sistem Pengawasan &amp; Transparansi Pembangunan Daerah
            </p>
          </div>
        </div>

        {/* Center: Quick Nav to Landing Page & GIS Map */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onBackToLanding}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#184C78] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Kembali ke Beranda Publik"
          >
            <span>← Beranda Publik</span>
          </button>
          {onOpenMapExplorer && (
            <button
              onClick={onOpenMapExplorer}
              className="px-3 py-1.5 rounded-lg bg-[#EBF4FB] hover:bg-[#d8eaf7] border border-[#c5def2] text-[#184C78] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Buka Peta Spasial Interaktif"
            >
              <Compass className="w-3.5 h-3.5 text-[#2980B9]" />
              <span>Peta Spasial (GIS)</span>
            </button>
          )}
        </div>

        {/* Right: 3 Role Switcher Demo, Notifications, Profile & Logout */}
        <div className="flex items-center gap-3">
            {/* Quick Demo Role Switcher (3 Roles) */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${currentBadge.bg}`}
              >
                {currentBadge.icon}
                <span className="font-medium">{currentBadge.label}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#DCE0E6] p-2 z-50 animate-fade-in">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-[#6C757D] uppercase tracking-wider border-b border-[#DCE0E6]/60">
                    Pilih Peran Pengguna (3 Role):
                  </div>
                  <div className="space-y-1.5 mt-2">
                    {/* Role 1: Warga */}
                    <button
                      onClick={() => {
                        onSwitchRole('warga');
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left rounded-lg transition-colors cursor-pointer ${
                        currentUser.role === 'warga'
                          ? 'bg-[#EBF4FB] text-[#184C78] font-bold border border-[#2980B9]/30'
                          : 'text-[#212529] hover:bg-[#F5F7FA]'
                      }`}
                    >
                      <User className="w-4 h-4 text-[#2980B9] shrink-0" />
                      <div>
                        <div className="font-semibold flex items-center gap-1.5">
                          <span>1. Warga Masyarakat</span>
                          {currentUser.role === 'warga' && (
                            <span className="text-[9px] bg-[#2980B9] text-white px-1.5 py-0.2 rounded font-bold">Aktif</span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#6C757D]">Pantau proyek, laporkan aduan &amp; evaluasi cacat</div>
                      </div>
                    </button>

                    {/* Role 2: Aparatur Pemerintah */}
                    <button
                      onClick={() => {
                        onSwitchRole('aparatur_pemerintah');
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left rounded-lg transition-colors cursor-pointer ${
                        currentUser.role === 'aparatur_pemerintah' || currentUser.role === 'pimpinan_instansi'
                          ? 'bg-[#EBF4FB] text-[#184C78] font-bold border border-[#184C78]/30'
                          : 'text-[#212529] hover:bg-[#F5F7FA]'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-[#184C78] shrink-0" />
                      <div>
                        <div className="font-semibold flex items-center gap-1.5">
                          <span>2. Aparatur Pemerintah</span>
                          {(currentUser.role === 'aparatur_pemerintah' || currentUser.role === 'pimpinan_instansi') && (
                            <span className="text-[9px] bg-[#184C78] text-white px-1.5 py-0.2 rounded font-bold">Aktif</span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#6C757D]">Monitoring eksekutif, rekap wilayah &amp; serapan dana</div>
                      </div>
                    </button>

                    {/* Role 3: Penanggung Jawab Project */}
                    <button
                      onClick={() => {
                        onSwitchRole('penanggung_jawab');
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left rounded-lg transition-colors cursor-pointer ${
                        currentUser.role === 'penanggung_jawab' || currentUser.role === 'admin_dinas' || currentUser.role === 'pemerintah'
                          ? 'bg-[#FEF3E7] text-[#B45309] font-bold border border-[#D97706]/30'
                          : 'text-[#212529] hover:bg-[#F5F7FA]'
                      }`}
                    >
                      <HardHat className="w-4 h-4 text-[#D97706] shrink-0" />
                      <div>
                        <div className="font-semibold flex items-center gap-1.5">
                          <span>3. Penanggung Jawab Proyek</span>
                          {(currentUser.role === 'penanggung_jawab' || currentUser.role === 'admin_dinas' || currentUser.role === 'pemerintah') && (
                            <span className="text-[9px] bg-[#D97706] text-white px-1.5 py-0.2 rounded font-bold">Aktif</span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#6C757D]">Input progres, upload foto/video &amp; tanggapi aduan</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell with Dynamic Feed */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 text-[#6C757D] hover:text-[#184C78] hover:bg-[#F5F7FA] rounded-lg transition-colors cursor-pointer"
                title="Notifikasi Pembaruan"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 bg-[#E74C3C] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-88 bg-white rounded-xl shadow-xl border border-[#DCE0E6] p-3 z-50 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-[#DCE0E6]">
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
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                          !item.dibaca
                            ? 'bg-[#EBF4FB]/60 border-[#2980B9]/40 hover:bg-[#EBF4FB]'
                            : 'bg-[#F5F7FA] border-transparent hover:bg-slate-100 opacity-80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <div className="font-bold text-[#184C78] text-[12px] flex items-center gap-1.5">
                            {!item.dibaca && <span className="w-2 h-2 rounded-full bg-[#2980B9]" />}
                            <span>{item.judul}</span>
                          </div>
                          <span className="text-[10px] text-[#6C757D] font-mono shrink-0">{item.waktu}</span>
                        </div>
                        {item.nama_proyek && (
                          <div className="text-[11px] font-semibold text-[#2980B9] mb-1">
                            📍 {item.nama_proyek}
                          </div>
                        )}
                        <p className="text-[11px] text-[#495057] leading-relaxed">{item.pesan}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#DCE0E6] mt-2 text-center">
                    <p className="text-[10px] text-[#6C757D]">
                      💡 Notifikasi otomatis terkirim saat proyek yang Anda ikuti diperbarui.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile info */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#DCE0E6]">
              <div className="w-8 h-8 rounded-full bg-[#184C78] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentUser.nama.charAt(0)}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#212529] leading-tight line-clamp-1 max-w-[150px]">
                  {currentUser.nama}
                </div>
                <div className="text-[10px] text-[#6C757D] leading-tight truncate max-w-[150px]">
                  {currentUser.email}
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="p-2 text-[#6C757D] hover:text-[#E74C3C] hover:bg-[#FDEDEC] rounded-lg transition-colors cursor-pointer"
              title="Keluar dari Akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
    </header>
  );
};

