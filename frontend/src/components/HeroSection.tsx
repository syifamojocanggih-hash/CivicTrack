import React, { useState } from 'react';
import { MapPin, ShieldCheck, Compass, LayoutDashboard } from 'lucide-react';
import type { ProyekItem } from '../types';

interface HeroSectionProps {
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  onSearchSubmit?: (q: string) => void;
  onSelectChip?: (chip: string) => void;
  onSelectProject: (project: ProyekItem) => void;
  projects: ProyekItem[];
  onOpenNearbyMap?: () => void;
  onOpenDashboard?: () => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSelectProject,
  projects,
  onOpenNearbyMap,
  onOpenDashboard,
}) => {
  const [mapFilter, setMapFilter] = useState<'all' | 'jalan' | 'taman'>('all');
  const [selectedPinIndex, setSelectedPinIndex] = useState<number>(0);

  const handleCekDisekitar = () => {
    if (onOpenNearbyMap) {
      onOpenNearbyMap();
    } else {
      setSelectedPinIndex((prev) => (prev + 1) % mapProjects.length);
      const mapVisual = document.querySelector('.hero-visual');
      if (mapVisual) {
        mapVisual.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Data for interactive map points
  const mapProjects = [
    {
      id: 1,
      name: 'Renovasi Alun-Alun & Taman Centennial',
      category: 'taman',
      tag: 'Taman & RTH',
      progress: 65,
      date: 'Okt 2024',
      status: 'berjalan',
      color: '#E67E22',
      x: 170,
      y: 35,
      r: 12,
      wilayah: 'Kec. Lamongan (Kota)',
    },
    {
      id: 2,
      name: 'Pelebaran Jalan Poros Deket - Pantura',
      category: 'jalan',
      tag: 'Jalan & Jembatan',
      progress: 38,
      date: 'Des 2024',
      status: 'berjalan',
      color: '#184C78',
      x: 250,
      y: 105,
      r: 12,
      wilayah: 'Kec. Deket',
    },
    {
      id: 3,
      name: 'Tanggul Pengendali Banjir Bengawan Jero',
      category: 'drainase',
      tag: 'Drainase & Sanitasi',
      progress: 100,
      date: 'Feb 2024',
      status: 'selesai',
      color: '#1A9E6E',
      x: 420,
      y: 120,
      r: 12,
      wilayah: 'Kec. Kalitengah',
    },
    {
      id: 4,
      name: 'Flyover & Jembatan Simpang Babat',
      category: 'jalan',
      tag: 'Jalan & Jembatan',
      progress: 45,
      date: 'Nov 2024',
      status: 'berjalan',
      color: '#184C78',
      x: 440,
      y: 42,
      r: 10,
      wilayah: 'Kec. Babat',
    },
    {
      id: 5,
      name: 'Pelebaran Akses Wisata Bahari Lamongan (WBL)',
      category: 'jalan',
      tag: 'Jalan & Jembatan',
      progress: 100,
      date: 'Mei 2024',
      status: 'selesai',
      color: '#1A9E6E',
      x: 80,
      y: 110,
      r: 11,
      wilayah: 'Kec. Paciran',
    },
  ];

  const currentHighlight = mapProjects[selectedPinIndex] || mapProjects[0];

  const handleMarkerClick = (index: number) => {
    setSelectedPinIndex(index);
    const targetProject = projects.find((p) => p.id === mapProjects[index].id) || projects[0];
    if (targetProject) {
      // Optional: highlight project
    }
  };

  const handleOpenDetailFromMap = () => {
    const targetProject = projects.find((p) => p.id === currentHighlight.id) || projects[0];
    if (targetProject) {
      onSelectProject(targetProject);
    }
  };

  const filteredPins = mapProjects.filter((pin) => {
    if (mapFilter === 'all') return true;
    return pin.category === mapFilter;
  });

  return (
    <section id="hero" className="relative bg-gradient-to-b from-[#F8FAFC] via-white to-white border-b border-[#DCE4EC] overflow-hidden">
      {/* Subtle modern dot-grid background texture for spatial GIS feel */}
      <div 
        className="absolute inset-0 opacity-[0.45] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#184C78 0.75px, transparent 0.75px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse at top, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at top, black 30%, transparent 80%)'
        }}
      />

      <div className="relative max-w-[1180px] mx-auto px-5 sm:px-8 py-8 sm:py-10 lg:py-12 grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-10 animate-hero-in">
        {/* Left Column: Hero Text & Actions (7 Cols on desktop for better breathing room) */}
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center">
          {/* Official badge */}
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md border border-[#cbe1f2] rounded-full px-3.5 py-1 text-xs font-semibold text-[#184C78] mb-4 w-fit shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse" />
            <span className="text-[#2980B9] font-bold">Platform Resmi</span>
            <span className="text-slate-300">•</span>
            <span>Transparansi Pembangunan Daerah</span>
          </div>

          {/* Headline with typographic contrast */}
          <h1 className="font-['DM_Sans'] text-3xl sm:text-4xl lg:text-[42px] font-black text-[#0B2540] leading-[1.15] tracking-[-1px] mb-4 max-w-[540px]">
            Pantau proyek pembangunan di kotamu{' '}
            <span className="bg-gradient-to-r from-[#184C78] via-[#2980B9] to-[#0284c7] bg-clip-text text-transparent">
              secara langsung
            </span>
          </h1>

          {/* Description paragraph - clean & concise */}
          <p className="text-[15px] sm:text-[16px] text-[#475569] leading-[1.65] max-w-[480px] mb-6">
            Akses langsung linimasa progres, serapan anggaran, dan dokumentasi foto/video proyek pembangunan daerah secara transparan dan mudah dipahami.
          </p>

          {/* ── 2 BALANCED ACTION BUTTONS ── */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Button 1: Buka Peta Spasial */}
            <button
              type="button"
              id="btn-buka-peta"
              onClick={handleCekDisekitar}
              className="h-12 px-6 bg-[#184C78] hover:bg-[#12395b] text-white font-bold text-sm rounded-xl shadow-xs hover:shadow-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer whitespace-nowrap group"
            >
              <Compass className="w-4 h-4 text-cyan-300 transition-transform group-hover:rotate-45" />
              <span>Buka Peta Spasial</span>
            </button>

            {/* Button 2: Buka Dashboard */}
            <button
              type="button"
              id="btn-buka-dashboard"
              onClick={onOpenDashboard}
              className="h-12 px-6 bg-[#EBF4FB] hover:bg-[#dcebf7] text-[#184C78] border border-[#c5def2] font-bold text-sm rounded-xl shadow-xs hover:shadow-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer whitespace-nowrap group"
            >
              <LayoutDashboard className="w-4 h-4 text-[#184C78] group-hover:scale-110 transition-transform" />
              <span>Buka Dashboard</span>
            </button>
          </div>

          {/* Quick highlight feature proof pills */}
          <div className="flex flex-wrap items-center gap-2.5 mt-5 pt-3.5 border-t border-slate-200/80 text-xs text-slate-600">
            <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200/90 rounded-lg px-2.5 py-1 font-medium shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>5 Titik Konstruksi Aktif</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200/90 rounded-lg px-2.5 py-1 font-medium shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-[#2980B9]" />
              <span>Radius GPS Terdekat</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200/90 rounded-lg px-2.5 py-1 font-medium shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Data APBD Terbuka</span>
            </div>
          </div>
        </div>

        {/* Right Column: Versi Baru Ringkas & Mudah Dimengerti */}
        <div className="lg:col-span-6 xl:col-span-5 hero-visual relative">
          <div className="bg-white border border-[#CBD5E1] rounded-2xl overflow-hidden shadow-[0_14px_36px_rgba(24,76,120,0.09),0_2px_8px_rgba(24,76,120,0.04)] transition-all">
            {/* 1. Header Bar Ringkas (1 Baris) */}
            <div className="bg-white border-b border-[#E2E8F0] px-4 py-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#EBF4FB] flex items-center justify-center text-[#184C78]">
                  <MapPin className="w-3.5 h-3.5 text-[#184C78]" />
                </div>
                <span className="text-xs font-bold text-[#184C78] font-['DM_Sans']">
                  Peta Proyek Pembangunan
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  5 Titik Aktif
                </span>
              </div>

              {/* Segmented Filter Pills */}
              <div className="flex gap-1 bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E2E8F0]">
                {(['all', 'jalan', 'taman'] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => setMapFilter(filterKey)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all cursor-pointer capitalize ${
                      mapFilter === filterKey
                        ? 'bg-[#184C78] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#184C78]'
                    }`}
                  >
                    {filterKey === 'all' ? 'Semua' : filterKey === 'jalan' ? 'Jalan' : 'Taman'}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Peta Spasial Bersih (100% Tampak Jelas, Bebas Hambatan) */}
            <div className="relative bg-[#EBF3EB] select-none">
              <svg className="w-full h-auto block" viewBox="0 0 540 210" xmlns="http://www.w3.org/2000/svg">
                {/* Base background */}
                <rect fill="#EBF3EB" width="540" height="210" />

                {/* Primary & Secondary Roads */}
                <line x1="0" y1="65" x2="540" y2="65" stroke="#FFFFFF" strokeWidth="8" opacity="0.9" />
                <line x1="0" y1="145" x2="540" y2="145" stroke="#FFFFFF" strokeWidth="9" opacity="0.95" />
                <line x1="100" y1="0" x2="100" y2="210" stroke="#FFFFFF" strokeWidth="8" opacity="0.9" />
                <line x1="250" y1="0" x2="250" y2="210" stroke="#FFFFFF" strokeWidth="10" opacity="0.95" />
                <line x1="390" y1="0" x2="390" y2="210" stroke="#FFFFFF" strokeWidth="8" opacity="0.9" />

                {/* City Blocks */}
                <rect x="15" y="10" width="75" height="48" rx="4" fill="#D3E6D3" opacity="0.75" />
                <rect x="260" y="10" width="120" height="48" rx="4" fill="#D3E6D3" opacity="0.75" />
                <rect x="400" y="10" width="125" height="48" rx="4" fill="#D3E6D3" opacity="0.65" />

                <rect x="15" y="75" width="75" height="60" rx="4" fill="#D3E6D3" opacity="0.7" />
                <rect x="110" y="75" width="130" height="60" rx="4" fill="#D3E6D3" opacity="0.8" />
                <rect x="260" y="75" width="120" height="60" rx="4" fill="#D3E6D3" opacity="0.75" />
                <rect x="400" y="75" width="125" height="60" rx="4" fill="#D3E6D3" opacity="0.65" />

                {/* Centennial Park area */}
                <ellipse cx="170" cy="34" rx="42" ry="24" fill="#6CB87A" opacity="0.65" />
                <text x="145" y="38" fill="#166534" fontSize="8" fontWeight="bold" opacity="0.85">TAMAN KOTA</text>

                {/* River / Water body at bottom */}
                <path d="M0 185 Q90 165 180 180 Q270 195 360 175 Q450 160 540 175 L540 210 L0 210 Z" fill="#A8D4F0" opacity="0.6" />

                {/* Interactive Markers */}
                {filteredPins.map((pin, idx) => {
                  const isSelected = currentHighlight.id === pin.id;
                  return (
                    <g
                      key={pin.id}
                      transform={`translate(${pin.x},${pin.y})`}
                      className="cursor-pointer transition-transform duration-200 hover:scale-125"
                      onClick={() => handleMarkerClick(idx)}
                    >
                      {isSelected && (
                        <circle r={pin.r + 7} fill={pin.color} opacity="0.3" className="animate-ping" />
                      )}
                      <circle
                        r={pin.r}
                        fill="white"
                        stroke={pin.color}
                        strokeWidth={isSelected ? '3.5' : '2.5'}
                        filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.18))"
                      />
                      <circle r={pin.r / 2} fill={pin.color} />
                      {isSelected && (
                        <circle r={pin.r / 4} fill="white" />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Petunjuk Interaksi Ringkas */}
              <div className="absolute top-2 left-2 bg-[#184C78]/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs">
                Klik pin untuk melihat detail
              </div>
            </div>

            {/* 3. Panel Info Proyek Terpadu (Ringkas, Terbuka & Mudah Dimengerti) */}
            <div className="p-3.5 bg-white border-t border-[#E2E8F0]">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      currentHighlight.status === 'selesai'
                        ? 'bg-[#E6F7F1] text-[#1A9E6E]'
                        : currentHighlight.status === 'ditangguhkan'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-[#FEF3E7] text-[#E67E22]'
                    }`}
                  >
                    {currentHighlight.tag}
                  </span>
                  <span className="text-xs text-slate-300">•</span>
                  <span className="text-[11px] font-medium text-slate-500">
                    Target: {currentHighlight.date}
                  </span>
                </div>

                <span className="text-xs font-bold text-[#184C78] bg-[#EBF4FB] px-2 py-0.5 rounded-md">
                  {currentHighlight.progress}% Selesai
                </span>
              </div>

              {/* Title & Action Button */}
              <div className="flex items-center justify-between gap-3 mb-2">
                <div>
                  <h4 className="text-sm font-extrabold text-[#0B2540] font-['DM_Sans'] line-clamp-1 leading-snug">
                    {currentHighlight.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#184C78] shrink-0" />
                    <span>{currentHighlight.wilayah || 'Kota Malang'}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenDetailFromMap}
                  className="px-3 py-1.5 bg-[#184C78] hover:bg-[#12395b] text-white text-[11px] font-bold rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1 group"
                >
                  <span>Lihat Detail</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden mb-2.5">
                <div
                  className="h-full bg-gradient-to-r from-[#2980B9] to-[#184C78] rounded-full transition-all duration-500"
                  style={{ width: `${currentHighlight.progress}%` }}
                />
              </div>

              {/* Navigasi Proyek Cepat (5 Titik) & Legenda Ringkas */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  {mapProjects.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => handleMarkerClick(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        selectedPinIndex === idx ? 'w-5 bg-[#184C78]' : 'w-2 bg-slate-300 hover:bg-slate-400'
                      }`}
                      title={p.name}
                    />
                  ))}
                  <span className="text-[10px] text-slate-400 ml-1">
                    {selectedPinIndex + 1} dari {mapProjects.length}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-[#E67E22]" /> Berjalan
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-[#1A9E6E]" /> Selesai
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
