import React, { useState } from 'react';
import {
  Building2,
  Award,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { AdminDinasDashboard } from './AdminDinasDashboard';
import { PimpinanDashboard } from './PimpinanDashboard';
import type { UserProfile, ProyekItem } from '../../types';

interface PemerintahDashboardProps {
  currentUser: UserProfile;
  projects: ProyekItem[];
  onOpenProjectDetail: (project: ProyekItem) => void;
}

export const PemerintahDashboard: React.FC<PemerintahDashboardProps> = ({
  currentUser,
  projects,
  onOpenProjectDetail,
}) => {
  // State for switching between Operational (Dinas) and Executive (Pimpinan) views
  const [govMode, setGovMode] = useState<'operasional' | 'eksekutif'>('operasional');

  return (
    <div className="space-y-6">
      {/* ── UNIFIED GOVERNMENT VIEW SWITCHER BAR ── */}
      <div className="bg-white rounded-2xl border border-[#DCE0E6] p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0f3252] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Layers className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['DM_Sans'] text-base font-bold text-[#184C78]">
                  Portal Aparatur Pemerintah Daerah
                </h2>
                <span className="bg-[#EBF4FB] text-[#184C78] text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[#DCE0E6]">
                  Role Terpadu (Pemerintah)
                </span>
              </div>
              <p className="text-xs text-[#6C757D]">
                Ganti mode tampilan antara operasional dinas teknis dan pengawasan eksekutif pimpinan.
              </p>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center p-1 bg-[#F5F7FA] rounded-xl border border-[#DCE0E6] self-start md:self-auto">
            <button
              onClick={() => setGovMode('operasional')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                govMode === 'operasional'
                  ? 'bg-[#184C78] text-white shadow-xs'
                  : 'text-[#6C757D] hover:text-[#184C78] hover:bg-white/60'
              }`}
            >
              <Building2 className="w-4 h-4 text-cyan-300" />
              <span>Mode Operasional (Dinas)</span>
            </button>

            <button
              onClick={() => setGovMode('eksekutif')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                govMode === 'eksekutif'
                  ? 'bg-[#E67E22] text-white shadow-xs'
                  : 'text-[#6C757D] hover:text-[#9A4C08] hover:bg-white/60'
              }`}
            >
              <Award className="w-4 h-4 text-amber-200" />
              <span>Mode Eksekutif (Pimpinan)</span>
            </button>
          </div>
        </div>

        {/* Dynamic Context Banner */}
        <div className="mt-3 pt-3 border-t border-[#DCE0E6]/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#495057]">
            <Info className="w-4 h-4 text-[#184C78] shrink-0" />
            {govMode === 'operasional' ? (
              <span>
                <strong>Mode Operasional Aktif:</strong> Fokus pada pengelolaan proyek dinas, input kurva-S mingguan, unggah foto bukti lapangan, dan menjawab tiket aduan warga.
              </span>
            ) : (
              <span>
                <strong>Mode Eksekutif Aktif:</strong> Fokus pada monitoring serapan anggaran lintas dinas, deteksi dini anomali AI (*Early Warning*), sentimen warga, dan ekspor laporan.
              </span>
            )}
          </div>
          <button
            onClick={() => setGovMode(govMode === 'operasional' ? 'eksekutif' : 'operasional')}
            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-[#184C78] hover:underline cursor-pointer shrink-0 ml-4"
          >
            <span>Beralih ke {govMode === 'operasional' ? 'Eksekutif' : 'Operasional'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ── CONDITIONAL SUB-DASHBOARD VIEW ── */}
      {govMode === 'operasional' ? (
        <AdminDinasDashboard
          currentUser={currentUser}
          projects={projects}
          onOpenProjectDetail={onOpenProjectDetail}
        />
      ) : (
        <PimpinanDashboard
          currentUser={currentUser}
          projects={projects}
          onOpenProjectDetail={onOpenProjectDetail}
        />
      )}
    </div>
  );
};
