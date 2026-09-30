// Data spasial GeoJSON batas wilayah administratif dan struktur hierarkis wilayah
export interface WilayahHierarchy {
  kabupaten: string;
  kecamatanList: {
    nama: string;
    desaList: string[];
    anggaranTotal: number;
    proyekBerjalan: number;
    proyekSelesai: number;
    proyekTertunda: number;
    koordinatPusat: [number, number];
    polygon: [number, number][]; // [lat, lng] array
  }[];
}

export const WILAYAH_DATA: WilayahHierarchy = {
  kabupaten: 'Kabupaten Lamongan',
  kecamatanList: [
    {
      nama: 'Kecamatan Lamongan (Kota)',
      anggaranTotal: 34500000000,
      proyekBerjalan: 5,
      proyekSelesai: 7,
      proyekTertunda: 1,
      koordinatPusat: [-7.1197, 112.4150],
      desaList: [
        'Semua Desa / Kelurahan',
        'Kelurahan Banjarmendalan',
        'Kelurahan Sidokumpul',
        'Kelurahan Sukorejo',
        'Kelurahan Jetis',
        'Kelurahan Tumenggungan',
        'Desa Made',
        'Desa Tanjung',
      ],
      polygon: [
        [-7.095, 112.395],
        [-7.090, 112.430],
        [-7.130, 112.445],
        [-7.145, 112.425],
        [-7.140, 112.390],
        [-7.095, 112.395],
      ],
    },
    {
      nama: 'Kecamatan Babat',
      anggaranTotal: 22800000000,
      proyekBerjalan: 4,
      proyekSelesai: 5,
      proyekTertunda: 0,
      koordinatPusat: [-7.1060, 112.1640],
      desaList: [
        'Semua Desa / Kelurahan',
        'Kelurahan Babat',
        'Desa Banaran',
        'Desa Bedahan',
        'Desa Plaosan',
        'Desa Karangkembang',
      ],
      polygon: [
        [-7.085, 112.140],
        [-7.080, 112.185],
        [-7.125, 112.190],
        [-7.135, 112.150],
        [-7.085, 112.140],
      ],
    },
    {
      nama: 'Kecamatan Deket',
      anggaranTotal: 15400000000,
      proyekBerjalan: 3,
      proyekSelesai: 4,
      proyekTertunda: 1,
      koordinatPusat: [-7.1050, 112.4550],
      desaList: [
        'Semua Desa / Kelurahan',
        'Desa Deket Kulon',
        'Desa Deket Wetan',
        'Desa Rejotengah',
        'Desa Pandanpancur',
      ],
      polygon: [
        [-7.085, 112.435],
        [-7.080, 112.475],
        [-7.120, 112.485],
        [-7.130, 112.445],
        [-7.085, 112.435],
      ],
    },
    {
      nama: 'Kecamatan Tikung',
      anggaranTotal: 12200000000,
      proyekBerjalan: 2,
      proyekSelesai: 3,
      proyekTertunda: 0,
      koordinatPusat: [-7.1650, 112.4200],
      desaList: [
        'Semua Desa / Kelurahan',
        'Desa Bakalanpule',
        'Desa Jatirejo',
        'Desa Pengumbulanadi',
        'Desa Takeranklating',
      ],
      polygon: [
        [-7.140, 112.395],
        [-7.135, 112.440],
        [-7.185, 112.450],
        [-7.195, 112.400],
        [-7.140, 112.395],
      ],
    },
    {
      nama: 'Kecamatan Sukodadi',
      anggaranTotal: 18500000000,
      proyekBerjalan: 3,
      proyekSelesai: 3,
      proyekTertunda: 1,
      koordinatPusat: [-7.1150, 112.3250],
      desaList: [
        'Semua Desa / Kelurahan',
        'Desa Sukodadi',
        'Desa Menongo',
        'Desa Pajangan',
        'Desa Sumberaji',
      ],
      polygon: [
        [-7.095, 112.300],
        [-7.090, 112.355],
        [-7.135, 112.360],
        [-7.140, 112.305],
        [-7.095, 112.300],
      ],
    },
    {
      nama: 'Kecamatan Paciran',
      anggaranTotal: 29100000000,
      proyekBerjalan: 4,
      proyekSelesai: 6,
      proyekTertunda: 0,
      koordinatPusat: [-6.8780, 112.3550],
      desaList: [
        'Semua Desa / Kelurahan',
        'Desa Paciran',
        'Desa Kranji',
        'Desa Tunggul',
        'Desa Weru',
        'Desa Banjarwati',
      ],
      polygon: [
        [-6.855, 112.325],
        [-6.850, 112.385],
        [-6.905, 112.390],
        [-6.910, 112.330],
        [-6.855, 112.325],
      ],
    },
  ],
};

export const BUDGET_RANGES = [
  { id: 'all', label: 'Semua Nilai Anggaran', min: 0, max: Infinity },
  { id: 'micro', label: '< Rp 1 Miliar (Kecil/Mikro)', min: 0, max: 1000000000 },
  { id: 'medium', label: 'Rp 1 Miliar - Rp 5 Miliar (Menengah)', min: 1000000000, max: 5000000000 },
  { id: 'large', label: '> Rp 5 Miliar (Strategis Daerah)', min: 5000000000, max: Infinity },
];
