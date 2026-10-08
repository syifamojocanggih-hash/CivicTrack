import React, { useState } from 'react';
import {
  Search,
  LayoutDashboard,
  Bookmark,
  MessageSquarePlus,
  Star,
  Sparkles,
  AlertTriangle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  FileSpreadsheet,
  FolderKanban,
  ListTodo,
  Camera,
  MapPin,
  X,
} from 'lucide-react';
import type { UserProile, UserRole } from '../../types';
import iconSrc from '../../assets/civictrack-icon.png';

interface DashboardSidebarProps {
  currentUser: UserProfile;
  activeNavSection: string;
  onSelectNavSection: (section: string) => void;
  onOpenMapExplorer?: () => void;
  onLogout: () => void;
  onSwitchRole?: (role: UserRole) => void;
  onOpenOpenDataModal?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  currentUser,
  activeNavSection,
  onSelectNavSection,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const isOverviewActive = activeNavSection === 'overview';

  // Role-specific main navigation items (Clean, simple, no clutter)
  const getRoleNavItems = () => {
    switch (currentUser.role) {
      case 'aparatur_pemerintah':
      case 'pimpinan_instansi':
        return [
          { id: 'kinerja_dinas', label: 'Matriks Kinerja OPD', icon: BarChart3 },
          { id: 'sebaran_wilayah', label: 'Sebaran Wilayah', icon: MapPin },
          { id: 'sentimen_ai', label: 'Analisis Aspirasi AI', icon: Sparkles },
          { id: 'laporan_eksekutif', label: 'Laporan Eksekutif', icon: FileSpreadsheet },
        ];
      case 'penanggung_jawab':
      case 'admin_dinas':
      case 'pemerintah':
        return [
          { id: 'proyek', label: 'Kelola Data Proyek', icon: FolderKanban },
          { id: 'linimasa', label: 'Tahapan & Linimasa', icon: ListTodo },
          { id: 'dokumentasi', label: 'Dokumentasi Visual', icon: Camera },
          { id: 'aduan', label: 'Tanggapan Aduan', icon: MessageSquarePlus },
          { id: 'evaluasi', label: 'Verifikasi Cacat Mutu', icon: AlertTriangle },
        ];
      case 'warga':
      default:
        return [
          { id: 'langganan', label: 'Proyek Diikuti', icon: Bookmark },
          { id: 'laporan', label: 'Aduan & Aspirasi', icon: MessageSquarePlus },
          { id: 'rating', label: 'Rating & Kepuasan', icon: Star },
          { id: 'evaluasi', label: 'Evaluasi Cacat Fisik', icon: AlertTriangle },
        ];
    }
  };

  const roleNavItems = getRoleNavItems();

  const filteredItems = roleNavItems.filter((item) =>
    item.label.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden animate-fade-in"
        />
      )}

      {/* ── MINIMALIST SAAS SIDEBAR CONTAINER ── */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#F1F3F6] text-slate-800 flex flex-col border-r border-[#E2E6EB] transition-all duration-300 shadow-sm ${isCollapsed ? 'w-20' : 'w-72'
          } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* ── 1. HEADER (CIRCULAR BRAND & SEARCH) ── */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200/70 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Official CivicTrack Logo Mark */}
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center p-1 shrink-0">
              <img src={iconSrc} alt="CivicTrack" className="w-full h-full object-contain" />
            </div>

            {!isCollapsed && (
              <div className="leading-tight overflow-hidden">
                <div className="font-['DM_Sans'] font-black text-[15px] text-[#184C78] tracking-tight">
                  CivicTrack
                </div>
                <div className="text-[10px] text-slate-500 font-medium truncate">
                  Sistem Transparansi Proyek
                </div>
              </div>
            )}
          </div>

          {/* Right Action: Search or Collapse Toggle */}
          {!isCollapsed ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsSearching(!isSearching)}
                className={`w-8 h-8 rounded-full border flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors shadow-2xs cursor-pointer ${isSearching ? 'bg-[#184C78] text-white border-[#184C78]' : 'bg-white/80 border-slate-200/90 hover:bg-white'
                  }`}
                title="Cari Menu"
              >
                {isSearching ? <X className="w-3.5 h-3.5" /> : <Search className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={onToggleCollapse}
                className="hidden md:flex p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors cursor-pointer"
                title="Ciutkan Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex mx-auto p-1.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-white transition-colors cursor-pointer"
              title="Perluas Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Optional Quick Search Input */}
        {!isCollapsed && isSearching && (
          <div className="px-3 pt-3 pb-1">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Cari menu..."
                autoFocus
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#184C78]"
              />
            </div>
          </div>
        )}

        {/* ── 2. NAVIGATION BUTTONS (AIRY SPACING & CLEAN MINIMALISM) ── */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-2.5 scrollbar-none">
          {/* Button 1: Dashboard (Active Pill Card) */}
          <button
            onClick={() => {
              onSelectNavSection('overview');
              if (isMobileOpen) onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-[13px] transition-all cursor-pointer group ${isOverviewActive
                ? 'bg-white shadow-xs border border-slate-200/60 text-slate-900 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium'
              }`}
            title={isCollapsed ? 'Dashboard' : undefined}
          >
            <div className="flex items-center gap-3 min-w-0">
              <LayoutDashboard
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${isOverviewActive ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-800'
                  }`}
              />
              {!isCollapsed && (
                <span className="truncate leading-tight">Dashboard</span>
              )}
            </div>

            {!isCollapsed && isOverviewActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-2xs shrink-0" />
            )}
          </button>

          {/* Main Role Buttons with Clean Spacing */}
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNavSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectNavSection(item.id);
                  if (isMobileOpen) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13px] transition-all cursor-pointer group ${isActive
                    ? 'bg-white shadow-xs border border-slate-200/60 text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium'
                  }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-800'
                      }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate leading-tight">{item.label}</span>
                  )}
                </div>

                {!isCollapsed && isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#184C78] shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* ── 3. BOTTOM FOOTER: KELUAR AKUN (CLEAN MINIMALIST) ── */}
        <div className="p-3 border-t border-slate-200/80 shrink-0 bg-slate-50/50">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer group"
            title={isCollapsed ? 'Keluar dari Akun' : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-500 group-hover:translate-x-0.5 transition-transform" />
            {!isCollapsed && <span>Keluar Akun</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
