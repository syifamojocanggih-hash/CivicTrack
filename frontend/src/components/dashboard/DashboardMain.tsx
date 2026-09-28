import React from 'react';
import { DashboardHeader } from './DashboardHeader';
import { WargaDashboard } from './WargaDashboard';
import { PemerintahDashboard } from './PemerintahDashboard';
import { PenelitiDashboard } from './PenelitiDashboard';
import type { UserProfile, ProyekItem, UserRole } from '../../types';

interface DashboardMainProps {
  currentUser: UserProfile;
  projects: ProyekItem[];
  onBackToLanding: () => void;
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
  onLogout,
  onSwitchRole,
  onOpenProjectDetail,
  onOpenAIRoute,
  onOpenOpenDataModal,
}) => {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col font-['Inter'] text-[#212529]">
      {/* Top Header */}
      <DashboardHeader
        currentUser={currentUser}
        onBackToLanding={onBackToLanding}
        onLogout={onLogout}
        onSwitchRole={onSwitchRole}
        unreadCount={3}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentUser.role === 'warga' && (
          <WargaDashboard
            currentUser={currentUser}
            projects={projects}
            onOpenProjectDetail={onOpenProjectDetail}
            onOpenAIRoute={onOpenAIRoute}
          />
        )}

        {(currentUser.role === 'pemerintah' || currentUser.role === 'admin_dinas' || currentUser.role === 'pimpinan_instansi') && (
          <PemerintahDashboard
            currentUser={currentUser}
            projects={projects}
            onOpenProjectDetail={onOpenProjectDetail}
          />
        )}

        {currentUser.role === 'media_peneliti' && (
          <PenelitiDashboard
            currentUser={currentUser}
            projects={projects}
            onOpenOpenDataModal={onOpenOpenDataModal}
          />
        )}
      </main>

      {/* Footer minimal for dashboard */}
      <footer className="border-t border-[#DCE0E6] bg-white py-4 text-center text-xs text-[#6C757D]">
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
  );
};
