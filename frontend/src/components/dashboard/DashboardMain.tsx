import React, { useState, useEffect } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { WargaDashboard } from './WargaDashboard';
import { AdminDinasDashboard } from './AdminDinasDashboard';
import { PimpinanDashboard } from './PimpinanDashboard';
import type { UserProfile, ProyekItem, UserRole } from '../../types';

interface DashboardMainProps {
  currentUser: UserProfile;
  projects: ProyekItem[];
  onBackToLanding: () => void;
  onOpenMapExplorer?: () => void;
  onLogout: () => void;
  onSwitchRole: (role: UserRole) => void;
  onOpenProjectDetail: (project: ProyekItem) => void;
  onOpenAIRoute: (projectName: string) => void;
  onOpenOpenDataModal: () => void;
}

export const DashboardMain: React.FC<DashboardMainProps> = ({
  currentUser,
  projects,
  onBackToLanding,
  onOpenMapExplorer,
  onLogout,
  onSwitchRole,
  onOpenProjectDetail,
  onOpenAIRoute,
  onOpenOpenDataModal,
}) => {
  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Default active section per role
  const getDefaultSection = (role: UserRole) => {
    switch (role) {
      case 'aparatur_pemerintah':
      case 'pimpinan_instansi':
        return 'kinerja_dinas';
      case 'penanggung_jawab':
      case 'admin_dinas':
      case 'pemerintah':
        return 'proyek';
      case 'warga':
      default:
        return 'langganan';
    }
  };

  const [activeNavSection, setActiveNavSection] = useState<string>(getDefaultSection(currentUser.role));

  // Reset section when role switches
  useEffect(() => {
    setActiveNavSection(getDefaultSection(currentUser.role));
  }, [currentUser.role]);

  // Compute title for the top header breadcrumb
  const getNavTitle = () => {
    switch (activeNavSection) {
      case 'langganan':
        return 'Proyek Diikuti (Langganan Notifikasi)';
      case 'laporan':
        return 'Kanal Aduan & Aspirasi Publik';
      case 'rating':
        return 'Rating & Ulasan Kepuasan Warga';
      case 'evaluasi':
        return 'Evaluasi Cacat Pasca-Proyek (FHO)';
      case 'rute':
        return 'Rekomendasi Jalur Alternatif (AI)';
      case 'kinerja_dinas':
        return 'Matriks Kinerja Organisasi Perangkat Daerah (OPD)';
      case 'sebaran_wilayah':
        return 'Sebaran Wilayah & Rekapitulasi Agregat';
      case 'sentimen_ai':
        return 'Analisis Aspirasi Publik (Gemini AI)';
      case 'laporan_eksekutif':
        return 'Pusat Unduh Laporan Eksekutif Daerah';
      case 'proyek':
        return 'Pengelolaan & Input Proyek Pembangunan';
      case 'linimasa':
        return 'Manajemen Tahapan & Bobot Linimasa';
      case 'dokumentasi':
        return 'Dokumentasi Foto & Video Lapangan';
      case 'aduan':
        return 'Tanggapan Aduan & Aspirasi Warga';
      default:
        return 'Dashboard CivicTrack';
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex font-['Inter'] text-[#212529] relative">
      {/* ── 1. SIDEBAR NAVIGATION ── */}
      <DashboardSidebar
        currentUser={currentUser}
        activeNavSection={activeNavSection}
        onSelectNavSection={(sec) => setActiveNavSection(sec)}
        onBackToLanding={onBackToLanding}
        onOpenMapExplorer={onOpenMapExplorer}
        onLogout={onLogout}
        onSwitchRole={onSwitchRole}
        onOpenOpenDataModal={onOpenOpenDataModal}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* ── 2. MAIN CONTENT WRAPPER ── */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'md:pl-20' : 'md:pl-72'
        }`}
      >
        {/* Top Header Bar */}
        <DashboardHeader
          currentUser={currentUser}
          onBackToLanding={onBackToLanding}
          onOpenMapExplorer={onOpenMapExplorer}
          onLogout={onLogout}
          onSwitchRole={onSwitchRole}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          activeNavTitle={getNavTitle()}
          onSelectProjectNotification={(pId) => {
            const found = projects.find((p) => p.id === pId);
            if (found) onOpenProjectDetail(found);
          }}
          unreadCount={2}
        />

        {/* Main Content View (Driven by Active Role & Section) */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Role 1: Warga Masyarakat */}
          {currentUser.role === 'warga' && (
            <WargaDashboard
              currentUser={currentUser}
              projects={projects}
              onOpenProjectDetail={onOpenProjectDetail}
              onOpenAIRoute={onOpenAIRoute}
              activeSection={activeNavSection}
              onSelectSection={(sec) => setActiveNavSection(sec)}
            />
          )}

          {/* Role 2: Aparatur Pemerintah (Monitoring Eksekutif, Wilayah & Kinerja) */}
          {(currentUser.role === 'aparatur_pemerintah' || currentUser.role === 'pimpinan_instansi') && (
            <PimpinanDashboard
              currentUser={currentUser}
              projects={projects}
              onOpenProjectDetail={onOpenProjectDetail}
              activeSection={activeNavSection}
              onSelectSection={(sec) => setActiveNavSection(sec)}
            />
          )}

          {/* Role 3: Penanggung Jawab Proyek (Kelola Proyek, Update Tahapan, Upload Foto/Video & Respon Aduan) */}
          {(currentUser.role === 'penanggung_jawab' || currentUser.role === 'admin_dinas' || currentUser.role === 'pemerintah') && (
            <AdminDinasDashboard
              currentUser={currentUser}
              projects={projects}
              onOpenProjectDetail={onOpenProjectDetail}
              activeSection={activeNavSection}
              onSelectSection={(sec) => setActiveNavSection(sec)}
            />
          )}
        </main>

        {/* Footer for Dashboard */}
        <footer className="border-t border-[#DCE0E6] bg-white py-4 text-center text-xs text-[#6C757D] mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>&copy; {new Date().getFullYear()} CivicTrack — Sistem Transparansi &amp; Akuntabilitas Pembangunan Daerah</span>
            <div className="flex items-center gap-4">
              <button onClick={onBackToLanding} className="hover:text-[#184C78] transition-colors cursor-pointer">
                Beranda Publik
              </button>
              <span>•</span>
              <button onClick={onOpenOpenDataModal} className="hover:text-[#184C78] transition-colors cursor-pointer">
                Open Data API
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
