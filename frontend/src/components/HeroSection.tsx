import React, { useState } from 'react';
import { MapPin, Navigation, Eye, ShieldCheck, ChevronRight } from 'lucide-react';
import type { ProyekItem } from '../types';

interface HeroSectionProps {
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  onSearchSubmit?: (q: string) => void;
  onSelectChip?: (chip: string) => void;
  onSelectProject: (project: ProyekItem) => void;
  projects: ProyekItem[];
  onOpenNearbyMap?: () => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSelectProject,
  projects,
  onOpenNearbyMap,
  onOpenAuth,
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

  const handlePantauProyek = () => {
    if (onOpenAuth) {
      onOpenAuth('login');
    } else {
      const recentElem = document.querySelector('#recent-projects');
      if (recentElem) {
        recentElem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Data for interactive map points
  const mapProjects = [
    {
      id: 1,
      name: 'Renovasi Taman Centennial',
      category: 'taman',
      tag: 'Taman & RTH',
      progress: 65,
      date: 'Okt 2024',
      status: 'berjalan',
      color: '#E67E22',
      x: 155,
      y: 36,
      r: 14,
    },
    {
      id: 2,
      name: 'Pelebaran Jl. Soekarno Hatta',
      category: 'jalan',
      tag: 'Jalan & Jembatan',
      progress: 38,
      date: 'Des 2024',
      status: 'berjalan',
      color: '#184C78',
      x: 295,
      y: 125,
      r: 14,
    },
    {
      id: 3,
      name: 'Normalisasi Drainase MT. Haryono',
      category: 'drainase',
      tag: 'Drainase & Sanitasi',
      progress: 100,
      date: 'Feb 2024',
      status: 'selesai',
      color: '#1A9E6E',
      x: 430,
      y: 210,
      r: 13,
    },
    {
      id: 4,
      name: 'Jembatan Penghubung Dinoyo',
      category: 'jalan',
      tag: 'Jalan & Jembatan',
      progress: 22,
      date: 'Nov 2024',
      status: 'ditangguhkan',
      color: '#9BA5B0',
      x: 450,
      y: 60,
      r: 11,
    },
    {
      id: 5,
      name: 'Revitalisasi Trotoar Jalan Ijen',
      category: 'jalan',
      tag: 'Jalan & Jembatan',
      progress: 80,
      date: 'Sep 2024',
      status: 'berjalan',
      color: '#2980B9',
      x: 70,
      y: 215,
      r: 12,
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

          {/* ── 2 ACTION BUTTONS: BUKA PETA SPASIAL & DAFTAR PROYEK ── */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-[480px]">
            {/* Button 1: Buka Peta Spasial (GIS) */}
            <button
              type="button"
              id="btn-cek-disekitar"
              onClick={handleCekDisekitar}
              className="flex-1 px-5 py-3.5 bg-gradient-to-r from-[#184C78] to-[#1F629C] hover:from-[#123B5E] hover:to-[#184C78] text-white font-bold text-sm rounded-xl shadow-[0_8px_20px_-4px_rgba(24,76,120,0.35)] hover:shadow-[0_12px_24px_-4px_rgba(24,76,120,0.45)] flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer group"
            >
              <Navigation className="w-4 h-4 text-cyan-200 transition-transform group-hover:rotate-45" />
              <span>Buka Peta Spasial (GIS)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping ml-0.5" />
            </button>

            {/* Button 2: Lihat Daftar Proyek */}
            <button
              type="button"
              id="btn-pantau-project"
              onClick={handlePantauProyek}
              className="flex-1 px-5 py-3.5 bg-white hover:bg-[#F8FAFC] text-[#184C78] border-[1.5px] border-[#CBD5E1] hover:border-[#184C78] font-bold text-sm rounded-xl shadow-xs hover:shadow-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer group"
            >
              <Eye className="w-4 h-4 text-[#184C78] group-hover:scale-110 transition-transform" />
              <span>Lihat Daftar Proyek</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-[#184C78] transition-all" />
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

        {/* Right Column: Interactive Map Frame (5-6 Cols on desktop) */}
        <div className="lg:col-span-6 xl:col-span-5 hero-visual relative">
          <div className="bg-white border border-[#CBD5E1] rounded-2xl overflow-hidden shadow-[0_16px_40px_rgba(24,76,120,0.12),0_2px_8px_rgba(24,76,120,0.06)] relative transition-all">
            {/* Map Card Header Bar */}
            <div className="bg-white border-b border-[#E2E8F0] px-4 py-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#EBF4FB] flex items-center justify-center text-[#184C78]">
                  <MapPin className="w-3.5 h-3.5 text-[#184C78]" />
                </div>
                <span className="text-xs font-bold text-[#184C78] font-['DM_Sans']">
                  Peta Proyek Kota Malang
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
                    {filterKey === 'all' ? 'Semua' : filterKey}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive SVG Map Body */}
            <div className="relative bg-[#E8F2E8] select-none">
              <svg className="w-full h-auto block" viewBox="0 0 540 340" xmlns="http://www.w3.org/2000/svg">
                {/* Base background */}
                <rect fill="#E8F2E8" width="540" height="340" />

                {/* Primary & Secondary Roads */}
                <line x1="0" y1="80" x2="540" y2="80" stroke="#fff" strokeWidth="10" opacity="0.85" />
                <line x1="0" y1="170" x2="540" y2="170" stroke="#fff" strokeWidth="8" opacity="0.75" />
                <line x1="0" y1="260" x2="540" y2="260" stroke="#fff" strokeWidth="6" opacity="0.65" />
                <line x1="90" y1="0" x2="90" y2="340" stroke="#fff" strokeWidth="9" opacity="0.85" />
                <line x1="220" y1="0" x2="220" y2="340" stroke="#fff" strokeWidth="8" opacity="0.75" />
                <line x1="370" y1="0" x2="370" y2="340" stroke="#fff" strokeWidth="7" opacity="0.7" />
                <line x1="480" y1="0" x2="480" y2="340" stroke="#fff" strokeWidth="5" opacity="0.55" />

                {/* Diagonal roads */}
                <line x1="0" y1="120" x2="220" y2="80" stroke="#fff" strokeWidth="6" opacity="0.6" />
                <line x1="220" y1="170" x2="480" y2="120" stroke="#fff" strokeWidth="5" opacity="0.5" />

                {/* City Blocks */}
                <rect x="100" y="0" width="112" height="73" rx="4" fill="#C8DDC8" opacity="0.65" />
                <rect x="230" y="0" width="130" height="73" rx="4" fill="#C8DDC8" opacity="0.55" />
                <rect x="380" y="0" width="90" height="73" rx="4" fill="#C8DDC8" opacity="0.5" />
                <rect x="0" y="90" width="83" height="72" rx="4" fill="#C8DDC8" opacity="0.5" />
                <rect x="100" y="90" width="112" height="72" rx="4" fill="#C8DDC8" opacity="0.55" />
                <rect x="230" y="90" width="130" height="72" rx="4" fill="#C8DDC8" opacity="0.5" />
                <rect x="380" y="90" width="90" height="72" rx="4" fill="#C8DDC8" opacity="0.45" />
                <rect x="0" y="180" width="83" height="72" rx="4" fill="#C8DDC8" opacity="0.45" />
                <rect x="100" y="180" width="112" height="72" rx="4" fill="#C8DDC8" opacity="0.5" />
                <rect x="230" y="180" width="130" height="72" rx="4" fill="#C8DDC8" opacity="0.45" />
                <rect x="380" y="180" width="90" height="72" rx="4" fill="#C8DDC8" opacity="0.4" />
                <rect x="0" y="270" width="83" height="70" rx="4" fill="#C8DDC8" opacity="0.4" />
                <rect x="100" y="270" width="112" height="70" rx="4" fill="#C8DDC8" opacity="0.45" />
                <rect x="230" y="270" width="130" height="70" rx="4" fill="#C8DDC8" opacity="0.4" />
                <rect x="380" y="270" width="90" height="70" rx="4" fill="#C8DDC8" opacity="0.35" />
                <rect x="490" y="90" width="50" height="160" rx="4" fill="#C8DDC8" opacity="0.35" />

                {/* Park area */}
                <ellipse cx="155" cy="36" rx="40" ry="28" fill="#6CB87A" opacity="0.6" />

                {/* River / Water body */}
                <path d="M0 290 Q60 270 120 290 Q180 310 240 285 Q300 265 370 280 Q420 290 480 270 L480 340 L0 340Z" fill="#A8C8E0" opacity="0.45" />

                {/* Interactive Markers */}
                {filteredPins.map((pin, idx) => {
                  const isSelected = mapProjects[selectedPinIndex]?.id === pin.id;
                  return (
                    <g
                      key={pin.id}
                      transform={`translate(${pin.x},${pin.y})`}
                      className="cursor-pointer transition-transform duration-200 hover:scale-125"
                      onClick={() => handleMarkerClick(idx)}
                    >
                      {isSelected && (
                        <circle r={pin.r + 7} fill={pin.color} opacity="0.25" className="animate-ping" />
                      )}
                      <circle
                        r={pin.r}
                        fill="white"
                        stroke={pin.color}
                        strokeWidth={isSelected ? '3.5' : '2.5'}
                        filter="drop-shadow(0px 2px 5px rgba(0,0,0,0.22))"
                      />
                      <circle r={pin.r / 2} fill={pin.color} />
                    </g>
                  );
                })}
              </svg>

              {/* Badge top-left: Live counter */}
              <div className="absolute top-3 left-3 bg-[#184C78]/95 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full font-['DM_Sans'] shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>23 proyek aktif</span>
              </div>

              {/* Floating interactive card on bottom-right */}
              <div
                onClick={handleOpenDetailFromMap}
                className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md border border-[#CBD5E1] rounded-xl p-3 w-[215px] shadow-[0_6px_16px_rgba(24,76,120,0.14)] cursor-pointer hover:border-[#2980B9] transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
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
                  <span className="text-[10px] text-[#2980B9] font-medium group-hover:underline flex items-center gap-0.5">
                    Detail &rarr;
                  </span>
                </div>

                <h4 className="text-xs font-bold text-[#184C78] line-clamp-1 mb-1.5 font-['DM_Sans']">
                  {currentHighlight.name}
                </h4>

                <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full bg-gradient-to-r from-[#2980B9] to-[#184C78] rounded-full transition-all duration-500"
                    style={{ width: `${currentHighlight.progress}%` }}
                  />
                </div>

                <div className="text-[11px] text-[#64748B] flex justify-between">
                  <span>{currentHighlight.progress}% selesai</span>
                  <span>{currentHighlight.date}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map Legend Pills */}
          <div className="flex gap-4 mt-3 justify-center flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-[#64748B] font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E67E22] inline-block"></span>
              Berjalan
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[#64748B] font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1A9E6E] inline-block"></span>
              Selesai
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[#64748B] font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9BA5B0] inline-block"></span>
              Ditangguhkan
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
