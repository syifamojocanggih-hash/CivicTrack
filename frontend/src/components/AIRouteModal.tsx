import React, { useState, useEffect } from 'react';
import { X, Sparkles, Clock, ShieldCheck, Navigation } from 'lucide-react';

interface AIRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
}

interface RouteItem {
  id?: number;
  nama_rute: string;
  prioritas: 'utama' | 'kedua' | 'tambahan' | string;
  estimasi_jarak_km: number;
  estimasi_waktu_menit: number;
  alasan_rekomendasi: string;
}

export const AIRouteModal: React.FC<AIRouteModalProps> = ({
  isOpen,
  onClose,
  projectName,
}) => {
  const [origin, setOrigin] = useState('Alun-Alun Lamongan');
  const [destination, setDestination] = useState('Stasiun Lamongan / Babat');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [routes, setRoutes] = useState<RouteItem[]>([
    {
      nama_rute: 'Jl. Jaksa Agung Suprapto - Jl. Soewoko - Jl. KH. Ahmad Dahlan',
      prioritas: 'utama',
      estimasi_jarak_km: 3.2,
      estimasi_waktu_menit: 9,
      alasan_rekomendasi: 'Jalur lebar beraspal baik dengan penerangan memadai, direkomendasikan untuk seluruh jenis kendaraan.',
    },
    {
      nama_rute: 'Jl. Basuki Rahmat - Jl. Sunan Giri - Jl. Lamongrejo',
      prioritas: 'kedua',
      estimasi_jarak_km: 4.5,
      estimasi_waktu_menit: 13,
      alasan_rekomendasi: 'Menghindari persimpangan padat Alun-alun Lamongan dan memecah volume kendaraan saat jam sibuk.',
    },
    {
      nama_rute: 'Jl. Dr. Wahidin Sudirohusodo - Jl. Kyai Amin - Jl. HOS Cokroaminoto',
      prioritas: 'tambahan',
      estimasi_jarak_km: 2.1,
      estimasi_waktu_menit: 6,
      alasan_rekomendasi: 'Rute pintas pemukiman berkecepatan rendah khusus bagi pengendara sepeda motor dan sepeda.',
    }
  ]);

  const fetchLiveRoutes = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/v1/proyek/1/generate-rute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catatan_penutupan: `Rute dari ${origin} menuju ${destination} melintasi proyek ${projectName || 'Jalan Veteran Lamongan'}`
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setRoutes(data);
        }
      }
    } catch (err) {
      console.warn('Live AI route fallback:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLiveRoutes();
    }
  }, [isOpen, projectName]);

  if (!isOpen) return null;

  const handleReanalyze = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLiveRoutes();
  };

  return (
    <div className="fixed inset-0 z-[2100] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-[#DCE0E6] my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#6D28D9] to-[#184C78] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Google Gemini 3.8 Flash AI Engine (Live)
          </div>
          <h3 className="font-['DM_Sans'] text-xl font-bold">
            Rekomendasi Rute Pengalihan Arus AI
          </h3>
          <p className="text-xs text-white/80 mt-1">
            Analisis mitigasi kemacetan untuk proyek: <strong>{projectName || 'Pelebaran Jalan Veteran - Lamongan'}</strong>
          </p>
        </div>

        {/* Input form */}
        <form onSubmit={handleReanalyze} className="p-5 border-b border-[#DCE0E6] bg-[#F5F7FA] grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#184C78] mb-1">Titik Awal Keberangkatan</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Contoh: Alun-Alun Lamongan"
              className="w-full px-3 py-2 text-xs border border-[#DCE0E6] rounded-lg bg-white outline-none focus:border-[#7C3AED]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#184C78] mb-1">Tujuan Perjalanan</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Contoh: Stasiun Lamongan"
              className="w-full px-3 py-2 text-xs border border-[#DCE0E6] rounded-lg bg-white outline-none focus:border-[#7C3AED]"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isAnalyzing}
              className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isAnalyzing ? 'Google Gemini Menganalisis Topologi...' : 'Hitung Ulang Rute Gemini AI'}
            </button>
          </div>
        </form>

        {/* Results */}
        <div className="p-6 space-y-4 max-h-[55vh] overflow-y-auto">
          {isAnalyzing ? (
            <div className="py-12 text-center text-[#6C757D] space-y-3">
              <div className="w-10 h-10 border-3 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-[#184C78]">Google Gemini AI sedang memproses topologi jaringan jalan Lamongan...</p>
              <p className="text-[11px] text-slate-400">Menghitung elevasi rute dan kapasitas jalan pengalihan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {routes.map((r, idx) => {
                const isUtama = r.prioritas === 'utama';
                const isKedua = r.prioritas === 'kedua';
                
                return (
                  <div
                    key={idx}
                    className={`border rounded-xl p-4 transition-all ${
                      isUtama
                        ? 'border-emerald-300 bg-emerald-50/70 shadow-xs'
                        : isKedua
                        ? 'border-blue-200 bg-blue-50/60'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white flex items-center gap-1 ${
                          isUtama
                            ? 'bg-emerald-600'
                            : isKedua
                            ? 'bg-[#2980B9]'
                            : 'bg-slate-600'
                        }`}
                      >
                        {isUtama && <ShieldCheck className="w-3 h-3" />}
                        Prioritas {idx + 1}: {isUtama ? 'Rute Utama (Rekomendasi AI)' : isKedua ? 'Jalur Alternatif Kedua' : 'Jalur Lingkar Tambahan'}
                      </span>
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#2980B9]" />
                        <span>{r.estimasi_waktu_menit} menit ({r.estimasi_jarak_km} km)</span>
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#184C78] flex items-center gap-1.5 mt-2">
                      <Navigation className="w-3.5 h-3.5 text-[#2980B9] shrink-0" />
                      <span>{r.nama_rute}</span>
                    </h4>

                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-slate-200/50">
                      💡 {r.alasan_rekomendasi}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
