import React, { useState, useMemo, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
  Bookmark,
  RefreshCw,
  Radio,
  Clock
} from 'lucide-react';
import type { ProyekItem, ProyekKategori, UserProfile } from '../types';
import centennialParkImg from '../assets/centennial_park.jpg';
import { apiService } from '../services/api';
import { WILAYAH_DATA, BUDGET_RANGES } from '../data/geoWilayahData';

interface PublicMapExplorerProps {
  currentUser: UserProfile | null;
  projects: ProyekItem[];
  onBackToLanding: () => void;
  onOpenDashboard?: () => void;
  onOpenProjectDetail: (project: ProyekItem) => void;
  onOpenAIRoute: (projectName: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

// Calculate Haversine distance in kilometers
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// SVG marker helpers for custom Leaflet DivIcons
function getCategoryIconSvg(category: string): string {
  switch (category) {
    case 'taman':
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10v12"/><path d="M12 2a5 5 0 0 0-5 5c0 2 1.5 3.5 3 4.5V14h4v-2.5c1.5-1 3-2.5 3-4.5a5 5 0 0 0-5-5Z"/></svg>`;
    case 'drainase':
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a6 6 0 1 0 7.8 0L12 3z"/></svg>`;
    case 'fasilitas':
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/></svg>`;
    case 'jalan':
    default:
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m14 12-4-4"/><path d="m14 16-4-4"/><path d="M4 22 14.5 4a2 2 0 0 1 3 0L20 7"/></svg>`;
  }
}

function getCategoryColor(category: string): { bg: string; border: string; label: string } {
  switch (category) {
    case 'taman':
      return { bg: '#10B981', border: '#059669', label: 'Taman & RTH' };
    case 'drainase':
      return { bg: '#0284C7', border: '#0369A1', label: 'Drainase Air' };
    case 'fasilitas':
      return { bg: '#8B5CF6', border: '#7C3AED', label: 'Fasilitas' };
    case 'jalan':
    default:
      return { bg: '#F59E0B', border: '#D97706', label: 'Pekerjaan Jalan' };
  }
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
  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<ProyekKategori | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(true);

  // Hierarchical Wilayah & Budget filter state
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('all');
  const [selectedDesa, setSelectedDesa] = useState<string>('all');
  const [selectedBudget, setSelectedBudget] = useState<string>('all');
  const [showBoundaryPolygons, setShowBoundaryPolygons] = useState<boolean>(true);

  // Mobile Bottom Sheet state
  const [mobileSheetState, setMobileSheetState] = useState<'collapsed' | 'expanded'>('collapsed');
  const [mobileActiveTab, setMobileActiveTab] = useState<'explore' | 'my-projects' | 'search' | 'profile'>('explore');

  // Real-time GPS & Geolocation state (Default to Pusat Kota Lamongan)
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
    isLiveGps: boolean;
    address: string;
  }>({
    lat: -7.1197,
    lng: 112.4150,
    isLiveGps: false,
    address: 'Alun-Alun Lamongan, Jl. Lamongrejo',
  });

  // Real-time telemetry state
  const [lastSyncTime, setLastSyncTime] = useState<string>('Baru saja');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [liveTelemetryTick, setLiveTelemetryTick] = useState<number>(0);
  const [activeLayer, setActiveLayer] = useState<'standard' | 'satellite'>('standard');
  const [liveProjects, setLiveProjects] = useState<ProyekItem[]>(projects);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Sync projects from backend on mount and center on Lamongan
  useEffect(() => {
    apiService.getProjects().then((res) => {
      if (res.isFromBackend && res.projects.length > 0) {
        const existingIds = new Set(res.projects.map((p) => p.id));
        const merged = [...res.projects, ...projects.filter((p) => !existingIds.has(p.id))];
        setLiveProjects(merged);
        setIsBackendConnected(true);
        if (mapInstanceRef.current && res.projects[0]) {
          mapInstanceRef.current.flyTo(
            [Number(res.projects[0].latitude), Number(res.projects[0].longitude)],
            14,
            { duration: 1 }
          );
        }
      }
    });
  }, [projects]);

  // Leaflet refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polygonsLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // 1. Geolocation Watcher for Real-time GPS
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            isLiveGps: true,
            address: `GPS Aktif (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
          });
        },
        (err) => {
          console.info('GPS fallback mode active:', err.message);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, []);

  // 2. Periodic Live Real-time Telemetry Simulator
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTelemetryTick((t) => t + 1);
      const now = new Date();
      setLastSyncTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  // Projects with calculated real-time distances & enriched telemetry
  const enrichedProjects = useMemo(() => {
    return liveProjects.map((p) => {
      const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, p.latitude, p.longitude);
      return {
        ...p,
        telemetryTick: liveTelemetryTick,
        liveDistanceKm: dist,
        distanceStr: `${dist} km`,
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
  }, [liveProjects, userLocation.lat, userLocation.lng, liveTelemetryTick]);

  // Filtered projects with hierarchical subdistrict & budget range filters
  const filteredProjects = useMemo(() => {
    return enrichedProjects.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all' && p.kategori !== selectedCategory) return false;

      // Hierarchical Kecamatan filter
      if (selectedKecamatan !== 'all') {
        const matchKec = (p.nama_wilayah || '').toLowerCase().includes(selectedKecamatan.toLowerCase().replace('kecamatan ', ''));
        if (!matchKec) return false;
      }

      // Hierarchical Desa filter
      if (selectedDesa !== 'all' && selectedDesa !== 'Semua Desa / Kelurahan') {
        const cleanDesa = selectedDesa.replace('Desa ', '').replace('Kelurahan ', '').toLowerCase();
        const matchDesa = (p.nama_wilayah || '').toLowerCase().includes(cleanDesa) || p.deskripsi.toLowerCase().includes(cleanDesa);
        if (!matchDesa) return false;
      }

      // Budget Range filter
      if (selectedBudget !== 'all') {
        const bConfig = BUDGET_RANGES.find((b) => b.id === selectedBudget);
        if (bConfig) {
          if (p.anggaran < bConfig.min || p.anggaran > bConfig.max) return false;
        }
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.nama_proyek.toLowerCase().includes(q);
        const matchDesc = p.deskripsi.toLowerCase().includes(q);
        const matchLoc = (p.nama_wilayah || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchLoc) return false;
      }
      return true;
    });
  }, [enrichedProjects, selectedCategory, selectedKecamatan, selectedDesa, selectedBudget, searchQuery]);

  // Selected project object
  const currentProject = useMemo(() => {
    return (
      enrichedProjects.find((p) => p.id === selectedProjectId) ||
      enrichedProjects[0]
    );
  }, [selectedProjectId, enrichedProjects]);

  // 3. Initialize Leaflet Map (Using OSM HOT tiles)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered at Lamongan (Alun-Alun & Pusat Pemerintahan Kab. Lamongan)
    const map = L.map(mapContainerRef.current, {
      center: [-7.1195, 112.4154],
      zoom: 14,
      zoomControl: false,
    });

    // OpenStreetMap HOT tiles
    const standardTile = L.tileLayer(
      'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        subdomains: 'abc',
      }
    ).addTo(map);

    tileLayerRef.current = standardTile;

    // Layer group for GeoJSON administrative boundary polygons
    const polygonsGroup = L.layerGroup().addTo(map);
    polygonsLayerRef.current = polygonsGroup;

    // Layer group for project markers
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 3b. Render GeoJSON Boundary Polygons for Districts (Kecamatan)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const polyGroup = polygonsLayerRef.current;
    if (!map || !polyGroup) return;

    polyGroup.clearLayers();

    if (!showBoundaryPolygons) return;

    WILAYAH_DATA.kecamatanList.forEach((kec) => {
      const isSelected = selectedKecamatan === kec.nama;
      const poly = L.polygon(kec.polygon as any, {
        color: isSelected ? '#184C78' : '#2980B9',
        weight: isSelected ? 3 : 1.5,
        opacity: 0.85,
        fillColor: isSelected ? '#184C78' : '#38BDF8',
        fillOpacity: isSelected ? 0.28 : 0.1,
        dashArray: isSelected ? undefined : '5, 5',
      });

      // Tooltip on Hover
      poly.bindTooltip(
        `<div class="p-1 text-xs">
          <strong class="text-[#184C78] block font-bold">${kec.nama}</strong>
          <span class="text-slate-600 text-[10px]">Total Proyek: <strong>${kec.proyekBerjalan + kec.proyekSelesai + kec.proyekTertunda} Proyek</strong></span><br/>
          <span class="text-slate-600 text-[10px]">Alokasi Dana: <strong>Rp ${(kec.anggaranTotal / 1000000000).toFixed(1)} M</strong></span>
        </div>`,
        { sticky: true, direction: 'top', opacity: 0.95 }
      );

      // On Click: Select and zoom to district
      poly.on('click', () => {
        setSelectedKecamatan(kec.nama);
        setSelectedDesa('all');
        map.flyTo(kec.koordinatPusat, 13, { animate: true, duration: 0.8 });
      });

      polyGroup.addLayer(poly);
    });
  }, [showBoundaryPolygons, selectedKecamatan]);

  // 4. Update Tile Layer on toggle (Standard vs Satellite)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    if (activeLayer === 'satellite') {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Esri &copy; Maxar, Earthstar Geographics',
          maxZoom: 18,
        }
      ).addTo(map);
    } else {
      tileLayerRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          subdomains: 'abc',
        }
      ).addTo(map);
    }
  }, [activeLayer]);

  // 5. Update User Live GPS Marker on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
    }

    const userHtml = `
      <div class="relative flex items-center justify-center w-10 h-10 pointer-events-none">
        <span class="absolute w-10 h-10 bg-blue-500/35 rounded-full animate-ping"></span>
        <span class="absolute w-6 h-6 bg-blue-400/40 rounded-full animate-pulse"></span>
        <span class="relative w-4 h-4 bg-[#2563EB] border-2 border-white rounded-full shadow-lg"></span>
      </div>
    `;

    const userIcon = L.divIcon({
      className: 'user-gps-div-icon',
      html: userHtml,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const marker = L.marker([userLocation.lat, userLocation.lng], {
      icon: userIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    marker.bindTooltip(
      `<div class="text-xs font-bold text-[#184C78] flex items-center gap-1">
        <span class="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
        ${userLocation.isLiveGps ? 'Posisi GPS Anda (Live)' : 'Lokasi Anda (Simulasi)'}
      </div>`,
      { permanent: false, direction: 'top', offset: [0, -18] }
    );

    userMarkerRef.current = marker;
  }, [userLocation]);

  // 6. Update Project Markers on Leaflet when projects or selection change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    filteredProjects.forEach((proj) => {
      const isSelected = proj.id === selectedProjectId;
      const catConfig = getCategoryColor(proj.kategori);
      const iconSvg = getCategoryIconSvg(proj.kategori);

      const pulseRing = isSelected
        ? `<span class="absolute -inset-2.5 rounded-full border-2 border-[#184C78] animate-ping opacity-75"></span>
           <span class="absolute -inset-1 rounded-full border-2 border-[#184C78] opacity-90 shadow-sm"></span>`
        : '';

      const markerHtml = `
        <div class="relative flex items-center justify-center transition-transform hover:scale-115 cursor-pointer">
          ${pulseRing}
          <div style="background-color: ${catConfig.bg}; border-color: #ffffff;" class="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-xl border-2 transition-all">
            ${iconSvg}
          </div>
          <div class="absolute -bottom-1 -right-1 bg-white text-[#184C78] text-[9px] font-extrabold px-1 rounded-full shadow-xs border border-slate-200">
            ${proj.progres_persen}%
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'project-leaflet-marker',
        html: markerHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -22],
      });

      const marker = L.marker([proj.latitude, proj.longitude], {
        icon: customIcon,
      });

      // Interactive popup
      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 text-slate-800 font-sans';
      popupContent.innerHTML = `
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">${catConfig.label}</div>
        <div class="font-bold text-xs text-[#184C78] mb-1 line-clamp-2">${proj.nama_proyek}</div>
        <div class="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
          <span>Progres: <strong class="text-[#184C78]">${proj.progres_persen}%</strong></span>
          <span>Jarak: <strong class="text-emerald-600">${proj.distanceStr}</strong></span>
        </div>
        <div class="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
          <div class="bg-[#184C78] h-full" style="width: ${proj.progres_persen}%"></div>
        </div>
        <button id="leaflet-btn-select-${proj.id}" class="w-full py-1 px-2 bg-[#184C78] text-white text-[11px] font-bold rounded-lg hover:bg-[#0f3252] transition-colors cursor-pointer text-center">
          Pilih & Tampilkan Info
        </button>
      `;

      marker.bindPopup(popupContent, { maxWidth: 220, closeButton: false });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`leaflet-btn-select-${proj.id}`);
        if (btn) {
          btn.onclick = () => {
            setSelectedProjectId(proj.id);
            setIsDetailPanelOpen(true);
            setMobileSheetState('expanded');
          };
        }
      });

      marker.on('click', () => {
        setSelectedProjectId(proj.id);
        setIsDetailPanelOpen(true);
        setMobileSheetState('expanded');
      });

      markersGroup.addLayer(marker);
    });
  }, [filteredProjects, selectedProjectId]);

  // Center to selected project when changed
  const handleSelectPin = (id: number) => {
    setSelectedProjectId(id);
    setIsDetailPanelOpen(true);
    setMobileSheetState('expanded');

    const proj = enrichedProjects.find((p) => p.id === id);
    if (proj && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([proj.latitude, proj.longitude], 15, {
        animate: true,
        duration: 0.8,
      });
    }
  };

  const handleCenterUserLocation = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 16, {
        animate: true,
        duration: 1,
      });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await apiService.getProjects();
      if (res.isFromBackend && res.projects.length > 0) {
        const existingIds = new Set(res.projects.map((p) => p.id));
        const merged = [...res.projects, ...projects.filter((p) => !existingIds.has(p.id))];
        setLiveProjects(merged);
        setIsBackendConnected(true);
      }
    } catch (err) {
      console.warn('Sync error:', err);
    } finally {
      setIsSyncing(false);
      const now = new Date();
      setLastSyncTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#F8FAFC] flex flex-col font-['Inter'] text-[#212529] select-none overflow-hidden">
      {/* ── TOP NAV HEADER (DESKTOP & TABLET) ── */}
      <header className="h-14 bg-white/95 backdrop-blur-md border-b border-[#DCE4EC] px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 shadow-xs">
        {/* Left: Brand & Back to Home */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onBackToLanding}
            className="px-3 py-1.5 rounded-lg bg-[#EBF4FB] hover:bg-[#d9ecf8] text-[#184C78] border border-[#c5def2] transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-2xs"
            title="Kembali ke Beranda Utama"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Beranda</span>
          </button>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#184C78] rounded-lg flex items-center justify-center text-white shadow-xs">
              <Compass className="w-4 h-4 text-cyan-300" />
            </div>
            <span className="font-['DM_Sans'] font-extrabold text-base text-[#184C78] tracking-tight hidden md:inline">
              CivicTrack <span className="text-xs font-medium text-slate-500">| Peta Proyek Kab. Lamongan</span>
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
              placeholder="Cari proyek di Lamongan, nama jalan, atau ID..."
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

        {/* Right: Live Sync Indicator, User & Dashboard */}
        <div className="flex items-center gap-2.5">
          {/* Live Realtime Leaflet Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{isBackendConnected ? 'Backend Aktif (MySQL)' : 'Live Sync'} • {lastSyncTime}</span>
            <button
              onClick={handleManualSync}
              className={`p-0.5 hover:text-emerald-950 transition-transform cursor-pointer ${isSyncing ? 'animate-spin' : ''}`}
              title="Refresh Data dari Backend"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

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

      {/* ── MAIN CONTENT AREA: LEAFLET MAP + DETAIL DRAWER ── */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* ── FULL-SCREEN REAL LEAFLET MAP ── */}
        <div className="flex-1 relative bg-[#EBF3E8] overflow-hidden flex flex-col">
          {/* FLOATING TOP CONTROLS (FILTER PILLS & MOBILE SEARCH) */}
          <div className="absolute top-3 left-3 right-3 sm:left-4 sm:right-auto z-[1000] flex flex-col gap-2 pointer-events-none max-w-full">
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

            {/* Horizontal Filter Controls & Cascading Selectors */}
            <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 max-w-full">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 max-w-full scrollbar-none">
                {[
                  { id: 'all', label: 'Semua Kategori' },
                  { id: 'jalan', label: 'Jalan & Jembatan' },
                  { id: 'taman', label: 'Taman & RTH' },
                  { id: 'drainase', label: 'Drainase Air' },
                  { id: 'fasilitas', label: 'Fasilitas Umum' },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => {
                      setSelectedCategory(pill.id as any);
                    }}
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

              {/* Hierarchical Subdistrict & Budget Dropdowns Row */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {/* 1. Kecamatan Filter */}
                <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl px-2.5 py-1 shadow-xs flex items-center gap-1.5 text-xs">
                  <span className="text-[#184C78] font-bold text-[11px]">📍 Kec:</span>
                  <select
                    value={selectedKecamatan}
                    onChange={(e) => {
                      setSelectedKecamatan(e.target.value);
                      setSelectedDesa('all');
                      if (e.target.value !== 'all' && mapInstanceRef.current) {
                        const target = WILAYAH_DATA.kecamatanList.find((k) => k.nama === e.target.value);
                        if (target) {
                          mapInstanceRef.current.flyTo(target.koordinatPusat, 13, { animate: true, duration: 0.8 });
                        }
                      }
                    }}
                    className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="all">Semua Kecamatan (Kab. Lamongan)</option>
                    {WILAYAH_DATA.kecamatanList.map((kec) => (
                      <option key={kec.nama} value={kec.nama}>
                        {kec.nama}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Desa/Kelurahan Filter (Cascading based on selected Kecamatan) */}
                {selectedKecamatan !== 'all' && (
                  <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl px-2.5 py-1 shadow-xs flex items-center gap-1.5 text-xs animate-fade-in">
                    <span className="text-[#2980B9] font-bold text-[11px]">🏘️ Desa:</span>
                    <select
                      value={selectedDesa}
                      onChange={(e) => setSelectedDesa(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer max-w-[140px]"
                    >
                      {WILAYAH_DATA.kecamatanList
                        .find((k) => k.nama === selectedKecamatan)
                        ?.desaList.map((desa) => (
                          <option key={desa} value={desa}>
                            {desa}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* 3. Budget Range Filter */}
                <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl px-2.5 py-1 shadow-xs flex items-center gap-1.5 text-xs">
                  <span className="text-[#1A9E6E] font-bold text-[11px]">💰 Anggaran:</span>
                  <select
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
                  >
                    {BUDGET_RANGES.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Toggle Boundary Polygons Switch */}
                <button
                  onClick={() => setShowBoundaryPolygons(!showBoundaryPolygons)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    showBoundaryPolygons
                      ? 'bg-[#184C78] text-white border-[#184C78]'
                      : 'bg-white/95 backdrop-blur-md text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Tampilkan / Sembunyikan Layer Poligon Batas Wilayah Kecamatan"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Batas Wilayah (GeoJSON)</span>
                </button>

                {/* Clear Active Filters */}
                {(selectedCategory !== 'all' || selectedKecamatan !== 'all' || selectedBudget !== 'all' || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedKecamatan('all');
                      setSelectedDesa('all');
                      setSelectedBudget('all');
                      setSearchQuery('');
                    }}
                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                    title="Reset semua filter"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reset Filter</span>
                  </button>
                )}
              </div>
            </div>

            {/* Real-time status banner */}
            <div className="pointer-events-auto flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-semibold text-slate-700 border border-slate-200 shadow-xs w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Menampilkan {filteredProjects.length} dari {projects.length} Proyek Aktif</span>
            </div>
          </div>

          {/* FLOATING MAP ZOOM & LAYER CONTROLS (RIGHT CORNER) */}
          <div className="absolute right-3.5 bottom-24 sm:bottom-6 z-[1000] flex flex-col gap-2">
            <button
              onClick={() => setActiveLayer(activeLayer === 'standard' ? 'satellite' : 'standard')}
              className={`w-10 h-10 rounded-xl shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer border ${
                activeLayer === 'satellite'
                  ? 'bg-[#184C78] text-white border-[#184C78]'
                  : 'bg-white/95 backdrop-blur-md hover:bg-white text-[#184C78] border-slate-200/90'
              }`}
              title="Ganti Layer Peta (Standard / Satelit)"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={handleCenterUserLocation}
              className="w-10 h-10 bg-white/95 backdrop-blur-md hover:bg-white border border-slate-200/90 rounded-xl shadow-md flex items-center justify-center text-[#184C78] transition-transform active:scale-95 cursor-pointer"
              title="Pusatkan ke Lokasi Saya (GPS)"
            >
              <Navigation className="w-4 h-4 text-[#2980B9]" />
            </button>
            <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl shadow-md flex flex-col overflow-hidden">
              <button
                onClick={handleZoomIn}
                className="w-10 h-9 flex items-center justify-center text-[#184C78] hover:bg-slate-100 transition-colors border-b border-slate-100 cursor-pointer"
                title="Perbesar Peta"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="w-10 h-9 flex items-center justify-center text-[#184C78] hover:bg-slate-100 transition-colors cursor-pointer"
                title="Perkecil Peta"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── REAL LEAFLET CONTAINER ── */}
          <div
            ref={mapContainerRef}
            id="leaflet-map-explorer"
            className="w-full h-full z-0 outline-none"
            style={{ minHeight: '100%' }}
          />
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
                  <span className="text-[#2980B9] font-bold">{currentProject.distanceStr} dari posisi Anda</span>
                </div>
              </div>

              {/* Photo Showcase (Matches Image 1) */}
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-xs relative group">
                <img
                  src={centennialParkImg}
                  alt={currentProject.nama_proyek}
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>Real-time Field Telemetry</span>
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
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>Tahap: <strong>{currentProject.tahap_terkini || 'Konstruksi fisik aktif'}</strong></span>
                  <span className="text-[10px] text-slate-400">Sync: {lastSyncTime}</span>
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
          mobileSheetState === 'expanded' ? 'bottom-16 max-h-[70vh]' : 'bottom-16 max-h-36'
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
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Current Location:
                </span>
                {userLocation.isLiveGps && (
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded-full">
                    GPS Realtime
                  </span>
                )}
              </div>
              <h5 className="font-['DM_Sans'] text-xs font-bold text-[#184C78] truncate max-w-[240px]">
                {userLocation.address}
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
              className="py-2 px-3 bg-[#184C78] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Directions</span>
            </button>
            <button
              onClick={() => onOpenProjectDetail(currentProject)}
              className="py-2 px-3 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Report Issue</span>
            </button>
          </div>

          {/* Nearby Project Strip */}
          <div
            onClick={() => handleSelectPin(currentProject.id)}
            className="flex items-center justify-between text-xs py-1 border-t border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <span className="text-slate-500 truncate max-w-[200px]">
              Nearby: <strong className="text-[#184C78]">{currentProject.nama_proyek}</strong>
            </span>
            <span className="text-[#2980B9] font-bold shrink-0">
              Jarak {currentProject.distanceStr}
            </span>
          </div>
        </div>

        {/* Expanded Content (when dragged up on mobile) */}
        {mobileSheetState === 'expanded' && (
          <div className="px-4 pb-6 overflow-y-auto space-y-3 flex-1 border-t border-slate-100 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700">Detail Pembangunan Terdekat</span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Sync {lastSyncTime}</span>
              </span>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#184C78]">{currentProject.nama_proyek}</span>
                <span className="text-xs font-bold text-emerald-600">{currentProject.progres_persen}%</span>
              </div>
              <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">
                {currentProject.deskripsi}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Anggaran: <strong>Rp {(currentProject.anggaran / 1000000000).toFixed(1)}M</strong></span>
                <span>Target: <strong>{currentProject.estimasi_selesai}</strong></span>
              </div>
            </div>

            <button
              onClick={() => onOpenProjectDetail(currentProject)}
              className="w-full py-2.5 bg-[#184C78] text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Buka Transparansi Proyek Ini</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── FIXED BOTTOM PWA NAVIGATION BAR (MATCHES IMAGE 2) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 h-16 px-4 flex items-center justify-around shadow-lg">
        {/* Tab 1: Explore (Active) */}
        <button
          onClick={() => {
            setMobileActiveTab('explore');
            handleCenterUserLocation();
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

        {/* Tab 2: My Projects */}
        <button
          onClick={() => {
            setMobileActiveTab('my-projects');
            if (currentUser && onOpenDashboard) {
              onOpenDashboard();
            } else {
              onOpenAuth('login');
            }
          }}
          className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all cursor-pointer ${
            mobileActiveTab === 'my-projects'
              ? 'text-white bg-[#184C78] shadow-xs'
              : 'text-slate-500 hover:text-[#184C78]'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span className="text-[10px] font-bold mt-0.5">Projects</span>
        </button>

        {/* Tab 3: Search */}
        <button
          onClick={() => {
            setMobileActiveTab('search');
            const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
            if (searchInput) searchInput.focus();
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

        {/* Tab 4: Profile / Dashboard */}
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
