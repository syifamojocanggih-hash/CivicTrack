import React, { useState, useMemo } from 'react';
import {
  X,
  MapPin,
  Navigation,
  AlertTriangle,
  Building2,
  ChevronRight,
  SlidersHorizontal,
  Compass,
  Sparkles,
  Layers
} from 'lucide-react';
import type { ProyekItem, ProyekKategori } from '../types';

interface NearbyMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProyekItem[];
  onSelectProject: (project: ProyekItem) => void;
  onOpenAIRoute: (projectName: string) => void;
}

interface NearbyProjectItem extends ProyekItem {
  distanceKm: number;
  trafficImpact: string;
  impactLevel: 'low' | 'medium' | 'high';
  mapX: number;
  mapY: number;
}

export const NearbyMapModal: React.FC<NearbyMapModalProps> = ({
  isOpen,
  onClose,
  projects,
  onSelectProject,
  onOpenAIRoute,
}) => {
  const [selectedRadius, setSelectedRadius] = useState<number>(3); // 1, 3, 5, or 10 km
  const [selectedCategory, setSelectedCategory] = useState<ProyekKategori | 'all'>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [userLocationName, setUserLocationName] = useState<string>('Pusat Kota (Klojen - Lowokwaru)');

  // User simulated location coordinates on SVG map (center: 270, 175)
  const userMapPoint = { x: 270, y: 175 };

  // Calculate nearby projects with realistic distance & map layout
  const nearbyProjectsList = useMemo<NearbyProjectItem[]>(() => {
    const layoutMap: Record<number, { x: number; y: number; dist: number; impact: string; level: 'low' | 'medium' | 'high' }> = {
      1: {
        x: 185,
        y: 85,
        dist: 0.9,
        impact: 'Aktivitas alat berat di area taman, jalur pedestrian dialihkan sementara',
        level: 'low',
      },
      2: {
        x: 350,
        y: 135,
        dist: 1.4,
        impact: 'Penyempitan lajur kanan 300m, potensi perlambatan kecepatan 20-30 km/jam',
        level: 'high',
      },
      3: {
        x: 230,
        y: 250,
        dist: 2.1,
        impact: 'Proyek normalisasi selesai, arus lalu lintas sudah normal 100%',
        level: 'low',
      },
      4: {
        x: 140,
        y: 220,
        dist: 2.8,
        impact: 'Jembatan ditutup total untuk inspeksi geoteknik, gunakan jalur alternatif lingkar',
        level: 'high',
      },
      5: {
        x: 395,
        y: 245,
        dist: 3.6,
        impact: 'Bongkar muat material pada pukul 21:00-05:00 WIB, siang hari lancar',
        level: 'medium',
      },
      6: {
        x: 430,
        y: 90,
        dist: 4.5,
        impact: 'Pemasangan tiang penerangan jalan umum, bahu jalan tidak dapat digunakan parkir',
        level: 'low',
      },
    };

    return projects.map((proj, idx) => {
      const extra = layoutMap[proj.id] || {
        x: 160 + ((idx * 65) % 280),
        y: 70 + ((idx * 55) % 210),
        dist: Number((1.2 + idx * 0.7).toFixed(1)),
        impact: 'Pekerjaan fisik sedang berlangsung dengan pengawasan rambu K3',
        level: 'medium',
      };

      return {
        ...proj,
        distanceKm: extra.dist,
        trafficImpact: extra.impact,
        impactLevel: extra.level,
        mapX: extra.x,
        mapY: extra.y,
      };
    });
  }, [projects]);

  // Filter based on radius and category
  const filteredNearby = useMemo(() => {
    return nearbyProjectsList
      .filter((p) => {
        if (p.distanceKm > selectedRadius) return false;
        if (selectedCategory !== 'all' && p.kategori !== selectedCategory) return false;
        return true;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [nearbyProjectsList, selectedRadius, selectedCategory]);

  const activeProject = useMemo(() => {
    if (!selectedProjectId) {
      return filteredNearby[0] || nearbyProjectsList[0];
    }
    return nearbyProjectsList.find((p) => p.id === selectedProjectId) || filteredNearby[0] || nearbyProjectsList[0];
  }, [selectedProjectId, filteredNearby, nearbyProjectsList]);

  if (!isOpen) return null;

  // Pixel radius calculation on SVG
  const svgRadius = Math.min(selectedRadius * 48, 230);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-[#DCE0E6] overflow-hidden my-auto animate-scale-up">
        {/* ── MODAL HEADER ── */}
        <div className="bg-[#184C78] text-white px-5 sm:px-7 py-4.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white shadow-inner">
              <Compass className="w-5 h-5 text-emerald-300 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['DM_Sans'] text-lg sm:text-xl font-bold tracking-tight">
                  Peta &amp; Informasi Pembangunan di Sekitar
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Live GPS
                </span>
              </div>
              <p className="text-xs text-white/80 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Titik Pengamatan: <strong>{userLocationName}</strong></span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── FILTER TOOLBAR ── */}
        <div className="bg-[#F8FAFC] border-b border-[#DCE0E6] px-5 sm:px-7 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Radius selector */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#184C78] flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Radius Jangkauan:
            </span>
            <div className="flex gap-1 bg-white p-1 rounded-lg border border-[#DCE0E6]">
              {[1, 3, 5].map((rad) => (
                <button
                  key={rad}
                  onClick={() => setSelectedRadius(rad)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    selectedRadius === rad
                      ? 'bg-[#184C78] text-white shadow-sm'
                      : 'text-[#6C757D] hover:text-[#184C78] hover:bg-slate-100'
                  }`}
                >
                  {rad} km
                </button>
              ))}
              <button
                onClick={() => setSelectedRadius(10)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  selectedRadius === 10
                    ? 'bg-[#184C78] text-white shadow-sm'
                    : 'text-[#6C757D] hover:text-[#184C78] hover:bg-slate-100'
                }`}
              >
                Semua
              </button>
            </div>
          </div>

          {/* Quick Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[#6C757D] font-medium mr-1">Kategori:</span>
            {[
              { id: 'all', label: 'Semua' },
              { id: 'jalan', label: '🛣️ Jalan' },
              { id: 'taman', label: '🌳 Taman' },
              { id: 'drainase', label: '💧 Drainase' },
              { id: 'fasilitas', label: '🏢 Fasilitas' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer border ${
                  selectedCategory === cat.id
                    ? 'bg-[#2980B9] text-white border-[#2980B9]'
                    : 'bg-white text-[#6C757D] border-[#DCE0E6] hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── MODAL CONTENT: 2 COLUMNS (MAP + PROJECTS LIST) ── */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-y-auto lg:overflow-hidden">
          {/* LEFT: INTERACTIVE NEARBY MAP (7 COLS) */}
          <div className="lg:col-span-7 bg-[#E8F2E8] relative flex flex-col border-b lg:border-b-0 lg:border-r border-[#DCE0E6] min-h-[340px] lg:min-h-[480px]">
            {/* Map Canvas Header Bar */}
            <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
              <div className="bg-white/95 backdrop-blur-md border border-[#DCE0E6] shadow-sm rounded-lg px-3 py-1.5 flex items-center gap-2 pointer-events-auto">
                <Layers className="w-3.5 h-3.5 text-[#184C78]" />
                <span className="text-xs font-bold text-[#184C78] font-['DM_Sans']">
                  Peta Sekitar Kota Malang
                </span>
                <span className="text-[10px] text-[#6C757D]">
                  • {filteredNearby.length} proyek terdeteksi
                </span>
              </div>

              {/* Location Switcher */}
              <select
                value={userLocationName}
                onChange={(e) => setUserLocationName(e.target.value)}
                className="bg-white/95 backdrop-blur-md border border-[#DCE0E6] shadow-sm rounded-lg px-2.5 py-1 text-[11px] font-medium text-[#184C78] outline-none pointer-events-auto cursor-pointer"
              >
                <option value="Pusat Kota (Klojen - Lowokwaru)">📍 Pusat Kota (Klojen)</option>
                <option value="Jl. Soekarno Hatta (Lowokwaru)">📍 Area Suhat / Kampus</option>
                <option value="Alun-Alun / Pasar Besar">📍 Kawasan Bisnis Kota</option>
              </select>
            </div>

            {/* SVG Interactive Map */}
            <div className="flex-1 relative flex items-center justify-center p-2 select-none overflow-hidden">
              <svg
                className="w-full h-full max-h-[460px] block"
                viewBox="0 0 540 350"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <radialGradient id="radarPulse" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#2980B9" stopOpacity="0.35" />
                    <stop offset="70%" stopColor="#2980B9" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#2980B9" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#f0f4f8" stopOpacity="0.75" />
                  </linearGradient>
                </defs>

                {/* Base Ground */}
                <rect width="540" height="350" fill="#E8F1E9" />

                {/* River / Water Canal */}
                <path
                  d="M0 310 Q80 280 160 305 T320 295 T480 320 L540 330 L540 350 L0 350 Z"
                  fill="#9fc2de"
                  opacity="0.45"
                />

                {/* City Blocks */}
                <rect x="30" y="25" width="85" height="60" rx="4" fill="#cadbc9" opacity="0.65" />
                <rect x="140" y="25" width="105" height="60" rx="4" fill="#cadbc9" opacity="0.65" />
                <rect x="270" y="25" width="115" height="60" rx="4" fill="#cadbc9" opacity="0.65" />
                <rect x="410" y="25" width="100" height="60" rx="4" fill="#cadbc9" opacity="0.6" />

                <rect x="30" y="115" width="85" height="65" rx="4" fill="#cadbc9" opacity="0.6" />
                <rect x="140" y="115" width="105" height="65" rx="4" fill="#cadbc9" opacity="0.65" />
                <rect x="270" y="115" width="115" height="65" rx="4" fill="#cadbc9" opacity="0.6" />
                <rect x="410" y="115" width="100" height="65" rx="4" fill="#cadbc9" opacity="0.55" />

                <rect x="30" y="210" width="85" height="65" rx="4" fill="#cadbc9" opacity="0.55" />
                <rect x="140" y="210" width="105" height="65" rx="4" fill="#cadbc9" opacity="0.6" />
                <rect x="270" y="210" width="115" height="65" rx="4" fill="#cadbc9" opacity="0.65" />
                <rect x="410" y="210" width="100" height="65" rx="4" fill="#cadbc9" opacity="0.55" />

                {/* Park */}
                <ellipse cx="190" cy="55" rx="45" ry="26" fill="#78c286" opacity="0.6" />

                {/* Roads */}
                <line x1="0" y1="100" x2="540" y2="100" stroke="url(#roadGrad)" strokeWidth="12" />
                <line x1="0" y1="195" x2="540" y2="195" stroke="url(#roadGrad)" strokeWidth="10" />
                <line x1="125" y1="0" x2="125" y2="350" stroke="url(#roadGrad)" strokeWidth="11" />
                <line x1="255" y1="0" x2="255" y2="350" stroke="url(#roadGrad)" strokeWidth="11" />
                <line x1="395" y1="0" x2="395" y2="350" stroke="url(#roadGrad)" strokeWidth="10" />

                <line x1="0" y1="140" x2="255" y2="100" stroke="#fff" strokeWidth="7" opacity="0.8" />
                <line x1="255" y1="195" x2="540" y2="140" stroke="#fff" strokeWidth="6" opacity="0.75" />

                {/* Dynamic Radius Circle */}
                <circle
                  cx={userMapPoint.x}
                  cy={userMapPoint.y}
                  r={svgRadius}
                  fill="url(#radarPulse)"
                  stroke="#2980B9"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="transition-all duration-500 ease-out"
                />

                {/* Distance line */}
                {activeProject && (
                  <line
                    x1={userMapPoint.x}
                    y1={userMapPoint.y}
                    x2={activeProject.mapX}
                    y2={activeProject.mapY}
                    stroke="#184C78"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                    className="animate-pulse"
                  />
                )}

                {/* User Location */}
                <g transform={`translate(${userMapPoint.x}, ${userMapPoint.y})`}>
                  <circle r="18" fill="#2980B9" opacity="0.2" className="animate-ping" />
                  <circle r="10" fill="#2980B9" stroke="#ffffff" strokeWidth="2.5" />
                  <circle r="4" fill="#ffffff" />
                  <rect x="-35" y="-28" width="70" height="18" rx="9" fill="#184C78" />
                  <text
                    x="0"
                    y="-16"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="Inter"
                  >
                    📍 Anda Di Sini
                  </text>
                </g>

                {/* Projects Pins */}
                {filteredNearby.map((pin, idx) => {
                  const isSelected = activeProject?.id === pin.id;
                  const pinColor =
                    pin.status === 'selesai'
                      ? '#10B981'
                      : pin.status === 'ditangguhkan'
                      ? '#94A3B8'
                      : '#E67E22';

                  return (
                    <g
                      key={pin.id}
                      transform={`translate(${pin.mapX}, ${pin.mapY})`}
                      onClick={() => setSelectedProjectId(pin.id)}
                      className="cursor-pointer transition-transform duration-200 hover:scale-125"
                    >
                      {isSelected && (
                        <circle r="22" fill={pinColor} opacity="0.3" className="animate-ping" />
                      )}

                      <circle
                        r={isSelected ? 16 : 13}
                        fill="white"
                        stroke={pinColor}
                        strokeWidth={isSelected ? 3.5 : 2.5}
                        filter="drop-shadow(0px 3px 5px rgba(0,0,0,0.25))"
                      />
                      <circle r={isSelected ? 8 : 6} fill={pinColor} />

                      <text
                        x="0"
                        y="3.5"
                        textAnchor="middle"
                        fill="white"
                        fontSize={isSelected ? "9" : "8"}
                        fontWeight="bold"
                        fontFamily="Inter"
                      >
                        {idx + 1}
                      </text>

                      <rect
                        x="-20"
                        y="-24"
                        width="40"
                        height="14"
                        rx="7"
                        fill={isSelected ? '#184C78' : 'white'}
                        stroke={isSelected ? '#184C78' : '#DCE0E6'}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="-14"
                        textAnchor="middle"
                        fill={isSelected ? '#ffffff' : '#475569'}
                        fontSize="8"
                        fontWeight="bold"
                        fontFamily="Inter"
                      >
                        {pin.distanceKm} km
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Map Legend Footer */}
            <div className="bg-white/95 backdrop-blur-sm border-t border-[#DCE0E6] px-4 py-2.5 flex items-center justify-between text-[11px] text-[#6C757D]">
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E67E22] inline-block"></span>
                  Pekerjaan Berjalan
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block"></span>
                  Selesai
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8] inline-block"></span>
                  Ditangguhkan
                </span>
              </div>
              <div className="text-[10px] text-[#184C78] font-bold hidden sm:block">
                *Klik titik marker untuk fokus info
              </div>
            </div>
          </div>

          {/* RIGHT: DETAILED CONSTRUCTION INFO LIST (5 COLS) */}
          <div className="lg:col-span-5 flex flex-col bg-white overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#DCE0E6] bg-[#FAFCFF] flex items-center justify-between">
              <div>
                <h4 className="font-['DM_Sans'] font-bold text-sm text-[#184C78]">
                  Pekerjaan di Radius {selectedRadius === 10 ? 'Seluruh Kota' : `${selectedRadius} km`}
                </h4>
                <p className="text-[11px] text-[#6C757D]">
                  {filteredNearby.length} titik konstruksi ditemukan
                </p>
              </div>

              {activeProject && (
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 bg-[#EBF4FB] text-[#184C78] px-2 py-0.5 rounded-md font-bold text-xs">
                    <Navigation className="w-3 h-3 text-[#2980B9]" />
                    {activeProject.distanceKm} km dari Anda
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-[#F1F5F9]">
              {filteredNearby.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h5 className="font-bold text-sm text-[#184C78]">Tidak ada pembangunan ditemukan</h5>
                  <p className="text-xs text-[#6C757D] mt-1">
                    Coba perluas radius pencarian menjadi 5 km atau pilih semua kategori.
                  </p>
                  <button
                    onClick={() => { setSelectedRadius(10); setSelectedCategory('all'); }}
                    className="mt-3 px-3 py-1.5 bg-[#184C78] text-white text-xs font-semibold rounded-lg"
                  >
                    Perluas Jangkauan
                  </button>
                </div>
              ) : (
                filteredNearby.map((proj, idx) => {
                  const isSelected = activeProject?.id === proj.id;

                  return (
                    <div
                      key={proj.id}
                      onClick={() => setSelectedProjectId(proj.id)}
                      className={`pt-3 first:pt-0 rounded-xl p-3 cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-[#F0F7FF] border-[#2980B9] shadow-sm ring-1 ring-[#2980B9]/20'
                          : 'bg-white border-transparent hover:border-[#DCE0E6] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                              proj.status === 'selesai'
                                ? 'bg-[#10B981]'
                                : proj.status === 'ditangguhkan'
                                ? 'bg-slate-400'
                                : 'bg-[#E67E22]'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-[#184C78]">
                            📍 {proj.distanceKm} km
                          </span>
                          <span className="text-[10px] text-[#6C757D]">• {proj.nama_wilayah || 'Kota Malang'}</span>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            proj.status === 'selesai'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : proj.status === 'ditangguhkan'
                              ? 'bg-slate-100 text-slate-600 border border-slate-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {proj.status === 'selesai'
                            ? 'Selesai'
                            : proj.status === 'ditangguhkan'
                            ? 'Ditangguhkan'
                            : 'Sedang Berjalan'}
                        </span>
                      </div>

                      <h5 className="font-['DM_Sans'] text-sm font-bold text-[#184C78] line-clamp-1 mb-1">
                        {proj.nama_proyek}
                      </h5>

                      <div className="flex items-center gap-1.5 text-[11px] text-[#6C757D] mb-2.5">
                        <Building2 className="w-3 h-3 text-[#2980B9]" />
                        <span className="line-clamp-1">{proj.nama_dinas || 'Dinas PU & Penataan Ruang'}</span>
                      </div>

                      <div className="mb-2.5">
                        <div className="flex items-center justify-between text-[11px] mb-1 font-medium">
                          <span className="text-[#6C757D]">Progres Pengerjaan</span>
                          <span className="font-bold text-[#184C78]">{proj.progres_persen}%</span>
                        </div>
                        <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              proj.status === 'selesai'
                                ? 'bg-[#10B981]'
                                : 'bg-gradient-to-r from-[#2980B9] to-[#184C78]'
                            }`}
                            style={{ width: `${proj.progres_persen}%` }}
                          />
                        </div>
                      </div>

                      {proj.tahap_terkini && (
                        <div className="bg-white/80 border border-[#E2E8F0] rounded-lg p-2 text-[11px] text-[#334155] mb-2.5">
                          <span className="font-semibold text-[#184C78] block text-[10px] uppercase tracking-wider mb-0.5">
                            Tahap Pekerjaan Saat Ini:
                          </span>
                          <p className="line-clamp-2 leading-relaxed">{proj.tahap_terkini}</p>
                        </div>
                      )}

                      <div className="flex items-start gap-1.5 text-[11px] text-amber-800 bg-amber-50/70 border border-amber-200/70 rounded-lg p-2 mb-3">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="leading-snug">
                          <span className="font-bold text-[10px] block uppercase text-amber-700">
                            Dampak Sekitar &amp; Rekayasa:
                          </span>
                          {proj.trafficImpact}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProject(proj);
                          }}
                          className="flex-1 py-1.5 px-3 bg-[#184C78] hover:bg-[#0f3252] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Lihat Detail Pembangunan</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAIRoute(proj.nama_proyek);
                          }}
                          title="Buka Rekomendasi Rute AI"
                          className="p-1.5 border border-[#DCE0E6] hover:border-[#2980B9] text-[#184C78] hover:bg-[#EBF4FB] rounded-lg transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4 text-[#2980B9]" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 bg-[#F8FAFC] border-t border-[#DCE0E6] text-center text-[11px] text-[#6C757D]">
              Data diperbarui otomatis dari sistem pelaporan berkala Dinas PU &amp; Tata Ruang
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
