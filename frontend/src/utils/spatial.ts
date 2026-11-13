import { WILAYAH_DATA, LAMONGAN_DESA_GEOJSON } from '../data/geoWilayahData';

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

export interface DetectedWilayah {
  kecamatan: string;
  desa: string | null;
  desaId: number | null;
  confidence: 'polygon_exact' | 'nearest_center';
}

/**
 * Mencari kecamatan dan desa/kelurahan di Kabupaten Lamongan berdasarkan koordinat [lat, lng].
 * Mendeteksi poligon batas kecamatan (PIP) atau kedekatan pusat geografis,
 * dan mencocokkan desa terdekat dari basis data GeoJSON resmi Lamongan.
 */
export function findWilayahByCoordinates(latitude: number, longitude: number): DetectedWilayah {
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    isNaN(latitude) ||
    isNaN(longitude) ||
    (latitude === 0 && longitude === 0)
  ) {
    return {
      kecamatan: 'Kecamatan Lamongan (Kota)',
      desa: null,
      desaId: null,
      confidence: 'nearest_center',
    };
  }

  // 1. Coba pencocokan tepat poligon kecamatan
  let matchedKec = WILAYAH_DATA.kecamatanList.find(
    (k) => Array.isArray(k.polygon) && k.polygon.length >= 3 && isPointInPolygon([latitude, longitude], k.polygon)
  );

  let confidence: 'polygon_exact' | 'nearest_center' = 'polygon_exact';

  // 2. Jika tidak di dalam poligon spesifik, cari kecamatan dengan koordinat pusat terdekat
  if (!matchedKec) {
    confidence = 'nearest_center';
    let minKecDist = Infinity;
    for (const k of WILAYAH_DATA.kecamatanList) {
      if (Array.isArray(k.koordinatPusat) && k.koordinatPusat.length === 2) {
        const dist = Math.hypot(latitude - k.koordinatPusat[0], longitude - k.koordinatPusat[1]);
        if (dist < minKecDist) {
          minKecDist = dist;
          matchedKec = k;
        }
      }
    }
  }

  const kecNama = matchedKec?.nama || 'Kecamatan Lamongan (Kota)';

  // 3. Cari desa/kelurahan terdekat di dalam kecamatan tersebut
  let matchedDesa: { id: number; nama_wilayah: string } | null = null;
  if (LAMONGAN_DESA_GEOJSON && Array.isArray(LAMONGAN_DESA_GEOJSON.features)) {
    const cleanKec = kecNama.toLowerCase().replace(/kecamatan|kabupaten|\(kota\)/g, '').trim();

    // Saring fitur desa yang berada di kecamatan yang terdeteksi
    const featuresInKec = LAMONGAN_DESA_GEOJSON.features.filter((f: any) => {
      const fKec = (f.properties?.kecamatan_nama || '').toLowerCase();
      return fKec.includes(cleanKec) || cleanKec.includes(fKec.replace(/kecamatan|\(kota\)/g, '').trim());
    });

    const candidates = featuresInKec.length > 0 ? featuresInKec : LAMONGAN_DESA_GEOJSON.features;
    let minDesaDist = Infinity;

    for (const f of candidates) {
      const center = f.properties?.center;
      if (Array.isArray(center) && center.length === 2) {
        const d = Math.hypot(latitude - center[0], longitude - center[1]);
        if (d < minDesaDist) {
          minDesaDist = d;
          matchedDesa = {
            id: f.properties?.id ?? 0,
            nama_wilayah: f.properties?.nama_wilayah || f.properties?.desa || 'Desa',
          };
        }
      }
    }
  }

  return {
    kecamatan: kecNama,
    desa: matchedDesa ? matchedDesa.nama_wilayah : null,
    desaId: matchedDesa ? matchedDesa.id : null,
    confidence,
  };
}

/**
 * Mendapatkan koordinat pusat suatu desa/kelurahan berdasarkan ID atau Nama
 */
export function findCoordinatesByDesa(
  desaIdentifier: number | string,
  kecamatanNama?: string
): [number, number] | null {
  if (!LAMONGAN_DESA_GEOJSON || !Array.isArray(LAMONGAN_DESA_GEOJSON.features)) {
    return null;
  }

  const cleanKec = (kecamatanNama || '').toLowerCase().replace(/kecamatan|kabupaten|\(kota\)/g, '').trim();

  const feature = LAMONGAN_DESA_GEOJSON.features.find((f: any) => {
    if (cleanKec) {
      const fKec = (f.properties?.kecamatan_nama || '').toLowerCase();
      const matchKec = fKec.includes(cleanKec) || cleanKec.includes(fKec.replace(/kecamatan|\(kota\)/g, '').trim());
      if (!matchKec) return false;
    }

    if (typeof desaIdentifier === 'number') {
      return f.properties?.id === desaIdentifier;
    }
    const cleanSearch = String(desaIdentifier).toLowerCase().trim();
    const fName = String(f.properties?.nama_wilayah || '').toLowerCase();
    const fDesa = String(f.properties?.desa || '').toLowerCase();
    return fName === cleanSearch || fDesa === cleanSearch || fName.includes(cleanSearch);
  });

  if (feature && Array.isArray(feature.properties?.center) && feature.properties.center.length === 2) {
    return [feature.properties.center[0], feature.properties.center[1]];
  }

  return null;
}

/**
 * Mendapatkan koordinat pusat suatu kecamatan
 */
export function findCoordinatesByKecamatan(kecamatanNama: string): [number, number] | null {
  const cleanKec = kecamatanNama.toLowerCase().replace(/kecamatan|kabupaten|\(kota\)/g, '').trim();
  const matched = WILAYAH_DATA.kecamatanList.find((k) =>
    k.nama.toLowerCase().includes(cleanKec) || cleanKec.includes(k.nama.toLowerCase().replace(/kecamatan|\(kota\)/g, '').trim())
  );
  return matched ? matched.koordinatPusat : null;
}

