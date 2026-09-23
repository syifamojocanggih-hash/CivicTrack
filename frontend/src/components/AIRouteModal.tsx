import React, { useState } from 'react';
import { X, Sparkles, Clock, ShieldCheck } from 'lucide-react';

interface AIRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
}

export const AIRouteModal: React.FC<AIRouteModalProps> = ({
  isOpen,
  onClose,
  projectName,
}) => {
  const [origin, setOrigin] = useState('Jl. Veteran (Kampus UB)');
  const [destination, setDestination] = useState('Stasiun Kota Baru Malang');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(true);

  if (!isOpen) return null;

  const handleReanalyze = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setShowResult(false);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResult(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-[#DCE0E6] my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#6D28D9] to-[#184C78] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Google Gemini 2.0 AI Engine
          </div>
          <h3 className="font-['DM_Sans'] text-xl font-bold">
            Rekomendasi Rute Pengalihan Arus AI
          </h3>
          <p className="text-xs text-white/80 mt-1">
            Analisis mitigasi kemacetan untuk proyek: <strong>{projectName || 'Pelebaran Jalan'}</strong>
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
              className="w-full px-3 py-2 text-xs border border-[#DCE0E6] rounded-lg bg-white outline-none focus:border-[#7C3AED]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#184C78] mb-1">Tujuan Perjalanan</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
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
              {isAnalyzing ? 'Menganalisis Pola Lalu Lintas...' : 'Hitung Ulang Rute AI'}
            </button>
          </div>
        </form>

        {/* Results */}
        <div className="p-6 space-y-4 max-h-[55vh] overflow-y-auto">
          {isAnalyzing ? (
            <div className="py-12 text-center text-[#6C757D] space-y-3">
              <div className="w-10 h-10 border-3 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-medium">Sedang memproses topologi jaringan jalan &amp; kondisi penutupan...</p>
            </div>
          ) : showResult ? (
            <div className="space-y-3">
              {/* Prioritas 1: Utama */}
              <div className="border border-emerald-300 bg-emerald-50/70 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Prioritas 1: Rute Utama (Rekomendasi Terbaik)
                  </span>
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> +7 menit (4.2 km)
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#184C78]">Via Koridor Jl. Candi Panggung &rarr; Jl. Kalpataru &rarr; Jl. Bandung</h4>
                <p className="text-xs text-[#6C757D] mt-1">
                  Kapasitas jalan lebar 8 meter, lampu lalu lintas telah disinkronkan oleh Dishub untuk prioritas lajur pengalihan.
                </p>
              </div>

              {/* Prioritas 2: Kedua */}
              <div className="border border-blue-200 bg-blue-50/60 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#2980B9] text-white">
                    Prioritas 2: Jalur Alternatif Kedua
                  </span>
                  <span className="text-xs font-bold text-[#184C78] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> +12 menit (5.1 km)
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#184C78]">Via Jl. Mayjen Panjaitan &rarr; Jl. Jakarta &rarr; Jl. Ijen</h4>
                <p className="text-xs text-[#6C757D] mt-1">
                  Direkomendasikan khusus untuk kendaraan roda 2 dan angkutan kota berukuran kecil.
                </p>
              </div>

              {/* Prioritas 3: Tambahan */}
              <div className="border border-slate-200 bg-slate-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-600 text-white">
                    Prioritas 3: Jalur Lingkar Luar (Khusus Angkutan Berat)
                  </span>
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> +18 menit (7.8 km)
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#184C78]">Via Jalur Lingkar Barat (Jalan Arteri Sekunder)</h4>
                <p className="text-xs text-[#6C757D] mt-1">
                  Wajib bagi truk bertonase &gt; 5 ton dan bus antarkota demi mencegah kemacetan pemukiman.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
