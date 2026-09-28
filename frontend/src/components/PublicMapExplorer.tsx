import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  X,
  MapPin,
  Compass,
  Navigation,
  Layers,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  DollarSign,
  Calendar,
  ArrowRight,
  User,
  ShieldCheck,
  Bookmark
} from 'lucide-react';
import type { ProyekItem, ProyekKategori, UserProfile } from '../types';
import centennialParkImg from '../assets/centennial_park.jpg';

interface PublicMapExplorerProps {
  currentUser: UserProfile | null;
  projects: ProyekItem[];
  onBackToLanding: () => void;
  onOpenDashboard?: () => void;
  onOpenProjectDetail: (project: ProyekItem) => void;
  onOpenAIRoute: (projectName: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const PublicMapExplorer: React.FC<PublicMapExplorerProps> = ({
  currentUser,
  projects,
  onBackToLanding,
  onOpenDashboard,
  onOpenProjectDetail,
  onOpenAIRoute,
  onOpenAuth,
}) => {
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<ProyekKategori | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(true);
  
  // Mobile bottom sheet state: 'collapsed' | 'half' | 'full'
  const [mobileSheetState, setMobileSheetState] = useState<'collapsed' | 'expanded'>('collapsed');
  const [mobileActiveTab, setMobileActiveTab] = useState<'explore' | 'my-projects' | 'search' | 'profile'>('explore');
  
  // Map zoom and view state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [mapCenter, setMapCenter] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeLayer, setActiveLayer] = useState<'standard' | 'satellite'>('standard');

  // User simulated GPS location
  const userLocation = {
    name: 'Jl. Soekarno Hatta No. 45, Lowokwaru',
    shortName: '4162 Oakwood Ave / Suhat',
    x: 270,
    y: 180,
  };

  // Coordinates and rich milestones for map pins
  const explorerProjects = useMemo(() => {
    return projects.map((p, idx) => {
      // Coordinate offsets for realistic distribution
      const coords = [
        { x: 180, y: 110, icon: 'park', color: '#10B981', dist: '0.9 km' },
        { x: 330, y: 145, icon: 'road', color: '#F59E0B', dist: '1.4 km' },
        { x: 250, y: 260, icon: 'drain', color: '#3B82F6', dist: '2.1 km' },
        { x: 130, y: 220, icon: 'road', color: '#EF4444', dist: '2.8 km' },
        { x: 390, y: 235, icon: 'facility', color: '#8B5CF6', dist: '3.6 km' },
        { x: 420, y: 90, icon: 'road', color: '#06B6D4', dist: '4.2 km' },
      ];
      const c = coords[idx] || { x: 200 + (idx * 40) % 200, y: 100 + (idx * 30) % 180, icon: 'road', color: '#F59E0B', dist: '1.5 km' };

      return {
        ...p,
        mapX: c.x,
        mapY: c.y,
        mapIcon: c.icon,
        markerColor: c.color,
        distanceStr: c.dist,
        milestones: [
          {
            title: 'Site Preparation & Land Clearing',
            date: 'Jan 15, 2024',
            status: 'completed',
            note: 'Demolition, soil grading and drainage pipes completed.',
          },
          {
            title: 'Phase 2: Landscaping & Construction',
            date: 'Aktif (Saat Ini)',
            status: 'current',
            note: 'Planting native trees, pathway paving & playground installation.',
          },
          {
            title: 'Final Quality Inspection & Handover',
            date: p.estimasi_selesai || 'Okt 2024',
            status: 'upcoming',
            note: 'Commissioning, safety testing and citizen open access ceremony.',
          },
        ],
      };
    });
  }, [projects]);

  // Filtered projects by category and search
  const filteredProjects = useMemo(() => {
    return explorerProjects.filter((p) => {
      if (selectedCategory !== 'all' && p.kategori !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.nama_proyek.toLowerCase().includes(q);
        const matchDesc = p.deskripsi.toLowerCase().includes(q);
        const matchLoc = (p.nama_wilayah || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchLoc) return false;
      }
      return true;
    });
  }, [explorerProjects, selectedCategory, searchQuery]);

  // Selected project object
  const currentProject = useMemo(() => {
    return (
      explorerProjects.find((p) => p.id === selectedProjectId) ||
      explorerProjects[0]
    );
  }, [selectedProjectId, explorerProjects]);

  const handleSelectPin = (id: number) => {
    setSelectedProjectId(id);
    setIsDetailPanelOpen(true);
    setMobileSheetState('expanded');
  };

  const handleCenterUserLocation = () => {
    setMapCenter({ x: 0, y: 0 });
    setZoomLevel(1.1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col font-['Inter'] text-[#212529] select-none overflow-hidden">
      {/* ── TOP NAV HEADER (DESKTOP & TABLET) ── */}
      <header className="h-14 bg-white/95 backdrop-blur-md border-b border-[#DCE4EC] px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 shadow-xs">
        {/* Left: Brand & Back to Home */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onBackToLanding}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-[#184C78] transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Beranda</span>
          </button>
          
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#184C78] rounded-lg flex items-center justify-center text-white shadow-xs">
              <Compass className="w-4 h-4 text-cyan-300" />
            </div>
            <span className="font-['DM_Sans'] font-extrabold text-base text-[#184C78] tracking-tight hidden md:inline">
              CivicTrack <span className="text-xs font-medium text-slate-500">| Public Map Explorer</span>
            </span>
          </div>
        </div>

        {/* Center: Search Bar (Desktop) */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari proyek, nama jalan, atau ID proyek..."
              className="w-full pl-9.5 pr-4 py-2 text-xs sm:text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-[#2980B9] rounded-xl outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: User / Notification / Dashboard Action */}
        <div className="flex items-center gap-2.5">
          {currentUser ? (
            <div className="flex items-center gap-2">
              {onOpenDashboard && (
                <button
                  onClick={onOpenDashboard}
                  className="px-3 py-1.5 bg-[#EBF4FB] hover:bg-[#d8eaf7] text-[#184C78] border border-[#c5def2] text-xs font-bold rounded-lg transition-colors cursor-pointer hidden sm:flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2980B9]" />
                  <span>Dashboard Saya</span>
                </button>
              )}
              <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full text-xs font-semibold text-[#184C78]">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span className="max-w-[100px] truncate">{currentUser.nama}</span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              className="px-3.5 py-1.5 bg-[#184C78] hover:bg-[#0f3252] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Masuk Akun
            </button>
          )}
        </div>
      </header>

      {/* ── MAIN CONTENT AREA: MAP + DETAIL DRAWER ── */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* ── LEFT / FULL-SCREEN MAP CANVAS ── */}
        <div className="flex-1 relative bg-[#EBF3E8] overflow-hidden flex flex-col">
          {/* FLOATING TOP CONTROLS ON MAP (FILTER PILLS & MOBILE SEARCH) */}
          <div className="absolute top-3 left-3 right-3 sm:left-4 sm:right-auto z-20 flex flex-col gap-2 pointer-events-none max-w-full">
            {/* Mobile Search Bar (Only visible on small screen PWA) */}
            <div className="md:hidden pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-md border border-slate-200/80 p-2 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, locations..."
                className="flex-1 bg-transparent text-xs text-[#212529] outline-none"
              />
              <button
                onClick={() => setSelectedCategory('all')}
                className="p-1.5 bg-slate-100 text-[#184C78] rounded-xl hover:bg-slate-200 transition-colors"
                title="Filter"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>

            {/* Horizontal Filter Pills (Matches Image 1 & 2) */}
            <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
              {[
                { id: 'all', label: 'All Projects', count: explorerProjects.length },
                { id: 'jalan', label: 'Roadworks / Jalan', count: 3 },
                { id: 'taman', label: 'Parks & Rec', count: 1 },
                { id: 'drainase', label: 'Drainage / Air', count: 1 },
                { id: 'fasilitas', label: 'Fasilitas Umum', count: 1 },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedCategory(pill.id as any)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === pill.id
                      ? 'bg-[#184C78] text-white shadow-md'
                      : 'bg-white/95 backdrop-blur-md text-[#475569] hover:bg-white hover:text-[#184C78] border border-slate-200/80'
                  }`}
                >
                  <span>{pill.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* FLOATING MAP ZOOM & LAYER CONTROLS (RIGHT CORNER) */}
          <div className="absolute right-3.5 bottom-24 sm:bottom-6 z-20 flex flex-col gap-2">
            <button
              onClick={() => setActiveLayer(activeLayer === 'standard' ? 'satellite' : 'standard')}
              className="w-10 h-10 bg-white/95 backdrop-blur-md hover:bg-white border border-slate-200/90 rounded-xl shadow-md flex items-center justify-center text-[#184C78] transition-transform active:scale-95 cursor-pointer"
              title="Ganti Layer Peta"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={handleCenterUserLocation}
              className="w-10 h-10 bg-white/95 backdrop-blur-md hover:bg-white border border-slate-200/90 rounded-xl shadow-md flex items-center justify-center text-[#184C78] transition-transform active:scale-95 cursor-pointer"
              title="Pusatkan ke Lokasi Saya"
            >
              <Navigation className="w-4 h-4 text-[#2980B9]" />
            </button>
            <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl shadow-md flex flex-col overflow-hidden">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.6))}
                className="w-10 h-9 flex items-center justify-center text-[#184C78] hover:bg-slate-100 transition-colors border-b border-slate-100 cursor-pointer"
                title="Perbesar Peta"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.8))}
                className="w-10 h-9 flex items-center justify-center text-[#184C78] hover:bg-slate-100 transition-colors cursor-pointer"
                title="Perkecil Peta"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── VECTOR INTERACTIVE MAP CANVAS ── */}
          <div className="flex-1 w-full h-full relative overflow-hidden select-none cursor-grab active:cursor-grabbing">
            <svg
              className="w-full h-full transition-transform duration-300 ease-out"
              style={{
                transform: `scale(${zoomLevel}) translate(${mapCenter.x}px, ${mapCenter.y}px)`,
                transformOrigin: 'center center',
              }}
              viewBox="0 0 700 500"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* User Radar Pulse Gradient */}
                <radialGradient id="userRadarGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
                  <stop offset="70%" stopColor="#2563EB" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Base terrain */}
              <rect width="700" height="500" fill={activeLayer === 'satellite' ? '#2A3C2A' : '#E8F2E8'} />

              {/* City Blocks (Buildings & Land zones) */}
              <g opacity={activeLayer === 'satellite' ? '0.35' : '0.65'}>
                {/* Horizontal & vertical blocks */}
                <rect x="30" y="20" width="90" height="70" rx="4" fill="#C5DBC5" />
                <rect x="140" y="20" width="110" height="70" rx="4" fill="#C5DBC5" />
                <rect x="270" y="20" width="130" height="70" rx="4" fill="#C5DBC5" />
                <rect x="420" y="20" width="110" height="70" rx="4" fill="#C5DBC5" />

                <rect x="30" y="110" width="90" height="75" rx="4" fill="#C5DBC5" />
                <rect x="140" y="110" width="110" height="75" rx="4" fill="#C5DBC5" />
                <rect x="270" y="110" width="130" height="75" rx="4" fill="#C5DBC5" />
                <rect x="420" y="110" width="110" height="75" rx="4" fill="#C5DBC5" />

                <rect x="30" y="210" width="90" height="75" rx="4" fill="#C5DBC5" />
                <rect x="140" y="210" width="110" height="75" rx="4" fill="#C5DBC5" />
                <rect x="270" y="210" width="130" height="75" rx="4" fill="#C5DBC5" />
                <rect x="420" y="210" width="110" height="75" rx="4" fill="#C5DBC5" />

                <rect x="30" y="310" width="90" height="80" rx="4" fill="#C5DBC5" />
                <rect x="140" y="310" width="110" height="80" rx="4" fill="#C5DBC5" />
                <rect x="270" y="310" width="130" height="80" rx="4" fill="#C5DBC5" />
                <rect x="420" y="310" width="110" height="80" rx="4" fill="#C5DBC5" />

                <rect x="30" y="410" width="90" height="75" rx="4" fill="#C5DBC5" />
                <rect x="140" y="410" width="110" height="75" rx="4" fill="#C5DBC5" />
                <rect x="270" y="410" width="130" height="75" rx="4" fill="#C5DBC5" />
                <rect x="420" y="410" width="110" height="75" rx="4" fill="#C5DBC5" />
              </g>

              {/* Central Green Park (Centennial Park area) */}
              <ellipse cx="180" cy="110" rx="70" ry="50" fill="#69B877" opacity="0.75" />
              <text x="180" y="105" textAnchor="middle" fill="#1C5E28" fontSize="10" fontWeight="bold" fontFamily="Inter">
                Central Park
              </text>
              <text x="180" y="118" textAnchor="middle" fill="#2E7D32" fontSize="8" fontFamily="Inter">
                (Centennial RTH)
              </text>

              {/* River / Water Body with Bridges */}
              <path
                d="M500 0 C470 120 530 220 480 340 C440 440 460 480 470 500 L560 500 C550 480 530 430 570 330 C610 230 560 120 580 0 Z"
                fill="#94BFE0"
                opacity="0.65"
              />

              {/* Bridges across river */}
              <rect x="460" y="150" width="80" height="12" rx="2" fill="#FFFFFF" opacity="0.9" stroke="#94A3B8" strokeWidth="1" />
              <text x="500" y="159" textAnchor="middle" fill="#64748B" fontSize="6.5" fontWeight="bold" fontFamily="Inter">Civic Bridge</text>

              <rect x="440" y="270" width="85" height="12" rx="2" fill="#FFFFFF" opacity="0.9" stroke="#94A3B8" strokeWidth="1" />
              <text x="480" y="279" textAnchor="middle" fill="#64748B" fontSize="6.5" fontWeight="bold" fontFamily="Inter">Civic Bridge 2</text>

              {/* Primary Street Grid (White lines) */}
              <g stroke="#FFFFFF" strokeLinecap="round" opacity="0.95">
                <line x1="0" y1="95" x2="700" y2="95" strokeWidth="12" />
                <line x1="0" y1="195" x2="700" y2="195" strokeWidth="12" />
                <line x1="0" y1="295" x2="700" y2="295" strokeWidth="10" />
                <line x1="0" y1="395" x2="700" y2="395" strokeWidth="9" />

                <line x1="125" y1="0" x2="125" y2="500" strokeWidth="11" />
                <line x1="255" y1="0" x2="255" y2="500" strokeWidth="11" />
                <line x1="405" y1="0" x2="405" y2="500" strokeWidth="10" />
                <line x1="620" y1="0" x2="620" y2="500" strokeWidth="10" />
              </g>

              {/* Street Names Typography (Matches Design Image 1) */}
              <g fill="#94A3B8" fontSize="8" fontWeight="600" fontFamily="Inter">
                <text x="50" y="91">5th St</text>
                <text x="170" y="91">Main Ave</text>
                <text x="310" y="91">Park Blvd</text>
                <text x="50" y="191">Broadway Ave</text>
                <text x="170" y="191">Main Ave</text>
                <text x="300" y="191">Oakwood St</text>

                {/* Vertical road labels */}
                <text x="122" y="140" transform="rotate(-90 122,140)">Elm St</text>
                <text x="252" y="240" transform="rotate(-90 252,240)">Oakwood Ave</text>
                <text x="402" y="340" transform="rotate(-90 402,340)">Hospital Way</text>
              </g>

              {/* USER CURRENT GPS LOCATION PIN (Blue Radar Dot) */}
              <g transform={`translate(${userLocation.x}, ${userLocation.y})`}>
                <circle r="40" fill="url(#userRadarGlow)" className="animate-pulse" />
                <circle r="18" fill="#2563EB" opacity="0.25" className="animate-ping" />
                <circle r="9" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2.5" />
                <circle r="4" fill="#FFFFFF" />
              </g>

              {/* CONSTRUCTION PROJECT MARKER PINS (Interactive) */}
              {filteredProjects.map((p) => {
                const isSelected = p.id === currentProject?.id;

                return (
                  <g
                    key={p.id}
                    transform={`translate(${p.mapX}, ${p.mapY})`}
                    onClick={() => handleSelectPin(p.id)}
                    className="cursor-pointer transition-transform duration-200 hover:scale-125"
                  >
                    {/* Active Halo Effect */}
                    {isSelected && (
                      <circle r="22" fill={p.markerColor} opacity="0.3" className="animate-ping" />
                    )}

                    {/* Pin Outer circle */}
                    <circle
                      r={isSelected ? 16 : 13}
                      fill={p.markerColor}
                      stroke="#FFFFFF"
                      strokeWidth={isSelected ? 3.5 : 2.5}
                      filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.3))"
                    />

                    {/* Pin Center Icon Badge */}
                    {p.kategori === 'taman' ? (
                      <circle r={isSelected ? 7 : 5.5} fill="#FFFFFF" opacity="0.9" />
                    ) : p.kategori === 'drainase' ? (
                      <circle r={isSelected ? 7 : 5.5} fill="#FFFFFF" opacity="0.9" />
                    ) : (
                      <circle r={isSelected ? 7 : 5.5} fill="#FFFFFF" opacity="0.9" />
                    )}

                    {/* Small category text / icon inside SVG pin */}
                    <text
                      x="0"
                      y={isSelected ? 3.5 : 3}
                      textAnchor="middle"
                      fill={p.markerColor}
                      fontSize={isSelected ? '9' : '8'}
                      fontWeight="bold"
                      fontFamily="Inter"
                    >
                      {p.kategori === 'taman' ? '🌳' : p.kategori === 'drainase' ? '💧' : '🚧'}
                    </text>

                    {/* Floating Title Label on hover/selected */}
                    {isSelected && (
                      <g transform="translate(0, -22)">
                        <rect
                          x="-50"
                          y="-16"
                          width="100"
                          height="18"
                          rx="9"
                          fill="#184C78"
                          stroke="#FFFFFF"
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="-4"
                          textAnchor="middle"
                          fill="#FFFFFF"
                          fontSize="9"
                          fontWeight="bold"
                          fontFamily="Inter"
                        >
                          {p.nama_proyek.length > 15 ? p.nama_proyek.slice(0, 15) + '…' : p.nama_proyek}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* ── RIGHT DRAWER / PROJECT DETAIL PANEL (DESKTOP) ── */}
        {isDetailPanelOpen && (
          <aside className="hidden lg:flex flex-col w-[420px] bg-white border-l border-[#DCE4EC] shadow-2xl z-20 overflow-y-auto">
            {/* Header: Status + Close Button */}
            <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    currentProject.status === 'selesai'
                      ? 'bg-emerald-100 text-emerald-800'
                      : currentProject.status === 'ditangguhkan'
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-blue-100 text-[#184C78]'
                  }`}
                >
                  {currentProject.status === 'berjalan' ? 'IN PROGRESS' : currentProject.status.toUpperCase()}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Est. {currentProject.estimasi_selesai || 'Okt 2024'}
                </span>
              </div>

              <button
                onClick={() => setIsDetailPanelOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Tutup Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Project Body Info */}
            <div className="p-5 flex-1 space-y-5">
              {/* Project Title */}
              <div>
                <h2 className="font-['DM_Sans'] text-xl font-bold text-[#184C78] leading-snug">
                  {currentProject.nama_proyek}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentProject.nama_wilayah || 'Kota Malang'}</span>
                  <span>•</span>
                  <span className="text-[#2980B9] font-semibold">{currentProject.distanceStr} dari Anda</span>
                </div>
              </div>

              {/* Photo Showcase (Matches Image 1) */}
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-xs relative group">
                <img
                  src={centennialParkImg}
                  alt={currentProject.nama_proyek}
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                  Dokumentasi Lapangan Real-time
                </div>
              </div>

              {/* 2 Stat Metric Boxes: Budget & Est Completion (Matches Image 1) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Project Budget</span>
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="font-['DM_Sans'] text-lg font-extrabold text-[#184C78]">
                    Rp {(currentProject.anggaran / 1000000000).toFixed(1)}M
                  </div>
                  <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    On Track
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Est. Completion</span>
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="font-['DM_Sans'] text-lg font-extrabold text-[#184C78]">
                    {currentProject.estimasi_selesai || 'Okt 2024'}
                  </div>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-full">
                    Sesuai Jadwal
                  </span>
                </div>
              </div>

              {/* Overall Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-600">OVERALL PROGRESS</span>
                  <span className="text-[#184C78] font-bold">{currentProject.progres_persen}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                  <div
                    className="h-full bg-gradient-to-r from-[#2980B9] to-[#184C78] rounded-full transition-all duration-500"
                    style={{ width: `${currentProject.progres_persen}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Tahap: <strong>{currentProject.tahap_terkini || 'Konstruksi fisik aktif'}</strong>
                </div>
              </div>

              {/* Key Milestones Timeline (Matches Image 1) */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  KEY MILESTONES
                </h4>
                <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {currentProject.milestones?.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 relative">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${
                          step.status === 'completed'
                            ? 'bg-emerald-500 border-white text-white'
                            : step.status === 'current'
                            ? 'bg-[#184C78] border-white text-white shadow-xs'
                            : 'bg-white border-slate-300 text-slate-400'
                        }`}
                      >
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <span className="text-[10px] font-bold">{idx + 1}</span>
                        )}
                      </div>

                      <div
                        className={`flex-1 p-2.5 rounded-xl border text-xs ${
                          step.status === 'current'
                            ? 'bg-[#F0F7FF] border-[#2980B9]/40 shadow-2xs'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold mb-0.5">
                          <span className={step.status === 'current' ? 'text-[#184C78]' : 'text-slate-700'}>
                            {step.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">{step.date}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{step.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons at Bottom */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => onOpenProjectDetail(currentProject)}
                  className="w-full py-2.5 bg-[#184C78] hover:bg-[#0f3252] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Buka Lembar Transparansi Lengkap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onOpenAIRoute(currentProject.nama_proyek)}
                    className="py-2 px-3 border border-slate-200 hover:border-[#2980B9] text-[#184C78] bg-slate-50 hover:bg-[#EBF4FB] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#2980B9]" />
                    <span>Rute Cerdas AI</span>
                  </button>

                  <button
                    onClick={() => onOpenProjectDetail(currentProject)}
                    className="py-2 px-3 border border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                    <span>Pantau Proyek</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Toggle button to reopen panel if closed on desktop */}
        {!isDetailPanelOpen && (
          <button
            onClick={() => setIsDetailPanelOpen(true)}
            className="hidden lg:flex absolute right-4 top-20 z-20 px-3 py-2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg text-xs font-bold text-[#184C78] items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
          >
            <span>Detail Proyek Terpilih</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── MOBILE PWA BOTTOM SHEET (MATCHES IMAGE 2) ── */}
      <div
        className={`lg:hidden fixed left-0 right-0 z-30 bg-white/95 backdrop-blur-md rounded-t-3xl border-t border-slate-200 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out flex flex-col ${
          mobileSheetState === 'expanded' ? 'bottom-16 max-h-[70vh]' : 'bottom-16 max-h-32'
        }`}
      >
        {/* Drag handle pill */}
        <div
          onClick={() =>
            setMobileSheetState(mobileSheetState === 'expanded' ? 'collapsed' : 'expanded')
          }
          className="w-full py-2.5 flex items-center justify-center cursor-pointer"
        >
          <div className="w-10 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Mobile Header Info: Current Location & Quick Actions (Matches Image 2) */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Current Location:
              </span>
              <h5 className="font-['DM_Sans'] text-xs font-bold text-[#184C78] truncate max-w-[240px]">
                {userLocation.shortName}
              </h5>
            </div>
            <button
              onClick={() =>
                setMobileSheetState(mobileSheetState === 'expanded' ? 'collapsed' : 'expanded')
              }
              className="p-1 rounded-full text-slate-400 hover:text-slate-600"
            >
              {mobileSheetState === 'expanded' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>

          {/* 2 Quick Buttons: Directions & Report Issue (Matches Image 2) */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={() => onOpenAIRoute(currentProject.nama_proyek)}
              className="py-2 px-3 bg-[#184C78] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Directions</span>
            </button>
            <button
              onClick={() => onOpenProjectDetail(currentProject)}
              className="py-2 px-3 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Report Issue</span>
            </button>
          </div>

          {/* Nearby Project Strip */}
          <div className="flex items-center justify-between text-xs py-1 border-t border-slate-100">
            <span className="text-slate-500 truncate max-w-[200px]">
              Nearby: <strong>{currentProject.nama_proyek}</strong>
            </span>
            <span className="text-[#2980B9] font-bold">{currentProject.distanceStr}</span>
          </div>
        </div>

        {/* Expanded Sheet Content (When Swiped/Clicked Up) */}
        {mobileSheetState === 'expanded' && (
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
            <img
              src={centennialParkImg}
              alt="Project"
              className="w-full h-32 object-cover rounded-xl"
            />
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#184C78]">{currentProject.progres_persen}% Selesai</span>
              <span className="text-slate-500">{currentProject.estimasi_selesai}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#184C78] rounded-full"
                style={{ width: `${currentProject.progres_persen}%` }}
              />
            </div>
            <button
              onClick={() => onOpenProjectDetail(currentProject)}
              className="w-full py-2 bg-slate-100 text-[#184C78] text-xs font-bold rounded-xl"
            >
              Lihat Selengkapnya &rarr;
            </button>
          </div>
        )}
      </div>

      {/* ── MOBILE PWA BOTTOM NAVIGATION BAR (MATCHES IMAGE 2: Explore, My Projects, Search, Profile) ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => {
            setMobileActiveTab('explore');
            setMobileSheetState('collapsed');
          }}
          className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all cursor-pointer ${
            mobileActiveTab === 'explore'
              ? 'text-white bg-[#184C78] shadow-xs'
              : 'text-slate-500 hover:text-[#184C78]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span className="text-[10px] font-bold mt-0.5">Explore</span>
        </button>

        <button
          onClick={() => {
            setMobileActiveTab('my-projects');
            if (onOpenDashboard) onOpenDashboard();
          }}
          className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all cursor-pointer ${
            mobileActiveTab === 'my-projects'
              ? 'text-white bg-[#184C78] shadow-xs'
              : 'text-slate-500 hover:text-[#184C78]'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span className="text-[10px] font-bold mt-0.5">My Projects</span>
        </button>

        <button
          onClick={() => {
            setMobileActiveTab('search');
            const searchInput = document.querySelector('input');
            searchInput?.focus();
          }}
          className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all cursor-pointer ${
            mobileActiveTab === 'search'
              ? 'text-white bg-[#184C78] shadow-xs'
              : 'text-slate-500 hover:text-[#184C78]'
          }`}
        >
          <Search className="w-4 h-4" />
          <span className="text-[10px] font-bold mt-0.5">Search</span>
        </button>

        <button
          onClick={() => {
            setMobileActiveTab('profile');
            if (currentUser && onOpenDashboard) {
              onOpenDashboard();
            } else {
              onOpenAuth('login');
            }
          }}
          className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all cursor-pointer ${
            mobileActiveTab === 'profile'
              ? 'text-white bg-[#184C78] shadow-xs'
              : 'text-slate-500 hover:text-[#184C78]'
          }`}
        >
          <User className="w-4 h-4" />
          <span className="text-[10px] font-bold mt-0.5">Profile</span>
        </button>
      </nav>
    </div>
  );
};
