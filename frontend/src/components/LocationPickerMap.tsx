import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Crosshair, Sparkles } from 'lucide-react';

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  onChange: (coords: { lat: number; lng: number }) => void;
  kategori?: string;
  wilayahName?: string;
  desaName?: string;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  latitude,
  longitude,
  onChange,
  kategori = 'jalan',
  wilayahName = 'Kabupaten Lamongan',
  desaName,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  // Normalize lat & lng
  const currentLat = !isNaN(Number(latitude)) && Number(latitude) !== 0 ? Number(latitude) : -7.1197;
  const currentLng = !isNaN(Number(longitude)) && Number(longitude) !== 0 ? Number(longitude) : 112.4150;

  // Category theme color
  const getMarkerColor = useCallback(() => {
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
        return '#E74C3C';
    }
  }, [kategori]);

  // Create custom pulsing DivIcon
  const createPinIcon = useCallback(() => {
    const color = getMarkerColor();
    return L.divIcon({
      className: 'custom-location-picker-marker',
      html: `
        <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: grab;">
          <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: ${color}; opacity: 0.3; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 30px; height: 30px; border-radius: 50%; background: ${color}; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });
  }, [getMarkerColor]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up if already exists
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {
        console.warn('Map cleanup error:', e);
      }
      mapInstanceRef.current = null;
    }

    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }
    mapContainerRef.current.innerHTML = '';

    try {
      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: 14,
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: false, // Prevent modal scrolling interference
        doubleClickZoom: true,
        touchZoom: true,
        dragging: true,
      });

      mapInstanceRef.current = map;

      // Public OpenStreetMap Layer
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Draggable Marker
      const marker = L.marker([currentLat, currentLng], {
        icon: createPinIcon(),
        draggable: true,
      }).addTo(map);

      markerRef.current = marker;

      // Circle buffer indicating active project zone
      if (typeof L.circle === 'function') {
        const circle = L.circle([currentLat, currentLng], {
          radius: 120,
          color: getMarkerColor(),
          weight: 2,
          fillColor: getMarkerColor(),
          fillOpacity: 0.15,
          dashArray: '4, 4',
        }).addTo(map);

        circleRef.current = circle;
      }

      // Popup
      if (typeof marker.bindPopup === 'function') {
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 11px; padding: 2px;">
            <strong style="color: #184C78; display: block; font-size: 12px; margin-bottom: 2px;">Titik Lokasi Proyek</strong>
            <span style="color: #64748B;">Lintang: ${currentLat.toFixed(6)}, Bujur: ${currentLng.toFixed(6)}</span>
            <div style="margin-top: 4px; font-size: 10px; color: #E67E22; font-weight: 600;">Geser pin atau klik di peta untuk mengubah lokasi</div>
          </div>
        `);
      }

      // ── CLICK LISTENER ON MAP ──
      if (typeof map.on === 'function') {
        map.on('click', (e: L.LeafletMouseEvent) => {
          const newLat = Number(e.latlng.lat.toFixed(6));
          const newLng = Number(e.latlng.lng.toFixed(6));

          if (typeof marker.setLatLng === 'function') {
            marker.setLatLng([newLat, newLng]);
          }
          if (circleRef.current && typeof circleRef.current.setLatLng === 'function') {
            circleRef.current.setLatLng([newLat, newLng]);
          }
          if (typeof map.panTo === 'function') {
            map.panTo([newLat, newLng], { animate: true });
          }

          onChange({ lat: newLat, lng: newLng });
          setGeoNotice(`Lokasi berhasil dipilih dari peta: ${newLat.toFixed(5)}, ${newLng.toFixed(5)}`);
          setTimeout(() => setGeoNotice(null), 3500);
        });
      }

      // ── DRAGEND LISTENER ON MARKER ──
      if (typeof marker.on === 'function') {
        marker.on('dragend', () => {
          if (typeof marker.getLatLng !== 'function') return;
          const pos = marker.getLatLng();
          const newLat = Number(pos.lat.toFixed(6));
          const newLng = Number(pos.lng.toFixed(6));

          if (circleRef.current && typeof circleRef.current.setLatLng === 'function') {
            circleRef.current.setLatLng([newLat, newLng]);
          }
          onChange({ lat: newLat, lng: newLng });
          setGeoNotice(`Pin digeser ke titik: ${newLat.toFixed(5)}, ${newLng.toFixed(5)}`);
          setTimeout(() => setGeoNotice(null), 3500);
        });
      }

      // Recalculate dimensions inside modal
      setTimeout(() => {
        if (typeof map.invalidateSize === 'function') {
          map.invalidateSize();
        }
      }, 150);
    } catch (err) {
      console.warn('Gagal memuat Leaflet LocationPickerMap:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
    };
  }, []); // Run once on mount

  // Synchronize map & marker when external coordinates change (e.g. from dropdown or manual typing)
  useEffect(() => {
    if (!markerRef.current || !mapInstanceRef.current) return;
    if (typeof markerRef.current.getLatLng !== 'function') return;

    const markerPos = markerRef.current.getLatLng();
    const latDiff = Math.abs(markerPos.lat - currentLat);
    const lngDiff = Math.abs(markerPos.lng - currentLng);

    // Only update if coordinates shifted significantly (> 0.00001)
    if (latDiff > 0.00001 || lngDiff > 0.00001) {
      if (typeof markerRef.current.setLatLng === 'function') {
        markerRef.current.setLatLng([currentLat, currentLng]);
      }
      if (circleRef.current && typeof circleRef.current.setLatLng === 'function') {
        circleRef.current.setLatLng([currentLat, currentLng]);
      }
      if (typeof mapInstanceRef.current.panTo === 'function') {
        mapInstanceRef.current.panTo([currentLat, currentLng], { animate: true });
      }
    }
  }, [currentLat, currentLng]);

  // Center to current marker
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([currentLat, currentLng], 15, { animate: true });
    }
  };

  // Browser Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung geolokasi GPS.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        onChange({ lat, lng });

        if (markerRef.current && circleRef.current && mapInstanceRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          circleRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.setView([lat, lng], 15, { animate: true });
        }
        setGeoNotice(`Lokasi GPS Anda terdeteksi: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        setTimeout(() => setGeoNotice(null), 3500);
      },
      (err) => {
        console.warn('GPS Geolocation error:', err);
        alert('Gagal mengambil titik GPS. Pastikan izin lokasi diizinkan pada peramban Anda.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2">
      {/* Top Helper Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#F8FAFC] border border-[#CBD5E1] p-2.5 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#E67E22] flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#184C78] block">
              Pilih Titik Lokasi Langsung di Peta
            </span>
            <span className="text-[11px] text-slate-500">
              Klik pada peta atau geser pin ke titik proyek. Wilayah &amp; desa akan terisi otomatis.
            </span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleRecenter}
            className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
            title="Pusatkan peta ke titik koordinat terpilih"
          >
            <Crosshair className="w-3 h-3 text-[#184C78]" />
            <span>Pusatkan</span>
          </button>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="px-2.5 py-1 text-[11px] font-semibold text-[#184C78] bg-[#EBF4FB] hover:bg-[#dbebf8] border border-[#c5def2] rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
            title="Gunakan titik koordinat GPS perangkat Anda saat ini"
          >
            <Navigation className="w-3 h-3" />
            <span>GPS Saya</span>
          </button>
        </div>
      </div>

      {/* Interactive Map Container */}
      <div className="relative w-full h-56 sm:h-64 bg-slate-100 rounded-xl overflow-hidden border border-[#DCE0E6] shadow-2xs">
        <div ref={mapContainerRef} className="w-full h-full z-0 cursor-crosshair" />

        {/* Floating Instruction Overlay */}
        <div className="absolute top-2 left-2 z-10 bg-black/70 backdrop-blur-xs text-white text-[10px] font-medium px-2.5 py-1 rounded-md shadow-md flex items-center gap-1.5 pointer-events-none">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Klik sembarang titik di peta untuk memindahkan pin</span>
        </div>

        {/* Live Coordinate & Detected Wilayah Tag */}
        <div className="absolute bottom-2 left-2 right-2 sm:right-auto z-10 bg-white/95 backdrop-blur-xs text-slate-800 text-[10px] font-medium px-2.5 py-1.5 rounded-lg shadow-md border border-slate-200 pointer-events-none flex flex-wrap items-center gap-1.5">
          <span className="font-mono font-bold text-[#184C78]">
            📍 {currentLat.toFixed(5)}°, {currentLng.toFixed(5)}°
          </span>
          {wilayahName && (
            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>{wilayahName}{desaName ? ` • ${desaName}` : ''}</span>
            </span>
          )}
        </div>
      </div>

      {/* Temporary Success Toast / Notice */}
      {geoNotice && (
        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] flex items-center gap-1.5 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{geoNotice}</span>
        </div>
      )}
    </div>
  );
};
