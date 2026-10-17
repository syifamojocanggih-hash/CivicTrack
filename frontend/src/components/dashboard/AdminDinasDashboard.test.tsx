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
    updateProject: vi.fn(),
    createProject: vi.fn(),
    createTimelineStage: vi.fn(),
    getEvaluations: vi.fn(),
    getEvaluationDetail: vi.fn(),
    verifyEvaluation: vi.fn(),
    replyAduan: vi.fn(),
    getAllReports: vi.fn(),
  },
}));

describe('AdminDinasDashboard Form Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiService.getProjects).mockResolvedValue({ projects: [], isFromBackend: true });
    vi.mocked(apiService.getWilayahStats).mockResolvedValue([]);
    vi.mocked(apiService.getEvaluations).mockResolvedValue([]);
    vi.mocked(apiService.getAllReports).mockResolvedValue([]);
    vi.mocked(apiService.createProject).mockImplementation(async (data: any) => ({
      id: 999,
      nama_proyek: data.nama_proyek,
      kategori: data.kategori,
      deskripsi: data.deskripsi || '',
      latitude: data.latitude,
      longitude: data.longitude,
      anggaran: data.anggaran,
      status: data.status || 'berjalan',
      progres_persen: data.progres_persen || 0,
      nama_wilayah: 'Kecamatan Lamongan (Kota)',
      nama_dinas: 'Dinas Pekerjaan Umum',
      tahap_terkini: 'Pembersihan & Pengukuran Lahan',
      rata_rata_rating: null,
      jumlah_rating: 0,
    }));
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

describe('AdminDinasDashboard Project Edit Validation', () => {
  const dummyProject = {
    id: 101,
    nama_proyek: 'Pembangunan Jembatan Kali Lamong',
    kategori: 'jalan' as const,
    deskripsi: 'Pembangunan jembatan penghubung antar kecamatan',
    latitude: -7.12,
    longitude: 112.42,
    anggaran: 1500000000,
    status: 'berjalan' as const,
    progres_persen: 50,
    nama_wilayah: 'Kecamatan Lamongan (Kota)',
    tahap_terkini: 'Pengecoran Tiang',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiService.getProjects).mockResolvedValue({ projects: [dummyProject], isFromBackend: true });
    vi.mocked(apiService.getWilayahStats).mockResolvedValue([]);
    vi.mocked(apiService.getEvaluations).mockResolvedValue([]);
    vi.mocked(apiService.getWilayah).mockResolvedValue([]);
  });

  it('submits valid edit successfully and updates project in list', async () => {
    vi.mocked(apiService.updateProject).mockResolvedValue({
      ...dummyProject,
      nama_proyek: 'Pembangunan Jembatan Kali Lamong Tahap 2',
      progres_persen: 65,
    });

    render(
      <AdminDinasDashboard
        currentUser={{ id: 2, role: 'admin_dinas', nama: 'Admin', email: 'admin@banyuwangi.go.id' }}
        projects={[dummyProject]}
        onOpenProjectDetail={() => {}}
      />
    );

    const user = userEvent.setup();
    const editBtn = screen.getByRole('button', { name: /^Edit$/i });
    await user.click(editBtn);

    expect(screen.getByText(/Sunting Data Proyek/i)).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Nama Proyek/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Pembangunan Jembatan Kali Lamong Tahap 2');

    const progressInput = screen.getByLabelText(/Progres Fisik/i);
    await user.clear(progressInput);
    await user.type(progressInput, '65');

    const submitBtn = screen.getByRole('button', { name: /Simpan Perubahan/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(apiService.updateProject).toHaveBeenCalledWith(101, expect.objectContaining({
        nama_proyek: 'Pembangunan Jembatan Kali Lamong Tahap 2',
        progres_persen: 65,
      }));
    });

    await waitFor(() => {
      expect(screen.queryByText(/Sunting Data Proyek/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Pembangunan Jembatan Kali Lamong Tahap 2/i)).toBeInTheDocument();
    });
  });

  it('rejects submit on frontend when progress is decreased without valid reason (< 10 chars)', async () => {
    render(
      <AdminDinasDashboard
        currentUser={{ id: 2, role: 'admin_dinas', nama: 'Admin', email: 'admin@banyuwangi.go.id' }}
        projects={[dummyProject]}
        onOpenProjectDetail={() => {}}
      />
    );

    const user = userEvent.setup();
    const editBtn = screen.getByRole('button', { name: /^Edit$/i });
    await user.click(editBtn);

    const progressInput = screen.getByLabelText(/Progres Fisik/i);
    await user.clear(progressInput);
    await user.type(progressInput, '35'); // Menurun dari 50 ke 35

    // Warning alert & textarea harus muncul
    expect(screen.getByText(/Penurunan Progres Fisik Terdeteksi/i)).toBeInTheDocument();

    // Coba submit dengan alasan kurang dari 10 karakter
    const reasonInput = screen.getByLabelText(/Alasan \/ Keterangan Penurunan Progres/i);
    await user.type(reasonInput, 'revisi'); // 6 karakter < 10

    const submitBtn = screen.getByRole('button', { name: /Simpan Perubahan/i });
    await user.click(submitBtn);

    // API TIDAK BOLEH dipanggil
    expect(apiService.updateProject).not.toHaveBeenCalled();

    // Pesan error validasi muncul di UI modal
    expect(screen.getByText(/Penurunan progres dari 50% ke 35% wajib menyertakan alasan minimal 10 karakter/i)).toBeInTheDocument();
  });

  it('submits edit successfully when progress is decreased with valid reason (>= 10 chars)', async () => {
    vi.mocked(apiService.updateProject).mockResolvedValue({
      ...dummyProject,
      progres_persen: 35,
    });

    render(
      <AdminDinasDashboard
        currentUser={{ id: 2, role: 'admin_dinas', nama: 'Admin', email: 'admin@banyuwangi.go.id' }}
        projects={[dummyProject]}
        onOpenProjectDetail={() => {}}
      />
    );

    const user = userEvent.setup();
    const editBtn = screen.getByRole('button', { name: /^Edit$/i });
    await user.click(editBtn);

    const progressInput = screen.getByLabelText(/Progres Fisik/i);
    await user.clear(progressInput);
    await user.type(progressInput, '35'); // Menurun dari 50 ke 35

    const reasonInput = screen.getByLabelText(/Alasan \/ Keterangan Penurunan Progres/i);
    await user.type(reasonInput, 'Kerusakan pondasi akibat banjir bandang kemarin');

    const submitBtn = screen.getByRole('button', { name: /Simpan Perubahan/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(apiService.updateProject).toHaveBeenCalledWith(101, expect.objectContaining({
        progres_persen: 35,
        catatan_perubahan: 'Kerusakan pondasi akibat banjir bandang kemarin',
      }));
    });

    await waitFor(() => {
      expect(screen.queryByText(/Sunting Data Proyek/i)).not.toBeInTheDocument();
    });
  });
});

describe('AdminDinasDashboard Defect Evaluation Verification', () => {
  const dummyEval = {
    id: 55,
    proyek_id: 101,
    nama_proyek: 'Jalan Mantup - Sambeng',
    user_id: 9,
    kategori_masalah: 'Retak struktural',
    deskripsi: 'Aspal amblas sedalam 15cm setelah hujan lebat',
    skor_urgensi_ai: 5,
    ringkasan_analisis_ai: 'Tingkat bahaya tinggi.',
    status: 'menunggu_verifikasi' as const,
    created_at: '2026-10-10T08:00:00Z',
    updated_at: '2026-10-10T08:00:00Z',
    pelapor: { id: 9, nama: 'Budi Warga', email: 'budi@example.com', role: 'warga' },
    status_logs: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiService.getProjects).mockResolvedValue({ projects: [], isFromBackend: true });
    vi.mocked(apiService.getWilayahStats).mockResolvedValue([]);
    vi.mocked(apiService.getEvaluations).mockResolvedValue([dummyEval]);
    vi.mocked(apiService.getEvaluationStatusLogs).mockResolvedValue([]);
    vi.mocked(apiService.verifyEvaluation).mockResolvedValue({
      ...dummyEval,
      status: 'terverifikasi_perlu_tindak_lanjut',
    });
  });

  it('allows admin to open evaluation modal, select status, and submit verification', async () => {
    render(
      <AdminDinasDashboard
        currentUser={{ id: 2, role: 'admin_dinas', nama: 'Admin PUPR', email: 'admin@banyuwangi.go.id' }}
        projects={[]}
        activeSection="evaluasi"
        onOpenProjectDetail={() => {}}
      />
    );

    const user = userEvent.setup();

    // Tunggu evaluasi dari API selesai dirender
    await screen.findByText(/Jalan Mantup - Sambeng/i);

    const verifyBtn = screen.getByRole('button', { name: /Verifikasi & Jadwalkan Tim Lapangan/i });
    await user.click(verifyBtn);

    await waitFor(() => {
      expect(screen.getByText(/Verifikasi Tindakan Perbaikan FHO/i)).toBeInTheDocument();
    });

    const statusSelect = screen.getByRole('combobox');
    expect(statusSelect).toHaveValue('terverifikasi_perlu_tindak_lanjut');

    await user.selectOptions(statusSelect, 'selesai_ditindaklanjuti');

    const submitBtn = screen.getByRole('button', { name: /Konfirmasi Penanganan/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(apiService.verifyEvaluation).toHaveBeenCalledWith(55, {
        status: 'selesai_ditindaklanjuti',
        catatan: expect.any(String),
      });
    });

    await waitFor(() => {
      expect(screen.queryByText(/Verifikasi Tindakan Perbaikan FHO/i)).not.toBeInTheDocument();
    });
  });
});

