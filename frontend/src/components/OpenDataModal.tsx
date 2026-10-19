import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  // Lock body scroll and handle Escape key when modal is open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

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

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-open-data-title"
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/65 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-2.5 sm:p-4 md:p-6 text-center">
        <div
          className="relative bg-white rounded-2xl sm:rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-[#DCE0E6] my-auto animate-fade-in flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#184C78] text-white p-4 sm:p-6 relative shrink-0">
            <button
              onClick={onClose}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Tutup Modal"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center mb-2.5 sm:mb-3 text-white">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 id="modal-open-data-title" className="font-['DM_Sans'] text-lg sm:text-xl font-bold pr-8 sm:pr-0">
              Portal Data Terbuka (Open Data API)
            </h3>
            <p className="text-xs text-white/70 mt-1 leading-relaxed">
              Akses dataset publik proyek pembangunan daerah untuk riset, jurnalisme data, dan pengawasan independen.
            </p>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto min-h-0 flex-1 scrollbar-thin">
            <div>
              <h4 className="text-xs font-bold text-[#184C78] mb-2 uppercase tracking-wider">
                Endpoint REST API Publik (Bebas Akses Tanpa API Key):
              </h4>
              <div className="bg-slate-900 text-slate-100 p-3 sm:p-3.5 rounded-xl text-xs font-mono overflow-x-auto space-y-1.5 scrollbar-thin">
                <div className="text-emerald-400">GET http://localhost:8000/api/v1/open-data/proyek</div>
                <div className="text-slate-400">GET http://localhost:8000/api/v1/open-data/proyek/geojson</div>
                <div className="text-blue-400">GET http://localhost:8000/api/v1/stats/summary</div>
              </div>
            </div>

            <div className="bg-[#EBF4FB] border border-[#c5def2] rounded-xl p-3.5 sm:p-4 text-xs text-[#184C78] space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#2980B9] shrink-0" />
                <span>Standar Transparansi Satu Data Indonesia</span>
              </div>
              <p className="text-[#6C757D] leading-relaxed">
                Format JSON &amp; GeoJSON mencakup koordinat spasial, pagu anggaran, nama dinas penanggung jawab, persentase linimasa, dan riwayat realisasi.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2">
              <button
                onClick={handleDownloadJSON}
                className="w-full sm:flex-1 py-2.5 bg-[#184C78] hover:bg-[#0f3252] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" /> Unduh Dataset JSON ({projects.length} Proyek)
              </button>
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-4 py-2.5 bg-[#F5F7FA] hover:bg-[#DCE0E6] text-[#184C78] font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 border border-[#DCE0E6] text-center"
              >
                Swagger Docs <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
