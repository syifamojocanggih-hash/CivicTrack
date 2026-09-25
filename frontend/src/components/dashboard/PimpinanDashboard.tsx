import React, { useState } from 'react';
import {
  Award,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  FileSpreadsheet,
  ShieldCheck,
  DollarSign,
  Download,
  Printer,
  Sparkles,
  MapPin,
  Clock,
} from 'lucide-react';
import type { UserProfile, ProyekItem, DinasKinerjaItem } from '../../types';
import { MOCK_DINAS_KINERJA, MOCK_EXECUTIVE_ALERTS } from '../../data/dashboardMockData';

interface PimpinanDashboardProps {
  currentUser: UserProfile;
  projects: ProyekItem[];
  onOpenProjectDetail?: (project: ProyekItem) => void;
}

export const PimpinanDashboard: React.FC<PimpinanDashboardProps> = ({
  currentUser,
  projects,
}) => {
  const [activeTab, setActiveTab] = useState<'kinerja_dinas' | 'sebaran_wilayah' | 'sentimen_ai' | 'laporan_eksekutif'>('kinerja_dinas');

  const [dinasList] = useState<DinasKinerjaItem[]>(MOCK_DINAS_KINERJA);
  const [alertsList] = useState(MOCK_EXECUTIVE_ALERTS);

  // Aggregate stats across all agencies
  const totalPaguDaerah = dinasList.reduce((acc, d) => acc + d.total_anggaran, 0);
  const totalRealisasiDaerah = dinasList.reduce((acc, d) => acc + d.realisasi_anggaran, 0);
  const realisasiPersen = ((totalRealisasiDaerah / totalPaguDaerah) * 100).toFixed(1);

  const totalAduanDaerah = dinasList.reduce((acc, d) => acc + d.aduan_total, 0);
  const totalAduanSelesai = dinasList.reduce((acc, d) => acc + d.aduan_selesai, 0);
  const penyelesaianAduanPersen = ((totalAduanSelesai / totalAduanDaerah) * 100).toFixed(1);

  const avgRatingDaerah = (
    dinasList.reduce((acc, d) => acc + d.rata_rata_rating, 0) / dinasList.length
  ).toFixed(2);

  // Regional breakdown mock data
  const wilayahBreakdown = [
    { nama: 'Kecamatan Lowokwaru', proyekCount: 14, anggaran: 34500000000, avgProgress: 68, status: 'On Track' },
    { nama: 'Kecamatan Blimbing', proyekCount: 11, anggaran: 28400000000, avgProgress: 62, status: 'On Track' },
    { nama: 'Kecamatan Klojen', proyekCount: 9, anggaran: 22800000000, avgProgress: 88, status: 'Hampir Rampung' },
    { nama: 'Kecamatan Sukun', proyekCount: 8, anggaran: 16900000000, avgProgress: 54, status: 'Perlu Akselerasi' },
    { nama: 'Kecamatan Kedungkandang', proyekCount: 6, anggaran: 8800000000, avgProgress: 72, status: 'On Track' },
  ];

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
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-200 border border-amber-400/30 rounded-full text-xs font-semibold tracking-wide mb-3">
              <Award className="w-4 h-4 text-amber-300" />
              <span>Executive Dashboard Pimpinan Daerah</span>
            </div>
            <h1 className="font-['DM_Sans'] text-2xl sm:text-3xl font-extrabold tracking-tight">
              {currentUser.nama}
            </h1>
            <p className="text-white/80 text-xs sm:text-sm mt-1">
              Bupati / Walikota / Kepala Bappeda — Pengawasan Makro &amp; Evaluasi Strategis Kebijakan Pembangunan
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-white/70 mt-3 font-mono">
              <span>Periode Tahun Anggaran 2024 / 2025</span>
              <span>•</span>
              <span>Cakupan: 5 Dinas Teknis, 48 Proyek Fisik</span>
            </div>
          </div>

          <div className="flex flex-row md:flex-col gap-2 shrink-0">
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

      {/* ── EXECUTIVE KPI METRICS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#DCE0E6] shadow-xs">
          <div className="text-xs text-[#6C757D] font-semibold flex items-center justify-between">
            <span>Total Pagu Daerah</span>
            <DollarSign className="w-4 h-4 text-[#184C78]" />
          </div>
          <div className="text-2xl font-['DM_Sans'] font-extrabold text-[#184C78] mt-1.5">
            Rp {(totalPaguDaerah / 1000000000).toFixed(1)} M
          </div>
          <div className="text-[11px] text-[#1A9E6E] font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Realisasi: Rp {(totalRealisasiDaerah / 1000000000).toFixed(1)} M ({realisasiPersen}%)</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DCE0E6] shadow-xs">
          <div className="text-xs text-[#6C757D] font-semibold flex items-center justify-between">
            <span>Indeks Kepuasan (IKM)</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-['DM_Sans'] font-extrabold text-[#212529] mt-1.5 flex items-baseline gap-1">
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
          <div className="text-2xl font-['DM_Sans'] font-extrabold text-[#1A9E6E] mt-1.5">
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
          <div className="text-2xl font-['DM_Sans'] font-extrabold text-[#212529] mt-1.5">
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
            <h3 className="font-['DM_Sans'] font-bold text-base text-[#184C78]">
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

      {/* ── TABS NAVIGATION ── */}
      <div className="flex border-b border-[#DCE0E6] bg-white rounded-xl px-2 pt-2 shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('kinerja_dinas')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold font-['DM_Sans'] transition-all border-b-2 cursor-pointer shrink-0 ${
            activeTab === 'kinerja_dinas'
              ? 'border-[#184C78] text-[#184C78]'
              : 'border-transparent text-[#6C757D] hover:text-[#184C78]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Matriks Kinerja Antar-Dinas</span>
        </button>

        <button
          onClick={() => setActiveTab('sebaran_wilayah')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold font-['DM_Sans'] transition-all border-b-2 cursor-pointer shrink-0 ${
            activeTab === 'sebaran_wilayah'
              ? 'border-[#184C78] text-[#184C78]'
              : 'border-transparent text-[#6C757D] hover:text-[#184C78]'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Sebaran Wilayah &amp; Realisasi</span>
        </button>

        <button
          onClick={() => setActiveTab('sentimen_ai')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold font-['DM_Sans'] transition-all border-b-2 cursor-pointer shrink-0 ${
            activeTab === 'sentimen_ai'
              ? 'border-[#184C78] text-[#184C78]'
              : 'border-transparent text-[#6C757D] hover:text-[#184C78]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Analisis Aspirasi Publik (AI)</span>
        </button>

        <button
          onClick={() => setActiveTab('laporan_eksekutif')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold font-['DM_Sans'] transition-all border-b-2 cursor-pointer shrink-0 ${
            activeTab === 'laporan_eksekutif'
              ? 'border-[#184C78] text-[#184C78]'
              : 'border-transparent text-[#6C757D] hover:text-[#184C78]'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Pusat Unduh Laporan Eksekutif</span>
        </button>
      </div>

      {/* ── TAB CONTENT 1: MATRIKS KINERJA DINAS ── */}
      {activeTab === 'kinerja_dinas' && (
        <div className="bg-white rounded-2xl border border-[#DCE0E6] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#DCE0E6] flex items-center justify-between">
            <div>
              <h3 className="font-['DM_Sans'] font-bold text-base text-[#184C78]">
                Tabel Komparasi Efektivitas 5 Organisasi Perangkat Daerah (OPD)
              </h3>
              <p className="text-xs text-[#6C757D]">
                Evaluasi komprehensif serapan anggaran, kepatuhan jadwal, dan kepuasan masyarakat.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7FA] text-[#184C78] font-['DM_Sans'] font-bold border-b border-[#DCE0E6]">
                <tr>
                  <th className="p-3.5">Organisasi Perangkat Daerah</th>
                  <th className="p-3.5">Kepala Dinas</th>
                  <th className="p-3.5 text-center">Proyek (Total / Selesai)</th>
                  <th className="p-3.5">Serapan Anggaran</th>
                  <th className="p-3.5 text-center">Penyelesaian Aduan</th>
                  <th className="p-3.5 text-center">Rating Warga</th>
                  <th className="p-3.5 text-right">Skor Kinerja</th>
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
                      <td className="p-3.5 text-center font-semibold text-[#212529]">
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
                      <td className="p-3.5 text-center font-bold text-[#184C78]">
                        <span className="text-[#1A9E6E]">{dinas.aduan_selesai}</span> / {dinas.aduan_total} ({aduanPersen}%)
                      </td>
                      <td className="p-3.5 text-center font-bold text-amber-500">
                        ⭐ {dinas.rata_rata_rating.toFixed(2)}
                      </td>
                      <td className="p-3.5 text-right">
                        <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                          dinas.skor_kinerja >= 95
                            ? 'bg-[#E6F7F1] text-[#1A9E6E] border border-[#B7EBD8]'
                            : dinas.skor_kinerja >= 90
                            ? 'bg-[#EBF4FB] text-[#184C78] border border-[#c5def2]'
                            : 'bg-[#FEF3E7] text-[#E67E22] border border-[#FBD8B3]'
                        }`}>
                          {dinas.skor_kinerja} / 100
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT 2: SEBARAN WILAYAH ── */}
      {activeTab === 'sebaran_wilayah' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-[#DCE0E6] shadow-xs space-y-4">
            <h3 className="font-['DM_Sans'] font-bold text-base text-[#184C78]">
              Pemerataan Pembangunan Berdasarkan Wilayah Kecamatan
            </h3>
            <p className="text-xs text-[#6C757D]">
              Proporsi alokasi dana dan rata-rata persentase penyelesaian fisik di 5 kecamatan kota.
            </p>

            <div className="space-y-3 pt-2">
              {wilayahBreakdown.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-[#F5F7FA] rounded-xl border border-[#DCE0E6]/70 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#212529]">{item.nama}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white text-[#184C78]">
                      {item.proyekCount} Proyek
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#6C757D]">
                    <span>Alokasi: Rp {(item.anggaran / 1000000000).toFixed(1)} Miliar</span>
                    <span className="font-bold text-[#184C78]">{item.avgProgress}% Progres</span>
                  </div>
                  <div className="w-full bg-[#DCE0E6] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#2980B9] h-full rounded-full"
                      style={{ width: `${item.avgProgress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#DCE0E6] shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-['DM_Sans'] font-bold text-base text-[#184C78]">
                Ringkasan Rekomendasi Pimpinan Daerah
              </h3>
              <div className="mt-3 space-y-3 text-xs">
                <div className="p-3 bg-[#EBF4FB] rounded-xl border border-[#c5def2] text-[#184C78] space-y-1">
                  <div className="font-bold">1. Akselerasi Kecamatan Sukun:</div>
                  <p className="text-[#212529] text-[11px] leading-relaxed">
                    Percepatan revitalisasi pasar tradisional terpadu agar tidak melampaui target akhir tahun anggaran.
                  </p>
                </div>
                <div className="p-3 bg-[#E6F7F1] rounded-xl border border-[#B7EBD8] text-[#0E6243] space-y-1">
                  <div className="font-bold">2. Best Practice Penanganan Drainase Klojen:</div>
                  <p className="text-[#212529] text-[11px] leading-relaxed">
                    Normalisasi drainase MT Haryono mencatatkan kepuasan publik tertinggi (4.8/5.0). Model mitigasi banjir dapat diterapkan pada koridor Lowokwaru.
                  </p>
                </div>
                <div className="p-3 bg-[#FEF3E7] rounded-xl border border-[#FBD8B3] text-[#9A4C08] space-y-1">
                  <div className="font-bold">3. Audit Tambahan Jembatan Dinoyo:</div>
                  <p className="text-[#212529] text-[11px] leading-relaxed">
                    Perintahkan Inspektorat bersama Dinas PUPR untuk memonitor hasil uji geoteknik lanjutan pada pekan ini.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#F5F7FA] rounded-xl border border-[#DCE0E6] text-[11px] text-[#6C757D]">
              Terakhir diperbarui: Hari ini, pukul 14:00 WIB • Sinkronisasi Otomatis Database MySQL
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
              <h3 className="font-['DM_Sans'] font-bold text-base text-[#184C78]">
                Analisis Aspirasi Publik &amp; AI Sentimen (Google Gemini Engine)
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
              <h3 className="font-['DM_Sans'] font-bold text-base text-[#184C78]">
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
