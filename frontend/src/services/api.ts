import type { ProyekItem, UserProfile, StatSummary, WilayahStatItem, RingkasanKabupatenItem, WilayahOptionItem } from '../types';
import { INITIAL_PROJECTS, STATS_DATA } from '../data/mockData';

const BASE_URL = '/api/v1';

export interface BackendProjectItem {
  id: number;
  nama_proyek: string;
  kategori: string;
  deskripsi: string;
  latitude: string | number;
  longitude: string | number;
  wilayah_id?: number;
  desa_id?: number | null;
  dinas_id?: number;
  anggaran: string | number;
  status: string;
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

// Convert backend project schema to frontend ProyekItem
export function mapBackendToProyekItem(p: BackendProjectItem): ProyekItem {
  let cat = p.kategori.toLowerCase();
  if (cat === 'jembatan') cat = 'jalan';
  if (cat === 'gedung_publik') cat = 'fasilitas';
  
  return {
    id: p.id,
    nama_proyek: p.nama_proyek,
    kategori: cat as any,
    deskripsi: p.deskripsi || '',
    latitude: Number(p.latitude) || -7.1195,
    longitude: Number(p.longitude) || 112.4154,
    wilayah_id: p.wilayah_id || 1,
    desa_id: p.desa_id ?? null,
    dinas_id: p.dinas_id || 1,
    anggaran: Number(p.anggaran) || 0,
    status: (p.status === 'tertunda' ? 'ditangguhkan' : p.status) as any,
    progres_persen: p.progres_persen || 0,
    tanggal_mulai: p.tanggal_mulai || '2024-01-01',
    estimasi_selesai: p.estimasi_selesai || '2024-12-31',
    nama_wilayah: p.nama_wilayah || 'Kabupaten Lamongan',
    nama_desa: p.nama_desa,
    nama_dinas: p.nama_dinas || 'Dinas Pekerjaan Umum Kab. Lamongan',
    rata_rata_rating: p.rata_rata_rating || 4.5,
    jumlah_rating: p.jumlah_rating || 10,
    tahap_terkini: p.tahap_terkini || 'Pekerjaan konstruksi lapangan',
  };
}

export const apiService = {
  // Fetch projects from backend
  async getProjects(): Promise<{ projects: ProyekItem[]; isFromBackend: boolean }> {
    try {
      const res = await fetch(`${BASE_URL}/proyek?page=1&page_size=50`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data && Array.isArray(data.items) && data.items.length > 0) {
        const backendProjects = data.items.map(mapBackendToProyekItem);
        // Merge or return backend projects + preserve mock projects if needed
        return { projects: backendProjects, isFromBackend: true };
      }
      return { projects: INITIAL_PROJECTS, isFromBackend: false };
    } catch (err) {
      console.warn('Backend API /proyek not reached, using fallback mock data:', err);
      return { projects: INITIAL_PROJECTS, isFromBackend: false };
    }
  },

  // Fetch dashboard stats from backend
  async getStats(): Promise<StatSummary> {
    try {
      const res = await fetch(`${BASE_URL}/stats/dashboard`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      return {
        totalProyek: `${data.total_proyek}+`,
        totalProyekCount: data.total_proyek || 247,
        totalAnggaran: `Rp ${(Number(data.total_anggaran || 0) / 1000000000).toFixed(1)}M`,
        totalWarga: `${data.total_laporan || 12} Laporan`,
        totalDinas: 18,
      };
    } catch (err) {
      console.warn('Backend API /stats/dashboard not reached, using fallback mock data:', err);
      return STATS_DATA;
    }
  },

  // Fetch wilayah aggregate stats
  async getWilayahStats(): Promise<WilayahStatItem[]> {
    try {
      const res = await fetch(`${BASE_URL}/stats/wilayah`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend API /stats/wilayah not reached:', err);
      return [];
    }
  },

  // Fetch kabupaten executive summary stats
  async getRingkasanStats(): Promise<RingkasanKabupatenItem | null> {
    try {
      const res = await fetch(`${BASE_URL}/stats/ringkasan`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend API /stats/ringkasan not reached:', err);
      return null;
    }
  },

  // Fetch sub-wilayah / desa by level and parent_id
  async getWilayah(level?: string, parentId?: number): Promise<WilayahOptionItem[]> {
    try {
      const params = new URLSearchParams();
      if (level) params.append('level', level);
      if (parentId !== undefined) params.append('parent_id', String(parentId));
      const url = `${BASE_URL}/wilayah${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend API /wilayah fetch failed:', err);
      return [];
    }
  },

  // Login with backend
  async login(email: string, password: string): Promise<{ user: UserProfile; token: string }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Email atau kata sandi tidak valid.');
    }

    const data = await res.json();
    const token = data.access_token;
    localStorage.setItem('civictrack_token', token);

    let role: UserProfile['role'] = 'warga';
    if (data.user?.role === 'pimpinan_instansi' || data.user?.role === 'aparatur_pemerintah') {
      role = 'aparatur_pemerintah';
    } else if (data.user?.role === 'admin_dinas' || data.user?.role === 'penanggung_jawab' || data.user?.role === 'pemerintah') {
      role = 'penanggung_jawab';
    }

    const user: UserProfile = {
      id: data.user?.id || 1,
      nama: data.user?.nama || 'Pengguna',
      email: data.user?.email || email,
      role: role,
      dinas_id: data.user?.dinas_id,
      nama_dinas: data.user?.nama_dinas,
    };

    return { user, token };
  },

  // Register with backend
  async register(nama: string, email: string, password: string, role: string = 'warga'): Promise<{ user: UserProfile; token: string }> {
    let backendRole = 'warga';
    if (role === 'penanggung_jawab' || role === 'pemerintah' || role === 'admin') backendRole = 'admin_dinas';
    if (role === 'aparatur_pemerintah' || role === 'pimpinan') backendRole = 'pimpinan_instansi';

    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama, email, password, role: backendRole }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Gagal melakukan pendaftaran.');
    }

    const data = await res.json();
    const token = data.access_token;
    localStorage.setItem('civictrack_token', token);

    let normalizedRole: UserProfile['role'] = 'warga';
    if (role === 'aparatur_pemerintah' || role === 'pimpinan') normalizedRole = 'aparatur_pemerintah';
    if (role === 'penanggung_jawab' || role === 'pemerintah' || role === 'admin') normalizedRole = 'penanggung_jawab';

    const user: UserProfile = {
      id: data.user?.id || 1,
      nama: data.user?.nama || nama,
      email: data.user?.email || email,
      role: normalizedRole,
    };

    return { user, token };
  }
};
