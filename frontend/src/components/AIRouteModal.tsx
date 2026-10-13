import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  X,
  Sparkles,
  Clock,
  ShieldCheck,
  Navigation,
  Layers,
  ArrowRight,
  Car,
  Bike,
  Compass,
  Play,
  RotateCcw,
  CheckCircle2,
  Globe,
  Radio,
  LocateFixed,
  AlertTriangle,
} from 'lucide-react';
import type { ProyekItem } from '../types';

interface AIRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  project?: ProyekItem | null;
}

interface RouteItem {
  id?: number;
  nama_rute: string;
  prioritas: 'utama' | 'kedua' | 'tambahan' | string;
  estimasi_jarak_km: number;
  estimasi_waktu_menit: number;
  alasan_rekomendasi: string;
  vehicle_type?: string;
  waypoints?: string[];
  coordinates?: [number, number][];
  geografis_terverifikasi?: boolean;
}



export const AIRouteModal: React.FC<AIRouteModalProps> = ({
  isOpen,
  onClose,
  projectName,
  project,
}) => {
  const [origin, setOrigin] = useState('PENS Lamongan');
  const [destination, setDestination] = useState('RS Namira Lamongan');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylinesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const simulationMarkerRef = useRef<L.Marker | null>(null);
  const simulationAnimationRef = useRef<number | null>(null);

  // Pusat koordinat proyek
  const projectCoords: [number, number] = [
    project?.latitude ? Number(project.latitude) : -7.1205,
    project?.longitude ? Number(project.longitude) : 112.4155,
  ];

  // State rute rekomendasi (diambil langsung dari backend AI & Overpass OSM)
  const [routes, setRoutes] = useState<RouteItem[]>([
    {
      nama_rute: 'Jalur Arteri Utama',
      prioritas: 'utama',
      estimasi_jarak_km: 3.5,
      estimasi_waktu_menit: 10,
      alasan_rekomendasi: 'Memuat rute alternatif dari backend...',
      vehicle_type: 'Semua Kendaraan (Mobil, Bus, Truk, Motor)',
      waypoints: [],
      coordinates: [],
      geografis_terverifikasi: false,
    },
    {
      nama_rute: 'Jalan Lingkar Luar',
      prioritas: 'kedua',
      estimasi_jarak_km: 4.8,
      estimasi_waktu_menit: 15,
      alasan_rekomendasi: 'Memuat rute sekunder dari backend...',
      vehicle_type: 'Mobil Pribadi & Angkutan Ringan',
      waypoints: [],
      coordinates: [],
      geografis_terverifikasi: false,
    },
    {
      nama_rute: 'Jalur Pintas Pemukiman',
      prioritas: 'tambahan',
      estimasi_jarak_km: 2.6,
      estimasi_waktu_menit: 7,
      alasan_rekomendasi: 'Memuat rute roda dua dari backend...',
      vehicle_type: 'Khusus Sepeda Motor & Roda Dua',
      waypoints: [],
      coordinates: [],
      geografis_terverifikasi: false,
    },
  ]);

  // Fetch / Generate Rute dari Backend AI (OpenStreetMap Grounded via Overpass API)
  // Helper pemetaan response rute backend ke RouteItem
  const mapRoutesResponse = (data: any[]): RouteItem[] => {
    return data.map((item: any, idx: number) => {
      const rawCoords = (item.koordinat_rute || item.raw_response_ai?.koordinat_rute || []) as [number, number][];
      const isVerified = Boolean(item.geografis_terverifikasi ?? item.raw_response_ai?.geografis_terverifikasi);
      const hasRealCoords = isVerified && Array.isArray(rawCoords) && rawCoords.length >= 2;

      return {
        id: item.id,
        nama_rute: item.nama_rute || `Rute Prioritas ${idx + 1}`,
        prioritas: item.prioritas || (idx === 0 ? 'utama' : idx === 1 ? 'kedua' : 'tambahan'),
        estimasi_jarak_km: Number(item.estimasi_jarak_km || 3.0),
        estimasi_waktu_menit: Number(item.estimasi_waktu_menit || 10),
        alasan_rekomendasi: item.alasan_rekomendasi || '',
        vehicle_type:
          idx === 2
            ? 'Khusus Sepeda Motor & Roda Dua'
            : idx === 1
            ? 'Mobil Pribadi & Angkutan Ringan'
            : 'Semua Kendaraan (Mobil, Bus, Truk, Motor)',
        waypoints: item.nama_rute ? item.nama_rute.split('➔').map((s: string) => s.trim()) : [],
        coordinates: hasRealCoords ? rawCoords : [],
        geografis_terverifikasi: hasRealCoords,
      };
    });
  };

  // Fetch / Generate Rute dari Backend AI (Memprioritaskan data DB/cache agar hemat panggilan AI)
  const fetchLiveRoutes = useCallback(async (forceRegenerate = false) => {
    setIsAnalyzing(true);

    try {
      const projectId = project?.id || 1;

      // 1. Coba baca rute yang sudah tersimpan di database jika tidak diminta analisis ulang
      if (!forceRegenerate) {
        try {
          const getRes = await fetch(`/api/v1/proyek/${projectId}/rute-alternatif`);
          if (getRes.ok) {
            const existingData = await getRes.json();
            if (Array.isArray(existingData) && existingData.length > 0) {
              const mapped = mapRoutesResponse(existingData);
              setRoutes(mapped);
              setIsAnalyzing(false);
              return;
            }
          }
        } catch (e) {
          console.warn('Gagal membaca rute yang sudah ada di database:', e);
        }
      }

      // 2. Panggil generate-rute jika belum ada atau saat tombol Analisis Ulang ditekan
      const res = await fetch(`/api/v1/proyek/${projectId}/generate-rute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catatan_penutupan: `Rute dari ${origin} menuju ${destination} melintasi proyek ${projectName || 'Pelebaran Jalan'}`,
        }),
      });

      if (res.ok) {
        const aiRoutesData = await res.json();
        if (Array.isArray(aiRoutesData) && aiRoutesData.length > 0) {
          const mapped = mapRoutesResponse(aiRoutesData);
          setRoutes(mapped);
          return;
        }
      }
    } catch (err) {
      console.warn('Gagal memuat rute alternatif dari backend:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [origin, destination, projectName, project?.id]);

  useEffect(() => {
    if (isOpen) {
      fetchLiveRoutes(false);
    }
  }, [isOpen, fetchLiveRoutes]);

  // Inisialisasi Peta Leaflet
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: projectCoords,
      zoom: 14,
      zoomControl: false,
      attributionControl: false, // Hilangkan atribusi default agar tidak bertumpukan dengan legend
    });

    // Zoom control diposisikan di pojok kanan bawah dengan jarak aman
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Basemap OpenStreetMap Humanitarian (HOT)
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: 'abc',
    }).addTo(map);

    const polylinesGroup = L.layerGroup().addTo(map);
    polylinesLayerGroupRef.current = polylinesGroup;
    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (simulationAnimationRef.current) {
        cancelAnimationFrame(simulationAnimationRef.current);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Render Polylines dan Marker pada Peta
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = polylinesLayerGroupRef.current;
    if (!map || !layerGroup || !isOpen) return;

    layerGroup.clearLayers();

    // 1. Zona Penutupan Proyek Fisik (Penting: Ditampilkan jelas dengan efek bahaya & pulsasi)
    const closureCircle = L.circle(projectCoords, {
      radius: 280,
      color: '#DC2626',
      fillColor: '#EF4444',
      fillOpacity: 0.28,
      weight: 3,
      dashArray: '6, 6',
    }).addTo(layerGroup);

    closureCircle.bindTooltip(
      `<div class="text-xs font-bold text-rose-700 p-1">
        🚧 Zona Penutupan Proyek Fisik (${projectName || 'Jalan Ditutup'})
      </div>`,
      { sticky: true }
    );

    const barrierIcon = L.divIcon({
      className: 'project-barrier-icon',
      html: `
        <div class="relative flex items-center justify-center w-10 h-10 -ml-5 -mt-5 cursor-pointer">
          <span class="absolute w-12 h-12 bg-rose-500/35 rounded-full animate-ping"></span>
          <div class="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-base shadow-2xl border-2 border-white ring-2 ring-rose-400">
            🚧
          </div>
          <div class="absolute -bottom-6 bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow whitespace-nowrap border border-white/20">
            JALAN DITUTUP
          </div>
        </div>
      `,
      iconSize: [0, 0],
    });
    L.marker(projectCoords, { icon: barrierIcon })
      .bindTooltip(`<div class="text-xs font-bold text-rose-800">🚧 Lokasi Proyek Konstruksi: ${projectName || 'Area Konstruksi'}</div>`)
      .addTo(layerGroup);

    // 2. Render Polylines Rute yang Terverifikasi
    const routePolylines: { index: number; polyline: L.Polyline }[] = [];

    routes.forEach((r, idx) => {
      const isSelected = idx === selectedRouteIndex;
      const hasRealCoords = Boolean(r.geografis_terverifikasi && r.coordinates && r.coordinates.length >= 2);
      if (!hasRealCoords || !r.coordinates) return;

      let color = '#059669'; // Utama: Hijau Emerald
      let dashArray: string | undefined = undefined;

      if (idx === 1) {
        color = '#2563EB'; // Kedua: Biru
        dashArray = isSelected ? undefined : '6, 8';
      } else if (idx === 2) {
        color = '#D97706'; // Tambahan: Amber/Oranye
        dashArray = isSelected ? undefined : '4, 6';
      }

      const polyline = L.polyline(r.coordinates, {
        color,
        weight: isSelected ? 7 : 4,
        opacity: isSelected ? 1.0 : 0.45,
        dashArray,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(layerGroup);

      polyline.bindTooltip(
        `<div class="p-1 font-['DM_Sans'] text-xs">
          <strong style="color: ${color}">Rute ${idx + 1}: ${r.nama_rute}</strong><br/>
          <span class="text-slate-600 font-medium">${r.estimasi_waktu_menit} menit • ${r.estimasi_jarak_km} km</span>
          <br/><span class="text-emerald-600 text-[10px] font-bold">✓ Terverifikasi Peta OSM</span>
        </div>`,
        { sticky: true }
      );

      polyline.on('click', () => {
        setSelectedRouteIndex(idx);
      });

      routePolylines.push({ index: idx, polyline });
    });

    // 3. Marker Start (A) dan Finish (B) untuk Rute Terpilih yang Terverifikasi
    const activeRoute = routes[selectedRouteIndex];
    if (activeRoute?.geografis_terverifikasi && activeRoute.coordinates && activeRoute.coordinates.length >= 2) {
      const startPt = activeRoute.coordinates[0];
      const endPt = activeRoute.coordinates[activeRoute.coordinates.length - 1];

      const originIcon = L.divIcon({
        className: 'route-origin-icon',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8 -ml-4 -mt-4 cursor-pointer">
            <div class="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-lg border-2 border-white">
              A
            </div>
            <div class="absolute -bottom-5 bg-emerald-900 text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow whitespace-nowrap">
              START
            </div>
          </div>
        `,
        iconSize: [0, 0],
      });
      L.marker(startPt, { icon: originIcon })
        .bindTooltip(`<div class="text-xs font-bold text-emerald-800">📍 Titik Awal: ${activeRoute.waypoints?.[0] || 'Awal Rute'}</div>`)
        .addTo(layerGroup);

      const destIcon = L.divIcon({
        className: 'route-dest-icon',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8 -ml-4 -mt-4 cursor-pointer">
            <div class="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-lg border-2 border-white">
              B
            </div>
            <div class="absolute -bottom-5 bg-indigo-900 text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow whitespace-nowrap">
              FINISH
            </div>
          </div>
        `,
        iconSize: [0, 0],
      });
      L.marker(endPt, { icon: destIcon })
        .bindTooltip(`<div class="text-xs font-bold text-indigo-800">🏁 Titik Akhir: ${activeRoute.waypoints?.[activeRoute.waypoints.length - 1] || 'Tujuan Rute'}</div>`)
        .addTo(layerGroup);

      // Auto-fit bounds ke rute aktif dan area proyek
      const activeEntry = routePolylines.find((p) => p.index === selectedRouteIndex);
      if (activeEntry && activeEntry.polyline.getLatLngs().length > 0) {
        activeEntry.polyline.bringToFront();
        const bounds = activeEntry.polyline.getBounds();
        bounds.extend(projectCoords);
        map.fitBounds(bounds.pad(0.14), { animate: true, duration: 0.5 });
      }
    } else {
      // Jika rute belum terverifikasi / tanpa koordinat, fokuskan peta ke lokasi proyek
      map.setView(projectCoords, 15, { animate: true });
    }
  }, [routes, selectedRouteIndex, isOpen, projectCoords, projectName]);

  // Simulasi Navigasi Animasi Kendaraan Berjalan
  const handleStartSimulation = () => {
    const map = mapInstanceRef.current;
    const layerGroup = polylinesLayerGroupRef.current;
    if (!map || !layerGroup || isSimulating) return;

    const activeRoute = routes[selectedRouteIndex];
    const coords = activeRoute?.coordinates;
    if (!coords || coords.length < 2 || !activeRoute.geografis_terverifikasi) return;

    if (simulationMarkerRef.current) {
      layerGroup.removeLayer(simulationMarkerRef.current);
    }

    const isMotor = selectedRouteIndex === 2;
    const vehicleIcon = L.divIcon({
      className: 'simulation-vehicle-marker',
      html: `
        <div class="relative flex items-center justify-center w-9 h-9 -ml-4.5 -mt-4.5">
          <span class="absolute w-9 h-9 bg-emerald-400/40 rounded-full animate-ping"></span>
          <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xl border-2 border-white">
            ${isMotor ? '🏍️' : '🚗'}
          </div>
        </div>
      `,
      iconSize: [0, 0],
    });

    const marker = L.marker(coords[0], { icon: vehicleIcon, zIndexOffset: 1000 }).addTo(layerGroup);
    simulationMarkerRef.current = marker;
    setIsSimulating(true);

    let segmentIndex = 0;
    let progress = 0;
    const stepSize = 0.05;

    const animateStep = () => {
      if (segmentIndex >= coords.length - 1) {
        setIsSimulating(false);
        return;
      }

      const p1 = coords[segmentIndex];
      const p2 = coords[segmentIndex + 1];

      const currentLat = p1[0] + (p2[0] - p1[0]) * progress;
      const currentLng = p1[1] + (p2[1] - p1[1]) * progress;

      marker.setLatLng([currentLat, currentLng]);

      progress += stepSize;
      if (progress >= 1.0) {
        progress = 0;
        segmentIndex += 1;
      }

      simulationAnimationRef.current = requestAnimationFrame(animateStep);
    };

    simulationAnimationRef.current = requestAnimationFrame(animateStep);
  };

  const handleStopSimulation = () => {
    if (simulationAnimationRef.current) {
      cancelAnimationFrame(simulationAnimationRef.current);
    }
    if (simulationMarkerRef.current && polylinesLayerGroupRef.current) {
      polylinesLayerGroupRef.current.removeLayer(simulationMarkerRef.current);
      simulationMarkerRef.current = null;
    }
    setIsSimulating(false);
  };

  const handleFocusRoute = () => {
    const map = mapInstanceRef.current;
    const activeRoute = routes[selectedRouteIndex];
    if (!map || !activeRoute?.coordinates) return;
    const latLngs = activeRoute.coordinates;
    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds.pad(0.12), { animate: true });
  };

  const handleFocusProject = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo(projectCoords, 16, { animate: true });
  };

  const handleReanalyze = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLiveRoutes(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2200] flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-6xl overflow-hidden shadow-2xl border border-slate-200 my-4 flex flex-col max-h-[92vh]">
        {/* ── HEADER ── */}
        <div className="bg-gradient-to-r from-[#5B21B6] via-[#1E40AF] to-[#0F172A] text-white p-5 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              Groq AI Route Engine
            </span>
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs">
              <Globe className="w-3.5 h-3.5 text-emerald-300" />
              OpenStreetMap Overpass Geometry
            </span>
            <span className="bg-white/10 text-white/90 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-white/15">
              Simulasi Mitigasi Rekayasa Lalu Lintas
            </span>
          </div>

          <h2 className="font-['DM_Sans'] text-xl sm:text-2xl font-bold tracking-tight">
            Visualisasi &amp; Generator Rute Alternatif Cerdas
          </h2>
          <p className="text-xs text-white/80 mt-1 max-w-2xl leading-relaxed">
            Menyajikan pengalihan arus lalu lintas terstruktur dengan pemetaan visual langsung pada jaringan jalan Kab. Lamongan untuk proyek: <strong className="text-white underline decoration-amber-400 underline-offset-2">{projectName || 'Pelebaran Jalan Konstruksi'}</strong>
          </p>
        </div>

        {/* ── MOBILE TAB SWITCHER ── */}
        <div className="lg:hidden flex border-b border-slate-200 bg-slate-50 px-4 py-2 gap-2 shrink-0">
          <button
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'map'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Peta Visual Rute</span>
          </button>
          <button
            onClick={() => setMobileTab('list')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileTab === 'list'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Daftar 3 Jalur ({routes.length})</span>
          </button>
        </div>

        {/* ── MAIN CONTENT (SPLIT VIEW) ── */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-slate-100 min-h-[460px]">
          {/* ── LEFT: LEAFLET MAP CANVAS (7 COLS) ── */}
          <div
            className={`lg:col-span-7 relative flex flex-col bg-slate-200 border-r border-slate-200 h-[380px] lg:h-full min-h-[380px] ${
              mobileTab === 'list' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Map Container */}
            <div ref={mapContainerRef} className="w-full h-full min-h-[380px] z-10" />

            {/* Overlay Banner saat Geometri Belum Terverifikasi / Tidak Tersedia */}
            {(!routes[selectedRouteIndex]?.geografis_terverifikasi ||
              !routes[selectedRouteIndex]?.coordinates ||
              routes[selectedRouteIndex]?.coordinates!.length < 2) && (
              <div className="absolute inset-x-4 top-14 z-[450] bg-amber-500/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl border border-amber-300/80 flex items-center gap-3 animate-fade-in pointer-events-auto">
                <AlertTriangle className="w-5 h-5 text-white shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-bold leading-tight">Peta Rute Tidak Tersedia</div>
                  <div className="text-[11px] text-amber-100 leading-normal mt-0.5">
                    Rute belum terverifikasi terhadap data jalan nyata OpenStreetMap sehingga geometri garis tidak digambar.
                  </div>
                </div>
              </div>
            )}

            {/* Floating Top Controls: Badge Rute Aktif */}
            <div className="absolute top-3 left-3 z-[400] flex flex-col gap-1.5 pointer-events-none">
              <div className="bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg border border-white/20 flex items-center gap-2 pointer-events-auto">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      selectedRouteIndex === 0 ? '#10B981' : selectedRouteIndex === 1 ? '#3B82F6' : '#F59E0B',
                  }}
                />
                <span>Rute Aktif: Prioritas {selectedRouteIndex + 1}</span>
                <span className="text-[11px] text-amber-300 font-mono font-semibold">
                  ({routes[selectedRouteIndex]?.estimasi_waktu_menit} mnt • {routes[selectedRouteIndex]?.estimasi_jarak_km} km)
                </span>
              </div>
            </div>

            {/* Floating Top Right: Kontrol Navigasi & Simulasi */}
            <div className="absolute top-3 right-3 z-[400] flex items-center gap-1.5">
              <button
                onClick={handleFocusRoute}
                className="px-2.5 py-1.5 bg-white/95 hover:bg-white text-slate-800 text-xs font-bold rounded-xl shadow-lg border border-slate-200 flex items-center gap-1 transition-all cursor-pointer"
                title="Fokuskan tampilan ke rute terpilih"
              >
                <LocateFixed className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Rute Penuh</span>
              </button>
              <button
                onClick={handleFocusProject}
                className="px-2.5 py-1.5 bg-white/95 hover:bg-white text-rose-700 text-xs font-bold rounded-xl shadow-lg border border-slate-200 flex items-center gap-1 transition-all cursor-pointer"
                title="Zoom langsung ke titik proyek yang ditutup"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Zona Proyek</span>
              </button>
              {!isSimulating ? (
                <button
                  onClick={handleStartSimulation}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-400"
                  title="Simulasikan pergerakan kendaraan melewati rute terpilih"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Simulasi Kendaraan</span>
                </button>
              ) : (
                <button
                  onClick={handleStopSimulation}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 transition-all cursor-pointer animate-pulse border border-rose-300"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Hentikan</span>
                </button>
              )}
            </div>

            {/* Floating Bottom: Legend Peta (Kompak di sisi kiri tanpa menabrak kontrol zoom Leaflet) */}
            <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl border border-slate-200/90 flex flex-wrap items-center gap-2.5 text-[11px] font-semibold text-slate-700 max-w-[calc(100%-80px)] pointer-events-auto">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-600 border border-white shadow-xs"></span>
                <span className="text-slate-800 font-bold">Area Ditutup</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span className="text-emerald-800 font-bold">1. Arteri Utama</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-1.5 rounded-full bg-blue-600"></span>
                <span className="text-blue-800 font-bold">2. Lingkar Bypass</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-1.5 rounded-full bg-amber-500"></span>
                <span className="text-amber-800 font-bold">3. Pintas Motor</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT: ROUTE GENERATOR FORM & 3 DETAILED CARDS (5 COLS) ── */}
          <div
            className={`lg:col-span-5 flex flex-col bg-white overflow-y-auto max-h-[60vh] lg:max-h-none ${
              mobileTab === 'map' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Input Form Pencarian Arah */}
            <form onSubmit={handleReanalyze} className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-2.5 shrink-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Titik Awal (Origin)
                  </label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="Contoh: PENS Lamongan"
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    Tujuan (Destination)
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Contoh: RS Namira Lamongan"
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15 transition-all"
                  />
                </div>
              </div>

              {/* Pilihan Cepat / Preset Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Preset:</span>
                <button
                  type="button"
                  onClick={() => {
                    setOrigin('PENS Lamongan');
                    setDestination('RS Namira Lamongan');
                  }}
                  className="px-2 py-0.5 text-[10px] font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  📍 PENS ➔ RS Namira
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrigin('Alun-Alun Lamongan');
                    setDestination('Stasiun Lamongan');
                  }}
                  className="px-2 py-0.5 text-[10px] font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  🏛️ Alun-Alun ➔ Stasiun
                </button>
                {projectName && (
                  <button
                    type="button"
                    onClick={() => {
                      setOrigin('Simpang Tikung');
                      setDestination('RS Namira Lamongan');
                    }}
                    className="px-2 py-0.5 text-[10px] font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                  >
                    🚧 Area Sekitar Proyek
                  </button>
                )}
              </div>

              {/* Status Bar & Tombol Submit */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Radio className={`w-3 h-3 ${isAnalyzing ? 'text-amber-500 animate-pulse' : 'text-emerald-500'}`} />
                  <span>
                    {isAnalyzing
                      ? 'Menghitung rute AI & geometri jalan...'
                      : routes[selectedRouteIndex]?.geografis_terverifikasi
                      ? 'Geometri Peta OSM Terverifikasi'
                      : 'Rute Alternatif Siap'}
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="px-4 py-2 bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] hover:from-[#6D28D9] hover:to-[#4338CA] text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-75 active:scale-97"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Generate Ulang Rute</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Top Progress Shimmer Bar saat menganalisis */}
            {isAnalyzing && (
              <div className="h-1 w-full bg-slate-100 overflow-hidden shrink-0">
                <div className="h-full bg-gradient-to-r from-violet-600 via-blue-500 to-emerald-400 animate-pulse w-full" />
              </div>
            )}

            {/* List 3 Alternatif Rute Terstruktur */}
            <div className="p-4 space-y-3.5 flex-1 overflow-y-auto">
              {isAnalyzing && (
                <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-2 text-xs text-indigo-900 font-semibold animate-pulse">
                  <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>Sedang memproses rute AI dan geometri jalan OpenStreetMap...</span>
                </div>
              )}

              {routes.map((r, idx) => {
                const isSelected = selectedRouteIndex === idx;
                const isUtama = idx === 0;
                const isKedua = idx === 1;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedRouteIndex(idx);
                      if (window.innerWidth < 1024) {
                        setMobileTab('map');
                      }
                    }}
                    className={`border-2 rounded-2xl p-4 transition-all cursor-pointer relative ${
                      isSelected
                        ? isUtama
                          ? 'border-emerald-500 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/20'
                          : isKedua
                          ? 'border-blue-500 bg-blue-50/70 shadow-md ring-2 ring-blue-500/20'
                          : 'border-amber-500 bg-amber-50/70 shadow-md ring-2 ring-amber-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Priority Tag & ETA */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full text-white uppercase tracking-wider flex items-center gap-1 ${
                          isUtama ? 'bg-emerald-600' : isKedua ? 'bg-blue-600' : 'bg-amber-600'
                        }`}
                      >
                        {isUtama ? <ShieldCheck className="w-3 h-3" /> : <Navigation className="w-3 h-3" />}
                        Prioritas {idx + 1}: {isUtama ? 'Rekomendasi Utama' : isKedua ? 'Jalur Lingkar' : 'Jalur Pintas'}
                      </span>

                      <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 bg-white/90 px-2 py-0.5 rounded-lg border border-slate-200">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>{r.estimasi_waktu_menit} Menit</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600">{r.estimasi_jarak_km} km</span>
                      </span>
                    </div>

                    {/* Route Title */}
                    <h4 className="text-xs font-bold text-slate-900 leading-snug flex items-start gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full mt-1 shrink-0"
                        style={{ backgroundColor: isUtama ? '#059669' : isKedua ? '#2563EB' : '#D97706' }}
                      />
                      <span>{r.nama_rute}</span>
                    </h4>

                    {/* Vehicle Eligibility Tag */}
                    <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                      <div className="flex items-center gap-1.5">
                        {idx === 2 ? <Bike className="w-3.5 h-3.5 text-amber-600 shrink-0" /> : <Car className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                        <span>{r.vehicle_type || 'Semua Kendaraan'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {r.geografis_terverifikasi ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                            Terverifikasi Peta OSM
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Waypoints Sequence Breadcrumbs */}
                    {r.waypoints && r.waypoints.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/70">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Simpang Jalur Terlewati:
                        </span>
                        <div className="flex flex-wrap items-center gap-1">
                          {r.waypoints.map((wp, wIdx) => (
                            <React.Fragment key={wIdx}>
                              <span className="bg-white text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-slate-200">
                                {wp}
                              </span>
                              {wIdx < r.waypoints!.length - 1 && (
                                <ArrowRight className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Justification */}
                    <p className="text-[11px] text-slate-600 mt-2.5 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                      💡 {r.alasan_rekomendasi}
                    </p>

                    {/* Disclaimer jika rute belum diverifikasi terhadap peta nyata */}
                    {r.geografis_terverifikasi === false && (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-1.5 text-[11px] text-amber-800 leading-tight">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>Rute ini dihasilkan AI dan belum diverifikasi terhadap peta nyata — cek kondisi lapangan sebelum digunakan</span>
                      </div>
                    )}

                    {/* Active indicator bar */}
                    {isSelected && (
                      <div className="mt-2.5 pt-1 flex items-center justify-between text-[11px] font-bold text-[#184C78]">
                        <span className="flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Rute Sedang Ditampilkan pada Peta
                        </span>
                        <span className="text-[10px] text-blue-600 underline">Fokuskan Peta ➔</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div className="p-4 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Data Peta &amp; Geometri: OpenStreetMap contributors (Overpass API) • CivicTrack Grounding Engine</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Tutup Jendela
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
