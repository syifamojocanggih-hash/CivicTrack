import React, { useState } from 'react';
import {
  Shield,
  Compass,
  MapPin,
  Bookmark,
  MessageSquarePlus,
  Star,
  Sparkles,
  AlertTriangle,
  Building2,
  HardHat,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Database,
  BarChart3,
  FileSpreadsheet,
  FolderKanban,
  ListTodo,
  Camera,
  ChevronDown,
} from 'lucide-react';
import type { UserProfile, UserRole } from '../../types';

interface DashboardSidebarProps {
  currentUser: UserProfile;
  activeNavSection: string;
  onSelectNavSection: (section: string) => void;
  onBackToLanding: () => void;
  onLogout: () => void;
  onSwitchRole: (role: UserRole) => void;
  onOpenOpenDataModal: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  currentUser,
  activeNavSection,
  onSelectNavSection,
  onBackToLanding,
  onLogout,
  onSwitchRole,
  onOpenOpenDataModal,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Define role specific menu items
  const getNavItems = () => {
    switch (currentUser.role) {
      case 'aparatur_pemerintah':
      case 'pimpinan_instansi':
        return [
          { id: 'kinerja_dinas', label: 'Matriks Kinerja OPD', icon: BarChart3, desc: 'Evaluasi kinerja 5 dinas teknis' },
          { id: 'sebaran_wilayah', label: 'Sebaran Wilayah & Agregat', icon: MapPin, desc: 'Bagan rekapitulasi per kecamatan' },
          { id: 'sentimen_ai', label: 'Analisis Aspirasi (AI)', icon: Sparkles, desc: 'AI sentimen kepuasan warga' },
          { id: 'laporan_eksekutif', label: 'Unduh Laporan Eksekutif', icon: FileSpreadsheet, desc: 'Ekspor data CSV dan cetak PDF' },
        ];
      case 'penanggung_jawab':
      case 'admin_dinas':
      case 'pemerintah':
        return [
          { id: 'proyek', label: 'Kelola Data Proyek', icon: FolderKanban, desc: 'Input proyek baru & status pengerjaan' },
          { id: 'linimasa', label: 'Tahapan & Linimasa', icon: ListTodo, desc: 'Update kurva-S & bobot progres' },
          { id: 'dokumentasi', label: 'Dokumentasi Foto & Video', icon: Camera, desc: 'Unggah berkas foto & drone video' },
          { id: 'aduan', label: 'Tanggapan Aduan Warga', icon: MessageSquarePlus, desc: 'Respon tiket & aspirasi publik' },
          { id: 'evaluasi', label: 'Verifikasi Evaluasi Cacat', icon: AlertTriangle, desc: 'Tindak lanjut laporan kerusakan' },
        ];
      case 'warga':
      default:
        return [
          { id: 'langganan', label: 'Proyek Diikuti (Subscribe)', icon: Bookmark, desc: 'Proyek yang dipantau & notifikasi' },
          { id: 'laporan', label: 'Aduan & Aspirasi Saya', icon: MessageSquarePlus, desc: 'Kirim & pantau tanggapan dinas' },
          { id: 'rating', label: 'Rating & Ulasan Kepuasan', icon: Star, desc: 'Beri penilaian mutu infrastruktur' },
          { id: 'evaluasi', label: 'Evaluasi Cacat Pasca-Proyek', icon: AlertTriangle, desc: 'Lapor cacat fisik dengan skor AI' },
          { id: 'rute', label: 'Rute Alternatif AI', icon: Sparkles, desc: 'Pengalihan jalur cerdas proyek jalan' },
        ];
    }
  };

  const navItems = getNavItems();

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'aparatur_pemerintah':
      case 'pimpinan_instansi':
        return {
          label: 'Aparatur Pemerintah',
          tag: 'Monitoring Eksekutif & Bappeda',
          icon: <Building2 className="w-4 h-4 text-[#184C78]" />,
          color: 'bg-[#EBF4FB] text-[#184C78] border-[#c5def2]',
        };
      case 'penanggung_jawab':
      case 'admin_dinas':
      case 'pemerintah':
        return {
          label: 'Penanggung Jawab Proyek',
          tag: 'Dinas Pelaksana & Rekanan',
          icon: <HardHat className="w-4 h-4 text-[#D97706]" />,
          color: 'bg-[#FEF3E7] text-[#B45309] border-[#FCD34D]',
        };
      case 'warga':
      default:
        return {
          label: 'Warga Masyarakat',
          tag: 'Partisipasi & Pengawasan Publik',
          icon: <User className="w-4 h-4 text-[#2980B9]" />,
          color: 'bg-[#EBF4FB] text-[#184C78] border-[#c5def2]',
        };
    }
  };

  const currentBadge = getRoleBadge(currentUser.role);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#0f2d48] text-white flex flex-col border-r border-[#1a446c] transition-all duration-300 shadow-xl ${
          isCollapsed ? 'w-20' : 'w-72'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* ── 1. HEADER & BRAND ── */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-[#2980B9] to-[#184C78] rounded-xl flex items-center justify-center text-white shrink-0 shadow-md ring-1 ring-white/20">
              <Shield className="w-5 h-5 text-cyan-300" />
            </div>
            {!isCollapsed && (
              <div className="leading-tight overflow-hidden">
                <div className="font-['DM_Sans'] font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
                  <span>CivicTrack</span>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-bold border border-cyan-400/30 uppercase">
                    Hub
                  </span>
                </div>
                <div className="text-[10px] text-cyan-100/70 truncate">Sistem Transparansi Proyek</div>
              </div>
            )}
          </div>

          {/* Collapse Toggle Button (Desktop) */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={isCollapsed ? 'Buka Sidebar' : 'Ciutkan Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* ── 2. CURRENT USER INFO & ROLE BADGE ── */}
        <div className="p-3 border-b border-white/10 bg-black/15 shrink-0">
          {!isCollapsed ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2980B9] to-[#1A9E6E] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                  {currentUser.nama.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-white truncate">{currentUser.nama}</div>
                  <div className="text-[11px] text-cyan-200/70 truncate">{currentUser.email}</div>
                </div>
              </div>

              {/* Role Indicator with Switcher Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${currentBadge.color}`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {currentBadge.icon}
                    <span className="truncate">{currentBadge.label}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70" />
                </button>

                {showRoleDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 p-1.5 z-50 animate-fade-in">
                    <div className="text-[10px] font-bold text-slate-500 uppercase px-2.5 py-1 border-b border-slate-100">
                      Ganti Peran Pengguna (3 Role):
                    </div>
                    <div className="space-y-1 mt-1">
                      <button
                        onClick={() => {
                          onSwitchRole('warga');
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-left cursor-pointer transition-colors ${
                          currentUser.role === 'warga'
                            ? 'bg-[#EBF4FB] text-[#184C78] font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <User className="w-4 h-4 text-[#2980B9] shrink-0" />
                        <div>
                          <div className="font-bold">1. Warga Masyarakat</div>
                          <div className="text-[10px] text-slate-500">Pantau proyek &amp; lapor aduan</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          onSwitchRole('aparatur_pemerintah');
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-left cursor-pointer transition-colors ${
                          currentUser.role === 'aparatur_pemerintah' || currentUser.role === 'pimpinan_instansi'
                            ? 'bg-[#EBF4FB] text-[#184C78] font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Building2 className="w-4 h-4 text-[#184C78] shrink-0" />
                        <div>
                          <div className="font-bold">2. Aparatur Pemerintah</div>
                          <div className="text-[10px] text-slate-500">Monitoring wilayah &amp; eksekutif</div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          onSwitchRole('penanggung_jawab');
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-left cursor-pointer transition-colors ${
                          currentUser.role === 'penanggung_jawab' || currentUser.role === 'admin_dinas' || currentUser.role === 'pemerintah'
                            ? 'bg-[#FEF3E7] text-[#B45309] font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <HardHat className="w-4 h-4 text-[#D97706] shrink-0" />
                        <div>
                          <div className="font-bold">3. Penanggung Jawab Proyek</div>
                          <div className="text-[10px] text-slate-500">Input progres &amp; tanggapi aduan</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2980B9] to-[#1A9E6E] text-white flex items-center justify-center font-bold text-sm shadow-sm"
                title={`${currentUser.nama} (${currentBadge.label})`}
              >
                {currentUser.nama.charAt(0)}
              </div>
            </div>
          )}
        </div>

        {/* ── 3. MAIN NAVIGATION ITEMS (SCROLLABLE) ── */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6 scrollbar-none">
          {/* Main Module Nav Group */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2 text-[10px] font-bold tracking-wider uppercase text-cyan-200/50">
                Fitur &amp; Menu Utama
              </div>
            )}

            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNavSection === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectNavSection(item.id);
                      if (isMobileOpen) onCloseMobile();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-gradient-to-r from-[#2980B9] to-[#184C78] text-white shadow-md font-bold'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
                    {!isCollapsed && (
                      <div className="text-left flex-1 min-w-0">
                        <div className="truncate leading-tight">{item.label}</div>
                      </div>
                    )}
                    {!isCollapsed && isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-sm" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick External Actions Group */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2 text-[10px] font-bold tracking-wider uppercase text-cyan-200/50">
                Akses Portal Publik
              </div>
            )}

            <div className="space-y-1">
              {/* Back to Public Interactive Map */}
              <button
                onClick={onBackToLanding}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer group"
                title={isCollapsed ? 'Jelajah Peta Publik' : undefined}
              >
                <Compass className="w-4 h-4 text-emerald-400 shrink-0 group-hover:rotate-45 transition-transform" />
                {!isCollapsed && <span className="truncate">Jelajah Peta Publik</span>}
              </button>

              {/* Open Data REST API */}
              <button
                onClick={onOpenOpenDataModal}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer group"
                title={isCollapsed ? 'Open Data REST API' : undefined}
              >
                <Database className="w-4 h-4 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                {!isCollapsed && <span className="truncate">Open Data REST API</span>}
              </button>
            </div>
          </div>
        </div>

        {/* ── 4. BOTTOM LOGOUT & FOOTER ── */}
        <div className="p-3 border-t border-white/10 bg-black/20 shrink-0">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/20 hover:text-rose-100 transition-colors cursor-pointer group"
            title={isCollapsed ? 'Keluar dari Akun' : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
            {!isCollapsed && <span>Keluar Akun</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
