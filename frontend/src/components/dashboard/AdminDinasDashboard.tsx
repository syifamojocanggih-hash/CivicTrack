import React, { useState, useMemo } from 'react';
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
} from '../../types';
import {
  MOCK_LAPORAN_WARGA,
  MOCK_EVALUASI_CACAT,
  MOCK_LINIMASA_TAHAP,
  MOCK_DOKUMENTASI_PROYEK,
} from '../../data/dashboardMockData';
import { MiniMapOverview } from './MiniMapOverview';
import { WILAYAH_DATA } from '../../data/geoWilayahData';
import { validateCoordinatesInKecamatan } from '../../utils/spatial';

interface AdminDinasDashboardProps {
  currentUser: UserProfile;
  projects: ProyekItem[];
  onOpenProjectDetail: (project: ProyekItem) => void;
  activeSection?: string;
  onSelectSection?: (section: string) => void;
  onOpenMapExplorer?: () => void;
}

export const AdminDinasDashboard: React.FC<AdminDinasDashboardProps> = ({
  currentUser,
  projects,
  onOpenProjectDetail,
  activeSection,
  onSelectSection,
  onOpenMapExplorer,
}) => {
  const activeTab = (activeSection as any) || 'proyek';

  // Local state for projects management
  const [projectList, setProjectList] = useState<ProyekItem[]>(projects);
  const [searchProj, setSearchProj] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('semua');

  // Modal new project
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({
    nama_proyek: '',
    kategori: 'jalan' as ProyekKategori,
    deskripsi: '',
    anggaran: 5000000000,
    status: 'berjalan' as ProyekStatus,
    progres_persen: 0,
    nama_wilayah: 'Kecamatan Lamongan (Kota)',
    latitude: -7.1197,
    longitude: 112.4150,
    nama_dinas: 'Dinas Pekerjaan Umum dan Penataan Ruang',
    tahap_terkini: 'Pembersihan & Pengukuran Lahan',
  });

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

  // Aduan response state
  const [aduanList, setAduanList] = useState<LaporanAduan[]>(MOCK_LAPORAN_WARGA);
  const [selectedAduanToReply, setSelectedAduanToReply] = useState<LaporanAduan | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyNewStatus, setReplyNewStatus] = useState<'diproses' | 'selesai'>('diproses');

  // Evaluasi cacat state
  const [evaluasiList, setEvaluasiList] = useState<EvaluasiCacatItem[]>(MOCK_EVALUASI_CACAT);
  const [selectedEvalToVerify, setSelectedEvalToVerify] = useState<EvaluasiCacatItem | null>(null);
  const [tindakanDinasText, setTindakanDinasText] = useState('');

  // Handle create new project
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spatialValidation.isValid) {
      alert(`Validasi Koordinat Gagal (Point-in-Polygon):\n${spatialValidation.message}`);
      return;
    }
    const newProj: ProyekItem = {
      id: Date.now(),
      nama_proyek: newProjectForm.nama_proyek,
      kategori: newProjectForm.kategori,
      deskripsi: newProjectForm.deskripsi,
      latitude: Number(newProjectForm.latitude),
      longitude: Number(newProjectForm.longitude),
      anggaran: Number(newProjectForm.anggaran),
      status: newProjectForm.status,
      progres_persen: Number(newProjectForm.progres_persen),
      nama_wilayah: newProjectForm.nama_wilayah,
      nama_dinas: newProjectForm.nama_dinas,
      tahap_terkini: newProjectForm.tahap_terkini,
      rata_rata_rating: null,
      jumlah_rating: 0,
    };
    setProjectList([newProj, ...projectList]);
    setIsNewProjectModalOpen(false);
    setNewProjectForm({
      nama_proyek: '',
      kategori: 'jalan',
      deskripsi: '',
      anggaran: 5000000000,
      status: 'berjalan',
      progres_persen: 0,
      nama_wilayah: 'Kecamatan Lamongan (Kota)',
      latitude: -7.1197,
      longitude: 112.4150,
      nama_dinas: 'Dinas Pekerjaan Umum dan Penataan Ruang',
      tahap_terkini: 'Pembersihan & Pengukuran Lahan',
    });
  };

  // Handle add new timeline stage
  const handleAddTimelineStage = (e: React.FormEvent) => {
    e.preventDefault();
    const newStage: LinimasaTahap = {
      id: Date.now(),
      proyek_id: selectedProjectForTimeline,
      nomor_tahap: timelineStages.length + 1,
      nama_tahap: newStageForm.nama_tahap,
      deskripsi: newStageForm.deskripsi,
      target_mulai: newStageForm.target_mulai,
      target_selesai: newStageForm.target_selesai,
      persentase_bobot: Number(newStageForm.persentase_bobot),
      status: 'sedang_berjalan',
      catatan_lapangan: 'Tahap baru ditambahkan oleh pengawas teknis.',
    };
    setTimelineStages([...timelineStages, newStage]);
    setIsNewStageModalOpen(false);
    setNewStageForm({
      nama_tahap: '',
      deskripsi: '',
      target_mulai: '2024-04-01',
      target_selesai: '2024-06-30',
      persentase_bobot: 15,
    });
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

  // Handle reply citizen report
  const handleSendAduanReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAduanToReply || !replyText) return;

    setAduanList((prev) =>
      prev.map((item) =>
        item.id === selectedAduanToReply.id
          ? {
              ...item,
              tanggapan_dinas: replyText,
              status: replyNewStatus,
              tanggal_tanggapan: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
              petugas_penjawab: `${currentUser.nama} (${currentUser.role.replace('_', ' ').toUpperCase()})`,
            }
          : item
      )
    );
    setSelectedAduanToReply(null);
    setReplyText('');
  };

  // Handle verify defect
  const handleVerifyDefect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvalToVerify || !tindakanDinasText) return;

    setEvaluasiList((prev) =>
      prev.map((item) =>
        item.id === selectedEvalToVerify.id
          ? {
              ...item,
              status_verifikasi: 'dalam_penanganan',
              catatan_dinas: tindakanDinasText,
              tanggal_tindakan: new Date().toLocaleDateString('id-ID'),
            }
          : item
      )
    );
    setSelectedEvalToVerify(null);
    setTindakanDinasText('');
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

  return (
    <div className="space-y-6 animate-hero-in">
      {/* ── TOP PENANGGUNG JAWAB PROYEK BANNER ── */}
      <div className="bg-gradient-to-r from-[#0f3252] via-[#184C78] to-[#1a6fa8] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-200 border border-amber-400/30 rounded-full text-xs font-semibold tracking-wide mb-3">
              <Building2 className="w-4 h-4 text-amber-300" />
              <span>Portal Penanggung Jawab Proyek (Dinas Pelaksana &amp; Rekanan)</span>
            </div>
            <h1 className="font-['DM_Sans'] text-2xl sm:text-3xl font-extrabold tracking-tight">
              {currentUser.nama}
            </h1>
            <p className="text-white/80 text-xs sm:text-sm mt-1">
              Pejabat Pembuat Komitmen (PPK) &amp; Tim Pelaksana Teknis — {currentUser.nama_dinas || 'Dinas Pekerjaan Umum & Tim Pelaksana'}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-white/70 mt-3 font-mono">
              <span>{currentUser.nip ? `NIP: ${currentUser.nip}` : 'ID Petugas: PJ-2024-001'}</span>
              <span>•</span>
              <span>Hak Akses: Input Progres, Unggah Foto/Video, Validasi SPK &amp; Tanggapi Aduan</span>
            </div>
          </div>

          <div className="flex flex-row md:flex-col gap-2 shrink-0">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#DCE0E6]">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <input
                type="text"
                placeholder="Cari nama proyek, wilayah, atau kategori..."
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
                onClick={() => setIsNewProjectModalOpen(true)}
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
                    <th className="p-3.5">Nama Proyek</th>
                    <th className="p-3.5">Kategori</th>
                    <th className="p-3.5">Anggaran (Pagu)</th>
                    <th className="p-3.5">Progres Fisik</th>
                    <th className="p-3.5">Tahap Terkini</th>
                    <th className="p-3.5">Status</th>
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
                          <div className="font-bold text-[#212529]">{p.nama_proyek}</div>
                          <div className="text-[11px] text-[#6C757D] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#2980B9]" />
                            <span>{p.nama_wilayah}</span>
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
                        <td className="p-3.5 w-40">
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
                        <td className="p-3.5 text-[11px] text-[#495057]">
                          {p.tahap_terkini || 'Pelaksanaan Konstruksi'}
                        </td>
                        <td className="p-3.5">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${getBadge(p.status)}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
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
        </div>
      )}

      {/* ── TAB CONTENT 2: LINIMASA & TAHAPAN ── */}
      {activeTab === 'linimasa' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#DCE0E6]">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-[#184C78]">Pilih Proyek:</label>
              <select
                value={selectedProjectForTimeline}
                onChange={(e) => setSelectedProjectForTimeline(Number(e.target.value))}
                className="text-xs p-2 border border-[#DCE0E6] rounded-lg bg-white outline-none focus:border-[#2980B9] font-medium"
              >
                {projectList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_proyek} (Progres: {p.progres_persen}%)
                  </option>
                ))}
              </select>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dokumentasiList.map((doc) => (
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

          <div className="space-y-3">
            {aduanList.map((item) => (
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

                {item.tanggapan_dinas ? (
                  <div className="p-3 bg-[#EBF4FB] rounded-xl border border-[#c5def2] text-xs space-y-1">
                    <div className="font-bold text-[#184C78] flex items-center justify-between">
                      <span>Tanggapan Resmi Dinas ({item.petugas_penjawab}):</span>
                      <span className="text-[10px] text-[#6C757D] font-mono">{item.tanggal_tanggapan}</span>
                    </div>
                    <p className="text-[#212529] leading-relaxed">{item.tanggapan_dinas}</p>
                  </div>
                ) : (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedAduanToReply(item);
                        setReplyText('');
                        setReplyNewStatus('diproses');
                      }}
                      className="btn-primary !h-8 text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Beri Tanggapan Resmi</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
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
                  <p className="text-[#495057] text-[11px] mt-0.5">{item.analisis_ai}</p>
                </div>

                {item.catatan_dinas ? (
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

      {/* ── MODAL: INPUT PROYEK BARU ── */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-[#DCE0E6] relative">
            <div className="bg-[#184C78] text-white p-5">
              <h3 className="font-['DM_Sans'] text-lg font-bold">Input Data Proyek Pembangunan Baru</h3>
              <p className="text-xs text-white/75 mt-0.5">
                Proyek akan langsung terindeks di peta interaktif dan dapat dipantau oleh warga masyarakat.
              </p>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block font-semibold text-[#184C78] mb-1">Nama Proyek</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Peningkatan Jalan Raya Arjuno KM 1–3"
                  value={newProjectForm.nama_proyek}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, nama_proyek: e.target.value })}
                  className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#184C78] mb-1">Kategori Sektor</label>
                  <select
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
                  <label className="block font-semibold text-[#184C78] mb-1">Pagu Anggaran (Rp)</label>
                  <input
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

              {/* Pilihan Wilayah Administratif Berjenjang */}
              <div>
                <label className="block font-semibold text-[#184C78] mb-1">
                  Wilayah Administratif Terdaftar
                </label>
                <select
                  value={newProjectForm.nama_wilayah}
                  onChange={(e) => {
                    const selName = e.target.value;
                    const matched = WILAYAH_DATA.kecamatanList.find((k) => k.nama === selName);
                    setNewProjectForm({
                      ...newProjectForm,
                      nama_wilayah: selName,
                      latitude: matched ? matched.koordinatPusat[0] : newProjectForm.latitude,
                      longitude: matched ? matched.koordinatPusat[1] : newProjectForm.longitude,
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

              {/* Koordinat Lintang & Bujur (Point-in-Polygon Validation) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#184C78] mb-1">
                    Latitude (Lintang)
                  </label>
                  <input
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
                  <label className="block font-semibold text-[#184C78] mb-1">
                    Longitude (Bujur)
                  </label>
                  <input
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
                <label className="block font-semibold text-[#184C78] mb-1">Uraian / Deskripsi Pekerjaan</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan ruang lingkup pengerjaan konstruksi..."
                  value={newProjectForm.deskripsi}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, deskripsi: e.target.value })}
                  className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCE0E6]">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="btn-ghost"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Simpan &amp; Publikasikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: TAMBAH TAHAP LINIMASA ── */}
      {isNewStageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-[#DCE0E6]">
            <div className="bg-[#184C78] text-white p-5">
              <h3 className="font-['DM_Sans'] text-base font-bold">Tambah Tahapan Pengerjaan Baru</h3>
            </div>
            <form onSubmit={handleAddTimelineStage} className="p-5 space-y-3 text-xs">
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
                  rows={2}
                  required
                  value={newStageForm.deskripsi}
                  onChange={(e) => setNewStageForm({ ...newStageForm, deskripsi: e.target.value })}
                  className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#184C78] mb-1">Target Mulai</label>
                  <input
                    type="date"
                    value={newStageForm.target_mulai}
                    onChange={(e) => setNewStageForm({ ...newStageForm, target_mulai: e.target.value })}
                    className="w-full p-2 border border-[#DCE0E6] rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#184C78] mb-1">Target Selesai</label>
                  <input
                    type="date"
                    value={newStageForm.target_selesai}
                    onChange={(e) => setNewStageForm({ ...newStageForm, target_selesai: e.target.value })}
                    className="w-full p-2 border border-[#DCE0E6] rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#184C78] mb-1">Bobot Kemajuan (%)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={newStageForm.persentase_bobot}
                  onChange={(e) => setNewStageForm({ ...newStageForm, persentase_bobot: Number(e.target.value) })}
                  className="w-full p-2 border border-[#DCE0E6] rounded-lg outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCE0E6]">
                <button
                  type="button"
                  onClick={() => setIsNewStageModalOpen(false)}
                  className="btn-ghost"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Simpan Tahap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: UPLOAD DOKUMENTASI ── */}
      {isNewDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-[#DCE0E6]">
            <div className="bg-[#184C78] text-white p-5">
              <h3 className="font-['DM_Sans'] text-base font-bold">Upload Bukti Dokumentasi Fisik</h3>
            </div>
            <form onSubmit={handleAddDocumentation} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#184C78] mb-1">Proyek Terkait</label>
                <select
                  value={newDocForm.proyek_id}
                  onChange={(e) => setNewDocForm({ ...newDocForm, proyek_id: Number(e.target.value) })}
                  className="w-full p-2 border border-[#DCE0E6] rounded-lg bg-white outline-none"
                >
                  {projectList.map((p) => (
                    <option key={p.id} value={p.id}>{p.nama_proyek}</option>
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
                  className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#184C78] mb-1">URL Foto Bukti / File</label>
                <input
                  type="text"
                  required
                  value={newDocForm.foto_url}
                  onChange={(e) => setNewDocForm({ ...newDocForm, foto_url: e.target.value })}
                  className="w-full p-2 border border-[#DCE0E6] rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#184C78] mb-1">Catatan Teknis Pengawas</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Keterangan kondisi visual dan hasil uji laboratorium..."
                  value={newDocForm.deskripsi}
                  onChange={(e) => setNewDocForm({ ...newDocForm, deskripsi: e.target.value })}
                  className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCE0E6]">
                <button
                  type="button"
                  onClick={() => setIsNewDocModalOpen(false)}
                  className="btn-ghost"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Unggah Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: BALAS ADUAN WARGA ── */}
      {selectedAduanToReply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-[#DCE0E6]">
            <div className="bg-[#184C78] text-white p-5">
              <h3 className="font-['DM_Sans'] text-base font-bold">Kirim Tanggapan Resmi Dinas</h3>
              <p className="text-xs text-white/75 mt-0.5">
                Kepada: {selectedAduanToReply.nama_pelapor} ({selectedAduanToReply.judul})
              </p>
            </div>
            <form onSubmit={handleSendAduanReply} className="p-5 space-y-3 text-xs">
              <div className="p-3 bg-[#F5F7FA] rounded-xl border border-[#DCE0E6]/60">
                <div className="font-bold text-[#184C78]">Keluhan Warga:</div>
                <p className="text-[#495057] italic mt-1">"{selectedAduanToReply.isi_laporan}"</p>
              </div>

              <div>
                <label className="block font-semibold text-[#184C78] mb-1">Update Status Aduan</label>
                <select
                  value={replyNewStatus}
                  onChange={(e) => setReplyNewStatus(e.target.value as any)}
                  className="w-full p-2 border border-[#DCE0E6] rounded-lg bg-white outline-none"
                >
                  <option value="diproses">Sedang Ditindaklanjuti Tim Lapangan</option>
                  <option value="selesai">Tindak Lanjut Selesai / Rampung</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#184C78] mb-1">Isi Tanggapan Resmi Dinas</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan tindakan konkret yang telah atau sedang diambil oleh dinas teknis dan kontraktor..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCE0E6]">
                <button
                  type="button"
                  onClick={() => setSelectedAduanToReply(null)}
                  className="btn-ghost"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Publikasikan Tanggapan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: VERIFIKASI CACAT ── */}
      {selectedEvalToVerify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-[#DCE0E6]">
            <div className="bg-[#184C78] text-white p-5">
              <h3 className="font-['DM_Sans'] text-base font-bold">Verifikasi Tindakan Perbaikan FHO</h3>
            </div>
            <form onSubmit={handleVerifyDefect} className="p-5 space-y-3 text-xs">
              <div className="p-3 bg-[#F5F7FA] rounded-xl border border-[#DCE0E6]/60">
                <div className="font-bold text-[#184C78]">{selectedEvalToVerify.nama_proyek}</div>
                <div className="text-[11px] text-[#6C757D]">{selectedEvalToVerify.lokasi_titik}</div>
                <p className="text-[#495057] mt-1 italic">"{selectedEvalToVerify.deskripsi}"</p>
              </div>

              <div>
                <label className="block font-semibold text-[#184C78] mb-1">Catatan Tindakan Tim Lapangan</label>
                <textarea
                  rows={4}
                  required
                  value={tindakanDinasText}
                  onChange={(e) => setTindakanDinasText(e.target.value)}
                  className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCE0E6]">
                <button
                  type="button"
                  onClick={() => setSelectedEvalToVerify(null)}
                  className="btn-ghost"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Konfirmasi Penanganan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
