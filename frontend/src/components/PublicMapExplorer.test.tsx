import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
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

  it('allows search & filter panel and project detail panel to be open simultaneously on desktop', async () => {
    // Simulate desktop width
    window.innerWidth = 1280;
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

    // Left sidebar is initially visible
    const searchHeader = screen.getByText('Cari Proyek Pembangunan');
    expect(searchHeader).toBeInTheDocument();
    const leftAside = searchHeader.closest('aside');
    expect(leftAside).toHaveClass('translate-x-0');

    // Click on a project in the search list to open detail
    const projectCards = await screen.findAllByText(/Proyek Desa A/i);
    await user.click(projectCards[0]);

    // Both panels are now open:
    // 1. Left search panel remains open (has translate-x-0)
    expect(leftAside).toHaveClass('translate-x-0');
    expect(leftAside).not.toHaveClass('-translate-x-full');

    // 2. Right detail panel is open (has translate-x-0)
    const detailTabs = screen.getByText('Ringkasan');
    expect(detailTabs).toBeInTheDocument();
    const rightAside = detailTabs.closest('aside');
    expect(rightAside).toHaveClass('translate-x-0');
    expect(rightAside).not.toHaveClass('translate-x-full');

    // 3. User can close the detail drawer while left search sidebar stays open
    const closeDetailBtn = screen.getByTitle('Tutup Panel Info Proyek');
    await user.click(closeDetailBtn);
    expect(rightAside).toHaveClass('translate-x-full');
    expect(leftAside).toHaveClass('translate-x-0');

    // 4. User can open detail again
    await user.click(projectCards[0]);
    expect(rightAside).toHaveClass('translate-x-0');
    expect(leftAside).toHaveClass('translate-x-0');

    // 5. User can collapse the search sidebar while right detail drawer stays open
    const collapseSearchBtn = screen.getByTitle('Sembunyikan Panel Filter');
    await user.click(collapseSearchBtn);
    expect(leftAside).toHaveClass('-translate-x-full');
    expect(rightAside).toHaveClass('translate-x-0');

    // 6. User can click floating button to reopen search panel without closing detail drawer
    const reopenSearchBtn = screen.getByTitle('Buka Panel Pencarian & Filter');
    await user.click(reopenSearchBtn);
    expect(leftAside).toHaveClass('translate-x-0');
    expect(rightAside).toHaveClass('translate-x-0');
  });

  it('collapses search sidebar on mobile screens (< 1024px) when project is selected', async () => {
    // Simulate mobile width
    window.innerWidth = 768;
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

    const searchHeader = screen.getByText('Cari Proyek Pembangunan');
    const leftAside = searchHeader.closest('aside');
    expect(leftAside).toHaveClass('translate-x-0');

    // Click project on mobile
    const projectCards = await screen.findAllByText(/Proyek Desa A/i);
    await user.click(projectCards[0]);

    // On mobile, left sidebar is collapsed to avoid screen clutter
    expect(leftAside).toHaveClass('-translate-x-full');

    // Right detail panel is open
    const detailTabs = screen.getByText('Ringkasan');
    const rightAside = detailTabs.closest('aside');
    expect(rightAside).toHaveClass('translate-x-0');
  });

  it('calculates nearby projects based on true geographic proximity from current project and filters out distant projects', async () => {
    // Define projects with realistic distant and close coordinates:
    // Project 1: Sukorame (south) [-7.3450, 112.1150]
    // Project 2: Bluluk (near Sukorame, ~4.9 km) [-7.3452, 112.1554]
    // Project 3: Brondong (far north, ~50 km away) [-6.8998, 112.2385]
    const testSpatialProjects = [
      { id: 1, nama_proyek: 'Embung Sukorame', wilayah_id: 1, status: 'berjalan', kategori: 'drainase', anggaran: 3000000000, latitude: -7.3450, longitude: 112.1150, progres_persen: 80, progress_fisik: 80, deskripsi: 'Embung Sukorame', nama_wilayah: 'Kecamatan Sukorame' },
      { id: 2, nama_proyek: 'Jalan Bluluk Dekat', wilayah_id: 2, status: 'berjalan', kategori: 'jalan', anggaran: 4000000000, latitude: -7.3452, longitude: 112.1554, progres_persen: 60, progress_fisik: 60, deskripsi: 'Jalan Bluluk', nama_wilayah: 'Kecamatan Bluluk' },
      { id: 3, nama_proyek: 'Pelabuhan Brondong Jauh', wilayah_id: 3, status: 'berjalan', kategori: 'fasilitas', anggaran: 20000000000, latitude: -6.8998, longitude: 112.2385, progres_persen: 50, progress_fisik: 50, deskripsi: 'Pelabuhan Brondong', nama_wilayah: 'Kecamatan Brondong' },
    ];

    vi.mocked(apiService.getProjects).mockResolvedValue({
      projects: testSpatialProjects,
      isFromBackend: true,
    } as any);

    const user = userEvent.setup();
    render(
      <PublicMapExplorer
        projects={testSpatialProjects as any}
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

    // Select the Sukorame project
    const sukorameCards = await screen.findAllByText(/Embung Sukorame/i);
    expect(sukorameCards.length).toBeGreaterThanOrEqual(1);
    await user.click(sukorameCards[0]);

    // Switch to Tab "Proyek Sekitar"
    const sekitarTab = screen.getByRole('button', { name: /Proyek Sekitar/i });
    await user.click(sekitarTab);

    const nearbyHeading = screen.getByText('Infrastruktur Terkait di Sekitar Wilayah');
    const nearbyContainer = nearbyHeading.closest('.flex-1') as HTMLElement;

    // Nearby project (Bluluk) should be shown in Tab 4
    expect(within(nearbyContainer).getByText('Jalan Bluluk Dekat')).toBeInTheDocument();
    // Distance from current project indicator should be rendered
    expect(within(nearbyContainer).getByText(/dari proyek ini/i)).toBeInTheDocument();

    // Distant project (Brondong ~50 km) must NOT be shown in Tab 4 Proyek Sekitar
    expect(within(nearbyContainer).queryByText('Pelabuhan Brondong Jauh')).not.toBeInTheDocument();
  });

  it('selects and displays the newly added project when clicking the Show button', async () => {
    const projectsWithNewest = [
      { id: 29, nama_proyek: 'lalalalalalalalalaalala', wilayah_id: 10, status: 'berjalan', kategori: 'jalan', anggaran: 5000000000, latitude: -7.12, longitude: 112.35, progres_persen: 40, progress_fisik: 40, deskripsi: 'ndaiyo ndaiyo ndaiyo ndaiyo ndaiyo', nama_wilayah: 'Kecamatan Lamongan (Kota)', estimasi_selesai: '2027-04-13' },
      { id: 1, nama_proyek: 'Proyek Lama 1', wilayah_id: 10, status: 'berjalan', kategori: 'jalan', anggaran: 1000000000, latitude: -7.1, longitude: 112.1, progres_persen: 50, progress_fisik: 50, deskripsi: 'Proyek Lama 1', nama_wilayah: 'Kecamatan Lamongan (Kota)' },
      { id: 2, nama_proyek: 'Proyek Lama 2', wilayah_id: 10, status: 'selesai', kategori: 'drainase', anggaran: 2000000000, latitude: -7.2, longitude: 112.2, progres_persen: 100, progress_fisik: 100, deskripsi: 'Proyek Lama 2', nama_wilayah: 'Kecamatan Lamongan (Kota)' },
    ];

    vi.mocked(apiService.getProjects).mockResolvedValue({
      projects: projectsWithNewest,
      isFromBackend: true,
    } as any);

    const user = userEvent.setup();
    render(
      <PublicMapExplorer
        projects={projectsWithNewest as any}
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

    // Check search header and sidebar
    const searchHeader = screen.getByText('Cari Proyek Pembangunan');
    const leftAside = searchHeader.closest('aside');
    expect(leftAside).toHaveClass('translate-x-0');

    // Find the Show button with count (3)
    const showButton = screen.getByRole('button', { name: /Show \(3\)/i });
    expect(showButton).toBeInTheDocument();

    // Click the Show button
    await user.click(showButton);

    // Left sidebar should be collapsed
    expect(leftAside).toHaveClass('-translate-x-full');

    // Right detail panel should be open
    const detailTabs = screen.getByText('Ringkasan');
    const rightAside = detailTabs.closest('aside');
    expect(rightAside).toHaveClass('translate-x-0');

    // The detail panel should display the newly added project (lalalalalalalalalaalala)
    expect(within(rightAside as HTMLElement).getByText('lalalalalalalalalaalala')).toBeInTheDocument();
    expect(within(rightAside as HTMLElement).getByText(/ndaiyo ndaiyo ndaiyo/i)).toBeInTheDocument();
    expect(within(rightAside as HTMLElement).getByText(/Rp 5.0 M/i)).toBeInTheDocument();
  });
});

