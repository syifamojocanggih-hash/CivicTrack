import React from 'react';
import { MapPin, ArrowRight, FilterX } from 'lucide-react';
import type { ProyekItem, ProyekKategori } from '../types';

interface RecentProjectsSectionProps {
  projects: ProyekItem[];
  onSelectProject: (project: ProyekItem) => void;
  selectedCategory: ProyekKategori | null;
  onClearFilters: () => void;
  searchQuery: string;
}

export const RecentProjectsSection: React.FC<RecentProjectsSectionProps> = ({
  projects,
  onSelectProject,
  selectedCategory,
  onClearFilters,
  searchQuery,
}) => {
  const getStatusBadge = (status: ProyekItem['status']) => {
    switch (status) {
      case 'berjalan':
        return (
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap bg-[#FEF3E7] text-[#E67E22]">
            Berjalan
          </span>
        );
      case 'selesai':
        return (
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap bg-[#E6F7F1] text-[#1A9E6E]">
            Selesai
          </span>
        );
      case 'ditangguhkan':
        return (
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap bg-[#F5F7FA] text-[#6C757D] border border-[#DCE0E6]">
            Ditangguhkan
          </span>
        );
    }
  };

  const getStatusDot = (status: ProyekItem['status']) => {
    switch (status) {
      case 'berjalan':
        return <span className="w-2.5 h-2.5 rounded-full bg-[#E67E22] shrink-0" />;
      case 'selesai':
        return <span className="w-2.5 h-2.5 rounded-full bg-[#1A9E6E] shrink-0" />;
      case 'ditangguhkan':
        return <span className="w-2.5 h-2.5 rounded-full bg-[#adb5bd] shrink-0" />;
    }
  };

  const getProgressBarColor = (status: ProyekItem['status']) => {
    if (status === 'selesai') return 'bg-[#1A9E6E]';
    if (status === 'ditangguhkan') return 'bg-[#9BA5B0]';
    return 'bg-gradient-to-r from-[#2980B9] to-[#184C78]';
  };

  return (
    <section id="recent-projects" className="bg-[#F5F7FA] border-t border-[#DCE0E6] py-20 px-6 sm:px-8">
      <div className="max-w-[1180px] mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-7 gap-4">
          <div>
            <h2 className="font-['DM_Sans'] text-2xl font-extrabold text-[#184C78] tracking-[-0.6px]">
              Proyek diperbarui baru-baru ini
            </h2>
            {(selectedCategory || searchQuery) && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-[#6C757D]">
                  Menampilkan filter: {selectedCategory ? `Kategori "${selectedCategory}"` : ''} {searchQuery ? `Pencarian "${searchQuery}"` : ''}
                </span>
                <button
                  onClick={onClearFilters}
                  className="text-xs text-red-600 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <FilterX className="w-3.5 h-3.5" /> Hapus filter
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-[13px] font-semibold text-[#2980B9] hover:underline flex items-center gap-1"
          >
            Lihat semua proyek <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Project List */}
        <div className="flex flex-col gap-2.5">
          {projects.length === 0 ? (
            <div className="bg-white border border-[#DCE0E6] rounded-xl p-8 text-center text-[#6C757D]">
              <p className="font-medium">Tidak ada proyek yang sesuai dengan kriteria pencarian.</p>
              <button
                onClick={onClearFilters}
                className="mt-3 text-sm text-[#2980B9] font-semibold hover:underline"
              >
                Reset pencarian &amp; filter
              </button>
            </div>
          ) : (
            projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj)}
                className="bg-white border border-[#DCE0E6] rounded-[10px] p-4 sm:px-5 sm:py-4 grid grid-cols-1 sm:grid-cols-[auto_1fr_auto_auto] items-center gap-4 hover:shadow-[0_1px_3px_rgba(24,76,120,0.07),0_2px_8px_rgba(24,76,120,0.05)] hover:border-[#c5d9eb] transition-all cursor-pointer group"
              >
                {/* Dot */}
                <div className="hidden sm:block">
                  {getStatusDot(proj.status)}
                </div>

                {/* Info */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="sm:hidden">{getStatusDot(proj.status)}</span>
                    <h3 className="text-sm font-semibold text-[#184C78] group-hover:text-[#2980B9] transition-colors">
                      {proj.nama_proyek}
                    </h3>
                  </div>
                  <div className="text-xs text-[#6C757D] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#6C757D] shrink-0" />
                    <span>{proj.nama_wilayah || 'Kota Malang'}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full sm:w-[140px]">
                  <div className="flex justify-between text-[11px] text-[#6C757D] mb-1.5 font-medium">
                    <span>Progres</span>
                    <span>{proj.progres_persen}%</span>
                  </div>
                  <div className="h-1.5 bg-[#DCE0E6] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${getProgressBarColor(proj.status)}`}
                      style={{ width: `${proj.progres_persen}%` }}
                    />
                  </div>
                </div>

                {/* Status badge */}
                <div className="flex justify-end sm:block">
                  {getStatusBadge(proj.status)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
