import React, { useState, useEffect } from 'react';
import { X, MapPin, Building, DollarSign, Star, CheckCircle, Bell, Sparkles, Send, Check } from 'lucide-react';
import type { ProyekItem, UserProfile } from '../types';
import { apiService } from '../services/api';

interface ProjectDetailModalProps {
  project: ProyekItem | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onOpenAIRoute: (projectName: string) => void;
  onOpenAuth: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  isOpen,
  onClose,
  currentUser,
  onOpenAIRoute,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'gallery' | 'report' | 'rating'>('timeline');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Sinkronisasi status langganan dari API saat modal dibuka
  useEffect(() => {
    if (!isOpen || !project || !currentUser) {
      setIsSubscribed(false);
      return;
    }
    let isCancelled = false;
    apiService.checkSubscriptionStatus(project.id).then((res) => {
      if (!isCancelled) {
        setIsSubscribed(res.is_subscribed);
      }
    }).catch(() => {});
    return () => {
      isCancelled = true;
    };
  }, [isOpen, project?.id, currentUser]);

  const handleToggleSubscribe = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!project || isSubscribing) return;

    setIsSubscribing(true);
    try {
      if (isSubscribed) {
        const res = await apiService.unsubscribeProject(project.id);
        setIsSubscribed(res.is_subscribed);
      } else {
        const res = await apiService.subscribeProject(project.id);
        setIsSubscribed(res.is_subscribed);
      }
    } catch (err) {
      console.warn('Gagal mengubah status langganan proyek:', err);
    } finally {
      setIsSubscribing(false);
    }
  };
  
  // Citizen report state
  const [reportTitle, setReportTitle] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Rating state
  const [userRating, setUserRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  if (!isOpen || !project) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setReportTitle('');
      setReportDesc('');
    }, 4000);
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setRatingSubmitted(true);
    setTimeout(() => {
      setRatingSubmitted(false);
      setRatingComment('');
    }, 4000);
  };

  const timelineSteps = [
    { title: 'Penyusunan DED & Lelang Proyek', date: 'Jan 2024', pct: 20, done: true, note: 'Tender selesai dimenangkan penyedia jasa terverifikasi LPSE.' },
    { title: 'Pembersihan Lahan & Mobilisasi Alat Berat', date: 'Feb 2024', pct: 40, done: project.progres_persen >= 40, note: 'Pematangan tanah dan relokasi utilitas sementara.' },
    { title: 'Konstruksi Struktur & Pengerjaan Fisik Utama', date: 'Apr 2024', pct: 65, done: project.progres_persen >= 65, note: 'Pengecoran dan instalasi elemen struktur inti.' },
    { title: 'Finishing, Uji Beban & Uji Fungsi Kelayakan', date: 'Agu 2024', pct: 90, done: project.progres_persen >= 90, note: 'Pengecatan, rambu, dan uji kelayakan teknis lapangan.' },
    { title: 'Serah Terima Pekerjaan Akhir (FHO)', date: project.estimasi_selesai || 'Des 2024', pct: 100, done: project.progres_persen === 100, note: 'Pemeriksaan tim teknis dinas dan peresmian untuk publik.' },
  ];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl border border-[#DCE0E6] my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#184C78] text-white p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
              project.status === 'selesai'
                ? 'bg-[#E6F7F1] text-[#1A9E6E]'
                : project.status === 'dalam_peninjauan_ulang'
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : project.status === 'ditangguhkan'
                ? 'bg-slate-200 text-slate-700'
                : 'bg-[#FEF3E7] text-[#E67E22]'
            }`}>
              {project.status === 'berjalan'
                ? 'Sedang Berjalan'
                : project.status === 'selesai'
                ? 'Selesai'
                : project.status === 'dalam_peninjauan_ulang'
                ? 'Dalam Peninjauan Ulang'
                : 'Ditangguhkan'}
            </span>
            <span className="text-xs text-white/70">ID #{project.id.toString().padStart(4, '0')}</span>
          </div>

          <h2 className="font-['DM_Sans'] text-xl sm:text-2xl font-bold tracking-tight mb-2">
            {project.nama_proyek}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-white/80 pt-2 border-t border-white/15">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#2980B9]" />
              <span className="truncate">{project.nama_wilayah || 'Kota Malang'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#2980B9]" />
              <span className="truncate">{project.nama_dinas || 'Dinas PUPR'}</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-emerald-300">
              <DollarSign className="w-3.5 h-3.5" />
              <span>{formatRupiah(project.anggaran)}</span>
            </div>
          </div>
        </div>

        {/* Action quick bar */}
        <div className="bg-[#F5F7FA] border-b border-[#DCE0E6] px-6 py-3 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#184C78]">Progres Fisik:</span>
            <div className="w-32 sm:w-44 h-2 bg-[#DCE0E6] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#2980B9] to-[#184C78] rounded-full"
                style={{ width: `${project.progres_persen}%` }}
              />
            </div>
            <span className="text-xs font-bold text-[#184C78]">{project.progres_persen}%</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSubscribe}
              disabled={isSubscribing}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isSubscribed
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                  : 'bg-white text-[#184C78] border border-[#DCE0E6] hover:bg-[#EBF4FB]'
              } ${isSubscribing ? 'opacity-70 cursor-wait' : ''}`}
              title={isSubscribed ? 'Berhenti mengikuti notifikasi proyek ini' : 'Ikuti notifikasi pembaruan progres proyek ini'}
            >
              <Bell className={`w-3.5 h-3.5 ${isSubscribed ? 'fill-emerald-700' : ''}`} />
              {isSubscribing ? 'Memproses...' : isSubscribed ? 'Mengikuti' : 'Ikuti Notifikasi'}
            </button>

            {project.kategori === 'jalan' && (
              <button
                onClick={() => onOpenAIRoute(project.nama_proyek)}
                className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Rute AI Alternatif
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#DCE0E6] bg-white px-6 shrink-0">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-4 text-xs font-bold font-['DM_Sans'] transition-colors border-b-2 cursor-pointer ${
              activeTab === 'timeline'
                ? 'border-[#184C78] text-[#184C78]'
                : 'border-transparent text-[#6C757D] hover:text-[#184C78]'
            }`}
          >
            Linimasa &amp; Progres
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`py-3 px-4 text-xs font-bold font-['DM_Sans'] transition-colors border-b-2 cursor-pointer ${
              activeTab === 'gallery'
                ? 'border-[#184C78] text-[#184C78]'
                : 'border-transparent text-[#6C757D] hover:text-[#184C78]'
            }`}
          >
            Dokumentasi Foto
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`py-3 px-4 text-xs font-bold font-['DM_Sans'] transition-colors border-b-2 cursor-pointer ${
              activeTab === 'report'
                ? 'border-[#184C78] text-[#184C78]'
                : 'border-transparent text-[#6C757D] hover:text-[#184C78]'
            }`}
          >
            Laporan Warga
          </button>
          <button
            onClick={() => setActiveTab('rating')}
            className={`py-3 px-4 text-xs font-bold font-['DM_Sans'] transition-colors border-b-2 cursor-pointer ${
              activeTab === 'rating'
                ? 'border-[#184C78] text-[#184C78]'
                : 'border-transparent text-[#6C757D] hover:text-[#184C78]'
            }`}
          >
            Rating Kepuasan ⭐
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: LINIMASA TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <p className="text-xs text-[#6C757D] bg-[#F5F7FA] p-3 rounded-lg border border-[#DCE0E6]">
                {project.deskripsi}
              </p>

              <h4 className="font-['DM_Sans'] text-sm font-bold text-[#184C78]">Tahapan Pengerjaan Lapangan:</h4>

              <div className="relative pl-6 border-l-2 border-[#DCE0E6] ml-3 space-y-6">
                {timelineSteps.map((step, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle Node */}
                    <div
                      className={`absolute -left-[31px] top-0 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                        step.done
                          ? 'bg-[#1A9E6E] border-white text-white'
                          : 'bg-white border-[#DCE0E6] text-[#6C757D]'
                      }`}
                    >
                      {step.done ? <Check className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-[#adb5bd]" />}
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#184C78]">{step.title}</span>
                        <span className="text-[11px] text-[#6C757D] font-medium">{step.date}</span>
                      </div>
                      <p className="text-xs text-[#6C757D] mt-0.5">{step.note}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold text-[#2980B9] bg-[#EBF4FB] px-2 py-0.5 rounded">
                        Target Progres: {step.pct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: DOKUMENTASI FOTO & VIDEO */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-['DM_Sans'] text-sm font-bold text-[#184C78]">Dokumentasi Fisik Lapangan:</h4>
                <span className="text-[11px] text-[#6C757D] font-medium">Foto Berkas &amp; Rekaman Video Drone</span>
              </div>

              {/* Grid of Photos and Videos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Item 1: Video Drone / CCTV Progress */}
                <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700 text-white shadow-sm flex flex-col">
                  <div className="relative h-44 bg-black flex items-center justify-center group overflow-hidden">
                    <video
                      controls
                      poster="https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80"
                      className="w-full h-full object-cover"
                    >
                      <source src="https://assets.mixkit.co/videos/preview/mixkit-heavy-machinery-paving-a-new-road-43206-large.mp4" type="video/mp4" />
                      Browser Anda tidak mendukung pemutar video HTML5.
                    </video>
                    <div className="absolute top-2 left-2 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>Video Drone 4K</span>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                      02:15
                    </div>
                  </div>
                  <div className="p-3 bg-slate-800 text-xs flex-1 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-cyan-300 block">Inspeksi Udara &amp; Pemadatan Lapisan</span>
                      <p className="text-[11px] text-slate-300 mt-1">
                        Rekaman berkala pengawas lapangan untuk validasi bobot realisasi fisik mingguan.
                      </p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Diunggah: Tim Pengawas PUPR</span>
                      <span>Format: MP4 (H.264)</span>
                    </div>
                  </div>
                </div>

                {/* Item 2: Foto Progres Konstruksi */}
                <div className="bg-white rounded-xl overflow-hidden border border-[#DCE0E6] shadow-sm flex flex-col">
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80"
                      alt="Foto Fisik"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-[#184C78]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      📸 Foto Lapangan
                    </div>
                  </div>
                  <div className="p-3 bg-white text-xs flex-1 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-[#184C78] block">Pemasangan Struktur &amp; Perapihan Bahu Jalan</span>
                      <p className="text-[11px] text-[#6C757D] mt-1">
                        Pengecekan elevasi dan uji kepadatan agregat telah lolos uji laboratorium dinas.
                      </p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-[#DCE0E6]/60 flex items-center justify-between text-[10px] text-[#6C757D]">
                      <span>Bobot Tahap: 65%</span>
                      <span className="text-emerald-700 font-semibold">Terverifikasi</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LAPORAN WARGA */}
          {activeTab === 'report' && (
            <div className="space-y-4">
              <div className="bg-[#FEF3E7] border border-[#fbd7b5] rounded-xl p-4 text-xs text-[#8c4608]">
                <strong>Kanal Pengaduan &amp; Aspirasi Warga:</strong> Laporan Anda akan langsung diteruskan ke dasbor resmi instansi teknis penanggung jawab. Dilengkapi sensor otomatis kata tidak pantas.
              </div>

              {reportSubmitted ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-medium">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="block font-bold">Laporan Berhasil Terkirim!</strong>
                    Nomor tiket aduan Anda telah dicatat dalam sistem dan menunggu tanggapan resmi dinas.
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#184C78] mb-1">Judul Laporan</label>
                    <input
                      type="text"
                      required
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      placeholder="Contoh: Rambu penutup jalan kurang terlihat di malam hari"
                      className="w-full px-3 py-2 text-xs border border-[#DCE0E6] rounded-lg focus:border-[#2980B9] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#184C78] mb-1">Rincian Laporan / Pertanyaan</label>
                    <textarea
                      rows={3}
                      required
                      value={reportDesc}
                      onChange={(e) => setReportDesc(e.target.value)}
                      placeholder="Jelaskan kondisi lapangan secara objektif..."
                      className="w-full px-3 py-2 text-xs border border-[#DCE0E6] rounded-lg focus:border-[#2980B9] outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#184C78] hover:bg-[#0f3252] text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Kirim Laporan ke Dinas
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: RATING KEPUASAN */}
          {activeTab === 'rating' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#F5F7FA] p-4 rounded-xl border border-[#DCE0E6]">
                <div>
                  <div className="text-2xl font-bold font-['DM_Sans'] text-[#184C78] flex items-center gap-1.5">
                    {project.rata_rata_rating || '4.5'}
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="text-xs text-[#6C757D]">Berdasarkan {project.jumlah_rating || 30}+ ulasan warga</div>
                </div>
                <div className="text-right text-xs text-[#6C757D]">
                  Transparansi penilaian publik
                </div>
              </div>

              {ratingSubmitted ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-medium">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="block font-bold">Terima kasih atas penilaian Anda!</strong>
                    Ulasan kepuasan warga sangat berarti untuk akuntabilitas pembangunan.
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRatingSubmit} className="space-y-3 border border-[#DCE0E6] p-4 rounded-xl">
                  <h5 className="text-xs font-bold text-[#184C78]">Beri Penilaian Anda:</h5>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        className="p-1 cursor-pointer hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= userRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-[#184C78] ml-2">{userRating} dari 5 Bintang</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#184C78] mb-1">Ulasan / Masukan</label>
                    <textarea
                      rows={2}
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      placeholder="Bagikan pengalaman atau hasil pengerjaan proyek ini..."
                      className="w-full px-3 py-2 text-xs border border-[#DCE0E6] rounded-lg focus:border-[#2980B9] outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-[#2980B9] hover:bg-[#1a6fa8] text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Kirim Penilaian
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
