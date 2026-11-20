import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  DollarSign,
  Download,
  Printer,
  Sparkles,
  MapPin,
  Clock,
  Search,
  RefreshCw,
  FolderKanban,
  Users,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import type {
  UserProfile,
  ProyekItem,
  DinasKinerjaItem,
  WilayahStatItem,
  RingkasanKabupatenItem,
  LeadTimeAdvantageData,
} from '../../types';
import { MOCK_DINAS_KINERJA, MOCK_EXECUTIVE_ALERTS } from '../../data/dashboardMockData';
import { MiniMapOverview } from './MiniMapOverview';
import { apiService } from '../../services/api';

interface PimpinanDashboardProps {
  currentUser: UserProfile;
  projects: ProyekItem[];
  onOpenProjectDetail?: (project: ProyekItem) => void;
  activeSection?: string;
  onSelectSection?: (section: string) => void;
  onOpenMapExplorer?: () => void;
}

// Helper untuk format skor kinerja agar responsif & konsisten baik angka desimal maupun non-desimal
const formatSkorKinerja = (score: number | string): string => {
  const val = typeof score === 'number' ? score : parseFloat(String(score));
  if (isNaN(val)) return String(score);
  return Number.isInteger(val) ? String(val) : val.toFixed(1);
};

export const PimpinanDashboard: React.FC<PimpinanDashboardProps> = ({
  currentUser,
  projects,
  activeSection,
  onSelectSection,
  onOpenMapExplorer,
}) => {
  const activeTab = (activeSection as any) || 'kinerja_dinas';

  const [dinasList] = useState<DinasKinerjaItem[]>(MOCK_DINAS_KINERJA);
  const [alertsList] = useState(MOCK_EXECUTIVE_ALERTS);

  // Live stats from API
  const [wilayahStats, setWilayahStats] = useState<WilayahStatItem[]>([]);
  const [ringkasanKabupaten, setRingkasanKabupaten] = useState<RingkasanKabupatenItem | null>(null);
  const [leadTimeData, setLeadTimeData] = useState<LeadTimeAdvantageData | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);
  const [searchKecamatan, setSearchKecamatan] = useState<string>('');
  const [filterHanyaAdaProyek, setFilterHanyaAdaProyek] = useState<boolean>(false);

  // Fetch real statistics from backend
  const fetchLiveStats = () => {
    setIsLoadingStats(true);
    Promise.all([
      apiService.getWilayahStats(),
      apiService.getRingkasanStats(),
      typeof apiService.getLeadTimeAdvantage === 'function' ? apiService.getLeadTimeAdvantage() : Promise.resolve(null),
    ])
      .then(([wStats, rStats, ltStats]) => {
        if (wStats && wStats.length > 0) {
          setWilayahStats(wStats);
        }
        if (rStats) {
          setRingkasanKabupaten(rStats);
        }
        if (ltStats) {
          setLeadTimeData(ltStats);
        }
      })
      .catch((err) => {
        console.warn('Gagal memuat statistik live:', err);
      })
      .finally(() => {
        setIsLoadingStats(false);
      });
  };

  useEffect(() => {
    fetchLiveStats();
  }, []);

  // Filtered kecamatan for Tab Sebaran Wilayah
  const displayedKecamatan = useMemo(() => {
    let list = wilayahStats;
    if (searchKecamatan.trim()) {
      const q = searchKecamatan.toLowerCase();
      list = list.filter(
        (w) =>
          w.nama_wilayah.toLowerCase().includes(q) ||
          (w.kode_wilayah && w.kode_wilayah.toLowerCase().includes(q))
      );
    }
    if (filterHanyaAdaProyek) {
      list = list.filter((w) => w.total_proyek > 0);
    }
    return list;
  }, [wilayahStats, searchKecamatan, filterHanyaAdaProyek]);

  // Aggregate stats across all agencies (fallback)
  const totalPaguDaerah = dinasList.reduce((acc, d) => acc + d.total_anggaran, 0);
  const totalRealisasiDaerah = dinasList.reduce((acc, d) => acc + d.realisasi_anggaran, 0);
  const realisasiPersen = ((totalRealisasiDaerah / totalPaguDaerah) * 100).toFixed(1);

  // Real statistics from ringkasan kabupaten
  const displayTotalPagu = ringkasanKabupaten
    ? (Number(ringkasanKabupaten.total_anggaran) / 1000000000).toFixed(1)
    : (totalPaguDaerah / 1000000000).toFixed(1);

  const displayRealisasi = ringkasanKabupaten
    ? (Number(ringkasanKabupaten.estimasi_penyerapan_anggaran) / 1000000000).toFixed(1)
    : (totalRealisasiDaerah / 1000000000).toFixed(1);

  const displayRealisasiPersen = ringkasanKabupaten
    ? ringkasanKabupaten.rasio_penyerapan_persen.toFixed(1)
    : realisasiPersen;

  const totalAduanDaerah = dinasList.reduce((acc, d) => acc + d.aduan_total, 0);
  const totalAduanSelesai = dinasList.reduce((acc, d) => acc + d.aduan_selesai, 0);
  const penyelesaianAduanPersen = ((totalAduanSelesai / totalAduanDaerah) * 100).toFixed(1);

  const avgRatingDaerah = (
    dinasList.reduce((acc, d) => acc + d.rata_rata_rating, 0) / dinasList.length
  ).toFixed(2);

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = 'Kode,Nama Dinas,Kepala Dinas,Total Proyek,Pagu Anggaran,Realisasi Anggaran,Aduan Selesai %,Rating Kepuasan,Skor Kinerja\n';
    const rows = dinasList
      .map(
        (d) =>
          `"${d.kode}","${d.nama_dinas}","${d.kepala_dinas}",${d.total_proyek},${d.total_anggaran},${d.realisasi_anggaran},${((d.aduan_selesai / d.aduan_total) * 100).toFixed(1)}%,${d.rata_rata_rating},${d.skor_kinerja}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Eksekutif_Pembangunan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-hero-in">
      {/* ── TOP EXECUTIVE BANNER ── */}
      <div className="bg-gradient-to-r from-[#184C78] via-[#0f3252] to-[#1a6fa8] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
              {currentUser.nama}
            </h1>
            <p className="text-white/80 text-xs sm:text-sm mt-1">
              Bupati / Walikota / Kepala Bappeda: Pengawasan Makro &amp; Evaluasi Strategis Kebijakan Pembangunan
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-white/70 mt-3 font-mono">
              <span>Periode Tahun Anggaran 2024 / 2025</span>
              <span>•</span>
              <span>
                Cakupan: {wilayahStats.length > 0 ? `${wilayahStats.length} Kecamatan` : '27 Kecamatan'},{' '}
                {ringkasanKabupaten ? `${ringkasanKabupaten.total_proyek} Proyek Fisik` : `${projects.length} Proyek Fisik`}
              </span>
            </div>
          </div>

          <div className="flex flex-row md:flex-col gap-2 shrink-0">
            <button
              onClick={() => onSelectSection?.('proyek')}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-102 cursor-pointer"
            >
              <FolderKanban className="w-4 h-4" />
              <span>Kelola &amp; Input Proyek</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-white text-[#184C78] font-bold text-xs rounded-xl shadow-xs hover:bg-slate-100 flex items-center justify-center gap-2 transition-transform hover:scale-102 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Data (CSV)</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs rounded-xl backdrop-blur-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan PDF</span>
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

      {/* ── EXECUTIVE KPI METRICS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#DCE0E6] shadow-xs">
          <div className="text-xs text-[#6C757D] font-semibold flex items-center justify-between">
            <span>Total Pagu Daerah</span>
            <DollarSign className="w-4 h-4 text-[#184C78]" />
          </div>
          <div className="text-2xl font-heading font-extrabold text-[#184C78] mt-1.5">
            Rp {displayTotalPagu} M
          </div>
          <div className="text-[11px] text-[#1A9E6E] font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Est. Serapan: Rp {displayRealisasi} M ({displayRealisasiPersen}%)</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE0E6] shadow-xs">
          <div className="text-xs text-[#6C757D] font-semibold flex items-center justify-between">
            <span>Indeks Kepuasan (IKM)</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-heading font-extrabold text-[#212529] mt-1.5 flex items-baseline gap-1">
            <span>{avgRatingDaerah}</span>
            <span className="text-sm font-normal text-[#6C757D]">/ 5.0</span>
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">
            Predikat: ⭐ Sangat Baik (A)
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE0E6] shadow-xs">
          <div className="text-xs text-[#6C757D] font-semibold flex items-center justify-between">
            <span>Respon Aduan Warga</span>
            <ShieldCheck className="w-4 h-4 text-[#1A9E6E]" />
          </div>
          <div className="text-2xl font-heading font-extrabold text-[#1A9E6E] mt-1.5">
            {penyelesaianAduanPersen}%
          </div>
          <div className="text-[11px] text-[#6C757D] font-medium mt-1">
            {totalAduanSelesai} dari {totalAduanDaerah} aduan rampung
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE0E6] shadow-xs">
          <div className="text-xs text-[#6C757D] font-semibold flex items-center justify-between">
            <span>Kecepatan Respons</span>
            <Clock className="w-4 h-4 text-[#2980B9]" />
          </div>
          <div className="text-2xl font-heading font-extrabold text-[#212529] mt-1.5">
            1.6 Hari
          </div>
          <div className="text-[11px] text-[#1A9E6E] font-semibold mt-1">
            Melampaui SLA Standar (Max 3 Hari)
          </div>
        </div>
      </div>

      {/* ── EARLY WARNING SYSTEM (EWS) ── */}
      <div className="bg-white rounded-2xl border border-[#DCE0E6] p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#E67E22]" />
            <h3 className="font-heading font-bold text-base text-[#184C78]">
              Early Warning System (Peringatan Dini Proyek Kritis)
            </h3>
          </div>
          <span className="text-[11px] font-bold bg-[#FEF3E7] text-[#9A4C08] px-2.5 py-0.5 rounded-full border border-[#FBD8B3]">
            {alertsList.length} Atensi Terdeteksi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {alertsList.map((alert) => {
            const isCritical = alert.level === 'critical';
            const isWarning = alert.level === 'warning';
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border space-y-2 flex flex-col justify-between ${
                  isCritical
                    ? 'bg-[#FDEDEC] border-[#FADBD8]'
                    : isWarning
                    ? 'bg-[#FEF3E7] border-[#FBD8B3]'
                    : 'bg-[#EBF4FB] border-[#c5def2]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                    <span className={isCritical ? 'text-[#E74C3C]' : isWarning ? 'text-[#9A4C08]' : 'text-[#184C78]'}>
                      {alert.dinas}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-white font-mono">
                      Urgensi: {alert.skor_urgensi}/5
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-[#212529] mt-1.5 leading-snug">
                    {alert.title}
                  </h4>
                  <p className="text-[11px] text-[#495057] mt-1 leading-relaxed">
                    {alert.deskripsi}
                  </p>
                </div>

                <div className="p-2.5 bg-white/80 rounded-lg text-[11px] border border-white">
                  <strong className="text-[#184C78]">Rekomendasi Tindakan:</strong> {alert.rekomendasi}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ACTIVE SECTION VIEW (DRIVEN BY SIDEBAR) ── */}
      {/* ── SECTION 1: MATRIKS KINERJA DINAS ── */}
      {(activeTab === 'kinerja_dinas' || activeTab === 'overview' || !['lead_time', 'sebaran_wilayah', 'sentimen_ai', 'laporan_eksekutif'].includes(activeTab)) && (
        <div className="bg-white rounded-2xl border border-[#DCE0E6] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#DCE0E6] flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-[#184C78]">
                Tabel Komparasi Efektivitas 5 Organisasi Perangkat Daerah (OPD)
              </h3>
              <p className="text-xs text-[#6C757D]">
                Evaluasi komprehensif serapan anggaran, kepatuhan jadwal, dan kepuasan masyarakat.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[820px]">
              <thead className="bg-[#F5F7FA] text-[#184C78] font-heading font-bold border-b border-[#DCE0E6]">
                <tr>
                  <th className="p-3.5 min-w-[200px]">Organisasi Perangkat Daerah</th>
                  <th className="p-3.5 min-w-[150px]">Kepala Dinas</th>
                  <th className="p-3.5 text-center whitespace-nowrap min-w-[130px]">Proyek (Total / Selesai)</th>
                  <th className="p-3.5 min-w-[160px] w-48">Serapan Anggaran</th>
                  <th className="p-3.5 text-center whitespace-nowrap min-w-[130px]">Penyelesaian Aduan</th>
                  <th className="p-3.5 text-center whitespace-nowrap min-w-[95px]">Rating Warga</th>
                  <th className="p-3.5 text-right whitespace-nowrap min-w-[125px]">Skor Kinerja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE0E6]">
                {dinasList.map((dinas) => {
                  const serapanPersen = ((dinas.realisasi_anggaran / dinas.total_anggaran) * 100).toFixed(0);
                  const aduanPersen = ((dinas.aduan_selesai / dinas.aduan_total) * 100).toFixed(0);

                  return (
                    <tr key={dinas.id} className="hover:bg-[#F5F7FA]/80 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-[#212529]">{dinas.nama_dinas}</div>
                        <span className="text-[10px] font-bold text-[#184C78] bg-[#EBF4FB] px-1.5 py-0.5 rounded">
                          {dinas.kode}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#495057]">
                        {dinas.kepala_dinas}
                      </td>
                      <td className="p-3.5 text-center font-semibold text-[#212529] whitespace-nowrap">
                        {dinas.total_proyek} / <span className="text-[#1A9E6E]">{dinas.proyek_selesai} Selesai</span>
                        {dinas.proyek_terlambat > 0 && (
                          <span className="text-[#E74C3C] block text-[10px]">({dinas.proyek_terlambat} Terlambat)</span>
                        )}
                      </td>
                      <td className="p-3.5 w-48">
                        <div className="flex justify-between text-[11px] font-semibold text-[#184C78] mb-1">
                          <span>Rp {(dinas.realisasi_anggaran / 1000000000).toFixed(1)}M</span>
                          <span className="font-bold">{serapanPersen}%</span>
                        </div>
                        <div className="w-full bg-[#DCE0E6] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#184C78] h-full rounded-full"
                            style={{ width: `${serapanPersen}%` }}
                          />
                        </div>
                      </td>
                      <td className="p-3.5 text-center font-bold text-[#184C78] whitespace-nowrap">
                        <span className="text-[#1A9E6E]">{dinas.aduan_selesai}</span> / {dinas.aduan_total} ({aduanPersen}%)
                      </td>
                      <td className="p-3.5 text-center font-bold text-amber-500 whitespace-nowrap">
                        ⭐ {dinas.rata_rata_rating.toFixed(2)}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap min-w-[125px]">
                        <div className="flex items-center justify-end">
                          <span
                            className={`inline-flex items-center justify-center whitespace-nowrap px-2.5 sm:px-3 py-1 rounded-full text-xs font-extrabold tracking-tight tabular-nums shadow-2xs border transition-all ${
                              dinas.skor_kinerja >= 95
                                ? 'bg-[#E6F7F1] text-[#1A9E6E] border-[#B7EBD8]'
                                : dinas.skor_kinerja >= 90
                                ? 'bg-[#EBF4FB] text-[#184C78] border-[#c5def2]'
                                : 'bg-[#FEF3E7] text-[#E67E22] border-[#FBD8B3]'
                            }`}
                          >
                            <span className="font-black text-xs sm:text-[13px]">{formatSkorKinerja(dinas.skor_kinerja)}</span>
                            <span className="text-[10px] sm:text-[11px] font-semibold opacity-70 ml-1">/ 100</span>
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: LEAD TIME ADVANTAGE & PERINGATAN DINI (FASE 4) ── */}
      {activeTab === 'lead_time' && (
        <div className="space-y-6 animate-fade-in">
          {/* Executive Header Banner */}
          <div className="bg-gradient-to-r from-[#184C78] via-[#1E5D94] to-[#2980B9] text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
            <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white border border-white/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Transparansi Hulu SiRUP &amp; LPSE Lamongan</span>
                  </span>
                  <span className="text-[10px] font-mono text-cyan-200 bg-cyan-950/40 border border-cyan-400/30 px-2.5 py-1 rounded-full">
                    Sistem GIS Peringatan Dini
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-white">
                  Executive Dashboard: Lead Time Advantage
                </h2>
                <p className="text-xs sm:text-sm text-cyan-100/90 mt-1 max-w-2xl leading-relaxed">
                  Platform transparansi yang memberi tahu warga rencana penutupan jalan jauh lebih awal dibanding Google Maps, memanfaatkan data kontrak pengadaan hulu Pemkab Lamongan.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchLiveStats}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer self-start md:self-auto shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStats ? 'animate-spin' : ''}`} />
                <span>Sinkronisasi Data</span>
              </button>
            </div>
          </div>

          {/* 4 Kartu Metrik Utama */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metrik 1: Rata-rata Lead Time */}
            <div className="bg-white p-5 rounded-2xl border-2 border-indigo-200 shadow-sm relative overflow-hidden">
              <div className="text-xs text-[#6C757D] font-bold uppercase tracking-wide flex items-center justify-between">
                <span>Rata-rata Lead Time</span>
                <Clock className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-heading font-black text-indigo-900 mt-2">
                {leadTimeData?.label_hari_peringatan_dini || '18 Hari Peringatan Dini'}
              </div>
              <p className="text-[11px] text-[#6C757D] mt-1.5 leading-relaxed">
                Rata-rata warga tahu rencana proyek <strong className="text-indigo-800">{leadTimeData?.avg_lead_time_hari || 18.4} hari</strong> sebelum alat berat mulai mobilisasi ke lapangan.
              </p>
            </div>

            {/* Metrik 2: Warga Terjangkau Notifikasi */}
            <div className="bg-white p-5 rounded-2xl border-2 border-emerald-200 shadow-sm relative overflow-hidden">
              <div className="text-xs text-[#6C757D] font-bold uppercase tracking-wide flex items-center justify-between">
                <span>Warga Terjangkau Notifikasi</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-heading font-black text-emerald-900 mt-2">
                {(leadTimeData?.total_unique_warga_terjangkau || 0).toLocaleString('id-ID')}{' '}
                <span className="text-sm font-bold text-emerald-700">Warga</span>
              </div>
              <p className="text-[11px] text-[#6C757D] mt-1.5 leading-relaxed">
                Total akun warga unik yang telah menerima pesan pengalihan jalur via Web Push &amp; In-App.
              </p>
            </div>

            {/* Metrik 3: Tingkat Akurasi Jadwal Dinas */}
            <div className="bg-white p-5 rounded-2xl border-2 border-amber-200 shadow-sm relative overflow-hidden">
              <div className="text-xs text-[#6C757D] font-bold uppercase tracking-wide flex items-center justify-between">
                <span>Akurasi Jadwal Dinas</span>
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-lg sm:text-xl font-heading font-extrabold text-amber-900 mt-2">
                {leadTimeData?.akurasi_status || 'Optimal (Deviasi 1.2 hari)'}
              </div>
              <p className="text-[11px] text-[#6C757D] mt-1.5 leading-relaxed">
                Rata-rata selisih tanggal mulai fisik lapangan vs target kontrak SiRUP: <strong className="text-amber-800">{leadTimeData?.tingkat_akurasi_jadwal_hari || 0} hari</strong>.
              </p>
            </div>

            {/* Metrik 4: Notifikasi Rute Overlap Prioritas Tinggi */}
            <div className="bg-white p-5 rounded-2xl border-2 border-rose-200 shadow-sm relative overflow-hidden">
              <div className="text-xs text-[#6C757D] font-bold uppercase tracking-wide flex items-center justify-between">
                <span>Prioritas Tinggi (Overlap)</span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-heading font-black text-rose-900 mt-2">
                {(leadTimeData?.breakdown_priority?.tinggi || 0).toLocaleString('id-ID')}{' '}
                <span className="text-sm font-bold text-rose-700">Peringatan</span>
              </div>
              <p className="text-[11px] text-[#6C757D] mt-1.5 leading-relaxed">
                Notifikasi rute harian komuter yang beririsan langsung (&le; 100m) dengan zona pekerjaan jalan.
              </p>
            </div>
          </div>

          {/* Chart Tren Lead Time per Bulan & Breakdown Metrik */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Bar Chart: Tren Rata-rata Lead Time per Bulan */}
            <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-[#DCE0E6] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#DCE0E6] pb-3">
                <div>
                  <h3 className="font-heading font-bold text-sm sm:text-base text-[#184C78] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#2980B9]" />
                    <span>Tren Rata-rata Lead Time Peringatan Dini per Bulan</span>
                  </h3>
                  <p className="text-xs text-[#6C757D] mt-0.5">
                    Evaluasi kesiapan dinas dalam mempublikasikan rencana proyek sebelum tanggal mulai fisik.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg shrink-0">
                  Target: &ge; 14 Hari
                </span>
              </div>

              {/* Bar Chart Container */}
              <div className="pt-4 pb-2">
                <div className="h-48 flex items-end gap-3 sm:gap-6 justify-between px-2 border-b border-slate-200">
                  {(leadTimeData?.tren_lead_time_per_bulan || []).map((t, idx) => {
                    const maxVal = Math.max(
                      ...((leadTimeData?.tren_lead_time_per_bulan || []).map((x) => x.avg_lead_time_hari)),
                      30
                    );
                    const heightPercent = Math.max(15, Math.min(100, (t.avg_lead_time_hari / maxVal) * 100));
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <span className="text-[11px] font-bold text-indigo-900 group-hover:scale-110 transition-transform">
                          {t.avg_lead_time_hari}d
                        </span>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full max-w-[42px] bg-gradient-to-t from-indigo-700 via-blue-600 to-cyan-400 rounded-t-xl group-hover:brightness-110 transition-all shadow-sm"
                          title={`${t.bulan}: Rata-rata ${t.avg_lead_time_hari} hari (${t.jumlah_proyek} proyek)`}
                        />
                        <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600 truncate max-w-full mt-1">
                          {t.bulan}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#6C757D] pt-1">
                <span>* Data dihitung dari selisih `tanggal_mulai_rencana - tanggal_input_sistem`.</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Seluruh proyek terverifikasi SiRUP LPSE
                </span>
              </div>
            </div>

            {/* Breakdown Kanal Target & Prioritas */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#DCE0E6] shadow-xs space-y-4">
              <div className="border-b border-[#DCE0E6] pb-3">
                <h3 className="font-heading font-bold text-sm sm:text-base text-[#184C78] flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <span>Komposisi Penargetan &amp; Prioritas</span>
                </h3>
                <p className="text-xs text-[#6C757D] mt-0.5">
                  Distribusi log notifikasi berdasarkan metode deteksi spasial.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      Radius Pemukiman (Haversine)
                    </span>
                    <span className="font-bold text-[#184C78]">
                      {(leadTimeData?.breakdown_target_type?.radius || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      style={{
                        width: `${Math.min(
                          100,
                          ((leadTimeData?.breakdown_target_type?.radius || 0) /
                            Math.max(1, leadTimeData?.total_notifikasi_terkirim || 1)) *
                            100
                        )}%`,
                      }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      Langganan Warga (Follow)
                    </span>
                    <span className="font-bold text-[#184C78]">
                      {(leadTimeData?.breakdown_target_type?.subscription || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      style={{
                        width: `${Math.min(
                          100,
                          ((leadTimeData?.breakdown_target_type?.subscription || 0) /
                            Math.max(1, leadTimeData?.total_notifikasi_terkirim || 1)) *
                            100
                        )}%`,
                      }}
                      className="h-full bg-amber-500 rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                      Rute Overlap Harian (&le; 100m)
                    </span>
                    <span className="font-bold text-rose-700">
                      {(leadTimeData?.breakdown_target_type?.route_overlap || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      style={{
                        width: `${Math.min(
                          100,
                          ((leadTimeData?.breakdown_target_type?.route_overlap || 0) /
                            Math.max(1, leadTimeData?.total_notifikasi_terkirim || 1)) *
                            100
                        )}%`,
                      }}
                      className="h-full bg-rose-600 rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Priority Badges */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 block mb-2">Tingkat Urgensi Notifikasi:</span>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-xs text-slate-500">Normal</div>
                    <div className="text-base font-extrabold text-[#184C78] mt-0.5">
                      {leadTimeData?.breakdown_priority.normal || 0}
                    </div>
                  </div>
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl">
                    <div className="text-xs text-red-600 font-semibold">Tinggi (Overlap)</div>
                    <div className="text-base font-extrabold text-red-700 mt-0.5">
                      {leadTimeData?.breakdown_priority.tinggi || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabel Jangkauan Warga per Proyek */}
          <div className="bg-white rounded-2xl border border-[#DCE0E6] shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#DCE0E6] flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-sm sm:text-base text-[#184C78] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#2980B9]" />
                  <span>Daftar Proyek dengan Jangkauan Warga Terbesar</span>
                </h3>
                <p className="text-xs text-[#6C757D]">
                  Monitoring proyek-proyek strategis dengan jangkauan notifikasi peringatan dini tertinggi di Kabupaten Lamongan.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead className="bg-[#F5F7FA] text-[#184C78] font-heading font-bold border-b border-[#DCE0E6]">
                  <tr>
                    <th className="p-3.5">Nama Proyek Konstruksi</th>
                    <th className="p-3.5 text-center">ID Proyek</th>
                    <th className="p-3.5 text-right">Warga Unik Terjangkau</th>
                    <th className="p-3.5 text-center">Status Peringatan Dini</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE0E6]">
                  {(leadTimeData?.warga_terjangkau_per_proyek || []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-400">
                        Belum ada data riwayat notifikasi proyek yang tercatat.
                      </td>
                    </tr>
                  ) : (
                    (leadTimeData?.warga_terjangkau_per_proyek || []).slice(0, 10).map((proj, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-bold text-[#184C78]">
                          {proj.nama_proyek}
                        </td>
                        <td className="p-3.5 text-center font-mono text-slate-500">
                          #{proj.proyek_id}
                        </td>
                        <td className="p-3.5 text-right font-extrabold text-emerald-700">
                          {(proj.unique_warga ?? 0).toLocaleString('id-ID')} Warga
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                            Aktif Tersebar
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT 2: SEBARAN WILAYAH & REKAPITULASI AGREGAT ── */}
      {activeTab === 'sebaran_wilayah' && (
        <div className="space-y-6">
          {/* Top Aggregate Visual Chart & Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-[#DCE0E6] shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCE0E6] pb-4">
              <div>
                <h3 className="font-heading font-bold text-base text-[#184C78] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#2980B9]" />
                  <span>Rekapitulasi Agregat Proyek per Wilayah Kecamatan (Kabupaten Lamongan)</span>
                </h3>
                <p className="text-xs text-[#6C757D] mt-0.5">
                  Distribusi sebaran proyek fisik, status pengerjaan, dan alokasi dana APBD di 27 kecamatan Kabupaten Lamongan.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-[#2980B9] font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2980B9]" /> Berjalan
                </span>
                <span className="flex items-center gap-1 text-[#1A9E6E] font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1A9E6E]" /> Selesai
                </span>
                <span className="flex items-center gap-1 text-[#E74C3C] font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E74C3C]" /> Tertunda
                </span>
                <span className="flex items-center gap-1 text-[#E67E22] font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E67E22]" /> Tinjau Ulang
                </span>
              </div>
            </div>

            {/* Filter and Search Bar for 27 Kecamatan */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#DCE0E6]">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-[#6C757D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari kecamatan (mis. Babat, Lamongan Kota)..."
                  value={searchKecamatan}
                  onChange={(e) => setSearchKecamatan(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#DCE0E6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#184C78]"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-[#495057] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterHanyaAdaProyek}
                    onChange={(e) => setFilterHanyaAdaProyek(e.target.checked)}
                    className="rounded border-[#DCE0E6] text-[#184C78] focus:ring-0"
                  />
                  <span>
                    Hanya dengan proyek ({wilayahStats.filter((w) => w.total_proyek > 0).length})
                  </span>
                </label>
                <button
                  onClick={fetchLiveStats}
                  title="Segarkan data dari server"
                  className="p-1.5 text-[#184C78] hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStats ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {isLoadingStats ? (
              <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-[#184C78] border-t-transparent rounded-full animate-spin" />
                <span>Memuat data agregat 27 kecamatan dari server...</span>
              </div>
            ) : displayedKecamatan.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-[#F8FAFC] rounded-xl border border-dashed border-[#DCE0E6]">
                Tidak ada kecamatan yang cocok dengan kriteria pencarian/filter.
              </div>
            ) : (
              /* Visual Bar Charts per Subdistrict (Real Live API Data) */
              <div className="space-y-4">
                {displayedKecamatan.map((kec) => {
                  const totalProyekKec = kec.total_proyek;
                  const berjalanPct = totalProyekKec > 0 ? ((kec.jumlah_berjalan / totalProyekKec) * 100).toFixed(0) : '0';
                  const selesaiPct = totalProyekKec > 0 ? ((kec.jumlah_selesai / totalProyekKec) * 100).toFixed(0) : '0';
                  const ditangguhkanCount = (kec.jumlah_tertunda || 0) + (kec.jumlah_dalam_peninjauan_ulang || 0);
                  const ditangguhkanPct = totalProyekKec > 0 ? ((ditangguhkanCount / totalProyekKec) * 100).toFixed(0) : '0';
                  const totalAnggaranMiliar = (Number(kec.total_anggaran) / 1000000000).toFixed(2);
                  const penyerapanMiliar = (Number(kec.estimasi_penyerapan_anggaran) / 1000000000).toFixed(2);

                  return (
                    <div key={kec.wilayah_id} className="p-4 bg-[#F8FAFC] rounded-xl border border-[#DCE0E6] space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                        <div>
                          <strong className="text-sm font-bold text-[#184C78]">{kec.nama_wilayah}</strong>
                          {kec.kode_wilayah && (
                            <span className="text-[#6C757D] text-[11px] ml-2 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                              {kec.kode_wilayah}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 font-semibold text-xs">
                          <span className="text-slate-700">Total: <strong>{totalProyekKec} Proyek</strong></span>
                          <span className="text-[#184C78]">Pagu: <strong>Rp {totalAnggaranMiliar} M</strong></span>
                          <span className="text-emerald-700">Est. Serapan: <strong>Rp {penyerapanMiliar} M</strong></span>
                          <span className="text-amber-700">Avg Progres: <strong>{kec.rata_rata_progres}%</strong></span>
                        </div>
                      </div>

                      {/* Stacked Percentage Bar Chart */}
                      {totalProyekKec > 0 ? (
                        <div className="w-full bg-[#E2E8F0] h-3.5 rounded-full overflow-hidden flex shadow-inner">
                          {kec.jumlah_berjalan > 0 && (
                            <div
                              style={{ width: `${berjalanPct}%` }}
                              className="bg-[#2980B9] h-full transition-all"
                              title={`Berjalan: ${kec.jumlah_berjalan} Proyek (${berjalanPct}%)`}
                            />
                          )}
                          {kec.jumlah_selesai > 0 && (
                            <div
                              style={{ width: `${selesaiPct}%` }}
                              className="bg-[#1A9E6E] h-full transition-all"
                              title={`Selesai: ${kec.jumlah_selesai} Proyek (${selesaiPct}%)`}
                            />
                          )}
                          {ditangguhkanCount > 0 && (
                            <div
                              style={{ width: `${ditangguhkanPct}%` }}
                              className="bg-[#E74C3C] h-full transition-all"
                              title={`Ditangguhkan: ${ditangguhkanCount} Proyek (${ditangguhkanPct}%)`}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="w-full bg-slate-200/60 h-2.5 rounded-full" title="Belum ada proyek" />
                      )}

                      {/* Numeric breakdown badges */}
                      <div className="flex flex-wrap items-center justify-between text-[11px] text-[#6C757D] pt-1 border-t border-slate-200/60 gap-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <span>Sedang Berjalan: <strong className="text-[#2980B9] font-bold">{kec.jumlah_berjalan}</strong></span>
                          <span>Selesai (FHO): <strong className="text-[#1A9E6E] font-bold">{kec.jumlah_selesai}</strong></span>
                          <span>Ditangguhkan: <strong className={ditangguhkanCount > 0 ? "text-[#E74C3C] font-bold" : "text-slate-500"}>{ditangguhkanCount}</strong></span>
                        </div>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-slate-600">
                          ID Wilayah: {kec.wilayah_id}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Strategic Executive Recommendations */}
          <div className="bg-white p-5 rounded-2xl border border-[#DCE0E6] shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-base text-[#184C78]">
              Rekomendasi Kebijakan Pimpinan Daerah Berbasis Data Wilayah
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-[#EBF4FB] rounded-xl border border-[#c5def2] text-[#184C78] space-y-1">
                <div className="font-bold">1. Akselerasi Koridor Deket &amp; Sukodadi:</div>
                <p className="text-[#212529] text-[11px] leading-relaxed">
                  Terdapat masing-masing 1 proyek tertunda akibat utilitas kabel &amp; pipa. Perlu fasilitasi koordinasi lintas sektoral dengan PLN dan PDAM.
                </p>
              </div>
              <div className="p-3.5 bg-[#E6F7F1] rounded-xl border border-[#B7EBD8] text-[#0E6243] space-y-1">
                <div className="font-bold">2. Pencapaian Wilayah Paciran &amp; Babat:</div>
                <p className="text-[#212529] text-[11px] leading-relaxed">
                  Penyelesaian proyek infrastruktur pelabuhan &amp; jembatan penghubung tepat waktu dengan serapan anggaran fisik di atas 85%.
                </p>
              </div>
              <div className="p-3.5 bg-[#FEF3E7] rounded-xl border border-[#FBD8B3] text-[#9A4C08] space-y-1">
                <div className="font-bold">3. Optimalisasi Pembangunan Perkotaan:</div>
                <p className="text-[#212529] text-[11px] leading-relaxed">
                  Kecamatan Lamongan (Kota) menyerap porsi terbesar (Rp 34.5 M). Fokuskan pada penyelesaian tuntas ruang terbuka hijau dan penataan pedestrian.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT 3: SENTIMEN & ASPIRASI AI ── */}
      {activeTab === 'sentimen_ai' && (
        <div className="bg-white rounded-2xl border border-[#DCE0E6] p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#2980B9]" />
              <h3 className="font-heading font-bold text-base text-[#184C78]">
                Analisis Aspirasi Publik &amp; AI Sentimen (Groq AI Engine)
              </h3>
            </div>
            <span className="text-xs bg-[#EBF4FB] text-[#184C78] font-bold px-3 py-1 rounded-full">
              Sampel: 384 Ulasan &amp; Aduan Warga
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#E6F7F1] rounded-2xl border border-[#B7EBD8] space-y-2">
              <div className="text-xs font-bold text-[#0E6243] flex items-center justify-between">
                <span>Sentimen Positif Warga</span>
                <span className="text-base font-extrabold">78.4%</span>
              </div>
              <p className="text-xs text-[#212529] leading-relaxed">
                Mayoritas warga mengapresiasi kecepatan penyelesaian gorong-gorong anti banjir dan taman ramah disabilitas.
              </p>
            </div>

            <div className="p-4 bg-[#FEF3E7] rounded-2xl border border-[#FBD8B3] space-y-2">
              <div className="text-xs font-bold text-[#9A4C08] flex items-center justify-between">
                <span>Sentimen Netral / Pertanyaan</span>
                <span className="text-base font-extrabold">14.2%</span>
              </div>
              <p className="text-xs text-[#212529] leading-relaxed">
                Terkait informasi rute jalan alternatif dan jadwal pengalihan lalu lintas pada jam sibuk kerja.
              </p>
            </div>

            <div className="p-4 bg-[#FDEDEC] rounded-2xl border border-[#FADBD8] space-y-2">
              <div className="text-xs font-bold text-[#E74C3C] flex items-center justify-between">
                <span>Keluhan Konstruksi (Negatif)</span>
                <span className="text-base font-extrabold">7.4%</span>
              </div>
              <p className="text-xs text-[#212529] leading-relaxed">
                Fokus isu: Debu material galian jalan dan kebutuhan lampu pengaman malam hari di area galian aktif.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT 4: PUSAT LAPORAN EKSEKUTIF ── */}
      {activeTab === 'laporan_eksekutif' && (
        <div className="bg-white rounded-2xl border border-[#DCE0E6] p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-[#184C78]">
                Pusat Unduh Dokumen &amp; Laporan Berkala Pimpinan
              </h3>
              <p className="text-xs text-[#6C757D] mt-0.5">
                Dokumen resmi siap cetak untuk bahan Rapat Koordinasi Pimpinan Daerah (Rakorpim).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-[#F5F7FA] rounded-2xl border border-[#DCE0E6] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBF4FB] text-[#184C78] flex items-center justify-center font-bold">
                PDF
              </div>
              <h4 className="font-bold text-sm text-[#212529]">Ringkasan Eksekutif Triwulan I</h4>
              <p className="text-xs text-[#6C757D]">
                Laporan komprehensif serapan anggaran, KPI 5 dinas, serta analisis risiko proyek.
              </p>
              <button
                onClick={handleExportPDF}
                className="w-full py-2 bg-[#184C78] hover:bg-[#0f3252] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Ringkasan (PDF)</span>
              </button>
            </div>

            <div className="p-5 bg-[#F5F7FA] rounded-2xl border border-[#DCE0E6] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E6F7F1] text-[#1A9E6E] flex items-center justify-center font-bold">
                CSV
              </div>
              <h4 className="font-bold text-sm text-[#212529]">Dataset Kinerja OPD (Spreadsheet)</h4>
              <p className="text-xs text-[#6C757D]">
                Matriks mentah nilai kinerja seluruh dinas untuk olah data internal Bappeda.
              </p>
              <button
                onClick={handleExportCSV}
                className="w-full py-2 bg-[#1A9E6E] hover:bg-[#147d57] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Dataset (CSV)</span>
              </button>
            </div>

            <div className="p-5 bg-[#F5F7FA] rounded-2xl border border-[#DCE0E6] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FEF3E7] text-[#E67E22] flex items-center justify-center font-bold">
                JSON
              </div>
              <h4 className="font-bold text-sm text-[#212529]">Ekspor Data Spasial GeoJSON</h4>
              <p className="text-xs text-[#6C757D]">
                Layer titik koordinat seluruh proyek pembangunan untuk integrasi GIS daerah.
              </p>
              <button
                onClick={() => {
                  const geojson = {
                    type: 'FeatureCollection',
                    features: projects.map((p) => ({
                      type: 'Feature',
                      geometry: { type: 'Point', coordinates: [p.longitude, p.latitude] },
                      properties: { name: p.nama_proyek, anggaran: p.anggaran, status: p.status },
                    })),
                  };
                  const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `CivicTrack_GeoJSON_${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                }}
                className="w-full py-2 bg-[#E67E22] hover:bg-[#cf6d17] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Spasial GeoJSON</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
