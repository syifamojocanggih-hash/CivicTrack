import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Building2,
  FolderKanban,
  MessageSquare,
  Wrench,
  Plus,
  CheckCircle2,
  Upload,
  DollarSign,
  MapPin,
  Sparkles,
  Check,
  AlertTriangle,
  Clock,
  BarChart3,
  Key,
  ShieldCheck,
  Lock,
  Unlock,
  RefreshCw,
  Copy,
  CheckCheck,
  Eye,
  EyeOff,
  Layers,
  Edit3,
  X,
} from 'lucide-react';
import type {
  UserProfile,
  ProyekItem,
  LaporanAduan,
  EvaluasiCacatItem,
  LinimasaTahap,
  DokumentasiProyek,
  ProyekKategori,
  ProyekStatus,
  EvaluasiStatusType,
} from '../../types';
import {
  MOCK_LAPORAN_WARGA,
  MOCK_EVALUASI_CACAT,
  MOCK_LINIMASA_TAHAP,
  MOCK_DOKUMENTASI_PROYEK,
} from '../../data/dashboardMockData';
import { apiService } from '../../services/api';
import { MiniMapOverview } from './MiniMapOverview';
import { AduanDetailView } from './AduanDetailView';
import { WILAYAH_DATA } from '../../data/geoWilayahData';
import { validateCoordinatesInKecamatan } from '../../utils/spatial';

const KECAMATAN_ID_MAP: Record<string, number> = {
  'Kecamatan Sukorame': 2,
  'Kecamatan Bluluk': 3,
  'Kecamatan Modo': 4,
  'Kecamatan Ngimbang': 5,
  'Kecamatan Babat': 6,
  'Kecamatan Kedungpring': 7,
  'Kecamatan Brondong': 8,
  'Kecamatan Laren': 9,
  'Kecamatan Sekaran': 10,
  'Kecamatan Maduran': 11,
  'Kecamatan Sambeng': 12,
  'Kecamatan Sugio': 13,
  'Kecamatan Pucuk': 14,
  'Kecamatan Paciran': 15,
  'Kecamatan Solokuro': 16,
  'Kecamatan Mantup': 17,
  'Kecamatan Sukodadi': 18,
  'Kecamatan Karanggeneng': 19,
  'Kecamatan Kembangbahu': 20,
  'Kecamatan Kalitengah': 21,
  'Kecamatan Turi': 22,
  'Kecamatan Lamongan (Kota)': 23,
  'Kecamatan Tikung': 24,
  'Kecamatan Karangbinangun': 25,
  'Kecamatan Deket': 26,
  'Kecamatan Glagah': 27,
  'Kecamatan Sarirejo': 28,
};

export const KECAMATAN_CODE_MAP: Record<string, string> = {
  'Kecamatan Sukorame': 'SKR',
  'Kecamatan Bluluk': 'BLK',
  'Kecamatan Modo': 'MDO',
  'Kecamatan Ngimbang': 'NGB',
  'Kecamatan Babat': 'BBT',
  'Kecamatan Kedungpring': 'KDP',
  'Kecamatan Brondong': 'BRD',
  'Kecamatan Laren': 'LRN',
  'Kecamatan Sekaran': 'SKN',
  'Kecamatan Maduran': 'MDR',
  'Kecamatan Sambeng': 'SMB',
  'Kecamatan Sugio': 'SGO',
  'Kecamatan Pucuk': 'PCK',
  'Kecamatan Paciran': 'PCR',
  'Kecamatan Solokuro': 'SLK',
  'Kecamatan Mantup': 'MTP',
  'Kecamatan Sukodadi': 'SKD',
  'Kecamatan Karanggeneng': 'KGN',
  'Kecamatan Kembangbahu': 'KBH',
  'Kecamatan Kalitengah': 'KTG',
  'Kecamatan Turi': 'TUR',
  'Kecamatan Lamongan (Kota)': 'LMG',
  'Kecamatan Tikung': 'TKG',
  'Kecamatan Karangbinangun': 'KBN',
  'Kecamatan Deket': 'DKT',
  'Kecamatan Glagah': 'GLG',
  'Kecamatan Sarirejo': 'SRJ',
};

export function abbreviateDesa(desaName: string): string {
  const clean = desaName.replace(/Kelurahan|Desa/gi, '').trim().toUpperCase();
  const consonants = clean.replace(/[^BCDFGHJKLMNPQRSTVWXYZ]/g, '');
  if (consonants.length >= 3) return consonants.slice(0, 3);
  const letters = clean.replace(/[^A-Z]/g, '');
  return (letters + 'XXX').slice(0, 3);
}

export function generateProjectSerialNumber(
  kecName: string,
  desaName: string | undefined,
  skala: 'skala_desa' | 'skala_kecamatan',
  projectList: ProyekItem[]
): string {
  const kecCode = KECAMATAN_CODE_MAP[kecName] || 'LMG';
  let prefix = kecCode;
  if (skala === 'skala_desa' && desaName && desaName !== 'Semua Desa / Kelurahan' && desaName !== 'Seluruh Wilayah Kecamatan') {
    prefix = `${kecCode}-${abbreviateDesa(desaName)}`;
  }
  const count = projectList.filter((p) => p.kode_proyek && p.kode_proyek.startsWith(prefix)).length;
  const seq = count + 1;
  return `${prefix}-${String(seq).padStart(3, '0')}`;
}

export function generateRandomAccessKey(): string {
  const pin = Math.floor(10000 + Math.random() * 90000);
  return `PJ-${pin}`;
}

interface AdminDinasDashboardProps {
  currentUser: UserProfile;
  projects: ProyekItem[];
  onOpenProjectDetail: (project: ProyekItem) => void;
  activeSection?: string;
  onSelectSection?: (section: string) => void;
  onOpenMapExplorer?: () => void;
  onProjectCreated?: (project: ProyekItem) => void;
  onProjectUpdated?: (project: ProyekItem) => void;
}

const renderPortal = (modal: React.ReactNode) => {
  if (typeof document === 'undefined') return modal;
  return createPortal(modal, document.body);
};

export const AdminDinasDashboard: React.FC<AdminDinasDashboardProps> = ({
  currentUser,
  projects,
  onOpenProjectDetail,
  activeSection,
  onSelectSection,
  onOpenMapExplorer,
  onProjectCreated,
  onProjectUpdated,
}) => {
  const activeTab = (activeSection as any) || 'proyek';

  // Local state for projects management
  const [projectList, setProjectList] = useState<ProyekItem[]>(projects);
  const [searchProj, setSearchProj] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('semua');

  React.useEffect(() => {
    setProjectList(projects);
  }, [projects]);

  // Modal new project
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isSubmittingNewProj, setIsSubmittingNewProj] = useState(false);
  const [createProjError, setCreateProjError] = useState<string | null>(null);
  const [desaOptions, setDesaOptions] = useState<Array<{ id: number; nama_wilayah: string }>>([
    { id: 400, nama_wilayah: 'Kelurahan Jetis' },
    { id: 394, nama_wilayah: 'Kelurahan Sukorejo' },
    { id: 395, nama_wilayah: 'Kelurahan Sukomulyo' },
    { id: 396, nama_wilayah: 'Kelurahan Sidoharjo' },
    { id: 397, nama_wilayah: 'Kelurahan Tumenggungan' },
    { id: 398, nama_wilayah: 'Kelurahan Sidokumpul' },
    { id: 399, nama_wilayah: 'Kelurahan Tlogoanyar' },
    { id: 401, nama_wilayah: 'Kelurahan Banjarmendalan' },
    { id: 410, nama_wilayah: 'Desa Plosowahyu' },
    { id: 412, nama_wilayah: 'Desa Made' },
  ]);
  const [isLoadingDesa, setIsLoadingDesa] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const [newProjectForm, setNewProjectForm] = useState({
    nama_proyek: '',
    kategori: 'jalan' as ProyekKategori,
    deskripsi: '',
    anggaran: 5000000000,
    status: 'berjalan' as ProyekStatus,
    tanggal_mulai: new Date().toISOString().split('T')[0],
    estimasi_selesai: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
    progres_persen: 0,
    skala_proyek: 'skala_desa' as 'skala_desa' | 'skala_kecamatan',
    nama_wilayah: 'Kecamatan Lamongan (Kota)',
    nama_desa: 'Kelurahan Jetis',
    desa_id: 400 as number | null,
    kode_proyek: 'LMG-JTS-001',
    kode_akses: 'PJ-' + Math.floor(10000 + Math.random() * 90000),
    latitude: -7.1197,
    longitude: 112.4150,
    nama_dinas: currentUser.nama_dinas || 'Dinas Pekerjaan Umum dan Penataan Ruang',
    tahap_terkini: 'Pembersihan & Pengukuran Lahan',
  });

  // State Gerbang Verifikasi Penanggung Jawab Proyek
  const [unlockedProject, setUnlockedProject] = useState<ProyekItem | null>(() => {
    try {
      const saved = sessionStorage.getItem('civictrack_pj_unlocked_project');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return null;
  });
  const [gateCode, setGateCode] = useState('');
  const [gatePassword, setGatePassword] = useState('');
  const [showGatePassword, setShowGatePassword] = useState(false);
  const [isVerifyingGate, setIsVerifyingGate] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);

  // Helper copy text ke clipboard
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  // Buka modal input proyek baru dengan kode seri & pin segar
  const handleOpenNewProjectModal = () => {
    const nextPin = generateRandomAccessKey();
    const nextCode = generateProjectSerialNumber(
      newProjectForm.nama_wilayah,
      newProjectForm.skala_proyek === 'skala_desa' ? newProjectForm.nama_desa : undefined,
      newProjectForm.skala_proyek,
      projectList
    );
    setNewProjectForm((prev) => ({
      ...prev,
      kode_proyek: nextCode,
      kode_akses: nextPin,
    }));
    setIsNewProjectModalOpen(true);
  };

  // Muat daftar desa ketika kecamatan berubah
  useEffect(() => {
    const kecId = KECAMATAN_ID_MAP[newProjectForm.nama_wilayah];
    if (!kecId) return;

    if (typeof apiService.getWilayahList === 'function') {
      setIsLoadingDesa(true);
      apiService
        .getWilayahList('desa', kecId)
        .then((res) => {
          if (res && res.length > 0) {
            const mapped = res.map((d) => ({ id: d.id, nama_wilayah: d.nama_wilayah }));
            setDesaOptions(mapped);
            if (newProjectForm.skala_proyek === 'skala_desa') {
              const first = mapped[0];
              const newCode = generateProjectSerialNumber(
                newProjectForm.nama_wilayah,
                first.nama_wilayah,
                'skala_desa',
                projectList
              );
              setNewProjectForm((prev) => ({
                ...prev,
                desa_id: first.id,
                nama_desa: first.nama_wilayah,
                kode_proyek: newCode,
              }));
            }
          } else {
            // Fallback ke data geoWilayahData
            const matched = WILAYAH_DATA.kecamatanList.find((k) => k.nama === newProjectForm.nama_wilayah);
            if (matched && matched.desaList) {
              const fallbackList = matched.desaList
                .filter((d) => d !== 'Semua Desa / Kelurahan')
                .map((d, idx) => ({ id: 9000 + idx, nama_wilayah: d }));
              setDesaOptions(fallbackList);
            }
          }
        })
        .catch(() => {
          const matched = WILAYAH_DATA.kecamatanList.find((k) => k.nama === newProjectForm.nama_wilayah);
          if (matched && matched.desaList) {
            const fallbackList = matched.desaList
              .filter((d) => d !== 'Semua Desa / Kelurahan')
              .map((d, idx) => ({ id: 9000 + idx, nama_wilayah: d }));
            setDesaOptions(fallbackList);
          }
        })
        .finally(() => {
          setIsLoadingDesa(false);
        });
    } else {
      const matched = WILAYAH_DATA.kecamatanList.find((k) => k.nama === newProjectForm.nama_wilayah);
      if (matched && matched.desaList) {
        const fallbackList = matched.desaList
          .filter((d) => d !== 'Semua Desa / Kelurahan')
          .map((d, idx) => ({ id: 9000 + idx, nama_wilayah: d }));
        setDesaOptions(fallbackList);
      }
    }
  }, [newProjectForm.nama_wilayah]);

  // Handle verifikasi akses penanggung jawab proyek
  const handleVerifyGate = async (e?: React.FormEvent, directCode?: string, directPw?: string) => {
    if (e) e.preventDefault();
    const codeToVerify = (directCode || gateCode).trim().toUpperCase();
    const pwToVerify = (directPw || gatePassword).trim();

    if (!codeToVerify || !pwToVerify) {
      setGateError('Harap masukkan Nomor Seri Kode Proyek dan Kunci Akses Khusus.');
      return;
    }

    setIsVerifyingGate(true);
    setGateError(null);

    try {
      const res = await apiService.verifyProjectAccess(codeToVerify, pwToVerify);
      if (res.success && res.proyek) {
        setUnlockedProject(res.proyek);
        sessionStorage.setItem('civictrack_pj_unlocked_project', JSON.stringify(res.proyek));
        setSelectedProjectForTimeline(res.proyek.id);
        setNewDocForm((prev) => ({ ...prev, proyek_id: res.proyek!.id }));
      } else {
        setGateError(res.message || 'Verifikasi akses gagal.');
      }
    } catch (err: any) {
      setGateError(err.message || 'Kode proyek atau kunci akses khusus tidak valid.');
    } finally {
      setIsVerifyingGate(false);
    }
  };

  const handleLockProject = () => {
    setUnlockedProject(null);
    sessionStorage.removeItem('civictrack_pj_unlocked_project');
    setGateCode('');
    setGatePassword('');
    setGateError(null);
  };

  // Edit project state
  const [editingProject, setEditingProject] = useState<ProyekItem | null>(null);
  const [editForm, setEditForm] = useState({
    nama_proyek: '',
    kategori: 'jalan' as ProyekKategori,
    anggaran: 0,
    tanggal_mulai: '',
    estimasi_selesai: '',
    progres_persen: 0,
    status: 'berjalan' as ProyekStatus,
    catatan_perubahan: '',
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Validasi real-time Point-in-Polygon terhadap wilayah terpilih
  const spatialValidation = useMemo(() => {
    return validateCoordinatesInKecamatan(
      Number(newProjectForm.latitude),
      Number(newProjectForm.longitude),
      newProjectForm.nama_wilayah
    );
  }, [newProjectForm.latitude, newProjectForm.longitude, newProjectForm.nama_wilayah]);

  // Linimasa state
  const [selectedProjectForTimeline, setSelectedProjectForTimeline] = useState<number>(2);
  const [timelineStages, setTimelineStages] = useState<LinimasaTahap[]>(MOCK_LINIMASA_TAHAP);
  const [isNewStageModalOpen, setIsNewStageModalOpen] = useState(false);
  const [newStageForm, setNewStageForm] = useState({
    nama_tahap: '',
    deskripsi: '',
    target_mulai: '2024-04-01',
    target_selesai: '2024-06-30',
    persentase_bobot: 15,
  });

  // Dokumentasi state
  const [dokumentasiList, setDokumentasiList] = useState<DokumentasiProyek[]>(MOCK_DOKUMENTASI_PROYEK);
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const [newDocForm, setNewDocForm] = useState({
    proyek_id: 2,
    nama_tahap: 'Galian & Pemadatan Lapis Pondasi',
    judul: '',
    deskripsi: '',
    foto_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=800&auto=format&fit=crop&q=80',
    tipe_file: 'foto' as const,
  });

  // Aduan state
  const [aduanList, setAduanList] = useState<LaporanAduan[]>(MOCK_LAPORAN_WARGA);
  const [selectedAduanToReply, setSelectedAduanToReply] = useState<LaporanAduan | null>(null);

  // Load aduan warga from database & persistent storage + real-time listener
  React.useEffect(() => {
    if (typeof apiService.getAllReports === 'function') {
      apiService
        .getAllReports()
        .then((reports) => {
          if (reports && reports.length > 0) {
            setAduanList(reports);
          }
        })
        .catch((err) => {
          console.warn('Gagal memuat aduan masyarakat:', err);
        });
    }

    const handleNewAduan = (event: any) => {
      if (event.detail) {
        setAduanList((prev) => [event.detail, ...prev.filter((item) => item.id !== event.detail.id)]);
      }
    };

    window.addEventListener('civictrack_new_aduan', handleNewAduan);
    return () => {
      window.removeEventListener('civictrack_new_aduan', handleNewAduan);
    };
  }, []);

  // Evaluasi cacat state
  const [evaluasiList, setEvaluasiList] = useState<EvaluasiCacatItem[]>(MOCK_EVALUASI_CACAT);
  const [selectedEvalToVerify, setSelectedEvalToVerify] = useState<EvaluasiCacatItem | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<EvaluasiStatusType>('terverifikasi_perlu_tindak_lanjut');
  const [tindakanDinasText, setTindakanDinasText] = useState('');
  const [evalStatusLogs, setEvalStatusLogs] = useState<any[]>([]);

  React.useEffect(() => {
    // Load real evaluations from database and localStorage
    const loadEvaluations = () => {
      apiService
        .getEvaluations()
        .then((apiEvals) => {
          if (apiEvals && apiEvals.length > 0) {
            const mapped: EvaluasiCacatItem[] = apiEvals.map((e) => {
              let cleanDesc = e.deskripsi || '';
              let lokasi = (e as any).lokasi_titik || 'Lokasi Proyek';
              const patokanMatch = cleanDesc.match(/^\[Patokan:\s*([^\]]+)\]\s*/);
              if (patokanMatch) {
                lokasi = patokanMatch[1].trim();
                cleanDesc = cleanDesc.replace(/^\[Patokan:\s*([^\]]+)\]\s*/, '').trim();
              }
              const dinasLog = e.status_logs?.slice().reverse().find((l) => l.status_baru !== 'menunggu_verifikasi');
              const catatan_dinas = dinasLog?.catatan || (e.status !== 'menunggu_verifikasi' ? (e as any).catatan_dinas : undefined);
              const tanggal_tindakan = dinasLog?.created_at
                ? new Date(dinasLog.created_at).toLocaleDateString('id-ID')
                : (catatan_dinas ? 'Telah diverifikasi' : undefined);

              return {
                id: e.id,
                proyek_id: e.proyek_id,
                nama_proyek: e.nama_proyek,
                user_id: e.user_id,
                nama_pelapor: e.pelapor?.nama || (e as any).nama_pelapor || 'Warga Masyarakat',
                deskripsi: cleanDesc,
                lokasi_titik: lokasi,
                skor_urgensi_ai: e.skor_urgensi_ai || 3,
                analisis_ai: e.ringkasan_analisis_ai || 'Analisis AI Groq',
                kategori_cacat: e.kategori_masalah,
                status_verifikasi: e.status,
                catatan_dinas,
                tanggal_tindakan,
                tanggal_lapor: String(e.created_at).split('T')[0],
              };
            });
            setEvaluasiList(mapped);
          }
        })
        .catch(() => {});
    };

    loadEvaluations();

    const handleNewEvaluasi = () => {
      loadEvaluations();
    };

    const handleEvaluasiVerified = () => {
      loadEvaluations();
    };

    window.addEventListener('civictrack_new_evaluasi', handleNewEvaluasi);
    window.addEventListener('civictrack_evaluasi_verified', handleEvaluasiVerified);

    return () => {
      window.removeEventListener('civictrack_new_evaluasi', handleNewEvaluasi);
      window.removeEventListener('civictrack_evaluasi_verified', handleEvaluasiVerified);
    };
  }, []);

  React.useEffect(() => {
    if (selectedEvalToVerify) {
      apiService
        .getEvaluationStatusLogs(selectedEvalToVerify.id)
        .then((logs) => {
          setEvalStatusLogs(logs || []);
        })
        .catch(() => {
          setEvalStatusLogs([]);
        });
    } else {
      setEvalStatusLogs([]);
    }
  }, [selectedEvalToVerify]);

  // Handle create new project via backend API
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spatialValidation.isValid) {
      alert(`Validasi Koordinat Gagal (Point-in-Polygon):\n${spatialValidation.message}`);
      return;
    }

    setIsSubmittingNewProj(true);
    setCreateProjError(null);

    try {
      const wilayahId = KECAMATAN_ID_MAP[newProjectForm.nama_wilayah] || 23;
      const dinasId = currentUser.dinas_id || 1;

      const created = await apiService.createProject({
        nama_proyek: newProjectForm.nama_proyek.trim(),
        kategori: newProjectForm.kategori,
        deskripsi: newProjectForm.deskripsi.trim() || undefined,
        latitude: Number(newProjectForm.latitude),
        longitude: Number(newProjectForm.longitude),
        wilayah_id: wilayahId,
        desa_id: newProjectForm.skala_proyek === 'skala_desa' ? newProjectForm.desa_id : null,
        dinas_id: dinasId,
        anggaran: Number(newProjectForm.anggaran),
        status: newProjectForm.status,
        progres_persen: Number(newProjectForm.progres_persen),
        tanggal_mulai: newProjectForm.tanggal_mulai,
        estimasi_selesai: newProjectForm.estimasi_selesai,
        kode_proyek: newProjectForm.kode_proyek.trim() || undefined,
        kode_akses: newProjectForm.kode_akses.trim() || undefined,
      });

      setProjectList((prev) => [created, ...prev]);
      if (onProjectCreated) {
        onProjectCreated(created);
      }

      setIsNewProjectModalOpen(false);
      const nextPin = generateRandomAccessKey();
      const nextCode = generateProjectSerialNumber(
        'Kecamatan Lamongan (Kota)',
        'Kelurahan Jetis',
        'skala_desa',
        [created, ...projectList]
      );
      setNewProjectForm({
        nama_proyek: '',
        kategori: 'jalan',
        deskripsi: '',
        anggaran: 5000000000,
        status: 'berjalan',
        tanggal_mulai: new Date().toISOString().split('T')[0],
        estimasi_selesai: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
        progres_persen: 0,
        skala_proyek: 'skala_desa',
        nama_wilayah: 'Kecamatan Lamongan (Kota)',
        nama_desa: 'Kelurahan Jetis',
        desa_id: 400,
        kode_proyek: nextCode,
        kode_akses: nextPin,
        latitude: -7.1197,
        longitude: 112.4150,
        nama_dinas: currentUser.nama_dinas || 'Dinas Pekerjaan Umum dan Penataan Ruang',
        tahap_terkini: 'Pembersihan & Pengukuran Lahan',
      });
    } catch (err: any) {
      setCreateProjError(err.message || 'Gagal menambahkan proyek baru.');
    } finally {
      setIsSubmittingNewProj(false);
    }
  };

  // Handle open edit project modal
  const handleOpenEditModal = (p: ProyekItem) => {
    setEditingProject(p);
    setEditForm({
      nama_proyek: p.nama_proyek,
      kategori: p.kategori,
      anggaran: p.anggaran,
      tanggal_mulai: p.tanggal_mulai || '2024-01-01',
      estimasi_selesai: p.estimasi_selesai || '2024-12-31',
      progres_persen: p.progres_persen,
      status: p.status,
      catatan_perubahan: '',
    });
    setEditError(null);
  };

  // Handle submit edit project
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    const oldProgres = editingProject.progres_persen;
    const newProgres = Number(editForm.progres_persen);
    const isDecreased = newProgres < oldProgres;

    if (isDecreased) {
      const cleanCatatan = editForm.catatan_perubahan.trim();
      if (cleanCatatan.length < 10) {
        setEditError(
          `Penurunan progres dari ${oldProgres}% ke ${newProgres}% wajib menyertakan alasan minimal 10 karakter (Aturan PRD 10.1).`
        );
        return;
      }
    }

    if (editForm.estimasi_selesai && editForm.tanggal_mulai && editForm.estimasi_selesai < editForm.tanggal_mulai) {
      setEditError('Estimasi tanggal selesai tidak boleh lebih awal dari tanggal mulai pengerjaan.');
      return;
    }

    setIsSubmittingEdit(true);
    setEditError(null);

    try {
      const updated = await apiService.updateProject(editingProject.id, {
        nama_proyek: editForm.nama_proyek,
        kategori: editForm.kategori,
        anggaran: Number(editForm.anggaran),
        tanggal_mulai: editForm.tanggal_mulai,
        estimasi_selesai: editForm.estimasi_selesai,
        progres_persen: newProgres,
        status: editForm.status,
        catatan_perubahan: editForm.catatan_perubahan.trim() || undefined,
      });

      setProjectList((prev) =>
        prev.map((item) => (item.id === editingProject.id ? { ...item, ...updated } : item))
      );
      if (onProjectUpdated) {
        onProjectUpdated(updated);
      }
      setEditingProject(null);
    } catch (err: any) {
      setEditError(err.message || 'Gagal memperbarui data proyek.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle add new timeline stage
  const handleAddTimelineStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForTimeline) return;

    try {
      const stageRes = await apiService.createTimelineStage(selectedProjectForTimeline, {
        nama_tahap: newStageForm.nama_tahap.trim(),
        progres_persen: Number(newStageForm.persentase_bobot),
        catatan: newStageForm.deskripsi.trim() || undefined,
      });

      const newStage: LinimasaTahap = {
        id: stageRes.id,
        proyek_id: selectedProjectForTimeline,
        nomor_tahap: timelineStages.length + 1,
        nama_tahap: stageRes.nama_tahap,
        deskripsi: newStageForm.deskripsi,
        target_mulai: newStageForm.target_mulai,
        target_selesai: newStageForm.target_selesai,
        persentase_bobot: stageRes.progres_persen,
        status: 'sedang_berjalan',
        catatan_lapangan: stageRes.catatan || 'Tahap baru ditambahkan oleh pengawas teknis.',
      };
      setTimelineStages((prev) => [...prev, newStage]);

      const projToUpdate = projectList.find((p) => p.id === selectedProjectForTimeline);
      if (projToUpdate) {
        const updatedProj: ProyekItem = {
          ...projToUpdate,
          progres_persen: stageRes.progres_persen,
          tahap_terkini: stageRes.nama_tahap,
        };
        setProjectList((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
        if (onProjectUpdated) {
          onProjectUpdated(updatedProj);
        }
      }

      setIsNewStageModalOpen(false);
      setNewStageForm({
        nama_tahap: '',
        deskripsi: '',
        target_mulai: '2024-04-01',
        target_selesai: '2024-06-30',
        persentase_bobot: 15,
      });
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan tahapan linimasa.');
    }
  };

  // Handle submit documentation
  const handleAddDocumentation = (e: React.FormEvent) => {
    e.preventDefault();
    const selProj = projectList.find((p) => p.id === Number(newDocForm.proyek_id));
    const newDoc: DokumentasiProyek = {
      id: Date.now(),
      proyek_id: Number(newDocForm.proyek_id),
      nama_proyek: selProj?.nama_proyek || 'Pelebaran Jalan',
      nama_tahap: newDocForm.nama_tahap,
      judul: newDocForm.judul,
      deskripsi: newDocForm.deskripsi,
      foto_url: newDocForm.foto_url,
      tanggal_unggah: new Date().toISOString().split('T')[0],
      diunggah_oleh: `${currentUser.nama} (Admin Dinas PUPR)`,
      tipe_file: 'foto',
    };
    setDokumentasiList([newDoc, ...dokumentasiList]);
    setIsNewDocModalOpen(false);
    setNewDocForm({
      proyek_id: 2,
      nama_tahap: 'Galian & Pemadatan Lapis Pondasi',
      judul: '',
      deskripsi: '',
      foto_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=800&auto=format&fit=crop&q=80',
      tipe_file: 'foto',
    });
  };



  // Handle verify defect
  const handleVerifyDefect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvalToVerify || !tindakanDinasText.trim()) return;

    try {
      await apiService.verifyEvaluation(selectedEvalToVerify.id, {
        status: verifyStatus,
        catatan: tindakanDinasText.trim(),
      });

      setEvaluasiList((prev) =>
        prev.map((item) =>
          item.id === selectedEvalToVerify.id
            ? {
                ...item,
                status_verifikasi: verifyStatus,
                catatan_dinas: tindakanDinasText,
                tanggal_tindakan: new Date().toLocaleDateString('id-ID'),
              }
            : item
        )
      );

      if (onProjectUpdated) {
        apiService.getProjectDetail(selectedEvalToVerify.proyek_id).then((p) => {
          onProjectUpdated(p);
        }).catch(() => {});
      }

      setSelectedEvalToVerify(null);
      setTindakanDinasText('');
      setVerifyStatus('terverifikasi_perlu_tindak_lanjut');
    } catch (err: any) {
      alert(err.message || 'Gagal memverifikasi evaluasi.');
    }
  };

  // Quick stats calculation
  const totalAnggaran = projectList.reduce((acc, p) => acc + p.anggaran, 0);
  const berjalanCount = projectList.filter((p) => p.status === 'berjalan').length;
  const selesaiCount = projectList.filter((p) => p.status === 'selesai').length;
  const tertundaCount = projectList.filter((p) => p.status === 'ditangguhkan').length;
  const aduanMenungguCount = aduanList.filter((a) => a.status === 'menunggu').length;

  const filteredProjects = projectList.filter((p) => {
    if (filterStatus !== 'semua' && p.status !== filterStatus) return false;
    if (searchProj.trim()) {
      const q = searchProj.toLowerCase();
      return (
        p.nama_proyek.toLowerCase().includes(q) ||
        (p.nama_wilayah || '').toLowerCase().includes(q) ||
        p.kategori.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ── GERBANG AKSES VERIFIKASI PENANGGUNG JAWAB PROYEK ──
  if (currentUser.role === 'penanggung_jawab' && !unlockedProject) {
    return (
      <div className="max-w-2xl w-full mx-auto py-8 px-4 space-y-6 animate-fade-in">
        {/* Toast Notifikasi Feedback Copy */}
        {copyFeedback && (
          <div className="fixed top-6 right-6 z-50 bg-[#184C78] text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 animate-bounce">
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>{copyFeedback} berhasil disalin ke clipboard!</span>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-[#DCE0E6] shadow-xl overflow-hidden">
          {/* Header Gerbang Bernuansa Keamanan Tinggi */}
          <div className="bg-gradient-to-r from-[#0f3252] via-[#184C78] to-[#1f5f94] text-white p-7 sm:p-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30 text-xs font-semibold mb-3">
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span>Verifikasi Otorisasi Penanggung Jawab Proyek</span>
            </div>
            <h2 className="font-['DM_Sans'] text-2xl font-bold tracking-tight">
              Gerbang Akses Penanggung Jawab Proyek
            </h2>
            <p className="text-xs sm:text-sm text-white/80 mt-1 leading-relaxed">
              Silakan masukkan <strong>Nomor Seri / Kode Registrasi Proyek</strong> dan <strong>Kunci Akses Khusus</strong> yang telah diberikan oleh Pimpinan Instansi / Dinas untuk membuka lembar kerja proyek Anda.
            </p>
          </div>

          {/* Form Verifikasi */}
          <form onSubmit={handleVerifyGate} className="p-6 sm:p-8 space-y-5">
            {gateError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs animate-shake">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Akses Ditolak / Tidak Ditemukan</p>
                  <p className="mt-0.5 leading-relaxed">{gateError}</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="gate_kode_proyek" className="block text-xs font-bold text-[#184C78] uppercase tracking-wider mb-2">
                Nomor Seri / Kode Registrasi Proyek
              </label>
              <div className="relative">
                <input
                  id="gate_kode_proyek"
                  type="text"
                  required
                  value={gateCode}
                  onChange={(e) => setGateCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: SKD-SKD-001 atau LMG-JTS-001"
                  className="w-full pl-11 pr-4 py-3 bg-[#F5F7FA] border border-[#DCE0E6] rounded-xl font-mono text-sm uppercase tracking-wider font-bold text-[#212529] outline-none focus:border-[#2980B9] focus:bg-white transition-all shadow-inner"
                />
                <FolderKanban className="w-5 h-5 text-[#6C757D] absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
              <p className="text-[11px] text-[#6C757D] mt-1.5">
                Nomor registrasi unik lokasi proyek (Kecamatan - Desa - Urutan) yang diterbitkan saat penginputan proyek baru.
              </p>
            </div>

            <div>
              <label htmlFor="gate_password" className="block text-xs font-bold text-[#184C78] uppercase tracking-wider mb-2">
                Kunci Akses Khusus / Password Proyek
              </label>
              <div className="relative">
                <input
                  id="gate_password"
                  type={showGatePassword ? 'text' : 'password'}
                  required
                  value={gatePassword}
                  onChange={(e) => setGatePassword(e.target.value)}
                  placeholder="Contoh: PJ-17409"
                  className="w-full pl-11 pr-11 py-3 bg-[#F5F7FA] border border-[#DCE0E6] rounded-xl font-mono text-sm font-bold text-[#212529] outline-none focus:border-[#2980B9] focus:bg-white transition-all shadow-inner"
                />
                <Key className="w-5 h-5 text-[#6C757D] absolute left-3.5 top-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowGatePassword(!showGatePassword)}
                  className="absolute right-3.5 top-3.5 text-[#6C757D] hover:text-[#184C78] cursor-pointer"
                >
                  {showGatePassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-[11px] text-[#6C757D] mt-1.5">
                Password otorisasi khusus yang diserahkan oleh pimpinan kepada mandor / pelaksana sebelum memulai proyek.
              </p>
            </div>

            <button
              type="submit"
              disabled={isVerifyingGate}
              className="w-full py-3.5 bg-gradient-to-r from-[#184C78] to-[#2980B9] hover:from-[#0f3252] hover:to-[#184C78] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isVerifyingGate ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi Otorisasi Proyek...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 text-amber-300" />
                  <span>Buka Lembar Kerja Proyek</span>
                </>
              )}
            </button>
          </form>

          {/* Bantuan Pengujian Cepat / Kunci Demo */}
          <div className="bg-[#F8FAFC] border-t border-[#DCE0E6] p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#184C78]">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Pilihan Proyek Tersedia untuk Pengujian Langsung:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {projectList.slice(0, 4).map((demoProj) => (
                <button
                  key={demoProj.id}
                  type="button"
                  onClick={() => {
                    setGateCode(demoProj.kode_proyek || '');
                    setGatePassword(demoProj.kode_akses || '');
                    handleVerifyGate(undefined, demoProj.kode_proyek, demoProj.kode_akses);
                  }}
                  className="text-left p-3 rounded-xl border border-[#DCE0E6] bg-white hover:border-[#2980B9] hover:bg-[#EBF4FB] transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-[#184C78]">
                    <span>{demoProj.kode_proyek || 'PROYEK'}</span>
                    <span className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {demoProj.kode_akses || 'KUNCI'}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#495057] line-clamp-1 mt-1 font-medium group-hover:text-[#184C78]">
                    {demoProj.nama_proyek}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedAduanToReply) {
    return (
      <AduanDetailView
        aduan={selectedAduanToReply}
        currentUser={currentUser}
        projects={projects}
        onBack={() => setSelectedAduanToReply(null)}
        onOpenProjectDetail={onOpenProjectDetail}
        onAduanUpdated={(updated) => {
          setAduanList((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item))
          );
          setSelectedAduanToReply(updated);
        }}
      />
    );
  }

  const isAnyFormOpen =
    isNewProjectModalOpen ||
    !!editingProject ||
    isNewStageModalOpen ||
    isNewDocModalOpen ||
    !!selectedEvalToVerify;

  useEffect(() => {
    if (isAnyFormOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isNewProjectModalOpen) {
          setIsNewProjectModalOpen(false);
          setCreateProjError(null);
        }
        if (editingProject) setEditingProject(null);
        if (isNewStageModalOpen) setIsNewStageModalOpen(false);
        if (isNewDocModalOpen) setIsNewDocModalOpen(false);
        if (selectedEvalToVerify) setSelectedEvalToVerify(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAnyFormOpen, isNewProjectModalOpen, editingProject, isNewStageModalOpen, isNewDocModalOpen, selectedEvalToVerify]);

  return (
    <div className="space-y-6 animate-hero-in">
      {/* Toast Notifikasi Feedback Copy */}
      {copyFeedback && (
        <div className="fixed top-6 right-6 z-50 bg-[#184C78] text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCheck className="w-4 h-4 text-emerald-400" />
          <span>{copyFeedback} berhasil disalin ke clipboard!</span>
        </div>
      )}

      {/* ── MODAL: INPUT PROYEK BARU ── */}
      {isNewProjectModalOpen && renderPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-new-project-title"
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/65 backdrop-blur-xs animate-fade-in"
          onClick={() => {
            setIsNewProjectModalOpen(false);
            setCreateProjError(null);
          }}
        >
          <div className="flex min-h-full items-center justify-center p-2.5 sm:p-4 md:p-6 text-center">
            <div
              className="relative w-full max-w-lg sm:max-w-2xl lg:max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col text-left border border-[#DCE0E6] my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header: Dark Blue #184C78 */}
              <div className="bg-[#184C78] text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
                    <FolderKanban className="w-4 h-4 text-cyan-300" />
                  </div>
                  <div>
                    <h3 id="modal-new-project-title" className="font-['DM_Sans'] text-base sm:text-lg font-bold leading-tight">
                      Input Data Proyek Pembangunan Baru
                    </h3>
                    <p className="text-[11px] sm:text-xs text-white/80 mt-0.5 leading-tight">
                      Proyek akan langsung terindeks di peta interaktif dan dapat dipantau oleh warga masyarakat.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsNewProjectModalOpen(false);
                    setCreateProjError(null);
                  }}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-3"
                  title="Tutup Modal"
                  aria-label="Tutup Modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleCreateProject} className="flex flex-col flex-1 overflow-hidden min-h-0">
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs scrollbar-thin">
              <div>
                <label htmlFor="nama_proyek" className="block font-semibold text-[#184C78] mb-1">Nama Proyek</label>
                <input
                  id="nama_proyek"
                  type="text"
                  required
                  placeholder="Contoh: Peningkatan Jalan Raya Arjuno KM 1–3"
                  value={newProjectForm.nama_proyek}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, nama_proyek: e.target.value })}
                  className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="kategori" className="block font-semibold text-[#184C78] mb-1">Kategori Sektor</label>
                  <select
                    id="kategori"
                    value={newProjectForm.kategori}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, kategori: e.target.value as any })}
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-lg bg-white outline-none focus:border-[#2980B9]"
                  >
                    <option value="jalan">Jalan & Jembatan</option>
                    <option value="taman">Taman & RTH</option>
                    <option value="drainase">Drainase & Sanitasi</option>
                    <option value="fasilitas">Fasilitas Publik</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="anggaran" className="block font-semibold text-[#184C78] mb-1">Pagu Anggaran (Rp)</label>
                  <input
                    id="anggaran"
                    type="number"
                    required
                    min={10000000}
                    step={10000000}
                    value={newProjectForm.anggaran}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, anggaran: Number(e.target.value) })}
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                  />
                </div>
              </div>

              {/* Periode Pelaksanaan Proyek */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="tanggal_mulai" className="block font-semibold text-[#184C78] mb-1">
                    Tanggal Mulai Pelaksanaan
                  </label>
                  <input
                    id="tanggal_mulai"
                    type="date"
                    required
                    value={newProjectForm.tanggal_mulai}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, tanggal_mulai: e.target.value })}
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                  />
                </div>
                <div>
                  <label htmlFor="estimasi_selesai" className="block font-semibold text-[#184C78] mb-1">
                    Estimasi Selesai (Target Rampung)
                  </label>
                  <input
                    id="estimasi_selesai"
                    type="date"
                    required
                    min={newProjectForm.tanggal_mulai}
                    value={newProjectForm.estimasi_selesai}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, estimasi_selesai: e.target.value })}
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                  />
                </div>
              </div>

              {/* Cakupan Skala Proyek & Lokasi Administratif Berjenjang */}
              <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#DCE0E6] space-y-3.5">
                <div>
                  <label className="block font-semibold text-[#184C78] mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#2980B9]" />
                      Skala &amp; Cakupan Wilayah Proyek
                    </span>
                    <span className="text-[10.5px] font-normal text-[#6C757D]">
                      Menentukan struktur kode seri nomor registrasi
                    </span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newCode = generateProjectSerialNumber(
                          newProjectForm.nama_wilayah,
                          newProjectForm.nama_desa,
                          'skala_desa',
                          projectList
                        );
                        setNewProjectForm({
                          ...newProjectForm,
                          skala_proyek: 'skala_desa',
                          kode_proyek: newCode,
                        });
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        newProjectForm.skala_proyek === 'skala_desa'
                          ? 'bg-white border-[#184C78] shadow-xs ring-2 ring-[#184C78]/10'
                          : 'bg-white/60 border-[#DCE0E6] hover:bg-white text-[#6C757D]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-[#184C78]">Skala Desa / Kelurahan</span>
                        <div
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            newProjectForm.skala_proyek === 'skala_desa'
                              ? 'border-[#184C78] bg-[#184C78]'
                              : 'border-slate-300'
                          }`}
                        >
                          {newProjectForm.skala_proyek === 'skala_desa' && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-[#6C757D] leading-tight">
                        Fokus pada satu desa/kelurahan spesifik (Format: KEC-DES-XXX)
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const newCode = generateProjectSerialNumber(
                          newProjectForm.nama_wilayah,
                          undefined,
                          'skala_kecamatan',
                          projectList
                        );
                        setNewProjectForm({
                          ...newProjectForm,
                          skala_proyek: 'skala_kecamatan',
                          kode_proyek: newCode,
                        });
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        newProjectForm.skala_proyek === 'skala_kecamatan'
                          ? 'bg-white border-[#184C78] shadow-xs ring-2 ring-[#184C78]/10'
                          : 'bg-white/60 border-[#DCE0E6] hover:bg-white text-[#6C757D]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-[#184C78]">Skala Kecamatan (Lintas Desa)</span>
                        <div
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            newProjectForm.skala_proyek === 'skala_kecamatan'
                              ? 'border-[#184C78] bg-[#184C78]'
                              : 'border-slate-300'
                          }`}
                        >
                          {newProjectForm.skala_proyek === 'skala_kecamatan' && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-[#6C757D] leading-tight">
                        Infrastruktur koridor/lintas desa se-kecamatan (Format: KEC-XXX)
                      </p>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Pilihan Kecamatan */}
                  <div>
                    <label className="block font-semibold text-[#184C78] mb-1">
                      Kecamatan
                    </label>
                    <select
                      value={newProjectForm.nama_wilayah}
                      onChange={(e) => {
                        const selName = e.target.value;
                        const matched = WILAYAH_DATA.kecamatanList.find((k) => k.nama === selName);
                        const newLat = matched ? matched.koordinatPusat[0] : newProjectForm.latitude;
                        const newLng = matched ? matched.koordinatPusat[1] : newProjectForm.longitude;
                        const newCode = newProjectForm.skala_proyek === 'skala_kecamatan'
                          ? generateProjectSerialNumber(selName, undefined, 'skala_kecamatan', projectList)
                          : generateProjectSerialNumber(selName, newProjectForm.nama_desa, 'skala_desa', projectList);
                        setNewProjectForm({
                          ...newProjectForm,
                          nama_wilayah: selName,
                          latitude: newLat,
                          longitude: newLng,
                          kode_proyek: newCode,
                        });
                      }}
                      className="w-full p-2.5 border border-[#DCE0E6] rounded-lg bg-white outline-none focus:border-[#2980B9]"
                    >
                      {WILAYAH_DATA.kecamatanList.map((k) => (
                        <option key={k.nama} value={k.nama}>
                          {k.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pilihan Desa / Kelurahan */}
                  <div>
                    <label className="block font-semibold text-[#184C78] mb-1">
                      Desa / Kelurahan
                    </label>
                    {newProjectForm.skala_proyek === 'skala_desa' ? (
                      <select
                        value={newProjectForm.desa_id || (desaOptions[0]?.id ?? '')}
                        disabled={isLoadingDesa}
                        onChange={(e) => {
                          const selId = Number(e.target.value);
                          const selDesa = desaOptions.find((d) => d.id === selId);
                          const selName = selDesa ? selDesa.nama_wilayah : 'Kelurahan';
                          const newCode = generateProjectSerialNumber(
                            newProjectForm.nama_wilayah,
                            selName,
                            'skala_desa',
                            projectList
                          );
                          setNewProjectForm({
                            ...newProjectForm,
                            desa_id: selId,
                            nama_desa: selName,
                            kode_proyek: newCode,
                          });
                        }}
                        className="w-full p-2.5 border border-[#DCE0E6] rounded-lg bg-white outline-none focus:border-[#2980B9] disabled:bg-slate-100"
                      >
                        {isLoadingDesa ? (
                          <option value="">Memuat daftar desa...</option>
                        ) : desaOptions.length > 0 ? (
                          desaOptions.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.nama_wilayah}
                            </option>
                          ))
                        ) : (
                          <option value="">Pusat Kecamatan / Ibu Kota</option>
                        )}
                      </select>
                    ) : (
                      <div className="p-2.5 bg-slate-100 border border-[#DCE0E6] rounded-lg text-slate-500 italic text-xs flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Cakupan Lintas Wilayah Kecamatan</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Box Kredensial Akses & Nomor Seri Proyek */}
              <div className="p-4 bg-gradient-to-br from-[#F5F9FD] to-[#EDF5FC] rounded-2xl border border-[#BDD7EE] space-y-3">
                <div className="flex items-center justify-between border-b border-[#D4E4F5] pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#184C78] text-white rounded-lg shadow-xs">
                      <Key className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-['DM_Sans'] font-bold text-xs text-[#184C78]">
                        Nomor Seri Registrasi &amp; Kunci Akses Khusus
                      </h4>
                      <p className="text-[10px] text-[#6C757D]">
                        Kredensial resmi yang dibagikan pimpinan ke penanggung jawab proyek
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-[#EBF4FB] text-[#184C78] px-2 py-0.5 rounded-full border border-[#BDD7EE]">
                    Otomatisasi Sistem
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Nomor Seri / Kode Proyek */}
                  <div>
                    <label className="block font-semibold text-[#184C78] mb-1 flex items-center justify-between">
                      <span>Kode Seri Proyek</span>
                      <button
                        type="button"
                        onClick={() => {
                          const refreshed = generateProjectSerialNumber(
                            newProjectForm.nama_wilayah,
                            newProjectForm.skala_proyek === 'skala_desa' ? newProjectForm.nama_desa : undefined,
                            newProjectForm.skala_proyek,
                            projectList
                          );
                          setNewProjectForm({ ...newProjectForm, kode_proyek: refreshed });
                        }}
                        className="text-[10.5px] text-[#2980B9] hover:underline flex items-center gap-1 cursor-pointer font-normal"
                        title="Perbarui kode nomor seri secara otomatis"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Generate Ulang</span>
                      </button>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={newProjectForm.kode_proyek}
                        onChange={(e) =>
                          setNewProjectForm({ ...newProjectForm, kode_proyek: e.target.value.toUpperCase() })
                        }
                        placeholder="Contoh: LMG-JTS-001"
                        className="w-full p-2.5 font-mono font-bold text-sm tracking-wider text-[#184C78] bg-white border border-[#BDD7EE] rounded-lg outline-none focus:border-[#184C78] focus:ring-1 focus:ring-[#184C78]"
                      />
                    </div>
                    <p className="text-[10px] text-[#6C757D] mt-1">
                      Menyesuaikan kode kecamatan &amp; desa: {newProjectForm.kode_proyek || '-'}
                    </p>
                  </div>

                  {/* Password / Kunci Akses Khusus */}
                  <div>
                    <label className="block font-semibold text-[#184C78] mb-1 flex items-center justify-between">
                      <span>Password / Kunci Akses Khusus</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newPin = generateRandomAccessKey();
                            setNewProjectForm({ ...newProjectForm, kode_akses: newPin });
                          }}
                          className="text-[10.5px] text-[#2980B9] hover:underline flex items-center gap-1 cursor-pointer font-normal"
                          title="Buat PIN acak baru"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Acak PIN</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyText(newProjectForm.kode_akses, 'Kunci Akses Form')}
                          className="text-[10.5px] text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer font-normal"
                          title="Salin Kunci Akses"
                        >
                          {copyFeedback === 'Kunci Akses Form' ? (
                            <>
                              <CheckCheck className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">Disalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={newProjectForm.kode_akses}
                        onChange={(e) =>
                          setNewProjectForm({ ...newProjectForm, kode_akses: e.target.value })
                        }
                        placeholder="Contoh: PJ-17409"
                        className="w-full p-2.5 font-mono font-bold text-sm tracking-wider text-emerald-800 bg-white border border-[#BDD7EE] rounded-lg outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                    <p className="text-[10px] text-[#6C757D] mt-1">
                      Berikan password ini kepada mandor/kontraktor penanggung jawab
                    </p>
                  </div>
                </div>
              </div>

              {/* Koordinat Lintang & Bujur (Point-in-Polygon Validation) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="latitude" className="block font-semibold text-[#184C78] mb-1">
                    Latitude (Lintang)
                  </label>
                  <input
                    id="latitude"
                    type="number"
                    step="0.0001"
                    required
                    value={newProjectForm.latitude}
                    onChange={(e) =>
                      setNewProjectForm({
                        ...newProjectForm,
                        latitude: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                  />
                </div>
                <div>
                  <label htmlFor="longitude" className="block font-semibold text-[#184C78] mb-1">
                    Longitude (Bujur)
                  </label>
                  <input
                    id="longitude"
                    type="number"
                    step="0.0001"
                    required
                    value={newProjectForm.longitude}
                    onChange={(e) =>
                      setNewProjectForm({
                        ...newProjectForm,
                        longitude: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                  />
                </div>
              </div>

              {/* Status Badge Verifikasi Spasial Point-in-Polygon */}
              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs transition-colors ${
                  spatialValidation.isValid
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-300 text-rose-800'
                }`}
              >
                {spatialValidation.isValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-bold flex items-center justify-between">
                    <span>
                      {spatialValidation.isValid
                        ? 'Point-in-Polygon: Terverifikasi di Dalam Wilayah'
                        : 'Point-in-Polygon: Di Luar Batas Wilayah!'}
                    </span>
                    {spatialValidation.centerCoordinates && !spatialValidation.isValid && (
                      <button
                        type="button"
                        onClick={() =>
                          setNewProjectForm({
                            ...newProjectForm,
                            latitude: spatialValidation.centerCoordinates![0],
                            longitude: spatialValidation.centerCoordinates![1],
                          })
                        }
                        className="text-[11px] underline font-semibold text-rose-700 hover:text-rose-900 cursor-pointer ml-2"
                      >
                        Reset ke Titik Wilayah
                      </button>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">
                    {spatialValidation.message}
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="deskripsi" className="block font-semibold text-[#184C78] mb-1">Uraian / Deskripsi Pekerjaan</label>
                <textarea
                  id="deskripsi"
                  rows={3}
                  required
                  placeholder="Jelaskan ruang lingkup pengerjaan konstruksi..."
                  value={newProjectForm.deskripsi}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, deskripsi: e.target.value })}
                  className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#184C78] mb-1">Status Pekerjaan</label>
                  <select
                    value={newProjectForm.status}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, status: e.target.value as any })}
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-lg bg-white outline-none focus:border-[#2980B9]"
                  >
                    <option value="berjalan">Sedang Berjalan</option>
                    <option value="selesai">Selesai</option>
                    <option value="ditangguhkan">Ditangguhkan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#184C78] mb-1">Progres Awal (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newProjectForm.progres_persen}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, progres_persen: Number(e.target.value) })}
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                  />
                </div>
              </div>

              {createProjError && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs">
                  <p className="font-semibold">{createProjError}</p>
                </div>
              )}

                </div>

                {/* Sticky Responsive Footer */}
                <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewProjectModalOpen(false);
                      setCreateProjError(null);
                    }}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-center"
                    disabled={isSubmittingNewProj}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingNewProj}
                    className="w-full sm:w-auto btn-primary !h-9 text-xs flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isSubmittingNewProj ? 'Menyimpan ke Database...' : 'Simpan & Publikasikan'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: SUNTING DATA PROYEK ── */}
      {editingProject && renderPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-edit-project-title"
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/65 backdrop-blur-xs animate-fade-in"
          onClick={() => setEditingProject(null)}
        >
          <div className="flex min-h-full items-center justify-center p-2.5 sm:p-4 md:p-6 text-center">
            <div
              className="relative w-full max-w-lg sm:max-w-2xl lg:max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col text-left border border-[#DCE0E6] my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header: Dark Blue #184C78 */}
              <div className="bg-[#184C78] text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
                    <Edit3 className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h3 id="modal-edit-project-title" className="font-['DM_Sans'] text-base sm:text-lg font-bold leading-tight">
                      Sunting Data Proyek: {editingProject.nama_proyek}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-white/80 mt-0.5 leading-tight">
                      Perbarui spesifikasi teknis, pagu anggaran, jadwal pelaksanaan, dan capaian progres fisik.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-3"
                  title="Tutup Modal"
                  aria-label="Tutup Modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleUpdateProject} className="flex flex-col flex-1 overflow-hidden min-h-0">
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs scrollbar-thin">
              {editError && (
                <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Validasi Gagal</strong>
                    <span>{editError}</span>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="edit_nama_proyek" className="block font-semibold text-[#184C78] mb-1">Nama Proyek</label>
                <input
                  id="edit_nama_proyek"
                  type="text"
                  required
                  value={editForm.nama_proyek}
                  onChange={(e) => setEditForm({ ...editForm, nama_proyek: e.target.value })}
                  className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edit_kategori" className="block font-semibold text-[#184C78] mb-1">Kategori Sektor</label>
                  <select
                    id="edit_kategori"
                    value={editForm.kategori}
                    onChange={(e) => setEditForm({ ...editForm, kategori: e.target.value as ProyekKategori })}
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-lg bg-white outline-none focus:border-[#2980B9]"
                  >
                    <option value="jalan">Jalan & Jembatan</option>
                    <option value="taman">Taman & Lanskap</option>
                    <option value="drainase">Drainase & Saluran Air</option>
                    <option value="fasilitas">Fasilitas Publik</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="edit_anggaran" className="block font-semibold text-[#184C78] mb-1">Pagu Anggaran (Rp)</label>
                  <input
                    id="edit_anggaran"
                    type="number"
                    required
                    min={0}
                    value={editForm.anggaran}
                    onChange={(e) => setEditForm({ ...editForm, anggaran: Number(e.target.value) })}
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edit_tanggal_mulai" className="block font-semibold text-[#184C78] mb-1">Tanggal Mulai</label>
                  <input
                    id="edit_tanggal_mulai"
                    type="date"
                    required
                    value={editForm.tanggal_mulai}
                    onChange={(e) => setEditForm({ ...editForm, tanggal_mulai: e.target.value })}
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                  />
                </div>

                <div>
                  <label htmlFor="edit_estimasi_selesai" className="block font-semibold text-[#184C78] mb-1">Estimasi Selesai</label>
                  <input
                    id="edit_estimasi_selesai"
                    type="date"
                    required
                    value={editForm.estimasi_selesai}
                    onChange={(e) => setEditForm({ ...editForm, estimasi_selesai: e.target.value })}
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edit_progres_persen" className="block font-semibold text-[#184C78] mb-1">
                    Progres Fisik (%)
                    <span className="text-[10px] text-slate-500 font-normal ml-1">
                      (Saat ini: {editingProject.progres_persen}%)
                    </span>
                  </label>
                  <input
                    id="edit_progres_persen"
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={editForm.progres_persen}
                    onChange={(e) => setEditForm({ ...editForm, progres_persen: Number(e.target.value) })}
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                  />
                </div>

                <div>
                  <label htmlFor="edit_status" className="block font-semibold text-[#184C78] mb-1">Status Proyek</label>
                  <select
                    id="edit_status"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as ProyekStatus })}
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-lg bg-white outline-none focus:border-[#2980B9]"
                  >
                    <option value="berjalan">Sedang Berjalan</option>
                    <option value="selesai">Selesai (FHO)</option>
                    <option value="ditangguhkan">Ditangguhkan / Tertunda</option>
                  </select>
                </div>
              </div>

              {/* Peringatan & Field Wajib jika Progres Menurun (Aturan PRD 10.1) */}
              {editForm.progres_persen < editingProject.progres_persen && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800 text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Perhatian: Penurunan Progres Fisik Terdeteksi ({editingProject.progres_persen}% ➔ {editForm.progres_persen}%)</span>
                  </div>
                  <p className="text-[10.5px] text-amber-900 leading-snug">
                    Sesuai ketentuan PRD Bagian 10.1, penurunan persentase progres wajib menyertakan keterangan/alasan minimal 10 karakter untuk dicatat ke riwayat audit trail.
                  </p>
                  <div>
                    <label htmlFor="edit_catatan_perubahan" className="block font-semibold text-amber-900 mb-1">
                      Alasan / Keterangan Penurunan Progres <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      id="edit_catatan_perubahan"
                      rows={2}
                      required
                      placeholder="Contoh: Revisi volume lapangan, perbaikan struktur cor beton yang retak..."
                      value={editForm.catatan_perubahan}
                      onChange={(e) => setEditForm({ ...editForm, catatan_perubahan: e.target.value })}
                      className="w-full p-2 bg-white border border-amber-300 rounded-lg outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                </div>
              )}

                </div>

                {/* Sticky Responsive Footer */}
                <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-center"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingEdit}
                    className="w-full sm:w-auto btn-primary !h-9 text-xs flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSubmittingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: TAMBAH TAHAP LINIMASA ── */}
      {isNewStageModalOpen && renderPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-stage-title"
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/65 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsNewStageModalOpen(false)}
        >
          <div className="flex min-h-full items-center justify-center p-2.5 sm:p-4 md:p-6 text-center">
            <div
              className="relative w-full max-w-lg sm:max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col text-left border border-[#DCE0E6] my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header: Dark Blue #184C78 */}
              <div className="bg-[#184C78] text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
                    <Clock className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div>
                    <h3 id="modal-stage-title" className="font-['DM_Sans'] text-base sm:text-lg font-bold leading-tight">
                      Tambah Tahapan Pengerjaan Baru
                    </h3>
                    <p className="text-[11px] sm:text-xs text-white/80 mt-0.5 leading-tight">
                      Catat milestone mingguan dan bobot pengerjaan kurva-S proyek.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewStageModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-3"
                  title="Tutup Modal"
                  aria-label="Tutup Modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleAddTimelineStage} className="flex flex-col flex-1 overflow-hidden min-h-0">
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs scrollbar-thin">
              <div>
                <label className="block font-semibold text-[#184C78] mb-1">Nama Tahapan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pengecoran Abutmen Jembatan"
                  value={newStageForm.nama_tahap}
                  onChange={(e) => setNewStageForm({ ...newStageForm, nama_tahap: e.target.value })}
                  className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#184C78] mb-1">Uraian Teknis</label>
                <textarea
                  rows={3}
                  required
                  value={newStageForm.deskripsi}
                  onChange={(e) => setNewStageForm({ ...newStageForm, deskripsi: e.target.value })}
                  className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#184C78] mb-1">Target Mulai</label>
                  <input
                    type="date"
                    value={newStageForm.target_mulai}
                    onChange={(e) => setNewStageForm({ ...newStageForm, target_mulai: e.target.value })}
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#184C78] mb-1">Target Selesai</label>
                  <input
                    type="date"
                    value={newStageForm.target_selesai}
                    onChange={(e) => setNewStageForm({ ...newStageForm, target_selesai: e.target.value })}
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#184C78] mb-1">Target Capaian Progres Kumulatif (%)</label>
                <p className="text-[10.5px] text-[#6C757D] mb-1">
                  Persentase capaian kemajuan fisik kumulatif proyek hingga tahap ini (0–100%)
                </p>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={newStageForm.persentase_bobot}
                  onChange={(e) => setNewStageForm({ ...newStageForm, persentase_bobot: Number(e.target.value) })}
                  className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none"
                />
              </div>

                </div>

                {/* Sticky Responsive Footer */}
                <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsNewStageModalOpen(false)}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-center"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto btn-primary !h-9 text-xs flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambahkan Tahapan</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: UPLOAD DOKUMENTASI FISIK ── */}
      {isNewDocModalOpen && renderPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-doc-title"
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/65 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsNewDocModalOpen(false)}
        >
          <div className="flex min-h-full items-center justify-center p-2.5 sm:p-4 md:p-6 text-center">
            <div
              className="relative w-full max-w-lg sm:max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col text-left border border-[#DCE0E6] my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header: Dark Blue #184C78 */}
              <div className="bg-[#184C78] text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
                    <Upload className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div>
                    <h3 id="modal-doc-title" className="font-['DM_Sans'] text-base sm:text-lg font-bold leading-tight">
                      Upload Bukti Dokumentasi Fisik
                    </h3>
                    <p className="text-[11px] sm:text-xs text-white/80 mt-0.5 leading-tight">
                      Unggah dokumentasi foto lapangan atau video drone untuk transparansi progres proyek.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewDocModalOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-3"
                  title="Tutup Modal"
                  aria-label="Tutup Modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleAddDocumentation} className="flex flex-col flex-1 overflow-hidden min-h-0">
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs scrollbar-thin">
                  <div>
                    <label className="block font-semibold text-[#184C78] mb-1">Proyek Terkait</label>
                    <select
                      value={newDocForm.proyek_id}
                      onChange={(e) => setNewDocForm({ ...newDocForm, proyek_id: Number(e.target.value) })}
                      disabled={currentUser.role === 'penanggung_jawab' && !!unlockedProject}
                      className="w-full p-2.5 border border-[#DCE0E6] rounded-xl bg-white outline-none focus:border-[#2980B9] disabled:bg-slate-100 font-medium text-xs"
                    >
                      {(currentUser.role === 'penanggung_jawab' && unlockedProject
                        ? [unlockedProject]
                        : projectList
                      ).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.kode_proyek ? `[${p.kode_proyek}] ` : ''}{p.nama_proyek}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#184C78] mb-1">Judul Dokumentasi</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Uji Kuat Tekan Beton Silinder Sta 2+400"
                      value={newDocForm.judul}
                      onChange={(e) => setNewDocForm({ ...newDocForm, judul: e.target.value })}
                      className="w-full p-2.5 border border-[#DCE0E6] rounded-xl outline-none focus:border-[#2980B9] text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#184C78] mb-1">URL Foto Bukti / Berkas File</label>
                    <input
                      type="text"
                      required
                      placeholder="https://... atau path berkas foto"
                      value={newDocForm.foto_url}
                      onChange={(e) => setNewDocForm({ ...newDocForm, foto_url: e.target.value })}
                      className="w-full p-2.5 border border-[#DCE0E6] rounded-xl outline-none focus:border-[#2980B9] text-xs"
                    />
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400">Contoh Cepat:</span>
                      <button
                        type="button"
                        onClick={() => setNewDocForm({ ...newDocForm, foto_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18fe111?w=800' })}
                        className="text-[10px] text-[#2980B9] hover:underline cursor-pointer"
                      >
                        [Foto Aspal]
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewDocForm({ ...newDocForm, foto_url: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=800' })}
                        className="text-[10px] text-[#2980B9] hover:underline cursor-pointer"
                      >
                        [Foto Beton]
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewDocForm({ ...newDocForm, foto_url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800' })}
                        className="text-[10px] text-[#2980B9] hover:underline cursor-pointer"
                      >
                        [Foto Drainase]
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#184C78] mb-1">Catatan Teknis Pengawas</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Keterangan kondisi visual dan hasil uji laboratorium..."
                      value={newDocForm.deskripsi}
                      onChange={(e) => setNewDocForm({ ...newDocForm, deskripsi: e.target.value })}
                      className="w-full p-2.5 border border-[#DCE0E6] rounded-xl outline-none focus:border-[#2980B9] text-xs leading-relaxed resize-y min-h-[70px]"
                    />
                  </div>
                </div>

                {/* Sticky Responsive Footer */}
                <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsNewDocModalOpen(false)}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-center"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto btn-primary !h-9 text-xs flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Unggah Sekarang</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: VERIFIKASI TINDAKAN CACAT FHO ── */}
      {selectedEvalToVerify &&
        renderPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-verify-title"
            className="fixed inset-0 z-[9999] overflow-y-auto bg-black/65 backdrop-blur-xs animate-fade-in"
            onClick={() => setSelectedEvalToVerify(null)}
          >
            <div className="flex min-h-full items-center justify-center p-2.5 sm:p-4 md:p-6 text-center">
              <div
                className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col text-left border border-[#DCE0E6] my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header: Dark Blue #184C78 */}
                <div className="bg-[#184C78] text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
                      <Wrench className="w-4 h-4 text-amber-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold text-white bg-white/15 px-2 py-0.5 rounded border border-white/20">
                          #FHO-{selectedEvalToVerify.id}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                          Tinjauan Mutu
                        </span>
                      </div>
                      <h3 id="modal-verify-title" className="font-['DM_Sans'] text-base sm:text-lg font-bold leading-tight text-white mt-0.5">
                        Verifikasi Tindakan Perbaikan FHO
                      </h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedEvalToVerify(null)}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-3"
                    title="Tutup Modal"
                    aria-label="Tutup Modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Scrollable Form Body */}
                <form onSubmit={handleVerifyDefect} className="flex flex-col flex-1 overflow-hidden min-h-0">
                  <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs scrollbar-thin">
                    <div className="p-3.5 bg-[#F5F7FA] rounded-xl border border-[#DCE0E6]/60">
                      <div className="font-bold text-[#184C78] text-sm">{selectedEvalToVerify.nama_proyek}</div>
                      <div className="text-[11px] text-[#6C757D] mt-0.5">{selectedEvalToVerify.lokasi_titik}</div>
                      <p className="text-[#495057] mt-1.5 italic bg-white p-2.5 rounded-lg border border-[#DCE0E6]">"{selectedEvalToVerify.deskripsi}"</p>
                    </div>

                    {/* Riwayat Jejak Audit Status (Audit Trail) */}
                    <div className="p-3.5 bg-[#f8fafc] rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-[#184C78]">
                        <Clock className="w-3.5 h-3.5 text-[#2980B9]" />
                        <span>Riwayat Jejak Audit Status (Linimasa Log)</span>
                      </div>
                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                        {evalStatusLogs.length > 0 ? (
                          evalStatusLogs.map((log: any, idx: number) => (
                            <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-0.5">
                              <div className="flex items-center justify-between font-semibold text-[#184C78]">
                                <span>
                                  {log.status_sebelumnya ? `${log.status_sebelumnya} ➔ ` : ''}
                                  <span className="text-emerald-700 font-bold">{log.status_baru}</span>
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {log.created_at ? new Date(log.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }) : log.waktu || ''}
                                </span>
                              </div>
                              <p className="text-slate-600 text-[10.5px]">
                                <strong className="text-slate-700">{log.nama_pengubah || log.diubah_oleh}:</strong> {log.catatan || '-'}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">Belum ada riwayat perubahan status</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="verify-status-select" className="block font-semibold text-[#184C78] mb-1">Keputusan Status Verifikasi</label>
                      <select
                        id="verify-status-select"
                        value={verifyStatus}
                        onChange={(e) => setVerifyStatus(e.target.value as EvaluasiStatusType)}
                        className="w-full p-2.5 border border-[#DCE0E6] rounded-xl bg-white outline-none focus:border-[#2980B9] text-xs"
                      >
                        <option value="terverifikasi_perlu_tindak_lanjut">
                          Terverifikasi - Perlu Tindak Lanjut (Proyek beralih ke masa peninjauan ulang)
                        </option>
                        <option value="selesai_ditindaklanjuti">
                          Selesai Ditindaklanjuti (Perbaikan tuntas)
                        </option>
                        <option value="ditolak_tidak_terbukti">
                          Ditolak - Tidak Terbukti (Laporan tidak valid)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#184C78] mb-1">Catatan Tindakan Tim Lapangan</label>
                      <textarea
                        rows={3}
                        required
                        value={tindakanDinasText}
                        onChange={(e) => setTindakanDinasText(e.target.value)}
                        className="w-full p-2.5 border border-[#DCE0E6] rounded-xl outline-none focus:border-[#2980B9] text-xs resize-y min-h-[70px]"
                      />
                    </div>
                  </div>

                  {/* Sticky Responsive Footer */}
                  <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedEvalToVerify(null)}
                      className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-center"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto btn-primary !h-9 text-xs flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Konfirmasi Penanganan</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      {/* ── KONTEN UTAMA DASHBOARD ── */}
      <div className="space-y-6">
      {/* ── BANNER LEMBAR KERJA PROYEK AKTIF (KHUSUS PENANGGUNG JAWAB TERVERIFIKASI) ── */}
      {currentUser.role === 'penanggung_jawab' && unlockedProject && (
        <div className="bg-gradient-to-r from-[#0f3252] via-[#184C78] to-[#1F5F94] rounded-2xl p-6 text-white shadow-lg border border-[#184C78] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Lembar Kerja Terverifikasi</span>
              </span>
              <span className="font-mono text-xs font-bold bg-white/15 px-2.5 py-0.5 rounded-lg border border-white/20 text-white">
                {unlockedProject.kode_proyek}
              </span>
              <span className="text-[11px] font-bold uppercase bg-white/10 px-2.5 py-0.5 rounded text-white/90">
                {unlockedProject.kategori}
              </span>
            </div>
            <h2 className="font-['DM_Sans'] text-xl font-bold text-white">
              {unlockedProject.nama_proyek}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/80">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-300" />
                {unlockedProject.nama_wilayah} {unlockedProject.nama_desa ? `• ${unlockedProject.nama_desa}` : ''}
              </span>
              <span>•</span>
              <span>Pagu: <strong>Rp {unlockedProject.anggaran.toLocaleString('id-ID')}</strong></span>
              <span>•</span>
              <span>Progres Fisik: <strong className="text-amber-300">{unlockedProject.progres_persen}%</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleLockProject}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/25 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Kunci kembali lembar kerja untuk beralih ke proyek lain"
            >
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span>Kunci / Ganti Proyek</span>
            </button>
          </div>
        </div>
      )}

      {/* ── TOP PENANGGUNG JAWAB PROYEK BANNER ── */}
      <div className="bg-gradient-to-r from-[#0f3252] via-[#184C78] to-[#1a6fa8] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-200 border border-amber-400/30 rounded-full text-xs font-semibold tracking-wide mb-3">
              <Building2 className="w-4 h-4 text-amber-300" />
              <span>
                {currentUser.role === 'pimpinan_instansi' || currentUser.role === 'aparatur_pemerintah'
                  ? 'Portal Pimpinan & Pengelola Pembangunan Daerah'
                  : 'Portal Penanggung Jawab Proyek (Dinas Pelaksana & Rekanan)'}
              </span>
            </div>
            <h1 className="font-['DM_Sans'] text-2xl sm:text-3xl font-extrabold tracking-tight">
              {currentUser.nama}
            </h1>
            <p className="text-white/80 text-xs sm:text-sm mt-1">
              {currentUser.role === 'pimpinan_instansi' || currentUser.role === 'aparatur_pemerintah'
                ? `Pimpinan Daerah & Pengambil Kebijakan : ${currentUser.nama_dinas || 'Pemerintah Kabupaten Lamongan'}`
                : `Pejabat Pembuat Komitmen (PPK) & Tim Pelaksana Teknis : ${currentUser.nama_dinas || 'Dinas Pekerjaan Umum & Tim Pelaksana'}`}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-white/70 mt-3 font-mono">
              <span>{currentUser.nip ? `NIP: ${currentUser.nip}` : 'Hak Akses: Penuh'}</span>
              <span>•</span>
              <span>Hak Akses: Pengawasan, Update Linimasa &amp; Tanggapi Aduan</span>
            </div>
          </div>

          <div className="flex flex-row md:flex-col gap-2 shrink-0">
            {(currentUser.role === 'pimpinan_instansi' || currentUser.role === 'aparatur_pemerintah') && (
              <button
                onClick={() => onSelectSection?.('kinerja_dinas')}
                className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs rounded-xl backdrop-blur-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Monitoring Eksekutif</span>
              </button>
            )}
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="px-4 py-2.5 bg-white text-[#184C78] font-bold text-xs rounded-xl shadow-xs hover:bg-slate-100 flex items-center justify-center gap-2 transition-transform hover:scale-102 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#184C78]" />
              <span>Input Proyek Baru</span>
            </button>
            <button
              onClick={() => setIsNewDocModalOpen(true)}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs rounded-xl backdrop-blur-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Foto &amp; Video</span>
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none -mr-16 -mb-16" />
      </div>

      {/* ── SPATIAL MINIMAP OVERVIEW WIDGET (GIS PREVIEW) ── */}
      {onOpenMapExplorer && (
        <MiniMapOverview
          projects={projects}
          onOpenMapExplorer={onOpenMapExplorer}
        />
      )}

      {/* ── METRICS OVERVIEW ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-[#DCE0E6] shadow-xs">
          <div className="text-xs text-[#6C757D] font-medium flex items-center justify-between">
            <span>Total Proyek</span>
            <FolderKanban className="w-4 h-4 text-[#184C78]" />
          </div>
          <div className="text-2xl font-['DM_Sans'] font-extrabold text-[#184C78] mt-1.5">
            {projectList.length}
          </div>
          <div className="text-[11px] text-[#1A9E6E] font-semibold mt-1">
            {berjalanCount} Sedang Berjalan
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#DCE0E6] shadow-xs">
          <div className="text-xs text-[#6C757D] font-medium flex items-center justify-between">
            <span>Pagu Anggaran</span>
            <DollarSign className="w-4 h-4 text-[#2980B9]" />
          </div>
          <div className="text-2xl font-['DM_Sans'] font-extrabold text-[#212529] mt-1.5">
            Rp {(totalAnggaran / 1000000000).toFixed(1)}M
          </div>
          <div className="text-[11px] text-[#2980B9] font-semibold mt-1">
            Serapan Fisik: 68.4%
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#DCE0E6] shadow-xs">
          <div className="text-xs text-[#6C757D] font-medium flex items-center justify-between">
            <span>Selesai (FHO)</span>
            <CheckCircle2 className="w-4 h-4 text-[#1A9E6E]" />
          </div>
          <div className="text-2xl font-['DM_Sans'] font-extrabold text-[#1A9E6E] mt-1.5">
            {selesaiCount}
          </div>
          <div className="text-[11px] text-[#6C757D] mt-1">
            {tertundaCount} Ditangguhkan
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#DCE0E6] shadow-xs">
          <div className="text-xs text-[#6C757D] font-medium flex items-center justify-between">
            <span>Aduan Warga</span>
            <MessageSquare className="w-4 h-4 text-[#E67E22]" />
          </div>
          <div className="text-2xl font-['DM_Sans'] font-extrabold text-[#212529] mt-1.5">
            {aduanList.length}
          </div>
          <div className="text-[11px] text-[#E67E22] font-bold mt-1">
            {aduanMenungguCount} Perlu Ditanggapi!
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#DCE0E6] shadow-xs">
          <div className="text-xs text-[#6C757D] font-medium flex items-center justify-between">
            <span>Evaluasi Cacat AI</span>
            <Wrench className="w-4 h-4 text-[#E74C3C]" />
          </div>
          <div className="text-2xl font-['DM_Sans'] font-extrabold text-[#E74C3C] mt-1.5">
            {evaluasiList.length}
          </div>
          <div className="text-[11px] text-[#E74C3C] font-semibold mt-1">
            Masa Pemeliharaan
          </div>
        </div>
      </div>

      {/* ── ACTIVE SECTION VIEW (DRIVEN BY SIDEBAR) ── */}
      {/* ── SECTION 1: DAFTAR PROYEK DINAS ── */}
      {(activeTab === 'proyek' || activeTab === 'overview') && (
        <div className="space-y-4">
          {currentUser.role === 'penanggung_jawab' && unlockedProject ? (
            <div className="bg-white rounded-2xl border border-[#DCE0E6] p-6 shadow-xs space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE0E6]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-[#EBF4FB] text-[#184C78] px-2.5 py-0.5 rounded border border-[#c5def2]">
                      {unlockedProject.kode_proyek}
                    </span>
                    <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Status: {unlockedProject.status}
                    </span>
                  </div>
                  <h3 className="font-['DM_Sans'] text-lg font-bold text-[#184C78] mt-1.5">
                    {unlockedProject.nama_proyek}
                  </h3>
                  <p className="text-xs text-[#6C757D] mt-0.5">
                    {unlockedProject.deskripsi || 'Lingkup pengerjaan konstruksi infrastruktur publik Kabupaten Lamongan.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenEditModal(unlockedProject)}
                    className="px-3.5 py-2 bg-[#EBF4FB] hover:bg-[#d8eaf7] text-[#184C78] font-bold text-xs rounded-xl border border-[#c5def2] transition-colors cursor-pointer"
                  >
                    Sunting Data Proyek
                  </button>
                  <button
                    onClick={() => onOpenProjectDetail(unlockedProject)}
                    className="px-3.5 py-2 bg-[#184C78] hover:bg-[#0f3252] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Buka Detail Lengkap
                  </button>
                </div>
              </div>

              {/* Toolbar Aksi Mandor / Rekanan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <button
                  onClick={() => {
                    setSelectedProjectForTimeline(unlockedProject.id);
                    onSelectSection?.('linimasa');
                  }}
                  className="p-4 rounded-xl border border-[#DCE0E6] hover:border-[#184C78] hover:bg-[#F5F7FA] transition-all text-left group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#EBF4FB] text-[#184C78] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs text-[#212529]">Perbarui Linimasa Proyek</div>
                  <div className="text-[11px] text-[#6C757D] mt-0.5">Catat progres mingguan dan bobot tahapan fisik</div>
                </button>

                <button
                  onClick={() => {
                    setNewDocForm((prev) => ({ ...prev, proyek_id: unlockedProject.id }));
                    onSelectSection?.('dokumentasi');
                    setIsNewDocModalOpen(true);
                  }}
                  className="p-4 rounded-xl border border-[#DCE0E6] hover:border-[#184C78] hover:bg-[#F5F7FA] transition-all text-left group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs text-[#212529]">Unggah Bukti Dokumentasi</div>
                  <div className="text-[11px] text-[#6C757D] mt-0.5">Upload arsip foto dan drone video pengerjaan</div>
                </button>

                <button
                  onClick={() => onSelectSection?.('aduan')}
                  className="p-4 rounded-xl border border-[#DCE0E6] hover:border-[#184C78] hover:bg-[#F5F7FA] transition-all text-left group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs text-[#212529]">Tanggapi Aduan Warga</div>
                  <div className="text-[11px] text-[#6C757D] mt-0.5">Respon keluhan masyarakat terkait proyek ini</div>
                </button>
              </div>

              {/* Detail Kemajuan Fisik & Spesifikasi */}
              <div className="p-4 bg-[#F5F7FA] rounded-xl border border-[#DCE0E6]/80 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-[#184C78]">
                  <span>Kemajuan Fisik Proyek</span>
                  <span>{unlockedProject.progres_persen}% Rampung</span>
                </div>
                <div className="w-full bg-[#DCE0E6] h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#184C78] to-[#2980B9] h-full rounded-full transition-all"
                    style={{ width: `${unlockedProject.progres_persen}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-[#6C757D]">
                  <div>Pagu: <strong className="text-[#212529]">Rp {unlockedProject.anggaran.toLocaleString('id-ID')}</strong></div>
                  <div>Mulai: <strong className="text-[#212529]">{unlockedProject.tanggal_mulai || '-'}</strong></div>
                  <div>Target Selesai: <strong className="text-[#212529]">{unlockedProject.estimasi_selesai || '-'}</strong></div>
                  <div>Dinas: <strong className="text-[#212529]">{unlockedProject.nama_dinas || '-'}</strong></div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#DCE0E6]">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Cari nama proyek, wilayah, kode seri, atau kategori..."
                    value={searchProj}
                    onChange={(e) => setSearchProj(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="text-xs px-3 py-2 border border-[#DCE0E6] rounded-lg bg-white outline-none focus:border-[#2980B9]"
                  >
                    <option value="semua">Semua Status</option>
                    <option value="berjalan">Sedang Berjalan</option>
                    <option value="selesai">Selesai</option>
                    <option value="ditangguhkan">Ditangguhkan</option>
                  </select>

                  <button
                    onClick={handleOpenNewProjectModal}
                    className="btn-primary !h-9 text-xs flex items-center gap-1.5 shrink-0 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Input Proyek Baru</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#DCE0E6] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F5F7FA] text-[#184C78] font-['DM_Sans'] font-bold border-b border-[#DCE0E6]">
                      <tr>
                        <th className="p-3.5">Kode Proyek</th>
                        <th className="p-3.5">Nama Proyek</th>
                        <th className="p-3.5">Kategori</th>
                        <th className="p-3.5">Anggaran (Pagu)</th>
                        <th className="p-3.5">Progres Fisik</th>
                        <th className="p-3.5">Status</th>
                        {currentUser.role !== 'penanggung_jawab' && (
                          <th className="p-3.5">Kunci Akses (PJ)</th>
                        )}
                        <th className="p-3.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DCE0E6]">
                      {filteredProjects.map((p) => {
                        const getBadge = (st: string) => {
                          if (st === 'selesai') return 'bg-[#E6F7F1] text-[#1A9E6E] border-[#B7EBD8]';
                          if (st === 'berjalan') return 'bg-[#FEF3E7] text-[#E67E22] border-[#FBD8B3]';
                          return 'bg-[#FDEDEC] text-[#E74C3C] border-[#FADBD8]';
                        };

                        return (
                          <tr key={p.id} className="hover:bg-[#F5F7FA]/70 transition-colors">
                            <td className="p-3.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs font-bold text-[#184C78] bg-[#EBF4FB] px-2 py-0.5 rounded border border-[#c5def2]">
                                  {p.kode_proyek || 'LMG-001'}
                                </span>
                                {p.kode_proyek && (
                                  <button
                                    onClick={() => handleCopyText(p.kode_proyek!, `Kode ${p.kode_proyek}`)}
                                    className="text-[#6C757D] hover:text-[#184C78] cursor-pointer p-0.5"
                                    title="Salin Kode Proyek"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="p-3.5">
                              <div className="font-bold text-[#212529]">{p.nama_proyek}</div>
                              <div className="text-[11px] text-[#6C757D] flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-[#2980B9]" />
                                <span>{p.nama_wilayah} {p.nama_desa ? `• ${p.nama_desa}` : ''}</span>
                              </div>
                            </td>
                            <td className="p-3.5">
                              <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-[#EBF4FB] text-[#184C78]">
                                {p.kategori}
                              </span>
                            </td>
                            <td className="p-3.5 font-mono font-semibold text-[#212529]">
                              Rp {(p.anggaran).toLocaleString('id-ID')}
                            </td>
                            <td className="p-3.5 w-36">
                              <div className="flex justify-between text-[11px] font-bold text-[#184C78] mb-1">
                                <span>{p.progres_persen}%</span>
                              </div>
                              <div className="w-full bg-[#DCE0E6] h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-[#184C78] h-full rounded-full"
                                  style={{ width: `${p.progres_persen}%` }}
                                />
                              </div>
                            </td>
                            <td className="p-3.5">
                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${getBadge(p.status)}`}>
                                {p.status}
                              </span>
                            </td>
                            {currentUser.role !== 'penanggung_jawab' && (
                              <td className="p-3.5">
                                {p.kode_akses ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                      {p.kode_akses}
                                    </span>
                                    <button
                                      onClick={() => handleCopyText(p.kode_akses!, `Password ${p.kode_akses}`)}
                                      className="text-amber-700 hover:text-amber-900 cursor-pointer p-0.5"
                                      title="Salin Kunci Akses Khusus Penanggung Jawab"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-[#6C757D]">-</span>
                                )}
                              </td>
                            )}
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditModal(p)}
                                  className="px-2.5 py-1.5 bg-[#EBF4FB] hover:bg-[#d8eaf7] text-[#184C78] font-semibold rounded-lg border border-[#c5def2] transition-colors cursor-pointer"
                                  title="Sunting Data Proyek"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => onOpenProjectDetail(p)}
                                  className="px-2.5 py-1.5 bg-[#F5F7FA] hover:bg-[#EBF4FB] text-[#184C78] font-semibold rounded-lg border border-[#DCE0E6] transition-colors cursor-pointer"
                                  title="Lihat Detail Proyek"
                                >
                                  Detail
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedProjectForTimeline(p.id);
                                    if (onSelectSection) onSelectSection('linimasa');
                                  }}
                                  className="px-2.5 py-1.5 bg-[#184C78] hover:bg-[#0f3252] text-white font-semibold rounded-lg transition-colors cursor-pointer"
                                  title="Kelola Linimasa"
                                >
                                  Linimasa
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB CONTENT 2: LINIMASA & TAHAPAN ── */}
      {activeTab === 'linimasa' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#DCE0E6]">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-[#184C78]">
                {currentUser.role === 'penanggung_jawab' && unlockedProject ? 'Proyek Dikelola:' : 'Pilih Proyek:'}
              </label>
              {currentUser.role === 'penanggung_jawab' && unlockedProject ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#EBF4FB] rounded-lg border border-[#BDD7EE]">
                  <span className="font-mono font-bold text-xs text-[#184C78] bg-white px-2 py-0.5 rounded shadow-2xs">
                    {unlockedProject.kode_proyek || 'KODE-PJ'}
                  </span>
                  <span className="text-xs font-semibold text-[#184C78]">
                    {unlockedProject.nama_proyek}
                  </span>
                  <span className="text-[10.5px] text-[#2980B9] font-medium">
                    (Progres: {unlockedProject.progres_persen}%)
                  </span>
                </div>
              ) : (
                <select
                  value={selectedProjectForTimeline}
                  onChange={(e) => setSelectedProjectForTimeline(Number(e.target.value))}
                  className="text-xs p-2 border border-[#DCE0E6] rounded-lg bg-white outline-none focus:border-[#2980B9] font-medium"
                >
                  {projectList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.kode_proyek ? `[${p.kode_proyek}] ` : ''}{p.nama_proyek} (Progres: {p.progres_persen}%)
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              onClick={() => setIsNewStageModalOpen(true)}
              className="btn-primary !h-9 text-xs flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tahapan Linimasa</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE0E6] p-6 shadow-xs space-y-6">
            <h3 className="font-['DM_Sans'] font-bold text-base text-[#184C78]">
              Runtutan Tahapan Pengerjaan Konstruksi Fisik
            </h3>

            <div className="relative border-l-2 border-[#DCE0E6] ml-4 pl-6 space-y-6">
              {timelineStages.map((stage, idx) => (
                <div key={stage.id} className="relative group">
                  {/* Step indicator node */}
                  <div
                    className={`absolute -left-[35px] top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs ${
                      stage.status === 'selesai'
                        ? 'bg-[#1A9E6E]'
                        : stage.status === 'sedang_berjalan'
                        ? 'bg-[#184C78] ring-4 ring-[#EBF4FB]'
                        : 'bg-[#6C757D]'
                    }`}
                  >
                    {stage.status === 'selesai' ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </div>

                  <div className="bg-[#F5F7FA] p-4 rounded-xl border border-[#DCE0E6]/70 space-y-2 hover:border-[#2980B9] transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#212529]">
                          Tahap {stage.nomor_tahap}: {stage.nama_tahap}
                        </span>
                        <span className="text-[10px] font-bold bg-[#EBF4FB] text-[#184C78] px-2 py-0.5 rounded">
                          Bobot: {stage.persentase_bobot}%
                        </span>
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                        stage.status === 'selesai'
                          ? 'bg-[#E6F7F1] text-[#1A9E6E]'
                          : stage.status === 'sedang_berjalan'
                          ? 'bg-[#FEF3E7] text-[#E67E22]'
                          : 'bg-white text-[#6C757D] border border-[#DCE0E6]'
                      }`}>
                        {stage.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-[#495057]">{stage.deskripsi}</p>

                    <div className="flex flex-wrap gap-4 text-[11px] text-[#6C757D] pt-1 border-t border-[#DCE0E6]/50">
                      <span>Rencana: <strong className="text-[#212529]">{stage.target_mulai} s/d {stage.target_selesai}</strong></span>
                      {stage.realisasi_selesai && (
                        <span>Realisasi Selesai: <strong className="text-[#1A9E6E]">{stage.realisasi_selesai}</strong></span>
                      )}
                    </div>

                    {stage.catatan_lapangan && (
                      <div className="text-[11px] text-[#184C78] bg-white p-2 rounded-lg border border-[#DCE0E6]/60 italic">
                        Catatan Pengawas: "{stage.catatan_lapangan}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT 3: DOKUMENTASI LAPANGAN ── */}
      {activeTab === 'dokumentasi' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#DCE0E6]">
            <div>
              <h2 className="text-base font-bold font-['DM_Sans'] text-[#184C78]">
                Galeri Foto &amp; Video Dokumentasi Proyek
              </h2>
              <p className="text-xs text-[#6C757D]">
                Arsip visual kemajuan fisik per tahapan linimasa sebagai bukti pertanggungjawaban publik.
              </p>
            </div>

            <button
              onClick={() => setIsNewDocModalOpen(true)}
              className="btn-primary !h-9 text-xs flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Unggah Dokumentasi Baru</span>
            </button>
          </div>

          {(() => {
            const filteredDocs =
              currentUser.role === 'penanggung_jawab' && unlockedProject
                ? dokumentasiList.filter(
                    (doc) =>
                      doc.proyek_id === unlockedProject.id ||
                      doc.nama_proyek.toLowerCase() === unlockedProject.nama_proyek.toLowerCase()
                  )
                : dokumentasiList;

            if (filteredDocs.length === 0) {
              return (
                <div className="bg-white rounded-2xl border border-dashed border-[#BDD7EE] p-8 text-center space-y-2">
                  <Upload className="w-8 h-8 text-[#2980B9] mx-auto opacity-60" />
                  <h4 className="font-bold text-sm text-[#184C78]">Belum Ada Dokumentasi Lapangan</h4>
                  <p className="text-xs text-[#6C757D] max-w-md mx-auto">
                    {currentUser.role === 'penanggung_jawab' && unlockedProject
                      ? `Belum ada bukti dokumentasi fisik untuk proyek ${unlockedProject.nama_proyek}. Silakan klik tombol "Unggah Dokumentasi Baru" di atas.`
                      : 'Belum ada arsip dokumentasi fisik yang diunggah untuk proyek ini.'}
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-2xl border border-[#DCE0E6] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-44 bg-slate-100 overflow-hidden">
                        <img
                          src={doc.foto_url}
                          alt={doc.judul}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-black/70 text-white px-2 py-0.5 rounded backdrop-blur-xs">
                          {doc.nama_tahap || 'Inspeksi Fisik'}
                        </span>
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="text-[10px] text-[#6C757D] font-mono flex items-center justify-between">
                          <span>{doc.tanggal_unggah}</span>
                          <span className="text-[#184C78] font-bold">{doc.nama_proyek}</span>
                        </div>
                        <h4 className="font-['DM_Sans'] font-bold text-sm text-[#212529] leading-snug">
                          {doc.judul}
                        </h4>
                        <p className="text-xs text-[#495057] leading-relaxed">
                          {doc.deskripsi}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-[#F5F7FA] border-t border-[#DCE0E6] text-[10px] text-[#6C757D]">
                      Diunggah oleh: <strong className="text-[#184C78]">{doc.diunggah_oleh}</strong>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* ── TAB CONTENT 4: RESPON ADUAN WARGA ── */}
      {activeTab === 'aduan' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#DCE0E6]">
            <div>
              <h2 className="text-base font-bold font-['DM_Sans'] text-[#184C78]">
                Layanan &amp; Kanal Tanggapan Pengaduan Masyarakat
              </h2>
              <p className="text-xs text-[#6C757D]">
                Tanggapi masukan warga secara resmi untuk meningkatkan transparansi dan indeks kepuasan publik dinas.
              </p>
            </div>
          </div>

          {(() => {
            const filteredAduan =
              currentUser.role === 'penanggung_jawab' && unlockedProject
                ? aduanList.filter(
                    (item) =>
                      item.proyek_id === unlockedProject.id ||
                      item.nama_proyek.toLowerCase() === unlockedProject.nama_proyek.toLowerCase()
                  )
                : aduanList;

            if (filteredAduan.length === 0) {
              return (
                <div className="bg-white rounded-2xl border border-dashed border-[#BDD7EE] p-8 text-center space-y-2">
                  <MessageSquare className="w-8 h-8 text-[#2980B9] mx-auto opacity-60" />
                  <h4 className="font-bold text-sm text-[#184C78]">Tidak Ada Aduan Warga</h4>
                  <p className="text-xs text-[#6C757D] max-w-md mx-auto">
                    {currentUser.role === 'penanggung_jawab' && unlockedProject
                      ? `Belum ada laporan atau pengaduan masyarakat untuk proyek ${unlockedProject.nama_proyek}.`
                      : 'Belum ada aduan warga yang masuk untuk kategori ini.'}
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {filteredAduan.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-[#DCE0E6] p-5 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-[#184C78] bg-[#EBF4FB] px-2.5 py-0.5 rounded-lg mr-2">
                          {item.nama_proyek}
                        </span>
                        <span className="text-xs text-[#6C757D]">Pelapor: <strong>{item.nama_pelapor}</strong> ({item.email_pelapor})</span>
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                        item.status === 'selesai'
                          ? 'bg-[#E6F7F1] text-[#1A9E6E]'
                          : item.status === 'diproses'
                          ? 'bg-[#FEF3E7] text-[#E67E22]'
                          : 'bg-[#FDEDEC] text-[#E74C3C]'
                      }`}>
                        Status: {item.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-['DM_Sans'] font-bold text-sm text-[#212529]">{item.judul}</h4>
                      <p className="text-xs text-[#495057] mt-1 bg-[#F5F7FA] p-3 rounded-xl border border-[#DCE0E6]/50">
                        "{item.isi_laporan}"
                      </p>
                    </div>

                    {item.tanggapan_dinas && (
                      <div className="p-3 bg-[#EBF4FB] rounded-xl border border-[#c5def2] text-xs space-y-1">
                        <div className="font-bold text-[#184C78] flex items-center justify-between">
                          <span>Tanggapan Resmi Dinas ({item.petugas_penjawab}):</span>
                          <span className="text-[10px] text-[#6C757D] font-mono">{item.tanggal_tanggapan}</span>
                        </div>
                        <p className="text-[#212529] leading-relaxed line-clamp-3">{item.tanggapan_dinas}</p>
                      </div>
                    )}

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedAduanToReply(item);
                        }}
                        className={`${
                          item.tanggapan_dinas
                            ? 'btn-ghost border border-[#c5def2] text-[#184C78] hover:bg-[#EBF4FB]'
                            : 'btn-primary'
                        } !h-8 text-xs flex items-center gap-1.5 shadow-xs`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{item.tanggapan_dinas ? 'Buka Halaman Detail & Riwayat Respon' : 'Buka Halaman Respon Tanggapan'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* ── TAB CONTENT 5: VERIFIKASI CACAT PASCA PROYEK ── */}
      {activeTab === 'evaluasi' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#DCE0E6]">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#2980B9]" />
                <h2 className="text-base font-bold font-['DM_Sans'] text-[#184C78]">
                  Tinjauan Cacat Fisik &amp; Masa Pemeliharaan (FHO)
                </h2>
              </div>
              <p className="text-xs text-[#6C757D]">
                Laporan kerusakan fisik dari warga dengan penilaian prioritas AI. Verifikasi dan instruksikan rekanan pelaksana untuk perbaikan.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {evaluasiList.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-[#DCE0E6] p-5 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#184C78] bg-[#EBF4FB] px-2.5 py-0.5 rounded-lg">
                      {item.nama_proyek}
                    </span>
                    <span className="text-xs text-[#6C757D] font-mono">{item.tanggal_lapor}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      item.skor_urgensi_ai >= 4
                        ? 'bg-[#FDEDEC] text-[#E74C3C] border border-[#FADBD8]'
                        : 'bg-[#FEF3E7] text-[#E67E22] border border-[#FBD8B3]'
                    }`}>
                      ⚡ AI Urgensi: Skor {item.skor_urgensi_ai} / 5
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EBF4FB] text-[#184C78]">
                      {item.status_verifikasi.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-[#212529]">
                  <strong>Lokasi Titik:</strong> {item.lokasi_titik} | <strong>Kategori:</strong> {item.kategori_cacat}
                  <p className="text-xs text-[#495057] mt-1 bg-[#F5F7FA] p-3 rounded-xl border border-[#DCE0E6]/50">
                    "{item.deskripsi}"
                  </p>
                </div>

                <div className="p-3 bg-[#f4f9fd] rounded-xl border-l-3 border-[#2980B9] text-xs">
                  <div className="font-bold text-[#184C78]">Rekomendasi Analisis AI:</div>
                  <p className="text-[#495057] text-[11px] mt-0.5">{item.analisis_ai.split('\n\n[RAW_AI_DEBUG]:')[0]}</p>
                </div>

                {item.status_verifikasi !== 'menunggu_verifikasi' && item.catatan_dinas ? (
                  <div className="p-3 bg-[#E6F7F1] rounded-xl border border-[#B7EBD8] text-xs">
                    <div className="font-bold text-[#1A9E6E]">Tindakan Verifikasi Dinas:</div>
                    <p className="text-[#0E6243] text-[11px] mt-0.5">{item.catatan_dinas}</p>
                  </div>
                ) : (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedEvalToVerify(item);
                        setTindakanDinasText('Tim Reaksi Cepat PUPR telah menginstruksikan pihak rekanan kontraktor untuk perbaikan masa garansi FHO.');
                      }}
                      className="btn-primary !h-8 text-xs flex items-center gap-1.5"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Verifikasi &amp; Jadwalkan Tim Lapangan</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

