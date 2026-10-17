import React, { useState } from 'react';
import {
  ArrowLeft,
  MessageSquare,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  Edit3,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  User,
  Sparkles,
  MapPin,
  Check,
} from 'lucide-react';
import type { LaporanAduan, ProyekItem, UserProfile } from '../../types';
import { apiService } from '../../services/api';

interface AduanDetailViewProps {
  aduan: LaporanAduan;
  currentUser: UserProfile;
  projects: ProyekItem[];
  onBack: () => void;
  onOpenProjectDetail?: (project: ProyekItem) => void;
  onAduanUpdated?: (updatedAduan: LaporanAduan) => void;
}

const TEMPLATE_TANGGAPAN = [
  {
    label: 'Instruksi Lapangan Segera',
    text: 'Terima kasih atas laporan dan masukan yang disampaikan. Tim pengawas lapangan dinas teknis telah diinstruksikan untuk melakukan inspeksi langsung bersama kontraktor pelaksana guna penanganan perbaikan dalam waktu 1x24 jam.',
  },
  {
    label: 'Penyiraman & Reduksi Debu',
    text: 'Laporan Anda telah kami terima. Dinas telah menginstruksikan rekanan pelaksana untuk menambah frekuensi penyiraman jalan minimal 4 kali sehari dan memasang jaring penahan debu di sekitar pemukiman warga.',
  },
  {
    label: 'Perbaikan Kualitas / Aspal',
    text: 'Dinas Pekerjaan Umum telah meninjau titik kerusakan yang dilaporkan. Perataan ulang dan penambalan lapisan aspal (overlay) sedang dijadwalkan oleh unit pemeliharaan dan kontraktor penanggung jawab.',
  },
  {
    label: 'Penyelesaian Tuntas',
    text: 'Tindak lanjut atas keluhan ini telah diselesaikan oleh tim teknis lapangan. Hasil perbaikan telah diverifikasi oleh pengawas dinas dan saat ini akses jalan kembali normal serta aman dilalui warga.',
  },
];

export const AduanDetailView: React.FC<AduanDetailViewProps> = ({
  aduan,
  currentUser,
  projects,
  onBack,
  onOpenProjectDetail,
  onAduanUpdated,
}) => {
  const [currentAduan, setCurrentAduan] = useState<LaporanAduan>(aduan);

  // Dinas response form state
  const isDinasUser =
    currentUser.role === 'admin_dinas' ||
    currentUser.role === 'penanggung_jawab' ||
    currentUser.role === 'pimpinan_instansi' ||
    currentUser.role === 'aparatur_pemerintah';

  const [replyText, setReplyText] = useState(aduan.tanggapan_dinas || '');
  const [replyStatus, setReplyStatus] = useState<'diproses' | 'selesai'>(
    aduan.status === 'selesai' ? 'selesai' : 'diproses'
  );
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replySuccessMessage, setReplySuccessMessage] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);

  // Warga edit form state
  const isOwner = currentUser.id === currentAduan.user_id || currentUser.role === 'warga';
  const canEdit = isOwner && !currentAduan.tanggapan_dinas && currentAduan.status === 'menunggu';

  const [isEditingWarga, setIsEditingWarga] = useState(false);
  const [editJudul, setEditJudul] = useState(currentAduan.judul);
  const [editIsi, setEditIsi] = useState(currentAduan.isi_laporan);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editSuccessMessage, setEditSuccessMessage] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  // Find related project
  const matchedProject = projects.find((p) => p.id === currentAduan.proyek_id);

  // Handle Admin reply
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmittingReply(true);
    setReplyError(null);
    setReplySuccessMessage(null);

    try {
      await apiService.replyAduan(currentAduan.id, {
        status_tindak_lanjut: replyStatus === 'selesai' ? 'ditanggapi' : 'diproses',
        tanggapan_dinas: replyText.trim(),
      });

      const updated: LaporanAduan = {
        ...currentAduan,
        tanggapan_dinas: replyText.trim(),
        status: replyStatus,
        tanggal_tanggapan: new Date().toLocaleString('id-ID', {
          dateStyle: 'short',
          timeStyle: 'short',
        }),
        petugas_penjawab: `${currentUser.nama} (${currentUser.nama_dinas || 'Dinas PU'})`,
      };

      setCurrentAduan(updated);
      if (onAduanUpdated) onAduanUpdated(updated);

      setReplySuccessMessage('Tanggapan resmi dinas berhasil dipublikasikan secara transparan.');
      setTimeout(() => setReplySuccessMessage(null), 4000);
    } catch (err: any) {
      setReplyError(err.message || 'Gagal mempublikasikan tanggapan dinas.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Handle Warga Edit
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editIsi.trim() || editIsi.trim().length < 10) {
      setEditError('Uraian laporan minimal harus 10 karakter.');
      return;
    }

    setIsSubmittingEdit(true);
    setEditError(null);
    setEditSuccessMessage(null);

    try {
      const fullText = editJudul.trim() ? `${editJudul.trim()}: ${editIsi.trim()}` : editIsi.trim();

      await apiService.updateLaporan(
        currentAduan.id,
        { isi_laporan: fullText },
        {
          judul: editJudul.trim(),
          kategori_aduan: currentAduan.kategori_aduan,
        }
      );

      const updated: LaporanAduan = {
        ...currentAduan,
        judul: editJudul.trim() || 'Aduan Warga',
        isi_laporan: editIsi.trim(),
      };

      setCurrentAduan(updated);
      if (onAduanUpdated) onAduanUpdated(updated);

      setIsEditingWarga(false);
      setEditSuccessMessage('Pengaduan Anda berhasil diperbarui sebelum ditanggapi oleh dinas.');
      setTimeout(() => setEditSuccessMessage(null), 4000);
    } catch (err: any) {
      setEditError(err.message || 'Gagal memperbarui pengaduan.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Status configuration
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'selesai':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          text: 'Tindak Lanjut Selesai & Ditanggapi',
          step: 4,
        };
      case 'diproses':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          text: 'Sedang Ditindaklanjuti Tim Lapangan',
          step: 3,
        };
      case 'menunggu':
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-400',
          text: 'Menunggu Telaah Dinas Teknis',
          step: 2,
        };
    }
  };

  const statusConfig = getStatusBadge(currentAduan.status);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── TOP BREADCRUMB & BACK ACTION ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-[#DCE0E6] shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-[#F5F7FA] text-[#184C78] hover:bg-[#EBF4FB] transition-all cursor-pointer border border-[#DCE0E6]"
            title="Kembali ke daftar aduan"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-[#2980B9] bg-[#EBF4FB] px-2.5 py-0.5 rounded-lg border border-[#c5def2]">
                #ADUAN-{currentAduan.id}
              </span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${statusConfig.bg}`}>
                <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
                <span>{statusConfig.text}</span>
              </span>
            </div>
            <h1 className="font-['DM_Sans'] text-lg sm:text-xl font-extrabold text-[#184C78] mt-1">
              Halaman Penanganan &amp; Tanggapan Resmi Aduan
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {matchedProject && onOpenProjectDetail && (
            <button
              onClick={() => onOpenProjectDetail(matchedProject)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#EBF4FB] text-[#184C78] hover:bg-[#d8eaf7] border border-[#c5def2] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Building2 className="w-4 h-4 text-[#2980B9]" />
              <span>Buka Detail Proyek</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── ALERTS (SUCCESS / ERROR) ── */}
      {replySuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2.5 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{replySuccessMessage}</span>
        </div>
      )}

      {editSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2.5 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{editSuccessMessage}</span>
        </div>
      )}

      {replyError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2.5 shadow-xs animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{replyError}</span>
        </div>
      )}

      {editError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2.5 shadow-xs animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{editError}</span>
        </div>
      )}

      {/* ── STEPPER PROGRESS ALUR PENYELESAIAN ── */}
      <div className="bg-white p-5 rounded-2xl border border-[#DCE0E6] shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#6C757D] mb-4">
          Linimasa Alur Penanganan Partisipasi Publik
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-800">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">1. Aduan Masuk</div>
              <div className="text-[11px] text-emerald-700/80">{currentAduan.tanggal_lapor}</div>
            </div>
          </div>

          <div
            className={`flex items-center gap-3 p-3 rounded-xl border ${
              statusConfig.step >= 2
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                : 'bg-[#F5F7FA] border-[#DCE0E6] text-[#6C757D]'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                statusConfig.step >= 2 ? 'bg-emerald-600 text-white' : 'bg-[#DCE0E6] text-[#6C757D]'
              }`}
            >
              2
            </div>
            <div>
              <div className="text-xs font-bold">2. Telaah Lapangan</div>
              <div className="text-[11px] opacity-80">Verifikasi teknis dinas</div>
            </div>
          </div>

          <div
            className={`flex items-center gap-3 p-3 rounded-xl border ${
              statusConfig.step >= 3
                ? 'bg-amber-50/80 border-amber-200 text-amber-800'
                : 'bg-[#F5F7FA] border-[#DCE0E6] text-[#6C757D]'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                statusConfig.step >= 3 ? 'bg-amber-500 text-white' : 'bg-[#DCE0E6] text-[#6C757D]'
              }`}
            >
              3
            </div>
            <div>
              <div className="text-xs font-bold">3. Tindak Lanjut</div>
              <div className="text-[11px] opacity-80">Pengerjaan rekanan</div>
            </div>
          </div>

          <div
            className={`flex items-center gap-3 p-3 rounded-xl border ${
              statusConfig.step >= 4
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                : 'bg-[#F5F7FA] border-[#DCE0E6] text-[#6C757D]'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                statusConfig.step >= 4 ? 'bg-emerald-600 text-white' : 'bg-[#DCE0E6] text-[#6C757D]'
              }`}
            >
              4
            </div>
            <div>
              <div className="text-xs font-bold">4. Selesai &amp; Tanggapan</div>
              <div className="text-[11px] opacity-80">Respon terverifikasi</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN TWO-COLUMN WORKSPACE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── LEFT COLUMN (5 SPANS): CONTEXT, CITIZEN REPORT, & PROJECT ── */}
        <div className="lg:col-span-5 space-y-5">
          {/* Pelapor Card */}
          <div className="bg-white rounded-2xl border border-[#DCE0E6] p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#184C78] flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#2980B9]" />
              <span>Identitas Pelapor Warga</span>
            </h3>

            <div className="flex items-center gap-3 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#184C78] to-[#2980B9] text-white flex items-center justify-center font-extrabold text-base shadow-xs shrink-0">
                {(currentAduan.nama_pelapor || 'W').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-['DM_Sans'] font-bold text-sm text-[#212529] truncate">
                  {currentAduan.nama_pelapor}
                </div>
                <div className="text-xs text-[#6C757D] font-mono truncate">{currentAduan.email_pelapor}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Warga Terverifikasi</span>
                  </span>
                  <span className="text-[11px] text-[#6C757D] flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-[#2980B9]" />
                    {currentAduan.tanggal_lapor}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Konteks Proyek Pembangunan */}
          <div className="bg-white rounded-2xl border border-[#DCE0E6] p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#184C78] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#2980B9]" />
                <span>Konteks Proyek Terkait</span>
              </span>
              <span className="text-[10px] font-mono text-[#6C757D]">
                ID: {currentAduan.proyek_id}
              </span>
            </h3>

            <div className="p-3.5 bg-[#F5F7FA] rounded-xl border border-[#DCE0E6]/60 space-y-2">
              <div className="font-['DM_Sans'] font-bold text-sm text-[#184C78]">
                {currentAduan.nama_proyek}
              </div>
              {matchedProject && (
                <>
                  <div className="text-xs text-[#495057] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#E67E22] shrink-0" />
                    <span>{matchedProject.nama_wilayah}</span>
                  </div>
                  <div className="text-xs text-[#6C757D]">
                    Pengampu: <span className="font-semibold text-[#212529]">{matchedProject.nama_dinas}</span>
                  </div>
                  <div className="pt-2 border-t border-[#DCE0E6]/60 flex items-center justify-between text-xs">
                    <span className="text-[#6C757D]">Progres Fisik:</span>
                    <span className="font-extrabold text-[#2980B9] font-mono">
                      {matchedProject.progres_persen}%
                    </span>
                  </div>
                  <div className="w-full bg-[#DCE0E6] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#184C78] to-[#2980B9] h-full rounded-full transition-all"
                      style={{ width: `${matchedProject.progres_persen}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Isi Keluhan / Aspirasi Warga Card */}
          <div className="bg-white rounded-2xl border border-[#DCE0E6] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2980B9] bg-[#EBF4FB] px-2.5 py-1 rounded-lg border border-[#c5def2]">
                {currentAduan.kategori_aduan}
              </span>

              {canEdit && !isEditingWarga && (
                <button
                  onClick={() => setIsEditingWarga(true)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#EBF4FB] text-[#184C78] hover:bg-[#d8eaf7] border border-[#c5def2] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#2980B9]" />
                  <span>Edit Pengaduan</span>
                </button>
              )}
            </div>

            {isEditingWarga ? (
              /* Inline Edit Form for Citizen */
              <form onSubmit={handleSubmitEdit} className="space-y-3 pt-2 text-xs">
                <div className="p-3 bg-[#FEF3E7] rounded-xl border border-[#FBD8B3] text-[#9A4C08] font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Anda dapat memperbarui pengaduan ini sebelum ditanggapi oleh dinas teknis.</span>
                </div>

                <div>
                  <label className="block font-semibold text-[#184C78] mb-1">Judul Pengaduan</label>
                  <input
                    type="text"
                    required
                    value={editJudul}
                    onChange={(e) => setEditJudul(e.target.value)}
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-xl outline-none focus:border-[#2980B9]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#184C78] mb-1">Uraian Detail Keluhan</label>
                  <textarea
                    rows={4}
                    required
                    value={editIsi}
                    onChange={(e) => setEditIsi(e.target.value)}
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-xl outline-none focus:border-[#2980B9]"
                  />
                  <div className="text-[10px] text-[#6C757D] mt-1">Minimal 10 karakter non-spasi.</div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE0E6]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingWarga(false);
                      setEditJudul(currentAduan.judul);
                      setEditIsi(currentAduan.isi_laporan);
                    }}
                    className="btn-ghost !h-8 text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingEdit}
                    className="btn-primary !h-8 text-xs flex items-center gap-1.5"
                  >
                    {isSubmittingEdit ? 'Menyimpan...' : 'Simpan Pembaruan'}
                  </button>
                </div>
              </form>
            ) : (
              /* Normal View of Citizen Complaint */
              <div className="space-y-2">
                <h2 className="font-['DM_Sans'] font-extrabold text-base text-[#212529]">
                  {currentAduan.judul}
                </h2>
                <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#DCE0E6] relative overflow-hidden">
                  <p className="text-xs sm:text-sm text-[#212529] leading-relaxed whitespace-pre-wrap font-normal">
                    "{currentAduan.isi_laporan}"
                  </p>
                </div>
                <div className="text-[11px] text-[#6C757D] flex items-center gap-1.5 pt-1">
                  <Clock className="w-3.5 h-3.5 text-[#2980B9]" />
                  <span>Dicatat pada {currentAduan.tanggal_lapor} melalui portal CivicTrack</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN (7 SPANS): WORKSPACE TANGGAPAN RESMI DINAS ── */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card Tanggapan Resmi yang Aktif / Pernah Dipublikasikan */}
          {currentAduan.tanggapan_dinas && (
            <div className="bg-gradient-to-br from-[#EBF4FB] to-[#dbeefc] rounded-2xl border border-[#c5def2] p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#184C78] text-white flex items-center justify-center shadow-xs">
                    <ShieldCheck className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="font-['DM_Sans'] font-bold text-sm text-[#184C78]">
                      Tanggapan Resmi Dinas Teknis
                    </h3>
                    <div className="text-[11px] text-[#6C757D]">
                      Oleh: <span className="font-bold text-[#184C78]">{currentAduan.petugas_penjawab || 'Dinas Terkait'}</span>
                    </div>
                  </div>
                </div>

                <span className="text-[11px] text-[#6C757D] font-mono bg-white/70 px-2.5 py-1 rounded-lg border border-[#c5def2]">
                  {currentAduan.tanggal_tanggapan || currentAduan.tanggal_lapor}
                </span>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#c5def2] shadow-xs text-xs sm:text-sm text-[#212529] leading-relaxed whitespace-pre-wrap">
                {currentAduan.tanggapan_dinas}
              </div>

              <div className="flex items-center justify-between text-xs text-[#184C78] pt-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Tanggapan resmi terpublikasi ke portal publik &amp; pemohon aduan.
                </span>
              </div>
            </div>
          )}

          {/* Panel Respon Dinas (Khusus Akun Dinas / Pimpinan, atau bila warga ingin membaca status telaah) */}
          {isDinasUser ? (
            <div className="bg-white rounded-2xl border border-[#DCE0E6] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#DCE0E6] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#EBF4FB] text-[#184C78] flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-['DM_Sans'] font-bold text-sm text-[#184C78]">
                      {currentAduan.tanggapan_dinas ? 'Perbarui Tanggapan Resmi Dinas' : 'Tulis Tanggapan Resmi Dinas'}
                    </h3>
                    <p className="text-[11px] text-[#6C757D]">
                      Tanggapan akan langsung terbaca oleh warga dan tercatat dalam audit transparansi publik.
                    </p>
                  </div>
                </div>
              </div>

              {/* Template Cepat */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6C757D] mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#2980B9]" />
                  <span>Gunakan Template Tanggapan Cepat (Opsional)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATE_TANGGAPAN.map((tpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setReplyText(tpl.text)}
                      className="px-2.5 py-1.5 rounded-lg text-xs bg-[#F5F7FA] text-[#184C78] hover:bg-[#EBF4FB] border border-[#DCE0E6] transition-all cursor-pointer font-medium hover:border-[#2980B9]"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmitReply} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#184C78] mb-1.5">
                    Update Status Penyelesaian Aduan
                  </label>
                  <select
                    value={replyStatus}
                    onChange={(e) => setReplyStatus(e.target.value as any)}
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-xl bg-white outline-none focus:border-[#2980B9] font-medium"
                  >
                    <option value="diproses">Sedang Ditindaklanjuti Tim Lapangan &amp; Kontraktor</option>
                    <option value="selesai">Tindak Lanjut Selesai / Rampung Sempurna</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-semibold text-[#184C78]">
                      Uraian Tanggapan &amp; Tindakan Konkret Dinas
                    </label>
                    <span className="text-[11px] text-[#6C757D] font-mono">
                      {replyText.length}/2000 Karakter
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    required
                    placeholder="Tuliskan tindakan konkret yang telah atau sedang diambil oleh dinas teknis, instruksi ke rekanan kontraktor, serta estimasi rampungnya penanganan..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full p-3.5 border border-[#DCE0E6] rounded-xl outline-none focus:border-[#2980B9] leading-relaxed"
                  />
                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#DCE0E6] text-[11px] text-[#495057] mt-2 space-y-1">
                    <div className="font-semibold text-[#184C78]">💡 Panduan Komunikasi Akuntabel:</div>
                    <ul className="list-disc list-inside space-y-0.5 text-[#6C757D]">
                      <li>Gunakan bahasa resmi, santun, dan menenangkan warga.</li>
                      <li>Sebutkan langkah teknis riil yang diambil pengawas lapangan.</li>
                      <li>Berikan kepastian waktu penanganan atau jadwal kerja kontraktor.</li>
                    </ul>
                  </div>
                </div>

                <div className="p-3 bg-[#EBF4FB] rounded-xl border border-[#c5def2] text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[#6C757D]">Penanggap Terdaftar:</span>{' '}
                    <span className="font-bold text-[#184C78]">
                      {currentUser.nama} ({currentUser.nama_dinas || 'Dinas PU & Penataan Ruang'})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#2980B9] bg-white px-2 py-0.5 rounded border border-[#c5def2]">
                    NIP: {currentUser.nip || '19820412 200801 1 009'}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DCE0E6]">
                  <button
                    type="button"
                    onClick={onBack}
                    className="btn-ghost !h-10 text-xs px-4"
                  >
                    Kembali ke Daftar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReply || !replyText.trim()}
                    className="btn-primary !h-10 text-xs px-5 flex items-center gap-2 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmittingReply ? 'Mempublikasikan...' : 'Publikasikan Tanggapan Resmi'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Warga View when response is not yet published */
            !currentAduan.tanggapan_dinas && (
              <div className="bg-white rounded-2xl border border-[#DCE0E6] p-6 sm:p-8 text-center space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                  <Clock className="w-7 h-7" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="font-['DM_Sans'] font-bold text-base text-[#212529]">
                    Pengaduan Sedang Dalam Antrean Telaah Dinas Teknis
                  </h3>
                  <p className="text-xs text-[#6C757D] leading-relaxed">
                    Pengaduan Anda telah tercatat dalam sistem transparansi CivicTrack dan diteruskan ke petugas penanggung jawab dinas terkait. Respon resmi akan muncul secara otomatis di halaman ini setelah verifikasi lapangan selesai.
                  </p>
                </div>

                {canEdit && (
                  <div className="pt-2">
                    <button
                      onClick={() => setIsEditingWarga(true)}
                      className="px-4 py-2.5 bg-[#EBF4FB] text-[#184C78] hover:bg-[#d8eaf7] font-bold text-xs rounded-xl border border-[#c5def2] inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                    >
                      <Edit3 className="w-4 h-4 text-[#2980B9]" />
                      <span>Ingin Mengubah / Melengkapi Aduan Anda?</span>
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
