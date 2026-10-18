import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WargaDashboard } from './WargaDashboard';
import { apiService } from '../../services/api';
import type { ProyekItem } from '../../types';

vi.mock('../../services/api', () => ({
  apiService: {
    getEvaluations: vi.fn(),
    submitLaporan: vi.fn(),
  },
}));

describe('WargaDashboard', () => {
  const mockUser = {
    id: 10,
    role: 'warga' as const,
    nama: 'mione',
    email: 'mione@gmail.com',
  };

  const mockProjects: ProyekItem[] = [
    {
      id: 99,
      nama_proyek: 'Pelebaran Jalan Soekarno Hatta',
      deskripsi: 'Proyek pelebaran jalan utama',
      wilayah_id: 23,
      status: 'berjalan',
      kategori: 'jalan',
      anggaran: 5000000000,
      latitude: -7.118,
      longitude: 112.416,
      progres_persen: 45,
    },
    {
      id: 100,
      nama_proyek: 'Normalisasi Drainase Jl. Babat',
      deskripsi: 'Proyek normalisasi saluran air',
      wilayah_id: 23,
      status: 'selesai',
      kategori: 'drainase',
      anggaran: 2500000000,
      latitude: -7.12,
      longitude: 112.42,
      progres_persen: 100,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiService.getEvaluations).mockResolvedValue([]);
    vi.mocked(apiService.submitLaporan).mockResolvedValue({ id: 99 } as any);
  });

  it('renders hero banner with greeting and "+ Buat Laporan / Masukan Baru" button', () => {
    render(
      <WargaDashboard
        currentUser={mockUser}
        projects={mockProjects}
        onOpenProjectDetail={() => {}}
        onOpenAIRoute={() => {}}
      />
    );

    expect(screen.getByText(/Selamat Datang, mione!/i)).toBeInTheDocument();
    const reportBtn = screen.getByRole('button', { name: /Buat Laporan \/ Masukan Baru/i });
    expect(reportBtn).toBeInTheDocument();
  });

  it('opens responsive modal when "+ Buat Laporan / Masukan Baru" is clicked and can be closed via X button', async () => {
    const user = userEvent.setup();
    render(
      <WargaDashboard
        currentUser={mockUser}
        projects={mockProjects}
        onOpenProjectDetail={() => {}}
        onOpenAIRoute={() => {}}
      />
    );

    // Modal should not be open initially
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Click "+ Buat Laporan / Masukan Baru"
    const reportBtn = screen.getByRole('button', { name: /Buat Laporan \/ Masukan Baru/i });
    await user.click(reportBtn);

    // Modal is now open
    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
    expect(screen.getByText('Kirim Laporan / Tanggapan Warga')).toBeInTheDocument();

    // Close via X button
    const closeBtn = screen.getByRole('button', { name: /Tutup Modal/i });
    await user.click(closeBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes modal when Batal button or Escape key is pressed', async () => {
    const user = userEvent.setup();
    render(
      <WargaDashboard
        currentUser={mockUser}
        projects={mockProjects}
        onOpenProjectDetail={() => {}}
        onOpenAIRoute={() => {}}
      />
    );

    // Open modal
    const reportBtn = screen.getByRole('button', { name: /Buat Laporan \/ Masukan Baru/i });
    await user.click(reportBtn);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Close via Batal button
    const cancelBtn = screen.getByRole('button', { name: /Batal/i });
    await user.click(cancelBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Reopen modal and test Escape key
    await user.click(reportBtn);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('submits a new report via form inputs and calls apiService.submitLaporan', async () => {
    const user = userEvent.setup();
    render(
      <WargaDashboard
        currentUser={mockUser}
        projects={mockProjects}
        onOpenProjectDetail={() => {}}
        onOpenAIRoute={() => {}}
      />
    );

    // Open modal
    const reportBtn = screen.getByRole('button', { name: /Buat Laporan \/ Masukan Baru/i });
    await user.click(reportBtn);

    // Fill form
    const titleInput = screen.getByPlaceholderText(/Rambu keselamatan malam hari perlu ditambah/i);
    const descInput = screen.getByPlaceholderText(/Jelaskan secara runtut kejadian/i);

    await user.type(titleInput, 'Lampu penerangan mati di sekitar lokasi');
    await user.type(descInput, 'Mohon agar dipasang lampu penerangan tambahan karena sangat gelap saat malam hari.');

    const submitBtn = screen.getByRole('button', { name: /Kirim Laporan Sekarang/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(apiService.submitLaporan).toHaveBeenCalled();
    });

    // Modal closes after submit
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
