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
    submitRating: vi.fn(),
    getAllReviews: vi.fn(),
    getProjectDetail: vi.fn(),
  },
}));

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
    localStorage.clear();
    vi.mocked(apiService.getEvaluations).mockResolvedValue([]);
    vi.mocked(apiService.submitLaporan).mockResolvedValue({ id: 99 } as any);
    vi.mocked(apiService.submitRating).mockImplementation(async (id, data, meta) => {
      const res = {
        id: 999,
        proyek_id: id,
        user_id: 10,
        skor: data.skor,
        bintang: data.skor,
        komentar: data.komentar,
        created_at: new Date().toISOString(),
        nama_user: meta?.nama_warga || 'mione',
        nama_warga: meta?.nama_warga || 'mione',
        nama_proyek: meta?.nama_proyek || 'Proyek Selesai',
        aspek_kualitas: meta?.aspek_kualitas || 5,
        aspek_ketepatan_waktu: meta?.aspek_ketepatan_waktu || 5,
        aspek_manfaat: meta?.aspek_manfaat || 5,
        tanggal: new Date().toISOString().split('T')[0],
      };
      const saved = localStorage.getItem('civictrack_submitted_ratings');
      const list = saved ? JSON.parse(saved) : [];
      localStorage.setItem('civictrack_submitted_ratings', JSON.stringify([res, ...list]));
      return res as any;
    });
    vi.mocked(apiService.getAllReviews).mockImplementation(async () => {
      const saved = localStorage.getItem('civictrack_submitted_ratings');
      return saved ? JSON.parse(saved) : [];
    });
    vi.mocked(apiService.getProjectDetail).mockResolvedValue({ id: 100 } as any);
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

  it('renders Rute Alternatif AI button on all subscribed projects and calls onOpenAIRoute when clicked', async () => {
    const handleOpenAIRoute = vi.fn();
    render(
      <WargaDashboard
        currentUser={mockUser}
        projects={mockProjects}
        onOpenProjectDetail={() => {}}
        onOpenAIRoute={handleOpenAIRoute}
        activeSection="langganan"
      />
    );

    // All 3 mock subscribed projects should have the AI route button
    const routeButtons = screen.getAllByTitle('Rute Alternatif AI');
    expect(routeButtons.length).toBe(3);

    // Click the second route button (which is a 'taman' category project)
    fireEvent.click(routeButtons[1]);
    expect(handleOpenAIRoute).toHaveBeenCalled();
  });

  it('synchronizes rating parameter detail sliders and overall stars in real time', async () => {
    render(
      <WargaDashboard
        currentUser={mockUser}
        projects={mockProjects}
        onOpenProjectDetail={() => {}}
        onOpenAIRoute={() => {}}
        activeSection="rating"
      />
    );

    // Initial state: 5.0 / 5.0 and Sangat Memuaskan
    expect(screen.getByText('5.0')).toBeInTheDocument();
    expect(screen.getByText('Sangat Memuaskan')).toBeInTheDocument();

    // Find step button '1' for "Mutu & Kerapian Fisik" and click it
    const step1KualitasBtn = screen.getByTitle('Pilih nilai 1 untuk Mutu & Kerapian Fisik');
    fireEvent.click(step1KualitasBtn);

    // Average becomes (1 + 5 + 5) / 3 = 3.66... => 3.7 / 5.0
    // Descriptor becomes 'Baik & Memuaskan'
    expect(screen.getByText('3.7')).toBeInTheDocument();
    expect(screen.getByText('Baik & Memuaskan')).toBeInTheDocument();

    // Click overall star button for 2 stars
    const star2Btn = screen.getByTitle(/Beri rating 2 bintang/i);
    fireEvent.click(star2Btn);

    // All parameters synchronize to 2 => average 2.0 / 5.0, Kurang Memuaskan
    expect(screen.getByText('2.0')).toBeInTheDocument();
    expect(screen.getByText('Kurang Memuaskan')).toBeInTheDocument();
    expect(screen.getAllByText('2 / 5').length).toBeGreaterThanOrEqual(3);
  });

  it('persists newly submitted rating reviews so they remain visible after page refresh', async () => {
    localStorage.clear();
    const user = userEvent.setup();

    const { unmount } = render(
      <WargaDashboard
        currentUser={mockUser}
        projects={mockProjects}
        onOpenProjectDetail={() => {}}
        onOpenAIRoute={() => {}}
        activeSection="rating"
      />
    );

    // Type a review comment
    const commentInput = screen.getByPlaceholderText(/Bagikan pengalaman atau dampak positif/i);
    await user.type(commentInput, 'Mantap sekali pengerjaannya sangat rapi!');

    // Submit review
    const submitRatingBtn = screen.getByRole('button', { name: /Kirim Penilaian Kepuasan/i });
    await user.click(submitRatingBtn);

    // The review should be displayed immediately
    expect(await screen.findByText(/"Mantap sekali pengerjaannya sangat rapi!"/i)).toBeInTheDocument();

    // Verify localStorage has persisted the rating
    const saved = localStorage.getItem('civictrack_submitted_ratings');
    expect(saved).not.toBeNull();
    expect(saved).toContain('Mantap sekali pengerjaannya sangat rapi!');

    // Simulate page refresh: unmount and remount component
    unmount();

    render(
      <WargaDashboard
        currentUser={mockUser}
        projects={mockProjects}
        onOpenProjectDetail={() => {}}
        onOpenAIRoute={() => {}}
        activeSection="rating"
      />
    );

    // After refresh / remount, the persisted review MUST still be present
    expect(screen.getByText(/"Mantap sekali pengerjaannya sangat rapi!"/i)).toBeInTheDocument();
  });
});
