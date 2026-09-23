export type ProyekStatus = 'berjalan' | 'selesai' | 'ditangguhkan';

export type ProyekKategori = 'jalan' | 'taman' | 'drainase' | 'fasilitas';

export interface ProyekItem {
  id: number;
  nama_proyek: string;
  kategori: ProyekKategori;
  deskripsi: string;
  latitude: number;
  longitude: number;
  wilayah_id?: number;
  dinas_id?: number;
  anggaran: number;
  status: ProyekStatus;
  progres_persen: number;
  tanggal_mulai?: string;
  estimasi_selesai?: string;
  nama_wilayah?: string;
  nama_dinas?: string;
  rata_rata_rating?: number | null;
  jumlah_rating?: number;
  tahap_terkini?: string;
}

export interface StatSummary {
  totalProyek: string;
  totalProyekCount: number;
  totalAnggaran: string;
  totalWarga: string;
  totalDinas: number;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  iconType: 'map' | 'progress' | 'report' | 'ai' | 'notif' | 'open';
}

export interface StepItem {
  step: number;
  title: string;
  description: string;
}

export interface CategoryItem {
  id: ProyekKategori;
  name: string;
  icon: string;
  count: number;
  description: string;
}

export interface UserProfile {
  id: number;
  nama: string;
  email: string;
  role: 'warga' | 'admin_dinas' | 'pimpinan_instansi' | 'media_peneliti';
  dinas_id?: number;
}
