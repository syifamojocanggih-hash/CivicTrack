export type ProyekStatus = 'berjalan' | 'selesai' | 'ditangguhkan' | 'dalam_peninjauan_ulang';

export type ProyekKategori = 'jalan' | 'taman' | 'drainase' | 'fasilitas';

export interface ProyekItem {
  id: number;
  nama_proyek: string;
  kategori: ProyekKategori;
  deskripsi: string;
  latitude: number;
  longitude: number;
  wilayah_id?: number;
  desa_id?: number | null;
  dinas_id?: number;
  anggaran: number;
  status: ProyekStatus;
  progres_persen: number;
  tanggal_mulai?: string;
  estimasi_selesai?: string;
  nama_wilayah?: string;
  nama_desa?: string;
  nama_dinas?: string;
  rata_rata_rating?: number | null;
  jumlah_rating?: number;
  tahap_terkini?: string;
}

export interface WilayahOptionItem {
  id: number;
  kode_wilayah: string;
  nama_wilayah: string;
  level: 'kabupaten' | 'kecamatan' | 'desa';
  parent_id?: number | null;
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

export type UserRole = 'warga' | 'aparatur_pemerintah' | 'penanggung_jawab' | 'pemerintah' | 'admin_dinas' | 'pimpinan_instansi';

export interface UserProfile {
  id: number;
  nama: string;
  email: string;
  role: UserRole;
  dinas_id?: number;
  nama_dinas?: string;
  nip?: string;
  telepon?: string;
}

export interface NotificationItem {
  id: number;
  proyek_id?: number;
  nama_proyek?: string;
  judul: string;
  pesan: string;
  kategori: 'progres' | 'aduan' | 'evaluasi' | 'sistem';
  waktu: string;
  dibaca: boolean;
  link_url?: string;
}

export interface ApiNotificationItem {
  id: number;
  user_id: number;
  proyek_id: number;
  pesan: string;
  is_read: boolean;
  created_at: string;
  nama_proyek?: string;
}

export interface SubscriptionStatus {
  proyek_id: number;
  is_subscribed: boolean;
}

export interface AuditTrailLogItem {
  id: number;
  evaluasi_id: number;
  status_sebelumnya?: string;
  status_baru: string;
  diubah_oleh: string;
  role_pengubah: string;
  catatan: string;
  waktu: string;
}

export type StatusAduan = 'menunggu' | 'diproses' | 'selesai' | 'ditolak';

export interface LaporanAduan {
  id: number;
  proyek_id: number;
  nama_proyek: string;
  user_id: number;
  nama_pelapor: string;
  email_pelapor: string;
  judul: string;
  isi_laporan: string;
  kategori_aduan: string;
  foto_url?: string;
  status: StatusAduan;
  tanggal_lapor: string;
  tanggapan_dinas?: string;
  tanggal_tanggapan?: string;
  petugas_penjawab?: string;
}

export type StatusVerifikasiEvaluasi = 'menunggu_verifikasi' | 'dalam_penanganan' | 'selesai_diperbaiki' | 'ditolak';

export interface EvaluasiCacatItem {
  id: number;
  proyek_id: number;
  nama_proyek: string;
  user_id: number;
  nama_pelapor: string;
  deskripsi: string;
  lokasi_titik: string;
  skor_urgensi_ai: number; // 1 - 5
  analisis_ai: string;
  kategori_cacat: string;
  foto_url?: string;
  status_verifikasi: StatusVerifikasiEvaluasi;
  catatan_dinas?: string;
  tanggal_lapor: string;
  tanggal_tindakan?: string;
}

export interface ApiEvaluationStatusLog {
  id: number;
  evaluasi_id: number;
  status_sebelumnya?: string | null;
  status_baru: string;
  diubah_oleh: number;
  catatan?: string | null;
  created_at: string;
  nama_pengubah: string;
}

export interface RatingUlasanItem {
  id: number;
  proyek_id: number;
  nama_proyek: string;
  user_id: number;
  nama_warga: string;
  bintang: number; // 1 - 5
  komentar: string;
  aspek_kualitas: number;
  aspek_ketepatan_waktu: number;
  aspek_manfaat: number;
  tanggal: string;
}

export interface LinimasaTahap {
  id: number;
  proyek_id: number;
  nomor_tahap: number;
  nama_tahap: string;
  deskripsi: string;
  target_mulai: string;
  target_selesai: string;
  realisasi_mulai?: string;
  realisasi_selesai?: string;
  persentase_bobot: number;
  status: 'belum_mulai' | 'sedang_berjalan' | 'selesai' | 'tertunda';
  catatan_lapangan?: string;
}

export interface DokumentasiProyek {
  id: number;
  proyek_id: number;
  nama_proyek: string;
  tahap_id?: number;
  nama_tahap?: string;
  judul: string;
  deskripsi: string;
  foto_url: string;
  tanggal_unggah: string;
  diunggah_oleh: string;
  tipe_file: 'foto' | 'video' | 'dokumen_teknis';
}

export interface DinasKinerjaItem {
  id: number;
  kode: string;
  nama_dinas: string;
  kepala_dinas: string;
  total_proyek: number;
  total_anggaran: number;
  realisasi_anggaran: number;
  proyek_on_track: number;
  proyek_terlambat: number;
  proyek_selesai: number;
  aduan_total: number;
  aduan_selesai: number;
  rata_rata_rating: number;
  skor_kinerja: number; // e.g. 92.5
}

export interface SubscribedProject {
  id: number;
  proyek_id: number;
  proyek: ProyekItem;
  tanggal_subscribe: string;
  notifikasi_aktif: boolean;
  update_terakhir: string;
  pesan_update: string;
}

export interface StatusCountItem {
  berjalan: number;
  selesai: number;
  tertunda: number;
  dalam_peninjauan_ulang: number;
}

export interface WilayahStatItem {
  wilayah_id: number;
  kode_wilayah?: string;
  nama_wilayah: string;
  jumlah_berjalan: number;
  jumlah_selesai: number;
  jumlah_tertunda: number;
  jumlah_dalam_peninjauan_ulang: number;
  status_proyek: StatusCountItem;
  total_proyek: number;
  total_anggaran: number;
  estimasi_penyerapan_anggaran: number;
  rata_rata_progres: number;
}

export interface RingkasanKabupatenItem {
  total_proyek: number;
  status_proyek: StatusCountItem;
  total_anggaran: number;
  estimasi_penyerapan_anggaran: number;
  rasio_penyerapan_persen: number;
  rata_rata_progres: number;
}

