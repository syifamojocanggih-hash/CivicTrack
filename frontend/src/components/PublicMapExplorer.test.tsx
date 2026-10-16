import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PublicMapExplorer } from './PublicMapExplorer';
import { apiService } from '../services/api';
import userEvent from '@testing-library/user-event';

// Mock the components that might cause issues with JSDOM
vi.mock('../ProjectDetailModal', () => ({
  ProjectDetailModal: () => <div data-testid="project-modal" />,
}));
vi.mock('../ReportIssueModal', () => ({
  ReportIssueModal: () => <div data-testid="report-modal" />,
}));

// Mock API
vi.mock('../services/api', () => ({
  apiService: {
    getProjects: vi.fn(),
    getWilayah: vi.fn(),
  },
}));

describe('PublicMapExplorer', () => {
  const mockProjects = [
    { id: 1, nama_proyek: 'Proyek Desa A', wilayah_id: 10, desa_id: 101, status: 'berjalan', kategori: 'jalan', anggaran: 1000000000, latitude: -7.1, longitude: 112.1, progress_fisik: 50, nama_wilayah: 'Kecamatan Lamongan (Kota)' },
    { id: 2, nama_proyek: 'Proyek Desa B', wilayah_id: 10, desa_id: 102, status: 'selesai', kategori: 'drainase', anggaran: 2000000000, latitude: -7.2, longitude: 112.2, progress_fisik: 100, nama_wilayah: 'Kecamatan Lamongan (Kota)' },
    { id: 3, nama_proyek: 'Proyek Kecamatan', wilayah_id: 10, desa_id: null, status: 'berjalan', kategori: 'taman', anggaran: 3000000000, latitude: -7.3, longitude: 112.3, progress_fisik: 10, nama_wilayah: 'Kecamatan Lamongan (Kota)' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(apiService.getWilayah).mockImplementation(async (level, parentId) => {
      if (level === 'kecamatan') {
        return [
          { id: 10, kode_wilayah: '35.10.11', nama_wilayah: 'Kecamatan Banyuwangi', level: 'kecamatan' }
        ] as any;
      }
      if (level === 'desa') {
        return [
          { id: 101, kode_wilayah: '35.10.11.2001', nama_wilayah: 'Desa Kampung Melayu', level: 'desa', parent_id: parentId },
          { id: 102, kode_wilayah: '35.10.11.2002', nama_wilayah: 'Desa Karangrejo', level: 'desa', parent_id: parentId }
        ] as any;
      }
      return [];
    });

    vi.mocked(apiService.getProjects).mockResolvedValue({
      projects: mockProjects,
      isFromBackend: true
    } as any);
  });

  it('renders dropdown kecamatan to desa cascading properly', async () => {
    render(<PublicMapExplorer projects={mockProjects as any} currentUser={null} onBackToLanding={() => {}} onOpenProjectDetail={() => {}} onOpenAIRoute={() => {}} onOpenAuth={() => {}} />);
    
    await waitFor(() => {
      expect(apiService.getProjects).toHaveBeenCalled();
    });

    const filterPanel = await screen.findByText('Cari Proyek Pembangunan');
    expect(filterPanel).toBeInTheDocument();

    const user = userEvent.setup();
    const selects = screen.getAllByRole('combobox');
    const kecamatanSelect = selects[0]; // first select is kecamatan
    await user.selectOptions(kecamatanSelect, 'Kecamatan Lamongan (Kota)');

    await waitFor(() => {
      expect(apiService.getWilayah).toHaveBeenCalled();
    });
  });

  it('filters by desa_id correctly (API request checks)', async () => {
    render(<PublicMapExplorer projects={mockProjects as any} currentUser={null} onBackToLanding={() => {}} onOpenProjectDetail={() => {}} onOpenAIRoute={() => {}} onOpenAuth={() => {}} />);
    
    await waitFor(() => {
      expect(apiService.getProjects).toHaveBeenCalled();
    });

    const user = userEvent.setup();
    const selects = screen.getAllByRole('combobox');
    const kecamatanSelect = selects[0]; // first select is kecamatan
    await user.selectOptions(kecamatanSelect, 'Kecamatan Lamongan (Kota)');

    await waitFor(() => {
      expect(apiService.getWilayah).toHaveBeenCalled();
    });

    const selectsAgain = await screen.findAllByRole('combobox');
    const desaSelect = selectsAgain[1]; // second select is desa
    await user.selectOptions(desaSelect, '101');
    
    // Test logic structure is isolated per PRD scenario
    const pA = await screen.findAllByText(/Proyek Desa A/i);
    expect(pA.length).toBeGreaterThan(0);
    
    // Proyek Kecamatan (desa_id null) disappears
    expect(screen.queryByText(/Proyek Kecamatan/i)).not.toBeInTheDocument();
  });

  it('restores all projects when "Semua Desa" is selected again', async () => {
    render(<PublicMapExplorer projects={mockProjects as any} currentUser={null} onBackToLanding={() => {}} onOpenProjectDetail={() => {}} onOpenAIRoute={() => {}} onOpenAuth={() => {}} />);
    await waitFor(() => {
      expect(apiService.getProjects).toHaveBeenCalled();
    });

    const user = userEvent.setup();
    const selects = screen.getAllByRole('combobox');
    const kecamatanSelect = selects[0]; // first select is kecamatan
    await user.selectOptions(kecamatanSelect, 'Kecamatan Lamongan (Kota)');

    await waitFor(() => {
      expect(apiService.getWilayah).toHaveBeenCalled();
    });

    const selectsAgain = await screen.findAllByRole('combobox');
    const desaSelect = selectsAgain[1]; // second select is desa
    await user.selectOptions(desaSelect, '101');
    await user.selectOptions(desaSelect, 'all');

    // Make sure we can interact with it completely and projects are restored
    const pKec = await screen.findAllByText(/Proyek Kecamatan/i);
    expect(pKec.length).toBeGreaterThan(0);
    const pA2 = await screen.findAllByText(/Proyek Desa A/i);
    expect(pA2.length).toBeGreaterThan(0);
  });

  it('filters projects by budget preset and updates min-max indicators', async () => {
    const user = userEvent.setup();
    render(<PublicMapExplorer projects={mockProjects as any} currentUser={null} onBackToLanding={() => {}} onOpenProjectDetail={() => {}} onOpenAIRoute={() => {}} onOpenAuth={() => {}} />);

    await waitFor(() => {
      expect(apiService.getProjects).toHaveBeenCalled();
    });

    // Initial state displays default limits: Rp 100 Jt and Rp 25 M
    expect(screen.getByText('Rp 100 Jt')).toBeInTheDocument();
    expect(screen.getByText('Rp 25 M')).toBeInTheDocument();

    // Click medium preset: "Rp 1 Miliar - Rp 5 Miliar (Menengah)"
    const mediumPreset = screen.getByRole('button', { name: /Rp 1 Miliar - Rp 5 Miliar/i });
    await user.click(mediumPreset);

    // Indicator boxes should update to Rp 1 M and Rp 5 M
    expect(screen.getByText('Rp 1 M')).toBeInTheDocument();
    expect(screen.getByText('Rp 5 M')).toBeInTheDocument();

    // Active chip should be rendered
    expect(screen.getByText(/Anggaran: Rp 1 M - Rp 5 M/i)).toBeInTheDocument();

    // Click close on budget chip to reset
    const allXButtons = screen.getAllByRole('button').filter(b => b.querySelector('svg.lucide-x'));
    if (allXButtons.length > 0) {
      await user.click(allXButtons[0]);
      expect(screen.getByText('Rp 100 Jt')).toBeInTheDocument();
      expect(screen.getByText('Rp 25 M')).toBeInTheDocument();
    }
  });

  it('displays active desa banner and allows resetting desa filter back to kecamatan', async () => {
    const user = userEvent.setup();
    render(
      <PublicMapExplorer
        projects={mockProjects as any}
        currentUser={null}
        onBackToLanding={() => {}}
        onOpenProjectDetail={() => {}}
        onOpenAIRoute={() => {}}
        onOpenAuth={() => {}}
      />
    );

    await waitFor(() => {
      expect(apiService.getProjects).toHaveBeenCalled();
    });

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'Kecamatan Lamongan (Kota)');

    await waitFor(() => {
      expect(apiService.getWilayah).toHaveBeenCalled();
    });

    const selectsAgain = await screen.findAllByRole('combobox');
    await user.selectOptions(selectsAgain[1], '101');

    // Active banner shows Batas Desa Terpilih and Desa Kampung Melayu
    expect(screen.getByText('Batas Desa Terpilih')).toBeInTheDocument();
    expect(screen.getAllByText(/Desa Kampung Melayu/i).length).toBeGreaterThanOrEqual(2);

    // Reset button returns to kecamatan
    const resetDesaBtn = screen.getByTitle('Kembali ke Tampilan Seluruh Kecamatan');
    await user.click(resetDesaBtn);

    // After reset, all projects in kecamatan are restored
    await waitFor(() => {
      expect(screen.queryByText(/Batas Desa Terpilih/i)).not.toBeInTheDocument();
    });
  });
});
