import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PimpinanDashboard } from './PimpinanDashboard';
import { apiService } from '../../services/api';

// Mock the API service
vi.mock('../../services/api', () => ({
  apiService: {
    getRingkasanStats: vi.fn(),
    getWilayahStats: vi.fn(),
  },
}));

// No mock auth provider needed

describe('PimpinanDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "Sebaran Wilayah" data correctly for normal data', async () => {
    vi.mocked(apiService.getRingkasanStats).mockResolvedValue({
      total_proyek: 10, total_anggaran: 1000000000, rasio_penyerapan_persen: 50, total_warga_terdaftar: 50, total_dinas_terlibat: 5, total_aduan: 2,
    } as any);

    vi.mocked(apiService.getWilayahStats).mockResolvedValue([
      {
        wilayah_id: 1, nama_wilayah: 'Kecamatan Banyuwangi', total_proyek: 10, total_anggaran: 1000000000,
        status_proyek: { berjalan: 5, selesai: 5, tertunda: 0, dalam_peninjauan_ulang: 0 },
        estimasi_penyerapan_anggaran: 500000000, rata_rata_progres: 75.0, jumlah_berjalan: 5, jumlah_selesai: 5, jumlah_tertunda: 0, jumlah_dalam_peninjauan_ulang: 0,
      }
    ]);

    render(<PimpinanDashboard currentUser={{ id: 1, role: 'pimpinan_instansi', nama: 'Bupati', email: 'test@banyuwangi.go.id' }} projects={[]} activeSection="sebaran_wilayah" />);

    expect(await screen.findByText('Kecamatan Banyuwangi')).toBeInTheDocument();
    const ang = screen.getAllByText(/Rp\s?1\.0\s?M/i);
    expect(ang.length).toBeGreaterThan(0);
  });

  it('renders edge case where total_proyek=0 correctly without crashing', async () => {
    vi.mocked(apiService.getRingkasanStats).mockResolvedValue({
      total_proyek: 0, total_anggaran: 0, rasio_penyerapan_persen: 0, total_warga_terdaftar: 50, total_dinas_terlibat: 5, total_aduan: 0,
    } as any);

    vi.mocked(apiService.getWilayahStats).mockResolvedValue([
      {
        wilayah_id: 2, nama_wilayah: 'Kecamatan Glagah', total_proyek: 0, total_anggaran: 0,
        status_proyek: { berjalan: 0, selesai: 0, tertunda: 0, dalam_peninjauan_ulang: 0 },
        estimasi_penyerapan_anggaran: 0, rata_rata_progres: 0, jumlah_berjalan: 0, jumlah_selesai: 0, jumlah_tertunda: 0, jumlah_dalam_peninjauan_ulang: 0,
      }
    ]);

    render(<PimpinanDashboard currentUser={{ id: 1, role: 'pimpinan_instansi', nama: 'Bupati', email: 'test@banyuwangi.go.id' }} projects={[]} activeSection="sebaran_wilayah" />);

    expect(await screen.findByText('Kecamatan Glagah')).toBeInTheDocument();
    expect(screen.getAllByText(/0 Proyek/i).length).toBeGreaterThan(0);
  });
});
