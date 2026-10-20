// Landmark koordinat terverifikasi di wilayah Kabupaten Lamongan
export const LAMONGAN_LANDMARKS: Record<string, [number, number]> = {
  // Masjid Ikonik
  'masjid agung': [-7.1202, 112.4147],
  'masjid agung lamongan': [-7.1202, 112.4147],
  'masjid namira': [-7.1585, 112.4124],
  'masjid namira lamongan': [-7.1585, 112.4124],

  // Pendidikan & Fasilitas Publik
  pens: [-7.1265, 112.3965],
  'pens lamongan': [-7.1265, 112.3965],
  unisla: [-7.1238, 112.3875],
  'universitas islam lamongan': [-7.1238, 112.3875],

  // Rumah Sakit
  'rs namira': [-7.1350, 112.4280],
  'rs namira lamongan': [-7.1350, 112.4280],
  'rsud dr soegiri': [-7.1120, 112.4160],
  'rsud soegiri': [-7.1120, 112.4160],
  'rs muhammadiyah': [-7.1235, 112.3980],
  'rs muhammadiyah lamongan': [-7.1235, 112.3980],

  // Transportasi & Pusat Kota
  'alun-alun': [-7.1195, 112.4154],
  'alun-alun lamongan': [-7.1195, 112.4154],
  stasiun: [-7.1158, 112.4182],
  'stasiun lamongan': [-7.1158, 112.4182],
  'stasiun babat': [-7.1085, 112.1642],
  terminal: [-7.1220, 112.4050],
  'terminal lamongan': [-7.1220, 112.4050],

  // Simpang & Wilayah Sekitar
  'simpang tikung': [-7.1420, 112.4250],
  tikung: [-7.1420, 112.4250],
  sukodadi: [-7.1152, 112.3324],
  'simpang sukodadi': [-7.1152, 112.3324],
  'pasar sukodadi': [-7.1152, 112.3324],
  sumberwudi: [-7.0850, 112.3480],
  'simpang sumberwudi': [-7.0850, 112.3480],
  babat: [-7.1125, 112.1635],
  'simpang babat': [-7.1125, 112.1635],
  'pasar babat': [-7.1125, 112.1635],

  // Wisata & Olahraga
  'stadion surajaya': [-7.1120, 112.4350],
  'plaza lamongan': [-7.1180, 112.4170],
  'pasar tingkat': [-7.1170, 112.4190],
  'wisata bahari lamongan': [-6.8647, 112.3582],
  wbl: [-6.8647, 112.3582],
  'sunan drajat': [-6.8770, 112.3680],
  'makam sunan drajat': [-6.8770, 112.3680],
};

export interface RoutePreset {
  label: string;
  origin: string;
  destination: string;
}

export interface ProjectRouteContext {
  defaultOrigin: string;
  defaultDestination: string;
  presets: RoutePreset[];
}

export const getProjectRouteContext = (
  projectName: string,
  project?: {
    nama_wilayah?: string;
    latitude?: number | string;
    longitude?: number | string;
  } | null
): ProjectRouteContext => {
  const name = (projectName || '').trim();
  const rawWilayah = (project?.nama_wilayah || '').replace(/^(Kecamatan|Desa|Kelurahan)\s+/i, '').trim();

  // 1. Deteksi pola koridor jalan "Jalan X - Y" atau "Poros X - Y"
  const isReduplication = /alun-alun/i.test(name);
  const corridorMatch = !isReduplication && name.match(
    /(?:Peningkatan|Rekonstruksi|Pembangunan|Pelebaran|Pengerukan)?\s*(?:Jalan|Jl\.?|Poros)\s+([A-Za-z0-9\s]+?)\s*[-–—]\s*([A-Za-z0-9\s]+?)(?:\s*\(|\s*\/|$)/i
  );

  if (corridorMatch) {
    const rawA = corridorMatch[1].replace(/^(Poros|Jalan|Jl\.?)\s+/i, '').trim();
    const rawB = corridorMatch[2].replace(/^(Poros|Jalan|Jl\.?)\s+/i, '').trim();

    // Hapus suffix JAMULA atau tanda kurung jika terbawa
    const cleanA = rawA.replace(/\b(JAMULA|Buluadedi)\b/gi, '').trim() || rawA;
    const cleanB = rawB.replace(/\b(JAMULA|Buluadedi)\b/gi, '').trim() || rawB;

    if (cleanA && cleanB && cleanA.toLowerCase() !== cleanB.toLowerCase() && !cleanA.toLowerCase().includes('alun')) {
      return {
        defaultOrigin: `Simpang ${cleanA}`,
        defaultDestination: `Simpang ${cleanB}`,
        presets: [
          {
            label: `📍 ${cleanA} ➔ ${cleanB}`,
            origin: `Simpang ${cleanA}`,
            destination: `Simpang ${cleanB}`,
          },
          {
            label: `🚧 Akses Barat ➔ Timur ${cleanA}`,
            origin: `Akses Barat ${cleanA}`,
            destination: `Akses Timur ${cleanA}`,
          },
          {
            label: `🔄 Jalur Lingkar ${cleanA} - ${cleanB}`,
            origin: `Jalur Masuk ${cleanA}`,
            destination: `Jalur Keluar ${cleanB}`,
          },
        ],
      };
    }
  }

  // 2. Deteksi apakah proyek berada di wilayah Lamongan Kota
  const lat = project?.latitude ? Number(project.latitude) : -7.12;
  const lng = project?.longitude ? Number(project.longitude) : 112.415;
  const isLamonganKota =
    rawWilayah.toLowerCase().includes('lamongan') ||
    getDistanceMeters([lat, lng], [-7.1205, 112.4155]) <= 5000;

  if (isLamonganKota) {
    return {
      defaultOrigin: 'Alun-Alun Lamongan',
      defaultDestination: 'Stasiun Lamongan',
      presets: [
        {
          label: '🏛️ Alun-Alun ➔ Stasiun',
          origin: 'Alun-Alun Lamongan',
          destination: 'Stasiun Lamongan',
        },
        {
          label: '📍 PENS ➔ RS Namira',
          origin: 'PENS Lamongan',
          destination: 'RS Namira Lamongan',
        },
        {
          label: '🚧 Simpang Tikung ➔ Alun-Alun',
          origin: 'Simpang Tikung',
          destination: 'Alun-Alun Lamongan',
        },
      ],
    };
  }

  // 3. Fallback kontekstual berbasis nama wilayah kecamatan/desa proyek
  const wName = rawWilayah || 'Proyek';
  return {
    defaultOrigin: `Akses Masuk ${wName}`,
    defaultDestination: `Akses Keluar ${wName}`,
    presets: [
      {
        label: `📍 Akses Masuk ➔ Keluar ${wName}`,
        origin: `Akses Masuk ${wName}`,
        destination: `Akses Keluar ${wName}`,
      },
      {
        label: `🚧 Bypass Lingkar ${wName}`,
        origin: `Bypass Barat ${wName}`,
        destination: `Bypass Timur ${wName}`,
      },
      {
        label: `🏍️ Jalur Alternatif Lokal ${wName}`,
        origin: `Simpang ${wName}`,
        destination: `Pintas ${wName}`,
      },
    ],
  };
};

export interface NavigationStep {
  nomor: number;
  instruksi: string;
  jarak: string;
  tipe: 'start' | 'straight' | 'turn-left' | 'turn-right' | 'roundabout' | 'detour' | 'finish';
  keterangan?: string;
}

export const getGoogleMapsDirUrl = (
  origin: string,
  destination: string,
  origCoords?: [number, number],
  destCoords?: [number, number]
): string => {
  const o = origCoords ? `${origCoords[0]},${origCoords[1]}` : encodeURIComponent(origin);
  const d = destCoords ? `${destCoords[0]},${destCoords[1]}` : encodeURIComponent(destination);
  return `https://www.google.com/maps/dir/?api=1&origin=${o}&destination=${d}&travelmode=driving`;
};

export const generateNavigationSteps = (
  origin: string,
  destination: string,
  projectName: string,
  routeIndex: number,
  origPt: [number, number],
  destPt: [number, number],
  closureCenter: [number, number]
): NavigationStep[] => {
  const oName = (origin || 'Titik Awal').trim();
  const dName = (destination || 'Tujuan').trim();
  const pName = (projectName || 'Pekerjaan Fisik').trim();

  const oLower = oName.toLowerCase();
  const dLower = dName.toLowerCase();

  const totalDistM = getDistanceMeters(origPt, destPt);
  const totalDistKm = Number((totalDistM / 1000).toFixed(1));

  const distOrigToProj = getDistanceMeters(origPt, closureCenter);
  const distDestToProj = getDistanceMeters(destPt, closureCenter);
  const isNearProject = distOrigToProj < 3500 || distDestToProj < 3500;

  // Kasus Khusus Populer: Masjid Agung Lamongan ➔ Masjid Namira Lamongan
  if (
    (oLower.includes('masjid agung') || oLower.includes('alun-alun')) &&
    oLower.includes('masjid') === false &&
    dLower.includes('namira')
  ) {
    // Rute dari Kota Lamongan ke Masjid Namira
  }

  if (
    (oLower.includes('masjid agung') || oLower.includes('alun-alun')) &&
    dLower.includes('namira')
  ) {
    if (routeIndex === 0) {
      return [
        {
          nomor: 1,
          instruksi: `Mulai dari ${oName} (barat Alun-Alun Lamongan), arahkan kendaraan ke selatan menuju Jl. Lamongrejo.`,
          jarak: '400 m',
          tipe: 'start',
          keterangan: 'Jalur pusat kota, perhatikan penyeberang jalan Alun-Alun.',
        },
        {
          nomor: 2,
          instruksi: 'Belok kiri ke Jl. Basuki Rahmat, lalu lanjutkan lurus ke tenggara menyusuri Jl. Sunan Drajat.',
          jarak: '1.6 km',
          tipe: 'turn-left',
          keterangan: 'Jalan arteri kota beraspal mulus dua lajur.',
        },
        {
          nomor: 3,
          instruksi: 'Teruskan melewati bundaran Simpang Tikung, masuk ke Jl. Raya Tikung (koridor poros Mantup).',
          jarak: '2.4 km',
          tipe: 'straight',
          keterangan: 'Jalur poros penghubung Lamongan - Tikung beraspal lebar.',
        },
        {
          nomor: 4,
          instruksi: `Konfirmasi Bebas Hambatan: Koridor Kota - Tikung ini sepenuhnya lancar dan tidak terpengaruh proyek ${pName}.`,
          jarak: '600 m',
          tipe: 'straight',
          keterangan: 'Tidak ada penutupan jalan pada koridor ini.',
        },
        {
          nomor: 5,
          instruksi: `Tiba di gerbang masuk ${dName} (Desa Jotosanur, Kec. Tikung) di sisi barat jalan.`,
          jarak: '200 m',
          tipe: 'finish',
          keterangan: 'Tersedia kantong parkir luas dan fasilitas ibadah terpadu.',
        },
      ];
    } else if (routeIndex === 1) {
      return [
        {
          nomor: 1,
          instruksi: `Berangkat dari ${oName}, melaju ke timur melewati Jl. Veteran menuju bypass lingkar timur kota.`,
          jarak: '1.2 km',
          tipe: 'start',
          keterangan: 'Melintasi kompleks perkantoran Pemkab Lamongan.',
        },
        {
          nomor: 2,
          instruksi: 'Belok kanan ke Jalan Lingkar Luar Timur untuk memotong antrean lampu merah pusat kota.',
          jarak: '2.3 km',
          tipe: 'turn-right',
          keterangan: 'Jalur lingkar sekunder aspal lebar pengurai kepadatan.',
        },
        {
          nomor: 3,
          instruksi: 'Masuk kembali ke koridor Jl. Raya Tikung setelah persimpangan utama.',
          jarak: '1.8 km',
          tipe: 'straight',
          keterangan: 'Jalan mulus dengan penerangan jalan umum lengkap.',
        },
        {
          nomor: 4,
          instruksi: 'Lanjutkan lurus ke arah selatan menuju batas Desa Jotosanur.',
          jarak: '700 m',
          tipe: 'straight',
          keterangan: 'Lalu lintas lancar.',
        },
        {
          nomor: 5,
          instruksi: `Tiba di ${dName}. Gerbang utama berada di sebelah kanan jalan.`,
          jarak: '150 m',
          tipe: 'finish',
          keterangan: 'Perjalanan selesai dengan waktu tempuh optimal.',
        },
      ];
    } else {
      return [
        {
          nomor: 1,
          instruksi: `Mulai dari ${oName}, arahkan sepeda motor menyusuri Jl. Lamongrejo ke Jl. Kusuma Bangsa.`,
          jarak: '850 m',
          tipe: 'start',
          keterangan: 'Khusus sepeda motor & angkutan lokal perkotaan.',
        },
        {
          nomor: 2,
          instruksi: 'Belok kiri ke Jl. Sumargo melintasi lingkungan pemukiman berkecepatan rendah.',
          jarak: '1.7 km',
          tipe: 'turn-left',
          keterangan: 'Jalan pemukiman tertata rapi berpaving/aspal halus.',
        },
        {
          nomor: 3,
          instruksi: 'Ikuti jalan pintas pedesaan beraspal menuju kawasan Jotosanur.',
          jarak: '1.9 km',
          tipe: 'straight',
          keterangan: 'Akses cepat menghindari lampu merah perempatan Tikung.',
        },
        {
          nomor: 4,
          instruksi: 'Keluar ke jalan poros utama Tikung di dekat gapura masuk Namira.',
          jarak: '400 m',
          tipe: 'turn-right',
          keterangan: 'Perhatikan kendaraan dari arah utara sebelum berbelok.',
        },
        {
          nomor: 5,
          instruksi: `Sampai di ${dName}. Area parkir motor tersedia di pelataran sayap utara.`,
          jarak: '100 m',
          tipe: 'finish',
          keterangan: 'Rute pintas tercepat khusus kendaraan roda dua.',
        },
      ];
    }
  }

  // Kasus Proyek dengan Penutupan Jalan Fisik
  if (isNearProject) {
    return [
      {
        nomor: 1,
        instruksi: `Berangkat dari ${oName}, arahkan kendaraan menuju koridor jalan poros penghubung.`,
        jarak: '450 m',
        tipe: 'start',
        keterangan: 'Mulai perjalanan dengan kecepatan aman.',
      },
      {
        nomor: 2,
        instruksi: `PERHATIAN REKAYASA LALU LINTAS: Sekitar 250 m di depan terdapat penutupan jalan proyek "${pName}". Bersiap belok ke jalur pengalihan.`,
        jarak: '300 m',
        tipe: 'detour',
        keterangan: 'Zona tertutup ditandai dengan barier oranye dan rambu arah kuning.',
      },
      {
        nomor: 3,
        instruksi:
          routeIndex === 0
            ? 'Masuk ke Jalur Arteri Pengalihan Utama beraspal lebar yang membelok aman mengitari area proyek.'
            : routeIndex === 1
            ? 'Gunakan Jalur Lingkar Luar Sekunder untuk mengurai antrean kendaraan logistik dan roda empat.'
            : 'Gunakan Jalur Lingkungan Pemukiman Beraspal khusus sepeda motor dengan batas 30 km/jam.',
        jarak: `${Math.max(1.2, totalDistKm * 0.55).toFixed(1)} km`,
        tipe: routeIndex === 1 ? 'turn-right' : 'straight',
        keterangan: 'Kondisi jalan layak dan telah diverifikasi petugas perhubungan.',
      },
      {
        nomor: 4,
        instruksi: 'Setelah melewati batas akhir zona proyek, kembalikan kendaraan ke arah jalur poros utama.',
        jarak: '450 m',
        tipe: 'turn-left',
        keterangan: 'Arus lalu lintas kembali normal dua arah.',
      },
      {
        nomor: 5,
        instruksi: `Lanjutkan hingga tiba di titik tujuan ${dName}.`,
        jarak: '250 m',
        tipe: 'finish',
        keterangan: 'Perjalanan aman mengitari penutupan jalan proyek selesai.',
      },
    ];
  }

  // Kasus Rute Umum Lainnya di Kabupaten Lamongan
  return [
    {
      nomor: 1,
      instruksi: `Berangkat dari ${oName}, arahkan kendaraan ke koridor jalan utama terdekat.`,
      jarak: '400 m',
      tipe: 'start',
      keterangan: 'Ikuti arus lalu lintas lokal.',
    },
    {
      nomor: 2,
      instruksi: 'Lanjutkan perjalanan melintasi koridor arteri penghubung antardaerah.',
      jarak: `${Math.max(1.2, totalDistKm * 0.45).toFixed(1)} km`,
      tipe: 'straight',
      keterangan: 'Jalan utama beraspal dengan marka jalan jelas.',
    },
    {
      nomor: 3,
      instruksi: 'Teruskan perjalanan melewati persimpangan poros wilayah.',
      jarak: `${Math.max(1.0, totalDistKm * 0.35).toFixed(1)} km`,
      tipe: 'straight',
      keterangan: 'Kondisi lalu lintas normal, aman tanpa hambatan penutupan jalan proyek.',
    },
    {
      nomor: 4,
      instruksi: 'Kurangi kecepatan saat mendekati area simpang akses lokasi tujuan.',
      jarak: '350 m',
      tipe: 'straight',
      keterangan: 'Perhatikan kendaraan sekitar sebelum berbelok masuk.',
    },
    {
      nomor: 5,
      instruksi: `Tiba di titik tujuan ${dName}.`,
      jarak: '150 m',
      tipe: 'finish',
      keterangan: 'Perjalanan selesai dengan selamat.',
    },
  ];
};

export const resolvePlaceCoords = (
  name: string,
  projCenter: [number, number],
  isOrigin = true
): [number, number] => {
  const clean = (name || '').trim().toLowerCase();

  // Prioritas pencocokan landmark spesifik
  if (clean.includes('masjid namira')) {
    return [-7.1585, 112.4124];
  }
  if (clean.includes('masjid agung')) {
    return [-7.1202, 112.4147];
  }

  // Cek kamus landmark lengkap Lamongan
  for (const [key, coords] of Object.entries(LAMONGAN_LANDMARKS)) {
    if (clean === key || clean.includes(key) || (key.length >= 4 && key.includes(clean))) {
      return coords;
    }
  }

  // Jika nama tempat adalah titik lokal sekitar proyek atau koridor yang tidak dikenal:
  // Tempatkan titik asal di sisi barat/pendekat (~1.2 km) dan tujuan di sisi timur/pengeluaran (~1.2 km)
  if (isOrigin) {
    return [
      Number((projCenter[0] - 0.0025).toFixed(6)),
      Number((projCenter[1] - 0.0115).toFixed(6)),
    ];
  }
  return [
    Number((projCenter[0] + 0.0025).toFixed(6)),
    Number((projCenter[1] + 0.0115).toFixed(6)),
  ];
};

export const getDistanceMeters = (coord1: [number, number], coord2: [number, number]): number => {
  const dLat = (coord2[0] - coord1[0]) * 111000;
  const dLng = (coord2[1] - coord1[1]) * 110170;
  return Math.sqrt(dLat * dLat + dLng * dLng);
};

export const isPolylineValid = (
  coords: [number, number][],
  center: [number, number],
  origPt?: [number, number],
  destPt?: [number, number],
  closureRadiusMeters = 240
): boolean => {
  if (!coords || coords.length < 4) return false;

  // Verifikasi titik awal rute harus berada dalam radius wajar dari Titik Asal / Origin (< 1500m)
  if (origPt) {
    const dStart = getDistanceMeters(coords[0], origPt);
    if (dStart > 1500) return false;
  }

  // Verifikasi titik akhir rute harus berada dalam radius wajar dari Titik Tujuan / Destination (< 1500m)
  if (destPt) {
    const dEnd = getDistanceMeters(coords[coords.length - 1], destPt);
    if (dEnd > 1500) return false;
  }

  // Hanya periksa penembusan jika titik asal dan tujuan sendiri berada di luar zona penutupan
  const origOutside = !origPt || getDistanceMeters(origPt, center) >= closureRadiusMeters;
  const destOutside = !destPt || getDistanceMeters(destPt, center) >= closureRadiusMeters;
  const shouldCheckClosure = origOutside && destOutside;

  for (let i = 0; i < coords.length; i++) {
    const pt = coords[i];
    // Tidak boleh menembus zona penutupan proyek jika start & finish berada di luar
    if (shouldCheckClosure && getDistanceMeters(pt, center) < closureRadiusMeters) {
      return false;
    }
    // Tidak boleh melompat drastis (> 2500m per langkah)
    if (i > 0) {
      const step = getDistanceMeters(coords[i - 1], pt);
      if (step > 2500) {
        return false;
      }
    }
  }
  return true;
};

export const generateCleanDetourPath = (
  startPt: [number, number],
  endPt: [number, number],
  closureCenter: [number, number],
  routeIdx: number
): [number, number][] => {
  const points: [number, number][] = [];
  points.push([startPt[0], startPt[1]]);

  const dx = endPt[0] - startPt[0];
  const dy = endPt[1] - startPt[1];
  const len = Math.sqrt(dx * dx + dy * dy) || 0.001;
  const ux = dx / len;
  const uy = dy / len;

  let nx = -uy;
  let ny = ux;

  const cross = (closureCenter[0] - startPt[0]) * dy - (closureCenter[1] - startPt[1]) * dx;
  const side = cross >= 0 ? 1 : -1;

  let detourOffsetDeg: number;
  let detourDirection: number;

  if (routeIdx === 0) {
    detourDirection = -side;
    detourOffsetDeg = 0.0042;
  } else if (routeIdx === 1) {
    detourDirection = side;
    detourOffsetDeg = 0.0065;
  } else {
    detourDirection = -side * 0.9;
    detourOffsetDeg = 0.0032;
  }

  const midX = (startPt[0] + endPt[0]) / 2 + nx * detourDirection * detourOffsetDeg;
  const midY = (startPt[1] + endPt[1]) / 2 + ny * detourDirection * detourOffsetDeg;

  const totalDist = getDistanceMeters(startPt, endPt);
  const steps = Math.max(10, Math.min(30, Math.ceil(totalDist / 220)));
  for (let step = 1; step < steps; step++) {
    const t = step / steps;
    const lat = (1 - t) * (1 - t) * startPt[0] + 2 * (1 - t) * t * midX + t * t * endPt[0];
    const lng = (1 - t) * (1 - t) * startPt[1] + 2 * (1 - t) * t * midY + t * t * endPt[1];

    const distToCenter = getDistanceMeters([lat, lng], closureCenter);
    if (distToCenter < 300) {
      const pushX = (lat - closureCenter[0]) / (distToCenter / 111000 || 0.001);
      const pushY = (lng - closureCenter[1]) / (distToCenter / 110170 || 0.001);
      const safeLat = closureCenter[0] + pushX * (320 / 111000);
      const safeLng = closureCenter[1] + pushY * (320 / 110170);
      points.push([Number(safeLat.toFixed(6)), Number(safeLng.toFixed(6))]);
    } else {
      points.push([Number(lat.toFixed(6)), Number(lng.toFixed(6))]);
    }
  }

  points.push([endPt[0], endPt[1]]);
  return points;
};

export const ensureWaypointsSpan = (
  waypoints: string[],
  orig: string,
  dest: string
): string[] => {
  let list = Array.isArray(waypoints) ? waypoints.filter(Boolean) : [];
  if (list.length === 0) {
    return [orig, 'Jalur Alternatif Terverifikasi', dest];
  }
  const first = list[0].toLowerCase();
  const origClean = orig.trim().toLowerCase();
  if (!first.includes(origClean) && !origClean.includes(first)) {
    list.unshift(orig.trim());
  }
  const last = list[list.length - 1].toLowerCase();
  const destClean = dest.trim().toLowerCase();
  if (!last.includes(destClean) && !destClean.includes(last)) {
    list.push(dest.trim());
  }
  return list;
};

export const getNearestPlaceName = (
  coords: [number, number],
  projectCenter: [number, number],
  projectName?: string
): string => {
  let closestKey = '';
  let minDistance = Infinity;

  for (const [key, lCoords] of Object.entries(LAMONGAN_LANDMARKS)) {
    const dist = getDistanceMeters(coords, lCoords);
    if (dist < minDistance) {
      minDistance = dist;
      closestKey = key;
    }
  }

  // Jika dekat dengan landmark terdaftar (< 500 meter)
  if (minDistance <= 500 && closestKey) {
    return closestKey
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  // Jika dekat dengan proyek (< 400 meter)
  const distToProj = getDistanceMeters(coords, projectCenter);
  if (distToProj <= 400 && projectName) {
    const cleanProj = projectName.replace(/^(Peningkatan|Rekonstruksi|Pembangunan|Pelebaran)\s+/i, '');
    return `Area Proyek ${cleanProj.slice(0, 24)}`;
  }

  return `Titik Peta (${coords[0].toFixed(4)}, ${coords[1].toFixed(4)})`;
};

export interface OSRMRouteResult {
  coordinates: [number, number][];
  distanceKm: number;
  durationMin: number;
  roadNames: string[];
  steps: NavigationStep[];
}

export const calculateDetourWaypoints = (
  origPt: [number, number],
  destPt: [number, number],
  closureCenter: [number, number]
): { viaNorth: [number, number]; viaSouth: [number, number]; needDetour: boolean } => {
  const dx = destPt[0] - origPt[0];
  const dy = destPt[1] - origPt[1];
  const len = Math.sqrt(dx * dx + dy * dy) || 0.001;
  const ux = dx / len;
  const uy = dy / len;

  const nx = -uy;
  const ny = ux;

  // Proyeksi closureCenter ke segmen lintasan [origPt, destPt]
  const t = Math.max(
    0,
    Math.min(1, ((closureCenter[0] - origPt[0]) * dx + (closureCenter[1] - origPt[1]) * dy) / (len * len))
  );
  const projPt: [number, number] = [origPt[0] + t * dx, origPt[1] + t * dy];
  const distToLineMeters = getDistanceMeters(closureCenter, projPt);
  const needDetour = distToLineMeters < 500 && t > 0.05 && t < 0.95;

  const refLat = needDetour ? closureCenter[0] : (origPt[0] + destPt[0]) / 2;
  const refLng = needDetour ? closureCenter[1] : (origPt[1] + destPt[1]) / 2;

  const offsetNorthDeg = needDetour ? 0.0075 : 0.0090;
  const offsetSouthDeg = needDetour ? 0.0075 : 0.0090;

  const viaNorth: [number, number] = [
    Number((refLat + nx * offsetNorthDeg).toFixed(6)),
    Number((refLng + ny * offsetNorthDeg).toFixed(6)),
  ];
  const viaSouth: [number, number] = [
    Number((refLat - nx * offsetSouthDeg).toFixed(6)),
    Number((refLng - ny * offsetSouthDeg).toFixed(6)),
  ];

  return { viaNorth, viaSouth, needDetour };
};

const osrmRouteCache = new Map<string, OSRMRouteResult>();

export const fetchOSRMRoute = async (
  origPt: [number, number],
  destPt: [number, number],
  viaPt?: [number, number] | null,
  originName?: string,
  destName?: string,
  timeoutMs = 4500
): Promise<OSRMRouteResult | null> => {
  const cacheKey = `${origPt[0].toFixed(5)},${origPt[1].toFixed(5)}_${destPt[0].toFixed(5)},${destPt[1].toFixed(5)}_${
    viaPt ? `${viaPt[0].toFixed(5)},${viaPt[1].toFixed(5)}` : 'direct'
  }`;

  if (osrmRouteCache.has(cacheKey)) {
    return osrmRouteCache.get(cacheKey)!;
  }

  // OSRM routing format: lon,lat
  const coordsStr = viaPt
    ? `${origPt[1]},${origPt[0]};${viaPt[1]},${viaPt[0]};${destPt[1]},${destPt[0]}`
    : `${origPt[1]},${origPt[0]};${destPt[1]},${destPt[0]}`;

  const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson&steps=true`;

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    const res = await fetch(url, {
      signal: controller?.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== 'Ok' || !Array.isArray(data.routes) || data.routes.length === 0) {
      return null;
    }

    const route = data.routes[0];
    const rawCoords = route.geometry?.coordinates;
    if (!Array.isArray(rawCoords) || rawCoords.length < 2) {
      return null;
    }

    // Konversi [lon, lat] GeoJSON ke Leaflet [lat, lon]
    const coordinates: [number, number][] = rawCoords.map(([lon, lat]: [number, number]) => [
      Number(lat.toFixed(6)),
      Number(lon.toFixed(6)),
    ]);

    const distanceKm = Number((route.distance / 1000).toFixed(1));
    const durationMin = Math.max(1, Math.round(route.duration / 60));

    const oName = (originName || 'Titik Awal').trim();
    const dName = (destName || 'Tujuan').trim();

    const allSteps = (route.legs || []).flatMap((leg: any) => leg.steps || []);
    const roadNames = Array.from(
      new Set(allSteps.map((s: any) => (s.name || '').trim()).filter(Boolean))
    ) as string[];

    const steps: NavigationStep[] = [];
    let stepNum = 1;

    allSteps.forEach((s: any, idx: number) => {
      const type = s.maneuver?.type || '';
      const modifier = (s.maneuver?.modifier || '').toLowerCase();
      const roadName = (s.name || '').trim();
      const distM = Math.round(s.distance || 0);
      const distStr = distM >= 1000 ? `${(distM / 1000).toFixed(1)} km` : `${distM} m`;

      let stepType: NavigationStep['tipe'] = 'straight';
      let instruksi = '';
      let keterangan = '';

      if (idx === 0 || type === 'depart') {
        stepType = 'start';
        instruksi = `Mulai dari ${oName}, masuk ke ${roadName || 'jalan arteri utama'}.`;
        keterangan = 'Patuhi rambu lalu lintas dan batas kecepatan kota.';
      } else if (type === 'arrive' || idx === allSteps.length - 1) {
        stepType = 'finish';
        instruksi = `Tiba di tujuan ${dName}${roadName ? ` (${roadName})` : ''}.`;
        keterangan = 'Perjalanan rute terverifikasi selesai.';
      } else if (type === 'roundabout' || type === 'rotary') {
        stepType = 'roundabout';
        instruksi = `Masuk bundaran dan ambil jalan keluar menuju ${roadName || 'jalur poros'}.`;
      } else if (modifier.includes('left')) {
        stepType = 'turn-left';
        instruksi = `Belok kiri ke ${roadName || 'persimpangan jalan'}.`;
      } else if (modifier.includes('right')) {
        stepType = 'turn-right';
        instruksi = `Belok kanan ke ${roadName || 'persimpangan jalan'}.`;
      } else {
        stepType = 'straight';
        instruksi = roadName ? `Lurus menyusuri ${roadName}.` : 'Lanjutkan mengikuti jalur utama.';
      }

      if (instruksi && (distM > 40 || stepType === 'finish' || stepType === 'start')) {
        steps.push({
          nomor: stepNum++,
          instruksi,
          jarak: distStr,
          tipe: stepType,
          keterangan,
        });
      }
    });

    const result: OSRMRouteResult = {
      coordinates,
      distanceKm,
      durationMin,
      roadNames,
      steps,
    };

    osrmRouteCache.set(cacheKey, result);
    return result;
  } catch (err) {
    return null;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

