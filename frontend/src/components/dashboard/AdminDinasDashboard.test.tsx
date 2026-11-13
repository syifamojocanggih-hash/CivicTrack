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
    getWilayahList: vi.fn(),
    verifyProjectAccess: vi.fn(),
    uploadDokumentasi: vi.fn(),
    deleteProject: vi.fn(),
  },
}));

describe('AdminDinasDashboard Form Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiService.getProjects).mockResolvedValue({ projects: [], isFromBackend: true });
    vi.mocked(apiService.getWilayahStats).mockResolvedValue([]);
    vi.mocked(apiService.getEvaluations).mockResolvedValue([]);
    vi.mocked(apiService.getAllReports).mockResolvedValue([]);
    vi.mocked(apiService.getWilayahList).mockResolvedValue([
      { id: 400, nama_wilayah: 'Kelurahan Jetis', level: 'desa', parent_id: 23 }
    ] as any);
    vi.mocked(apiService.verifyProjectAccess).mockResolvedValue({ success: true, message: 'Valid' });
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

    // Verify Interactive Location Picker Map is present in modal and placed above Skala & Cakupan
    expect(screen.getByText(/Pilih Titik Lokasi Langsung di Peta/i)).toBeInTheDocument();
    expect(screen.getByText(/Klik pada peta atau geser pin/i)).toBeInTheDocument();
    expect(screen.getByText(/Sinkronisasi Otomatis dari Titik Peta/i)).toBeInTheDocument();

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

describe('AdminDinasDashboard Aduan Response Modal', () => {
  const dummyAduan = {
    id: 101,
    proyek_id: 1,
    user_id: 1,
    nama_proyek: 'Pelebaran Jalan Veteran',
    nama_pelapor: 'Ahmad Warga',
    email_pelapor: 'ahmad@gmail.com',
    judul: 'Debu sangat tebal di lokasi proyek',
    isi_laporan: 'Truk proyek lewat setiap 10 menit menyebabkan debu sangat tebal.',
    kategori_aduan: 'Dampak Lingkungan',
    status: 'menunggu' as const,
    tanggal_lapor: '2026-11-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiService.getProjects).mockResolvedValue({ projects: [], isFromBackend: true });
    vi.mocked(apiService.getWilayahStats).mockResolvedValue([]);
    vi.mocked(apiService.getEvaluations).mockResolvedValue([]);
    vi.mocked(apiService.getAllReports).mockResolvedValue([dummyAduan]);
    vi.mocked(apiService.replyAduan).mockResolvedValue({
      id: 101,
      status: 'ditanggapi',
      tanggapan_dinas: 'Dinas telah menginstruksikan penyiraman berkala.',
    } as any);
  });

  it('opens response modal when clicking "Buka Halaman Respon Tanggapan" and submits response', async () => {
    render(
      <AdminDinasDashboard
        currentUser={{ id: 2, role: 'admin_dinas', nama: 'Admin PUPR', email: 'admin@lamongan.go.id' }}
        projects={[]}
        activeSection="aduan"
        onOpenProjectDetail={() => {}}
      />
    );

    const user = userEvent.setup();

    // Find the report card
    await screen.findByText(/Debu sangat tebal di lokasi proyek/i);

    // Click "Buka Halaman Respon Tanggapan"
    const openModalBtn = screen.getByRole('button', { name: /Buka Halaman Respon Tanggapan/i });
    await user.click(openModalBtn);

    // Modal should be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Respon & Tanggapan Resmi Aduan Warga/i)).toBeInTheDocument();
    expect(screen.getByText(/#ADUAN-101/i)).toBeInTheDocument();

    // Use a quick response template
    const templateBtn = screen.getByRole('button', { name: /Penyiraman & Reduksi Debu/i });
    await user.click(templateBtn);

    // Check textarea is filled
    const textarea = screen.getByPlaceholderText(/Tuliskan tindakan konkret/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain('penyiraman jalan');

    // Submit the response
    const submitBtn = screen.getByRole('button', { name: /Publikasikan Tanggapan Resmi/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(apiService.replyAduan).toHaveBeenCalledWith(101, {
        status_tindak_lanjut: 'diproses',
        tanggapan_dinas: expect.stringContaining('penyiraman jalan'),
        petugas_penjawab: expect.stringContaining('Admin PUPR'),
      });
    });

    // Check success message is displayed
    expect(
      await screen.findByText(/Tanggapan resmi dinas berhasil dipublikasikan secara transparan/i)
    ).toBeInTheDocument();
  });
});

describe('AdminDinasDashboard Dokumentasi Fisik Upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiService.getProjects).mockResolvedValue({
      projects: [
        {
          id: 2,
          nama_proyek: 'Pelebaran Jalan Soekarno Hatta KM 4–7',
          kategori: 'jalan',
          deskripsi: 'Proyek jalan',
          anggaran: 12000000000,
          latitude: -7.12,
          longitude: 112.41,
          status: 'berjalan',
          progres_persen: 60,
          nama_wilayah: 'Kecamatan Lamongan (Kota)',
          nama_dinas: 'Dinas Pekerjaan Umum',
          tahap_terkini: 'Galian',
        },
      ],
      isFromBackend: true,
    });
    vi.mocked(apiService.getWilayahStats).mockResolvedValue([]);
    vi.mocked(apiService.getEvaluations).mockResolvedValue([]);
    vi.mocked(apiService.getAllReports).mockResolvedValue([]);
    vi.mocked(apiService.uploadDokumentasi).mockResolvedValue({
      id: 99,
      url_file: '/uploads/proyek_2_test.jpg',
      tipe_media: 'foto',
    });
  });

  it('allows user to upload documentation directly from device storage (file input)', async () => {
    render(
      <AdminDinasDashboard
        currentUser={{ id: 2, role: 'admin_dinas', nama: 'Admin PUPR', email: 'admin@lamongan.go.id' }}
        projects={[]}
        activeSection="dokumentasi"
        onOpenProjectDetail={() => {}}
      />
    );

    const user = userEvent.setup();

    // Find and click "Unggah Dokumentasi Baru" button
    const openUploadBtn = screen.getByRole('button', { name: /Unggah Dokumentasi Baru/i });
    await user.click(openUploadBtn);

    // Modal should appear
    expect(screen.getByText(/Upload Bukti Dokumentasi Fisik/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Penyimpanan Perangkat/i)[0]).toBeInTheDocument();

    // Fill title
    const judulInput = screen.getByPlaceholderText(/Contoh: Uji Kuat Tekan Beton Silinder/i);
    await user.type(judulInput, 'Dokumentasi Beton Lapangan');

    // Select a file
    const file = new File(['dummy photo content'], 'inspeksi_beton.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    await user.upload(fileInput, file);

    // Verify preview and file info
    await waitFor(() => {
      expect(screen.getByText(/inspeksi_beton.png/i)).toBeInTheDocument();
    });

    // Fill technical note
    const catatanInput = screen.getByPlaceholderText(/Keterangan kondisi visual/i);
    await user.type(catatanInput, 'Hasil pengujian beton telah memenuhi standar K-350.');

    // Submit upload
    const submitBtn = screen.getByRole('button', { name: /Unggah Sekarang/i });
    await user.click(submitBtn);

    // Modal closes and new documentation is in the gallery
    await waitFor(() => {
      expect(screen.queryByText(/Upload Bukti Dokumentasi Fisik/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Dokumentasi Beton Lapangan/i)).toBeInTheDocument();
    });
  });

  it('renders Hapus Proyek button in edit modal, prompts confirmation, and deletes project when confirmed', async () => {
    const user = userEvent.setup();
    vi.mocked(apiService.deleteProject).mockResolvedValue(true);

    const testProject = {
      id: 202,
      nama_proyek: 'Pembangunan Jembatan Uji Hapus',
      kategori: 'jalan' as const,
      deskripsi: 'Proyek uji hapus',
      latitude: -7.12,
      longitude: 112.42,
      anggaran: 1000000000,
      status: 'berjalan' as const,
      progres_persen: 40,
      nama_wilayah: 'Kecamatan Lamongan (Kota)',
      tahap_terkini: 'Pengerukan Tanah',
    };

    render(
      <AdminDinasDashboard
        currentUser={{ id: 2, role: 'admin_dinas', nama: 'Admin', email: 'admin@banyuwangi.go.id' }}
        projects={[testProject]}
        onSelectSection={vi.fn()}
        onOpenProjectDetail={vi.fn()}
      />
    );

    // Click "Edit" on the project (directly visible for admin_dinas)
    const editBtn = screen.getByRole('button', { name: /^Edit$/i });
    await user.click(editBtn);

    // Modal Sunting Data Proyek should be visible
    expect(screen.getByText(/Sunting Data Proyek/i)).toBeInTheDocument();

    // The Hapus Proyek button should be visible in the edit modal footer
    const deleteBtn = screen.getByRole('button', { name: /Hapus Proyek/i });
    expect(deleteBtn).toBeInTheDocument();

    // Click "Hapus Proyek"
    await user.click(deleteBtn);

    // Confirmation dialog should appear
    expect(screen.getByText(/Konfirmasi Hapus Proyek/i)).toBeInTheDocument();
    expect(screen.getByText(/Apakah Anda yakin ingin menghapus proyek ini\?/i)).toBeInTheDocument();

    // Confirm deletion
    const confirmDeleteBtn = screen.getByRole('button', { name: /Ya, Hapus Proyek/i });
    await user.click(confirmDeleteBtn);

    // Verify apiService.deleteProject was called with project id 202
    await waitFor(() => {
      expect(apiService.deleteProject).toHaveBeenCalledWith(202);
      expect(screen.queryByText(/Konfirmasi Hapus Proyek/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Sunting Data Proyek/i)).not.toBeInTheDocument();
    });
  });

  it('allows penanggung_jawab to enter gate code and unlocks project dashboard seamlessly without errors', async () => {
    sessionStorage.clear();

    const mockUnlockedProj = {
      id: 6,
      kode_proyek: 'LMG-006',
      kode_akses: 'PJ-10006',
      nama_proyek: 'Pengaspalan & Penerangan Jalan Poros Pucuk - Babat',
      kategori: 'jalan' as const,
      deskripsi: 'Peningkatan jalan hotmix',
      anggaran: 6800000000,
      status: 'selesai' as const,
      progres_persen: 100,
      tanggal_mulai: '2023-11-01',
      estimasi_selesai: '2025-10-31',
      latitude: -7.098,
      longitude: 112.285,
      wilayah_id: 14,
      dinas_id: 1,
      nama_wilayah: 'Kecamatan Pucuk',
      nama_dinas: 'Dinas Pekerjaan Umum',
    };

    vi.mocked(apiService.verifyProjectAccess).mockResolvedValue({
      success: true,
      message: 'Otorisasi berhasil',
      proyek: mockUnlockedProj as any,
    });

    render(
      <AdminDinasDashboard
        currentUser={{ id: 13, role: 'penanggung_jawab', nama: 'ronnn', email: 'ronnn@gmail.com' }}
        projects={[mockUnlockedProj as any]}
        onOpenProjectDetail={() => {}}
      />
    );

    const user = userEvent.setup();

    // Verification gate should be rendered initially
    expect(screen.getByText(/Gerbang Akses Penanggung Jawab Proyek/i)).toBeInTheDocument();

    const codeInput = screen.getByPlaceholderText(/Contoh: SKD-SKD-001/i);
    const pwInput = screen.getByPlaceholderText(/Contoh: PJ-17409/i);
    const unlockBtn = screen.getByRole('button', { name: /Buka Lembar Kerja Proyek/i });

    await user.type(codeInput, 'LMG-006');
    await user.type(pwInput, 'PJ-10006');
    await user.click(unlockBtn);

    // Dashboard should unlock and display the project banner
    await waitFor(() => {
      expect(screen.getByText(/Lembar Kerja Terverifikasi/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Pengaspalan & Penerangan Jalan Poros Pucuk - Babat/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Kunci \/ Ganti Proyek/i)).toBeInTheDocument();
    });

    // 1. Total Proyek must be removed for penanggung_jawab handling 1 project
    expect(screen.queryByText(/^Total Proyek$/i)).not.toBeInTheDocument();

    // 2. Budget must be tailored to the single project (Rp 6.8M / Rp 6.800.000.000)
    expect(screen.getAllByText(/6\.800\.000\.000/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Rp 6\.8M/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/100% Rampung/i).length).toBeGreaterThan(0);

    // 3. Status must not display dalam_peninjauan_ulang
    expect(screen.queryByText(/status:\s*dalam_peninjauan_ulang/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/status:\s*selesai/i).length).toBeGreaterThan(0);

    // 4. Real-time live sync: dispatching new aduan should update count live
    window.dispatchEvent(
      new CustomEvent('civictrack_new_aduan', {
        detail: {
          id: 9991,
          proyek_id: 6,
          nama_proyek: 'Pengaspalan & Penerangan Jalan Poros Pucuk - Babat',
          user_id: 10,
          nama_pelapor: 'Warga Pucuk',
          email_pelapor: 'warga@pucuk.id',
          judul: 'Lampu PJU Padam',
          isi_laporan: 'Ada 2 titik lampu penerangan jalan umum yang padam saat malam hari.',
          kategori_aduan: 'Penerangan Jalan',
          status: 'menunggu',
          tanggal_lapor: '2024-03-25 19:00',
        },
      })
    );

    await waitFor(() => {
      expect(screen.getByText(/1 Perlu Ditanggapi!/i)).toBeInTheDocument();
    });
  });
});



