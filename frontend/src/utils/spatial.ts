import { WILAYAH_DATA } from '../data/geoWilayahData';

/**
 * Algoritma Ray Casting (Crossing Number) untuk memvalidasi Point-in-Polygon (PIP)
 * Mengecek apakah koordinat [lat, lng] berada di dalam rangkaian batas poligon [[lat, lng], ...].
 */
export function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [lat, lng] = point;
  const n = polygon.length;
  if (n < 3) return false;

  // Bounding box pre-check untuk efisiensi instan
  let minLat = polygon[0][0];
  let maxLat = polygon[0][0];
  let minLng = polygon[0][1];
  let maxLng = polygon[0][1];

  for (let i = 1; i < n; i++) {
    const [pLat, pLng] = polygon[i];
    if (pLat < minLat) minLat = pLat;
    if (pLat > maxLat) maxLat = pLat;
    if (pLng < minLng) minLng = pLng;
    if (pLng > maxLng) maxLng = pLng;
  }

  if (lat < minLat || lat > maxLat || lng < minLng || lng > maxLng) {
    return false;
  }

  let inside = false;
  let p1 = polygon[0];

  for (let i = 1; i <= n; i++) {
    const p2 = polygon[i % n];
    const [p1Lat, p1Lng] = p1;
    const [p2Lat, p2Lng] = p2;

    if ((p1Lat > lat) !== (p2Lat > lat)) {
      if (p2Lat !== p1Lat) {
        const lngInters = ((p2Lng - p1Lng) * (lat - p1Lat)) / (p2Lat - p1Lat) + p1Lng;
        if (lng <= lngInters) {
          inside = !inside;
        }
      }
    }
    p1 = p2;
  }

  return inside;
}

export interface SpatialValidationResult {
  isValid: boolean;
  message: string;
  matchedKecamatan?: string;
  centerCoordinates?: [number, number];
}

/**
 * Validasi Point-in-Polygon koordinat proyek terhadap wilayah kecamatan yang dipilih
 */
export function validateCoordinatesInKecamatan(
  latitude: number,
  longitude: number,
  namaWilayahOrKecamatan: string
): SpatialValidationResult {
  // Cari kecamatan yang sesuai dari WILAYAH_DATA
  const cleanQuery = namaWilayahOrKecamatan.toLowerCase().replace(/kecamatan|kec\.|kabupaten|kab\./g, '').trim();

  const matched = WILAYAH_DATA.kecamatanList.find((k) =>
    k.nama.toLowerCase().includes(cleanQuery) ||
    cleanQuery.includes(k.nama.toLowerCase().replace(/kecamatan|kec\./g, '').trim())
  );

  if (!matched) {
    // Jika kecamatan tidak terdaftar di daftar kecamatan khusus, fallback ke toleransi umum daerah
    return {
      isValid: true,
      message: 'Wilayah umum tanpa poligon khusus (Pemeriksaan diteruskan ke server).',
    };
  }

  const isInside = isPointInPolygon([latitude, longitude], matched.polygon);

  if (isInside) {
    return {
      isValid: true,
      message: `Koordinat valid berada di dalam batas wilayah ${matched.nama}.`,
      matchedKecamatan: matched.nama,
      centerCoordinates: matched.koordinatPusat,
    };
  } else {
    return {
      isValid: false,
      message: `Koordinat (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) berada di luar batas poligon ${matched.nama}. Titik lokasi harus berada di dalam wilayah terdaftar.`,
      matchedKecamatan: matched.nama,
      centerCoordinates: matched.koordinatPusat,
    };
  }
}
