import React, { useState } from 'react';
import {
  Shield,
  ArrowLeft,
  Bell,
  LogOut,
  ChevronDown,
  User,
  Building2,
  Award,
  BookOpen,
} from 'lucide-react';
import type { UserProfile } from '../../types';

interface DashboardHeaderProps {
  currentUser: UserProfile;
  onBackToLanding: () => void;
  onLogout: () => void;
  onSwitchRole: (role: 'warga' | 'admin_dinas' | 'pimpinan_instansi' | 'media_peneliti') => void;
  unreadCount?: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentUser,
  onBackToLanding,
  onLogout,
  onSwitchRole,
  unreadCount = 3,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin_dinas':
        return {
          label: 'Admin Dinas PUPR',
          icon: <Building2 className="w-3.5 h-3.5" />,
          bg: 'bg-[#EBF4FB] text-[#184C78] border-[#c5def2]',
          tag: 'Instansi Teknis Pelaksana',
        };
      case 'pimpinan_instansi':
        return {
          label: 'Pimpinan Instansi (Eksekutif)',
          icon: <Award className="w-3.5 h-3.5 text-[#E67E22]" />,
          bg: 'bg-[#FEF3E7] text-[#9A4C08] border-[#FBD8B3]',
          tag: 'Monitoring & Pengambil Kebijakan',
        };
      case 'media_peneliti':
        return {
          label: 'Media / Peneliti / LSM',
          icon: <BookOpen className="w-3.5 h-3.5 text-[#1A9E6E]" />,
          bg: 'bg-[#E6F7F1] text-[#0E6243] border-[#B7EBD8]',
          tag: 'Pengawasan Independen & Analitik',
        };
      case 'warga':
      default:
        return {
          label: 'Warga Masyarakat',
          icon: <User className="w-3.5 h-3.5 text-[#2980B9]" />,
          bg: 'bg-[#EBF4FB] text-[#184C78] border-[#c5def2]',
          tag: 'Partisipasi & Pengaduan Publik',
        };
    }
  };

  const currentBadge = getRoleBadge(currentUser.role);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#DCE0E6] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand & Back to Public Portal */}
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-2 text-xs font-semibold text-[#184C78] hover:text-[#0f3252] bg-[#F5F7FA] hover:bg-[#EBF4FB] px-3 py-1.5 rounded-lg border border-[#DCE0E6] transition-colors"
              title="Kembali ke Beranda & Peta Interaktif"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Jelajah Peta Publik</span>
            </button>

            <div className="h-6 w-px bg-[#DCE0E6] hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#184C78] rounded-lg flex items-center justify-center text-white shadow-xs">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-['DM_Sans'] font-bold text-base text-[#184C78] tracking-tight">
                    CivicTrack
                  </span>
                  <span className="bg-[#184C78] text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase">
                    Dashboard
                  </span>
                </div>
                <p className="text-[11px] text-[#6C757D] -mt-0.5 hidden md:block">
                  Sistem Transparansi &amp; Akuntabilitas Pembangunan
                </p>
              </div>
            </div>
          </div>

          {/* Right: Role Switcher Demo, Notifications, Profile & Logout */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Role Switcher */}
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
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#DCE0E6] p-2 z-50 animate-fade-in">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-[#6C757D] uppercase tracking-wider border-b border-[#DCE0E6]/60">
                    Ganti Peran Pengguna (Demo)
                  </div>
                  <div className="space-y-1 mt-1.5">
                    <button
                      onClick={() => {
                        onSwitchRole('warga');
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left rounded-lg transition-colors ${
                        currentUser.role === 'warga'
                          ? 'bg-[#EBF4FB] text-[#184C78] font-bold'
                          : 'text-[#212529] hover:bg-[#F5F7FA]'
                      }`}
                    >
                      <User className="w-4 h-4 text-[#2980B9]" />
                      <div>
                        <div className="font-semibold">Warga Masyarakat</div>
                        <div className="text-[10px] text-[#6C757D]">Pantau proyek & aduan warga</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onSwitchRole('admin_dinas');
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left rounded-lg transition-colors ${
                        currentUser.role === 'admin_dinas'
                          ? 'bg-[#EBF4FB] text-[#184C78] font-bold'
                          : 'text-[#212529] hover:bg-[#F5F7FA]'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-[#184C78]" />
                      <div>
                        <div className="font-semibold">Admin Dinas PUPR</div>
                        <div className="text-[10px] text-[#6C757D]">Kelola proyek, linimasa & respon</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onSwitchRole('pimpinan_instansi');
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left rounded-lg transition-colors ${
                        currentUser.role === 'pimpinan_instansi'
                          ? 'bg-[#FEF3E7] text-[#9A4C08] font-bold'
                          : 'text-[#212529] hover:bg-[#F5F7FA]'
                      }`}
                    >
                      <Award className="w-4 h-4 text-[#E67E22]" />
                      <div>
                        <div className="font-semibold">Pimpinan Instansi</div>
                        <div className="text-[10px] text-[#6C757D]">KPI eksekutif, EWS & lintas dinas</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onSwitchRole('media_peneliti');
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left rounded-lg transition-colors ${
                        currentUser.role === 'media_peneliti'
                          ? 'bg-[#E6F7F1] text-[#0E6243] font-bold'
                          : 'text-[#212529] hover:bg-[#F5F7FA]'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 text-[#1A9E6E]" />
                      <div>
                        <div className="font-semibold">Media &amp; Peneliti</div>
                        <div className="text-[10px] text-[#6C757D]">Eksplorasi data terbuka &amp; API</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 text-[#6C757D] hover:text-[#184C78] hover:bg-[#F5F7FA] rounded-lg transition-colors cursor-pointer"
                title="Notifikasi Pembaruan"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#E74C3C] rounded-full ring-2 ring-white" />
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#DCE0E6] p-3 z-50 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-[#DCE0E6]">
                    <span className="text-xs font-bold text-[#184C78]">Notifikasi Pembaruan</span>
                    <span className="text-[10px] font-semibold bg-[#EBF4FB] text-[#2980B9] px-2 py-0.5 rounded-full">
                      {unreadCount} Baru
                    </span>
                  </div>
                  <div className="space-y-2 mt-2 max-h-60 overflow-y-auto text-xs">
                    <div className="p-2 bg-[#F5F7FA] rounded-lg border-l-2 border-[#2980B9]">
                      <div className="font-semibold text-[#184C78]">Pelebaran Jl. Soekarno Hatta</div>
                      <div className="text-[11px] text-[#6C757D] mt-0.5">
                        Progres bertambah menjadi 38%. Tahap pemadatan lapis pondasi berjalan.
                      </div>
                      <div className="text-[10px] text-[#6C757D] mt-1 font-mono">2 Jam lalu</div>
                    </div>
                    <div className="p-2 bg-[#F5F7FA] rounded-lg border-l-2 border-[#1A9E6E]">
                      <div className="font-semibold text-[#184C78]">Tanggapan Dinas PUPR</div>
                      <div className="text-[11px] text-[#6C757D] mt-0.5">
                        Aduan Anda mengenai debu proyek telah direspons oleh pengawas lapangan.
                      </div>
                      <div className="text-[10px] text-[#6C757D] mt-1 font-mono">6 Jam lalu</div>
                    </div>
                    <div className="p-2 bg-[#F5F7FA] rounded-lg border-l-2 border-[#E67E22]">
                      <div className="font-semibold text-[#184C78]">Rute Alternatif Aktif (AI)</div>
                      <div className="text-[11px] text-[#6C757D] mt-0.5">
                        Pengalihan arus malam hari mulai berlaku di Simpang Borobudur.
                      </div>
                      <div className="text-[10px] text-[#6C757D] mt-1 font-mono">1 Hari lalu</div>
                    </div>
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
                <div className="text-xs font-bold text-[#212529] leading-tight line-clamp-1">
                  {currentUser.nama}
                </div>
                <div className="text-[10px] text-[#6C757D] leading-tight">
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
      </div>
    </header>
  );
};
