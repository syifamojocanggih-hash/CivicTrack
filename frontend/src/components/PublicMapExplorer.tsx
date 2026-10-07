import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import {
  Search,
  X,
  Navigation,
  Layers,
  Plus,
  Minus,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  User,
  ShieldCheck,
  RefreshCw,
  Radio,
  Phone,
  Heart,
  ChevronDown,
  Building2,
  Check,
  SlidersHorizontal,
  FileText,
  AlertCircle,
  Send,
  Compass,
  Info,
  ChevronLeft,
} from 'lucide-react';
import type { ProyekItem, ProyekKategori, UserProfile, WilayahOptionItem } from '../types';
import centennialParkImg from '../assets/centennial_park.jpg';
import { apiService } from '../services/api';
import { WILAYAH_DATA, BUDGET_RANGES, LAMONGAN_KECAMATAN_GEOJSON } from '../data/geoWilayahData';

// Bounding box resmi gabungan seluruh 27 Kecamatan di Kab. Lamongan (dihitung dari poligon GeoJSON BPS/BIG)
const ALL_LAMONGAN_BOUNDS: L.LatLngBoundsExpression = [
  [-7.384821, 112.072567],
  [-6.861185, 112.552381]
];

// Bounding box batas wilayah dengan buffer ~8% (~4.5 km) untuk membatasi navigasi/panning liar ke luar kabupaten
const LAMONGAN_MAX_BOUNDS: L.LatLngBoundsExpression = [
  [-7.426712, 112.034182],
  [-6.819294, 112.590767]
];

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
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10v12"/><path d="M12 2a5 5 0 0 0-5 5c0 2 1.5 3.5 3 4.5V14h4v-2.5c1.5-1 3-2.5 3-4.5a5 5 0 0 0-5-5Z"/></svg>`;
    case 'drainase':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a6 6 0 1 0 7.8 0L12 3z"/></svg>`;
    case 'fasilitas':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/></svg>`;
    case 'jalan':
    default:
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m14 12-4-4"/><path d="m14 16-4-4"/><path d="M4 22 14.5 4a2 2 0 0 1 3 0L20 7"/></svg>`;
  }
}

// Skema warna visual per kategori infrastruktur (Langkah 3)
function getCategoryTheme(category: string): {
  hex: string;
  bgTailwind: string;
  badgeBg: string;
  badgeText: string;
  borderHex: string;
  label: string;
} {
  switch (category) {
    case 'taman':
      return {
        hex: '#059669', // Emerald
        bgTailwind: 'bg-emerald-600',
        badgeBg: 'bg-emerald-50',
        badgeText: 'text-emerald-700',
        borderHex: '#10B981',
        label: 'Taman & RTH',
      };
    case 'drainase':
      return {
        hex: '#0891B2', // Cyan/Teal
        bgTailwind: 'bg-cyan-600',
        badgeBg: 'bg-cyan-50',
        badgeText: 'text-cyan-700',
        borderHex: '#06B6D4',
        label: 'Drainase Air',
      };
    case 'fasilitas':
      return {
        hex: '#7C3AED', // Violet
        bgTailwind: 'bg-purple-600',
        badgeBg: 'bg-purple-50',
        badgeText: 'text-purple-700',
        borderHex: '#8B5CF6',
        label: 'Fasilitas Umum',
      };
    case 'jalan':
    default:
      return {
        hex: '#2563EB', // Blue
        bgTailwind: 'bg-blue-600',
        badgeBg: 'bg-blue-50',
        badgeText: 'text-blue-700',
        borderHex: '#3B82F6',
        label: 'Jalan & Jembatan',
      };
  }
}

// Skema warna badge progres sesuai 3 rentang nilai (Langkah 3):
// - Merah (<30%): Awal konstruksi / butuh atensi
// - Kuning (30% - 70%): Pekerjaan konstruksi intensif
// - Hijau (>70%): Menuju finishing / selesai
function getProgressBadge(percent: number): {
  badgeBg: string;
  textColor: string;
  borderColor: string;
  indicatorDot: string;
  label: string;
} {
  if (percent < 30) {
    return {
      badgeBg: 'bg-rose-50',
      textColor: 'text-rose-700',
      borderColor: 'border-rose-200',
      indicatorDot: 'bg-rose-500',
      label: 'Tahap Awal (<30%)',
    };
  } else if (percent <= 70) {
    return {
      badgeBg: 'bg-amber-50',
      textColor: 'text-amber-800',
      borderColor: 'border-amber-200',
      indicatorDot: 'bg-amber-500',
      label: 'Konstruksi (30-70%)',
    };
  } else {
    return {
      badgeBg: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      indicatorDot: 'bg-emerald-500',
      label: 'Finishing (>70%)',
    };
  }
}

export const PublicMapExplorer: React.FC<PublicMapExplorerProps> = ({
  currentUser,
  projects,
  onBackToLanding,
  onOpenDashboard,
  onOpenAIRoute,
  onOpenAuth,
}) => {
  // Filter & Search states (Matches Image 1)
  const [selectedCategory, setSelectedCategory] = useState<ProyekKategori | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'berjalan' | 'selesai'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);

  // UX & Visual states (Legenda peta & Responsivitas Mobile)
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Right Detail Drawer Tabs & Citizen Report form
  const [detailTab, setDetailTab] = useState<'ringkasan' | 'transparansi' | 'aduan' | 'sekitar'>('ringkasan');
  const [reportTitle, setReportTitle] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reportCategory, setReportCategory] = useState('keterlambatan');
  const [reportSent, setReportSent] = useState(false);

  // Hierarchical Wilayah & Budget filter state
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('all');
  const [selectedDesaId, setSelectedDesaId] = useState<string>('all');
  const [desaOptions, setDesaOptions] = useState<WilayahOptionItem[]>([]);
  const [isLoadingDesa, setIsLoadingDesa] = useState<boolean>(false);
  const [selectedBudget, setSelectedBudget] = useState<string>('all');
  const [showBoundaryPolygons, setShowBoundaryPolygons] = useState<boolean>(true);

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

  // Sync projects from backend on mount or fall back to 27 comprehensive projects
  useEffect(() => {
    apiService.getProjects().then((res) => {
      if (res.isFromBackend && res.projects.length > 0) {
        const existingIds = new Set(res.projects.map((p) => p.id));
        const merged = [...res.projects, ...projects.filter((p) => !existingIds.has(p.id))];
        setLiveProjects(merged);
        setIsBackendConnected(true);
      } else {
        setLiveProjects(projects);
      }
    });
  }, [projects]);

  // Fetch cascading desa/kelurahan when kecamatan is selected
  useEffect(() => {
    if (selectedKecamatan === 'all') {
      return;
    }

    const feat = LAMONGAN_KECAMATAN_GEOJSON?.features?.find(
      (f: any) => f.properties?.nama === selectedKecamatan || f.properties?.kecamatan === selectedKecamatan
    );
    if (!feat) return;

    // Kode kecamatan "35.24.XX" -> id = XX + 1 (Sukorame 01 -> ID 2, dsb)
    const kecCode = feat.properties.id;
    const kecNum = parseInt(kecCode.split('.')[2], 10);
    const kecId = kecNum + 1;

    let isCancelled = false;
    setIsLoadingDesa(true);
    apiService
      .getWilayah('desa', kecId)
      .then((res) => {
        if (!isCancelled) {
          setDesaOptions(res);
          setIsLoadingDesa(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setIsLoadingDesa(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedKecamatan]);

  // Leaflet refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<any | null>(null);
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
      setLastSyncTime(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
      );
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
            title: 'Persiapan Lahan & Perizinan Amdal',
            date: 'Jan 2024',
            status: 'completed',
            note: 'Pembongkaran, perataan tanah dan instalasi utilitas dasar selesai 100%.',
          },
          {
            title: 'Tahap 2: Konstruksi Fisik & Struktur',
            date: 'Aktif (Saat Ini)',
            status: 'current',
            note: 'Pengecoran aspal/beton, penguatan pondasi & pemasangan drainase.',
          },
          {
            title: 'Finishing & Serah Terima Hasil (PHO)',
            date: p.estimasi_selesai || 'Okt 2024',
            status: 'upcoming',
            note: 'Uji kelayakan keselamatan, marka jalan & peresmian akses publik.',
          },
        ],
      };
    });
  }, [liveProjects, userLocation.lat, userLocation.lng, liveTelemetryTick]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return enrichedProjects.filter((p) => {
      // Status filter
      if (selectedStatus !== 'all' && p.status !== selectedStatus) return false;

      // Category filter
      if (selectedCategory !== 'all' && p.kategori !== selectedCategory) return false;

      // Hierarchical Kecamatan filter
      if (selectedKecamatan !== 'all') {
        const matchKec = (p.nama_wilayah || '').toLowerCase().includes(selectedKecamatan.toLowerCase().replace('kecamatan ', ''));
        if (!matchKec) return false;
      }

      // Hierarchical Desa filter (Strict relational ID comparison)
      if (selectedDesaId !== 'all') {
        if (p.desa_id !== Number(selectedDesaId)) return false;
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
  }, [enrichedProjects, selectedStatus, selectedCategory, selectedKecamatan, selectedDesaId, selectedBudget, searchQuery]);

  // Selected project object
  const currentProject = useMemo(() => {
    return (
      enrichedProjects.find((p) => p.id === selectedProjectId) ||
      enrichedProjects[0]
    );
  }, [selectedProjectId, enrichedProjects]);

  // Nearby projects in the same district or related (Matches Image 2 list)
  const nearbyProjects = useMemo(() => {
    return enrichedProjects
      .filter((p) => p.id !== currentProject?.id)
      .slice(0, 5);
  }, [enrichedProjects, currentProject]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedStatus !== 'all') count++;
    if (selectedKecamatan !== 'all') count++;
    if (selectedDesaId !== 'all') count++;
    if (selectedBudget !== 'all') count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedCategory, selectedStatus, selectedKecamatan, selectedDesaId, selectedBudget, searchQuery]);

  const toggleBookmark = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    setReportSent(true);
    setTimeout(() => {
      setReportSent(false);
      setReportTitle('');
      setReportDesc('');
    }, 4000);
  };

  // 3. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Inisialisasi Peta Leaflet dengan Pembatasan Wilayah Kabupaten Lamongan
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const responsiveMinZoom = isMobile ? 9 : 10;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      minZoom: responsiveMinZoom,
      maxBounds: LAMONGAN_MAX_BOUNDS,
      maxBoundsViscosity: 1.0,
    });

    // Inisialisasi awal: langsung sesuaikan batas pandang ke seluruh 27 kecamatan Lamongan
    map.fitBounds(ALL_LAMONGAN_BOUNDS, {
      padding: isMobile ? [15, 15] : [30, 30],
      maxZoom: 12,
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

    // Marker Cluster Group for project markers with custom bubble counter
    const clusterGroup = (L as any).markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      removeOutsideVisibleBounds: true,
      maxClusterRadius: 42,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `
            <div class="relative flex items-center justify-center cursor-pointer group">
              <span class="absolute -inset-1.5 rounded-2xl bg-blue-500/25 animate-ping"></span>
              <div class="relative w-10 h-10 rounded-2xl bg-[#0B2540] border-2 border-white shadow-xl flex flex-col items-center justify-center text-white transition-all group-hover:scale-105 group-hover:bg-[#1E40AF]">
                <span class="text-xs font-black leading-none">${count}</span>
                <span class="text-[7.5px] font-extrabold text-blue-300 uppercase leading-none mt-0.5">Proyek</span>
              </div>
            </div>
          `,
          className: 'custom-cluster-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });
      },
    });
    map.addLayer(clusterGroup);
    markersLayerRef.current = clusterGroup;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 3a. Single Camera Controller (Single Source of Truth)
  // Replaces all conflicting fitBounds/flyTo calls. Always moves smoothly with flyToBounds.
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.invalidateSize();

    if (selectedKecamatan === 'all') {
      // Smoothly fly to the overall bounding box of all 27 Lamongan districts
      map.flyToBounds(ALL_LAMONGAN_BOUNDS, {
        padding: [35, 35],
        maxZoom: 12,
        duration: 0.9,
      });
    } else {
      // Find selected district feature bounds in GeoJSON
      const feat = LAMONGAN_KECAMATAN_GEOJSON.features.find(
        (f: any) => f.properties.nama === selectedKecamatan
      );
      if (feat && feat.properties.bounds) {
        map.flyToBounds(feat.properties.bounds, {
          padding: [45, 45],
          maxZoom: 14,
          duration: 0.9,
        });
      }
    }
  }, [selectedKecamatan]);

  // 3b. Render Google Maps-style Administrative GeoJSON Boundaries for all 27 Districts
  useEffect(() => {
    const map = mapInstanceRef.current;
    const polyGroup = polygonsLayerRef.current;
    if (!map || !polyGroup) return;

    polyGroup.clearLayers();

    if (!showBoundaryPolygons) return;

    const geoLayer = L.geoJSON(LAMONGAN_KECAMATAN_GEOJSON as any, {
      style: (feature: any) => {
        const isSelected = selectedKecamatan === feature.properties.nama;
        const isAnySelected = selectedKecamatan !== 'all';

        if (isSelected) {
          // Highlighted district style
          return {
            color: '#1D4ED8',
            weight: 2.8,
            opacity: 0.95,
            fillColor: '#3B82F6',
            fillOpacity: 0.22,
          };
        } else if (isAnySelected) {
          // When a specific kecamatan is selected, others are muted
          return {
            color: '#94A3B8',
            weight: 1,
            opacity: 0.35,
            fillColor: '#94A3B8',
            fillOpacity: 0.02,
            dashArray: '4, 4',
          };
        } else {
          // Mode "Semua Kecamatan": Peningkatan kontras sesuai usulan (weight 1.8, opacity 0.75, color #0369A1)
          return {
            color: '#0369A1',
            weight: 1.8,
            opacity: 0.75,
            fillColor: '#38BDF8',
            fillOpacity: 0.08,
            dashArray: undefined,
          };
        }
      },
      onEachFeature: (feature: any, layer: any) => {
        const props = feature.properties;
        const isSelected = selectedKecamatan === props.nama;

        // Sleek Google Maps style district tooltip
        layer.bindTooltip(
          `<div class="p-2.5 font-['DM_Sans'] text-xs min-w-[160px] bg-white rounded-xl shadow-lg border border-slate-100">
            <div class="flex items-center gap-1.5 pb-1.5 mb-1.5 border-b border-slate-100">
              <span class="w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-[#0369A1]'}"></span>
              <strong class="text-[#0B2540] font-bold text-xs">${props.nama}</strong>
            </div>
            <div class="space-y-1 text-[11px] text-slate-600">
              <div class="flex justify-between">
                <span>Total Proyek:</span>
                <b class="text-slate-900 font-bold">${props.totalProyek} Proyek</b>
              </div>
              <div class="flex justify-between">
                <span>Alokasi APBD:</span>
                <b class="text-[#0369A1] font-bold">Rp ${(props.anggaranTotal / 1000000000).toFixed(1)} M</b>
              </div>
            </div>
            <div class="mt-1.5 pt-1 border-t border-slate-100 text-[10px] text-blue-600 font-medium">
              👉 Klik untuk fokus kecamatan ini
            </div>
          </div>`,
          { sticky: true, direction: 'top', opacity: 0.98 }
        );

        // Hover & click interaction
        layer.on({
          mouseover: (e: any) => {
            if (selectedKecamatan !== props.nama) {
              const l = e.target;
              l.setStyle({
                weight: 2.4,
                color: '#2563EB',
                fillColor: '#60A5FA',
                fillOpacity: 0.18,
              });
              if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                l.bringToFront();
              }
            }
          },
          mouseout: (e: any) => {
            if (selectedKecamatan !== props.nama) {
              geoLayer.resetStyle(e.target);
            }
          },
          click: () => {
            // Decoupled: only set state. The single camera effect smoothly handles navigation!
            setSelectedKecamatan(props.nama);
            setSelectedDesaId('all');
          },
        });
      },
    });

    polyGroup.addLayer(geoLayer);

    return () => {
      polyGroup.clearLayers();
    };
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

  // Center to selected project when changed
  const handleSelectPin = useCallback((id: number) => {
    setSelectedProjectId(id);
    setIsDetailPanelOpen(true);
    setDetailTab('ringkasan');

    const proj = enrichedProjects.find((p) => p.id === id);
    if (proj && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([proj.latitude, proj.longitude], 15, {
        animate: true,
        duration: 0.8,
      });
    }
  }, [enrichedProjects]);

  // 6. Update Project Markers into Marker Cluster (Langkah 2 & Langkah 3)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    filteredProjects.forEach((proj) => {
      const isSelected = proj.id === selectedProjectId && isDetailPanelOpen;
      const iconSvg = getCategoryIconSvg(proj.kategori);
      const theme = getCategoryTheme(proj.kategori);
      const prog = getProgressBadge(proj.progres_persen);

      const markerHtml = isSelected
        ? `
          <div class="relative flex flex-col items-center justify-center transition-all scale-110 cursor-pointer group">
            <span class="absolute -inset-2.5 rounded-2xl bg-blue-500/35 animate-ping"></span>
            <div class="relative w-11 h-11 rounded-2xl shadow-2xl flex items-center justify-center text-white border-2 border-white transition-transform" style="background-color: ${theme.hex}">
              ${iconSvg}
            </div>
            <div class="w-2.5 h-2.5 rotate-45 -mt-1 shadow-sm border-r border-b border-white" style="background-color: ${theme.hex}"></div>
            <div class="absolute -top-7.5 bg-slate-900/95 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xl whitespace-nowrap pointer-events-none flex items-center gap-1.5 border border-white/20">
              <span class="w-1.5 h-1.5 rounded-full ${prog.indicatorDot}"></span>
              <span>${proj.progres_persen}% • ${proj.nama_wilayah?.split(',')[0] || 'Proyek'}</span>
            </div>
          </div>
        `
        : `
          <div class="relative flex flex-col items-center justify-center transition-all hover:scale-115 cursor-pointer group">
            <div class="w-9 h-9 rounded-xl shadow-lg flex items-center justify-center text-white border-2 border-white transition-all group-hover:brightness-110" style="background-color: ${theme.hex}">
              ${iconSvg}
            </div>
            <div class="w-2.5 h-2.5 rotate-45 -mt-1 shadow-xs border-r border-b border-white transition-all group-hover:brightness-110" style="background-color: ${theme.hex}"></div>
            
            <!-- Badge Persentase Progres 3 Rentang Warna (Merah <30%, Kuning 30-70%, Hijau >70%) -->
            <div class="absolute -top-2.5 -right-3 ${prog.badgeBg} ${prog.textColor} text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm border ${prog.borderColor} flex items-center gap-0.5 leading-none">
              <span class="w-1.5 h-1.5 rounded-full ${prog.indicatorDot} shrink-0"></span>
              <span>${proj.progres_persen}%</span>
            </div>
          </div>
        `;

      const customIcon = L.divIcon({
        className: 'project-leaflet-marker',
        html: markerHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const marker = L.marker([proj.latitude, proj.longitude], {
        icon: customIcon,
      });

      // Sleek interactive tooltip for project details
      marker.bindTooltip(
        `<div class="p-2 font-['DM_Sans'] text-xs min-w-[170px] bg-white rounded-xl shadow-md border border-slate-100">
          <div class="flex items-center gap-1 pb-1 mb-1 border-b border-slate-100">
            <span class="w-2 h-2 rounded-full" style="background-color: ${theme.hex}"></span>
            <span class="text-[10px] font-extrabold uppercase text-slate-500">${theme.label}</span>
          </div>
          <strong class="text-slate-900 font-bold text-xs block leading-snug mb-1">${proj.nama_proyek}</strong>
          <div class="flex justify-between items-center text-[10px] text-slate-600 pt-0.5">
            <span>Progres: <b class="font-extrabold ${prog.textColor}">${proj.progres_persen}%</b></span>
            <span class="text-blue-600 font-bold">Rp ${(proj.anggaran / 1000000000).toFixed(1)} M</span>
          </div>
        </div>`,
        { direction: 'top', offset: [0, -22], opacity: 0.98 }
      );

      marker.on('click', () => {
        handleSelectPin(proj.id);
      });

      markersGroup.addLayer(marker);
    });
  }, [filteredProjects, selectedProjectId, isDetailPanelOpen, handleSelectPin]);

  // Fit map view to cover all 27 Kecamatan in Kabupaten Lamongan (Smooth flyToBounds via single camera effect)
  const handleFitAllLamongan = () => {
    setSelectedKecamatan('all');
    setSelectedDesaId('all');
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
      setLastSyncTime(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#F8FAFC] flex flex-col font-['Inter'] text-[#212529] select-none overflow-hidden">
      {/* ── TOP NAV HEADER ── */}
      <header className="h-14 bg-white/95 backdrop-blur-md border-b border-[#DCE4EC] px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 shadow-xs">
        {/* Left: Brand & Back */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => {
              if (currentUser && onOpenDashboard) {
                onOpenDashboard();
              } else {
                onBackToLanding();
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-[#EBF4FB] hover:bg-[#d9ecf8] text-[#184C78] border border-[#c5def2] transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-2xs"
            title={currentUser ? 'Kembali ke Dashboard' : 'Kembali ke Beranda'}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentUser ? 'Dashboard' : 'Beranda'}</span>
          </button>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-2">
            <img src="/civictrack-icon.png" alt="CivicTrack Logo" className="h-7 w-auto object-contain" />
            <span className="font-['DM_Sans'] font-black text-base text-[#184C78] tracking-tight">
              CivicTrack <span className="text-xs font-medium text-slate-500 hidden md:inline">| Peta Spasial Proyek</span>
            </span>
          </div>
        </div>

        {/* Right: Live Sync, AI Route & User */}
        <div className="flex items-center gap-2.5">
          {/* Live Sync Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{isBackendConnected ? 'Backend Aktif' : 'Live Sync'} • {lastSyncTime}</span>
            <button
              onClick={handleManualSync}
              className={`p-0.5 hover:text-emerald-950 transition-transform cursor-pointer ${isSyncing ? 'animate-spin' : ''}`}
              title="Refresh Data dari Server"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* Rute Alternatif AI Button */}
          <button
            onClick={() => onOpenAIRoute(currentProject?.nama_proyek || 'Pelebaran Jalan Veteran - Lamongan')}
            className="px-3 py-1.5 bg-gradient-to-r from-[#6D28D9] to-[#184C78] hover:from-[#5B21B6] hover:to-[#0f3252] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-sm flex items-center gap-1.5 transition-all cursor-pointer hover:scale-102"
            title="Buka Navigasi Rute Alternatif AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Rute Alternatif AI</span>
            <span className="sm:hidden">Rute AI</span>
          </button>

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

      {/* ── MAIN CONTENT AREA (MAP + TRUE SIDEBAR DRAWERS) ── */}
      <div className="flex-1 relative overflow-hidden">
        {/* FULL-SCREEN LEAFLET MAP CONTAINER */}
        <div
          ref={mapContainerRef}
          id="leaflet-map-explorer"
          className="w-full h-full z-0 outline-none"
        />

        {/* ── TOP-LEFT MAP OVERLAYS: ACTIVE DISTRICT BANNER & LEGENDA PETA ── */}
        <div
          className={`absolute top-4 z-20 flex flex-wrap items-center gap-2.5 transition-all duration-300 ${
            isDetailPanelOpen
              ? 'left-4 sm:left-[210px]'
              : isSidebarCollapsed
                ? 'left-4 sm:left-[70px]'
                : 'left-4 sm:left-[410px] xl:left-[440px]'
          }`}
        >
          {/* Active District Banner if selected */}
          {selectedKecamatan !== 'all' && (
            <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md border border-blue-200/90 shadow-xl rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-800 animate-fade-in">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shrink-0"></span>
              <div>
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block -mb-0.5">Batas Wilayah Terpilih</span>
                <strong className="text-[#184C78] font-bold text-xs">{selectedKecamatan}</strong>
              </div>
              <span className="h-4 w-px bg-slate-200" />
              <span className="text-slate-600 text-[11px] font-bold">{filteredProjects.length} Proyek</span>
              <button
                onClick={handleFitAllLamongan}
                className="ml-0.5 p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="Kembali ke Seluruh Kabupaten Lamongan"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Legenda Peta Dropdown Button in Top-Left */}
          <div className="relative">
            <button
              onClick={() => setIsLegendOpen(!isLegendOpen)}
              className={`bg-white/95 backdrop-blur-md hover:bg-white border shadow-md rounded-2xl px-3 py-2 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer hover:shadow-lg transition-all ${
                isLegendOpen ? 'border-blue-400 ring-2 ring-blue-100 text-blue-700' : 'border-slate-200/90'
              }`}
              title={isLegendOpen ? 'Tutup Legenda Peta' : 'Buka Legenda Peta'}
            >
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Legenda</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isLegendOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Legenda Popover Card */}
            {isLegendOpen && (
              <div className="absolute top-full mt-2 left-0 bg-white/98 backdrop-blur-md border border-slate-200/90 shadow-2xl rounded-2xl p-3.5 w-64 animate-fade-in text-xs space-y-2.5 z-30">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="font-['DM_Sans'] font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    Legenda Peta
                  </span>
                  <button
                    onClick={() => setIsLegendOpen(false)}
                    className="p-0.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    title="Tutup Legenda"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Kategori Ikon */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Kategori Proyek
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-medium text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-md bg-[#2563EB] shrink-0"></span>
                      <span>Jalan</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-md bg-[#059669] shrink-0"></span>
                      <span>Taman</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-md bg-[#0891B2] shrink-0"></span>
                      <span>Drainase</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-md bg-[#7C3AED] shrink-0"></span>
                      <span>Fasilitas</span>
                    </div>
                  </div>
                </div>

                {/* Status Progres */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Status Progres Pin
                  </span>
                  <div className="space-y-1 text-[11px] font-medium text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                      <span>&lt; 30% (Tahap Awal)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                      <span>30% - 70% (Konstruksi)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                      <span>&gt; 70% (Finishing / Siap)</span>
                    </div>
                  </div>
                </div>

                {/* Batas Kecamatan */}
                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-0.5 bg-[#0369A1] shrink-0"></span>
                    <span>27 Kecamatan</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-0.5 bg-[#1D4ED8] ring-1 ring-blue-300 shrink-0"></span>
                    <span>Terpilih</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── FLOATING REOPEN SEARCH BUTTON (When Detail is Open) ── */}
        {isDetailPanelOpen && (
          <button
            onClick={() => setIsDetailPanelOpen(false)}
            className="absolute top-4 left-4 z-20 px-4 py-2.5 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl text-xs font-bold text-[#184C78] hover:bg-slate-50 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 animate-fade-in"
            title="Buka Kembali Panel Pencarian & Filter"
          >
            <Search className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Pencarian & Filter</span>
            <span className="bg-blue-50 text-[#2563EB] font-extrabold px-1.5 py-0.5 rounded-full text-[10px]">
              {filteredProjects.length}
            </span>
          </button>
        )}

        {/* ── FLOATING EXPAND SIDEBAR BUTTON (When Sidebar Collapsed) ── */}
        {isSidebarCollapsed && !isDetailPanelOpen && (
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="absolute top-4 left-4 z-20 px-3.5 py-2.5 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl text-xs font-bold text-[#184C78] hover:bg-slate-50 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 animate-fade-in"
            title="Buka Panel Filter Pencarian"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Filter Proyek</span>
            <span className="bg-blue-50 text-[#2563EB] font-extrabold px-1.5 py-0.5 rounded-full text-[10px]">
              {filteredProjects.length}
            </span>
          </button>
        )}

        {/* ── 1. LEFT SEARCH & FILTER SIDEBAR (ATTACHED DIRECTLY TO LEFT EDGE) ── */}
        {/* Slides cleanly on X-axis: 0 to -100% */}
        <aside
          className={`absolute top-0 left-0 bottom-0 h-full w-full sm:w-[390px] xl:w-[420px] bg-white border-r border-slate-200/90 shadow-2xl z-20 flex flex-col overflow-hidden transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
            isDetailPanelOpen || isSidebarCollapsed
              ? '-translate-x-full'
              : 'translate-x-0'
          }`}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 shrink-0 bg-white flex items-start justify-between">
            <div>
              <h1 className="font-['DM_Sans'] text-xl font-bold text-slate-900 tracking-tight">
                Cari Proyek Pembangunan
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {filteredProjects.length} proyek infrastruktur ditemukan
              </p>
            </div>
            <button
              onClick={() => setIsSidebarCollapsed(true)}
              className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Sembunyikan Panel Filter"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Segmented Status Pills */}
            <div className="mt-3.5 bg-slate-100/90 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/60">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'berjalan', label: 'Berjalan' },
                { id: 'selesai', label: 'Selesai' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatus(tab.id as any)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                    selectedStatus === tab.id
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Filters & Results List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin">
            {/* Search Input Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama proyek, lokasi, jalan..."
                className="w-full pl-9.5 pr-8 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-[#2563EB] rounded-2xl outline-none transition-all shadow-inner font-medium"
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

            {/* Kategori Proyek - 2x2 Grid with Radio */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Kategori Pembangunan
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'jalan', label: 'Jalan & Jembatan' },
                  { id: 'drainase', label: 'Drainase Air' },
                  { id: 'taman', label: 'Taman & RTH' },
                  { id: 'fasilitas', label: 'Fasilitas Umum' },
                ].map((cat) => {
                  const isCatSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(isCatSelected ? 'all' : (cat.id as any))}
                      className={`p-2.5 rounded-2xl border transition-all flex items-center gap-2 text-left cursor-pointer ${
                        isCatSelected
                          ? 'border-[#2563EB] bg-blue-50/70 text-[#184C78] shadow-xs'
                          : 'border-slate-200/90 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isCatSelected ? 'border-[#2563EB]' : 'border-slate-300'
                        }`}
                      >
                        {isCatSelected && <span className="w-2 h-2 rounded-full bg-[#2563EB]" />}
                      </span>
                      <span className="text-xs font-semibold truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kecamatan / Wilayah Dropdown */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Wilayah / Kecamatan
              </label>
              <div className="relative">
                <select
                  value={selectedKecamatan}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedKecamatan(val);
                    setSelectedDesaId('all');
                  }}
                  className="w-full appearance-none bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none cursor-pointer pr-9 focus:border-[#2563EB]"
                >
                  <option value="all">Semua Kecamatan (Kab. Lamongan • 27 Kecamatan)</option>
                  {WILAYAH_DATA.kecamatanList.map((kec) => (
                    <option key={kec.nama} value={kec.nama}>
                      {kec.nama}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Cascading Desa / Kelurahan Selector */}
            {selectedKecamatan !== 'all' && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Desa / Kelurahan
                  </label>
                  {isLoadingDesa && (
                    <span className="text-[10px] text-blue-600 font-medium flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Memuat...
                    </span>
                  )}
                </div>
                <div className="relative">
                  <select
                    value={selectedDesaId}
                    onChange={(e) => setSelectedDesaId(e.target.value)}
                    className="w-full appearance-none bg-blue-50/50 hover:bg-blue-50 border border-blue-200 rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none cursor-pointer pr-9"
                  >
                    <option value="all">Semua Desa / Kelurahan</option>
                    {desaOptions.map((desa) => (
                      <option key={desa.id} value={String(desa.id)}>
                        {desa.nama_wilayah}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Rentang Anggaran */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Alokasi Anggaran
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Miliar Rupiah</span>
              </div>

              {/* Min - Max Indicator Boxes */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-center">
                  <span className="text-[10px] text-slate-400 block font-medium">Min</span>
                  <span className="text-xs font-bold text-[#184C78]">Rp 100 Jt</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-center">
                  <span className="text-[10px] text-slate-400 block font-medium">Max</span>
                  <span className="text-xs font-bold text-[#184C78]">Rp 25 M</span>
                </div>
              </div>

              {/* Dual-Handle Range Slider Graphic */}
              <div className="relative py-2.5 px-1 mb-2">
                <div className="h-1.5 w-full bg-slate-200/80 rounded-full relative">
                  <div
                    className="absolute top-0 bottom-0 bg-[#6366F1] rounded-full"
                    style={{ left: '12%', right: '22%' }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-[3px] border-[#6366F1] shadow-md -ml-2 cursor-pointer hover:scale-115 transition-transform"
                    style={{ left: '12%' }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-[3px] border-[#6366F1] shadow-md -ml-2 cursor-pointer hover:scale-115 transition-transform"
                    style={{ left: '78%' }}
                  />
                </div>
              </div>

              {/* Budget Range Presets */}
              <div className="flex flex-wrap gap-1.5">
                {BUDGET_RANGES.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBudget(b.id)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                      selectedBudget === b.id
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Filter Chips */}
            {(selectedCategory !== 'all' || selectedKecamatan !== 'all' || selectedBudget !== 'all' || selectedStatus !== 'all' || searchQuery) && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#184C78] border border-blue-200">
                    <span>Kat: {selectedCategory}</span>
                    <button onClick={() => setSelectedCategory('all')} className="hover:text-blue-900 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedStatus !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span>Status: {selectedStatus}</span>
                    <button onClick={() => setSelectedStatus('all')} className="hover:text-emerald-950 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedKecamatan !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                    <span>{selectedKecamatan}</span>
                    <button onClick={() => { setSelectedKecamatan('all'); setSelectedDesaId('all'); }} className="hover:text-purple-950 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedDesaId !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                    <span>Desa: {desaOptions.find((d) => String(d.id) === selectedDesaId)?.nama_wilayah || selectedDesaId}</span>
                    <button onClick={() => setSelectedDesaId('all')} className="hover:text-blue-950 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedBudget !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    <span>Anggaran Filter</span>
                    <button onClick={() => setSelectedBudget('all')} className="hover:text-amber-950 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedStatus('all');
                    setSelectedKecamatan('all');
                    setSelectedDesaId('all');
                    setSelectedBudget('all');
                    setSearchQuery('');
                  }}
                  className="text-[11px] text-rose-600 font-bold hover:underline cursor-pointer ml-1"
                >
                  Reset Semua
                </button>
              </div>
            )}

            {/* Matching Projects List */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2.5">
                <span>Daftar Proyek Sesuai Filter</span>
                <span className="text-[#2563EB]">{filteredProjects.length} Proyek</span>
              </div>

              <div className="space-y-2">
                {filteredProjects.map((p) => {
                  const catConfig = getCategoryTheme(p.kategori);
                  const isFavorited = bookmarkedIds.includes(p.id);

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPin(p.id)}
                      className="group p-3 bg-white hover:bg-blue-50/40 border border-slate-200/80 hover:border-[#2563EB]/50 rounded-2xl transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                            <span
                              className="w-2 h-2 rounded-full inline-block"
                              style={{ backgroundColor: catConfig.hex }}
                            />
                            <span>{catConfig.label}</span>
                            <span>•</span>
                            <span className="text-[#2563EB]">{p.distanceStr}</span>
                          </div>
                          <h4 className="font-['DM_Sans'] text-xs font-bold text-slate-900 group-hover:text-[#184C78] line-clamp-1 transition-colors">
                            {p.nama_proyek}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {p.nama_wilayah || 'Kabupaten Lamongan'}
                          </p>
                        </div>

                        <button
                          onClick={(e) => toggleBookmark(p.id, e)}
                          className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                          title="Simpan Proyek"
                        >
                          <Heart
                            className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`}
                          />
                        </button>
                      </div>

                      {/* Progress and Budget strip */}
                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100">
                        <span className="font-bold text-[#184C78]">
                          Rp {(p.anggaran / 1000000000).toFixed(1)}M
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-[#2563EB] h-full rounded-full"
                              style={{ width: `${p.progres_persen}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-extrabold text-emerald-600">
                            {p.progres_persen}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Action (Filters + Show) */}
          <div className="p-4 border-t border-slate-100 shrink-0 bg-white flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSelectedKecamatan('all');
                setSelectedDesaId('all');
                setSelectedBudget('all');
                setSearchQuery('');
              }}
              className="py-3 px-3.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/90 text-slate-800 text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98"
              title="Reset Semua Filter"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#6366F1] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                if (filteredProjects[0]) {
                  handleSelectPin(filteredProjects[0].id);
                }
              }}
              className="flex-1 py-3 bg-[#111827] hover:bg-black text-white text-xs font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
            >
              <span>Show ({filteredProjects.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* ── 2. RIGHT DETAIL SIDEBAR (ATTACHED DIRECTLY TO RIGHT EDGE) ── */}
        {/* Slides cleanly on X-axis directly from the right: 100% to 0 */}
        <aside
          className={`absolute top-0 right-0 bottom-0 h-full w-full sm:w-[480px] xl:w-[540px] bg-white border-l border-slate-200/90 shadow-2xl z-30 flex flex-col overflow-hidden transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
            isDetailPanelOpen
              ? 'translate-x-0'
              : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 shrink-0 flex items-center justify-between bg-slate-50/70">
            <div>
              <h2 className="font-['DM_Sans'] text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                {currentProject.nama_wilayah || 'Kabupaten Lamongan'}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {nearbyProjects.length + 1} proyek infrastruktur di wilayah sekitar ini
              </p>
            </div>

            {/* Circular Close Button (Sliding Drawer back to the right) */}
            <button
              onClick={() => setIsDetailPanelOpen(false)}
              className="w-9 h-9 rounded-full bg-white hover:bg-purple-50 border-2 border-[#6366F1]/30 hover:border-[#6366F1] flex items-center justify-center text-[#6366F1] transition-all cursor-pointer shadow-xs shrink-0 hover:scale-105 active:scale-95"
              title="Tutup Detail & Buka Pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs directly in this Right Sidebar */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-4 pt-2 gap-1 overflow-x-auto scrollbar-none shrink-0">
            {[
              { id: 'ringkasan', label: 'Ringkasan' },
              { id: 'transparansi', label: 'Transparansi APBD' },
              { id: 'aduan', label: 'Aduan Warga' },
              { id: 'sekitar', label: 'Proyek Sekitar' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDetailTab(tab.id as any)}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  detailTab === tab.id
                    ? 'border-[#2563EB] text-[#2563EB] bg-white rounded-t-lg shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Ringkasan Proyek */}
          {detailTab === 'ringkasan' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 scrollbar-thin animate-fade-in">
              {/* Photo Showcase with Telemetry Tag */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative group">
                <img
                  src={centennialParkImg}
                  alt={currentProject.nama_proyek}
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>Real-time Field Telemetry</span>
                </div>
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-[#184C78] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md">
                  {currentProject.distanceStr} dari lokasi Anda
                </div>
              </div>

              {/* Title & Status */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      currentProject.status === 'selesai'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-[#184C78]'
                    }`}
                  >
                    {currentProject.status === 'berjalan' ? 'IN PROGRESS' : currentProject.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Est. {currentProject.estimasi_selesai || 'Okt 2024'}
                  </span>
                </div>

                <h3 className="font-['DM_Sans'] text-xl font-bold text-slate-900 leading-snug">
                  {currentProject.nama_proyek}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {currentProject.deskripsi}
                </p>
              </div>

              {/* Metric Boxes */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Total Anggaran
                  </span>
                  <div className="font-['DM_Sans'] text-lg font-extrabold text-[#184C78]">
                    Rp {(currentProject.anggaran / 1000000000).toFixed(1)} M
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                    APBD Kab. Lamongan
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Progres Lapangan
                  </span>
                  <div className="font-['DM_Sans'] text-lg font-extrabold text-emerald-600">
                    {currentProject.progres_persen}%
                  </div>
                  <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">
                    Sesuai Jadwal
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Realisasi Fisik Proyek</span>
                  <span className="text-[#184C78] font-bold">{currentProject.progres_persen}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                  <div
                    className="h-full bg-gradient-to-r from-[#2563EB] to-[#184C78] rounded-full transition-all duration-500"
                    style={{ width: `${currentProject.progres_persen}%` }}
                  />
                </div>
              </div>

              {/* Contractor Contact Button & Heart Bookmark */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Hotline Pengawas Proyek: +62 (322) 321-450 (Dinas Bina Marga & Cipta Karya Lamongan)`)}
                  className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>+62 (322) 321-450 • Hubungi PPK</span>
                </button>

                <button
                  onClick={(e) => toggleBookmark(currentProject.id, e)}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                    bookmarkedIds.includes(currentProject.id)
                      ? 'border-rose-200 bg-rose-50 text-rose-600'
                      : 'border-slate-200 bg-white text-slate-400 hover:text-slate-600'
                  }`}
                  title="Simpan Proyek Favorit"
                >
                  <Heart
                    className={`w-4 h-4 ${bookmarkedIds.includes(currentProject.id) ? 'fill-rose-500' : ''}`}
                  />
                </button>
              </div>

              {/* Key Milestones Timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Tahapan & Milestone Pelaksanaan
                </h4>
                <div className="space-y-2.5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {currentProject.milestones?.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 relative">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${
                          step.status === 'completed'
                            ? 'bg-emerald-500 border-white text-white'
                            : step.status === 'current'
                            ? 'bg-[#2563EB] border-white text-white shadow-xs'
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
                            ? 'bg-blue-50/70 border-blue-200 shadow-2xs'
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

              {/* Action Buttons: Tab Switcher & AI Alternative Route */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => setDetailTab('transparansi')}
                  className="w-full py-2.5 bg-[#184C78] hover:bg-[#0f3252] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Buka Transparansi APBD & Kontrak</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onOpenAIRoute(currentProject.nama_proyek)}
                  className="w-full py-2 px-3 bg-gradient-to-r from-[#6D28D9] to-[#184C78] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Cari Rute Alternatif AI untuk Proyek Ini</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Transparansi APBD & Kontrak */}
          {detailTab === 'transparansi' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin animate-fade-in text-xs">
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4">
                <h4 className="font-['DM_Sans'] text-sm font-bold text-[#184C78] mb-1">
                  Rincian Anggaran & Efisiensi LPSE
                </h4>
                <p className="text-slate-600 text-[11px] mb-3">
                  Transparansi penggunaan anggaran APBD Kabupaten Lamongan Tahun Anggaran 2024.
                </p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between py-1 border-b border-blue-100">
                    <span className="text-slate-500">Pagu Anggaran Awal</span>
                    <span className="font-bold text-slate-800">Rp {(currentProject.anggaran / 1000000000).toFixed(2)} Miliar</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-blue-100">
                    <span className="text-slate-500">Nilai Kontrak Terkoreksi</span>
                    <span className="font-bold text-[#184C78]">Rp {((currentProject.anggaran * 0.94) / 1000000000).toFixed(2)} Miliar</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-blue-100">
                    <span className="text-slate-500">Realisasi Pembayaran Tahap Ini</span>
                    <span className="font-bold text-emerald-600">
                      Rp {((currentProject.anggaran * currentProject.progres_persen / 100) / 1000000000).toFixed(2)} Miliar ({currentProject.progres_persen}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500">Efisiensi Penghematan Dana</span>
                    <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                      Hemat 6.0% (Tender Terbuka)
                    </span>
                  </div>
                </div>
              </div>

              {/* Tim Pelaksana & Kontraktor */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <h4 className="font-['DM_Sans'] text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Penyedia Jasa & Tim Teknis
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Kontraktor Pelaksana:</span>
                    <span className="font-bold text-slate-800">PT. Lamongan Sarana Konstruksi</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Konsultan Pengawas:</span>
                    <span className="font-bold text-slate-800">CV. Cipta Engineering Konsultan</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Instansi Penanggung Jawab:</span>
                    <span className="font-bold text-slate-800">Dinas PU Bina Marga Lamongan</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Nomor Kontrak LPSE:</span>
                    <span className="font-mono text-slate-700">602.1/SPK-BM/041/APBD/2024</span>
                  </div>
                </div>
              </div>

              {/* Dokumen Teknis & Perizinan */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <h4 className="font-['DM_Sans'] text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Legalitas & Sertifikasi Teknis
                </h4>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Dokumen Amdal / UKL-UPL</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Terverifikasi DLH
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Surat Perintah Mulai Kerja (SPMK)</span>
                    <span className="text-slate-800 font-semibold">02 Januari 2024</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Uji Tekan Mutu Beton / Aspal</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Lolos Lab PU
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setDetailTab('ringkasan')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Kembali ke Ringkasan Proyek
              </button>
            </div>
          )}

          {/* Tab 3: Form Aduan Warga (Lapor Langsung dari Sidebar) */}
          {detailTab === 'aduan' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin animate-fade-in text-xs">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  Laporkan kendala lapangan, keterlambatan fisik, atau gangguan akses lalu lintas pada proyek ini. Laporan Anda langsung diteruskan ke PPK dinas terkait.
                </p>
              </div>

              {reportSent ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-2 animate-fade-in">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                    <Check className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-emerald-800 text-sm">Aduan Berhasil Terkirim!</h4>
                  <p className="text-emerald-700 text-[11px]">
                    Laporan telah dicatat ke sistem dan tiket pelacakan telah diterbitkan untuk tim pengawas lapangan.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit} className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Kategori Aduan</label>
                    <select
                      value={reportCategory}
                      onChange={(e) => setReportCategory(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                    >
                      <option value="keterlambatan">Keterlambatan Pengerjaan Fisik</option>
                      <option value="kerusakan">Jalan Rusak / Kualitas Aspal Buruk</option>
                      <option value="lalu_lintas">Kemacetan / Pengalihan Rute Terganggu</option>
                      <option value="debu">Debu &amp; Dampak Lingkungan Warga</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Judul Laporan</label>
                    <input
                      type="text"
                      required
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      placeholder="Contoh: Aspal bergelombang di km 2"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Detail Keterangan</label>
                    <textarea
                      required
                      rows={4}
                      value={reportDesc}
                      onChange={(e) => setReportDesc(e.target.value)}
                      placeholder="Jelaskan kondisi riil lapangan secara singkat dan jelas..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#184C78] hover:bg-[#0f3252] text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirimkan Aduan ke Dinas</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Tab 4: Proyek Sekitar (Matches Image 2) */}
          {detailTab === 'sekitar' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 scrollbar-thin animate-fade-in">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Infrastruktur Terkait di Sekitar Wilayah
              </h4>

              <div className="space-y-3">
                {nearbyProjects.map((p) => {
                  const isFav = bookmarkedIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPin(p.id)}
                      className="p-3 bg-white hover:bg-slate-50/90 border border-slate-200/90 rounded-2xl transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col gap-2.5 group"
                    >
                      <div className="flex gap-3">
                        {/* Image Thumbnail on Left */}
                        <img
                          src={centennialParkImg}
                          alt={p.nama_proyek}
                          className="w-24 h-24 rounded-2xl object-cover shrink-0 shadow-2xs group-hover:scale-102 transition-transform"
                        />

                        {/* Content on Right */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-baseline gap-1">
                                <span className="font-['DM_Sans'] text-sm font-bold text-slate-900 group-hover:text-[#6366F1] transition-colors">
                                  Rp {(p.anggaran / 1000000000).toFixed(1)} M
                                </span>
                                <span className="text-[10px] text-slate-400 font-normal">/proyek</span>
                              </div>
                              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] shrink-0">
                                <Check className="w-2.5 h-2.5" />
                              </span>
                            </div>

                            <span className="text-[10px] text-slate-400 block mt-0.5 font-medium truncate">
                              Est: {p.estimasi_selesai || '2024'} • {p.nama_wilayah || 'Lamongan'}
                            </span>

                            <h5 className="text-xs font-semibold text-slate-800 line-clamp-1 mt-1">
                              {p.nama_proyek}
                            </h5>
                          </div>

                          {/* Specs Line with Icons */}
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
                            <span>🏷️ {p.kategori.toUpperCase()}</span>
                            <span>•</span>
                            <span>📏 {p.distanceStr}</span>
                            <span>•</span>
                            <span className="font-bold text-emerald-600">{p.progres_persen}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Black Phone Pill Button & Heart Bookmark */}
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPin(p.id);
                          }}
                          className="flex-1 py-1.5 px-3 bg-[#111827] hover:bg-black text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-98"
                        >
                          <Phone className="w-3 h-3" />
                          <span>+62 (322) 321-450</span>
                        </button>

                        <button
                          onClick={(e) => toggleBookmark(p.id, e)}
                          className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                          title="Simpan Proyek"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* ── FLOATING MAP CONTROLS (RIGHT CORNER) ── */}
        {/* Dynamically shifts left when detail drawer is open so it's always accessible! */}
        <div
          className={`absolute bottom-5 z-[1000] flex flex-col gap-2 transition-all duration-500 ${
            isDetailPanelOpen
              ? 'right-4 sm:right-[500px] xl:right-[560px]'
              : 'right-4'
          }`}
        >
          {/* Rute Alternatif AI Floating Quick Button */}
          <button
            onClick={() => onOpenAIRoute(currentProject?.nama_proyek || 'Pelebaran Jalan Veteran - Lamongan')}
            className="w-10 h-10 bg-white/95 backdrop-blur-md hover:bg-gradient-to-r hover:from-[#6D28D9] hover:to-[#184C78] hover:text-white border border-purple-200/90 rounded-2xl shadow-md flex items-center justify-center text-[#6D28D9] transition-all active:scale-95 cursor-pointer group"
            title="Input & Analisis Rute Alternatif AI"
          >
            <Sparkles className="w-4 h-4 text-amber-500 group-hover:text-amber-300 transition-colors" />
          </button>

          {/* Fokus Seluruh Wilayah Kab. Lamongan (27 Kecamatan) */}
          <button
            onClick={handleFitAllLamongan}
            className="w-10 h-10 bg-white/95 backdrop-blur-md hover:bg-[#184C78] hover:text-white border border-slate-200/90 rounded-2xl shadow-md flex items-center justify-center text-[#184C78] transition-all active:scale-95 cursor-pointer group"
            title="Tampilkan Seluruh Wilayah Kab. Lamongan (27 Kecamatan)"
          >
            <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform" />
          </button>

          {/* Toggle Satellite / Standard Layer */}
          <button
            onClick={() => setActiveLayer(activeLayer === 'standard' ? 'satellite' : 'standard')}
            className={`w-10 h-10 rounded-2xl shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer border ${
              activeLayer === 'satellite'
                ? 'bg-[#184C78] text-white border-[#184C78]'
                : 'bg-white/95 backdrop-blur-md hover:bg-white text-[#184C78] border-slate-200/90'
            }`}
            title="Ganti Layer Peta (Standard / Satelit)"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Toggle District Boundary Polygons */}
          <button
            onClick={() => setShowBoundaryPolygons(!showBoundaryPolygons)}
            className={`w-10 h-10 rounded-2xl shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer border ${
              showBoundaryPolygons
                ? 'bg-[#2563EB] text-white border-[#2563EB]'
                : 'bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 border-slate-200/90'
            }`}
            title="Tampilkan / Sembunyikan Poligon Batas Kecamatan"
          >
            <Building2 className="w-4 h-4" />
          </button>

          {/* My Location (GPS) */}
          <button
            onClick={handleCenterUserLocation}
            className="w-10 h-10 bg-white/95 backdrop-blur-md hover:bg-white border border-slate-200/90 rounded-2xl shadow-md flex items-center justify-center text-[#184C78] transition-transform active:scale-95 cursor-pointer"
            title="Pusatkan ke Lokasi Saya (GPS)"
          >
            <Navigation className="w-4 h-4 text-[#2563EB]" />
          </button>

          {/* Zoom In & Out */}
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-md flex flex-col overflow-hidden">
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
      </div>
    </div>
  );
};
