import React, { useState } from 'react';
import {
  Bookmark,
  MessageSquarePlus,
  Star,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  ShieldCheck,
  MapPin,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Check,
  History,
  FileText,
} from 'lucide-react';
import type {
  UserProfile,
  ProyekItem,
  LaporanAduan,
  EvaluasiCacatItem,
  RatingUlasanItem,
  SubscribedProject,
} from '../../types';
import {
  MOCK_SUBSCRIBED_PROJECTS,
  MOCK_LAPORAN_WARGA,
  MOCK_EVALUASI_CACAT,
  MOCK_RATING_ULASAN,
  MOCK_AUDIT_TRAIL_LOGS,
} from '../../data/dashboardMockData';
import { MiniMapOverview } from './MiniMapOverview';

interface WargaDashboardProps {
  currentUser: UserProfile;
  projects: ProyekItem[];
  onOpenProjectDetail: (project: ProyekItem) => void;
  onOpenAIRoute: (projectName: string) => void;
  activeSection?: string;
  onSelectSection?: (section: string) => void;
  onOpenMapExplorer?: () => void;
}

export const WargaDashboard: React.FC<WargaDashboardProps> = ({
  currentUser,
  projects,
  onOpenProjectDetail,
  onOpenAIRoute,
  activeSection,
  onOpenMapExplorer,
}) => {
  const [activeAuditTrailId, setActiveAuditTrailId] = useState<number | null>(null);

  const activeTab = (activeSection as any) || 'langganan';

  // Subscribed state
  const [subscribedList, setSubscribedList] = useState<SubscribedProject[]>(MOCK_SUBSCRIBED_PROJECTS);

  // Laporan state
  const [laporanList, setLaporanList] = useState<LaporanAduan[]>(MOCK_LAPORAN_WARGA);
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    proyek_id: projects[0]?.id || 1,
    judul: '',
    isi_laporan: '',
    kategori_aduan: 'Dampak Lingkungan & Keselamatan',
  });
  const [reportFilter, setReportFilter] = useState<'semua' | 'menunggu' | 'diproses' | 'selesai'>('semua');

  // Rating state
  const [ratingList, setRatingList] = useState<RatingUlasanItem[]>(MOCK_RATING_ULASAN);
  const [ratingForm, setRatingForm] = useState({
    proyek_id: projects.find((p) => p.status === 'selesai')?.id || 3,
    bintang: 5,
    aspek_kualitas: 5,
    aspek_ketepatan_waktu: 5,
    aspek_manfaat: 5,
    komentar: '',
  });
  const [ratingSuccessMessage, setRatingSuccessMessage] = useState('');

  // Evaluasi Cacat state
  const [evaluasiList, setEvaluasiList] = useState<EvaluasiCacatItem[]>(MOCK_EVALUASI_CACAT);
  const [isEvaluasiModalOpen, setIsEvaluasiModalOpen] = useState(false);
  const [evaluasiForm, setEvaluasiForm] = useState({
    proyek_id: 3,
    deskripsi: '',
    lokasi_titik: '',
    kategori_cacat: 'Struktur Beton / Retak',
  });

  // Handle toggle notification
  const handleToggleNotification = (id: number) => {
    setSubscribedList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, notifikasi_aktif: !item.notifikasi_aktif } : item
      )
    );
  };

  // Handle submit report
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.judul || !reportForm.isi_laporan) return;

    const selectedProj = projects.find((p) => p.id === Number(reportForm.proyek_id));

    const newLaporan: LaporanAduan = {
      id: Date.now(),
      proyek_id: Number(reportForm.proyek_id),
      nama_proyek: selectedProj?.nama_proyek || 'Proyek Kota',
      user_id: currentUser.id,
      nama_pelapor: currentUser.nama,
      email_pelapor: currentUser.email,
      judul: reportForm.judul,
      isi_laporan: reportForm.isi_laporan,
      kategori_aduan: reportForm.kategori_aduan,
      status: 'menunggu',
      tanggal_lapor: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
    };

    setLaporanList([newLaporan, ...laporanList]);
    setIsNewReportModalOpen(false);
    setReportForm({
      proyek_id: projects[0]?.id || 1,
      judul: '',
      isi_laporan: '',
      kategori_aduan: 'Dampak Lingkungan & Keselamatan',
    });
  };

  // Handle submit rating
  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    const selProj = projects.find((p) => p.id === Number(ratingForm.proyek_id));
    const newRating: RatingUlasanItem = {
      id: Date.now(),
      proyek_id: Number(ratingForm.proyek_id),
      nama_proyek: selProj?.nama_proyek || 'Proyek Selesai',
      user_id: currentUser.id,
      nama_warga: currentUser.nama,
      bintang: ratingForm.bintang,
      komentar: ratingForm.komentar,
      aspek_kualitas: ratingForm.aspek_kualitas,
      aspek_ketepatan_waktu: ratingForm.aspek_ketepatan_waktu,
      aspek_manfaat: ratingForm.aspek_manfaat,
      tanggal: new Date().toISOString().split('T')[0],
    };

    setRatingList([newRating, ...ratingList]);
    setRatingSuccessMessage('Penilaian Anda berhasil disimpan! Terima kasih atas partisipasi aktif Anda.');
    setTimeout(() => setRatingSuccessMessage(''), 4000);
    setRatingForm({
      proyek_id: projects.find((p) => p.status === 'selesai')?.id || 3,
      bintang: 5,
      aspek_kualitas: 5,
      aspek_ketepatan_waktu: 5,
      aspek_manfaat: 5,
      komentar: '',
    });
  };

  // Handle submit evaluasi cacat with simulated AI analysis
  const handleSubmitEvaluasi = (e: React.FormEvent) => {
    e.preventDefault();
    const selProj = projects.find((p) => p.id === Number(evaluasiForm.proyek_id));

    // Simulated Gemini AI urgency calculation based on keywords
    let score = 3;
    let analysis = 'Tingkat Urgensi SEDANG (Skor 3/5). Memerlukan inspeksi visual berkala oleh penilik jalan dinas.';
    const textLower = evaluasiForm.deskripsi.toLowerCase();
    if (textLower.includes('ambles') || textLower.includes('retak besar') || textLower.includes('bahaya') || textLower.includes('patah')) {
      score = 5;
      analysis = 'Tingkat Urgensi SANGAT TINGGI (Skor 5/5 - AI Flagged). Kerusakan struktural kritis berisiko membahayakan keselamatan jiwa pejalan kaki atau lalu lintas. Rekomendasi: Tindakan segera < 24 Jam.';
    } else if (textLower.includes('retak') || textLower.includes('bocor') || textLower.includes('longsor')) {
      score = 4;
      analysis = 'Tingkat Urgensi TINGGI (Skor 4/5). Diperlukan pemasangan rambu pengaman barikade dan perbaikan segera pada masa garansi.';
    }

    const newEval: EvaluasiCacatItem = {
      id: Date.now(),
      proyek_id: Number(evaluasiForm.proyek_id),
      nama_proyek: selProj?.nama_proyek || 'Proyek Fisik Selesai',
      user_id: currentUser.id,
      nama_pelapor: currentUser.nama,
      deskripsi: evaluasiForm.deskripsi,
      lokasi_titik: evaluasiForm.lokasi_titik,
      skor_urgensi_ai: score,
      analisis_ai: analysis,
      kategori_cacat: evaluasiForm.kategori_cacat,
      status_verifikasi: 'menunggu_verifikasi',
      tanggal_lapor: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
    };

    setEvaluasiList([newEval, ...evaluasiList]);
    setIsEvaluasiModalOpen(false);
    setEvaluasiForm({
      proyek_id: 3,
      deskripsi: '',
      lokasi_titik: '',
      kategori_cacat: 'Struktur Beton / Retak',
    });
  };

  const filteredLaporan = laporanList.filter((item) => {
    if (reportFilter === 'semua') return true;
    return item.status === reportFilter;
  });

  const completedProjects = projects.filter((p) => p.status === 'selesai');

  return (
    <div className="space-y-6 animate-hero-in">
      {/* ── TOP HERO BANNER WARGA ── */}
      <div className="bg-gradient-to-r from-[#184C78] via-[#1a6fa8] to-[#2980B9] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Portal Partisipasi &amp; Pengawasan Warga</span>
          </div>
          <h1 className="font-['DM_Sans'] text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {currentUser.nama}! 👋
          </h1>
          <p className="text-white/85 text-xs sm:text-sm mt-2 leading-relaxed">
            Pantau perkembangan proyek infrastruktur di sekitar tempat tinggalmu secara transparan, kirimkan tanggapan langsung ke dinas pengawas, serta berikan penilaian kepuasan pembangunan.
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={() => setIsNewReportModalOpen(true)}
              className="px-4 py-2 bg-white text-[#184C78] font-bold text-xs rounded-xl shadow-xs hover:bg-slate-100 flex items-center gap-2 transition-transform hover:scale-102 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#184C78]" />
              <span>Buat Laporan / Masukan Baru</span>
            </button>
            <button
              onClick={() => onOpenAIRoute('Pelebaran Jalan Soekarno Hatta')}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs rounded-xl backdrop-blur-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Cek Rute Alternatif AI</span>
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

      {/* ── METRIC CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#DCE0E6] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#EBF4FB] text-[#184C78] flex items-center justify-center shrink-0">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-['DM_Sans'] font-extrabold text-[#184C78]">
              {subscribedList.length}
            </div>
            <div className="text-xs text-[#6C757D] font-medium">Proyek Diikuti</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE0E6] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FEF3E7] text-[#E67E22] flex items-center justify-center shrink-0">
            <MessageSquarePlus className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-['DM_Sans'] font-extrabold text-[#212529]">
              {laporanList.length}
            </div>
            <div className="text-xs text-[#6C757D] font-medium">Laporan Terkirim</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE0E6] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#E6F7F1] text-[#1A9E6E] flex items-center justify-center shrink-0">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-['DM_Sans'] font-extrabold text-[#212529]">
              {ratingList.length}
            </div>
            <div className="text-xs text-[#6C757D] font-medium">Rating Diberikan</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE0E6] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FDEDEC] text-[#E74C3C] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-['DM_Sans'] font-extrabold text-[#212529]">
              {evaluasiList.length}
            </div>
            <div className="text-xs text-[#6C757D] font-medium">Evaluasi Cacat Fisik</div>
          </div>
        </div>
      </div>

      {/* ── ACTIVE SECTION VIEW (DRIVEN BY SIDEBAR) ── */}
      {/* ── SECTION 1: PROYEK DI IKUTI ── */}
      {(activeTab === 'langganan' || activeTab === 'overview') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#DCE0E6] shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBF4FB] text-[#184C78] flex items-center justify-center shrink-0">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold font-['DM_Sans'] text-[#184C78]">
                  Proyek Pilihan yang Anda Ikuti
                </h2>
                <p className="text-xs text-[#6C757D]">
                  Anda menerima notifikasi otomatis setiap kali pihak pelaksana memperbarui progres fisik atau linimasa proyek ini.
                </p>
              </div>
            </div>
            <div className="text-xs font-semibold px-3 py-1.5 bg-[#F5F7FA] text-[#184C78] rounded-xl border border-[#DCE0E6] shrink-0 self-start sm:self-auto">
              Total {subscribedList.length} Proyek Aktif
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscribedList.map((sub) => {
              const p = sub.proyek;
              return (
                <div
                  key={sub.id}
                  className="bg-white rounded-2xl border border-[#DCE0E6] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EBF4FB] text-[#184C78]">
                        {p.kategori}
                      </span>
                      <button
                        onClick={() => handleToggleNotification(sub.id)}
                        className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${
                          sub.notifikasi_aktif
                            ? 'bg-[#E6F7F1] text-[#1A9E6E]'
                            : 'bg-[#F5F7FA] text-[#6C757D]'
                        }`}
                        title="Klik untuk ubah status notifikasi"
                      >
                        {sub.notifikasi_aktif ? '🔔 Notif Aktif' : '🔕 Notif Senyap'}
                      </button>
                    </div>

                    <h3 className="font-['DM_Sans'] font-bold text-base text-[#212529] mt-3 leading-snug">
                      {p.nama_proyek}
                    </h3>
                    <p className="text-xs text-[#6C757D] mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#2980B9]" />
                      <span>{p.nama_wilayah}</span>
                    </p>

                    {/* Progress visual */}
                    <div className="mt-4 bg-[#F5F7FA] p-3 rounded-xl border border-[#DCE0E6]/60">
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-[#6C757D]">Progres Fisik</span>
                        <span className="text-[#184C78] font-bold">{p.progres_persen}%</span>
                      </div>
                      <div className="w-full bg-[#DCE0E6] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#184C78] h-full rounded-full transition-all duration-500"
                          style={{ width: `${p.progres_persen}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-[#6C757D] mt-2 italic">
                        Tahap: {p.tahap_terkini || 'Pelaksanaan Konstruksi'}
                      </div>
                    </div>

                    {/* Latest alert update */}
                    <div className="mt-3 p-2.5 bg-[#f4f9fd] rounded-lg border-l-3 border-[#2980B9] text-xs">
                      <div className="font-semibold text-[#184C78] flex items-center justify-between">
                        <span>Pembaruan Terkini</span>
                        <span className="text-[10px] text-[#6C757D] font-mono">{sub.update_terakhir}</span>
                      </div>
                      <p className="text-[11px] text-[#212529] mt-1 leading-relaxed">
                        {sub.pesan_update}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#DCE0E6] flex gap-2">
                    <button
                      onClick={() => onOpenProjectDetail(p)}
                      className="flex-1 py-2 bg-[#184C78] hover:bg-[#0f3252] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Lihat Linimasa &amp; Foto</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    {p.kategori === 'jalan' && (
                      <button
                        onClick={() => onOpenAIRoute(p.nama_proyek)}
                        className="px-3 py-2 bg-[#FEF3E7] hover:bg-[#FDEBD0] text-[#E67E22] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        title="Rute Alternatif AI"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB CONTENT 2: LAPORAN & ADUAN SAYA ── */}
      {activeTab === 'laporan' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#DCE0E6]">
            <div>
              <h2 className="text-base font-bold font-['DM_Sans'] text-[#184C78]">
                Riwayat Laporan &amp; Aspirasi Warga
              </h2>
              <p className="text-xs text-[#6C757D]">
                Semua keluhan dan pertanyaan Anda diteruskan langsung ke penanggung jawab dinas teknis terkait.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[#F5F7FA] p-1 rounded-lg border border-[#DCE0E6]">
                {(['semua', 'menunggu', 'diproses', 'selesai'] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => setReportFilter(filterKey)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium capitalize transition-all cursor-pointer ${
                      reportFilter === filterKey
                        ? 'bg-white text-[#184C78] font-bold shadow-xs'
                        : 'text-[#6C757D] hover:text-[#212529]'
                    }`}
                  >
                    {filterKey}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsNewReportModalOpen(true)}
                className="btn-primary !h-9 text-xs flex items-center gap-1.5 shrink-0 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Kirim Laporan Baru</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredLaporan.map((lap) => {
              const getStatusBadge = (st: string) => {
                switch (st) {
                  case 'selesai':
                    return { bg: 'bg-[#E6F7F1] text-[#1A9E6E] border-[#B7EBD8]', text: 'Tindak Lanjut Selesai' };
                  case 'diproses':
                    return { bg: 'bg-[#FEF3E7] text-[#E67E22] border-[#FBD8B3]', text: 'Sedang Ditindaklanjuti' };
                  case 'menunggu':
                  default:
                    return { bg: 'bg-[#F5F7FA] text-[#6C757D] border-[#DCE0E6]', text: 'Menunggu Verifikasi Dinas' };
                }
              };
              const statusInfo = getStatusBadge(lap.status);

              return (
                <div
                  key={lap.id}
                  className="bg-white rounded-2xl border border-[#DCE0E6] p-5 shadow-xs hover:border-[#2980B9]/40 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-semibold text-[#2980B9] bg-[#EBF4FB] px-2 py-0.5 rounded mr-2">
                        {lap.kategori_aduan}
                      </span>
                      <span className="text-xs text-[#6C757D] font-mono">
                        {lap.tanggal_lapor}
                      </span>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${statusInfo.bg}`}>
                      {lap.status === 'selesai' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {lap.status === 'diproses' && <Clock className="w-3.5 h-3.5" />}
                      {statusInfo.text}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-['DM_Sans'] font-bold text-base text-[#212529]">
                      {lap.judul}
                    </h3>
                    <div className="text-xs font-semibold text-[#184C78] mt-0.5">
                      Terkait: {lap.nama_proyek}
                    </div>
                    <p className="text-xs text-[#495057] mt-2 leading-relaxed bg-[#F5F7FA] p-3 rounded-xl border border-[#DCE0E6]/50">
                      "{lap.isi_laporan}"
                    </p>
                  </div>

                  {/* Tanggapan Resmi Dinas */}
                  {lap.tanggapan_dinas ? (
                    <div className="mt-3 p-3.5 bg-[#EBF4FB]/70 rounded-xl border border-[#c5def2] text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-[#184C78] flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-[#2980B9]" />
                          <span>Tanggapan Resmi: {lap.petugas_penjawab || 'Dinas Terkait'}</span>
                        </div>
                        <span className="text-[10px] text-[#6C757D] font-mono">{lap.tanggal_tanggapan}</span>
                      </div>
                      <p className="text-[#212529] leading-relaxed">
                        {lap.tanggapan_dinas}
                      </p>
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#6C757D] italic flex items-center gap-1.5 pt-1">
                      <Clock className="w-3.5 h-3.5 text-[#E67E22]" />
                      <span>Sedang dalam antrean telaah teknis pengawas lapangan dinas.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB CONTENT 3: RATING & ULASAN ── */}
      {activeTab === 'rating' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rating Submission Form */}
          <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-[#DCE0E6] shadow-xs h-fit space-y-4">
            <div>
              <h2 className="font-['DM_Sans'] font-bold text-base text-[#184C78]">
                Beri Penilaian Proyek Selesai
              </h2>
              <p className="text-xs text-[#6C757D] mt-1">
                Khusus proyek yang telah berstatus 100% Selesai untuk mengukur kepuasan publik.
              </p>
            </div>

            {ratingSuccessMessage && (
              <div className="p-3 bg-[#E6F7F1] text-[#1A9E6E] text-xs font-semibold rounded-xl border border-[#B7EBD8] flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{ratingSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitRating} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#184C78] mb-1">Pilih Proyek Selesai</label>
                <select
                  value={ratingForm.proyek_id}
                  onChange={(e) => setRatingForm({ ...ratingForm, proyek_id: Number(e.target.value) })}
                  className="w-full p-2 border border-[#DCE0E6] rounded-lg bg-white outline-none focus:border-[#2980B9]"
                >
                  {completedProjects.length > 0 ? (
                    completedProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nama_proyek} ({p.nama_wilayah})
                      </option>
                    ))
                  ) : (
                    <option value={3}>Normalisasi Drainase Jl. MT. Haryono</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#184C78] mb-1">Skor Bintang Keseluruhan</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRatingForm({ ...ratingForm, bintang: star })}
                      className="p-1 text-2xl text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                    >
                      {star <= ratingForm.bintang ? '★' : '☆'}
                    </button>
                  ))}
                  <span className="font-bold text-[#184C78] ml-2 text-sm">{ratingForm.bintang} / 5</span>
                </div>
              </div>

              <div className="space-y-2 bg-[#F5F7FA] p-3 rounded-xl border border-[#DCE0E6]/60">
                <span className="font-semibold text-[#184C78] block text-[11px] uppercase tracking-wider">
                  Penilaian Parameter Detail (1 - 5)
                </span>
                <div className="flex justify-between items-center">
                  <span>Mutu &amp; Kerapian Fisik:</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={ratingForm.aspek_kualitas}
                    onChange={(e) => setRatingForm({ ...ratingForm, aspek_kualitas: Number(e.target.value) })}
                    className="w-24 accent-[#184C78]"
                  />
                  <span className="font-bold text-[#184C78]">{ratingForm.aspek_kualitas}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Ketepatan Waktu:</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={ratingForm.aspek_ketepatan_waktu}
                    onChange={(e) => setRatingForm({ ...ratingForm, aspek_ketepatan_waktu: Number(e.target.value) })}
                    className="w-24 accent-[#184C78]"
                  />
                  <span className="font-bold text-[#184C78]">{ratingForm.aspek_ketepatan_waktu}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Kemanfaatan Warga:</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={ratingForm.aspek_manfaat}
                    onChange={(e) => setRatingForm({ ...ratingForm, aspek_manfaat: Number(e.target.value) })}
                    className="w-24 accent-[#184C78]"
                  />
                  <span className="font-bold text-[#184C78]">{ratingForm.aspek_manfaat}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#184C78] mb-1">Ulasan &amp; Testimoni Warga</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Bagikan pengalaman atau dampak positif infrastruktur yang selesai dibangun bagi kenyamanan warga..."
                  value={ratingForm.komentar}
                  onChange={(e) => setRatingForm({ ...ratingForm, komentar: e.target.value })}
                  className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#184C78] hover:bg-[#0f3252] text-white font-bold rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
              >
                Kirim Penilaian Kepuasan
              </button>
            </form>
          </div>

          {/* List of Public Ratings */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-['DM_Sans'] font-bold text-base text-[#184C78]">
              Daftar Ulasan &amp; Indeks Kepuasan Terkini
            </h2>

            {ratingList.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-[#DCE0E6] shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#EBF4FB] text-[#184C78] font-bold text-xs flex items-center justify-center">
                      {item.nama_warga.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[#212529]">{item.nama_warga}</div>
                      <div className="text-[10px] text-[#6C757D]">{item.nama_proyek}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                    <span>{'★'.repeat(item.bintang)}</span>
                    <span className="text-[#6C757D] font-normal text-[11px] ml-1">({item.tanggal})</span>
                  </div>
                </div>

                <p className="text-xs text-[#495057] leading-relaxed bg-[#F5F7FA] p-3 rounded-xl border border-[#DCE0E6]/50">
                  "{item.komentar}"
                </p>

                <div className="flex gap-4 text-[11px] text-[#6C757D] pt-1">
                  <span>Mutu: <strong className="text-[#184C78]">{item.aspek_kualitas}/5</strong></span>
                  <span>Waktu: <strong className="text-[#184C78]">{item.aspek_ketepatan_waktu}/5</strong></span>
                  <span>Manfaat: <strong className="text-[#184C78]">{item.aspek_manfaat}/5</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB CONTENT 4: EVALUASI CACAT PASCA PROYEK ── */}
      {activeTab === 'evaluasi' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#DCE0E6]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-['DM_Sans'] text-[#184C78]">
                  Evaluasi &amp; Aduan Cacat Fisik Pasca-Proyek
                </h2>
                <span className="bg-[#EBF4FB] text-[#2980B9] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Urgency Scoring
                </span>
              </div>
              <p className="text-xs text-[#6C757D]">
                Laporkan retakan, genangan tersisa, atau kerusakan fasilitas selama masa garansi pemeliharaan (FHO). Sistem AI akan otomatis memprioritaskan urgensinya bagi dinas.
              </p>
            </div>

            <button
              onClick={() => setIsEvaluasiModalOpen(true)}
              className="btn-primary !h-9 text-xs flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Laporkan Kerusakan Fisik</span>
            </button>
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
                    <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                      item.skor_urgensi_ai >= 4
                        ? 'bg-[#FDEDEC] text-[#E74C3C] border border-[#FADBD8]'
                        : 'bg-[#FEF3E7] text-[#E67E22] border border-[#FBD8B3]'
                    }`}>
                      ⚡ AI Urgensi: Skor {item.skor_urgensi_ai} / 5
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EBF4FB] text-[#184C78]">
                      {item.status_verifikasi.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-[#212529]">
                    Lokasi Titik: <span className="font-normal text-[#6C757D]">{item.lokasi_titik}</span>
                  </div>
                  <p className="text-xs text-[#212529] mt-1.5 leading-relaxed bg-[#F5F7FA] p-3 rounded-xl border border-[#DCE0E6]/50">
                    "{item.deskripsi}"
                  </p>
                </div>

                {/* AI Analysis Card */}
                <div className="p-3 bg-[#f4f9fd] rounded-xl border-l-3 border-[#2980B9] text-xs space-y-1">
                  <div className="font-bold text-[#184C78] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#2980B9]" />
                    <span>Analisis Cerdas AI (Civic Gemini Engine):</span>
                  </div>
                  <p className="text-[#495057] text-[11px] leading-relaxed">
                    {item.analisis_ai}
                  </p>
                </div>

                {/* Tindak Lanjut Dinas */}
                {item.catatan_dinas && (
                  <div className="p-3 bg-[#E6F7F1] rounded-xl border border-[#B7EBD8] text-xs space-y-1">
                    <div className="font-bold text-[#1A9E6E] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Respon Tim Pemeliharaan Dinas ({item.tanggal_tindakan}):</span>
                    </div>
                    <p className="text-[#0E6243] text-[11px] leading-relaxed">
                      {item.catatan_dinas}
                    </p>
                  </div>
                )}

                {/* Audit Trail Timeline Button & View (evaluasi_status_log) */}
                <div className="pt-2 border-t border-[#DCE0E6]/60 flex items-center justify-between">
                  <button
                    onClick={() => setActiveAuditTrailId(activeAuditTrailId === item.id ? null : item.id)}
                    className="text-xs font-bold text-[#184C78] hover:text-[#0f3252] flex items-center gap-1.5 cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5 text-[#2980B9]" />
                    <span>
                      {activeAuditTrailId === item.id ? 'Tutup Linimasa Audit Trail' : 'Lihat Riwayat Perubahan Status (Audit Trail Log)'}
                    </span>
                  </button>
                  <span className="text-[10px] text-[#6C757D] font-mono">
                    ID Evaluasi: #{item.id}
                  </span>
                </div>

                {/* Collapsible Audit Trail Log Table/Timeline */}
                {activeAuditTrailId === item.id && (
                  <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#DCE0E6] space-y-3 animate-fade-in text-xs">
                    <div className="font-bold text-[#184C78] flex items-center gap-2 border-b border-[#DCE0E6] pb-2">
                      <FileText className="w-4 h-4 text-[#184C78]" />
                      <span>Jejak Audit Status Evaluasi Pembangunan (Transparansi Publik)</span>
                    </div>

                    <div className="relative pl-6 border-l-2 border-[#2980B9] ml-2 space-y-4 pt-1">
                      {(MOCK_AUDIT_TRAIL_LOGS[item.id] || [
                        {
                          id: 1,
                          evaluasi_id: item.id,
                          status_baru: 'Laporan Dikirim Warga',
                          diubah_oleh: item.nama_pelapor,
                          role_pengubah: 'Warga Masyarakat',
                          catatan: item.deskripsi,
                          waktu: item.tanggal_lapor,
                        },
                        {
                          id: 2,
                          evaluasi_id: item.id,
                          status_sebelumnya: 'Laporan Dikirim Warga',
                          status_baru: 'Analisis AI (Gemini)',
                          diubah_oleh: 'CivicTrack Gemini AI',
                          role_pengubah: 'Sistem Otomatis',
                          catatan: `Skor Urgensi AI: ${item.skor_urgensi_ai}/5. ${item.analisis_ai}`,
                          waktu: item.tanggal_lapor,
                        },
                        {
                          id: 3,
                          evaluasi_id: item.id,
                          status_sebelumnya: 'Analisis AI (Gemini)',
                          status_baru: item.status_verifikasi.replace('_', ' '),
                          diubah_oleh: 'Penanggung Jawab Proyek (Dinas)',
                          role_pengubah: 'Penanggung Jawab Proyek',
                          catatan: item.catatan_dinas || 'Verifikasi dokumen dan konfirmasi tim teknis lapangan.',
                          waktu: item.tanggal_tindakan || item.tanggal_lapor,
                        },
                      ]).map((log, lIdx) => (
                        <div key={lIdx} className="relative">
                          <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#184C78] border-2 border-white ring-2 ring-[#2980B9]/30 flex items-center justify-center">
                            <span className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between">
                              <strong className="text-[#184C78] font-bold text-xs">{log.status_baru}</strong>
                              <span className="text-[10px] text-[#6C757D] font-mono">{log.waktu}</span>
                            </div>
                            <div className="text-[11px] text-[#2980B9] font-medium">
                              Oleh: {log.diubah_oleh} ({log.role_pengubah})
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5 bg-white p-2 rounded-lg border border-slate-200">
                              {log.catatan}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB CONTENT 5: RUTE ALTERNATIF AI ── */}
      {activeTab === 'rute' && (
        <div className="bg-white rounded-2xl border border-[#DCE0E6] p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#E67E22]" />
                <h2 className="text-base font-bold font-['DM_Sans'] text-[#184C78]">
                  Sistem Rekomendasi Rute Pengalihan AI
                </h2>
              </div>
              <p className="text-xs text-[#6C757D] mt-1">
                Rekomendasi jalur cerdas terstruktur untuk menghindari titik proyek pembangunan yang sedang dalam pengerjaan konstruksi.
              </p>
            </div>
            <button
              onClick={() => onOpenAIRoute('Pelebaran Jalan Soekarno Hatta KM 4–7')}
              className="btn-primary !h-9 text-xs flex items-center gap-1.5"
            >
              <span>Buka Analisis AI Lengkap</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#EBF4FB] border border-[#c5def2] space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#184C78] flex items-center justify-between">
                <span>Rute Utama (Prioritas 1)</span>
                <span className="bg-[#184C78] text-white px-2 py-0.5 rounded text-[10px]">Mobil &amp; Bus</span>
              </div>
              <h4 className="font-bold text-sm text-[#212529]">Via Jl. Borobudur &rarr; Jl. Candi Mendut</h4>
              <p className="text-xs text-[#495057] leading-relaxed">
                Jalan lebar dua lajur dengan kapasitas kendaraan sedang hingga tinggi. Rekomendasi utama pada jam kerja sibuk (07:00–09:00).
              </p>
              <div className="text-[11px] text-[#184C78] font-semibold pt-1">
                Estimasi tambahan waktu: +6 Menit
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FEF3E7] border border-[#FBD8B3] space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#9A4C08] flex items-center justify-between">
                <span>Rute Kedua (Prioritas 2)</span>
                <span className="bg-[#E67E22] text-white px-2 py-0.5 rounded text-[10px]">Motor &amp; Mobil</span>
              </div>
              <h4 className="font-bold text-sm text-[#212529]">Via Simpang Cengger Ayam &rarr; Candi Panggung</h4>
              <p className="text-xs text-[#495057] leading-relaxed">
                Jalur penghubung koridor barat. Cocok untuk roda dua dan mobil pribadi yang ingin menghindari simpang lampu merah utama.
              </p>
              <div className="text-[11px] text-[#9A4C08] font-semibold pt-1">
                Estimasi tambahan waktu: +8 Menit
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#E6F7F1] border border-[#B7EBD8] space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#0E6243] flex items-center justify-between">
                <span>Rute Khusus Lingkungan</span>
                <span className="bg-[#1A9E6E] text-white px-2 py-0.5 rounded text-[10px]">Khusus Roda 2</span>
              </div>
              <h4 className="font-bold text-sm text-[#212529]">Via Gang Jati Murni Barat</h4>
              <p className="text-xs text-[#495057] leading-relaxed">
                Jalur pintas pemukiman warga hanya untuk sepeda motor dengan kecepatan maksimal 20 km/jam untuk menjaga ketenangan warga.
              </p>
              <div className="text-[11px] text-[#0E6243] font-semibold pt-1">
                Estimasi tambahan waktu: +3 Menit
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: BUAT LAPORAN BARU ── */}
      {isNewReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-[#DCE0E6] relative">
            <div className="bg-[#184C78] text-white p-5">
              <h3 className="font-['DM_Sans'] text-lg font-bold">Kirim Laporan / Tanggapan Warga</h3>
              <p className="text-xs text-white/75 mt-0.5">
                Laporan akan diteruskan ke dinas teknis terkait dan tercatat secara transparan di dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmitReport} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#184C78] mb-1">Pilih Proyek Terkait</label>
                <select
                  value={reportForm.proyek_id}
                  onChange={(e) => setReportForm({ ...reportForm, proyek_id: Number(e.target.value) })}
                  className="w-full p-2.5 border border-[#DCE0E6] rounded-lg bg-white outline-none focus:border-[#2980B9]"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama_proyek} ({p.nama_dinas || 'Dinas Terkait'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#184C78] mb-1">Kategori Laporan</label>
                <select
                  value={reportForm.kategori_aduan}
                  onChange={(e) => setReportForm({ ...reportForm, kategori_aduan: e.target.value })}
                  className="w-full p-2.5 border border-[#DCE0E6] rounded-lg bg-white outline-none focus:border-[#2980B9]"
                >
                  <option value="Dampak Lingkungan & Keselamatan">Dampak Lingkungan & Keselamatan</option>
                  <option value="Jadwal & Akses Jalan">Jadwal & Akses Jalan</option>
                  <option value="Kualitas Mutu Bangunan">Kualitas Mutu Bangunan</option>
                  <option value="Apresiasi & Fasilitas">Apresiasi & Fasilitas</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#184C78] mb-1">Judul Ringkas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rambu keselamatan malam hari perlu ditambah"
                  value={reportForm.judul}
                  onChange={(e) => setReportForm({ ...reportForm, judul: e.target.value })}
                  className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#184C78] mb-1">Uraian Detail Laporan</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Jelaskan secara runtut kejadian, kendala, atau saran konstruktif yang Anda temukan di lokasi..."
                  value={reportForm.isi_laporan}
                  onChange={(e) => setReportForm({ ...reportForm, isi_laporan: e.target.value })}
                  className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                />
                <span className="text-[10px] text-[#6C757D] mt-1 block">
                  🛡️ Dilengkapi Sensor Otomatis: Kata tidak pantas akan difilter demi etika komunikasi publik.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCE0E6]">
                <button
                  type="button"
                  onClick={() => setIsNewReportModalOpen(false)}
                  className="btn-ghost"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Kirim Laporan Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EVALUASI CACAT FISIK PASCA PROYEK ── */}
      {isEvaluasiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-[#DCE0E6] relative">
            <div className="bg-[#184C78] text-white p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="font-['DM_Sans'] text-lg font-bold">Laporkan Cacat Fisik Pasca-Proyek</h3>
              </div>
              <p className="text-xs text-white/75 mt-0.5">
                Pengaduan kerusakan fisik proyek selesai dengan analisis urgensi otomatis AI Google Gemini.
              </p>
            </div>

            <form onSubmit={handleSubmitEvaluasi} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#184C78] mb-1">Proyek Selesai</label>
                <select
                  value={evaluasiForm.proyek_id}
                  onChange={(e) => setEvaluasiForm({ ...evaluasiForm, proyek_id: Number(e.target.value) })}
                  className="w-full p-2.5 border border-[#DCE0E6] rounded-lg bg-white outline-none focus:border-[#2980B9]"
                >
                  {completedProjects.length > 0 ? (
                    completedProjects.map((p) => (
                      <option key={p.id} value={p.id}>{p.nama_proyek}</option>
                    ))
                  ) : (
                    <option value={3}>Normalisasi Drainase Jl. MT. Haryono</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#184C78] mb-1">Kategori Cacat Fisik</label>
                <select
                  value={evaluasiForm.kategori_cacat}
                  onChange={(e) => setEvaluasiForm({ ...evaluasiForm, kategori_cacat: e.target.value })}
                  className="w-full p-2.5 border border-[#DCE0E6] rounded-lg bg-white outline-none focus:border-[#2980B9]"
                >
                  <option value="Struktur Beton / Retak">Struktur Beton / Retak Ambles</option>
                  <option value="Endapan / Saluran Tersumbat">Endapan / Saluran Tersumbat</option>
                  <option value="Aspal Mengelupas / Lubang Jalan">Aspal Mengelupas / Lubang Jalan</option>
                  <option value="Fasilitas / Lampu / Rambu Rusak">Fasilitas / Lampu / Rambu Rusak</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#184C78] mb-1">Titik Patokan Lokasi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Depan Ruko No. 42 / Dekat Halte Busway"
                  value={evaluasiForm.lokasi_titik}
                  onChange={(e) => setEvaluasiForm({ ...evaluasiForm, lokasi_titik: e.target.value })}
                  className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#184C78] mb-1">Deskripsi Kerusakan Fisik</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Jelaskan jenis kerusakan, ukuran retakan/amblesan, dan potensi bahaya keselamatan bagi pejalan kaki atau kendaraan..."
                  value={evaluasiForm.deskripsi}
                  onChange={(e) => setEvaluasiForm({ ...evaluasiForm, deskripsi: e.target.value })}
                  className="w-full p-2.5 border border-[#DCE0E6] rounded-lg outline-none focus:border-[#2980B9]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCE0E6]">
                <button
                  type="button"
                  onClick={() => setIsEvaluasiModalOpen(false)}
                  className="btn-ghost"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Analisis AI &amp; Kirimkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
