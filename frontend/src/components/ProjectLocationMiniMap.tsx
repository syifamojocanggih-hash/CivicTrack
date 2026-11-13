import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, ExternalLink, Compass, ShieldCheck } from 'lucide-react';
import type { ProyekItem } from '../types';

interface ProjectLocationMiniMapProps {
  project: ProyekItem;
  onNavigateToMap?: (project: ProyekItem) => void;
}

export const ProjectLocationMiniMap: React.FC<ProjectLocationMiniMapProps> = ({
  project,
  onNavigateToMap,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const lat = Number(project.latitude) || -7.118;
  const lng = Number(project.longitude) || 112.416;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up if already exists
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {
        console.warn('MiniMap cleanup error:', e);
      }
      mapInstanceRef.current = null;
    }

    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }
    mapContainerRef.current.innerHTML = '';

    try {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 14,
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: false,
        doubleClickZoom: true,
        touchZoom: true,
        dragging: true,
      });

      mapInstanceRef.current = map;

      // Public OpenStreetMap Tiles
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Category color logic
      const getCategoryColor = (kategori?: string) => {
        switch ((kategori || '').toLowerCase()) {
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

      const color = getCategoryColor(project.kategori);

      // Custom pulsing pin marker
      const customIcon = L.divIcon({
        className: 'custom-project-minimap-marker',
        html: `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: ${color}; opacity: 0.25; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 28px; height: 28px; border-radius: 50%; background: ${color}; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      // Radius circle for project work zone (150m buffer)
      L.circle([lat, lng], {
        radius: 160,
        color: color,
        weight: 2,
        fillColor: color,
        fillOpacity: 0.15,
        dashArray: '4, 4',
      }).addTo(map);

      // Popup
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 11px; padding: 2px;">
          <strong style="color: #184C78; display: block; font-size: 12px; margin-bottom: 2px;">${project.nama_proyek}</strong>
          <span style="color: #64748B;">${project.nama_wilayah || 'Kabupaten Lamongan'}</span>
          <div style="margin-top: 4px; font-weight: bold; color: ${color};">Progres: ${project.progres_persen}%</div>
        </div>
      `);

      // Ensure proper tile rendering inside dynamic modal container
      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    } catch (err) {
      console.warn('Gagal menginisialisasi Leaflet MiniMap:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, project.kategori, project.nama_proyek, project.nama_wilayah, project.progres_persen]);

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl overflow-hidden shadow-xs space-y-0">
      {/* MiniMap Top Telemetry Bar */}
      <div className="px-4 py-3 bg-white border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#EBF4FB] text-[#184C78] flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h5 className="font-heading text-xs font-bold text-[#184C78] flex items-center gap-1.5">
              <span>Peta Lokasi & Geotagging Lapangan</span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.2 rounded-full inline-flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" />
                Sinkron OSM
              </span>
            </h5>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              GPS: {lat.toFixed(5)}° S, {lng.toFixed(5)}° E ({project.nama_wilayah || 'Kabupaten Lamongan'})
            </p>
          </div>
        </div>

        {/* Action button to open full explorer */}
        <div className="flex items-center gap-2">
          {onNavigateToMap && (
            <button
              onClick={() => onNavigateToMap(project)}
              className="text-[11px] font-bold px-3 py-1.5 bg-[#184C78] hover:bg-[#0f3252] text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Buka proyek ini langsung di Peta Spasial Eksplorasi CivicTrack"
            >
              <Compass className="w-3 h-3" />
              <span>Buka di Peta Eksplorasi</span>
            </button>
          )}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            title="Buka titik koordinat di Google Maps"
          >
            <ExternalLink className="w-3 h-3 text-slate-500" />
            <span className="hidden sm:inline">Google Maps</span>
          </a>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative w-full h-56 sm:h-64 bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
        <div className="absolute bottom-2 left-2 z-10 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-1 rounded-md shadow-md flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-amber-400" />
          <span>Radius Pengerjaan Konstruksi ±160m</span>
        </div>
      </div>

      {/* Synchronized Location Context Strip */}
      <div className="p-3 bg-[#F1F5F9] text-xs text-slate-600 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="font-semibold text-slate-700">Titik Patok / Koridor:</span>
          <span className="text-[#184C78] font-bold">
            {project.id === 2 ? 'STA Koridor Pantura KM 42+500 (Desa Rejotengah - Deket)' : `${project.nama_wilayah || 'Kabupaten Lamongan'}`}
          </span>
        </div>
        <span className="text-[10px] text-slate-500">
          *Foto fisik & rekaman drone tersinkronisasi dengan koordinat spasial di atas
        </span>
      </div>
    </div>
  );
};

