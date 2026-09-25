import React, { useState } from 'react';
import {
  BookOpen,
  Code2,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import type { UserProfile, ProyekItem } from '../../types';

interface PenelitiDashboardProps {
  currentUser?: UserProfile;
  projects: ProyekItem[];
  onOpenOpenDataModal: () => void;
}

export const PenelitiDashboard: React.FC<PenelitiDashboardProps> = ({
  projects,
  onOpenOpenDataModal,
}) => {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const handleExportAllJSON = () => {
    const dataStr = JSON.stringify(projects, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CivicTrack_Public_Dataset_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-hero-in">
      {/* ── TOP BANNER ── */}
      <div className="bg-gradient-to-r from-[#0E6243] via-[#1A9E6E] to-[#2980B9] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide mb-3">
            <BookOpen className="w-4 h-4 text-emerald-200" />
            <span>Portal Riset, Akademisi &amp; Jurnalisme Data</span>
          </div>
          <h1 className="font-['DM_Sans'] text-2xl sm:text-3xl font-extrabold tracking-tight">
            Data Terbuka CivicTrack
          </h1>
          <p className="text-white/85 text-xs sm:text-sm mt-1 leading-relaxed">
            Akses seluruh dataset proyek pembangunan daerah secara bebas melalui REST API publik atau unduh dalam format terstruktur untuk keperluan riset independen.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={handleExportAllJSON}
              className="px-4 py-2 bg-white text-[#0E6243] font-bold text-xs rounded-xl shadow-xs hover:bg-slate-100 flex items-center gap-2 cursor-pointer transition-transform hover:scale-102"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Dataset Lengkap (JSON)</span>
            </button>
            <button
              onClick={onOpenOpenDataModal}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs rounded-xl backdrop-blur-md flex items-center gap-2 cursor-pointer transition-all"
            >
              <Code2 className="w-4 h-4" />
              <span>Dokumentasi API Terbuka</span>
            </button>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none -mr-16 -mb-16" />
      </div>

      {/* ── API ENDPOINT CATALOG ── */}
      <div className="bg-white rounded-2xl border border-[#DCE0E6] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-['DM_Sans'] font-bold text-base text-[#184C78]">
              Katalog REST API Terbuka Publik (Open API V1)
            </h3>
            <p className="text-xs text-[#6C757D] mt-0.5">
              Semua endpoint berikut bersifat publik, mendukung query filter, CORS aktif, dan format standar JSON / GeoJSON.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            {
              id: 'ep1',
              method: 'GET',
              path: '/api/v1/open-data/proyek',
              desc: 'Daftar seluruh proyek dengan filter status, kategori, wilayah, dan pagu anggaran.',
              params: '?status=berjalan&kategori=jalan&limit=50',
            },
            {
              id: 'ep2',
              method: 'GET',
              path: '/api/v1/open-data/proyek/geojson',
              desc: 'Layer spasial GeoJSON FeatureCollection untuk visualisasi peta GIS / Leaflet / QGIS.',
              params: '?format=geojson',
            },
            {
              id: 'ep3',
              method: 'GET',
              path: '/api/v1/open-data/statistik/ringkasan',
              desc: 'Agregat total pagu anggaran, serapan dinas, dan distribusi kategori pembangunan.',
              params: '',
            },
            {
              id: 'ep4',
              method: 'GET',
              path: '/api/v1/open-data/proyek/{id}/linimasa',
              desc: 'Riwayat linimasa, bobot tahapan, dan catatan pengawas lapangan per proyek.',
              params: '',
            },
          ].map((ep) => (
            <div key={ep.id} className="p-4 bg-[#F5F7FA] rounded-xl border border-[#DCE0E6]/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-extrabold px-2 py-0.5 rounded bg-[#184C78] text-white">
                    {ep.method}
                  </span>
                  <code className="text-xs font-mono font-bold text-[#212529]">
                    {ep.path}
                    <span className="text-[#2980B9]">{ep.params}</span>
                  </code>
                </div>
                <p className="text-xs text-[#495057]">{ep.desc}</p>
              </div>

              <button
                onClick={() => handleCopy(`https://api.civictrack.id${ep.path}${ep.params}`, ep.id)}
                className="px-3 py-1.5 bg-white hover:bg-[#EBF4FB] text-[#184C78] border border-[#DCE0E6] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              >
                {copiedEndpoint === ep.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#1A9E6E]" />
                    <span className="text-[#1A9E6E]">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin URL API</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
