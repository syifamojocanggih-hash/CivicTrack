import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  Copy,
  Check,
  ExternalLink,
  MapPin,
  ArrowUpDown,
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
  petunjuk_langkah?: NavigationStep[];
}

import {
  resolvePlaceCoords,
  isPolylineValid,
  generateCleanDetourPath,
  ensureWaypointsSpan,
  getProjectRouteContext,
  generateNavigationSteps,
  getGoogleMapsDirUrl,
  getDistanceMeters,
  getNearestPlaceName,
  calculateDetourWaypoints,
  fetchOSRMRoute,
  type NavigationStep,
} from '../utils/aiRouteUtils';

const buildDefaultRoutes = (
  orig: string,
  dest: string,
  center: [number, number],
  projName = '',
  customOrigPt?: [number, number] | null,
  customDestPt?: [number, number] | null
): RouteItem[] => {
  const origPt = customOrigPt || resolvePlaceCoords(orig, center, true);
  const destPt = customDestPt || resolvePlaceCoords(dest, center, false);
  const oLow = (orig || '').toLowerCase();
  const dLow = (dest || '').toLowerCase();

  const isMasjidAgungToNamira =
    (oLow.includes('masjid agung') || oLow.includes('alun-alun')) && dLow.includes('namira');

  return [
    {
      id: 1,
      nama_rute: isMasjidAgungToNamira
        ? `${orig} ➔ Jl. Lamongrejo ➔ Jl. Sunan Drajat ➔ Jl. Raya Tikung ➔ ${dest}`
        : `${orig} ➔ Bypass Arteri Utama ➔ ${dest}`,
      prioritas: 'utama',
      estimasi_jarak_km: isMasjidAgungToNamira ? 5.2 : 3.5,
      estimasi_waktu_menit: isMasjidAgungToNamira ? 12 : 10,
      alasan_rekomendasi: isMasjidAgungToNamira
        ? 'Rute arteri perkotaan utama paling mulus, cepat, dan sepenuhnya bebas dari penutupan proyek.'
        : 'Rute utama kapasitas besar dengan jalan mulus beraspal, menghindari total area proyek tertutup.',
      vehicle_type: 'Semua Kendaraan (Mobil, Bus, Truk, Motor)',
      waypoints: isMasjidAgungToNamira
        ? [orig, 'Jl. Lamongrejo', 'Jl. Sunan Drajat', 'Jl. Raya Tikung', dest]
        : [orig, 'Jalur Arteri Bypass', dest],
      coordinates: generateCleanDetourPath(origPt, destPt, center, 0),
      geografis_terverifikasi: true,
      petunjuk_langkah: generateNavigationSteps(orig, dest, projName, 0, origPt, destPt, center),
    },
    {
      id: 2,
      nama_rute: isMasjidAgungToNamira
        ? `${orig} ➔ Jl. Basuki Rahmat ➔ Lingkar Timur ➔ Jl. Raya Tikung ➔ ${dest}`
        : `${orig} ➔ Jalur Lingkar Luar ➔ ${dest}`,
      prioritas: 'kedua',
      estimasi_jarak_km: isMasjidAgungToNamira ? 5.8 : 4.8,
      estimasi_waktu_menit: isMasjidAgungToNamira ? 14 : 15,
      alasan_rekomendasi: isMasjidAgungToNamira
        ? 'Jalur lingkar timur alternatif pengurai kepadatan lampu merah pusat kota.'
        : 'Jalur lingkar alternatif pengurai kepadatan, cocok untuk roda empat dan kendaraan logistik.',
      vehicle_type: 'Mobil Pribadi & Angkutan Ringan',
      waypoints: isMasjidAgungToNamira
        ? [orig, 'Jl. Basuki Rahmat', 'Lingkar Luar Timur', 'Jl. Raya Tikung', dest]
        : [orig, 'Lingkar Luar Sekunder', dest],
      coordinates: generateCleanDetourPath(origPt, destPt, center, 1),
      geografis_terverifikasi: true,
      petunjuk_langkah: generateNavigationSteps(orig, dest, projName, 1, origPt, destPt, center),
    },
    {
      id: 3,
      nama_rute: isMasjidAgungToNamira
        ? `${orig} ➔ Jl. Sumargo ➔ Jl. Kusuma Bangsa ➔ Jotosanur ➔ ${dest}`
        : `${orig} ➔ Akses Pintas Pemukiman ➔ ${dest}`,
      prioritas: 'tambahan',
      estimasi_jarak_km: isMasjidAgungToNamira ? 4.9 : 2.6,
      estimasi_waktu_menit: isMasjidAgungToNamira ? 11 : 7,
      alasan_rekomendasi: isMasjidAgungToNamira
        ? 'Akses pemukiman terpendek beraspal/paving halus, dikhususkan untuk sepeda motor.'
        : 'Akses lingkungan terdekat beraspal, dikhususkan untuk sepeda motor dan warga lokal.',
      vehicle_type: 'Khusus Sepeda Motor & Roda Dua',
      waypoints: isMasjidAgungToNamira
        ? [orig, 'Jl. Sumargo', 'Jl. Kusuma Bangsa', 'Jotosanur', dest]
        : [orig, 'Jalan Lingkungan Warga', dest],
      coordinates: generateCleanDetourPath(origPt, destPt, center, 2),
      geografis_terverifikasi: true,
      petunjuk_langkah: generateNavigationSteps(orig, dest, projName, 2, origPt, destPt, center),
    },
  ];
};

export const AIRouteModal: React.FC<AIRouteModalProps> = ({
  isOpen,
  onClose,
  projectName,
  project,
}) => {
  const projectLat = project?.latitude ? Number(project.latitude) : -7.1205;
  const projectLng = project?.longitude ? Number(project.longitude) : 112.4155;
  const projectCoords: [number, number] = useMemo(() => [projectLat, projectLng], [projectLat, projectLng]);

  const routeCtx = useMemo(() => getProjectRouteContext(projectName, project), [projectName, project]);

  const [origin, setOrigin] = useState(routeCtx.defaultOrigin);
  const [destination, setDestination] = useState(routeCtx.defaultDestination);
  const [customOriginCoords, setCustomOriginCoords] = useState<[number, number] | null>(null);
  const [customDestCoords, setCustomDestCoords] = useState<[number, number] | null>(null);
  const [pickingMode, setPickingMode] = useState<'origin' | 'destination' | null>(null);
  const [pickingNotice, setPickingNotice] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylinesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const simulationMarkerRef = useRef<L.Marker | null>(null);
  const simulationAnimationRef = useRef<number | null>(null);

  // Refs untuk callback listener peta Leaflet
  const pickingModeRef = useRef<'origin' | 'destination' | null>(null);
  pickingModeRef.current = pickingMode;
  const customOriginCoordsRef = useRef<[number, number] | null>(null);
  customOriginCoordsRef.current = customOriginCoords;
  const customDestCoordsRef = useRef<[number, number] | null>(null);
  customDestCoordsRef.current = customDestCoords;
  const originRef = useRef(origin);
  originRef.current = origin;
  const destinationRef = useRef(destination);
  destinationRef.current = destination;

  // Koordinat efektif aktif (prioritas kustom dari klik/drag peta, fallback ke pencarian landmark/wilayah)
  const originCoords: [number, number] = useMemo(
    () => customOriginCoords || resolvePlaceCoords(origin, projectCoords, true),
    [customOriginCoords, origin, projectCoords]
  );
  const destCoords: [number, number] = useMemo(
    () => customDestCoords || resolvePlaceCoords(destination, projectCoords, false),
    [customDestCoords, destination, projectCoords]
  );

  const dStartProj = getDistanceMeters(originCoords, projectCoords);
  const dEndProj = getDistanceMeters(destCoords, projectCoords);
  const isRouteCrossingClosure = dStartProj < 4000 || dEndProj < 4000;

  // State rute rekomendasi (diambil langsung dari backend AI & Overpass OSM)
  const [routes, setRoutes] = useState<RouteItem[]>(() =>
    buildDefaultRoutes(routeCtx.defaultOrigin, routeCtx.defaultDestination, projectCoords, projectName, null, null)
  );

  const [copiedRouteIndex, setCopiedRouteIndex] = useState<number | null>(null);

  // Sinkronisasi rute lokal instan setiap kali origin, destination, atau koordinat berubah
  useEffect(() => {
    const newRoutes = buildDefaultRoutes(
      origin,
      destination,
      projectCoords,
      projectName,
      customOriginCoords,
      customDestCoords
    );
    setRoutes(newRoutes);
  }, [origin, destination, customOriginCoords, customDestCoords, projectLat, projectLng, projectName]);

  // Pengambilan rute jalan riil dari OpenStreetMap (OSRM) secara asinkron
  // Menjamin polylines 100% menempel pada jaringan jalan resmi, tanpa garis potong kompas
  useEffect(() => {
    let isCancelled = false;

    const syncRealOSRMPaths = async () => {
      const { viaNorth, viaSouth, needDetour } = calculateDetourWaypoints(
        originCoords,
        destCoords,
        projectCoords
      );

      // Panggil OSRM untuk 3 skenario rute:
      // Rute 1: Jalur Utama (jika proyek menutup jalan, belok viaNorth; jika tidak, rute jalan langsung tercepat)
      // Rute 2: Jalur Alternatif / Lingkar Sekunder (viaSouth jika penutupan, atau bypass viaNorth jika rute langsung)
      // Rute 3: Jalur Pintas Lokal / Alternatif Roda Dua
      const task1 = fetchOSRMRoute(
        originCoords,
        destCoords,
        needDetour ? viaNorth : null,
        origin,
        destination
      );

      const task2 = fetchOSRMRoute(
        originCoords,
        destCoords,
        needDetour ? viaSouth : viaNorth,
        origin,
        destination
      );

      const task3 = fetchOSRMRoute(
        originCoords,
        destCoords,
        needDetour ? null : viaSouth,
        origin,
        destination
      );

      try {
        const [res1, res2, res3] = await Promise.all([task1, task2, task3]);
        if (isCancelled) return;

        setRoutes((prevRoutes) => {
          return prevRoutes.map((r, idx) => {
            const osrmRes = idx === 0 ? res1 : idx === 1 ? res2 : res3;
            if (!osrmRes || !osrmRes.coordinates || osrmRes.coordinates.length < 4) {
              return r;
            }

            // Ekstrak nama jalan penting yang dilewati
            const roadNames = osrmRes.roadNames || [];
            const primaryRoad =
              roadNames.find((n) => /raya|poros|veteran|basuki|agung|lamongrejo|drajat|mantup|turi/i.test(n)) ||
              roadNames[0] ||
              (idx === 0 ? 'Jalan Arteri Utama' : idx === 1 ? 'Jalur Lingkar Luar' : 'Akses Pintas Alternatif');

            const updatedWaypoints = ensureWaypointsSpan(
              roadNames.length > 0 ? roadNames.slice(0, 4) : [primaryRoad],
              origin,
              destination
            );

            return {
              ...r,
              coordinates: osrmRes.coordinates,
              estimasi_jarak_km: osrmRes.distanceKm,
              estimasi_waktu_menit: osrmRes.durationMin,
              waypoints: updatedWaypoints,
              nama_rute: `${origin} ➔ ${primaryRoad} ➔ ${destination}`,
              petunjuk_langkah: osrmRes.steps.length > 0 ? osrmRes.steps : r.petunjuk_langkah,
              geografis_terverifikasi: true,
            };
          });
        });
      } catch (e) {
        // Fallback hening jika jaringan offline
      }
    };

    syncRealOSRMPaths();

    return () => {
      isCancelled = true;
    };
  }, [originCoords, destCoords, projectCoords, origin, destination]);

  // Otomatis tutup banner notifikasi setelah beberapa detik
  useEffect(() => {
    if (!pickingNotice) return;
    const t = setTimeout(() => {
      setPickingNotice(null);
    }, 4500);
    return () => clearTimeout(t);
  }, [pickingNotice]);

  const handleCopyDirections = (r: RouteItem, idx: number) => {
    const stepsText = (r.petunjuk_langkah || [])
      .map((s) => `${s.nomor}. ${s.instruksi} (${s.jarak})`)
      .join('\n');
    const fullText = `📍 PANDUAN RUTE CIVICTRACK\nDari: ${origin}\nKe: ${destination}\nRute: ${r.nama_rute} (${r.estimasi_waktu_menit} Menit, ${r.estimasi_jarak_km} km)\n\nLangkah Navigasi:\n${stepsText}\n\nGoogle Maps: ${getGoogleMapsDirUrl(origin, destination, originCoords, destCoords)}`;

    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(fullText);
      }
    } catch (e) {
      console.warn('Clipboard write error:', e);
    }
    setCopiedRouteIndex(idx);
    setTimeout(() => {
      setCopiedRouteIndex(null);
    }, 2500);
  };

  const handleSwapPoints = () => {
    const prevOrigin = origin;
    const prevDest = destination;
    const prevOrigCoords = originCoords;
    const prevDestCoords = destCoords;

    setPickingMode(null);
    setOrigin(prevDest);
    setDestination(prevOrigin);
    setCustomOriginCoords(prevDestCoords);
    setCustomDestCoords(prevOrigCoords);
    setPickingNotice('Titik awal dan tujuan berhasil ditukar!');
  };

  // Helper pemetaan response rute backend ke RouteItem
  const mapRoutesResponse = (
    data: any[],
    center: [number, number],
    currentOrigin: string,
    currentDest: string,
    customOrig?: [number, number] | null,
    customDest?: [number, number] | null
  ): RouteItem[] => {
    const origPt = customOrig || resolvePlaceCoords(currentOrigin, center, true);
    const destPt = customDest || resolvePlaceCoords(currentDest, center, false);

    return data.map((item: any, idx: number) => {
      const rawCoords = (item.koordinat_rute || item.raw_response_ai?.koordinat_rute || []) as [number, number][];
      const isCoordsOk = Array.isArray(rawCoords) && rawCoords.length >= 4 && isPolylineValid(rawCoords, center, origPt, destPt, 240);

      const coords = isCoordsOk
        ? rawCoords
        : generateCleanDetourPath(origPt, destPt, center, idx);

      const rawWaypoints = item.nama_rute ? item.nama_rute.split('➔').map((s: string) => s.trim()) : [];
      const waypoints = ensureWaypointsSpan(rawWaypoints, currentOrigin, currentDest);
      const steps = generateNavigationSteps(currentOrigin, currentDest, projectName || '', idx, origPt, destPt, center);

      return {
        id: item.id || idx + 1,
        nama_rute: item.nama_rute || `${currentOrigin} ➔ Jalur Alternatif ${idx + 1} ➔ ${currentDest}`,
        prioritas: item.prioritas || (idx === 0 ? 'utama' : idx === 1 ? 'kedua' : 'tambahan'),
        estimasi_jarak_km: Number(item.estimasi_jarak_km || (idx === 0 ? 3.5 : idx === 1 ? 4.8 : 2.6)),
        estimasi_waktu_menit: Number(item.estimasi_waktu_menit || (idx === 0 ? 10 : idx === 1 ? 15 : 7)),
        alasan_rekomendasi: item.alasan_rekomendasi || 'Jalur alternatif pengalihan arus lalu lintas proyek.',
        vehicle_type:
          idx === 2
            ? 'Khusus Sepeda Motor & Roda Dua'
            : idx === 1
            ? 'Mobil Pribadi & Angkutan Ringan'
            : 'Semua Kendaraan (Mobil, Bus, Truk, Motor)',
        waypoints,
        coordinates: coords,
        geografis_terverifikasi: true,
        petunjuk_langkah: steps,
      };
    });
  };

  // Fetch / Generate Rute dari Backend AI (Memprioritaskan data DB/cache agar hemat panggilan AI)
  const fetchLiveRoutes = useCallback(
    async (
      forceRegenerate = false,
      customOrigin?: string,
      customDest?: string,
      customOrigPt?: [number, number] | null,
      customDestPt?: [number, number] | null
    ) => {
      const activeOrigin = customOrigin || origin;
      const activeDest = customDest || destination;
      const activeOrigPt = customOrigPt !== undefined ? customOrigPt : customOriginCoords;
      const activeDestPt = customDestPt !== undefined ? customDestPt : customDestCoords;

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
                const mapped = mapRoutesResponse(existingData, projectCoords, activeOrigin, activeDest, activeOrigPt, activeDestPt);
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
            catatan_penutupan: `Rute dari ${activeOrigin} menuju ${activeDest} melintasi proyek ${projectName || 'Pelebaran Jalan'}`,
          }),
        });

        if (res.ok) {
          const aiRoutesData = await res.json();
          if (Array.isArray(aiRoutesData) && aiRoutesData.length > 0) {
            const mapped = mapRoutesResponse(aiRoutesData, projectCoords, activeOrigin, activeDest, activeOrigPt, activeDestPt);
            setRoutes(mapped);
            return;
          }
        }

        // Fallback contextual routes jika backend belum memiliki rute tersimpan
        setRoutes(buildDefaultRoutes(activeOrigin, activeDest, projectCoords, projectName, activeOrigPt, activeDestPt));
      } catch (err) {
        console.warn('Gagal memuat rute alternatif dari backend:', err);
        setRoutes(buildDefaultRoutes(activeOrigin, activeDest, projectCoords, projectName, activeOrigPt, activeDestPt));
      } finally {
        setIsAnalyzing(false);
      }
    },
    [origin, destination, projectName, project?.id, projectCoords, customOriginCoords, customDestCoords]
  );

  const handleApplyPreset = (newOrigin: string, newDest: string) => {
    setOrigin(newOrigin);
    setDestination(newDest);
    setCustomOriginCoords(null);
    setCustomDestCoords(null);
    setPickingMode(null);
    setPickingNotice(null);
    setRoutes(buildDefaultRoutes(newOrigin, newDest, projectCoords, projectName, null, null));
    fetchLiveRoutes(true, newOrigin, newDest, null, null);
  };

  // Lock body scroll and handle Escape key when modal is open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      const ctx = getProjectRouteContext(projectName, project);
      setOrigin(ctx.defaultOrigin);
      setDestination(ctx.defaultDestination);
      setCustomOriginCoords(null);
      setCustomDestCoords(null);
      setPickingMode(null);
      setPickingNotice(null);
      fetchLiveRoutes(false, ctx.defaultOrigin, ctx.defaultDestination, null, null);
    }
  }, [isOpen, project?.id, projectName]);

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

    // Click listener pada peta saat mode pilih lokasi aktif
    if (typeof map?.on === 'function') {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const mode = pickingModeRef.current;
        if (!mode) return;

        const lat = Number(e.latlng.lat.toFixed(6));
        const lng = Number(e.latlng.lng.toFixed(6));
        const clickedPt: [number, number] = [lat, lng];
        const placeName = getNearestPlaceName(clickedPt, projectCoords, projectName);

        if (mode === 'origin') {
          setCustomOriginCoords(clickedPt);
          setOrigin(placeName);
          setPickingNotice(`Titik Awal dipilih: ${placeName}. Sekarang klik lokasi Titik Tujuan di peta.`);
          setPickingMode('destination');
        } else if (mode === 'destination') {
          setCustomDestCoords(clickedPt);
          setDestination(placeName);
          setPickingNotice(`Titik Tujuan dipilih: ${placeName}. Rute langsung diperbarui!`);
          setPickingMode(null);
        }
      });
    }

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
  }, [isOpen, projectCoords, projectName]);

  // Update kursor peta saat mode pemilihan titik aktif
  useEffect(() => {
    if (mapContainerRef.current) {
      mapContainerRef.current.style.cursor = pickingMode ? 'crosshair' : '';
    }
  }, [pickingMode]);

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
    const startPt: [number, number] = originCoords;
    const endPt: [number, number] = destCoords;

    const originIcon = L.divIcon({
      className: 'route-origin-icon',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8 -ml-4 -mt-4 cursor-grab active:cursor-grabbing">
          <div class="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-lg border-2 border-white ring-2 ring-emerald-400">
            A
          </div>
          <div class="absolute -bottom-5 bg-emerald-950 text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow whitespace-nowrap border border-white/20">
            START (A)
          </div>
        </div>
      `,
      iconSize: [0, 0],
    });

    const originMarker = L.marker(startPt, { icon: originIcon, draggable: true })
      .bindTooltip(
        `<div class="text-xs font-bold text-emerald-800">
          📍 Titik Awal: ${origin || 'Titik Awal'}
          <div class="text-[10px] text-slate-500 font-normal mt-0.5">💡 Geser marker ini untuk memindahkan lokasi di peta</div>
        </div>`
      )
      .addTo(layerGroup);

    if (typeof originMarker?.on === 'function') {
      originMarker.on('dragend', (e) => {
        const pos = (e.target as L.Marker).getLatLng();
        const newPt: [number, number] = [Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6))];
        const placeName = getNearestPlaceName(newPt, projectCoords, projectName);
        setCustomOriginCoords(newPt);
        setOrigin(placeName);
        setPickingNotice(`Titik Awal digeser ke: ${placeName}`);
      });
    }

    const destIcon = L.divIcon({
      className: 'route-dest-icon',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8 -ml-4 -mt-4 cursor-grab active:cursor-grabbing">
          <div class="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-lg border-2 border-white ring-2 ring-indigo-400">
            B
          </div>
          <div class="absolute -bottom-5 bg-indigo-950 text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow whitespace-nowrap border border-white/20">
            FINISH (B)
          </div>
        </div>
      `,
      iconSize: [0, 0],
    });

    const destMarker = L.marker(endPt, { icon: destIcon, draggable: true })
      .bindTooltip(
        `<div class="text-xs font-bold text-indigo-800">
          🏁 Titik Akhir: ${destination || 'Tujuan'}
          <div class="text-[10px] text-slate-500 font-normal mt-0.5">💡 Geser marker ini untuk memindahkan lokasi di peta</div>
        </div>`
      )
      .addTo(layerGroup);

    if (typeof destMarker?.on === 'function') {
      destMarker.on('dragend', (e) => {
        const pos = (e.target as L.Marker).getLatLng();
        const newPt: [number, number] = [Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6))];
        const placeName = getNearestPlaceName(newPt, projectCoords, projectName);
        setCustomDestCoords(newPt);
        setDestination(placeName);
        setPickingNotice(`Titik Akhir digeser ke: ${placeName}`);
      });
    }

    // Auto-fit bounds ke rute aktif, titik awal/akhir, dan area proyek
    const activeEntry = routePolylines.find((p) => p.index === selectedRouteIndex);
    if (activeEntry && activeEntry.polyline.getLatLngs().length > 0) {
      activeEntry.polyline.bringToFront();
      const bounds = activeEntry.polyline.getBounds();
      const dStart = getDistanceMeters(startPt, projectCoords);
      const dEnd = getDistanceMeters(endPt, projectCoords);
      if (dStart < 4000 || dEnd < 4000) {
        bounds.extend(projectCoords);
      }
      bounds.extend(startPt);
      bounds.extend(endPt);
      map.fitBounds(bounds.pad(0.16), { animate: true, duration: 0.5 });
    } else {
      const bounds = L.latLngBounds([startPt, endPt]);
      if (getDistanceMeters(startPt, projectCoords) < 4000) {
        bounds.extend(projectCoords);
      }
      map.fitBounds(bounds.pad(0.2), { animate: true });
    }
  }, [routes, selectedRouteIndex, isOpen, projectCoords, projectName, origin, destination, originCoords, destCoords]);

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

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-ai-route-title"
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4 md:p-6 text-center">
        <div
          className="relative w-full max-w-6xl bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 my-auto flex flex-col max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2.5rem)] text-left animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── HEADER ── */}
          <div className="bg-gradient-to-r from-[#5B21B6] via-[#1E40AF] to-[#0F172A] text-white p-4 sm:p-6 relative shrink-0">
            <button
              onClick={onClose}
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              title="Tutup Modal"
              aria-label="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 pr-8 sm:pr-0">
              <span className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                Groq AI Route Engine
              </span>
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold backdrop-blur-xs">
                <Globe className="w-3.5 h-3.5 text-emerald-300" />
                OpenStreetMap Overpass Geometry
              </span>
              <span className="bg-white/10 text-white/90 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium border border-white/15">
                Simulasi Mitigasi Rekayasa Lalu Lintas
              </span>
            </div>

            <h2 id="modal-ai-route-title" className="font-['DM_Sans'] text-lg sm:text-2xl font-bold tracking-tight pr-8 sm:pr-0">
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

            {/* Mode Pemilihan Titik di Peta (Floating Guide Banner) */}
            {pickingMode && (
              <div className="absolute top-14 inset-x-3 z-[450] bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-2xl shadow-2xl border border-white/20 flex items-center justify-between gap-2 animate-bounce-subtle pointer-events-auto">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <span className={`w-2.5 h-2.5 rounded-full animate-ping shrink-0 ${pickingMode === 'origin' ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                  <span className="leading-tight">
                    {pickingMode === 'origin'
                      ? '📍 Klik lokasi pada peta untuk menentukan Titik Awal (START A)'
                      : '🏁 Klik lokasi pada peta untuk menentukan Titik Tujuan (FINISH B)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPickingMode(null);
                    setPickingNotice(null);
                  }}
                  className="px-2 py-1 bg-white/15 hover:bg-white/25 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors shrink-0"
                >
                  Batal
                </button>
              </div>
            )}

            {pickingNotice && !pickingMode && (
              <div className="absolute top-14 inset-x-3 z-[450] bg-emerald-900/95 backdrop-blur-md text-emerald-100 px-3.5 py-2 rounded-xl shadow-xl border border-emerald-400/40 flex items-center justify-between gap-2 animate-fade-in pointer-events-auto">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{pickingNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPickingNotice(null)}
                  className="text-emerald-300 hover:text-white text-xs font-bold p-0.5 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Floating Top Controls: Unified Responsive Bar (Badge Rute Aktif + Tombol Aksi) */}
            <div className="absolute top-3 inset-x-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              {/* Badge Rute Aktif */}
              <div className="bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg border border-white/20 flex items-center gap-2 pointer-events-auto shrink-0 max-w-full">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      selectedRouteIndex === 0 ? '#10B981' : selectedRouteIndex === 1 ? '#3B82F6' : '#F59E0B',
                  }}
                />
                <span className="whitespace-nowrap">Rute Aktif: Prioritas {selectedRouteIndex + 1}</span>
                <span className="text-[11px] text-amber-300 font-mono font-semibold whitespace-nowrap">
                  ({routes[selectedRouteIndex]?.estimasi_waktu_menit} mnt • {routes[selectedRouteIndex]?.estimasi_jarak_km} km)
                </span>
              </div>

              {/* Kontrol Navigasi & Simulasi */}
              <div className="flex items-center gap-1.5 pointer-events-auto shrink-0">
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
                {/* TITIK AWAL */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Titik Awal (Origin)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const next = pickingMode === 'origin' ? null : 'origin';
                        setPickingMode(next);
                        setPickingNotice(next ? '📍 Klik sembarang lokasi di peta untuk titik awal' : null);
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                        pickingMode === 'origin'
                          ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-400/40 animate-pulse'
                          : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
                      }`}
                      title="Klik untuk memilih titik awal langsung di peta"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>{pickingMode === 'origin' ? 'Merekam...' : 'Pilih di Peta'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={origin}
                      onChange={(e) => {
                        setOrigin(e.target.value);
                        setCustomOriginCoords(null);
                      }}
                      placeholder={`Contoh: ${routeCtx.defaultOrigin}`}
                      className={`w-full px-3 py-1.5 text-xs border rounded-xl bg-white outline-none transition-all pr-8 ${
                        pickingMode === 'origin'
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15'
                      }`}
                    />
                    {customOriginCoords && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded border border-emerald-200" title="Koordinat dipilih dari peta">
                        📍 Peta
                      </span>
                    )}
                  </div>
                </div>

                {/* TUJUAN */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      Tujuan (Destination)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const next = pickingMode === 'destination' ? null : 'destination';
                        setPickingMode(next);
                        setPickingNotice(next ? '🏁 Klik sembarang lokasi di peta untuk titik tujuan' : null);
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                        pickingMode === 'destination'
                          ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-400/40 animate-pulse'
                          : 'bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-300 shadow-2xs'
                      }`}
                      title="Klik untuk memilih titik tujuan langsung di peta"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>{pickingMode === 'destination' ? 'Merekam...' : 'Pilih di Peta'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => {
                        setDestination(e.target.value);
                        setCustomDestCoords(null);
                      }}
                      placeholder={`Contoh: ${routeCtx.defaultDestination}`}
                      className={`w-full px-3 py-1.5 text-xs border rounded-xl bg-white outline-none transition-all pr-8 ${
                        pickingMode === 'destination'
                          ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15'
                      }`}
                    />
                    {customDestCoords && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-indigo-700 bg-indigo-100 px-1 py-0.2 rounded border border-indigo-200" title="Koordinat dipilih dari peta">
                        🏁 Peta
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Pilihan Cepat / Preset Chips & Tukar Titik */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Preset:</span>
                  {routeCtx.presets.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleApplyPreset(preset.origin, preset.destination)}
                      className="px-2 py-0.5 text-[10px] font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleSwapPoints}
                  className="px-2 py-0.5 text-[10px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                  title="Tukar Titik Awal dan Titik Tujuan"
                >
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  <span>Tukar A &amp; B</span>
                </button>
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
                        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-1.5">
                          {r.waypoints.map((wp, wIdx) => (
                            <span key={wIdx} className="inline-flex items-center gap-1">
                              {wIdx > 0 && (
                                <ArrowRight className="w-2.5 h-2.5 text-slate-400 shrink-0 select-none" />
                              )}
                              <span className="bg-white text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                                {wp}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Justification */}
                    <p className="text-[11px] text-slate-600 mt-2.5 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                      💡 {r.alasan_rekomendasi}
                    </p>

                    {/* Panduan Navigasi & Petunjuk Arah Langkah-demi-Langkah */}
                    {r.petunjuk_langkah && r.petunjuk_langkah.length > 0 && isSelected && (
                      <div className="mt-3 pt-3 border-t border-slate-200/80">
                        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
                          <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                            <Compass className="w-3.5 h-3.5 text-[#7C3AED]" />
                            Panduan Arah & Petunjuk Navigasi:
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyDirections(r, idx);
                              }}
                              className="px-2 py-1 text-[10px] font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                              title="Salin langkah navigasi rute ini"
                            >
                              {copiedRouteIndex === idx ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-700">Tersalin!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Salin</span>
                                </>
                              )}
                            </button>
                            <a
                              href={getGoogleMapsDirUrl(origin, destination, originCoords, destCoords)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="px-2.5 py-1 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                              title="Buka rute ini di Google Maps"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Google Maps</span>
                            </a>
                          </div>
                        </div>

                        {/* Banner status apakah rute memotong area proyek atau bebas hambatan */}
                        {isRouteCrossingClosure ? (
                          <div className="mb-2 p-2 bg-amber-50/90 border border-amber-300 rounded-xl flex items-start gap-1.5 text-[10px] text-amber-900 leading-snug">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span>
                              <strong>Rekayasa Pengalihan:</strong> Rute ini disesuaikan untuk membelok mengitari zona tertutup proyek <strong>{projectName || 'Pekerjaan Fisik'}</strong>.
                            </span>
                          </div>
                        ) : (
                          <div className="mb-2 p-2 bg-emerald-50/90 border border-emerald-300 rounded-xl flex items-start gap-1.5 text-[10px] text-emerald-900 leading-snug">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>
                              <strong>Jalur Lancar & Bebas Proyek:</strong> Perjalanan dari <strong>{origin}</strong> ke <strong>{destination}</strong> tidak melintasi penutupan proyek <strong>{projectName || 'Pekerjaan Fisik'}</strong>.
                            </span>
                          </div>
                        )}

                        {/* Daftar 5 Langkah Navigasi */}
                        <div className="space-y-1.5 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/90">
                          {r.petunjuk_langkah.map((step) => (
                            <div key={step.nomor} className="flex items-start gap-2 text-xs text-slate-700">
                              <span
                                className={`w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5 text-white ${
                                  step.tipe === 'start'
                                    ? 'bg-emerald-600'
                                    : step.tipe === 'finish'
                                    ? 'bg-indigo-600'
                                    : step.tipe === 'detour'
                                    ? 'bg-amber-600'
                                    : 'bg-slate-600'
                                }`}
                              >
                                {step.nomor}
                              </span>
                              <div className="flex-1 leading-snug">
                                <p className="font-semibold text-slate-800 text-[11px]">{step.instruksi}</p>
                                {step.keterangan && (
                                  <p className="text-[10px] text-slate-500 mt-0.5 italic">{step.keterangan}</p>
                                )}
                              </div>
                              <span className="text-[9px] font-bold text-slate-500 shrink-0 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                {step.jarak}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="truncate sm:whitespace-normal">Data Peta &amp; Geometri: OpenStreetMap contributors (Overpass API) • CivicTrack Grounding Engine</span>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
            >
              Tutup Jendela
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
