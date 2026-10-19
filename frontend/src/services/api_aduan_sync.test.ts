// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiService } from './api';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Aduan Warga & Tanggapan Aparatur Sync & Persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('submitLaporan saves report to localStorage and dispatches event even if backend throws', async () => {
    // Mock fetch to simulate network error or backend constraint error
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error or rate limited'));

    const eventSpy = vi.fn();
    window.addEventListener('civictrack_new_aduan', eventSpy);

    const res = await apiService.submitLaporan(
      1,
      { isi_laporan: 'Perbaikan trotoar: Akses pejalan kaki terhalang puing semen.' },
      {
        nama_proyek: 'Peningkatan Jalan Sukodadi - Sumberwudi (JAMULA)',
        nama_pelapor: 'Ahmad Warga',
        email_pelapor: 'ahmad@lamongan.go.id',
        judul: 'Akses pejalan kaki terhalang puing semen',
        kategori_aduan: 'Pengaduan Teknis Lapangan',
        user_id: 25,
      }
    );

    expect(res).toBeDefined();
    expect(res.proyek_id).toBe(1);
    expect(eventSpy).toHaveBeenCalledTimes(1);

    // Verify localStorage persistence
    const saved = window.localStorage.getItem('civictrack_submitted_reports');
    expect(saved).not.toBeNull();
    const parsed = JSON.parse(saved!);
    expect(parsed.length).toBeGreaterThanOrEqual(1);
    expect(parsed[0].nama_pelapor).toBe('Ahmad Warga');
    expect(parsed[0].status).toBe('menunggu');

    window.removeEventListener('civictrack_new_aduan', eventSpy);
  });

  it('replyAduan stores reply in persistent map and getAllReports reflects the tanggapan after refresh', async () => {
    // Mock backend PUT to simulate offline / mock mode
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
      if (typeof url === 'string' && url.includes('/laporan')) {
        // Return 404 to simulate mock aduan or offline
        return {
          ok: false,
          status: 404,
          json: async () => ({ detail: 'Not Found' }),
        } as any;
      }
      return { ok: true, json: async () => [] } as any;
    });

    const replyEventSpy = vi.fn();
    window.addEventListener('civictrack_replied_aduan', replyEventSpy);

    // Aparatur responds to mock aduan #103
    await apiService.replyAduan(103, {
      status_tindak_lanjut: 'ditanggapi',
      tanggapan_dinas: 'Tim Dinas PUPR telah menginstruksikan percepatan penyelesaian jembatan dalam 7 hari.',
      petugas_penjawab: 'mione (Pemerintah Kabupaten Lamongan)',
    });

    expect(replyEventSpy).toHaveBeenCalledTimes(1);
    expect(replyEventSpy.mock.calls[0][0].detail.reportId).toBe(103);
    expect(replyEventSpy.mock.calls[0][0].detail.status).toBe('selesai');
    expect(replyEventSpy.mock.calls[0][0].detail.tanggapan_dinas).toContain('Dinas PUPR');

    // Simulate page refresh: call getAllReports()
    const allReports = await apiService.getAllReports();
    const aduan103 = allReports.find((r) => r.id === 103);

    expect(aduan103).toBeDefined();
    expect(aduan103!.status).toBe('selesai');
    expect(aduan103!.tanggapan_dinas).toBe('Tim Dinas PUPR telah menginstruksikan percepatan penyelesaian jembatan dalam 7 hari.');
    expect(aduan103!.petugas_penjawab).toBe('mione (Pemerintah Kabupaten Lamongan)');
    expect(aduan103!.tanggal_tanggapan).toBeDefined();

    window.removeEventListener('civictrack_replied_aduan', replyEventSpy);
  });

  it('newly submitted citizen report is visible to aparatur via getAllReports and can be replied to', async () => {
    // 1. Citizen submits report
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [],
    } as any);

    await apiService.submitLaporan(
      4,
      { isi_laporan: 'Lampu jalan padam total di sepanjang proyek Babat - Sukorame.' },
      {
        nama_proyek: 'Rekonstruksi Jalan Poros Babat - Sukorame',
        nama_pelapor: 'Dewi Lestari',
        email_pelapor: 'dewi@lamongan.go.id',
        judul: 'Lampu jalan padam total',
        user_id: 30,
      }
    );

    // 2. Aparatur views all reports
    const reportsForAparatur = await apiService.getAllReports();
    const dewiReport = reportsForAparatur.find((r) => r.nama_pelapor === 'Dewi Lestari');

    expect(dewiReport).toBeDefined();
    expect(dewiReport!.status).toBe('menunggu');
    expect(dewiReport!.judul).toBe('Lampu jalan padam total');

    // 3. Aparatur replies to Dewi's report
    await apiService.replyAduan(dewiReport!.id, {
      status_tindak_lanjut: 'diproses',
      tanggapan_dinas: 'Petugas PJU Dinas Perhubungan dan PU sedang menuju lokasi untuk perbaikan genset & jaringan.',
      petugas_penjawab: 'mione (Pemerintah Kabupaten Lamongan)',
    });

    // 4. Refresh & verify persistence
    const refreshedReports = await apiService.getAllReports();
    const refreshedDewiReport = refreshedReports.find((r) => r.id === dewiReport!.id);

    expect(refreshedDewiReport).toBeDefined();
    expect(refreshedDewiReport!.status).toBe('diproses');
    expect(refreshedDewiReport!.tanggapan_dinas).toContain('Petugas PJU');
    expect(refreshedDewiReport!.petugas_penjawab).toBe('mione (Pemerintah Kabupaten Lamongan)');
  });
});
