import type {
  ProyekItem,
  ProyekUpdatePayload,
  ProyekCreatePayload,
  TahapanCreatePayload,
  TahapanResponseItem,
  LaporanCreatePayload,
  LaporanTanggapiPayload,
  LaporanResponseItem,
  RatingCreatePayload,
  RatingResponseItem,
  RatingSummaryResponseItem,
  EvaluasiCreatePayload,
  EvaluasiVerifikasiPayload,
  EvaluasiResponseItem,
  EvaluasiStatusType,
  UserProfile,
  StatSummary,
  WilayahStatItem,
  RingkasanKabupatenItem,
  WilayahOptionItem,
  ApiNotificationItem,
  SubscriptionStatus,
  ApiEvaluationStatusLog,
  LaporanAduan,
  RatingUlasanItem,
  ProjectVerifyAccessResult,
} from '../types';
import { LAMONGAN_DESA_GEOJSON } from '../data/lamonganDesaGeoJSON';
import { INITIAL_PROJECTS, STATS_DATA } from '../data/mockData';
import { MOCK_LAPORAN_WARGA, MOCK_RATING_ULASAN } from '../data/dashboardMockData';

const BASE_URL = '/api/v1';

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('civictrack_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function handleApiError(res: Response, defaultMessage: string): Promise<never> {
  const errData = await res.json().catch(() => ({}));
  let msg = defaultMessage;
  if (errData && errData.detail) {
    if (typeof errData.detail === 'string') {
      msg = errData.detail;
    } else if (Array.isArray(errData.detail)) {
      msg = errData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
    } else {
      msg = JSON.stringify(errData.detail);
    }
  }
  throw new Error(msg);
}

export interface BackendProjectItem {
  id: number;
  nama_proyek: string;
  kategori: string;
  deskripsi?: string;
  latitude: string | number;
  longitude: string | number;
  wilayah_id?: number;
  desa_id?: number | null;
  dinas_id?: number;
  anggaran?: string | number | null;
  status: string;
  progres_persen: number;
  tanggal_mulai?: string;
  estimasi_selesai?: string;
  nama_wilayah?: string;
  nama_desa?: string | null;
  nama_dinas?: string;
  wilayah?: { id: number; nama_wilayah: string };
  desa?: { id: number; nama_wilayah: string } | null;
  dinas?: { id: number; nama_dinas: string };
  kode_proyek?: string;
  kode_akses?: string;
  rata_rata_rating?: number | null;
  jumlah_rating?: number;
  tahap_terkini?: string;
  tahapan_list?: Array<{ nama_tahap: string; progres_persen: number }>;
}

// Convert backend project schema to frontend ProyekItem
export function mapBackendToProyekItem(p: BackendProjectItem): ProyekItem {
  let cat = (p.kategori || 'jalan').toLowerCase();
  if (cat === 'jembatan') cat = 'jalan';
  if (cat === 'gedung_publik') cat = 'fasilitas';

  let tahap = p.tahap_terkini;
  if (!tahap && p.tahapan_list && p.tahapan_list.length > 0) {
    tahap = p.tahapan_list[p.tahapan_list.length - 1].nama_tahap;
  }

  return {
    id: p.id,
    nama_proyek: p.nama_proyek,
    kategori: cat as any,
    deskripsi: p.deskripsi || '',
    latitude: Number(p.latitude) || -7.1195,
    longitude: Number(p.longitude) || 112.4154,
    wilayah_id: p.wilayah_id || (p.wilayah ? p.wilayah.id : 1),
    desa_id: p.desa_id !== undefined ? p.desa_id : (p.desa ? p.desa.id : null),
    dinas_id: p.dinas_id || (p.dinas ? p.dinas.id : 1),
    anggaran: Number(p.anggaran) || 0,
    status: (p.status === 'tertunda' ? 'ditangguhkan' : p.status) as any,
    progres_persen: p.progres_persen || 0,
    tanggal_mulai: p.tanggal_mulai ? String(p.tanggal_mulai).split('T')[0] : '2024-01-01',
    estimasi_selesai: p.estimasi_selesai ? String(p.estimasi_selesai).split('T')[0] : '2024-12-31',
    kode_proyek: p.kode_proyek,
    kode_akses: p.kode_akses,
    nama_wilayah: p.nama_wilayah || p.wilayah?.nama_wilayah || 'Kabupaten Lamongan',
    nama_desa: p.nama_desa || p.desa?.nama_wilayah || undefined,
    nama_dinas: p.nama_dinas || p.dinas?.nama_dinas || 'Dinas Pekerjaan Umum Kab. Lamongan',
    rata_rata_rating: p.rata_rata_rating !== null && p.rata_rata_rating !== undefined ? Number(p.rata_rata_rating) : 4.5,
    jumlah_rating: p.jumlah_rating || 0,
    tahap_terkini: tahap || 'Pekerjaan konstruksi lapangan',
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

  // Fetch sub-wilayah / desa by level and parent_id (API-driven with GeoJSON fallback)
  async getWilayah(level?: string, parentId?: number): Promise<WilayahOptionItem[]> {
    try {
      const params = new URLSearchParams();
      if (level) params.append('level', level);
      if (parentId !== undefined) params.append('parent_id', String(parentId));
      const url = `${BASE_URL}/wilayah${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (err) {
      console.warn('Backend /wilayah tidak terhubung, menggunakan dataset batas spasial desa:', err);
    }

    // Fallback dari dataset spasial LAMONGAN_DESA_GEOJSON
    if (level === 'desa' && parentId !== undefined && LAMONGAN_DESA_GEOJSON?.features) {
      const filtered = LAMONGAN_DESA_GEOJSON.features
        .filter((f: any) => f.properties?.kecamatan_id === parentId)
        .map((f: any) => ({
          id: f.properties.id,
          kode_wilayah: f.properties.kode_wilayah,
          nama_wilayah: f.properties.nama_wilayah,
          level: 'desa',
          parent_id: parentId,
          geom_boundary: JSON.stringify(f.geometry),
        }));
      if (filtered.length > 0) return filtered;
    }
    return [];
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
  },

  // Get current authenticated user profile from backend database
  async getCurrentUser(): Promise<UserProfile | null> {
    const token = localStorage.getItem('civictrack_token');
    if (!token) return null;
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        localStorage.removeItem('civictrack_token');
        return null;
      }
      const data = await res.json();
      let role: UserProfile['role'] = 'warga';
      if (data.role === 'pimpinan_instansi' || data.role === 'aparatur_pemerintah') {
        role = 'aparatur_pemerintah';
      } else if (data.role === 'admin_dinas' || data.role === 'penanggung_jawab' || data.role === 'pemerintah') {
        role = 'penanggung_jawab';
      }
      return {
        id: data.id,
        nama: data.nama,
        email: data.email,
        role: role,
        dinas_id: data.dinas_id,
        nama_dinas: data.dinas?.nama_dinas,
      };
    } catch {
      return null;
    }
  },

  // ── Subscription & Notifikasi ──

  async checkSubscriptionStatus(projectId: number): Promise<SubscriptionStatus> {
    const token = localStorage.getItem('civictrack_token');
    if (!token) return { proyek_id: projectId, is_subscribed: false };
    try {
      const res = await fetch(`${BASE_URL}/proyek/${projectId}/subscribe/status`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return { proyek_id: projectId, is_subscribed: false };
      return await res.json();
    } catch {
      return { proyek_id: projectId, is_subscribed: false };
    }
  },

  async subscribeProject(projectId: number): Promise<SubscriptionStatus> {
    const token = localStorage.getItem('civictrack_token');
    if (!token) throw new Error('Harap masuk terlebih dahulu untuk berlangganan notifikasi.');
    const res = await fetch(`${BASE_URL}/proyek/${projectId}/subscribe`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Gagal berlangganan proyek.');
    }
    return await res.json();
  },

  async unsubscribeProject(projectId: number): Promise<SubscriptionStatus> {
    const token = localStorage.getItem('civictrack_token');
    if (!token) throw new Error('Harap masuk terlebih dahulu.');
    const res = await fetch(`${BASE_URL}/proyek/${projectId}/subscribe`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Gagal berhenti berlangganan.');
    }
    return await res.json();
  },

  async getNotifications(): Promise<ApiNotificationItem[]> {
    const token = localStorage.getItem('civictrack_token');
    if (!token) return [];
    try {
      const res = await fetch(`${BASE_URL}/notifikasi`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  async markNotificationRead(notificationId: number): Promise<ApiNotificationItem | null> {
    const token = localStorage.getItem('civictrack_token');
    if (!token) return null;
    try {
      const res = await fetch(`${BASE_URL}/notifikasi/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async markAllNotificationsRead(): Promise<boolean> {
    const token = localStorage.getItem('civictrack_token');
    if (!token) return false;
    try {
      const res = await fetch(`${BASE_URL}/notifikasi/read-all`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getEvaluationStatusLogs(evalId: number): Promise<ApiEvaluationStatusLog[]> {
    try {
      const res = await fetch(`${BASE_URL}/evaluasi/${evalId}/status-log`, {
        headers: {
          Accept: 'application/json',
        },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  async updateProject(id: number, data: ProyekUpdatePayload): Promise<ProyekItem> {
    const headers = getAuthHeaders();

    const payload: Record<string, any> = { ...data };
    if (payload.kategori === 'fasilitas') {
      payload.kategori = 'gedung_publik';
    }
    if (payload.status === 'ditangguhkan') {
      payload.status = 'tertunda';
    }

    const res = await fetch(`${BASE_URL}/proyek/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      await handleApiError(res, 'Gagal memperbarui data proyek.');
    }

    const updated = await res.json();
    return mapBackendToProyekItem(updated);
  },

  // ── Manajemen Proyek & Linimasa ──

  async createProject(data: ProyekCreatePayload): Promise<ProyekItem> {
    const headers = getAuthHeaders();
    if (!headers['Authorization']) {
      throw new Error('Anda harus login terlebih dahulu untuk membuat proyek baru.');
    }

    let backendKategori = data.kategori;
    if (backendKategori === 'fasilitas') backendKategori = 'gedung_publik';

    let backendStatus = data.status || 'berjalan';
    if (backendStatus === 'ditangguhkan') backendStatus = 'tertunda' as any;

    const payload = {
      ...data,
      kategori: backendKategori,
      anggaran: data.anggaran !== undefined ? Number(data.anggaran) : 0,
      progres_persen: data.progres_persen !== undefined ? Number(data.progres_persen) : 0,
      desa_id: data.desa_id || null,
      status: backendStatus,
    };

    const res = await fetch(`${BASE_URL}/proyek`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      await handleApiError(res, 'Gagal membuat proyek baru.');
    }

    const created = await res.json();
    return mapBackendToProyekItem(created);
  },

  async getProjectDetail(id: number): Promise<ProyekItem> {
    const res = await fetch(`${BASE_URL}/proyek/${id}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      await handleApiError(res, `Gagal mengambil data proyek #${id}.`);
    }
    const item = await res.json();
    return mapBackendToProyekItem(item);
  },

  async createTimelineStage(projectId: number, data: TahapanCreatePayload): Promise<TahapanResponseItem> {
    const headers = getAuthHeaders();
    if (!headers['Authorization']) {
      throw new Error('Anda harus login untuk menambahkan tahapan proyek.');
    }

    const res = await fetch(`${BASE_URL}/proyek/${projectId}/tahapan`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      await handleApiError(res, 'Gagal menambahkan tahapan linimasa.');
    }

    return await res.json();
  },

  async verifyProjectAccess(kode_proyek: string, kode_akses: string): Promise<ProjectVerifyAccessResult> {
    const res = await fetch(`${BASE_URL}/proyek/verify-access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        kode_proyek: kode_proyek.trim().toUpperCase(),
        kode_akses: kode_akses.trim(),
      }),
    });

    if (!res.ok) {
      await handleApiError(res, 'Verifikasi kode proyek atau kunci akses gagal.');
    }

    const data = await res.json();
    return {
      success: data.success,
      message: data.message,
      proyek: data.proyek ? mapBackendToProyekItem(data.proyek) : undefined,
    };
  },

  async getWilayahList(level?: 'kabupaten' | 'kecamatan' | 'desa', parentId?: number): Promise<Array<{ id: number; kode_wilayah: string; nama_wilayah: string; level: string; parent_id?: number | null }>> {
    const params = new URLSearchParams();
    if (level) params.append('level', level);
    if (parentId !== undefined && parentId !== null) params.append('parent_id', String(parentId));

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${BASE_URL}/wilayah${query}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      return [];
    }
    return await res.json();
  },

  // ── Laporan & Pengaduan Warga ──

  async submitLaporan(
    projectId: number,
    data: LaporanCreatePayload,
    extraMeta?: {
      nama_proyek?: string;
      nama_pelapor?: string;
      email_pelapor?: string;
      judul?: string;
      kategori_aduan?: string;
    }
  ): Promise<LaporanResponseItem> {
    const headers = getAuthHeaders();
    let resData: LaporanResponseItem | null = null;

    if (headers['Authorization']) {
      const res = await fetch(`${BASE_URL}/proyek/${projectId}/laporan`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (res.ok) {
        resData = await res.json();
      } else {
        await handleApiError(res, 'Gagal mengirimkan laporan pengaduan.');
      }
    } else {
      throw new Error('Harap masuk terlebih dahulu untuk mengirimkan pengaduan.');
    }

    const reportId = resData ? resData.id : Date.now();
    let parsedJudul = extraMeta?.judul || 'Aduan Warga';
    let parsedIsi = data.isi_laporan;
    if (!extraMeta?.judul && data.isi_laporan.includes(': ')) {
      const parts = data.isi_laporan.split(': ');
      parsedJudul = parts[0];
      parsedIsi = parts.slice(1).join(': ');
    }

    const localItem: LaporanAduan = {
      id: reportId,
      proyek_id: projectId,
      nama_proyek: extraMeta?.nama_proyek || resData?.nama_proyek || `Proyek #${projectId}`,
      user_id: resData?.user_id || 1,
      nama_pelapor: extraMeta?.nama_pelapor || resData?.pelapor?.nama || 'Warga Masyarakat',
      email_pelapor: extraMeta?.email_pelapor || resData?.pelapor?.email || 'warga@civictrack.id',
      judul: parsedJudul,
      isi_laporan: parsedIsi,
      kategori_aduan: extraMeta?.kategori_aduan || 'Pengaduan Teknis Lapangan',
      status: 'menunggu',
      tanggal_lapor: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
    };

    // Save to localStorage for instant cross-tab and cross-role synchronization
    try {
      const saved = localStorage.getItem('civictrack_submitted_reports');
      const list: LaporanAduan[] = saved ? JSON.parse(saved) : [];
      localStorage.setItem(
        'civictrack_submitted_reports',
        JSON.stringify([localItem, ...list.filter((item) => item.id !== localItem.id)])
      );
    } catch {
      // ignore
    }

    // Dispatch global event for instant UI update across active components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('civictrack_new_aduan', { detail: localItem }));
    }

    if (resData) return resData;

    return {
      id: reportId,
      proyek_id: projectId,
      nama_proyek: localItem.nama_proyek,
      user_id: localItem.user_id,
      isi_laporan: data.isi_laporan,
      status_tindak_lanjut: 'baru',
      created_at: new Date().toISOString(),
      pelapor: {
        id: localItem.user_id,
        nama: localItem.nama_pelapor,
        email: localItem.email_pelapor,
        role: 'warga',
      },
    };
  },

  async getAllReports(): Promise<LaporanAduan[]> {
    let backendItems: LaporanAduan[] = [];
    try {
      const res = await fetch(`${BASE_URL}/laporan`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data: LaporanResponseItem[] = await res.json();
        backendItems = data.map((item) => {
          let judul = 'Aduan Warga';
          let isi = item.isi_laporan;
          if (item.isi_laporan.includes(': ')) {
            const parts = item.isi_laporan.split(': ');
            judul = parts[0];
            isi = parts.slice(1).join(': ');
          } else if (item.isi_laporan.length > 50) {
            judul = item.isi_laporan.slice(0, 47) + '...';
          }

          let statusAduan: 'menunggu' | 'diproses' | 'selesai' | 'ditolak' = 'menunggu';
          if (item.status_tindak_lanjut === 'diproses') statusAduan = 'diproses';
          else if (item.status_tindak_lanjut === 'ditanggapi') statusAduan = 'selesai';
          else if (item.status_tindak_lanjut === 'ditolak') statusAduan = 'ditolak';

          const pet = item.penanggap?.nama || (item.ditanggapi_oleh ? `Petugas #${item.ditanggapi_oleh}` : undefined);

          return {
            id: item.id,
            proyek_id: item.proyek_id,
            nama_proyek: item.nama_proyek || `Proyek #${item.proyek_id}`,
            user_id: item.user_id,
            nama_pelapor: item.pelapor?.nama || 'Warga Masyarakat',
            email_pelapor: item.pelapor?.email || 'warga@civictrack.id',
            judul,
            isi_laporan: isi,
            kategori_aduan: 'Pengaduan Teknis Lapangan',
            status: statusAduan,
            tanggal_lapor: new Date(item.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
            tanggapan_dinas: item.tanggapan_dinas || undefined,
            tanggal_tanggapan: item.tanggapan_dinas
              ? new Date(item.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })
              : undefined,
            petugas_penjawab: pet,
          };
        });
      }
    } catch (err) {
      console.warn('Gagal memuat aduan dari backend:', err);
    }

    // Retrieve locally submitted reports
    let localSubmitted: LaporanAduan[] = [];
    try {
      const saved = localStorage.getItem('civictrack_submitted_reports');
      if (saved) {
        localSubmitted = JSON.parse(saved);
      }
    } catch {
      // ignore
    }

    const existingIds = new Set(backendItems.map((b) => b.id));
    const uniqueLocal = localSubmitted.filter((l) => !existingIds.has(l.id));

    // Combine local + backend (newest first)
    const combined = [...uniqueLocal, ...backendItems];
    const combinedIds = new Set(combined.map((c) => c.id));
    const uniqueMocks = MOCK_LAPORAN_WARGA.filter((m) => !combinedIds.has(m.id));

    return [...combined, ...uniqueMocks];
  },

  async getProjectReports(projectId: number): Promise<LaporanResponseItem[]> {
    const res = await fetch(`${BASE_URL}/proyek/${projectId}/laporan`, {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      await handleApiError(res, 'Gagal memuat daftar laporan proyek.');
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async replyAduan(reportId: number, data: LaporanTanggapiPayload): Promise<LaporanResponseItem | null> {
    const headers = getAuthHeaders();
    let resData: LaporanResponseItem | null = null;
    if (headers['Authorization']) {
      try {
        const res = await fetch(`${BASE_URL}/laporan/${reportId}/tanggapi`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(data),
        });
        if (res.ok) {
          resData = await res.json();
        }
      } catch (err) {
        console.warn('Backend replyAduan failed:', err);
      }
    }

    // Also update locally cached report
    try {
      const saved = localStorage.getItem('civictrack_submitted_reports');
      if (saved) {
        const list: LaporanAduan[] = JSON.parse(saved);
        const updated = list.map((item) =>
          item.id === reportId
            ? {
                ...item,
                status: (data.status_tindak_lanjut === 'ditanggapi' ? 'selesai' : data.status_tindak_lanjut) as any,
                tanggapan_dinas: data.tanggapan_dinas,
                tanggal_tanggapan: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
              }
            : item
        );
        localStorage.setItem('civictrack_submitted_reports', JSON.stringify(updated));
      }
    } catch {
      // ignore
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('civictrack_replied_aduan', {
          detail: {
            reportId,
            status: data.status_tindak_lanjut,
            tanggapan_dinas: data.tanggapan_dinas,
          },
        })
      );
    }

    return resData;
  },

  async updateLaporan(
    reportId: number,
    data: LaporanCreatePayload,
    extraMeta?: {
      judul?: string;
      kategori_aduan?: string;
    }
  ): Promise<LaporanResponseItem> {
    const headers = getAuthHeaders();
    if (!headers['Authorization']) {
      throw new Error('Harap masuk terlebih dahulu untuk mengedit pengaduan.');
    }

    const res = await fetch(`${BASE_URL}/laporan/${reportId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      await handleApiError(res, 'Gagal memperbarui laporan pengaduan.');
    }

    const resData: LaporanResponseItem = await res.json();

    let parsedJudul = extraMeta?.judul || 'Aduan Warga';
    let parsedIsi = data.isi_laporan;
    if (!extraMeta?.judul && data.isi_laporan.includes(': ')) {
      const parts = data.isi_laporan.split(': ');
      parsedJudul = parts[0];
      parsedIsi = parts.slice(1).join(': ');
    }

    // Update in localStorage as well
    try {
      const saved = localStorage.getItem('civictrack_submitted_reports');
      if (saved) {
        const list: LaporanAduan[] = JSON.parse(saved);
        const updated = list.map((item) =>
          item.id === reportId
            ? {
                ...item,
                judul: parsedJudul,
                isi_laporan: parsedIsi,
                kategori_aduan: extraMeta?.kategori_aduan || item.kategori_aduan,
              }
            : item
        );
        localStorage.setItem('civictrack_submitted_reports', JSON.stringify(updated));
      }
    } catch {
      // ignore
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('civictrack_updated_aduan', {
          detail: {
            id: reportId,
            judul: parsedJudul,
            isi_laporan: parsedIsi,
            kategori_aduan: extraMeta?.kategori_aduan,
          },
        })
      );
    }

    return resData;
  },

  async getReportDetail(reportId: number): Promise<LaporanAduan | null> {
    try {
      const res = await fetch(`${BASE_URL}/laporan/${reportId}`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const item: LaporanResponseItem = await res.json();
        let judul = 'Aduan Warga';
        let isi = item.isi_laporan;
        if (item.isi_laporan.includes(': ')) {
          const parts = item.isi_laporan.split(': ');
          judul = parts[0];
          isi = parts.slice(1).join(': ');
        } else if (item.isi_laporan.length > 50) {
          judul = item.isi_laporan.slice(0, 47) + '...';
        }

        let statusAduan: 'menunggu' | 'diproses' | 'selesai' | 'ditolak' = 'menunggu';
        if (item.status_tindak_lanjut === 'diproses') statusAduan = 'diproses';
        else if (item.status_tindak_lanjut === 'ditanggapi') statusAduan = 'selesai';
        else if (item.status_tindak_lanjut === 'ditolak') statusAduan = 'ditolak';

        const pet = item.penanggap?.nama || (item.ditanggapi_oleh ? `Petugas #${item.ditanggapi_oleh}` : undefined);

        return {
          id: item.id,
          proyek_id: item.proyek_id,
          nama_proyek: item.nama_proyek || `Proyek #${item.proyek_id}`,
          user_id: item.user_id,
          nama_pelapor: item.pelapor?.nama || 'Warga Masyarakat',
          email_pelapor: item.pelapor?.email || 'warga@civictrack.id',
          judul,
          isi_laporan: isi,
          kategori_aduan: 'Pengaduan Teknis Lapangan',
          status: statusAduan,
          tanggal_lapor: new Date(item.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
          tanggapan_dinas: item.tanggapan_dinas || undefined,
          tanggal_tanggapan: item.tanggapan_dinas ? new Date(item.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : undefined,
          petugas_penjawab: pet,
        };
      }
    } catch {
      // ignore
    }

    // Fallback to local storage if available
    try {
      const saved = localStorage.getItem('civictrack_submitted_reports');
      if (saved) {
        const list: LaporanAduan[] = JSON.parse(saved);
        const found = list.find((item) => item.id === reportId);
        if (found) return found;
      }
    } catch {}

    return null;
  },

  // ── Rating & Ulasan Warga ──

  async submitRating(
    projectId: number,
    data: RatingCreatePayload,
    extraMeta?: {
      nama_proyek?: string;
      user_id?: number;
      nama_warga?: string;
      aspek_kualitas?: number;
      aspek_ketepatan_waktu?: number;
      aspek_manfaat?: number;
    }
  ): Promise<RatingResponseItem> {
    const headers = getAuthHeaders();
    if (!headers['Authorization']) {
      throw new Error('Harap masuk terlebih dahulu untuk memberikan penilaian.');
    }

    let resData: RatingResponseItem | null = null;
    try {
      const res = await fetch(`${BASE_URL}/proyek/${projectId}/rating`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (res.ok) {
        resData = await res.json();
      } else {
        await handleApiError(res, 'Gagal mengirimkan penilaian kepuasan.');
      }
    } catch (err: any) {
      console.warn('Backend rating endpoint error, saving locally:', err);
    }

    const ratingId = resData?.id || Date.now();
    const localItem: RatingUlasanItem = {
      id: ratingId,
      proyek_id: projectId,
      nama_proyek: extraMeta?.nama_proyek || resData?.nama_proyek || `Proyek #${projectId}`,
      user_id: extraMeta?.user_id || resData?.user_id || 1,
      nama_warga: extraMeta?.nama_warga || resData?.nama_user || 'Warga Masyarakat',
      bintang: resData?.skor ?? data.skor,
      komentar: resData?.komentar ?? data.komentar ?? '',
      aspek_kualitas: extraMeta?.aspek_kualitas ?? data.skor,
      aspek_ketepatan_waktu: extraMeta?.aspek_ketepatan_waktu ?? data.skor,
      aspek_manfaat: extraMeta?.aspek_manfaat ?? data.skor,
      tanggal: new Date().toISOString().split('T')[0],
    };

    // Save to localStorage for instant persistence across refreshes & tabs
    try {
      const saved = localStorage.getItem('civictrack_submitted_ratings');
      const list: RatingUlasanItem[] = saved ? JSON.parse(saved) : [];
      localStorage.setItem(
        'civictrack_submitted_ratings',
        JSON.stringify([
          localItem,
          ...list.filter((item) => item.id !== localItem.id && !(item.proyek_id === projectId && item.user_id === localItem.user_id)),
        ])
      );
    } catch {
      // ignore
    }

    // Dispatch global event for instant UI update across active components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('civictrack_new_rating', { detail: localItem }));
    }

    if (resData) return resData;

    return {
      id: ratingId,
      proyek_id: projectId,
      user_id: localItem.user_id,
      skor: localItem.bintang,
      komentar: localItem.komentar,
      created_at: new Date().toISOString(),
      nama_user: localItem.nama_warga,
      nama_proyek: localItem.nama_proyek,
    };
  },

  async getProjectRatingSummary(projectId: number): Promise<RatingSummaryResponseItem> {
    const res = await fetch(`${BASE_URL}/proyek/${projectId}/rating`, {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      await handleApiError(res, 'Gagal memuat ringkasan rating.');
    }

    return await res.json();
  },

  async getProjectReviews(projectId: number): Promise<RatingResponseItem[]> {
    const res = await fetch(`${BASE_URL}/proyek/${projectId}/ulasan`, {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      await handleApiError(res, 'Gagal memuat ulasan warga.');
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async getAllReviews(): Promise<RatingUlasanItem[]> {
    let backendItems: RatingUlasanItem[] = [];

    try {
      const res = await fetch(`${BASE_URL}/ulasan`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          backendItems = data.map((item: any) => ({
            id: item.id,
            proyek_id: item.proyek_id,
            nama_proyek: item.nama_proyek || `Proyek #${item.proyek_id}`,
            user_id: item.user_id,
            nama_warga: item.nama_user || 'Warga Masyarakat',
            bintang: item.skor,
            komentar: item.komentar || '',
            aspek_kualitas: item.skor,
            aspek_ketepatan_waktu: item.skor,
            aspek_manfaat: item.skor,
            tanggal: item.created_at ? String(item.created_at).split('T')[0] : new Date().toISOString().split('T')[0],
          }));
        }
      }
    } catch (err) {
      console.warn('Gagal memuat ulasan dari backend:', err);
    }

    // Retrieve locally submitted ratings
    let localSubmitted: RatingUlasanItem[] = [];
    try {
      const saved = localStorage.getItem('civictrack_submitted_ratings');
      if (saved) {
        localSubmitted = JSON.parse(saved);
      }
    } catch {
      // ignore
    }

    // Merge: local first, then backend (avoid duplicates), then mock items as fallback
    const localIds = new Set(localSubmitted.map((l) => l.id));
    const uniqueBackend = backendItems.filter((b) => !localIds.has(b.id));

    const combined = [...localSubmitted, ...uniqueBackend];
    const combinedIds = new Set(combined.map((c) => c.id));
    const uniqueMocks = MOCK_RATING_ULASAN.filter((m) => !combinedIds.has(m.id));

    return [...combined, ...uniqueMocks];
  },

  // ── Evaluasi Cacat Pembangunan Pasca-Proyek ──

  async submitEvaluasi(projectId: number, data: EvaluasiCreatePayload): Promise<EvaluasiResponseItem> {
    const headers = getAuthHeaders();
    if (!headers['Authorization']) {
      throw new Error('Harap masuk terlebih dahulu untuk mengajukan evaluasi proyek.');
    }

    const res = await fetch(`${BASE_URL}/proyek/${projectId}/evaluasi`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      await handleApiError(res, 'Gagal mengajukan evaluasi cacat pembangunan.');
    }

    return await res.json();
  },

  async getEvaluations(filters?: { status?: string; proyek_id?: number; min_urgensi?: number }): Promise<EvaluasiResponseItem[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.proyek_id !== undefined) params.append('proyek_id', String(filters.proyek_id));
    if (filters?.min_urgensi !== undefined) params.append('min_urgensi', String(filters.min_urgensi));

    const url = `${BASE_URL}/evaluasi${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });

    if (!res.ok) {
      await handleApiError(res, 'Gagal memuat daftar evaluasi.');
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async getEvaluationDetail(evalId: number): Promise<EvaluasiResponseItem> {
    const res = await fetch(`${BASE_URL}/evaluasi/${evalId}`, {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      await handleApiError(res, `Gagal memuat detail evaluasi #${evalId}.`);
    }

    return await res.json();
  },

  async verifyEvaluation(evalId: number, data: EvaluasiVerifikasiPayload): Promise<EvaluasiResponseItem> {
    const headers = getAuthHeaders();
    if (!headers['Authorization']) {
      throw new Error('Anda harus login untuk memverifikasi evaluasi.');
    }

    let backendStatus: EvaluasiStatusType = data.status;
    if (backendStatus === 'dalam_penanganan') {
      backendStatus = 'terverifikasi_perlu_tindak_lanjut';
    } else if (backendStatus === 'selesai_diperbaiki') {
      backendStatus = 'selesai_ditindaklanjuti';
    } else if (backendStatus === 'ditolak') {
      backendStatus = 'ditolak_tidak_terbukti';
    }

    const res = await fetch(`${BASE_URL}/evaluasi/${evalId}/verifikasi`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        status: backendStatus,
        catatan: data.catatan,
      }),
    });

    if (!res.ok) {
      await handleApiError(res, 'Gagal memverifikasi evaluasi.');
    }

    return await res.json();
  }
};
