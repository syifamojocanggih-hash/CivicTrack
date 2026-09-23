import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import type { ProyekItem } from '../types';

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  onSelectChip: (chip: string) => void;
  onSelectProject: (project: ProyekItem) => void;
  projects: ProyekItem[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  onSelectChip,
  onSelectProject,
  projects,
}) => {
  const [mapFilter, setMapFilter] = useState<'all' | 'jalan' | 'taman'>('all');
  const [selectedPinIndex, setSelectedPinIndex] = useState<number>(0);

  const chips = ['Jalan Rusak', 'Drainase', 'Taman Kota', 'Jembatan', 'Fasilitas Umum'];

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
    const targetProject = projects.find(p => p.id === mapProjects[index].id) || projects[0];
    if (targetProject) {
      // Allow user to see card change, or double click to open modal
    }
  };

  const handleOpenDetailFromMap = () => {
    const targetProject = projects.find(p => p.id === currentHighlight.id) || projects[0];
    if (targetProject) {
      onSelectProject(targetProject);
    }
  };

  const filteredPins = mapProjects.filter((pin) => {
    if (mapFilter === 'all') return true;
    return pin.category === mapFilter;
  });

  return (
    <section id="hero" className="bg-white border-b border-[#DCE0E6]">
      <div className="max-w-[1180px] mx-auto px-6 sm:px-8 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-14 animate-hero-in">
        {/* Left: Text & Search */}
        <div className="hero-text flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 bg-[#EBF4FB] border border-[#c5def2] rounded-full px-3 py-1 text-xs font-semibold text-[#2980B9] mb-5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2980B9] animate-blink-dot"></span>
            Platform resmi transparansi pembangunan
          </div>

          <h1 className="font-['DM_Sans'] text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#184C78] leading-[1.18] tracking-[-0.8px] mb-4 max-w-[490px]">
            Pantau proyek pembangunan di kotamu secara langsung
          </h1>

          <p className="text-base text-[#6C757D] leading-[1.65] max-w-[440px] mb-7">
            CivicTrack membuka akses informasi progres, anggaran, dan dokumentasi seluruh proyek infrastruktur daerah — dari jalan hingga taman — dalam satu peta yang bisa dijangkau siapa saja.
          </p>

          {/* Search Bar */}
          <form 
            onSubmit={(e) => { e.preventDefault(); onSearchSubmit(searchQuery); }}
            className="flex bg-white border-[1.5px] border-[#DCE0E6] rounded-[10px] overflow-hidden shadow-[0_2px_8px_rgba(24,76,120,0.09),0_8px_24px_rgba(24,76,120,0.07)] max-w-[460px] focus-within:border-[#2980B9] focus-within:ring-2 focus-within:ring-[#EBF4FB] transition-all"
          >
            <div className="w-12 flex items-center justify-center text-[#6C757D] shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari proyek, lokasi, atau ID proyek…"
              className="flex-1 border-none outline-none font-['Inter'] text-sm text-[#212529] py-3.5 bg-transparent placeholder-[#adb5bd]"
            />
            <button
              type="submit"
              className="px-5 bg-[#184C78] hover:bg-[#0f3252] text-white font-semibold text-[13px] transition-colors whitespace-nowrap cursor-pointer"
            >
              Cari Proyek
            </button>
          </form>

          {/* Popular Chips */}
          <div className="flex gap-2 flex-wrap items-center mt-4">
            <span className="text-xs text-[#6C757D] py-1">Populer:</span>
            {chips.map((chip) => (
              <button
                key={chip}
                onClick={() => onSelectChip(chip)}
                className="chip"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Map Visual Frame */}
        <div className="hero-visual relative">
          <div className="bg-white border border-[#DCE0E6] rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(24,76,120,0.12),0_20px_60px_rgba(24,76,120,0.09)] relative">
            {/* Topbar */}
            <div className="bg-white border-b border-[#DCE0E6] px-4 py-2.5 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#184C78]" />
              <span className="text-xs font-bold text-[#184C78] font-['DM_Sans'] flex-1">
                Kota Malang (Visualisasi Interaktif)
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setMapFilter('all')}
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                    mapFilter === 'all'
                      ? 'bg-[#184C78] text-white'
                      : 'bg-[#F5F7FA] text-[#6C757D] border border-[#DCE0E6] hover:bg-slate-200'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setMapFilter('jalan')}
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                    mapFilter === 'jalan'
                      ? 'bg-[#184C78] text-white'
                      : 'bg-[#F5F7FA] text-[#6C757D] border border-[#DCE0E6] hover:bg-slate-200'
                  }`}
                >
                  Jalan
                </button>
                <button
                  onClick={() => setMapFilter('taman')}
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                    mapFilter === 'taman'
                      ? 'bg-[#184C78] text-white'
                      : 'bg-[#F5F7FA] text-[#6C757D] border border-[#DCE0E6] hover:bg-slate-200'
                  }`}
                >
                  Taman
                </button>
              </div>
            </div>

            {/* Interactive SVG Map Body */}
            <div className="relative bg-[#e8f2e8] select-none">
              <svg className="w-full h-auto block" viewBox="0 0 540 340" xmlns="http://www.w3.org/2000/svg">
                {/* Base background */}
                <rect fill="#e8f2e8" width="540" height="340" />

                {/* Roads Grid */}
                <line x1="0" y1="80" x2="540" y2="80" stroke="#fff" strokeWidth="10" opacity="0.8" />
                <line x1="0" y1="170" x2="540" y2="170" stroke="#fff" strokeWidth="8" opacity="0.7" />
                <line x1="0" y1="260" x2="540" y2="260" stroke="#fff" strokeWidth="6" opacity="0.6" />
                <line x1="90" y1="0" x2="90" y2="340" stroke="#fff" strokeWidth="9" opacity="0.8" />
                <line x1="220" y1="0" x2="220" y2="340" stroke="#fff" strokeWidth="8" opacity="0.7" />
                <line x1="370" y1="0" x2="370" y2="340" stroke="#fff" strokeWidth="7" opacity="0.65" />
                <line x1="480" y1="0" x2="480" y2="340" stroke="#fff" strokeWidth="5" opacity="0.5" />

                {/* Diagonal roads */}
                <line x1="0" y1="120" x2="220" y2="80" stroke="#fff" strokeWidth="6" opacity="0.55" />
                <line x1="220" y1="170" x2="480" y2="120" stroke="#fff" strokeWidth="5" opacity="0.45" />

                {/* City Blocks */}
                <rect x="100" y="0" width="112" height="73" rx="3" fill="#c8ddc8" opacity="0.65" />
                <rect x="230" y="0" width="130" height="73" rx="3" fill="#c8ddc8" opacity="0.55" />
                <rect x="380" y="0" width="90" height="73" rx="3" fill="#c8ddc8" opacity="0.5" />
                <rect x="0" y="90" width="83" height="72" rx="3" fill="#c8ddc8" opacity="0.5" />
                <rect x="100" y="90" width="112" height="72" rx="3" fill="#c8ddc8" opacity="0.55" />
                <rect x="230" y="90" width="130" height="72" rx="3" fill="#c8ddc8" opacity="0.5" />
                <rect x="380" y="90" width="90" height="72" rx="3" fill="#c8ddc8" opacity="0.45" />
                <rect x="0" y="180" width="83" height="72" rx="3" fill="#c8ddc8" opacity="0.45" />
                <rect x="100" y="180" width="112" height="72" rx="3" fill="#c8ddc8" opacity="0.5" />
                <rect x="230" y="180" width="130" height="72" rx="3" fill="#c8ddc8" opacity="0.45" />
                <rect x="380" y="180" width="90" height="72" rx="3" fill="#c8ddc8" opacity="0.4" />
                <rect x="0" y="270" width="83" height="70" rx="3" fill="#c8ddc8" opacity="0.4" />
                <rect x="100" y="270" width="112" height="70" rx="3" fill="#c8ddc8" opacity="0.45" />
                <rect x="230" y="270" width="130" height="70" rx="3" fill="#c8ddc8" opacity="0.4" />
                <rect x="380" y="270" width="90" height="70" rx="3" fill="#c8ddc8" opacity="0.35" />
                <rect x="490" y="90" width="50" height="160" rx="3" fill="#c8ddc8" opacity="0.35" />

                {/* Park area */}
                <ellipse cx="155" cy="36" rx="40" ry="28" fill="#6cb87a" opacity="0.55" />

                {/* River / Water body */}
                <path d="M0 290 Q60 270 120 290 Q180 310 240 285 Q300 265 370 280 Q420 290 480 270 L480 340 L0 340Z" fill="#a8c8e0" opacity="0.4" />

                {/* Render Filtered Interactive Markers */}
                {filteredPins.map((pin, idx) => {
                  const isSelected = mapProjects[selectedPinIndex]?.id === pin.id;
                  return (
                    <g
                      key={pin.id}
                      transform={`translate(${pin.x},${pin.y})`}
                      className="cursor-pointer transition-transform duration-200 hover:scale-125"
                      onClick={() => handleMarkerClick(idx)}
                    >
                      {/* Pulse circle for active pin */}
                      {isSelected && (
                        <circle r={pin.r + 6} fill={pin.color} opacity="0.25" className="animate-ping" />
                      )}
                      <circle
                        r={pin.r}
                        fill="white"
                        stroke={pin.color}
                        strokeWidth={isSelected ? "3.5" : "2.5"}
                        filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.2))"
                      />
                      <circle r={pin.r / 2} fill={pin.color} />
                    </g>
                  );
                })}
              </svg>

              {/* Badge top-left */}
              <div className="absolute top-3 left-3 bg-[#184C78] text-white text-[11px] font-bold px-2.5 py-1 rounded-full font-['DM_Sans'] shadow-sm">
                23 proyek aktif
              </div>

              {/* Floating interactive card on bottom-right */}
              <div 
                onClick={handleOpenDetailFromMap}
                className="absolute bottom-3 right-3 bg-white border border-[#DCE0E6] rounded-xl p-3 w-[210px] shadow-[0_4px_12px_rgba(24,76,120,0.12)] cursor-pointer hover:border-[#2980B9] transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    currentHighlight.status === 'selesai' 
                      ? 'bg-[#E6F7F1] text-[#1A9E6E]' 
                      : currentHighlight.status === 'ditangguhkan'
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-[#FEF3E7] text-[#E67E22]'
                  }`}>
                    {currentHighlight.tag}
                  </span>
                  <span className="text-[10px] text-[#2980B9] font-medium group-hover:underline">Detail &rarr;</span>
                </div>
                
                <h4 className="text-xs font-bold text-[#184C78] line-clamp-1 mb-1.5 font-['DM_Sans']">
                  {currentHighlight.name}
                </h4>

                <div className="h-1.5 bg-[#DCE0E6] rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full bg-gradient-to-r from-[#2980B9] to-[#184C78] rounded-full transition-all duration-500"
                    style={{ width: `${currentHighlight.progress}%` }}
                  ></div>
                </div>

                <div className="text-[11px] text-[#6C757D] flex justify-between">
                  <span>{currentHighlight.progress}% selesai</span>
                  <span>{currentHighlight.date}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Legend */}
          <div className="flex gap-4 mt-3 justify-center flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-[#6C757D]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E67E22] inline-block"></span>
              Berjalan
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[#6C757D]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1A9E6E] inline-block"></span>
              Selesai
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[#6C757D]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9BA5B0] inline-block"></span>
              Ditangguhkan
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
