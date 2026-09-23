import React from 'react';
import { X, Code2, Download, ExternalLink, Check } from 'lucide-react';
import type { ProyekItem } from '../types';

interface OpenDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProyekItem[];
}

export const OpenDataModal: React.FC<OpenDataModalProps> = ({
  isOpen,
  onClose,
  projects,
}) => {
  if (!isOpen) return null;

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projects, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "civictrack_open_data_projects.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-[#DCE0E6] my-8">
        {/* Header */}
        <div className="bg-[#184C78] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center mb-3 text-white">
            <Code2 className="w-5 h-5" />
          </div>
          <h3 className="font-['DM_Sans'] text-xl font-bold">
            Portal Data Terbuka (Open Data API)
          </h3>
          <p className="text-xs text-white/70 mt-1">
            Akses dataset publik proyek pembangunan daerah untuk riset, jurnalisme data, dan pengawasan independen.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div>
            <h4 className="text-xs font-bold text-[#184C78] mb-2 uppercase tracking-wider">
              Endpoint REST API Publik (Bebas Akses Tanpa API Key):
            </h4>
            <div className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs font-mono overflow-x-auto space-y-1.5">
              <div className="text-emerald-400">GET http://localhost:8000/api/v1/open-data/proyek</div>
              <div className="text-slate-400">GET http://localhost:8000/api/v1/open-data/proyek/geojson</div>
              <div className="text-blue-400">GET http://localhost:8000/api/v1/stats/summary</div>
            </div>
          </div>

          <div className="bg-[#EBF4FB] border border-[#c5def2] rounded-xl p-4 text-xs text-[#184C78] space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#2980B9]" />
              Standar Transparansi Satu Data Indonesia
            </div>
            <p className="text-[#6C757D]">
              Format JSON &amp; GeoJSON mencakup koordinat spasial, pagu anggaran, nama dinas penanggung jawab, persentase linimasa, dan riwayat realisasi.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleDownloadJSON}
              className="flex-1 py-2.5 bg-[#184C78] hover:bg-[#0f3252] text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" /> Unduh Dataset JSON ({projects.length} Proyek)
            </button>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-[#F5F7FA] hover:bg-[#DCE0E6] text-[#184C78] font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 border border-[#DCE0E6]"
            >
              Swagger Docs <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
