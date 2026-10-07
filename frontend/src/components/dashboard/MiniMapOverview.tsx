import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Compass, Maximize2, MapPin, Layers, ArrowRight } from 'lucide-react';
import type { ProyekItem } from '../../types';

interface MiniMapOverviewProps {
  projects: ProyekItem[];
  onOpenMapExplorer: () => void;
}

export const MiniMapOverview: React.FC<MiniMapOverviewProps> = ({
  projects,
  onOpenMapExplorer,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up if already exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center: Kabupaten Lamongan coordinates
    const defaultCenter: [number, number] = [-7.118, 112.416];
    const initialCenter =
      projects.length > 0 && projects[0].latitude && projects[0].longitude
        ? ([projects[0].latitude, projects[0].longitude] as [number, number])
        : defaultCenter;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      dragging: false,
      boxZoom: false,
    });

    mapInstanceRef.current = map;

    // OpenStreetMap tile layer (Free, public, no API key required, no watermark)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Color mapper for project categories
    const getCategoryColor = (kategori: string) => {
      switch (kategori) {
        case 'jalan':
          return '#E67E22';
        case 'taman':
          return '#27AE60';
        case 'drainase':
          return '#2980B9';
        case 'fasilitas':
          return '#8E44AD';
        default:
          return '#184C78';
      }
    };

    const validMarkers: L.LatLngExpression[] = [];

    // Add pulsing markers for each project
    projects.forEach((proj) => {
      if (!proj.latitude || !proj.longitude) return;

      const color = getCategoryColor(proj.kategori);
      const latLng: [number, number] = [proj.latitude, proj.longitude];
      validMarkers.push(latLng);

      const customIcon = L.divIcon({
        className: 'custom-minimap-marker',
        html: `
          <div style="position: relative; width: 28px; height: 28px; cursor: pointer;">
            <div style="position: absolute; inset: 0; border-radius: 9999px; background-color: ${color}; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 28px; height: 28px; border-radius: 9999px; background-color: ${color}; border: 2.5px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
              ${proj.progres_persen}%
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker(latLng, { icon: customIcon }).addTo(map);
      marker.bindTooltip(
        `<strong>${proj.nama_proyek}</strong><br/><span style="font-size:11px; color:#64748b;">${proj.progres_persen}% progres • ${proj.kategori.toUpperCase()}</span>`,
        { direction: 'top', offset: [0, -12] }
      );
    });

    // Fit bounds if markers exist
    if (validMarkers.length > 0) {
      const bounds = L.latLngBounds(validMarkers);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [projects]);

  const ongoingCount = projects.filter((p) => p.status === 'berjalan').length;
  const completedCount = projects.filter((p) => p.status === 'selesai').length;

  return (
    <div
      onClick={onOpenMapExplorer}
      className="bg-white rounded-2xl border border-[#DCE0E6] shadow-xs hover:shadow-md transition-all overflow-hidden cursor-pointer group animate-fade-in"
    >
      {/* ── CARD HEADER ── */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E9ECEF] bg-gradient-to-r from-[#F8FAFC] via-white to-[#F8FAFC]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EBF4FB] border border-[#c5def2] text-[#184C78] flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#184C78] group-hover:text-white transition-colors">
            <Compass className="w-5 h-5 transition-transform group-hover:rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-['DM_Sans'] font-extrabold text-base sm:text-lg text-[#0B2540] group-hover:text-[#184C78] transition-colors">
                Overview Sebaran Spasial Proyek (GIS)
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Map Interaktif
              </span>
            </div>
            <p className="text-xs text-[#6C757D] mt-0.5">
              {projects.length} titik proyek infrastruktur aktif terpetakan di wilayah Anda. Klik peta untuk membuka tampilan penuh.
            </p>
          </div>
        </div>

        {/* Right Stats & Expand CTA */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-[#184C78] bg-[#EBF4FB] px-3 py-1.5 rounded-xl border border-[#c5def2]">
            <Layers className="w-3.5 h-3.5 text-[#2980B9]" />
            <span>{ongoingCount} Konstruksi Berjalan</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700">{completedCount} Selesai</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenMapExplorer();
            }}
            className="px-4 py-2 bg-[#184C78] hover:bg-[#12395b] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-sm flex items-center gap-2 transition-all cursor-pointer group/btn"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Buka Peta Penuh</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-300 transition-transform group-hover/btn:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* ── MINIMAP CONTAINER ── */}
      <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-slate-100">
        {/* Leaflet map */}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Top-Left Informational Pill */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-2 text-xs text-[#184C78] font-semibold">
            <MapPin className="w-3.5 h-3.5 text-[#2980B9]" />
            <span>Klik peta untuk masuk ke Peta Spasial (GIS) Layar Penuh</span>
          </div>
        </div>

        {/* Bottom-Right Floating Action Badge */}
        <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
          <div className="bg-[#184C78]/95 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl shadow-md flex items-center gap-2 text-xs font-bold transition-transform group-hover:scale-105">
            <Compass className="w-4 h-4 text-cyan-300" />
            <span>Jelajahi Peta Spasial &rarr;</span>
          </div>
        </div>

        {/* Hover Highlight Overlay */}
        <div className="absolute inset-0 bg-[#0B2540]/10 backdrop-blur-[0.5px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="px-4 py-2 rounded-xl bg-[#184C78]/95 text-white text-xs font-bold shadow-xl flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Maximize2 className="w-4 h-4 text-cyan-300" />
            <span>Buka Peta Spasial Layar Penuh (GIS Explorer)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
