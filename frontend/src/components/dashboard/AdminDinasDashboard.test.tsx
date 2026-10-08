import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AdminDinasDashboard } from './AdminDinasDashboard';
import { apiService } from '../../services/api';
import * as spatial from '../../utils/spatial';
import userEvent from '@testing-library/user-event';

// Mock the map container
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div>{children}</div>,
  TileLayer: () => <div />,
  Marker: ({ children }: any) => <div>{children}</div>,
  Popup: ({ children }: any) => <div>{children}</div>,
  useMap: () => ({ setView: vi.fn(), invalidateSize: vi.fn() }),
  useMapEvents: () => ({}),
}));

vi.mock('../../services/api', () => ({
  apiService: {
    getProjects: vi.fn(),
    getWilayah: vi.fn(),
    getWilayahStats: vi.fn(),
    getEvaluationStatusLogs: vi.fn(),
  },
}));

describe('AdminDinasDashboard Form Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiService.getProjects).mockResolvedValue({ projects: [], isFromBackend: true });
    vi.mocked(apiService.getWilayahStats).mockResolvedValue([]);
    vi.mocked(apiService.getWilayah).mockResolvedValue([
      { id: 1, nama_wilayah: 'Kecamatan Banyuwangi', level: 'kecamatan' }
    ] as any);
  });

  it('shows error when submitting empty form', async () => {
    render(<AdminDinasDashboard currentUser={{ id: 2, role: 'admin_dinas', nama: 'Admin', email: 'admin@banyuwangi.go.id' }} projects={[]} onOpenProjectDetail={() => {}} />);

    const user = userEvent.setup();
    const addTabs = await screen.findAllByText(/Input Proyek Baru/i);
    await user.click(addTabs[0]);

    const submitBtn = screen.getByRole('button', { name: /Simpan & Publikasikan/i });
    await user.click(submitBtn);

    expect(screen.queryByRole('dialog')).toBeInTheDocument();
  });

  it('shows error when submitting partially filled form', async () => {
    render(<AdminDinasDashboard currentUser={{ id: 2, role: 'admin_dinas', nama: 'Admin', email: 'admin@banyuwangi.go.id' }} projects={[]} onOpenProjectDetail={() => {}} />);

    const user = userEvent.setup();
    const addTabs = await screen.findAllByText(/Input Proyek Baru/i);
    await user.click(addTabs[0]);

    await user.type(screen.getByLabelText(/Nama Proyek/i), 'Proyek Test Saja');
    // Lewati field wajib lainnya

    const submitBtn = screen.getByRole('button', { name: /Simpan & Publikasikan/i });
    await user.click(submitBtn);

    expect(screen.queryByRole('dialog')).toBeInTheDocument();
  });

  it('adds new project to list when form is valid', async () => {
    vi.spyOn(spatial, 'validateCoordinatesInKecamatan').mockReturnValue({
      isValid: true,
      message: 'Mock valid',
    });
    
    render(<AdminDinasDashboard currentUser={{ id: 2, role: 'admin_dinas', nama: 'Admin', email: 'admin@banyuwangi.go.id' }} projects={[]} onOpenProjectDetail={() => {}} />);

    const user = userEvent.setup();
    const addTabs = await screen.findAllByText(/Input Proyek Baru/i);
    await user.click(addTabs[0]);

    await user.type(screen.getByLabelText(/Nama Proyek/i), 'Proyek Test Valid');
    await user.selectOptions(screen.getByLabelText(/Kategori Sektor/i), 'jalan');
    await user.type(screen.getByLabelText(/Pagu Anggaran/i), '500000000');
    await user.type(screen.getByLabelText(/Deskripsi Pekerjaan/i), 'Deskripsi proyek jalan yang sangat panjang dan valid minimal sepuluh karakter');
    
    await user.clear(screen.getByLabelText(/Latitude/i));
    await user.type(screen.getByLabelText(/Latitude/i), '-7.1197');
    
    await user.clear(screen.getByLabelText(/Longitude/i));
    await user.type(screen.getByLabelText(/Longitude/i), '112.4150');

    const submitBtn = screen.getByRole('button', { name: /Simpan & Publikasikan/i });
    await user.click(submitBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Proyek Test Valid/i)).toBeInTheDocument();
    });
  });
});
