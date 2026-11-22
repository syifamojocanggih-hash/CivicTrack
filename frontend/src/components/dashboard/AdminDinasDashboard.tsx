import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Send,
  AlertCircle,
  Calendar,
  User,
  Film,
  Camera,
  Image as ImageIcon,
  Trash2,
  Globe,
  FileText,
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
  MOCK_DOKUMENTASI_PROYEK,
} from '../../data/dashboardMockData';
import { apiService } from '../../services/api';
import { MiniMapOverview } from './MiniMapOverview';
import { LocationPickerMap } from '../LocationPickerMap';
import { WILAYAH_DATA } from '../../data/geoWilayahData';
import {
  findWilayahByCoordinates,
  findCoordinatesByDesa,
} from '../../utils/spatial';
import {
  getProjectTimelineStages,
  saveProjectTimelineStages,
  broadcastProjectUpdate,
  broadcastProjectDeletion,
} from '../../utils/projectConsistency';
import { getProjectTechnicalDetails } from '../../utils/projectTechnicalData';

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

export const TEMPLATE_TANGGAPAN = [
  {
    label: '⚡ Instruksi Lapangan Segera',
    text: 'Terima kasih atas laporan dan masukan yang disampaikan. Tim pengawas lapangan dinas teknis telah diinstruksikan untuk melakukan inspeksi langsung bersama kontraktor pelaksana guna penanganan perbaikan dalam waktu 1x24 jam.',
  },
  {
    label: '💧 Penyiraman & Reduksi Debu',
    text: 'Laporan Anda telah kami terima. Dinas telah menginstruksikan rekanan pelaksana untuk menambah frekuensi penyiraman jalan minimal 4 kali sehari dan memasang jaring penahan debu di sekitar pemukiman warga.',
  },
  {
    label: '🛠️ Perbaikan Kualitas / Aspal',
    text: 'Dinas Pekerjaan Umum telah meninjau titik kerusakan yang dilaporkan. Perataan ulang dan penambalan lapisan aspal (overlay) sedang dijadwalkan oleh unit pemeliharaan dan kontraktor penanggung jawab.',
  },
  {
    label: '✅ Penyelesaian Tuntas',
    text: 'Tindak lanjut atas keluhan ini telah diselesaikan oleh tim teknis lapangan. Hasil perbaikan telah diverifikasi oleh pengawas dinas dan saat ini akses jalan kembali normal serta aman dilalui warga.',
  },
];

export const DAFTAR_DINAS_LAMONGAN = [
  { id: 1, nama: 'Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan', singkatan: 'Dinas PU Bina Marga' },
  { id: 2, nama: 'Dinas Perumahan Rakyat, Kawasan Permukiman dan Cipta Karya Kabupaten Lamongan', singkatan: 'Dinas PRKPCK' },
  { id: 3, nama: 'Dinas Lingkungan Hidup Kabupaten Lamongan', singkatan: 'Dinas Lingkungan Hidup' },
  { id: 4, nama: 'Dinas Sumber Daya Air Kabupaten Lamongan', singkatan: 'Dinas Sumber Daya Air' },
  { id: 5, nama: 'Dinas Kesehatan Kabupaten Lamongan', singkatan: 'Dinas Kesehatan' },
];

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

export const PRESET_PROJECT_CODES: Record<number, { kode: string; pin: string }> = {
  1: { kode: 'SKD-SKD-001', pin: 'PJ-48291' },
  2: { kode: 'PCK-PCK-002', pin: 'PJ-73054' },
  3: { kode: 'SGO-GDL-003', pin: 'PJ-29518' },
  4: { kode: 'BBT-BBT-004', pin: 'PJ-61842' },
  5: { kode: 'DKT-SDR-005', pin: 'PJ-94107' },
  6: { kode: 'TUR-TUR-006', pin: 'PJ-15639' },
  7: { kode: 'BRD-BRD-007', pin: 'PJ-82475' },
  8: { kode: 'SMB-ARD-008', pin: 'PJ-37920' },
  9: { kode: 'SKR-SKR-009', pin: 'PJ-50361' },
  10: { kode: 'LRN-PLG-010', pin: 'PJ-66183' },
  11: { kode: 'TKG-WNK-011', pin: 'PJ-21947' },
  12: { kode: 'MDO-MJR-012', pin: 'PJ-88512' },
  13: { kode: 'KBN-KUR-013', pin: 'PJ-55219' },
  14: { kode: 'KBN-KUR-014', pin: 'PJ-31604' },
  15: { kode: 'KTG-PCG-015', pin: 'PJ-90731' },
  16: { kode: 'LMG-SKR-016', pin: 'PJ-46982' },
  17: { kode: 'SGO-KDB-017', pin: 'PJ-62415' },
  18: { kode: 'KGN-KGN-018', pin: 'PJ-39046' },
  19: { kode: 'BBT-BBT-019', pin: 'PJ-70523' },
  20: { kode: 'KBN-KUR-020', pin: 'PJ-14928' },
  21: { kode: 'BRD-BRD-021', pin: 'PJ-95264' },
  22: { kode: 'LMG-BNJ-022', pin: 'PJ-27401' },
  23: { kode: 'LMG-SKR-023', pin: 'PJ-63817' },
  24: { kode: 'DKT-SDR-024', pin: 'PJ-41795' },
  25: { kode: 'LMG-JTS-025', pin: 'PJ-78149' },
  26: { kode: 'BBT-BBT-026', pin: 'PJ-33587' },
  27: { kode: 'MDR-PNG-027', pin: 'PJ-69412' },
  28: { kode: 'SLK-SLK-028', pin: 'PJ-84620' },
  29: { kode: 'BRD-BRD-029', pin: 'PJ-52903' },
  30: { kode: 'NGB-NGB-030', pin: 'PJ-16378' },
  31: { kode: 'SKD-BNJ-031', pin: 'PJ-43069' },
  32: { kode: 'KBN-BLW-032', pin: 'PJ-24188' },
  33: { kode: 'SKR-SKR-033', pin: 'PJ-81390' },
  34: { kode: 'PCR-PCR-034', pin: 'PJ-77426' },
  35: { kode: 'LMG-PLW-035', pin: 'PJ-19853' },
};

export function getProjectEffectiveCode(proj: ProyekItem): string {
  if (proj.kode_proyek && proj.kode_proyek.trim() !== '') return proj.kode_proyek;
  if (PRESET_PROJECT_CODES[proj.id]) return PRESET_PROJECT_CODES[proj.id].kode;
  const kecCode = KECAMATAN_CODE_MAP[proj.nama_wilayah || ''] || 'LMG';
  const desaCode = abbreviateDesa(proj.nama_desa || 'DES');
  return `${kecCode}-${desaCode}-${String(proj.id).padStart(3, '0')}`;
}

export function getProjectEffectivePin(proj: ProyekItem): string {
  if (proj.kode_akses && proj.kode_akses.trim() !== '') return proj.kode_akses;
  if (PRESET_PROJECT_CODES[proj.id]) return PRESET_PROJECT_CODES[proj.id].pin;
  return `PJ-${10000 + (proj.id * 1111) % 90000}`;
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
    nama_dinas: currentUser.nama_dinas || 'Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan',
    dinas_id: currentUser.dinas_id || 1,
    tahap_terkini: 'Pembersihan & Pengukuran Lahan',
    is_published: true,
    pejabat_pembuat_komitmen: '',
    kontraktor_pelaksana: '',
    konsultan_pengawas: '',
    kepala_mandor: '',
    nomor_kontrak_lpse: '',
    sumber_dana: 'APBD Kab. Lamongan',
  });

  // State Gerbang Verifikasi Penanggung Jawab Proyek
  const [unlockedProject, setUnlockedProject] = useState<ProyekItem | null>(() => {
    try {
      const saved = sessionStorage.getItem('civictrack_pj_unlocked_project');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...parsed,
            kategori: parsed.kategori || 'jalan',
            anggaran: Number(parsed.anggaran) || 0,
            status: parsed.status || 'berjalan',
            progres_persen: Number(parsed.progres_persen) || 0,
            nama_wilayah: parsed.nama_wilayah || 'Kabupaten Lamongan',
            nama_proyek: parsed.nama_proyek || 'Proyek Pembangunan',
          };
        }
      }
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
              const matchedDesa = mapped.find(
                (d) =>
                  d.id === newProjectForm.desa_id ||
                  d.nama_wilayah.toLowerCase() === (newProjectForm.nama_desa || '').toLowerCase()
              );
              const selectedDesa = matchedDesa || mapped[0];
              const newCode = generateProjectSerialNumber(
                newProjectForm.nama_wilayah,
                selectedDesa.nama_wilayah,
                'skala_desa',
                projectList
              );
              setNewProjectForm((prev) => ({
                ...prev,
                desa_id: selectedDesa.id,
                nama_desa: selectedDesa.nama_wilayah,
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
              if (newProjectForm.skala_proyek === 'skala_desa' && fallbackList.length > 0) {
                const matchedDesa = fallbackList.find(
                  (d) =>
                    d.id === newProjectForm.desa_id ||
                    d.nama_wilayah.toLowerCase() === (newProjectForm.nama_desa || '').toLowerCase()
                );
                const selectedDesa = matchedDesa || fallbackList[0];
                const newCode = generateProjectSerialNumber(
                  newProjectForm.nama_wilayah,
                  selectedDesa.nama_wilayah,
                  'skala_desa',
                  projectList
                );
                setNewProjectForm((prev) => ({
                  ...prev,
                  desa_id: selectedDesa.id,
                  nama_desa: selectedDesa.nama_wilayah,
                  kode_proyek: newCode,
                }));
              }
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
            if (newProjectForm.skala_proyek === 'skala_desa' && fallbackList.length > 0) {
              const matchedDesa = fallbackList.find(
                (d) =>
                  d.id === newProjectForm.desa_id ||
                  d.nama_wilayah.toLowerCase() === (newProjectForm.nama_desa || '').toLowerCase()
              );
              const selectedDesa = matchedDesa || fallbackList[0];
              const newCode = generateProjectSerialNumber(
                newProjectForm.nama_wilayah,
                selectedDesa.nama_wilayah,
                'skala_desa',
                projectList
              );
              setNewProjectForm((prev) => ({
                ...prev,
                desa_id: selectedDesa.id,
                nama_desa: selectedDesa.nama_wilayah,
                kode_proyek: newCode,
              }));
            }
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
        if (newProjectForm.skala_proyek === 'skala_desa' && fallbackList.length > 0) {
          const matchedDesa = fallbackList.find(
            (d) =>
              d.id === newProjectForm.desa_id ||
              d.nama_wilayah.toLowerCase() === (newProjectForm.nama_desa || '').toLowerCase()
          );
          const selectedDesa = matchedDesa || fallbackList[0];
          const newCode = generateProjectSerialNumber(
            newProjectForm.nama_wilayah,
            selectedDesa.nama_wilayah,
            'skala_desa',
            projectList
          );
          setNewProjectForm((prev) => ({
            ...prev,
            desa_id: selectedDesa.id,
            nama_desa: selectedDesa.nama_wilayah,
            kode_proyek: newCode,
          }));
        }
      }
    }
  }, [newProjectForm.nama_wilayah]);

  // Sinkronisasi otomatis saat user memilih titik di peta (klik/geser marker) atau ketik koordinat
  const handleMapLocationChange = ({ lat, lng }: { lat: number; lng: number }) => {
    const detected = findWilayahByCoordinates(lat, lng);
    const targetKecamatan = detected.kecamatan;
    const targetDesa = detected.desa || newProjectForm.nama_desa;
    const targetDesaId = detected.desaId || newProjectForm.desa_id;

    const newCode = generateProjectSerialNumber(
      targetKecamatan,
      newProjectForm.skala_proyek === 'skala_desa' ? targetDesa : undefined,
      newProjectForm.skala_proyek,
      projectList
    );

    setNewProjectForm((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      nama_wilayah: targetKecamatan,
      nama_desa: targetDesa,
      desa_id: targetDesaId,
      kode_proyek: newCode,
    }));
  };

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
        const sanitizedProj: ProyekItem = {
          ...res.proyek,
          kategori: res.proyek.kategori || 'jalan',
          anggaran: Number(res.proyek.anggaran) || 0,
          status: res.proyek.status || 'berjalan',
          progres_persen: Number(res.proyek.progres_persen) || 0,
          nama_wilayah: res.proyek.nama_wilayah || 'Kabupaten Lamongan',
          nama_proyek: res.proyek.nama_proyek || 'Proyek Pembangunan',
        };
        setUnlockedProject(sanitizedProj);
        sessionStorage.setItem('civictrack_pj_unlocked_project', JSON.stringify(sanitizedProj));
        setSelectedProjectForTimeline(sanitizedProj.id);
        setNewDocForm((prev) => ({ ...prev, proyek_id: sanitizedProj.id }));
        setCopyFeedback(`Lembar kerja "${sanitizedProj.nama_proyek}" berhasil dibuka!`);
        setTimeout(() => setCopyFeedback(null), 3500);
        return;
      } else {
        setGateError(res.message || 'Verifikasi akses gagal.');
      }
    } catch (err: any) {
      // Graceful fallback jika kode cocok dengan proyek lokal atau mock data
      const matched = projectList.find(
        (p) => getProjectEffectiveCode(p).toUpperCase() === codeToVerify
      );
      if (matched) {
        const sanitizedProj: ProyekItem = {
          ...matched,
          kode_proyek: codeToVerify,
          kode_akses: pwToVerify,
          kategori: matched.kategori || 'jalan',
          anggaran: Number(matched.anggaran) || 0,
          status: matched.status || 'berjalan',
          progres_persen: Number(matched.progres_persen) || 0,
          nama_wilayah: matched.nama_wilayah || 'Kabupaten Lamongan',
          nama_proyek: matched.nama_proyek || 'Proyek Pembangunan',
        };
        setUnlockedProject(sanitizedProj);
        sessionStorage.setItem('civictrack_pj_unlocked_project', JSON.stringify(sanitizedProj));
        setSelectedProjectForTimeline(sanitizedProj.id);
        setNewDocForm((prev) => ({ ...prev, proyek_id: sanitizedProj.id }));
        setCopyFeedback(`Lembar kerja "${sanitizedProj.nama_proyek}" berhasil dibuka!`);
        setTimeout(() => setCopyFeedback(null), 3500);
        return;
      }
      setGateError(err.message || 'Kode proyek atau kunci akses khusus tidak valid.');
    } finally {
      setIsVerifyingGate(false);
    }
  };

  // Handle seleksi cepat mode demo (1-klik langsung buka lembar kerja proyek yang dipilih)
  const handleSelectDemoProject = async (demoProj: ProyekItem) => {
    const code = getProjectEffectiveCode(demoProj);
    const pin = getProjectEffectivePin(demoProj);

    setGateCode(code);
    setGatePassword(pin);
    setGateError(null);
    setIsVerifyingGate(true);

    try {
      const res = await apiService.verifyProjectAccess(code, pin);
      if (res.success && res.proyek) {
        const sanitizedProj: ProyekItem = {
          ...res.proyek,
          kode_proyek: code,
          kode_akses: pin,
          kategori: res.proyek.kategori || 'jalan',
          anggaran: Number(res.proyek.anggaran) || 0,
          status: res.proyek.status || 'berjalan',
          progres_persen: Number(res.proyek.progres_persen) || 0,
          nama_wilayah: res.proyek.nama_wilayah || 'Kabupaten Lamongan',
          nama_proyek: res.proyek.nama_proyek || 'Proyek Pembangunan',
        };
        setUnlockedProject(sanitizedProj);
        sessionStorage.setItem('civictrack_pj_unlocked_project', JSON.stringify(sanitizedProj));
        setSelectedProjectForTimeline(sanitizedProj.id);
        setNewDocForm((prev) => ({ ...prev, proyek_id: sanitizedProj.id }));
        setCopyFeedback(`Mode Demo Aktif: Lembar kerja "${sanitizedProj.nama_proyek}" dibuka!`);
        setTimeout(() => setCopyFeedback(null), 3500);
        return;
      }
    } catch (err: any) {
      console.warn('Backend verify-access fallback to direct demo unlock:', err);
    } finally {
      setIsVerifyingGate(false);
    }

    // Reliable demo mode fallback
    const fallbackSanitized: ProyekItem = {
      ...demoProj,
      kode_proyek: code,
      kode_akses: pin,
      kategori: demoProj.kategori || 'jalan',
      anggaran: Number(demoProj.anggaran) || 0,
      status: demoProj.status || 'berjalan',
      progres_persen: Number(demoProj.progres_persen) || 0,
      nama_wilayah: demoProj.nama_wilayah || 'Kabupaten Lamongan',
      nama_proyek: demoProj.nama_proyek || 'Proyek Pembangunan',
    };
    setUnlockedProject(fallbackSanitized);
    sessionStorage.setItem('civictrack_pj_unlocked_project', JSON.stringify(fallbackSanitized));
    setSelectedProjectForTimeline(fallbackSanitized.id);
    setNewDocForm((prev) => ({ ...prev, proyek_id: fallbackSanitized.id }));
    setCopyFeedback(`Mode Demo Aktif: Lembar kerja "${fallbackSanitized.nama_proyek}" dibuka!`);
    setTimeout(() => setCopyFeedback(null), 3500);
  };

  // Edit project state
  const [editingProject, setEditingProject] = useState<ProyekItem | null>(null);
  const editPhotoInputRef = useRef<HTMLInputElement>(null);
  const [editForm, setEditForm] = useState({
    nama_proyek: '',
    kategori: 'jalan' as ProyekKategori,
    anggaran: 0,
    tanggal_mulai: '',
    estimasi_selesai: '',
    progres_persen: 0,
    status: 'berjalan' as ProyekStatus,
    catatan_perubahan: '',
    is_published: true,
    dinas_id: 1,
    nama_dinas: '',
    pejabat_pembuat_komitmen: '',
    kontraktor_pelaksana: '',
    konsultan_pengawas: '',
    kepala_mandor: '',
    nomor_kontrak_lpse: '',
    sumber_dana: '',
    foto_url: '',
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  // File picker handler untuk upload foto utama proyek pada modal edit
  const handleEditPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setEditError('Berkas yang dipilih harus berupa file gambar (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setEditError('Ukuran file foto maksimal 8 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target?.result as string;
      setEditForm((prev) => ({ ...prev, foto_url: dataUrl }));
      setEditError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveEditPhoto = () => {
    setEditForm((prev) => ({ ...prev, foto_url: '' }));
    if (editPhotoInputRef.current) {
      editPhotoInputRef.current.value = '';
    }
  };

  // Linimasa state
  const [selectedProjectForTimeline, setSelectedProjectForTimeline] = useState<number>(() => {
    if (currentUser.role === 'penanggung_jawab' && unlockedProject) {
      return unlockedProject.id;
    }
    return 2;
  });
  const [timelineStages, setTimelineStages] = useState<LinimasaTahap[]>(() => {
    const targetProj =
      (currentUser.role === 'penanggung_jawab' && unlockedProject) ||
      projectList.find((p) => p.id === 2) ||
      projectList[0];
    return targetProj ? getProjectTimelineStages(targetProj) : [];
  });

  // Sinkronisasi otomatis tahapan linimasa dengan proyek terpilih & status progres
  useEffect(() => {
    const targetId =
      currentUser.role === 'penanggung_jawab' && unlockedProject
        ? unlockedProject.id
        : selectedProjectForTimeline;
    const targetProj =
      (currentUser.role === 'penanggung_jawab' && unlockedProject) ||
      projectList.find((p) => p.id === targetId) ||
      projectList[0];

    if (targetProj) {
      setTimelineStages(getProjectTimelineStages(targetProj));
    }
  }, [selectedProjectForTimeline, unlockedProject, projectList, currentUser.role]);

  // Sinkronisasi status/progres unlockedProject jika ada pembaruan di projectList
  useEffect(() => {
    if (currentUser.role === 'penanggung_jawab' && unlockedProject) {
      const latest = projectList.find((p) => p.id === unlockedProject.id);
      if (
        latest &&
        (latest.progres_persen !== unlockedProject.progres_persen ||
          latest.status !== unlockedProject.status ||
          latest.nama_proyek !== unlockedProject.nama_proyek)
      ) {
        setUnlockedProject(latest);
        sessionStorage.setItem('civictrack_pj_unlocked_project', JSON.stringify(latest));
      }
    }
  }, [projectList, unlockedProject, currentUser.role]);

  // Listener sinkronisasi live antar komponen / browser tab tanpa perlu reload
  useEffect(() => {
    const handleLiveSync = (e: any) => {
      const updated = e.detail as ProyekItem;
      if (!updated || !updated.id) return;

      setProjectList((prev) => {
        const exists = prev.some((p) => p.id === updated.id);
        if (exists) {
          return prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p));
        }
        return [updated, ...prev];
      });

      if (
        currentUser.role === 'penanggung_jawab' &&
        unlockedProject &&
        unlockedProject.id === updated.id
      ) {
        setUnlockedProject((prev) => (prev ? { ...prev, ...updated } : prev));
      }
    };

    const handleLiveDelete = (e: any) => {
      const deletedId = e.detail?.projectId;
      if (!deletedId) return;

      setProjectList((prev) => prev.filter((p) => p.id !== deletedId));
      if (
        currentUser.role === 'penanggung_jawab' &&
        unlockedProject &&
        unlockedProject.id === deletedId
      ) {
        setUnlockedProject(null);
        sessionStorage.removeItem('civictrack_pj_unlocked_project');
      }
    };

    window.addEventListener('civictrack_project_updated', handleLiveSync as EventListener);
    window.addEventListener('civictrack_project_deleted', handleLiveDelete as EventListener);
    return () => {
      window.removeEventListener('civictrack_project_updated', handleLiveSync as EventListener);
      window.removeEventListener('civictrack_project_deleted', handleLiveDelete as EventListener);
    };
  }, [currentUser.role, unlockedProject]);
  const [isNewStageModalOpen, setIsNewStageModalOpen] = useState(false);
  const [newStageForm, setNewStageForm] = useState({
    nama_tahap: '',
    deskripsi: '',
    target_mulai: new Date().toISOString().split('T')[0],
    target_selesai: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
    persentase_bobot: 20,
    status: 'sedang_berjalan' as 'belum_mulai' | 'sedang_berjalan' | 'selesai',
  });

  // Edit stage state
  const [editingStage, setEditingStage] = useState<LinimasaTahap | null>(null);
  const [editStageForm, setEditStageForm] = useState({
    nama_tahap: '',
    deskripsi: '',
    target_mulai: '',
    target_selesai: '',
    realisasi_mulai: '',
    realisasi_selesai: '',
    persentase_bobot: 20,
    status: 'belum_mulai' as 'belum_mulai' | 'sedang_berjalan' | 'selesai' | 'tertunda',
    catatan_lapangan: '',
  });

  const handleOpenEditStageModal = (stage: LinimasaTahap) => {
    setEditingStage(stage);
    setEditStageForm({
      nama_tahap: stage.nama_tahap || '',
      deskripsi: stage.deskripsi || '',
      target_mulai: stage.target_mulai || '',
      target_selesai: stage.target_selesai || '',
      realisasi_mulai: stage.realisasi_mulai || '',
      realisasi_selesai: stage.realisasi_selesai || '',
      persentase_bobot: stage.persentase_bobot || 0,
      status: stage.status || 'belum_mulai',
      catatan_lapangan: stage.catatan_lapangan || '',
    });
  };

  // Dokumentasi state
  const [dokumentasiList, setDokumentasiList] = useState<DokumentasiProyek[]>(() => {
    try {
      const saved = localStorage.getItem('civictrack_dokumentasi_proyek');
      if (saved) return JSON.parse(saved);
    } catch {}
    return MOCK_DOKUMENTASI_PROYEK;
  });
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const [docUploadMode, setDocUploadMode] = useState<'file' | 'url'>('file');
  const [selectedDocFile, setSelectedDocFile] = useState<File | null>(null);
  const [docFilePreview, setDocFilePreview] = useState<string | null>(null);
  const [docFileError, setDocFileError] = useState<string | null>(null);
  const [isSubmittingDoc, setIsSubmittingDoc] = useState(false);
  const [isDocDragging, setIsDocDragging] = useState(false);
  const docFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [newDocForm, setNewDocForm] = useState({
    proyek_id: 2,
    nama_tahap: 'Galian & Pemadatan Lapis Pondasi',
    judul: '',
    deskripsi: '',
    foto_url: '',
    tipe_file: 'foto' as 'foto' | 'video' | 'dokumen_teknis',
  });

  const handleDocFileSelect = (file: File) => {
    setDocFileError(null);
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|avi)$/i.test(file.name);

    if (!isImage && !isVideo) {
      setDocFileError('Format berkas tidak didukung. Harap pilih foto (JPG, PNG, WebP) atau video (MP4, WebM, MOV).');
      return;
    }

    const maxSize = 50 * 1024 * 1024; // 50 MB
    if (file.size > maxSize) {
      setDocFileError('Ukuran berkas melebihi batas maksimal 50 MB.');
      return;
    }

    setSelectedDocFile(file);
    const detectedType: 'foto' | 'video' = isVideo ? 'video' : 'foto';
    setNewDocForm((prev) => ({
      ...prev,
      tipe_file: detectedType,
      judul: prev.judul ? prev.judul : file.name.replace(/\.[^/.]+$/, ''),
    }));

    const reader = new FileReader();
    reader.onload = () => {
      setDocFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClearDocFile = () => {
    setSelectedDocFile(null);
    setDocFilePreview(null);
    setDocFileError(null);
    if (docFileInputRef.current) {
      docFileInputRef.current.value = '';
    }
  };

  // Aduan state
  const [aduanList, setAduanList] = useState<LaporanAduan[]>(MOCK_LAPORAN_WARGA);
  const [selectedAduanToReply, setSelectedAduanToReply] = useState<LaporanAduan | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [replyStatus, setReplyStatus] = useState<'diproses' | 'selesai'>('diproses');
  const [isSubmittingReply, setIsSubmittingReply] = useState<boolean>(false);
  const [replySuccessMessage, setReplySuccessMessage] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);

  const handleOpenReplyModal = (aduan: LaporanAduan) => {
    setSelectedAduanToReply(aduan);
    setReplyText(aduan.tanggapan_dinas || '');
    setReplyStatus(aduan.status === 'selesai' ? 'selesai' : 'diproses');
    setReplyError(null);
    setReplySuccessMessage(null);
  };

  const handleSubmitReplyAduan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAduanToReply || !replyText.trim()) return;

    setIsSubmittingReply(true);
    setReplyError(null);
    setReplySuccessMessage(null);

    try {
      const responder = `${currentUser.nama} (${
        currentUser.nama_dinas ||
        (currentUser.role === 'aparatur_pemerintah' || currentUser.role === 'pimpinan_instansi'
          ? 'Pemerintah Kabupaten Lamongan'
          : 'Dinas PU & Penataan Ruang')
      })`;

      const resStatus = replyStatus === 'selesai' ? 'ditanggapi' : 'diproses';

      await apiService.replyAduan(selectedAduanToReply.id, {
        status_tindak_lanjut: resStatus,
        tanggapan_dinas: replyText.trim(),
        petugas_penjawab: responder,
      });

      const updated: LaporanAduan = {
        ...selectedAduanToReply,
        tanggapan_dinas: replyText.trim(),
        status: replyStatus,
        tanggal_tanggapan: new Date().toLocaleString('id-ID', {
          dateStyle: 'short',
          timeStyle: 'short',
        }),
        petugas_penjawab: responder,
      };

      setAduanList((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );

      setReplySuccessMessage('Tanggapan resmi dinas berhasil dipublikasikan secara transparan.');
      setTimeout(() => {
        setSelectedAduanToReply(null);
        setReplySuccessMessage(null);
      }, 1400);
    } catch (err: any) {
      setReplyError(err.message || 'Gagal mempublikasikan tanggapan dinas.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Load aduan warga from database & persistent storage + real-time listener
  React.useEffect(() => {
    const loadReports = () => {
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
    };

    loadReports();

    const handleNewAduan = (event: any) => {
      if (event?.detail) {
        setAduanList((prev) => [event.detail, ...prev.filter((item) => item.id !== event.detail.id)]);
      }
      loadReports();
    };

    const handleRepliedAduan = (event: any) => {
      if (event?.detail) {
        const { reportId, status, tanggapan_dinas, tanggal_tanggapan, petugas_penjawab } = event.detail;
        setAduanList((prev) =>
          prev.map((item) =>
            item.id === reportId
              ? {
                  ...item,
                  status: status || item.status,
                  tanggapan_dinas: tanggapan_dinas || item.tanggapan_dinas,
                  tanggal_tanggapan: tanggal_tanggapan || item.tanggal_tanggapan,
                  petugas_penjawab: petugas_penjawab || item.petugas_penjawab,
                }
              : item
          )
        );
      }
      loadReports();
    };

    const handleStorageChange = () => {
      loadReports();
    };

    window.addEventListener('civictrack_new_aduan', handleNewAduan);
    window.addEventListener('civictrack_replied_aduan', handleRepliedAduan);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', loadReports);

    // Auto-refresh interval (sinkronisasi aduan warga secara live tanpa refresh)
    const aduanInterval = setInterval(loadReports, 5000);

    return () => {
      window.removeEventListener('civictrack_new_aduan', handleNewAduan);
      window.removeEventListener('civictrack_replied_aduan', handleRepliedAduan);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', loadReports);
      clearInterval(aduanInterval);
    };
  }, [activeSection]);

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

    const handleNewEvaluasi = (event?: any) => {
      if (event?.detail) {
        const e = event.detail;
        const newEval: EvaluasiCacatItem = {
          id: e.id,
          proyek_id: e.proyek_id,
          nama_proyek: e.nama_proyek || 'Proyek Lapangan',
          user_id: e.user_id,
          nama_pelapor: e.pelapor?.nama || (e as any).nama_pelapor || 'Warga Masyarakat',
          deskripsi: e.deskripsi || '',
          lokasi_titik: (e as any).lokasi_titik || 'Lokasi Proyek',
          skor_urgensi_ai: e.skor_urgensi_ai || 3,
          analisis_ai: e.ringkasan_analisis_ai || (e as any).analisis_ai || 'Analisis AI Groq',
          kategori_cacat: e.kategori_masalah || (e as any).kategori_cacat || 'Kerusakan Fisik',
          status_verifikasi: e.status || 'menunggu_verifikasi',
          tanggal_lapor: String(e.created_at || new Date().toISOString()).split('T')[0],
        };
        setEvaluasiList((prev) => [newEval, ...prev.filter((item) => item.id !== newEval.id)]);
      }
      loadEvaluations();
    };

    const handleEvaluasiVerified = () => {
      loadEvaluations();
    };

    const handleStorageChange = () => {
      loadEvaluations();
    };

    window.addEventListener('civictrack_new_evaluasi', handleNewEvaluasi);
    window.addEventListener('civictrack_evaluasi_verified', handleEvaluasiVerified);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', loadEvaluations);

    // Auto-refresh interval (sinkronisasi evaluasi cacat secara live)
    const evalInterval = setInterval(loadEvaluations, 5000);

    return () => {
      window.removeEventListener('civictrack_new_evaluasi', handleNewEvaluasi);
      window.removeEventListener('civictrack_evaluasi_verified', handleEvaluasiVerified);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', loadEvaluations);
      clearInterval(evalInterval);
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

    setIsSubmittingNewProj(true);
    setCreateProjError(null);

    try {
      const wilayahId = KECAMATAN_ID_MAP[newProjectForm.nama_wilayah] || 23;
      const dinasId = newProjectForm.dinas_id || currentUser.dinas_id || 1;

      const parseCoordinate = (val: any, fallback: number): number => {
        if (typeof val === 'number') return isNaN(val) ? fallback : val;
        if (typeof val === 'string') {
          const num = parseFloat(val.replace(',', '.'));
          return isNaN(num) ? fallback : num;
        }
        return fallback;
      };

      const payload = {
        nama_proyek: newProjectForm.nama_proyek.trim(),
        kategori: newProjectForm.kategori,
        deskripsi: newProjectForm.deskripsi.trim() || undefined,
        latitude: parseCoordinate(newProjectForm.latitude, -7.1197),
        longitude: parseCoordinate(newProjectForm.longitude, 112.4150),
        wilayah_id: wilayahId,
        desa_id: (newProjectForm.skala_proyek === 'skala_desa' && newProjectForm.desa_id && newProjectForm.desa_id < 9000)
          ? newProjectForm.desa_id
          : null,
        dinas_id: dinasId,
        anggaran: Number(newProjectForm.anggaran),
        status: newProjectForm.status,
        progres_persen: Number(newProjectForm.progres_persen),
        tanggal_mulai: newProjectForm.tanggal_mulai,
        estimasi_selesai: newProjectForm.estimasi_selesai,
        kode_proyek: newProjectForm.kode_proyek.trim() || undefined,
        kode_akses: newProjectForm.kode_akses.trim() || undefined,
        pejabat_pembuat_komitmen: newProjectForm.pejabat_pembuat_komitmen.trim() || undefined,
        kontraktor_pelaksana: newProjectForm.kontraktor_pelaksana.trim() || undefined,
        konsultan_pengawas: newProjectForm.konsultan_pengawas.trim() || undefined,
        kepala_mandor: newProjectForm.kepala_mandor.trim() || undefined,
        nomor_kontrak_lpse: newProjectForm.nomor_kontrak_lpse.trim() || undefined,
        sumber_dana: newProjectForm.sumber_dana.trim() || undefined,
        is_published: newProjectForm.is_published,
      };

      const created = await apiService.createProject(payload);

      // Inisialisasi tahapan linimasa kosong untuk proyek baru
      saveProjectTimelineStages(created.id, []);

      const finalCreated: ProyekItem = {
        ...created,
        dinas_id: dinasId,
        nama_dinas: created.nama_dinas || newProjectForm.nama_dinas || 'Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan',
        nama_wilayah: created.nama_wilayah || newProjectForm.nama_wilayah,
        nama_desa: created.nama_desa || (newProjectForm.skala_proyek === 'skala_desa' ? newProjectForm.nama_desa : undefined),
        pejabat_pembuat_komitmen: newProjectForm.pejabat_pembuat_komitmen.trim() || created.pejabat_pembuat_komitmen,
        kontraktor_pelaksana: newProjectForm.kontraktor_pelaksana.trim() || created.kontraktor_pelaksana,
        konsultan_pengawas: newProjectForm.konsultan_pengawas.trim() || created.konsultan_pengawas,
        kepala_mandor: newProjectForm.kepala_mandor.trim() || created.kepala_mandor,
        nomor_kontrak_lpse: newProjectForm.nomor_kontrak_lpse.trim() || created.nomor_kontrak_lpse,
        sumber_dana: newProjectForm.sumber_dana.trim() || created.sumber_dana,
        kode_proyek: newProjectForm.kode_proyek.trim() || created.kode_proyek,
        kode_akses: newProjectForm.kode_akses.trim() || created.kode_akses,
      };

      setProjectList((prev) => [finalCreated, ...prev]);
      broadcastProjectUpdate(finalCreated);
      if (onProjectCreated) {
        onProjectCreated(finalCreated);
      }

      setIsNewProjectModalOpen(false);
      const nextPin = generateRandomAccessKey();
      const nextCode = generateProjectSerialNumber(
        'Kecamatan Lamongan (Kota)',
        'Kelurahan Jetis',
        'skala_desa',
        [finalCreated, ...projectList]
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
        dinas_id: currentUser.dinas_id || 1,
        nama_dinas: currentUser.nama_dinas || 'Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan',
        kode_proyek: nextCode,
        kode_akses: nextPin,
        latitude: -7.1197,
        longitude: 112.4150,
        tahap_terkini: 'Pembersihan & Pengukuran Lahan',
        is_published: true,
        pejabat_pembuat_komitmen: '',
        kontraktor_pelaksana: '',
        konsultan_pengawas: '',
        kepala_mandor: '',
        nomor_kontrak_lpse: '',
        sumber_dana: 'APBD Kab. Lamongan',
      });
    } catch (error: any) {
      console.log('Submit proyek gagal:', error);
      console.error('Submit proyek gagal (detail):', error);
      setCreateProjError(error?.message || 'Gagal membuat proyek baru.');
    } finally {
      setIsSubmittingNewProj(false);
    }
  };

  // Handle open edit project modal
  const handleOpenEditModal = (p: ProyekItem) => {
    setEditingProject(p);
    let initialStatus: ProyekStatus = 'berjalan';
    if (p.progres_persen >= 100 || p.status === 'selesai') {
      initialStatus = 'selesai';
    } else if (
      p.status === 'ditangguhkan' ||
      (p.status as any) === 'tertunda' ||
      (p.status as any) === 'dalam_peninjauan_ulang'
    ) {
      initialStatus = 'ditangguhkan';
    } else if (
      p.status === 'rencana' ||
      p.status === 'direncanakan' ||
      p.status === 'planned' ||
      p.status === 'scheduled' ||
      p.status === 'akan_dimulai'
    ) {
      initialStatus = 'rencana';
    } else {
      initialStatus = 'berjalan';
    }
    const tech = getProjectTechnicalDetails(p);
    setEditForm({
      nama_proyek: p.nama_proyek,
      kategori: p.kategori,
      anggaran: p.anggaran,
      tanggal_mulai: p.tanggal_mulai || '2024-01-01',
      estimasi_selesai: p.estimasi_selesai || '2024-12-31',
      progres_persen: p.progres_persen,
      status: initialStatus,
      catatan_perubahan: '',
      is_published: p.is_published ?? true,
      dinas_id: p.dinas_id || 1,
      nama_dinas: p.nama_dinas || tech.instansi_penanggung_jawab || 'Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan',
      pejabat_pembuat_komitmen: p.pejabat_pembuat_komitmen || tech.pejabat_pembuat_komitmen || '',
      kontraktor_pelaksana: p.kontraktor_pelaksana || tech.kontraktor_pelaksana || '',
      konsultan_pengawas: p.konsultan_pengawas || tech.konsultan_pengawas || '',
      kepala_mandor: p.kepala_mandor || tech.kepala_mandor || '',
      nomor_kontrak_lpse: p.nomor_kontrak_lpse || tech.nomor_kontrak_lpse || '',
      sumber_dana: p.sumber_dana || tech.sumber_dana || 'APBD Kab. Lamongan',
      foto_url: p.foto_url || '',
    });
    setEditError(null);
  };

  // Handle delete project
  const handleDeleteProject = async () => {
    if (!editingProject) return;
    setIsDeletingProject(true);
    try {
      await apiService.deleteProject(editingProject.id);
      broadcastProjectDeletion(editingProject.id);
      setProjectList((prev) => prev.filter((item) => item.id !== editingProject.id));
      if (unlockedProject && unlockedProject.id === editingProject.id) {
        setUnlockedProject(null);
        sessionStorage.removeItem('civictrack_pj_unlocked_project');
      }
      setIsDeleteConfirmOpen(false);
      setEditingProject(null);
      setCopyFeedback(`Proyek '${editingProject.nama_proyek}' berhasil dihapus.`);
      setTimeout(() => setCopyFeedback(null), 3500);
    } catch (err: any) {
      setEditError(err.message || 'Gagal menghapus proyek.');
      setIsDeleteConfirmOpen(false);
    } finally {
      setIsDeletingProject(false);
    }
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
        dinas_id: editForm.dinas_id,
        catatan_perubahan: editForm.catatan_perubahan.trim() || undefined,
        is_published: editForm.is_published,
        pejabat_pembuat_komitmen: editForm.pejabat_pembuat_komitmen.trim() || undefined,
        kontraktor_pelaksana: editForm.kontraktor_pelaksana.trim() || undefined,
        konsultan_pengawas: editForm.konsultan_pengawas.trim() || undefined,
        kepala_mandor: editForm.kepala_mandor.trim() || undefined,
        nomor_kontrak_lpse: editForm.nomor_kontrak_lpse.trim() || undefined,
        sumber_dana: editForm.sumber_dana.trim() || undefined,
        foto_url: editForm.foto_url ? editForm.foto_url.trim() : undefined,
      });

      const mergedUpdated: ProyekItem = {
        ...editingProject,
        ...updated,
        dinas_id: editForm.dinas_id,
        nama_dinas: editForm.nama_dinas || editingProject.nama_dinas,
        pejabat_pembuat_komitmen: editForm.pejabat_pembuat_komitmen.trim() || editingProject.pejabat_pembuat_komitmen,
        kontraktor_pelaksana: editForm.kontraktor_pelaksana.trim() || editingProject.kontraktor_pelaksana,
        konsultan_pengawas: editForm.konsultan_pengawas.trim() || editingProject.konsultan_pengawas,
        kepala_mandor: editForm.kepala_mandor.trim() || editingProject.kepala_mandor,
        nomor_kontrak_lpse: editForm.nomor_kontrak_lpse.trim() || editingProject.nomor_kontrak_lpse,
        sumber_dana: editForm.sumber_dana.trim() || editingProject.sumber_dana,
        foto_url: editForm.foto_url ? editForm.foto_url.trim() : (updated.foto_url || ''),
      };

      setProjectList((prev) =>
        prev.map((item) => (item.id === editingProject.id ? mergedUpdated : item))
      );
      if (
        currentUser.role === 'penanggung_jawab' &&
        unlockedProject &&
        unlockedProject.id === editingProject.id
      ) {
        setUnlockedProject(mergedUpdated);
        sessionStorage.setItem('civictrack_pj_unlocked_project', JSON.stringify(mergedUpdated));
      }
      broadcastProjectUpdate(mergedUpdated);
      if (onProjectUpdated) {
        onProjectUpdated(mergedUpdated);
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
    const activeTargetId =
      currentUser.role === 'penanggung_jawab' && unlockedProject
        ? unlockedProject.id
        : selectedProjectForTimeline;
    if (!activeTargetId) return;

    try {
      let stageRes: any;
      try {
        stageRes = await apiService.createTimelineStage(activeTargetId, {
          nama_tahap: newStageForm.nama_tahap.trim(),
          progres_persen: Number(newStageForm.persentase_bobot),
          catatan: newStageForm.deskripsi.trim() || undefined,
        });
      } catch (backendErr: any) {
        console.warn('Backend createTimelineStage error, continuing with client persistence:', backendErr);
        stageRes = {
          id: Date.now(),
          proyek_id: activeTargetId,
          nama_tahap: newStageForm.nama_tahap.trim(),
          progres_persen: Number(newStageForm.persentase_bobot),
          catatan: newStageForm.deskripsi.trim() || undefined,
        };
      }

      const initialStatus = newStageForm.status || (stageRes.progres_persen >= 100 ? 'selesai' : 'sedang_berjalan');
      const newStage: LinimasaTahap = {
        id: stageRes.id,
        proyek_id: activeTargetId,
        nomor_tahap: timelineStages.length + 1,
        nama_tahap: stageRes.nama_tahap,
        deskripsi: newStageForm.deskripsi,
        target_mulai: newStageForm.target_mulai,
        target_selesai: newStageForm.target_selesai,
        persentase_bobot: stageRes.progres_persen,
        status: initialStatus,
        realisasi_selesai: initialStatus === 'selesai' ? new Date().toISOString().split('T')[0] : undefined,
        catatan_lapangan: stageRes.catatan || 'Tahap baru ditambahkan secara manual oleh aparatur pemerintah.',
        is_manual: true,
      };
      const updatedStages = [...timelineStages, newStage];
      setTimelineStages(updatedStages);
      saveProjectTimelineStages(activeTargetId, updatedStages);

      const projToUpdate = projectList.find((p) => p.id === activeTargetId);
      if (projToUpdate) {
        const nextProgress = Math.max(projToUpdate.progres_persen, stageRes.progres_persen);
        const updatedProj: ProyekItem = {
          ...projToUpdate,
          progres_persen: nextProgress,
          status: nextProgress >= 100 ? 'selesai' : (projToUpdate.status === 'rencana' ? 'berjalan' : projToUpdate.status),
          tahap_terkini: stageRes.nama_tahap,
        };
        setProjectList((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
        broadcastProjectUpdate(updatedProj);
        if (
          currentUser.role === 'penanggung_jawab' &&
          unlockedProject &&
          unlockedProject.id === activeTargetId
        ) {
          setUnlockedProject(updatedProj);
          sessionStorage.setItem('civictrack_pj_unlocked_project', JSON.stringify(updatedProj));
        }
        if (onProjectUpdated) {
          onProjectUpdated(updatedProj);
        }
      }

      setIsNewStageModalOpen(false);
      setNewStageForm({
        nama_tahap: '',
        deskripsi: '',
        target_mulai: new Date().toISOString().split('T')[0],
        target_selesai: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
        persentase_bobot: 20,
        status: 'sedang_berjalan',
      });
      setCopyFeedback(`Tahap "${newStage.nama_tahap}" berhasil ditambahkan ke linimasa!`);
      setTimeout(() => setCopyFeedback(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan tahapan linimasa.');
    }
  };

  // Handle delete timeline stage
  const handleDeleteTimelineStage = (stageId: number) => {
    const activeTargetId =
      currentUser.role === 'penanggung_jawab' && unlockedProject
        ? unlockedProject.id
        : selectedProjectForTimeline;
    if (!activeTargetId) return;

    const updatedStages = timelineStages
      .filter((s) => s.id !== stageId)
      .map((s, idx) => ({ ...s, nomor_tahap: idx + 1, is_manual: true }));

    setTimelineStages(updatedStages);
    saveProjectTimelineStages(activeTargetId, updatedStages);
    setCopyFeedback('Tahapan linimasa berhasil dihapus.');
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  // Handle edit / update timeline stage
  const handleUpdateTimelineStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStage) return;

    const activeTargetId =
      currentUser.role === 'penanggung_jawab' && unlockedProject
        ? unlockedProject.id
        : selectedProjectForTimeline;
    if (!activeTargetId) return;

    const cleanStatus = editStageForm.status;
    const nowStr = new Date().toISOString().split('T')[0];

    const updatedStage: LinimasaTahap = {
      ...editingStage,
      nama_tahap: editStageForm.nama_tahap.trim(),
      deskripsi: editStageForm.deskripsi.trim(),
      target_mulai: editStageForm.target_mulai,
      target_selesai: editStageForm.target_selesai,
      realisasi_mulai:
        cleanStatus !== 'belum_mulai'
          ? editStageForm.realisasi_mulai || editingStage.realisasi_mulai || editStageForm.target_mulai || nowStr
          : undefined,
      realisasi_selesai:
        cleanStatus === 'selesai'
          ? editStageForm.realisasi_selesai || editingStage.realisasi_selesai || nowStr
          : undefined,
      persentase_bobot: Number(editStageForm.persentase_bobot) || 0,
      status: cleanStatus,
      catatan_lapangan: editStageForm.catatan_lapangan.trim() || undefined,
      is_manual: true,
    };

    const updatedStages = timelineStages.map((st) =>
      st.id === editingStage.id ? updatedStage : st
    );

    setTimelineStages(updatedStages);
    saveProjectTimelineStages(activeTargetId, updatedStages);

    // Hitung bobot akumulasi tahap selesai
    const completedWeight = updatedStages
      .filter((s) => s.status === 'selesai')
      .reduce((sum, s) => sum + (Number(s.persentase_bobot) || 0), 0);

    const activeStage = updatedStages.find((s) => s.status === 'sedang_berjalan') || updatedStage;

    const projToUpdate = projectList.find((p) => p.id === activeTargetId);
    if (projToUpdate) {
      const calculatedProgress = Math.min(100, Math.max(projToUpdate.progres_persen, completedWeight));
      const nextStatus =
        calculatedProgress >= 100
          ? 'selesai'
          : projToUpdate.status === 'rencana' && cleanStatus !== 'belum_mulai'
          ? 'berjalan'
          : projToUpdate.status;

      const updatedProj: ProyekItem = {
        ...projToUpdate,
        progres_persen: calculatedProgress,
        status: nextStatus,
        tahap_terkini: activeStage.nama_tahap,
      };

      setProjectList((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
      broadcastProjectUpdate(updatedProj);

      if (
        currentUser.role === 'penanggung_jawab' &&
        unlockedProject &&
        unlockedProject.id === activeTargetId
      ) {
        setUnlockedProject(updatedProj);
        sessionStorage.setItem('civictrack_pj_unlocked_project', JSON.stringify(updatedProj));
      }
      if (onProjectUpdated) {
        onProjectUpdated(updatedProj);
      }
    }

    setEditingStage(null);
    setCopyFeedback(`Tahap "${updatedStage.nama_tahap}" berhasil diperbarui.`);
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  // Handle submit documentation
  const handleAddDocumentation = async (e: React.FormEvent) => {
    e.preventDefault();
    setDocFileError(null);

    let finalFileUrl = newDocForm.foto_url.trim();
    let finalType: 'foto' | 'video' | 'dokumen_teknis' = newDocForm.tipe_file;

    if (docUploadMode === 'file') {
      if (!selectedDocFile && !docFilePreview) {
        setDocFileError('Silakan pilih berkas foto atau video dari penyimpanan perangkat Anda.');
        return;
      }
      setIsSubmittingDoc(true);

      if (
        selectedDocFile?.type.startsWith('video/') ||
        (docFilePreview && docFilePreview.startsWith('data:video/'))
      ) {
        finalType = 'video';
      } else {
        finalType = 'foto';
      }

      if (selectedDocFile) {
        try {
          const uploaded = await apiService.uploadDokumentasi(
            Number(newDocForm.proyek_id),
            selectedDocFile
          );
          if (uploaded?.url_file) {
            finalFileUrl = uploaded.url_file;
            if (uploaded.tipe_media === 'video') finalType = 'video';
          } else {
            finalFileUrl = docFilePreview || '';
          }
        } catch {
          finalFileUrl = docFilePreview || '';
        }
      } else if (docFilePreview) {
        finalFileUrl = docFilePreview;
      }
    } else {
      if (!finalFileUrl) {
        setDocFileError('Silakan masukkan tautan/URL berkas foto atau video bukti.');
        return;
      }
      if (/\.(mp4|mov|webm|avi)(\?|$)/i.test(finalFileUrl)) {
        finalType = 'video';
      }
    }

    if (!finalFileUrl) {
      setIsSubmittingDoc(false);
      setDocFileError('Gagal memproses berkas dokumentasi. Pastikan berkas atau URL valid.');
      return;
    }

    const selProj = projectList.find((p) => p.id === Number(newDocForm.proyek_id));
    const newDoc: DokumentasiProyek = {
      id: Date.now(),
      proyek_id: Number(newDocForm.proyek_id),
      nama_proyek: selProj?.nama_proyek || 'Pelebaran Jalan',
      nama_tahap: newDocForm.nama_tahap || 'Inspeksi Fisik Lapangan',
      judul: newDocForm.judul.trim(),
      deskripsi: newDocForm.deskripsi.trim(),
      foto_url: finalFileUrl,
      tanggal_unggah: new Date().toISOString().split('T')[0],
      diunggah_oleh: `${currentUser.nama} (${
        currentUser.role === 'penanggung_jawab' ? 'Penanggung Jawab Proyek' : 'Admin Dinas PUPR'
      })`,
      tipe_file: finalType,
    };

    const updatedList = [newDoc, ...dokumentasiList];
    setDokumentasiList(updatedList);
    try {
      localStorage.setItem('civictrack_dokumentasi_proyek', JSON.stringify(updatedList));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('civictrack_documentation_updated', { detail: newDoc }));
      }
    } catch {}

    setIsSubmittingDoc(false);
    setIsNewDocModalOpen(false);
    handleClearDocFile();
    setNewDocForm({
      proyek_id:
        currentUser.role === 'penanggung_jawab' && unlockedProject ? unlockedProject.id : 2,
      nama_tahap: 'Galian & Pemadatan Lapis Pondasi',
      judul: '',
      deskripsi: '',
      foto_url: '',
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

  // Helper normalisasi status proyek: hanya berjalan, selesai, ditangguhkan, rencana
  const getDisplayStatus = (st?: string, progres?: number): 'selesai' | 'berjalan' | 'ditangguhkan' | 'rencana' => {
    if (st === 'rencana' || st === 'direncanakan' || st === 'planned') return 'rencana';
    if (st === 'selesai' || (progres !== undefined && progres >= 100)) return 'selesai';
    if (st === 'berjalan' || st === 'in_progress') return 'berjalan';
    return 'ditangguhkan';
  };

  // Filter aduan dan evaluasi khusus proyek yang ditugaskan jika role = penanggung_jawab
  const projectAduanList = useMemo(() => {
    if (currentUser.role === 'penanggung_jawab' && unlockedProject) {
      return aduanList.filter(
        (item) =>
          Number(item.proyek_id) === Number(unlockedProject.id) ||
          (item.nama_proyek &&
            unlockedProject.nama_proyek &&
            (item.nama_proyek.toLowerCase().trim() === unlockedProject.nama_proyek.toLowerCase().trim() ||
              item.nama_proyek.toLowerCase().includes(unlockedProject.nama_proyek.toLowerCase()) ||
              unlockedProject.nama_proyek.toLowerCase().includes(item.nama_proyek.toLowerCase())))
      );
    }
    return aduanList;
  }, [aduanList, currentUser.role, unlockedProject]);

  const projectAduanMenungguCount = useMemo(() => {
    return projectAduanList.filter((a) => a.status === 'menunggu').length;
  }, [projectAduanList]);

  const projectEvaluasiList = useMemo(() => {
    if (currentUser.role === 'penanggung_jawab' && unlockedProject) {
      return evaluasiList.filter(
        (item) =>
          Number(item.proyek_id) === Number(unlockedProject.id) ||
          (item.nama_proyek &&
            unlockedProject.nama_proyek &&
            (item.nama_proyek.toLowerCase().trim() === unlockedProject.nama_proyek.toLowerCase().trim() ||
              item.nama_proyek.toLowerCase().includes(unlockedProject.nama_proyek.toLowerCase()) ||
              unlockedProject.nama_proyek.toLowerCase().includes(item.nama_proyek.toLowerCase())))
      );
    }
    return evaluasiList;
  }, [evaluasiList, currentUser.role, unlockedProject]);

  // Quick stats calculation
  const totalAnggaran = projectList.reduce((acc, p) => acc + p.anggaran, 0);
  const berjalanCount = projectList.filter((p) => p.status === 'berjalan').length;
  const selesaiCount = projectList.filter((p) => p.status === 'selesai').length;
  const tertundaCount = projectList.filter((p) => p.status === 'ditangguhkan').length;
  const aduanMenungguCount = aduanList.filter((a) => a.status === 'menunggu').length;

  const filteredProjects = projectList.filter((p) => {
    if (filterStatus !== 'semua') {
      const normalized = getDisplayStatus(p.status, p.progres_persen);
      if (p.status !== filterStatus && normalized !== filterStatus) return false;
    }
    if (searchProj.trim()) {
      const q = searchProj.toLowerCase();
      const code = getProjectEffectiveCode(p).toLowerCase();
      const pin = getProjectEffectivePin(p).toLowerCase();
      return (
        p.nama_proyek.toLowerCase().includes(q) ||
        (p.nama_wilayah || '').toLowerCase().includes(q) ||
        (p.nama_desa || '').toLowerCase().includes(q) ||
        p.kategori.toLowerCase().includes(q) ||
        code.includes(q) ||
        pin.includes(q)
      );
    }
    return true;
  });

  const isAnyFormOpen =
    isNewProjectModalOpen ||
    !!editingProject ||
    isNewStageModalOpen ||
    !!editingStage ||
    isNewDocModalOpen ||
    !!selectedEvalToVerify ||
    !!selectedAduanToReply;

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
        if (editingStage) setEditingStage(null);
        if (isNewDocModalOpen) {
          setIsNewDocModalOpen(false);
          handleClearDocFile();
        }
        if (selectedEvalToVerify) setSelectedEvalToVerify(null);
        if (selectedAduanToReply) {
          setSelectedAduanToReply(null);
          setReplyError(null);
          setReplySuccessMessage(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAnyFormOpen, isNewProjectModalOpen, editingProject, isNewStageModalOpen, editingStage, isNewDocModalOpen, selectedEvalToVerify, selectedAduanToReply]);

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
            <h2 className="font-heading text-2xl font-bold tracking-tight">
              Gerbang Akses Penanggung Jawab Proyek
            </h2>
            <p className="text-xs sm:text-sm text-white/80 mt-1 leading-relaxed">
              Silakan masukkan <strong>Nomor Seri / Kode Registrasi Proyek</strong> dan <strong>Kunci Akses Khusus</strong> yang telah diberikan oleh Pimpinan Instansi / Dinas untuk membuka lembar kerja proyek Anda.
            </p>
          </div>

          {/* Form Verifikasi */}
          <form onSubmit={handleVerifyGate} autoComplete="off" className="p-6 sm:p-8 space-y-5">
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
                  name="project_registration_code_noautofill"
                  autoComplete="off"
                  type="text"
                  required
                  value={gateCode}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    if (!val.includes('@')) {
                      setGateCode(val);
                    }
                  }}
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
                  name="project_security_pin_noautofill"
                  autoComplete="new-password"
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
          <div className="bg-gradient-to-b from-[#F0F7FD] to-[#F8FAFC] border-t border-[#DCE0E6] p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#184C78]">Pilihan Proyek Tersedia untuk Pengujian Langsung:</h3>
                  <p className="text-[11px] text-[#6C757D]">Mode Demo Aktif: Klik salah satu proyek di bawah untuk langsung membuka lembar kerja (1-klik instan).</p>
                </div>
              </div>

              {/* Dropdown 35 Proyek untuk Pengujian */}
              <div className="shrink-0 w-full sm:w-auto">
                <select
                  onChange={(e) => {
                    const selId = Number(e.target.value);
                    const found = projectList.find((p) => p.id === selId);
                    if (found) handleSelectDemoProject(found);
                  }}
                  defaultValue=""
                  aria-label="Pilih Proyek Demo"
                  className="w-full sm:w-64 text-xs font-medium py-2 px-3 bg-white border border-[#2980B9]/40 rounded-xl text-[#184C78] outline-none shadow-xs cursor-pointer hover:border-[#2980B9]"
                >
                  <option value="" disabled>-- Buka dari 35 Proyek Lamongan --</option>
                  {projectList.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id} {p.nama_proyek} ({getProjectEffectiveCode(p)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {projectList.slice(0, 4).map((demoProj) => {
                const effCode = getProjectEffectiveCode(demoProj);
                const effPin = getProjectEffectivePin(demoProj);
                return (
                  <button
                    key={demoProj.id}
                    type="button"
                    onClick={() => handleSelectDemoProject(demoProj)}
                    className="text-left p-3.5 rounded-2xl border border-[#DCE0E6] bg-white hover:border-[#2980B9] hover:bg-[#EBF4FB] hover:shadow-md transition-all group cursor-pointer relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-[#184C78] mb-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-[#EBF4FB] group-hover:bg-[#184C78] group-hover:text-white transition-colors">
                        {effCode}
                      </span>
                      <span className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                        {effPin}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[#212529] line-clamp-1 group-hover:text-[#184C78] transition-colors">
                      {demoProj.nama_proyek}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#6C757D] mt-2 pt-2 border-t border-slate-100">
                      <span>{demoProj.nama_wilayah || 'Kab. Lamongan'}</span>
                      <span className="text-amber-600 font-bold group-hover:text-[#2980B9] flex items-center gap-1">
                        <span>Buka Lembar Kerja</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">⚡</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                    <h3 id="modal-new-project-title" className="font-heading text-base sm:text-lg font-bold leading-tight">
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

              {/* Section Pihak & Tim Penanggung Jawab Proyek (LPSE & Pelaksana Lapangan) */}
              <div className="p-4 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-blue-50/70 border border-[#184C78]/25 rounded-2xl space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 font-bold text-[#184C78] text-xs sm:text-sm">
                    <Building2 className="w-4 h-4 text-[#184C78]" />
                    <span>Pihak &amp; Tim Penanggung Jawab Proyek (Sesuai LPSE di Peta)</span>
                  </div>
                  <span className="text-[10.5px] bg-[#184C78] text-white px-2.5 py-0.5 rounded-full font-semibold shadow-2xs flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-cyan-300" />
                    Transparansi Publik
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Data penanggung jawab ini akan langsung tercantum pada kartu detail proyek di peta publik warga dan transparansi LPSE.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Instansi Pengampu / Dinas Penanggung Jawab */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-[#184C78] mb-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#184C78]" />
                      <span>Instansi Pengampu (Dinas Penanggung Jawab)</span>
                      <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={newProjectForm.dinas_id}
                      onChange={(e) => {
                        const selId = Number(e.target.value);
                        const selDinas = DAFTAR_DINAS_LAMONGAN.find((d) => d.id === selId);
                        setNewProjectForm({
                          ...newProjectForm,
                          dinas_id: selId,
                          nama_dinas: selDinas ? selDinas.nama : newProjectForm.nama_dinas,
                        });
                      }}
                      className="w-full p-2.5 text-xs border border-[#DCE0E6] rounded-lg bg-white outline-none focus:border-[#2980B9] font-medium"
                    >
                      {DAFTAR_DINAS_LAMONGAN.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pejabat Pembuat Komitmen (PPK) */}
                  <div>
                    <label className="text-xs font-semibold text-[#184C78] mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#184C78]" />
                      <span>Pejabat Pembuat Komitmen (PPK)</span>
                    </label>
                    <input
                      type="text"
                      value={newProjectForm.pejabat_pembuat_komitmen}
                      onChange={(e) =>
                        setNewProjectForm({ ...newProjectForm, pejabat_pembuat_komitmen: e.target.value })
                      }
                      placeholder="Contoh: Suyitno, S.T. / Dwi Prasetyo, S.T."
                      className="w-full p-2.5 text-xs border border-[#DCE0E6] rounded-lg bg-white outline-none focus:border-[#2980B9]"
                    />
                  </div>

                  {/* Kontraktor Pelaksana */}
                  <div>
                    <label className="text-xs font-semibold text-[#184C78] mb-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#184C78]" />
                      <span>Kontraktor Pelaksana (Rekanan Lapangan)</span>
                    </label>
                    <input
                      type="text"
                      value={newProjectForm.kontraktor_pelaksana}
                      onChange={(e) =>
                        setNewProjectForm({ ...newProjectForm, kontraktor_pelaksana: e.target.value })
                      }
                      placeholder="Contoh: PT Surya Bhakti Persada / CV Jaya Abadi"
                      className="w-full p-2.5 text-xs border border-[#DCE0E6] rounded-lg bg-white outline-none focus:border-[#2980B9]"
                    />
                  </div>

                  {/* Konsultan Pengawas */}
                  <div>
                    <label className="text-xs font-semibold text-[#184C78] mb-1 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#184C78]" />
                      <span>Konsultan Pengawas / Supervisi</span>
                    </label>
                    <input
                      type="text"
                      value={newProjectForm.konsultan_pengawas}
                      onChange={(e) =>
                        setNewProjectForm({ ...newProjectForm, konsultan_pengawas: e.target.value })
                      }
                      placeholder="Contoh: CV Sinar Karya Konsultan"
                      className="w-full p-2.5 text-xs border border-[#DCE0E6] rounded-lg bg-white outline-none focus:border-[#2980B9]"
                    />
                  </div>

                  {/* Kepala Mandor / Site Manager */}
                  <div>
                    <label className="text-xs font-semibold text-[#184C78] mb-1 flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5 text-[#184C78]" />
                      <span>Kepala Mandor / Site Manager</span>
                    </label>
                    <input
                      type="text"
                      value={newProjectForm.kepala_mandor}
                      onChange={(e) =>
                        setNewProjectForm({ ...newProjectForm, kepala_mandor: e.target.value })
                      }
                      placeholder="Contoh: H. Suwandi (Site Manager) & Suprapto (Mandor)"
                      className="w-full p-2.5 text-xs border border-[#DCE0E6] rounded-lg bg-white outline-none focus:border-[#2980B9]"
                    />
                  </div>

                  {/* Nomor Kontrak LPSE */}
                  <div>
                    <label className="text-xs font-semibold text-[#184C78] mb-1 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-[#184C78]" />
                      <span>Nomor Kontrak LPSE</span>
                    </label>
                    <input
                      type="text"
                      value={newProjectForm.nomor_kontrak_lpse}
                      onChange={(e) =>
                        setNewProjectForm({ ...newProjectForm, nomor_kontrak_lpse: e.target.value })
                      }
                      placeholder="Contoh: 602/SPK-JLN/LAM-JLN-2026-003 (SiRUP-4728195)"
                      className="w-full p-2.5 font-mono text-xs border border-[#DCE0E6] rounded-lg bg-white outline-none focus:border-[#2980B9]"
                    />
                  </div>

                  {/* Sumber Pembiayaan */}
                  <div>
                    <label className="text-xs font-semibold text-[#184C78] mb-1 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-[#184C78]" />
                      <span>Sumber Pembiayaan</span>
                    </label>
                    <input
                      type="text"
                      value={newProjectForm.sumber_dana}
                      onChange={(e) =>
                        setNewProjectForm({ ...newProjectForm, sumber_dana: e.target.value })
                      }
                      placeholder="Contoh: APBD Kab. Lamongan (Alokasi Khusus JAMULA)"
                      className="w-full p-2.5 text-xs border border-[#DCE0E6] rounded-lg bg-white outline-none focus:border-[#2980B9]"
                    />
                  </div>
                </div>
              </div>

              {/* Titik Lokasi Peta & Koordinat Spasial (Diposisikan di atas Skala & Cakupan Wilayah) */}
              <div className="space-y-3">
                <LocationPickerMap
                  latitude={newProjectForm.latitude}
                  longitude={newProjectForm.longitude}
                  onChange={handleMapLocationChange}
                  kategori={newProjectForm.kategori}
                  wilayahName={newProjectForm.nama_wilayah}
                  desaName={newProjectForm.nama_desa}
                />

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
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        handleMapLocationChange({ lat: val, lng: newProjectForm.longitude });
                      }}
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
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        handleMapLocationChange({ lat: newProjectForm.latitude, lng: val });
                      }}
                      className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                    />
                  </div>
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
                    <span className="text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Sinkronisasi Otomatis dari Titik Peta
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

                          // Cari titik koordinat spasial desa tersebut agar peta otomatis bergeser
                          const desaCoords =
                            findCoordinatesByDesa(selId, newProjectForm.nama_wilayah) ||
                            findCoordinatesByDesa(selName, newProjectForm.nama_wilayah);

                          const newLat = desaCoords ? desaCoords[0] : newProjectForm.latitude;
                          const newLng = desaCoords ? desaCoords[1] : newProjectForm.longitude;

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
                            latitude: newLat,
                            longitude: newLng,
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
                      <h4 className="font-heading font-bold text-xs text-[#184C78]">
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
                    onChange={(e) => {
                      const newStatus = e.target.value as any;
                      setNewProjectForm({
                        ...newProjectForm,
                        status: newStatus,
                        progres_persen: newStatus === 'rencana' ? 0 : newProjectForm.progres_persen,
                      });
                    }}
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-lg bg-white outline-none focus:border-[#2980B9]"
                  >
                    <option value="rencana">Rencana (Proyek yang Akan Datang)</option>
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

              {/* Toggle Publikasikan ke Publik */}
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#184C78]" />
                    <span className="font-semibold text-slate-800 text-xs">Publikasikan ke Publik</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      newProjectForm.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {newProjectForm.is_published ? 'Publik' : 'Draft Internal'}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 leading-snug">
                    {newProjectForm.is_published
                      ? 'Proyek akan tampil di peta publik warga dan memicu sistem notifikasi early-warning.'
                      : 'Proyek tersimpan sebagai draft rahasia internal dinas, tidak memicu notifikasi massal ke warga.'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={newProjectForm.is_published}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, is_published: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#184C78]"></div>
                </label>
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
      {editingProject && (() => {
        const isProjectCompleted = editingProject.status === 'selesai' || editingProject.progres_persen >= 100;
        const editCode = getProjectEffectiveCode(editingProject);
        const editPin = getProjectEffectivePin(editingProject);

        return renderPortal(
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
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 id="modal-edit-project-title" className="font-heading text-base sm:text-lg font-bold leading-tight">
                          Sunting Data Proyek: {editingProject.nama_proyek}
                        </h3>
                        <span className="font-mono text-xs font-bold bg-white/20 px-2 py-0.5 rounded border border-white/30 text-white">
                          {editCode}
                        </span>
                      </div>
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

                    {/* Banner Proyek Selesai - Data Terkunci */}
                    {isProjectCompleted && (
                      <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-start gap-2.5">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-emerald-950 flex items-center gap-2">
                            <span>Proyek Berstatus Selesai (FHO / PHO)</span>
                            <span className="bg-emerald-100 text-emerald-800 font-mono text-[10px] px-2 py-0.5 rounded border border-emerald-300">
                              Data Inti Terkunci
                            </span>
                          </div>
                          <p className="text-emerald-800 text-[11px] mt-0.5 leading-relaxed">
                            Pagu anggaran, nama proyek, kategori sektor, dan jadwal pelaksanaan dikunci demi kepatuhan audit LPSE &amp; BPK RI karena proyek telah selesai 100%.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Bagian Kredensial Akses Penanggung Jawab Proyek (Request 3) */}
                    <div className="p-3.5 bg-gradient-to-r from-[#184C78]/5 via-[#184C78]/10 to-amber-500/10 border border-[#184C78]/20 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-[#184C78] text-xs">
                          <Key className="w-3.5 h-3.5 text-amber-600" />
                          <span>Kredensial Login Penanggung Jawab Proyek (PJ)</span>
                        </div>
                        <span className="text-[10px] text-[#184C78] bg-[#EBF4FB] px-2 py-0.5 rounded-full font-semibold border border-[#c5def2]">
                          Akses Khusus Dinas &amp; Rekanan
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Kombinasi Kode Proyek dan Password / PIN ini digunakan oleh pihak penanggung jawab untuk login pada Portal Penanggung Jawab Proyek.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                          <div>
                            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Kode Proyek</div>
                            <div className="font-mono font-bold text-xs text-[#184C78] mt-0.5">{editCode}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyText(editCode, `Kode Proyek ${editCode}`)}
                            className="px-2 py-1 text-[11px] font-semibold text-[#184C78] bg-[#EBF4FB] hover:bg-[#d8eaf7] border border-[#c5def2] rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                            title="Salin Kode Proyek"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Salin</span>
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-amber-200 shadow-2xs">
                          <div>
                            <div className="text-[10px] text-amber-800 font-semibold uppercase tracking-wider flex items-center gap-1">
                              <Lock className="w-3 h-3 text-amber-600" />
                              <span>Password / Kunci Akses (PIN PJ)</span>
                            </div>
                            <div className="font-mono font-bold text-xs text-amber-900 mt-0.5">{editPin}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyText(editPin, `Password PJ ${editPin}`)}
                            className="px-2 py-1 text-[11px] font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                            title="Salin Password Akses Penanggung Jawab"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Salin</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bagian Pihak & Tim Penanggung Jawab Proyek Sesuai Peta */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                          <Building2 className="w-3.5 h-3.5 text-[#184C78]" />
                          <span>Pihak &amp; Tim Penanggung Jawab Proyek (Sesuai LPSE di Peta)</span>
                        </div>
                        <span className="text-[10px] bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-300 font-mono font-bold">
                          Transparansi LPSE
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-slate-600 font-semibold mb-1 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-[#184C78]" />
                            <span>Instansi Pengampu (Dinas Penanggung Jawab)</span>
                          </label>
                          <select
                            disabled={isProjectCompleted}
                            value={editForm.dinas_id}
                            onChange={(e) => {
                              const selId = Number(e.target.value);
                              const selDinas = DAFTAR_DINAS_LAMONGAN.find((d) => d.id === selId);
                              setEditForm({
                                ...editForm,
                                dinas_id: selId,
                                nama_dinas: selDinas ? selDinas.nama : editForm.nama_dinas,
                              });
                            }}
                            className={`w-full p-2 text-xs border rounded-lg outline-none font-medium ${
                              isProjectCompleted ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white border-[#DCE0E6] focus:border-[#2980B9]'
                            }`}
                          >
                            {DAFTAR_DINAS_LAMONGAN.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.nama}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-600 font-semibold mb-1 flex items-center gap-1">
                            <User className="w-3 h-3 text-[#184C78]" />
                            <span>Pejabat Pembuat Komitmen (PPK)</span>
                          </label>
                          <input
                            type="text"
                            disabled={isProjectCompleted}
                            value={editForm.pejabat_pembuat_komitmen}
                            onChange={(e) => setEditForm({ ...editForm, pejabat_pembuat_komitmen: e.target.value })}
                            placeholder="Contoh: Dwi Prasetyo, S.T. (Dinas PRKPCK)"
                            className={`w-full p-2 text-xs border rounded-lg outline-none ${
                              isProjectCompleted ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white border-[#DCE0E6] focus:border-[#2980B9]'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-600 font-semibold mb-1 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-[#184C78]" />
                            <span>Kontraktor Pelaksana</span>
                          </label>
                          <input
                            type="text"
                            disabled={isProjectCompleted}
                            value={editForm.kontraktor_pelaksana}
                            onChange={(e) => setEditForm({ ...editForm, kontraktor_pelaksana: e.target.value })}
                            placeholder="Contoh: CV Jaya Abadi Konstruksi"
                            className={`w-full p-2 text-xs border rounded-lg outline-none ${
                              isProjectCompleted ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white border-[#DCE0E6] focus:border-[#2980B9]'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-600 font-semibold mb-1 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-[#184C78]" />
                            <span>Konsultan Pengawas</span>
                          </label>
                          <input
                            type="text"
                            disabled={isProjectCompleted}
                            value={editForm.konsultan_pengawas}
                            onChange={(e) => setEditForm({ ...editForm, konsultan_pengawas: e.target.value })}
                            placeholder="Contoh: CV Multi Rekayasa Graha"
                            className={`w-full p-2 text-xs border rounded-lg outline-none ${
                              isProjectCompleted ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white border-[#DCE0E6] focus:border-[#2980B9]'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-600 font-semibold mb-1 flex items-center gap-1">
                            <Wrench className="w-3 h-3 text-[#184C78]" />
                            <span>Kepala Mandor / Site Manager</span>
                          </label>
                          <input
                            type="text"
                            disabled={isProjectCompleted}
                            value={editForm.kepala_mandor}
                            onChange={(e) => setEditForm({ ...editForm, kepala_mandor: e.target.value })}
                            placeholder="Contoh: Budi Hermawan & Suharno"
                            className={`w-full p-2 text-xs border rounded-lg outline-none ${
                              isProjectCompleted ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white border-[#DCE0E6] focus:border-[#2980B9]'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-600 font-semibold mb-1 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-[#184C78]" />
                            <span>Nomor Kontrak LPSE</span>
                          </label>
                          <input
                            type="text"
                            disabled={isProjectCompleted}
                            value={editForm.nomor_kontrak_lpse}
                            onChange={(e) => setEditForm({ ...editForm, nomor_kontrak_lpse: e.target.value })}
                            placeholder="Contoh: 640/SPK-DRA/LAM-DRA-2026-004 (SiRUP-6502849)"
                            className={`w-full p-2 font-mono text-xs border rounded-lg outline-none ${
                              isProjectCompleted ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white border-[#DCE0E6] focus:border-[#2980B9]'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-600 font-semibold mb-1 flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-[#184C78]" />
                            <span>Sumber Pembiayaan</span>
                          </label>
                          <input
                            type="text"
                            disabled={isProjectCompleted}
                            value={editForm.sumber_dana}
                            onChange={(e) => setEditForm({ ...editForm, sumber_dana: e.target.value })}
                            placeholder="Contoh: APBD Kab. Lamongan (Drainase Perkotaan)"
                            className={`w-full p-2 text-xs border rounded-lg outline-none ${
                              isProjectCompleted ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white border-[#DCE0E6] focus:border-[#2980B9]'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Field Nama Proyek */}
                    <div>
                      <label htmlFor="edit_nama_proyek" className="block font-semibold text-[#184C78] mb-1">
                        Nama Proyek {isProjectCompleted && <span className="text-xs font-normal text-slate-500">(Terkunci - Proyek Selesai)</span>}
                      </label>
                      <input
                        id="edit_nama_proyek"
                        type="text"
                        required
                        disabled={isProjectCompleted}
                        value={editForm.nama_proyek}
                        onChange={(e) => setEditForm({ ...editForm, nama_proyek: e.target.value })}
                        className={`w-full p-2.5 border rounded-lg outline-none transition-colors ${
                          isProjectCompleted
                            ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed select-none'
                            : 'border-[#DCE0E6] focus:border-[#2980B9]'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="edit_kategori" className="block font-semibold text-[#184C78] mb-1">
                          Kategori Sektor {isProjectCompleted && <span className="text-xs font-normal text-slate-500">(Terkunci)</span>}
                        </label>
                        <select
                          id="edit_kategori"
                          disabled={isProjectCompleted}
                          value={editForm.kategori}
                          onChange={(e) => setEditForm({ ...editForm, kategori: e.target.value as ProyekKategori })}
                          className={`w-full p-2.5 border rounded-lg outline-none transition-colors ${
                            isProjectCompleted
                              ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                              : 'bg-white border-[#DCE0E6] focus:border-[#2980B9]'
                          }`}
                        >
                          <option value="jalan">Jalan &amp; Jembatan</option>
                          <option value="taman">Taman &amp; Lanskap</option>
                          <option value="drainase">Drainase &amp; Saluran Air</option>
                          <option value="fasilitas">Fasilitas Publik</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="edit_anggaran" className="block font-semibold text-[#184C78] mb-1">
                          Pagu Anggaran (Rp) {isProjectCompleted && <span className="text-xs font-normal text-slate-500">(Terkunci - Kepatuhan Audit)</span>}
                        </label>
                        <input
                          id="edit_anggaran"
                          type="number"
                          required
                          min={0}
                          disabled={isProjectCompleted}
                          value={editForm.anggaran}
                          onChange={(e) => setEditForm({ ...editForm, anggaran: Number(e.target.value) })}
                          className={`w-full p-2.5 border rounded-lg font-mono outline-none transition-colors ${
                            isProjectCompleted
                              ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed select-none'
                              : 'border-[#DCE0E6] focus:border-[#2980B9]'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="edit_tanggal_mulai" className="block font-semibold text-[#184C78] mb-1">
                          Tanggal Mulai {isProjectCompleted && <span className="text-xs font-normal text-slate-500">(Terkunci)</span>}
                        </label>
                        <input
                          id="edit_tanggal_mulai"
                          type="date"
                          required
                          disabled={isProjectCompleted}
                          value={editForm.tanggal_mulai}
                          onChange={(e) => setEditForm({ ...editForm, tanggal_mulai: e.target.value })}
                          className={`w-full p-2.5 border rounded-lg outline-none transition-colors ${
                            isProjectCompleted
                              ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed select-none'
                              : 'border-[#DCE0E6] focus:border-[#2980B9]'
                          }`}
                        />
                      </div>

                      <div>
                        <label htmlFor="edit_estimasi_selesai" className="block font-semibold text-[#184C78] mb-1">
                          Estimasi Selesai {isProjectCompleted && <span className="text-xs font-normal text-slate-500">(Terkunci)</span>}
                        </label>
                        <input
                          id="edit_estimasi_selesai"
                          type="date"
                          required
                          disabled={isProjectCompleted}
                          value={editForm.estimasi_selesai}
                          onChange={(e) => setEditForm({ ...editForm, estimasi_selesai: e.target.value })}
                          className={`w-full p-2.5 border rounded-lg outline-none transition-colors ${
                            isProjectCompleted
                              ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed select-none'
                              : 'border-[#DCE0E6] focus:border-[#2980B9]'
                          }`}
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
                          disabled={isProjectCompleted}
                          value={editForm.progres_persen}
                          onChange={(e) => setEditForm({ ...editForm, progres_persen: Number(e.target.value) })}
                          className={`w-full p-2.5 border rounded-lg outline-none transition-colors ${
                            isProjectCompleted
                              ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed select-none'
                              : 'border-[#DCE0E6] focus:border-[#2980B9]'
                          }`}
                        />
                      </div>

                      <div>
                        <label htmlFor="edit_status" className="block font-semibold text-[#184C78] mb-1">Status Proyek</label>
                        <select
                          id="edit_status"
                          disabled={isProjectCompleted}
                          value={editForm.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as ProyekStatus;
                            setEditForm({
                              ...editForm,
                              status: newStatus,
                              progres_persen: newStatus === 'rencana' ? 0 : editForm.progres_persen,
                            });
                          }}
                          className={`w-full p-2.5 border rounded-lg outline-none transition-colors ${
                            isProjectCompleted
                              ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                              : 'bg-white border-[#DCE0E6] focus:border-[#2980B9]'
                          }`}
                        >
                          <option value="rencana">Rencana (Proyek yang Akan Datang)</option>
                          <option value="berjalan">Sedang Berjalan</option>
                          <option value="selesai">Selesai (FHO)</option>
                          <option value="ditangguhkan">Ditangguhkan / Tertunda</option>
                        </select>
                      </div>
                    </div>

                    {/* Peringatan & Field Wajib jika Progres Menurun (Aturan PRD 10.1) */}
                    {!isProjectCompleted && editForm.progres_persen < editingProject.progres_persen && (
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

                    {/* Seksi Upload Foto Utama / Banner Proyek */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-[#184C78] text-xs">
                          <Camera className="w-4 h-4 text-[#184C78]" />
                          <span>Upload Foto Utama / Banner Proyek</span>
                        </div>
                        <span className="text-[10px] text-[#184C78] bg-[#EBF4FB] px-2 py-0.5 rounded-full font-semibold border border-[#c5def2]">
                          Tampil di Peta Spasial
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Foto ini digunakan sebagai banner dokumentasi saat proyek diklik pada peta spasial. Jika belum diunggah, peta akan menampilkan placeholder dokumentasi belum diunggah.
                      </p>

                      <input
                        type="file"
                        ref={editPhotoInputRef}
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={handleEditPhotoSelect}
                        className="hidden"
                      />

                      {editForm.foto_url ? (
                        <div className="space-y-2">
                          <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-xs h-36 bg-slate-900 group">
                            <img
                              src={editForm.foto_url}
                              alt="Pratinjau Foto Proyek"
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                            />
                            <div className="absolute top-2 left-2 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                              <Check className="w-3 h-3" />
                              <span>Foto Siap Ditampilkan di Peta</span>
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => editPhotoInputRef.current?.click()}
                                className="px-3 py-1.5 bg-white text-[#184C78] text-xs font-bold rounded-lg shadow hover:bg-slate-100 transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Ganti Foto</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleRemoveEditPhoto}
                                className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg shadow hover:bg-red-700 transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus</span>
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="flex items-center gap-1 text-emerald-700 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Foto siap disimpan. Klik "Simpan Perubahan" untuk memperbarui visual di peta.
                            </span>
                            <button
                              type="button"
                              onClick={handleRemoveEditPhoto}
                              className="text-red-600 hover:text-red-700 font-semibold hover:underline cursor-pointer"
                            >
                              Hapus Foto
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => editPhotoInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-300 hover:border-[#184C78] bg-white hover:bg-slate-50/80 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#EBF4FB] text-[#184C78] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                            <Camera className="w-5 h-5" />
                          </div>
                          <div className="font-bold text-xs text-slate-700 group-hover:text-[#184C78] transition-colors">
                            Pilih &amp; Unggah Foto Dokumentasi Lapangan
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Format JPG, PNG, atau WebP (Maksimal 8 MB)
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Toggle Publikasikan ke Publik */}
                    <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-[#184C78]" />
                          <span className="font-semibold text-slate-800 text-xs">Publikasikan ke Publik</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            editForm.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {editForm.is_published ? 'Publik' : 'Draft Internal'}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 leading-snug">
                          {editForm.is_published
                            ? 'Proyek tampil di peta publik warga dan Early Warning aktif.'
                            : 'Proyek disembunyikan sebagai draft internal dinas.'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={editForm.is_published}
                          onChange={(e) => setEditForm({ ...editForm, is_published: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#184C78]"></div>
                      </label>
                    </div>
                  </div>

                  {/* Sticky Responsive Footer */}
                  <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-2.5 shrink-0">
                    <div>
                      {currentUser.role !== 'penanggung_jawab' && (
                        <button
                          type="button"
                          onClick={() => setIsDeleteConfirmOpen(true)}
                          className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          title="Hapus Proyek Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          <span>Hapus Proyek</span>
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
                      <button
                        type="button"
                        onClick={() => setEditingProject(null)}
                        className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-center"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingEdit || isProjectCompleted}
                        className={`w-full sm:w-auto btn-primary !h-9 text-xs flex items-center justify-center gap-1.5 ${
                          isProjectCompleted ? '!bg-slate-300 !border-slate-300 !text-slate-500 cursor-not-allowed' : ''
                        }`}
                        title={isProjectCompleted ? 'Data proyek selesai dikunci demi integritas audit' : 'Simpan Perubahan'}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isProjectCompleted ? 'Data Dikunci (Audit-Lock)' : (isSubmittingEdit ? 'Menyimpan...' : 'Simpan Perubahan')}</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── MODAL KONFIRMASI HAPUS PROYEK ── */}
      {isDeleteConfirmOpen && editingProject && renderPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[10000] overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsDeleteConfirmOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-red-200 p-6 text-left space-y-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-base text-slate-900 leading-tight">
                  Konfirmasi Hapus Proyek
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tindakan ini permanen dan tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-red-50/70 border border-red-100 rounded-xl space-y-1.5 text-xs text-red-900">
              <p className="font-semibold text-red-950">
                Apakah Anda yakin ingin menghapus proyek ini?
              </p>
              <p className="font-mono font-bold text-[#184C78]">
                [{getProjectEffectiveCode(editingProject)}] {editingProject.nama_proyek}
              </p>
              <p className="text-[11px] text-red-700">
                Seluruh data tahapan linimasa, dokumentasi pengerjaan, dan riwayat laporan warga terkait proyek ini akan ikut terhapus dari sistem.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={isDeletingProject}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteProject}
                disabled={isDeletingProject}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeletingProject ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Hapus Proyek</span>
                  </>
                )}
              </button>
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
                    <h3 id="modal-stage-title" className="font-heading text-base sm:text-lg font-bold leading-tight">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#184C78] mb-1">Status Pengerjaan</label>
                  <select
                    value={newStageForm.status}
                    onChange={(e) => setNewStageForm({ ...newStageForm, status: e.target.value as any })}
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-lg bg-white outline-none focus:border-[#2980B9]"
                  >
                    <option value="belum_mulai">Belum Mulai (Rencana)</option>
                    <option value="sedang_berjalan">Sedang Berjalan</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#184C78] mb-1">Target Capaian Progres (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newStageForm.persentase_bobot}
                    onChange={(e) => setNewStageForm({ ...newStageForm, persentase_bobot: Number(e.target.value) })}
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                  />
                </div>
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

      {/* ── MODAL: EDIT TAHAPAN LINIMASA ── */}
      {editingStage && renderPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-edit-stage-title"
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/65 backdrop-blur-xs animate-fade-in"
          onClick={() => setEditingStage(null)}
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
                    <Edit3 className="w-4 h-4 text-cyan-300" />
                  </div>
                  <div>
                    <h3 id="modal-edit-stage-title" className="font-heading text-base sm:text-lg font-bold leading-tight">
                      Edit Tahapan Linimasa (Tahap {editingStage.nomor_tahap})
                    </h3>
                    <p className="text-[11px] sm:text-xs text-white/80 mt-0.5 leading-tight">
                      Perbarui rincian capaian, status pengerjaan fisik, dan catatan lapangan proyek.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingStage(null)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-3"
                  title="Tutup Modal"
                  aria-label="Tutup Modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleUpdateTimelineStage} className="flex flex-col flex-1 overflow-hidden min-h-0">
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs scrollbar-thin">
                  <div>
                    <label className="block font-semibold text-[#184C78] mb-1">Nama Tahapan</label>
                    <input
                      type="text"
                      required
                      value={editStageForm.nama_tahap}
                      onChange={(e) => setEditStageForm({ ...editStageForm, nama_tahap: e.target.value })}
                      className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#184C78] mb-1">Status Pengerjaan</label>
                      <select
                        value={editStageForm.status}
                        onChange={(e) => setEditStageForm({ ...editStageForm, status: e.target.value as any })}
                        className="w-full p-2.5 border border-[#DCE0E6] rounded-lg bg-white outline-none focus:border-[#2980B9] font-medium"
                      >
                        <option value="belum_mulai">Belum Mulai</option>
                        <option value="sedang_berjalan">Sedang Berjalan</option>
                        <option value="selesai">Selesai (100%)</option>
                        <option value="tertunda">Tertunda (Kendala)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-[#184C78] mb-1">Bobot Tahap (%)</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        required
                        value={editStageForm.persentase_bobot}
                        onChange={(e) => setEditStageForm({ ...editStageForm, persentase_bobot: Number(e.target.value) })}
                        className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#184C78] mb-1">Target Mulai</label>
                      <input
                        type="date"
                        value={editStageForm.target_mulai}
                        onChange={(e) => setEditStageForm({ ...editStageForm, target_mulai: e.target.value })}
                        className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#184C78] mb-1">Target Selesai</label>
                      <input
                        type="date"
                        value={editStageForm.target_selesai}
                        onChange={(e) => setEditStageForm({ ...editStageForm, target_selesai: e.target.value })}
                        className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#184C78] mb-1">Realisasi Mulai (Opsional)</label>
                      <input
                        type="date"
                        value={editStageForm.realisasi_mulai}
                        onChange={(e) => setEditStageForm({ ...editStageForm, realisasi_mulai: e.target.value })}
                        className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#184C78] mb-1">Realisasi Selesai (Opsional)</label>
                      <input
                        type="date"
                        value={editStageForm.realisasi_selesai}
                        onChange={(e) => setEditStageForm({ ...editStageForm, realisasi_selesai: e.target.value })}
                        className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#184C78] mb-1">Uraian Teknis Tahapan</label>
                    <textarea
                      rows={3}
                      value={editStageForm.deskripsi}
                      onChange={(e) => setEditStageForm({ ...editStageForm, deskripsi: e.target.value })}
                      className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                      placeholder="Uraian rincian pekerjaan teknis yang dilaksanakan..."
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#184C78] mb-1">Catatan Pengawas &amp; Progres Lapangan</label>
                    <textarea
                      rows={2}
                      value={editStageForm.catatan_lapangan}
                      onChange={(e) => setEditStageForm({ ...editStageForm, catatan_lapangan: e.target.value })}
                      className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                      placeholder="Contoh: Pekerjaan pondasi telah tuntas 100%, siap lanjut ke tahap berikutnya."
                    />
                  </div>
                </div>

                {/* Sticky Responsive Footer */}
                <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingStage(null)}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-center"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto btn-primary !h-9 text-xs flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Simpan Perubahan Tahapan</span>
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
                    <h3 id="modal-doc-title" className="font-heading text-base sm:text-lg font-bold leading-tight">
                      Upload Bukti Dokumentasi Fisik
                    </h3>
                    <p className="text-[11px] sm:text-xs text-white/80 mt-0.5 leading-tight">
                      Unggah dokumentasi foto lapangan atau video drone untuk transparansi progres proyek.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsNewDocModalOpen(false);
                    handleClearDocFile();
                  }}
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
                          [{getProjectEffectiveCode(p)}] {p.nama_proyek}
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

                  {/* Pilihan Metode Sumber Berkas */}
                  <div>
                    <label className="block font-semibold text-[#184C78] mb-1.5">
                      Sumber Berkas Dokumentasi
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-[#F5F7FA] rounded-xl border border-[#DCE0E6]">
                      <button
                        type="button"
                        onClick={() => {
                          setDocUploadMode('file');
                          setDocFileError(null);
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          docUploadMode === 'file'
                            ? 'bg-[#184C78] text-white shadow-xs'
                            : 'text-[#6C757D] hover:text-[#184C78] hover:bg-white/60'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Penyimpanan Perangkat</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDocUploadMode('url');
                          setDocFileError(null);
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          docUploadMode === 'url'
                            ? 'bg-[#184C78] text-white shadow-xs'
                            : 'text-[#6C757D] hover:text-[#184C78] hover:bg-white/60'
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Tautan / URL Web</span>
                      </button>
                    </div>
                  </div>

                  {/* Mode 1: Upload dari Penyimpanan Eksternal / Perangkat */}
                  {docUploadMode === 'file' ? (
                    <div>
                      <input
                        ref={docFileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleDocFileSelect(file);
                        }}
                      />

                      {!docFilePreview ? (
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDocDragging(true);
                          }}
                          onDragLeave={() => setIsDocDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDocDragging(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleDocFileSelect(file);
                          }}
                          onClick={() => docFileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                            isDocDragging
                              ? 'border-[#2980B9] bg-[#EBF4FB]'
                              : 'border-[#BDD7EE] bg-[#F8FAFC] hover:border-[#2980B9] hover:bg-[#F0F7FD]'
                          }`}
                        >
                          <div className="w-12 h-12 mx-auto rounded-full bg-[#EBF4FB] text-[#2980B9] flex items-center justify-center mb-2.5">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div className="font-bold text-sm text-[#184C78]">
                            Pilih Foto Lapangan atau Video Drone
                          </div>
                          <p className="text-[11px] text-[#6C757D] mt-1 max-w-sm mx-auto leading-relaxed">
                            Klik untuk mencari berkas dari memori / penyimpanan perangkat Anda, atau tarik &amp; lepaskan berkas ke sini.
                          </p>
                          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#184C78] border border-blue-200 text-[10px] font-semibold">
                              <ImageIcon className="w-3 h-3 text-[#2980B9]" />
                              <span>Foto: JPG, PNG, WebP</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-semibold">
                              <Film className="w-3 h-3 text-purple-600" />
                              <span>Video: MP4, WebM, MOV</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium font-mono">Maks. 50MB</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#BDD7EE] space-y-2.5 animate-fade-in">
                          {/* Media Preview Box */}
                          <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center max-h-56">
                            {newDocForm.tipe_file === 'video' || docFilePreview.startsWith('data:video/') ? (
                              <video
                                src={docFilePreview}
                                controls
                                className="w-full max-h-56 object-contain"
                              />
                            ) : (
                              <img
                                src={docFilePreview}
                                alt="Pratinjau Berkas Dokumentasi"
                                className="w-full max-h-56 object-contain bg-slate-100"
                              />
                            )}
                            <div className="absolute top-2 left-2 flex items-center gap-1.5 pointer-events-none">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/75 text-white backdrop-blur-xs">
                                {newDocForm.tipe_file === 'video' ? (
                                  <>
                                    <Film className="w-3 h-3 text-cyan-300" />
                                    <span>Video Rekaman / Drone</span>
                                  </>
                                ) : (
                                  <>
                                    <ImageIcon className="w-3 h-3 text-emerald-300" />
                                    <span>Foto Lapangan</span>
                                  </>
                                )}
                              </span>
                            </div>
                          </div>

                          {/* File info and change buttons */}
                          <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
                            <div className="min-w-0">
                              <div className="font-bold text-[#184C78] truncate">
                                {selectedDocFile?.name || 'Berkas Terpilih'}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {selectedDocFile
                                  ? `${(selectedDocFile.size / (1024 * 1024)).toFixed(2)} MB • ${selectedDocFile.type || 'Media'}`
                                  : 'Media Siap Diunggah'}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => docFileInputRef.current?.click()}
                                className="px-2.5 py-1 text-[11px] font-semibold text-[#184C78] bg-white border border-[#DCE0E6] hover:bg-[#EBF4FB] rounded-lg transition-colors cursor-pointer"
                              >
                                Ganti Berkas
                              </button>
                              <button
                                type="button"
                                onClick={handleClearDocFile}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Berkas"
                                aria-label="Hapus Berkas"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {docFileError && (
                        <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>{docFileError}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Mode 2: Input Tautan / URL Web */
                    <div>
                      <label className="block font-semibold text-[#184C78] mb-1">
                        URL Foto Bukti / Berkas File
                      </label>
                      <input
                        type="url"
                        placeholder="https://... tautan berkas foto atau video online"
                        value={newDocForm.foto_url}
                        onChange={(e) => {
                          const val = e.target.value;
                          const isVid = /\.(mp4|mov|webm|avi)(\?|$)/i.test(val);
                          setNewDocForm({
                            ...newDocForm,
                            foto_url: val,
                            tipe_file: isVid ? 'video' : 'foto',
                          });
                        }}
                        className="w-full p-2.5 border border-[#DCE0E6] rounded-xl outline-none focus:border-[#2980B9] text-xs"
                      />
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-400">Contoh Cepat:</span>
                        <button
                          type="button"
                          onClick={() =>
                            setNewDocForm({
                              ...newDocForm,
                              foto_url:
                                'https://images.unsplash.com/photo-1541888946425-d0fbb18fe111?w=800',
                              tipe_file: 'foto',
                            })
                          }
                          className="text-[10px] text-[#2980B9] hover:underline cursor-pointer"
                        >
                          [Foto Aspal]
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setNewDocForm({
                              ...newDocForm,
                              foto_url:
                                'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=800',
                              tipe_file: 'foto',
                            })
                          }
                          className="text-[10px] text-[#2980B9] hover:underline cursor-pointer"
                        >
                          [Foto Beton]
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setNewDocForm({
                              ...newDocForm,
                              foto_url:
                                'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800',
                              tipe_file: 'foto',
                            })
                          }
                          className="text-[10px] text-[#2980B9] hover:underline cursor-pointer"
                        >
                          [Foto Drainase]
                        </button>
                      </div>
                      {docFileError && (
                        <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>{docFileError}</span>
                        </div>
                      )}
                    </div>
                  )}

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
                    onClick={() => {
                      setIsNewDocModalOpen(false);
                      handleClearDocFile();
                    }}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-center"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingDoc}
                    className="w-full sm:w-auto btn-primary !h-9 text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isSubmittingDoc ? 'Mengunggah...' : 'Unggah Sekarang'}</span>
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
                      <h3 id="modal-verify-title" className="font-heading text-base sm:text-lg font-bold leading-tight text-white mt-0.5">
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

      {/* ── MODAL: RESPON & TANGGAPAN RESMI ADUAN WARGA ── */}
      {selectedAduanToReply &&
        renderPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-reply-aduan-title"
            className="fixed inset-0 z-[9999] overflow-y-auto bg-black/65 backdrop-blur-xs animate-fade-in"
            onClick={() => setSelectedAduanToReply(null)}
          >
            <div className="flex min-h-full items-center justify-center p-2.5 sm:p-4 md:p-6 text-center">
              <div
                className="relative w-full max-w-2xl sm:max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col text-left border border-[#DCE0E6] my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#184C78] to-[#1F5F94] text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
                      <MessageSquare className="w-4 h-4 text-cyan-300" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold text-white bg-white/15 px-2 py-0.5 rounded border border-white/20">
                          #ADUAN-{selectedAduanToReply.id}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-400/20 text-slate-200 border-white/20">
                          {selectedAduanToReply.status === 'selesai'
                            ? 'Selesai & Ditanggapi'
                            : selectedAduanToReply.status === 'diproses'
                            ? 'Sedang Ditindaklanjuti'
                            : 'Menunggu Telaah Dinas'}
                        </span>
                      </div>
                      <h3
                        id="modal-reply-aduan-title"
                        className="font-heading text-base sm:text-lg font-bold leading-tight text-white mt-0.5 truncate"
                      >
                        Respon &amp; Tanggapan Resmi Aduan Warga
                      </h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAduanToReply(null)}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-3"
                    title="Tutup Modal"
                    aria-label="Tutup Modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmitReplyAduan} className="flex flex-col flex-1 overflow-hidden min-h-0">
                  <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs scrollbar-thin">
                    {replySuccessMessage && (
                      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{replySuccessMessage}</span>
                      </div>
                    )}
                    {replyError && (
                      <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{replyError}</span>
                      </div>
                    )}

                    {/* Report Details */}
                    <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#DCE0E6] space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCE0E6] pb-2.5">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D]">
                            Proyek Pembangunan Terkait:
                          </span>
                          <div className="font-heading font-bold text-sm text-[#184C78] mt-0.5">
                            {selectedAduanToReply.nama_proyek}
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-[#2980B9] bg-[#EBF4FB] px-2.5 py-1 rounded-lg border border-[#c5def2] self-start sm:self-auto">
                          {selectedAduanToReply.kategori_aduan || 'Pengaduan Teknis Lapangan'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6C757D]">
                        <div className="flex items-center gap-1.5 font-medium">
                          <User className="w-3.5 h-3.5 text-[#2980B9]" />
                          <span>
                            Pelapor: <strong>{selectedAduanToReply.nama_pelapor || 'Warga Masyarakat'}</strong>{' '}
                            ({selectedAduanToReply.email_pelapor || 'budi.santoso@civictrack.demo'})
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{selectedAduanToReply.tanggal_lapor}</span>
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-[#DCE0E6] space-y-1">
                        <div className="font-bold text-[#212529] text-xs">{selectedAduanToReply.judul}</div>
                        <p className="text-slate-700 leading-relaxed italic whitespace-pre-wrap">
                          "{selectedAduanToReply.isi_laporan}"
                        </p>
                      </div>
                    </div>

                    {/* Existing response if present */}
                    {selectedAduanToReply.tanggapan_dinas && (
                      <div className="p-3.5 bg-[#EBF4FB] rounded-xl border border-[#c5def2] space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-[#184C78] text-xs">
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Tanggapan Resmi yang Sedang Aktif:</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 font-normal">
                            {selectedAduanToReply.tanggal_tanggapan || selectedAduanToReply.tanggal_lapor}
                          </span>
                        </div>
                        <p className="text-slate-800 leading-relaxed whitespace-pre-wrap bg-white/70 p-2.5 rounded-lg border border-[#c5def2]/60">
                          {selectedAduanToReply.tanggapan_dinas}
                        </p>
                      </div>
                    )}

                    {/* Template Buttons */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#6C757D] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#2980B9]" />
                        <span>Pilihan Template Tanggapan Cepat:</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {TEMPLATE_TANGGAPAN.map((tpl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setReplyText(tpl.text)}
                            className="p-2.5 text-left rounded-xl bg-[#F5F7FA] hover:bg-[#EBF4FB] border border-[#DCE0E6] hover:border-[#2980B9] transition-all cursor-pointer group"
                          >
                            <div className="font-bold text-[#184C78] text-[11px] group-hover:text-[#2980B9] flex items-center justify-between">
                              <span>{tpl.label}</span>
                              <span className="text-[10px] text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                Gunakan ➔
                              </span>
                            </div>
                            <p className="text-[10.5px] text-[#6C757D] line-clamp-2 mt-0.5 leading-snug">
                              {tpl.text}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Status Selector */}
                    <div>
                      <label className="block font-semibold text-[#184C78] mb-1.5">
                        Pilih Status Tindak Lanjut Aduan:
                      </label>
                      <select
                        value={replyStatus}
                        onChange={(e) => setReplyStatus(e.target.value as 'diproses' | 'selesai')}
                        className="w-full p-2.5 border border-[#DCE0E6] rounded-xl bg-white outline-none focus:border-[#2980B9] font-semibold text-xs"
                      >
                        <option value="diproses">🟡 Sedang Ditindaklanjuti Tim Lapangan &amp; Kontraktor</option>
                        <option value="selesai">🟢 Tindak Lanjut Selesai / Rampung Sempurna</option>
                      </select>
                    </div>

                    {/* Response Textarea */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block font-semibold text-[#184C78]">
                          Uraian Tanggapan &amp; Tindakan Konkret Dinas:
                        </label>
                        <span className="text-[11px] text-[#6C757D] font-mono">
                          {replyText.length}/2000 Karakter
                        </span>
                      </div>
                      <textarea
                        rows={5}
                        required
                        placeholder="Tuliskan tindakan konkret yang telah atau sedang diambil oleh dinas teknis..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full p-3 border border-[#DCE0E6] rounded-xl outline-none focus:border-[#2980B9] leading-relaxed text-xs"
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 sm:p-5 bg-[#F5F7FA] border-t border-[#DCE0E6] flex flex-col-reverse sm:flex-row items-center justify-between gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedAduanToReply(null)}
                      className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-[#DCE0E6] text-[#495057] hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Batal / Tutup
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReply || !replyText.trim()}
                      className="w-full sm:w-auto btn-primary !h-9 text-xs flex items-center justify-center gap-1.5 px-5 disabled:opacity-60 cursor-pointer shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingReply ? 'Mempublikasikan...' : 'Publikasikan Tanggapan Resmi'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      {/* ── KONTEN UTAMA DASHBOARD ── */}
      <div className="space-y-6">
      {/* ── TOP PENANGGUNG JAWAB PROYEK BANNER ── */}
      <div className="bg-gradient-to-r from-[#0f3252] via-[#184C78] to-[#1a6fa8] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
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
            {currentUser.role !== 'penanggung_jawab' && (
              <button
                onClick={handleOpenNewProjectModal}
                className="px-4 py-2.5 bg-white text-[#184C78] font-bold text-xs rounded-xl shadow-xs hover:bg-slate-100 flex items-center justify-center gap-2 transition-transform hover:scale-102 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#184C78]" />
                <span>Input Proyek Baru</span>
              </button>
            )}
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

      {/* ── ACTIVE SECTION VIEW (DRIVEN BY SIDEBAR) ── */}
      {/* ── SECTION 1: DAFTAR PROYEK DINAS / KELOLA DATA PROYEK ── */}
      {(activeTab === 'proyek' || activeTab === 'overview' || !['linimasa', 'dokumentasi', 'aduan', 'evaluasi'].includes(activeTab)) && (
        <div className="space-y-4">
          {/* ── SPATIAL MINIMAP OVERVIEW WIDGET (GIS PREVIEW) - KHUSUS HALAMAN KELOLA DATA PROYEK ── */}
          {onOpenMapExplorer && (
            <MiniMapOverview
              projects={projects}
              onOpenMapExplorer={onOpenMapExplorer}
            />
          )}

          {/* ── METRICS OVERVIEW - KHUSUS HALAMAN KELOLA DATA PROYEK ── */}
          {currentUser.role === 'penanggung_jawab' && unlockedProject ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Card 1: Pagu Anggaran Proyek (Disesuaikan khusus 1 proyek yang dipegang) */}
              <div className="bg-white p-4 rounded-2xl border border-[#DCE0E6] shadow-xs">
                <div className="text-xs text-[#6C757D] font-medium flex items-center justify-between">
                  <span>Pagu Anggaran</span>
                  <DollarSign className="w-4 h-4 text-[#2980B9]" />
                </div>
                <div className="text-2xl font-heading font-extrabold text-[#212529] mt-1.5">
                  {Number(unlockedProject.anggaran || 0) >= 1000000000
                    ? `Rp ${(Number(unlockedProject.anggaran || 0) / 1000000000).toFixed(1).replace(/\.0$/, '')}M`
                    : `Rp ${(Number(unlockedProject.anggaran || 0) / 1000000).toFixed(0)} Jt`}
                </div>
                <div className="text-[11px] text-[#2980B9] font-semibold mt-1">
                  Total Kontrak: Rp {Number(unlockedProject.anggaran || 0).toLocaleString('id-ID')}
                </div>
              </div>

              {/* Card 2: Realisasi Fisik Proyek */}
              <div className="bg-white p-4 rounded-2xl border border-[#DCE0E6] shadow-xs">
                <div className="text-xs text-[#6C757D] font-medium flex items-center justify-between">
                  <span>Realisasi Fisik</span>
                  <CheckCircle2 className="w-4 h-4 text-[#1A9E6E]" />
                </div>
                <div className="text-2xl font-heading font-extrabold text-[#1A9E6E] mt-1.5">
                  {unlockedProject.progres_persen || 0}%
                </div>
                <div className="text-[11px] font-semibold mt-1 capitalize text-[#1A9E6E]">
                  {getDisplayStatus(unlockedProject.status, unlockedProject.progres_persen) === 'selesai'
                    ? '100% Rampung (FHO)'
                    : getDisplayStatus(unlockedProject.status, unlockedProject.progres_persen) === 'ditangguhkan'
                    ? 'Ditangguhkan'
                    : 'Sedang Berjalan'}
                </div>
              </div>

              {/* Card 3: Aduan Warga Proyek (Real-time live sync) */}
              <div className="bg-white p-4 rounded-2xl border border-[#DCE0E6] shadow-xs">
                <div className="text-xs text-[#6C757D] font-medium flex items-center justify-between">
                  <span>Aduan Warga</span>
                  <MessageSquare className="w-4 h-4 text-[#E67E22]" />
                </div>
                <div className="text-2xl font-heading font-extrabold text-[#212529] mt-1.5">
                  {projectAduanList.length}
                </div>
                <div className="text-[11px] text-[#E67E22] font-bold mt-1">
                  {projectAduanMenungguCount > 0
                    ? `${projectAduanMenungguCount} Perlu Ditanggapi!`
                    : projectAduanList.length > 0
                    ? 'Semua Telah Ditanggapi'
                    : 'Belum Ada Laporan Masuk'}
                </div>
              </div>

              {/* Card 4: Evaluasi Cacat AI Proyek (Real-time live sync) */}
              <div className="bg-white p-4 rounded-2xl border border-[#DCE0E6] shadow-xs">
                <div className="text-xs text-[#6C757D] font-medium flex items-center justify-between">
                  <span>Evaluasi Cacat AI</span>
                  <Wrench className="w-4 h-4 text-[#E74C3C]" />
                </div>
                <div className="text-2xl font-heading font-extrabold text-[#E74C3C] mt-1.5">
                  {projectEvaluasiList.length}
                </div>
                <div className="text-[11px] text-[#E74C3C] font-semibold mt-1">
                  {projectEvaluasiList.length > 0 ? 'Masa Pemeliharaan' : 'Nihil Temuan Kerusakan'}
                </div>
              </div>
            </div>
          ) : (
            /* Regular 5-column grid for aparatur_pemerintah / pimpinan_instansi / admin_dinas */
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
              <div className="bg-white p-4 rounded-2xl border border-[#DCE0E6] shadow-xs">
                <div className="text-xs text-[#6C757D] font-medium flex items-center justify-between">
                  <span>Total Proyek</span>
                  <FolderKanban className="w-4 h-4 text-[#184C78]" />
                </div>
                <div className="text-2xl font-heading font-extrabold text-[#184C78] mt-1.5">
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
                <div className="text-2xl font-heading font-extrabold text-[#212529] mt-1.5">
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
                <div className="text-2xl font-heading font-extrabold text-[#1A9E6E] mt-1.5">
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
                <div className="text-2xl font-heading font-extrabold text-[#212529] mt-1.5">
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
                <div className="text-2xl font-heading font-extrabold text-[#E74C3C] mt-1.5">
                  {evaluasiList.length}
                </div>
                <div className="text-[11px] text-[#E74C3C] font-semibold mt-1">
                  Masa Pemeliharaan
                </div>
              </div>
            </div>
          )}

          {currentUser.role === 'penanggung_jawab' && unlockedProject ? (
            <div className="bg-white rounded-2xl border border-[#DCE0E6] p-6 shadow-xs space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE0E6]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-[#EBF4FB] text-[#184C78] px-2.5 py-0.5 rounded border border-[#c5def2]">
                      {getProjectEffectiveCode(unlockedProject)}
                    </span>
                    <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded border ${
                      getDisplayStatus(unlockedProject.status, unlockedProject.progres_persen) === 'selesai'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : getDisplayStatus(unlockedProject.status, unlockedProject.progres_persen) === 'ditangguhkan'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                    }`}>
                      Status: {getDisplayStatus(unlockedProject.status, unlockedProject.progres_persen)}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-[#184C78] mt-1.5">
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
                  <div>Pagu: <strong className="text-[#212529]">Rp {Number(unlockedProject.anggaran || 0).toLocaleString('id-ID')}</strong></div>
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
                    <option value="rencana">Rencana (Mendatang)</option>
                    <option value="berjalan">Sedang Berjalan</option>
                    <option value="selesai">Selesai</option>
                    <option value="ditangguhkan">Ditangguhkan</option>
                  </select>

                  {currentUser.role !== 'penanggung_jawab' && (
                    <button
                      onClick={handleOpenNewProjectModal}
                      className="btn-primary !h-9 text-xs flex items-center gap-1.5 shrink-0 shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Input Proyek Baru</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#DCE0E6] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F5F7FA] text-[#184C78] font-heading font-bold border-b border-[#DCE0E6]">
                      <tr>
                        <th className="p-3.5">Kode Proyek</th>
                        <th className="p-3.5">Nama Proyek</th>
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
                          if (st === 'rencana' || st === 'direncanakan' || st === 'planned') return 'bg-blue-50 text-blue-700 border-blue-200';
                          return 'bg-[#FDEDEC] text-[#E74C3C] border-[#FADBD8]';
                        };

                        const normalizedStatus = getDisplayStatus(p.status, p.progres_persen);
                        const effectiveCode = getProjectEffectiveCode(p);
                        const effectivePin = getProjectEffectivePin(p);

                        return (
                          <tr key={p.id} className="hover:bg-[#F5F7FA]/70 transition-colors">
                            <td className="p-3.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs font-bold text-[#184C78] bg-[#EBF4FB] px-2 py-0.5 rounded border border-[#c5def2]">
                                  {effectiveCode}
                                </span>
                                <button
                                  onClick={() => handleCopyText(effectiveCode, `Kode ${effectiveCode}`)}
                                  className="text-[#6C757D] hover:text-[#184C78] cursor-pointer p-0.5"
                                  title="Salin Kode Proyek"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                            <td className="p-3.5">
                              <div className="font-bold text-[#212529]">{p.nama_proyek}</div>
                              <div className="text-[11px] text-[#6C757D] flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-[#2980B9]" />
                                <span>{p.nama_wilayah} {p.nama_desa ? `• ${p.nama_desa}` : ''}</span>
                              </div>
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
                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${getBadge(normalizedStatus)}`}>
                                {normalizedStatus === 'rencana' ? 'Rencana' : normalizedStatus}
                              </span>
                            </td>
                            {currentUser.role !== 'penanggung_jawab' && (
                              <td className="p-3.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                    {effectivePin}
                                  </span>
                                  <button
                                    onClick={() => handleCopyText(effectivePin, `Password ${effectivePin}`)}
                                    className="text-amber-700 hover:text-amber-900 cursor-pointer p-0.5"
                                    title="Salin Kunci Akses Khusus Penanggung Jawab"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
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
                    {getProjectEffectiveCode(unlockedProject)}
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
                      [{getProjectEffectiveCode(p)}] {p.nama_proyek} (Progres: {p.progres_persen}%)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {currentUser.role !== 'penanggung_jawab' && (
              <button
                onClick={() => setIsNewStageModalOpen(true)}
                className="btn-primary !h-9 text-xs flex items-center gap-1.5 shrink-0 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Tahapan Linimasa</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE0E6] p-6 shadow-xs space-y-6">
            <h3 className="font-heading font-bold text-base text-[#184C78]">
              Runtutan Tahapan Pengerjaan Konstruksi Fisik
            </h3>

            {timelineStages.length === 0 ? (
              <div className="p-8 sm:p-12 text-center bg-[#F8FAFC] border-2 border-dashed border-[#BDD7EE] rounded-2xl space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#EBF4FB] text-[#184C78] flex items-center justify-center mx-auto shadow-2xs">
                  <Clock className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm sm:text-base text-[#184C78]">Belum Ada Tahapan Linimasa</h4>
                  <p className="text-xs text-[#6C757D] max-w-md mx-auto leading-relaxed">
                    {currentUser.role === 'penanggung_jawab'
                      ? 'Proyek ini belum memiliki rincian tahapan pengerjaan fisik konstruksi yang ditetapkan oleh dinas pengampu. Tahapan baru akan ditambahkan oleh dinas penanggung jawab.'
                      : 'Proyek ini belum memiliki rincian tahapan pengerjaan konstruksi fisik. Sebagai aparatur pemerintah / dinas, Anda dapat menambahkan tahapan linimasa dan bobot secara manual.'}
                  </p>
                </div>
                {currentUser.role !== 'penanggung_jawab' && (
                  <button
                    type="button"
                    onClick={() => setIsNewStageModalOpen(true)}
                    className="btn-primary !h-9 text-xs inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Tahapan Linimasa Sekarang</span>
                  </button>
                )}
              </div>
            ) : (
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
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                            stage.status === 'selesai'
                              ? 'bg-[#E6F7F1] text-[#1A9E6E]'
                              : stage.status === 'sedang_berjalan'
                              ? 'bg-[#FEF3E7] text-[#E67E22]'
                              : 'bg-white text-[#6C757D] border border-[#DCE0E6]'
                          }`}>
                            {stage.status ? stage.status.replace('_', ' ') : 'belum mulai'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenEditStageModal(stage)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#184C78] bg-white border border-[#BDD7EE] rounded-lg hover:bg-[#EBF4FB] transition-colors cursor-pointer shadow-2xs"
                            title="Edit Rincian & Status Tahapan"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#2980B9]" />
                            <span>Edit</span>
                          </button>
                          {currentUser.role !== 'penanggung_jawab' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteTimelineStage(stage.id)}
                              className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50 cursor-pointer"
                              title="Hapus Tahapan Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
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
            )}
          </div>
        </div>
      )}

      {/* ── TAB CONTENT 3: DOKUMENTASI LAPANGAN ── */}
      {activeTab === 'dokumentasi' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#DCE0E6]">
            <div>
              <h2 className="text-base font-bold font-heading text-[#184C78]">
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
                      (doc.nama_proyek &&
                        unlockedProject.nama_proyek &&
                        doc.nama_proyek.toLowerCase() === unlockedProject.nama_proyek.toLowerCase())
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
                      <div className="relative h-44 bg-slate-900 overflow-hidden flex items-center justify-center">
                        {doc.tipe_file === 'video' ||
                        doc.foto_url.startsWith('data:video/') ||
                        /\.(mp4|mov|webm|avi)(\?|$)/i.test(doc.foto_url) ? (
                          <video
                            src={doc.foto_url}
                            controls
                            preload="metadata"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={doc.foto_url}
                            alt={doc.judul}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-black/75 text-white px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1 pointer-events-none">
                          {doc.tipe_file === 'video' ||
                          doc.foto_url.startsWith('data:video/') ||
                          /\.(mp4|mov|webm|avi)(\?|$)/i.test(doc.foto_url) ? (
                            <>
                              <Film className="w-3 h-3 text-cyan-300" />
                              <span>{doc.nama_tahap || 'Video Rekaman / Drone'}</span>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-3 h-3 text-emerald-300" />
                              <span>{doc.nama_tahap || 'Inspeksi Fisik'}</span>
                            </>
                          )}
                        </span>
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="text-[10px] text-[#6C757D] font-mono flex items-center justify-between">
                          <span>{doc.tanggal_unggah}</span>
                          <span className="text-[#184C78] font-bold">{doc.nama_proyek}</span>
                        </div>
                        <h4 className="font-heading font-bold text-sm text-[#212529] leading-snug">
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
              <h2 className="text-base font-bold font-heading text-[#184C78]">
                Layanan &amp; Kanal Tanggapan Pengaduan Masyarakat
              </h2>
              <p className="text-xs text-[#6C757D]">
                Tanggapi masukan warga secara resmi untuk meningkatkan transparansi dan indeks kepuasan publik dinas.
              </p>
            </div>
          </div>

          {(() => {
            const filteredAduan = projectAduanList;

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
                {filteredAduan.map((item) => {
                  const hasDistinctJudul =
                    item.judul &&
                    item.judul !== 'Aduan Warga' &&
                    item.judul !== item.isi_laporan &&
                    !item.isi_laporan.startsWith(item.judul.replace(/\.{3}$/, '').trim());

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleOpenReplyModal(item)}
                      className="bg-white rounded-2xl border border-[#DCE0E6] p-5 shadow-xs space-y-3.5 hover:border-[#184C78]/50 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <h3 className="font-heading font-bold text-base sm:text-lg text-[#184C78] group-hover:text-[#0f3252] transition-colors leading-snug">
                          {item.nama_proyek}
                        </h3>
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full capitalize shrink-0 self-start ${
                          item.status === 'selesai'
                            ? 'bg-[#E6F7F1] text-[#1A9E6E] border border-[#B7EBD8]'
                            : item.status === 'diproses'
                            ? 'bg-[#FEF3E7] text-[#E67E22] border border-[#FBD8B3]'
                            : 'bg-[#FDEDEC] text-[#E74C3C] border border-[#FADBD8]'
                        }`}>
                          Status: {item.status}
                        </span>
                      </div>

                      <div>
                        {hasDistinctJudul && (
                          <h4 className="font-heading font-bold text-sm text-[#212529] mb-1.5">{item.judul}</h4>
                        )}
                        <p className="text-xs sm:text-sm text-[#495057] leading-relaxed bg-[#F5F7FA] p-3.5 rounded-xl border border-[#DCE0E6]/50 italic">
                          "{item.isi_laporan}"
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-end border-t border-[#DCE0E6]/50">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenReplyModal(item);
                          }}
                          className="text-xs font-bold text-[#184C78] hover:text-[#2980B9] hover:underline flex items-center gap-1.5 cursor-pointer py-1 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{item.tanggapan_dinas ? 'Buka Halaman Detail & Riwayat Respon' : 'Buka Halaman Respon Tanggapan'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
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
                <h2 className="text-base font-bold font-heading text-[#184C78]">
                  Tinjauan Cacat Fisik &amp; Masa Pemeliharaan (FHO)
                </h2>
              </div>
              <p className="text-xs text-[#6C757D]">
                Laporan kerusakan fisik dari warga dengan penilaian prioritas AI. Verifikasi dan instruksikan rekanan pelaksana untuk perbaikan.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {projectEvaluasiList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-[#BDD7EE] p-8 text-center space-y-2">
                <Sparkles className="w-8 h-8 text-[#2980B9] mx-auto opacity-60" />
                <h4 className="font-bold text-sm text-[#184C78]">Tidak Ada Evaluasi Cacat Fisik AI</h4>
                <p className="text-xs text-[#6C757D] max-w-md mx-auto">
                  {currentUser.role === 'penanggung_jawab' && unlockedProject
                    ? `Tidak ada temuan anomali atau aduan cacat fisik AI untuk proyek ${unlockedProject.nama_proyek}. Kondisi konstruksi prima.`
                    : 'Belum ada evaluasi cacat fisik pasca konstruksi yang dilaporkan masyarakat.'}
                </p>
              </div>
            ) : (
              projectEvaluasiList.map((item) => (
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
                        {item.status_verifikasi.replace(/_/g, ' ')}
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
                        className="btn-primary !h-8 text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Verifikasi &amp; Jadwalkan Tim Lapangan</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

