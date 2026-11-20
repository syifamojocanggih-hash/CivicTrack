import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PimpinanDashboard } from './PimpinanDashboard';
import { apiService } from '../../services/api';

// Mock the API service
vi.mock('../../services/api', () => ({
  apiService: {
    getRingkasanStats: vi.fn(),
    getWilayahStats: vi.fn(),
    getLeadTimeAdvantage: vi.fn(),
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

  it('renders OPD performance scores responsively for both decimal and non-decimal numbers', async () => {
    vi.mocked(apiService.getRingkasanStats).mockResolvedValue({
      total_proyek: 10, total_anggaran: 1000000000, rasio_penyerapan_persen: 50, total_warga_terdaftar: 50, total_dinas_terlibat: 5, total_aduan: 2,
    } as any);

    render(
      <PimpinanDashboard
        currentUser={{ id: 1, role: 'pimpinan_instansi', nama: 'Bupati', email: 'test@banyuwangi.go.id' }}
        projects={[]}
        activeSection="kinerja_dinas"
      />
    );

    // Verify table header
    expect(screen.getByText('Tabel Komparasi Efektivitas 5 Organisasi Perangkat Daerah (OPD)')).toBeInTheDocument();
    expect(screen.getByText('Skor Kinerja')).toBeInTheDocument();

    // Verify decimal scores (e.g. 91.8, 96.2, 88.5, 93.4)
    expect(screen.getByText('91.8')).toBeInTheDocument();
    expect(screen.getByText('96.2')).toBeInTheDocument();
    expect(screen.getByText('88.5')).toBeInTheDocument();
    expect(screen.getByText('93.4')).toBeInTheDocument();

    // Verify non-decimal / integer score (e.g. 95)
    expect(screen.getByText('95')).toBeInTheDocument();

    // Verify max score scale suffix
    const maxScoreBadges = screen.getAllByText('/ 100');
    expect(maxScoreBadges.length).toBe(5);
  });

  it('renders "Lead Time Advantage" early-warning metrics panel correctly', async () => {
    vi.mocked(apiService.getRingkasanStats).mockResolvedValue({
      total_proyek: 10,
      total_anggaran: 1000000000,
      rasio_penyerapan_persen: 50,
      total_warga_terdaftar: 50,
      total_dinas_terlibat: 5,
      total_aduan: 2,
    } as any);

    vi.mocked(apiService.getLeadTimeAdvantage).mockResolvedValue({
      avg_lead_time_hari: 18.5,
      label_hari_peringatan_dini: '18.5 Hari Peringatan Dini',
      total_unique_warga_terjangkau: 125,
      tingkat_akurasi_jadwal_hari: 2.1,
      akurasi_status: 'Optimal (+2.1 Hari)',
      total_notifikasi_terkirim: 340,
      breakdown_target_type: {
        radius: 120,
        subscription: 80,
        route_overlap: 140,
      },
      breakdown_priority: {
        normal: 200,
        tinggi: 140,
      },
      tren_lead_time_per_bulan: [
        { bulan: 'Jan 2026', avg_lead_time_hari: 15.0, jumlah_proyek: 4 },
        { bulan: 'Feb 2026', avg_lead_time_hari: 21.0, jumlah_proyek: 6 },
      ],
      warga_terjangkau_per_proyek: [
        {
          proyek_id: 1,
          nama_proyek: 'Pelebaran Jalan Babat',
          unique_warga: 85,
        },
      ],
    });

    render(
      <PimpinanDashboard
        currentUser={{ id: 1, role: 'pimpinan_instansi', nama: 'Bupati', email: 'test@lamongan.go.id' }}
        projects={[]}
        activeSection="lead_time"
      />
    );

    expect(await screen.findByText('Executive Dashboard: Lead Time Advantage')).toBeInTheDocument();
    expect(screen.getByText('18.5 Hari Peringatan Dini')).toBeInTheDocument();
    expect(screen.getByText('Optimal (+2.1 Hari)')).toBeInTheDocument();
    expect(screen.getAllByText('140').length).toBeGreaterThan(0);
  });
});
