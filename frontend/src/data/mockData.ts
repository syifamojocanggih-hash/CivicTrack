import type { ProyekItem, StatSummary, FeatureItem, StepItem, CategoryItem } from '../types';

export const STATS_DATA: StatSummary = {
  totalProyek: '247+',
  totalProyekCount: 247,
  totalAnggaran: 'Rp 84M',
  totalWarga: '12K',
  totalDinas: 18,
};

export const INITIAL_PROJECTS: ProyekItem[] = [
  {
    id: 1,
    nama_proyek: 'Renovasi Taman Centennial',
    kategori: 'taman',
    deskripsi: 'Penataan ulang ruang terbuka hijau, penambahan jogging track, area bermain anak, dan perbaikan pencahayaan taman.',
    latitude: -7.9467,
    longitude: 112.6159,
    wilayah_id: 1,
    dinas_id: 2,
    anggaran: 2850000000,
    status: 'berjalan',
    progres_persen: 65,
    tanggal_mulai: '2024-03-01',
    estimasi_selesai: 'Okt 2024',
    nama_wilayah: 'Kec. Lowokwaru, Kota Malang',
    nama_dinas: 'Dinas Lingkungan Hidup',
    rata_rata_rating: 4.6,
    jumlah_rating: 38,
    tahap_terkini: 'Pemasangan paving block & tanaman hias'
  },
  {
    id: 2,
    nama_proyek: 'Pelebaran Jalan Soekarno Hatta KM 4–7',
    kategori: 'jalan',
    deskripsi: 'Pelebaran badan jalan selebar 3 meter per sisi untuk mengurai titik kemacetan utama di kawasan koridor pendidikan dan niaga.',
    latitude: -7.9395,
    longitude: 112.6288,
    wilayah_id: 2,
    dinas_id: 1,
    anggaran: 12400000000,
    status: 'berjalan',
    progres_persen: 38,
    tanggal_mulai: '2024-01-15',
    estimasi_selesai: 'Des 2024',
    nama_wilayah: 'Kec. Blimbing, Kota Malang',
    nama_dinas: 'Dinas Pekerjaan Umum dan Penataan Ruang',
    rata_rata_rating: 4.1,
    jumlah_rating: 19,
    tahap_terkini: 'Pengerjaan pondasi agregat kelas A'
  },
  {
    id: 3,
    nama_proyek: 'Normalisasi Drainase Jl. MT. Haryono',
    kategori: 'drainase',
    deskripsi: 'Pengerukan sedimen dan pemasangan u-ditch beton pra-cetak sepanjang 1,2 km guna mencegah genangan air saat curah hujan tinggi.',
    latitude: -7.9523,
    longitude: 112.6072,
    wilayah_id: 3,
    dinas_id: 1,
    anggaran: 4200000000,
    status: 'selesai',
    progres_persen: 100,
    tanggal_mulai: '2023-10-01',
    estimasi_selesai: 'Feb 2024',
    nama_wilayah: 'Kec. Klojen, Kota Malang',
    nama_dinas: 'Dinas Pekerjaan Umum dan Penataan Ruang',
    rata_rata_rating: 4.8,
    jumlah_rating: 84,
    tahap_terkini: 'Serah terima pekerjaan akhir (FHO)'
  },
  {
    id: 4,
    nama_proyek: 'Pembangunan Jembatan Penghubung Kel. Dinoyo',
    kategori: 'jalan',
    deskripsi: 'Pembangunan jembatan beton penghubung antar-kelurahan untuk memotong waktu tempuh warga ke fasilitas kesehatan terdekat.',
    latitude: -7.9401,
    longitude: 112.5991,
    wilayah_id: 1,
    dinas_id: 1,
    anggaran: 8900000000,
    status: 'ditangguhkan',
    progres_persen: 22,
    tanggal_mulai: '2024-02-10',
    estimasi_selesai: 'Nov 2024',
    nama_wilayah: 'Kec. Lowokwaru, Kota Malang',
    nama_dinas: 'Dinas Pekerjaan Umum dan Penataan Ruang',
    rata_rata_rating: 3.2,
    jumlah_rating: 12,
    tahap_terkini: 'Evaluasi ulang struktur tanah & geoteknik'
  },
  {
    id: 5,
    nama_proyek: 'Revitalisasi Pasar Tradisional Terpadu',
    kategori: 'fasilitas',
    deskripsi: 'Peningkatan sanitasi, instalasi proteksi kebakaran, dan penataan 350 kios pedagang basah dan kering.',
    latitude: -7.9812,
    longitude: 112.6315,
    wilayah_id: 4,
    dinas_id: 3,
    anggaran: 15600000000,
    status: 'berjalan',
    progres_persen: 54,
    tanggal_mulai: '2024-01-20',
    estimasi_selesai: 'Jan 2025',
    nama_wilayah: 'Kec. Sukun, Kota Malang',
    nama_dinas: 'Dinas Perdagangan dan Perindustrian',
    rata_rata_rating: 4.4,
    jumlah_rating: 45,
    tahap_terkini: 'Pemasangan atap rangka baja ringan'
  }
];

export const CATEGORIES_DATA: CategoryItem[] = [
  {
    id: 'jalan',
    name: 'Jalan & Jembatan',
    icon: '🛣️',
    count: 89,
    description: 'Pelebaran jalan, pengaspalan, jembatan penyeberangan'
  },
  {
    id: 'taman',
    name: 'Taman & RTH',
    icon: '🌿',
    count: 42,
    description: 'Taman kota, penanaman pohon pelindung, pedestrian hijau'
  },
  {
    id: 'drainase',
    name: 'Drainase & Sanitasi',
    icon: '💧',
    count: 61,
    description: 'Normalisasi gorong-gorong, saluran induk, u-ditch'
  },
  {
    id: 'fasilitas',
    name: 'Fasilitas Publik',
    icon: '🏫',
    count: 55,
    description: 'Puskesmas, pasar tradisional, gelanggang olahraga'
  }
];

export const FEATURES_DATA: FeatureItem[] = [
  {
    id: 'map',
    title: 'Peta Lokasi Interaktif',
    description: 'Temukan proyek berdasarkan peta dengan filter wilayah dari desa hingga kabupaten. Setiap marker menunjukkan status dan kategori proyek.',
    iconType: 'map'
  },
  {
    id: 'progress',
    title: 'Progres & Linimasa',
    description: 'Lihat persentase penyelesaian, tahap pekerjaan saat ini, dan estimasi tanggal selesai untuk setiap proyek yang berjalan.',
    iconType: 'progress'
  },
  {
    id: 'report',
    title: 'Laporan Warga',
    description: 'Kirim keluhan, pertanyaan, atau apresiasi langsung ke dinas terkait. Setiap laporan direspons dan tercatat secara transparan.',
    iconType: 'report'
  },
  {
    id: 'ai',
    title: 'Rute Alternatif AI',
    description: 'Saat proyek menutup akses jalan, sistem AI otomatis menyajikan rekomendasi rute alternatif berprioritas untuk warga sekitar.',
    iconType: 'ai'
  },
  {
    id: 'notif',
    title: 'Notifikasi Pembaruan',
    description: 'Ikuti proyek yang ingin dipantau dan dapatkan pemberitahuan otomatis setiap kali ada pembaruan progres atau perubahan status.',
    iconType: 'notif'
  },
  {
    id: 'open',
    title: 'Data Terbuka (Open API)',
    description: 'Peneliti, media, dan LSM dapat mengakses seluruh dataset proyek melalui REST API publik untuk keperluan riset dan pengawasan independen.',
    iconType: 'open'
  }
];

export const HOW_IT_WORKS_DATA: StepItem[] = [
  {
    step: 1,
    title: 'Buka peta & cari lokasi',
    description: 'Ketik nama jalan, kelurahan, atau kecamatan untuk melihat proyek di wilayahmu.'
  },
  {
    step: 2,
    title: 'Pilih proyek & baca detail',
    description: 'Klik marker di peta untuk melihat progres, linimasa, foto lapangan, dan anggaran.'
  },
  {
    step: 3,
    title: 'Ikuti & beri tanggapan',
    description: 'Daftar akun untuk mengikuti proyek dan mengirim laporan langsung ke dinas terkait.'
  }
];
