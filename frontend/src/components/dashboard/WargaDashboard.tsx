import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Bookmark,
  Bell,
  BellOff,
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
  ChevronDown,
  Check,
  History,
  FileText,
  Edit3,
  AlertCircle,
  X,
  MessageSquare,
  SlidersHorizontal,
  Compass,
  Car,
  Bike,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';
import type {
  UserProfile,
  ProyekItem,
  LaporanAduan,
  EvaluasiCacatItem,
  RatingUlasanItem,
  SubscribedProject,
  SavedRouteItem,
  ApiNotificationItem,
} from '../../types';
import {
  MOCK_SUBSCRIBED_PROJECTS,
  MOCK_LAPORAN_WARGA,
  MOCK_EVALUASI_CACAT,
  MOCK_RATING_ULASAN,
} from '../../data/dashboardMockData';
import { apiService } from '../../services/api';
import { MiniMapOverview } from './MiniMapOverview';
import { AduanDetailView } from './AduanDetailView';
import { generateLamonganRouteConsultation, type RouteConsultationResult } from '../../utils/aiRouteConsultation';

interface WargaDashboardProps {
  currentUser: UserProfile;
  projects: ProyekItem[];
  onOpenProjectDetail: (project: ProyekItem) => void;
  onOpenAIRoute: (projectName: string, project?: ProyekItem | null, savedRoute?: any) => void;
  activeSection?: string;
  onSelectSection?: (section: string) => void;
  onOpenMapExplorer?: () => void;
  onProjectUpdated?: (project: ProyekItem) => void;
}

export const WargaDashboard: React.FC<WargaDashboardProps> = ({
  currentUser,
  projects,
  onOpenProjectDetail,
  onOpenAIRoute,
  activeSection,
  onSelectSection,
  onOpenMapExplorer,
  onProjectUpdated,
}) => {
  const [activeAuditTrailId, setActiveAuditTrailId] = useState<number | null>(null);
  const [evalStatusLogsMap, setEvalStatusLogsMap] = useState<Record<number, any[]>>({});
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);

  React.useEffect(() => {
    if (activeAuditTrailId) {
      setIsLoadingLogs(true);
      apiService
        .getEvaluationStatusLogs(activeAuditTrailId)
        .then((logs) => {
          setEvalStatusLogsMap((prev) => ({
            ...prev,
            [activeAuditTrailId]: logs || [],
          }));
        })
        .catch(() => {
          setEvalStatusLogsMap((prev) => ({
            ...prev,
            [activeAuditTrailId]: [],
          }));
        })
        .finally(() => {
          setIsLoadingLogs(false);
        });
    }
  }, [activeAuditTrailId]);

  const [internalTab, setInternalTab] = useState<string>('overview');
  const activeTab = (activeSection as any) || internalTab;

  const handleBackToOverview = () => {
    if (onSelectSection) {
      onSelectSection('overview');
    }
    setInternalTab('overview');
  };

  // Subscribed state
  const [subscribedList, setSubscribedList] = useState<SubscribedProject[]>(MOCK_SUBSCRIBED_PROJECTS);

  // Early-Warning Alert list (Proyek Scheduled H-14 s/d H-0 atau Planned terdekat)
  const earlyWarningProjects = useMemo(() => {
    return projects.filter(
      (p) =>
        p.status === 'scheduled' ||
        (p.status === 'planned' && p.tanggal_mulai_rencana) ||
        p.id === 37
    );
  }, [projects]);

  // Rute Harian Tersimpan & Notifikasi Pembaruan Warga
  const [savedRoutes, setSavedRoutes] = useState<SavedRouteItem[]>([]);
  const [userNotifications, setUserNotifications] = useState<ApiNotificationItem[]>([]);

  useEffect(() => {
    let isCancelled = false;
    if (typeof apiService?.getSavedRoutes === 'function') {
      apiService
        .getSavedRoutes()
        .then((res: SavedRouteItem[]) => {
          if (!isCancelled && res) setSavedRoutes(res);
        })
        .catch(() => {});
    }

    if (typeof apiService?.getNotifications === 'function') {
      apiService
        .getNotifications()
        .then((res: ApiNotificationItem[]) => {
          if (!isCancelled && res) setUserNotifications(res);
        })
        .catch(() => {});
    }

    return () => {
      isCancelled = true;
    };
  }, []);

  // Evaluasi cerdas status deteksi overlap rute harian warga dengan proyek konstruksi
  const routeOverlapAlert = useMemo(() => {
    // 1. Cek notifikasi overlap rute aktif dari backend notification dispatcher
    const overlapNotif = userNotifications.find(
      (n) =>
        n.target_type === 'route_overlap' ||
        n.is_high_priority ||
        n.pesan.includes('PRIORITAS TINGGI') ||
        n.pesan.includes('Rute Harian')
    );

    if (overlapNotif) {
      const proj =
        projects.find((p) => p.id === overlapNotif.proyek_id) ||
        projects.find((p) => p.nama_proyek === overlapNotif.nama_proyek) ||
        earlyWarningProjects[0] ||
        projects[0];
      const matchedSavedRoute = savedRoutes.length > 0 ? savedRoutes[0] : null;
      return {
        hasOverlap: true,
        project: proj,
        savedRoute: matchedSavedRoute,
        message: overlapNotif.pesan,
        title: overlapNotif.nama_proyek || proj?.nama_proyek || 'Proyek Strategis Lamongan',
      };
    }

    // 2. Jika user memiliki rute harian tersimpan dan ada proyek berstatus early-warning
    if (savedRoutes.length > 0 && earlyWarningProjects.length > 0) {
      const targetProj = earlyWarningProjects[0];
      return {
        hasOverlap: true,
        project: targetProj,
        savedRoute: savedRoutes[0],
        message: `Rute harian Anda ('${savedRoutes[0].nama_rute}') terdeteksi melintasi koridor proyek ${targetProj.nama_proyek}. Rekomendasi jalur alternatif bebas kemacetan telah disiapkan.`,
        title: targetProj.nama_proyek,
      };
    }

    return null;
  }, [userNotifications, savedRoutes, projects, earlyWarningProjects]);

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
  const [reportSortBy, setReportSortBy] = useState<'terbaru' | 'terlama' | 'terbanyak'>('terbaru');
  const [selectedAduanDetail, setSelectedAduanDetail] = useState<LaporanAduan | null>(null);
  const [showFullDetailView, setShowFullDetailView] = useState<boolean>(false);
  const [editingAduan, setEditingAduan] = useState<LaporanAduan | null>(null);
  const [editJudul, setEditJudul] = useState('');
  const [editIsi, setEditIsi] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Rating state
  const [ratingList, setRatingList] = useState<RatingUlasanItem[]>(() => {
    try {
      const saved = localStorage.getItem('civictrack_submitted_ratings');
      if (saved) {
        const localList: any[] = JSON.parse(saved);
        const normalized: RatingUlasanItem[] = localList.map((item) => ({
          id: item.id,
          proyek_id: item.proyek_id,
          nama_proyek: item.nama_proyek || `Proyek #${item.proyek_id}`,
          user_id: item.user_id,
          nama_warga: item.nama_warga || item.nama_user || 'Warga Masyarakat',
          bintang: item.bintang || item.skor || 5,
          komentar: item.komentar || '',
          aspek_kualitas: item.aspek_kualitas ?? item.bintang ?? item.skor ?? 5,
          aspek_ketepatan_waktu: item.aspek_ketepatan_waktu ?? item.bintang ?? item.skor ?? 5,
          aspek_manfaat: item.aspek_manfaat ?? item.bintang ?? item.skor ?? 5,
          tanggal: item.tanggal || (item.created_at ? String(item.created_at).split('T')[0] : new Date().toISOString().split('T')[0]),
        }));
        const localIds = new Set(normalized.map((l) => l.id));
        const remainingMocks = MOCK_RATING_ULASAN.filter((m) => !localIds.has(m.id));
        return [...normalized, ...remainingMocks];
      }
    } catch {}
    return MOCK_RATING_ULASAN;
  });
  const [ratingForm, setRatingForm] = useState({
    proyek_id: projects.find((p) => p.status === 'selesai')?.id || 3,
    bintang: 5,
    aspek_kualitas: 5,
    aspek_ketepatan_waktu: 5,
    aspek_manfaat: 5,
    komentar: '',
  });
  const [ratingSuccessMessage, setRatingSuccessMessage] = useState('');
  const [isEditingRating, setIsEditingRating] = useState(false);

  // Check whether current user already submitted a rating for the selected project
  const userExistingRating = useMemo(() => {
    return ratingList.find(
      (item) =>
        item.proyek_id === Number(ratingForm.proyek_id) &&
        ((currentUser?.id && item.user_id === currentUser.id) ||
          (currentUser?.nama && item.nama_warga && item.nama_warga.trim().toLowerCase() === currentUser.nama.trim().toLowerCase()))
    );
  }, [ratingList, ratingForm.proyek_id, currentUser]);

  const handleStartEditRating = (existing: RatingUlasanItem) => {
    setRatingForm({
      proyek_id: existing.proyek_id,
      bintang: existing.bintang,
      aspek_kualitas: existing.aspek_kualitas,
      aspek_ketepatan_waktu: existing.aspek_ketepatan_waktu,
      aspek_manfaat: existing.aspek_manfaat,
      komentar: existing.komentar || '',
    });
    setIsEditingRating(true);
  };

  // Rating real-time synchronization helpers
  const calculatedAvgRating = Number(
    ((ratingForm.aspek_kualitas + ratingForm.aspek_ketepatan_waktu + ratingForm.aspek_manfaat) / 3).toFixed(1)
  );

  const getScoreDescriptor = (score: number) => {
    if (score >= 4.5) return { label: 'Sangat Memuaskan', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (score >= 3.5) return { label: 'Baik & Memuaskan', badgeClass: 'bg-sky-50 text-sky-700 border-sky-200' };
    if (score >= 2.5) return { label: 'Cukup Memuaskan', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (score >= 1.5) return { label: 'Kurang Memuaskan', badgeClass: 'bg-orange-50 text-orange-700 border-orange-200' };
    return { label: 'Sangat Buruk', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  const getParamValueDescriptor = (val: number) => {
    switch (val) {
      case 5: return 'Sangat Baik';
      case 4: return 'Baik';
      case 3: return 'Cukup';
      case 2: return 'Kurang';
      case 1: return 'Sangat Buruk';
      default: return `${val} / 5`;
    }
  };

  const handleParameterChange = (
    key: 'aspek_kualitas' | 'aspek_ketepatan_waktu' | 'aspek_manfaat',
    value: number
  ) => {
    const clampedVal = Math.max(1, Math.min(5, Math.round(value)));
    const nextForm = {
      ...ratingForm,
      [key]: clampedVal,
    };
    const newAvg = (nextForm.aspek_kualitas + nextForm.aspek_ketepatan_waktu + nextForm.aspek_manfaat) / 3;
    nextForm.bintang = Math.max(1, Math.min(5, Math.round(newAvg)));
    setRatingForm(nextForm);
  };

  const handleOverallStarClick = (star: number) => {
    const clampedStar = Math.max(1, Math.min(5, star));
    setRatingForm({
      ...ratingForm,
      bintang: clampedStar,
      aspek_kualitas: clampedStar,
      aspek_ketepatan_waktu: clampedStar,
      aspek_manfaat: clampedStar,
    });
  };

  // Evaluasi Cacat state
  const [evaluasiList, setEvaluasiList] = useState<EvaluasiCacatItem[]>(MOCK_EVALUASI_CACAT);
  const [isEvaluasiModalOpen, setIsEvaluasiModalOpen] = useState(false);
  const [evaluasiForm, setEvaluasiForm] = useState({
    proyek_id: 2,
    deskripsi: '',
    lokasi_titik: '',
    kategori_cacat: 'Struktur Beton / Retak Ambles',
  });

  // Tab Rute Alternatif AI State
  const [routeQueryText, setRouteQueryText] = useState('');
  const [selectedRouteProject, setSelectedRouteProject] = useState<number | 'all'>('all');
  const [routeVehicleType, setRouteVehicleType] = useState<'semua' | 'mobil' | 'motor'>('semua');
  const [isAnalyzingRoute, setIsAnalyzingRoute] = useState(false);
  const [routeAnalysisResult, setRouteAnalysisResult] = useState<RouteConsultationResult | null>(null);
  const [routeFormError, setRouteFormError] = useState<string | null>(null);

  const handleConsultRoute = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const q = customQuery !== undefined ? customQuery : routeQueryText;
    if (!q.trim() && selectedRouteProject === 'all') {
      setRouteFormError('Silakan ketik pertanyaan rute perjalanan Anda atau pilih proyek yang ingin dihindari.');
      return;
    }
    setRouteFormError(null);
    setIsAnalyzingRoute(true);

    if (customQuery !== undefined) {
      setRouteQueryText(customQuery);
    }

    setTimeout(() => {
      const res = generateLamonganRouteConsultation(
        q,
        selectedRouteProject,
        routeVehicleType,
        projects
      );
      setRouteAnalysisResult(res);
      setIsAnalyzingRoute(false);
    }, 600);
  };

  const handleResetRouteConsultation = () => {
    setRouteAnalysisResult(null);
    setRouteQueryText('');
    setSelectedRouteProject('all');
    setRouteVehicleType('semua');
    setRouteFormError(null);
  };

  // Lock body scroll and support Escape key when any modal is open
  useEffect(() => {
    const isModalActive = !!(
      selectedAduanDetail ||
      isNewReportModalOpen ||
      editingAduan ||
      isEvaluasiModalOpen
    );

    if (isModalActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedAduanDetail) setSelectedAduanDetail(null);
        if (isNewReportModalOpen) setIsNewReportModalOpen(false);
        if (editingAduan) setEditingAduan(null);
        if (isEvaluasiModalOpen) setIsEvaluasiModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedAduanDetail, isNewReportModalOpen, editingAduan, isEvaluasiModalOpen]);

  // Handle toggle notification
  const handleToggleNotification = (id: number) => {
    setSubscribedList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, notifikasi_aktif: !item.notifikasi_aktif } : item
      )
    );
  };

  // Handle Escape key to close any open modal
  useEffect(() => {
    if (!isNewReportModalOpen && !editingAduan && !isEvaluasiModalOpen && !selectedAduanDetail) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsNewReportModalOpen(false);
        setEditingAduan(null);
        setIsEvaluasiModalOpen(false);
        setSelectedAduanDetail(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNewReportModalOpen, editingAduan, isEvaluasiModalOpen, selectedAduanDetail]);

  // Sync real evaluations and citizen reports from database on mount & listen to real-time events
  useEffect(() => {
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

    const handleEvaluasiVerified = () => {
      loadEvaluations();
    };

    const handleNewEvaluasi = () => {
      loadEvaluations();
    };

    window.addEventListener('civictrack_evaluasi_verified', handleEvaluasiVerified);
    window.addEventListener('civictrack_new_evaluasi', handleNewEvaluasi);

    if (typeof apiService.getAllReports === 'function') {
      apiService
        .getAllReports()
        .then((reports) => {
          if (reports && reports.length > 0) {
            setLaporanList(reports);
          }
        })
        .catch(() => {});
    }

    if (typeof apiService.getAllReviews === 'function') {
      apiService
        .getAllReviews()
        .then((reviews) => {
          if (reviews && reviews.length > 0) {
            setRatingList(reviews);
          }
        })
        .catch(() => {});
    }

    const handleNewAduan = (event: any) => {
      if (event.detail) {
        setLaporanList((prev) => [event.detail, ...prev.filter((item) => item.id !== event.detail.id)]);
      }
    };

    const handleRepliedAduan = (event: any) => {
      if (event.detail) {
        const { reportId, status, tanggapan_dinas, tanggal_tanggapan, petugas_penjawab } = event.detail;
        setLaporanList((prev) =>
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
    };

    const handleStorageChange = () => {
      if (typeof apiService.getAllReports === 'function') {
        apiService
          .getAllReports()
          .then((reports) => {
            if (reports && reports.length > 0) {
              setLaporanList(reports);
            }
          })
          .catch(() => {});
      }
    };

    const handleNewRating = (event: any) => {
      if (event.detail) {
        setRatingList((prev) => [
          event.detail,
          ...prev.filter((item) => item.id !== event.detail.id),
        ]);
      }
    };

    window.addEventListener('civictrack_new_aduan', handleNewAduan);
    window.addEventListener('civictrack_replied_aduan', handleRepliedAduan);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('civictrack_new_rating', handleNewRating);

    return () => {
      window.removeEventListener('civictrack_evaluasi_verified', handleEvaluasiVerified);
      window.removeEventListener('civictrack_new_evaluasi', handleNewEvaluasi);
      window.removeEventListener('civictrack_new_aduan', handleNewAduan);
      window.removeEventListener('civictrack_replied_aduan', handleRepliedAduan);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('civictrack_new_rating', handleNewRating);
    };
  }, []);

  // Handle submit report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.isi_laporan.trim()) return;

    const pId = Number(reportForm.proyek_id);
    const selectedProj = projects.find((p) => p.id === pId);

    try {
      const fullText = reportForm.judul.trim()
        ? `${reportForm.judul.trim()}: ${reportForm.isi_laporan.trim()}`
        : reportForm.isi_laporan.trim();

      const resLaporan = await apiService.submitLaporan(
        pId,
        { isi_laporan: fullText },
        {
          nama_proyek: selectedProj?.nama_proyek || 'Proyek Kota',
          nama_pelapor: currentUser.nama,
          email_pelapor: currentUser.email,
          judul: reportForm.judul || 'Aduan Warga',
          kategori_aduan: reportForm.kategori_aduan,
          user_id: currentUser.id,
        }
      );

      const newLaporan: LaporanAduan = {
        id: resLaporan.id,
        proyek_id: pId,
        nama_proyek: selectedProj?.nama_proyek || 'Proyek Kota',
        user_id: currentUser.id,
        nama_pelapor: currentUser.nama,
        email_pelapor: currentUser.email,
        judul: reportForm.judul || 'Aduan Warga',
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
    } catch (err: any) {
      alert(err.message || 'Gagal mengirimkan laporan pengaduan.');
    }
  };

  // Handle edit unreplied report
  const handleSaveEditAduan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAduan || !editIsi.trim() || editIsi.trim().length < 10) {
      setEditError('Uraian laporan minimal harus 10 karakter.');
      return;
    }

    setIsSubmittingEdit(true);
    setEditError(null);

    try {
      const fullText = editJudul.trim() ? `${editJudul.trim()}: ${editIsi.trim()}` : editIsi.trim();

      await apiService.updateLaporan(
        editingAduan.id,
        { isi_laporan: fullText },
        {
          judul: editJudul.trim(),
          kategori_aduan: editingAduan.kategori_aduan,
        }
      );

      const updated: LaporanAduan = {
        ...editingAduan,
        judul: editJudul.trim() || 'Aduan Warga',
        isi_laporan: editIsi.trim(),
      };

      setLaporanList((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      setEditingAduan(null);
    } catch (err: any) {
      setEditError(err.message || 'Gagal memperbarui pengaduan.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle submit rating
  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    const pId = Number(ratingForm.proyek_id);
    const selProj = projects.find((p) => p.id === pId);

    try {
      const resRating = await apiService.submitRating(
        pId,
        {
          skor: ratingForm.bintang,
          komentar: ratingForm.komentar.trim() || undefined,
        },
        {
          nama_proyek: selProj?.nama_proyek || 'Proyek Selesai',
          user_id: currentUser.id,
          nama_warga: currentUser.nama,
          aspek_kualitas: ratingForm.aspek_kualitas,
          aspek_ketepatan_waktu: ratingForm.aspek_ketepatan_waktu,
          aspek_manfaat: ratingForm.aspek_manfaat,
        }
      );

      const targetId = userExistingRating?.id || resRating.id || Date.now();

      const newRating: RatingUlasanItem = {
        id: targetId,
        proyek_id: pId,
        nama_proyek: selProj?.nama_proyek || resRating.nama_proyek || 'Proyek Selesai',
        user_id: currentUser.id,
        nama_warga: currentUser.nama,
        bintang: resRating.skor,
        komentar: resRating.komentar || '',
        aspek_kualitas: ratingForm.aspek_kualitas,
        aspek_ketepatan_waktu: ratingForm.aspek_ketepatan_waktu,
        aspek_manfaat: ratingForm.aspek_manfaat,
        tanggal: new Date().toISOString().split('T')[0],
      };

      setRatingList((prev) => [
        newRating,
        ...prev.filter(
          (item) =>
            item.id !== targetId &&
            !(item.proyek_id === pId && (
              (currentUser?.id && item.user_id === currentUser.id) ||
              (currentUser?.nama && item.nama_warga && item.nama_warga.trim().toLowerCase() === currentUser.nama.trim().toLowerCase())
            ))
        ),
      ]);
      setRatingSuccessMessage(
        isEditingRating
          ? 'Ulasan dan penilaian Anda berhasil diperbarui!'
          : 'Penilaian Anda berhasil disimpan ke database! Terima kasih atas partisipasi aktif Anda.'
      );
      setTimeout(() => setRatingSuccessMessage(''), 4000);
      setIsEditingRating(false);

      if (onProjectUpdated) {
        apiService.getProjectDetail(pId).then((updated) => onProjectUpdated(updated)).catch(() => {});
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mengirimkan penilaian kepuasan.');
    }
  };

  // Handle submit evaluasi cacat with real Groq AI on backend
  const handleSubmitEvaluasi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluasiForm.deskripsi.trim()) return;

    const pId = Number(evaluasiForm.proyek_id);
    const selProj = projects.find((p) => p.id === pId);

    try {
      const evalRes = await apiService.submitEvaluasi(
        pId,
        {
          kategori_masalah: evaluasiForm.kategori_cacat,
          deskripsi: evaluasiForm.deskripsi.trim(),
        },
        {
          nama_proyek: selProj?.nama_proyek,
          nama_pelapor: currentUser.nama,
          lokasi_titik: evaluasiForm.lokasi_titik.trim(),
          user_id: currentUser.id,
        }
      );

      let cleanDesc = evalRes.deskripsi || evaluasiForm.deskripsi.trim();
      let lokasi = evaluasiForm.lokasi_titik.trim() || 'Lokasi Proyek';
      const patokanMatch = cleanDesc.match(/^\[Patokan:\s*([^\]]+)\]\s*/);
      if (patokanMatch) {
        lokasi = patokanMatch[1].trim();
        cleanDesc = cleanDesc.replace(/^\[Patokan:\s*([^\]]+)\]\s*/, '').trim();
      }

      const newEval: EvaluasiCacatItem = {
        id: evalRes.id,
        proyek_id: pId,
        nama_proyek: selProj?.nama_proyek || evalRes.nama_proyek || 'Proyek Fisik Selesai',
        user_id: currentUser.id,
        nama_pelapor: currentUser.nama,
        deskripsi: cleanDesc,
        lokasi_titik: lokasi,
        skor_urgensi_ai: evalRes.skor_urgensi_ai || 3,
        analisis_ai: evalRes.ringkasan_analisis_ai || 'Telah dianalisis oleh AI CivicTrack.',
        kategori_cacat: evalRes.kategori_masalah,
        status_verifikasi: evalRes.status,
        tanggal_lapor: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
      };

      setEvaluasiList((prev) => [newEval, ...prev.filter((it) => it.id !== newEval.id)]);
      setIsEvaluasiModalOpen(false);
      setEvaluasiForm((prev) => ({
        ...prev,
        deskripsi: '',
        lokasi_titik: '',
      }));

      if (onProjectUpdated) {
        apiService.getProjectDetail(pId).then((updated) => onProjectUpdated(updated)).catch(() => {});
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mengajukan evaluasi cacat pembangunan.');
    }
  };

  // Helper untuk parsing tanggal laporan ke timestamp numerik (mendukung ISO maupun format lokal DD/MM/YY)
  const parseReportDate = (d?: string): number => {
    if (!d) return 0;
    const slashMatch = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:[,\s]+(\d{1,2})[.:](\d{1,2}))?/);
    if (slashMatch) {
      const day = parseInt(slashMatch[1], 10);
      const month = parseInt(slashMatch[2], 10) - 1;
      let year = parseInt(slashMatch[3], 10);
      if (year < 100) year += 2000;
      const hour = slashMatch[4] ? parseInt(slashMatch[4], 10) : 0;
      const minute = slashMatch[5] ? parseInt(slashMatch[5], 10) : 0;
      return new Date(year, month, day, hour, minute).getTime();
    }
    const timestamp = Date.parse(d);
    return isNaN(timestamp) ? 0 : timestamp;
  };

  // Hitung jumlah laporan akumulatif per proyek untuk mendukung pengurutan "paling banyak aduan"
  const projectReportCounts = useMemo(() => {
    const map: Record<number, number> = {};
    laporanList.forEach((lap) => {
      map[lap.proyek_id] = (map[lap.proyek_id] || 0) + 1;
    });
    return map;
  }, [laporanList]);

  // Filter status dan sorting berurutan: terbaru, terlama, atau paling banyak terdapat aduan
  const filteredLaporan = useMemo(() => {
    const list = laporanList.filter((item) => {
      if (reportFilter === 'semua') return true;
      return item.status === reportFilter;
    });

    return [...list].sort((a, b) => {
      if (reportSortBy === 'terbanyak') {
        const countA = projectReportCounts[a.proyek_id] || 0;
        const countB = projectReportCounts[b.proyek_id] || 0;
        if (countB !== countA) return countB - countA;
        return b.id - a.id;
      }
      if (reportSortBy === 'terlama') {
        const timeA = parseReportDate(a.tanggal_lapor) || a.id;
        const timeB = parseReportDate(b.tanggal_lapor) || b.id;
        return timeA - timeB;
      }
      // Default: 'terbaru'
      const timeA = parseReportDate(a.tanggal_lapor) || a.id;
      const timeB = parseReportDate(b.tanggal_lapor) || b.id;
      return timeB - timeA;
    });
  }, [laporanList, reportFilter, reportSortBy, projectReportCounts]);

  const completedProjects = projects.filter((p) => p.status === 'selesai');

  // Auto-select first completed project if current selection is invalid
  useEffect(() => {
    if (completedProjects.length > 0 && !completedProjects.some((p) => p.id === evaluasiForm.proyek_id)) {
      setEvaluasiForm((prev) => ({ ...prev, proyek_id: completedProjects[0].id }));
    }
  }, [completedProjects, evaluasiForm.proyek_id]);

  if (showFullDetailView && selectedAduanDetail) {
    return (
      <AduanDetailView
        aduan={selectedAduanDetail}
        currentUser={currentUser}
        projects={projects}
        onBack={() => {
          setShowFullDetailView(false);
          setSelectedAduanDetail(null);
        }}
        onOpenProjectDetail={onOpenProjectDetail}
        onAduanUpdated={(updated) => {
          setLaporanList((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item))
          );
          setSelectedAduanDetail(updated);
        }}
      />
    );
  }

  const existingReportForSelected = laporanList.find(
    (lap) => lap.proyek_id === Number(reportForm.proyek_id)
  );

  const renderPortal = (modal: React.ReactNode) => {
    if (typeof document === 'undefined') return null;
    return createPortal(modal, document.body);
  };

  return (
    <div className="space-y-6 animate-hero-in">
      {/* ── MODAL 1: DETAIL ADUAN WARGA (GAYA ETHOL DETAIL TUGAS) ── */}
      {selectedAduanDetail && !showFullDetailView && renderPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-detail-aduan-title"
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/65 backdrop-blur-xs animate-fade-in"
          onClick={() => setSelectedAduanDetail(null)}
        >
          <div className="flex min-h-full items-center justify-center p-2.5 sm:p-4 md:p-6 text-center">
            <div
              className="relative w-full max-w-lg sm:max-w-2xl lg:max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col text-left border border-[#DCE0E6] my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header: Dark Blue #184C78 */}
            <div className="bg-[#184C78] text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
                  <MessageSquare className="w-4 h-4 text-sky-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 id="modal-detail-aduan-title" className="font-heading text-base sm:text-lg font-bold leading-tight">
                      Detail Aduan &amp; Tanggapan Warga
                    </h3>
                    <span className="text-[10px] font-mono bg-white/15 px-2 py-0.5 rounded text-sky-200">
                      #ADUAN-{selectedAduanDetail.id}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-white/80 mt-0.5 leading-tight">
                    Informasi lengkap aduan publik dan tindak lanjut dinas teknis Kabupaten Lamongan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAduanDetail(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-3"
                title="Tutup Detail Aduan"
                aria-label="Tutup Detail Aduan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body: ETHOL key-value layout */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs scrollbar-thin">
              {/* Stepper Status Mini */}
              <div className="bg-[#F5F7FA] p-3 rounded-xl border border-[#DCE0E6]">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#6C757D] mb-2">
                  <span>Status Alur Penanganan</span>
                  <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${
                    selectedAduanDetail.status === 'selesai'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : selectedAduanDetail.status === 'diproses'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}>
                    {selectedAduanDetail.status === 'selesai'
                      ? 'Selesai & Ditanggapi'
                      : selectedAduanDetail.status === 'diproses'
                      ? 'Sedang Ditindaklanjuti'
                      : 'Menunggu Telaah Dinas'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                  <div className="p-1.5 rounded-lg bg-emerald-100/80 text-emerald-800 font-semibold">
                    1. Masuk
                  </div>
                  <div className={`p-1.5 rounded-lg font-semibold ${
                    selectedAduanDetail.status !== 'menunggu'
                      ? 'bg-emerald-100/80 text-emerald-800'
                      : 'bg-slate-200/70 text-slate-600'
                  }`}>
                    2. Telaah
                  </div>
                  <div className={`p-1.5 rounded-lg font-semibold ${
                    selectedAduanDetail.status === 'diproses' || selectedAduanDetail.status === 'selesai'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200/70 text-slate-600'
                  }`}>
                    3. Lapangan
                  </div>
                  <div className={`p-1.5 rounded-lg font-semibold ${
                    selectedAduanDetail.status === 'selesai'
                      ? 'bg-emerald-100/80 text-emerald-800'
                      : 'bg-slate-200/70 text-slate-600'
                  }`}>
                    4. Selesai
                  </div>
                </div>
              </div>

              {/* Detail Aduan Format ETHOL */}
              <div className="bg-white border border-[#DCE0E6] rounded-xl p-4 sm:p-5 space-y-3">
                <div className="grid grid-cols-[120px_16px_1fr] items-start text-xs">
                  <span className="font-semibold text-slate-700">Judul</span>
                  <span className="text-slate-400 font-semibold">:</span>
                  <span className="text-slate-900 font-bold">{selectedAduanDetail.judul}</span>
                </div>
                <div className="grid grid-cols-[120px_16px_1fr] items-start text-xs">
                  <span className="font-semibold text-slate-700">Proyek Terkait</span>
                  <span className="text-slate-400 font-semibold">:</span>
                  <span className="text-slate-800 font-medium">{selectedAduanDetail.nama_proyek}</span>
                </div>
                <div className="grid grid-cols-[120px_16px_1fr] items-start text-xs">
                  <span className="font-semibold text-slate-700">Kategori</span>
                  <span className="text-slate-400 font-semibold">:</span>
                  <div>
                    <span className="inline-block bg-[#EBF4FB] text-[#184C78] border border-[#c5def2] px-2.5 py-0.5 rounded text-[11px] font-semibold">
                      {selectedAduanDetail.kategori_aduan}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-[120px_16px_1fr] items-start text-xs">
                  <span className="font-semibold text-slate-700">Waktu Pengajuan</span>
                  <span className="text-slate-400 font-semibold">:</span>
                  <span className="text-slate-700 font-mono text-[11px]">{selectedAduanDetail.tanggal_lapor}</span>
                </div>
                <div className="grid grid-cols-[120px_16px_1fr] items-start text-xs">
                  <span className="font-semibold text-slate-700">Status</span>
                  <span className="text-slate-400 font-semibold">:</span>
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${
                      selectedAduanDetail.status === 'selesai'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : selectedAduanDetail.status === 'diproses'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}>
                      {selectedAduanDetail.status === 'selesai' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {selectedAduanDetail.status === 'diproses' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                      {selectedAduanDetail.status === 'selesai'
                        ? 'Selesai & Ditanggapi'
                        : selectedAduanDetail.status === 'diproses'
                        ? 'Sedang Ditindaklanjuti'
                        : 'Menunggu Telaah Dinas'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-[120px_16px_1fr] items-start text-xs pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-700">Deskripsi</span>
                  <span className="text-slate-400 font-semibold">:</span>
                  <p className="text-slate-800 leading-relaxed bg-[#F8FAFC] p-3 rounded-lg border border-slate-200/80">
                    "{selectedAduanDetail.isi_laporan}"
                  </p>
                </div>
              </div>

              {/* Tanggapan Resmi Dinas (Section Tanggapan seperti Upload Jawaban ETHOL) */}
              <div>
                <h4 className="font-bold text-[#184C78] mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tindak Lanjut &amp; Tanggapan Resmi Dinas Teknis:</span>
                </h4>
                {selectedAduanDetail.tanggapan_dinas ? (
                  <div className="p-4 bg-[#EBF4FB]/80 rounded-xl border border-[#c5def2] space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                      <span className="font-bold text-[#184C78] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Dijawab oleh: {selectedAduanDetail.petugas_penjawab || 'Admin Pengawas Dinas Teknis'}</span>
                      </span>
                      <span className="text-[#6C757D] font-mono">{selectedAduanDetail.tanggal_tanggapan}</span>
                    </div>
                    <p className="text-slate-800 leading-relaxed text-xs pt-1 border-t border-[#c5def2]/70">
                      {selectedAduanDetail.tanggapan_dinas}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 text-amber-800 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-xs text-amber-900">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Belum Ada Tanggapan Dinas</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-800/90">
                      Laporan Anda sudah masuk dalam sistem dan sedang dalam antrean verifikasi petugas dinas. Pengawas teknis lapangan akan meninjau dan menyampaikan tanggapan di sini.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 py-3 sm:py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowFullDetailView(true)}
                className="text-xs font-semibold text-[#184C78] hover:text-[#2980B9] flex items-center justify-center sm:justify-start gap-1 cursor-pointer"
              >
                <span>Buka Halaman Audit Trail Lengkap</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center justify-end gap-2">
                {!selectedAduanDetail.tanggapan_dinas && selectedAduanDetail.status === 'menunggu' && (
                  <button
                    type="button"
                    onClick={() => {
                      const cur = selectedAduanDetail;
                      setSelectedAduanDetail(null);
                      setEditingAduan(cur);
                      setEditJudul(cur.judul);
                      setEditIsi(cur.isi_laporan);
                      setEditError(null);
                    }}
                    className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#EBF4FB] text-[#184C78] hover:bg-[#d8eaf7] border border-[#c5def2] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#2980B9]" />
                    <span>Edit Pengaduan</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedAduanDetail(null)}
                  className="flex-1 sm:flex-none px-5 py-2 text-xs font-bold text-white bg-[#184C78] hover:bg-[#12395b] rounded-xl shadow-xs transition-colors cursor-pointer text-center"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ── MODAL 2: KIRIM LAPORAN / TANGGAPAN WARGA (GAYA ETHOL) ── */}
      {isNewReportModalOpen && renderPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-report-title"
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/65 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsNewReportModalOpen(false)}
        >
          <div className="flex min-h-full items-center justify-center p-2.5 sm:p-4 md:p-6 text-center">
            <div
              className="relative w-full max-w-lg sm:max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col text-left border border-[#DCE0E6] my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header: Dark Blue #184C78 */}
            <div className="bg-[#184C78] text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
                  <MessageSquarePlus className="w-4 h-4 text-sky-300" />
                </div>
                <div>
                  <h3 id="modal-report-title" className="font-heading text-base sm:text-lg font-bold leading-tight">
                    Kirim Laporan / Tanggapan Warga
                  </h3>
                  <p className="text-[11px] sm:text-xs text-white/80 mt-0.5 leading-tight">
                    Laporan akan diteruskan ke dinas teknis terkait dan tercatat secara transparan di dashboard.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewReportModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-3"
                title="Tutup Modal"
                aria-label="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmitReport} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs scrollbar-thin">
                {existingReportForSelected && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Anda Sudah Mengajukan Aduan Pada Proyek Ini</span>
                    </div>
                    <p className="leading-relaxed text-[11px]">
                      Anda telah memiliki aduan: <strong>"{existingReportForSelected.judul}"</strong>. Setiap warga hanya diperkenankan memiliki 1 aduan aktif per proyek. Silakan gunakan fitur <strong>Edit Pengaduan</strong> di riwayat aduan Anda jika belum ditanggapi dinas.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-[#184C78] mb-1">Pilih Proyek Terkait</label>
                    <select
                      value={reportForm.proyek_id}
                      onChange={(e) => setReportForm({ ...reportForm, proyek_id: Number(e.target.value) })}
                      className="w-full p-2.5 border border-[#DCE0E6] rounded-xl bg-white outline-none focus:border-[#2980B9] text-xs font-medium"
                    >
                      {projects.map((p) => {
                        const alreadyReported = laporanList.some((lap) => lap.proyek_id === p.id);
                        return (
                          <option key={p.id} value={p.id}>
                            {p.nama_proyek} {alreadyReported ? '(⚠️ Sudah Pernah Anda Adukan)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#184C78] mb-1">Kategori Laporan</label>
                    <select
                      value={reportForm.kategori_aduan}
                      onChange={(e) => setReportForm({ ...reportForm, kategori_aduan: e.target.value })}
                      className="w-full p-2.5 border border-[#DCE0E6] rounded-xl bg-white outline-none focus:border-[#2980B9] text-xs font-medium"
                    >
                      <option value="Dampak Lingkungan & Keselamatan">Dampak Lingkungan & Keselamatan</option>
                      <option value="Jadwal & Akses Jalan">Jadwal & Akses Jalan</option>
                      <option value="Kualitas Mutu Bangunan">Kualitas Mutu Bangunan</option>
                      <option value="Apresiasi & Fasilitas">Apresiasi & Fasilitas</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#184C78] mb-1">Judul Ringkas</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rambu keselamatan malam hari perlu ditambah"
                    value={reportForm.judul}
                    onChange={(e) => setReportForm({ ...reportForm, judul: e.target.value })}
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-xl outline-none focus:border-[#2980B9] text-xs"
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
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-xl outline-none focus:border-[#2980B9] text-xs leading-relaxed"
                  />
                  <div className="flex items-center gap-1.5 text-[11px] text-[#6C757D] mt-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Dilengkapi Sensor Otomatis: Kata tidak pantas akan difilter demi etika komunikasi publik.</span>
                  </div>
                </div>
              </div>

              {/* Sticky Responsive Footer */}
              <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsNewReportModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!!existingReportForSelected}
                  className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-white bg-[#184C78] hover:bg-[#12395b] rounded-xl shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-center"
                >
                  {existingReportForSelected ? 'Proyek Sudah Diadukan' : 'Kirim Laporan Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      )}

      {/* ── MODAL 3: EDIT PENGADUAN WARGA (GAYA ETHOL) ── */}
      {editingAduan && renderPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-edit-title"
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/65 backdrop-blur-xs animate-fade-in"
          onClick={() => setEditingAduan(null)}
        >
          <div className="flex min-h-full items-center justify-center p-2.5 sm:p-4 md:p-6 text-center">
            <div
              className="relative w-full max-w-lg sm:max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col text-left border border-[#DCE0E6] my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header: Dark Blue #184C78 */}
            <div className="bg-[#184C78] text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
                  <Edit3 className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 id="modal-edit-title" className="font-heading text-base sm:text-lg font-bold leading-tight">
                    Edit Pengaduan Warga
                  </h3>
                  <p className="text-[11px] sm:text-xs text-white/80 mt-0.5 leading-tight">
                    Terkait Proyek: {editingAduan.nama_proyek}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAduan(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-3"
                title="Tutup Modal"
                aria-label="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveEditAduan} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs scrollbar-thin">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>Pengaduan hanya dapat diedit sebelum petugas dinas memberikan tanggapan resmi.</span>
                </div>

                {editError && (
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 font-semibold text-xs">
                    {editError}
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-[#184C78] mb-1">Judul Ringkas</label>
                  <input
                    type="text"
                    required
                    value={editJudul}
                    onChange={(e) => setEditJudul(e.target.value)}
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-xl outline-none focus:border-[#2980B9] text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#184C78] mb-1">Uraian Detail Laporan</label>
                  <textarea
                    rows={5}
                    required
                    value={editIsi}
                    onChange={(e) => setEditIsi(e.target.value)}
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-xl outline-none focus:border-[#2980B9] text-xs leading-relaxed"
                  />
                </div>
              </div>

              {/* Sticky Responsive Footer */}
              <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingAduan(null)}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-white bg-[#184C78] hover:bg-[#12395b] rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer text-center"
                >
                  {isSubmittingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      )}

      {/* ── MODAL 4: EVALUASI CACAT FISIK PASCA-PROYEK (GAYA ETHOL) ── */}
      {isEvaluasiModalOpen && renderPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-evaluasi-title"
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/65 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsEvaluasiModalOpen(false)}
        >
          <div className="flex min-h-full items-center justify-center p-2.5 sm:p-4 md:p-6 text-center">
            <div
              className="relative w-full max-w-lg sm:max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col text-left border border-[#DCE0E6] my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header: Dark Blue #184C78 */}
            <div className="bg-[#184C78] text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 id="modal-evaluasi-title" className="font-heading text-base sm:text-lg font-bold leading-tight">
                    Laporkan Cacat Fisik Pasca-Proyek
                  </h3>
                  <p className="text-[11px] sm:text-xs text-white/80 mt-0.5 leading-tight">
                    Pengaduan kerusakan fisik proyek selesai dengan analisis urgensi otomatis Groq AI untuk masa pemeliharaan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEvaluasiModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-3"
                title="Tutup Modal"
                aria-label="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmitEvaluasi} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs scrollbar-thin">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-[#184C78] mb-1">Proyek Selesai</label>
                    <select
                      value={evaluasiForm.proyek_id}
                      onChange={(e) => setEvaluasiForm({ ...evaluasiForm, proyek_id: Number(e.target.value) })}
                      className="w-full p-2.5 border border-[#DCE0E6] rounded-xl bg-white outline-none focus:border-[#2980B9] text-xs font-medium"
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
                      className="w-full p-2.5 border border-[#DCE0E6] rounded-xl bg-white outline-none focus:border-[#2980B9] text-xs font-medium"
                    >
                      <option value="Struktur Beton / Retak Ambles">Struktur Beton / Retak Ambles</option>
                      <option value="Drainase / Saluran Tersumbat">Drainase / Saluran Tersumbat</option>
                      <option value="Aspal Mengelupas / Lubang Jalan">Aspal Mengelupas / Lubang Jalan</option>
                      <option value="Fasilitas / Lampu / Rambu Rusak">Fasilitas / Lampu / Rambu Rusak</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#184C78] mb-1">Titik Patokan Lokasi</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Depan Ruko No. 42 / Dekat Halte Busway"
                    value={evaluasiForm.lokasi_titik}
                    onChange={(e) => setEvaluasiForm({ ...evaluasiForm, lokasi_titik: e.target.value })}
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-xl outline-none focus:border-[#2980B9] text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#184C78] mb-1">Deskripsi Kerusakan Fisik</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Jelaskan jenis kerusakan, ukuran retakan/amblesan, dan potensi bahaya keselamatan bagi pejalan kaki atau kendaraan..."
                    value={evaluasiForm.deskripsi}
                    onChange={(e) => setEvaluasiForm({ ...evaluasiForm, deskripsi: e.target.value })}
                    className="w-full p-2.5 border border-[#DCE0E6] rounded-xl outline-none focus:border-[#2980B9] text-xs leading-relaxed resize-y min-h-[70px] sm:min-h-[90px]"
                  />
                </div>
              </div>

              {/* Sticky Responsive Footer */}
              <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEvaluasiModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-white bg-[#184C78] hover:bg-[#12395b] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-center"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Analisis AI &amp; Kirimkan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}

      {/* ── KONTEN UTAMA DASHBOARD ── */}
      <div className="space-y-6">
        {/* ── TOP NAVIGATION BACK BAR (KEMBALI KE OVERVIEW) ── */}
        {activeTab !== 'overview' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:px-5 sm:py-3 rounded-2xl border border-[#DCE0E6] shadow-2xs">
            <button
              type="button"
              onClick={handleBackToOverview}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#F8FAFC] hover:bg-[#EBF4FB] text-[#184C78] border border-[#DCE0E6] hover:border-[#BFDBFE] rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer group self-start sm:self-auto"
            >
              <ArrowLeft className="w-4 h-4 text-[#184C78] group-hover:-translate-x-0.5 transition-transform" />
              <span>Kembali ke Overview</span>
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Halaman Utama Peta Spasial GIS &amp; Transparansi Proyek</span>
            </div>
          </div>
        )}

      {/* ── TAB CONTENT 1: DASHBOARD OVERVIEW (RINGKASAN & MONITORING) ── */}
      {activeTab === 'overview' && (
        <>
          {/* ── TOP HERO BANNER WARGA ── */}
          <div className="bg-gradient-to-r from-[#184C78] via-[#1a6fa8] to-[#2980B9] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 max-w-3xl">
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
                Selamat Datang, {currentUser.nama}! 👋
              </h1>
              <p className="text-white/85 text-xs sm:text-sm mt-2 leading-relaxed">
                Pantau perkembangan proyek infrastruktur di sekitar tempat tinggalmu secara transparan, kirimkan tanggapan langsung ke dinas pengawas, serta berikan penilaian kepuasan pembangunan.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setIsNewReportModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-white text-[#184C78] font-bold text-xs rounded-xl shadow-xs hover:bg-slate-100 flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer active:scale-98 min-h-[42px]"
                >
                  <Plus className="w-4 h-4 text-[#184C78]" />
                  <span>Buat Laporan / Masukan Baru</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAIRoute('Pelebaran Jalan Soekarno Hatta')}
                  className="w-full sm:w-auto px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs rounded-xl backdrop-blur-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 min-h-[42px]"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Cek Rute Alternatif AI</span>
                </button>
                {onOpenMapExplorer && (
                  <button
                    type="button"
                    onClick={onOpenMapExplorer}
                    className="w-full sm:w-auto px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs rounded-xl backdrop-blur-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 min-h-[42px]"
                  >
                    <Compass className="w-4 h-4 text-emerald-300" />
                    <span>Jelajahi Peta &amp; Data Spasial</span>
                  </button>
                )}
              </div>
            </div>

            {/* Decorative background shape */}
            <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none -mr-16 -mb-16" />
          </div>

          {/* ── EARLY-WARNING IN-APP BANNER & BADGE (RADIUS & RUTENYA) ── */}
          {(routeOverlapAlert || earlyWarningProjects.length > 0) && (
            <div
              className={`rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden transition-all duration-300 animate-fade-in ${
                routeOverlapAlert
                  ? 'bg-gradient-to-r from-red-950 via-rose-950 to-neutral-900 text-white border-2 border-red-500/80 shadow-red-950/40'
                  : 'bg-gradient-to-r from-purple-900/90 via-indigo-950 to-slate-900 text-white border border-purple-500/30 shadow-lg'
              }`}
            >
              <div
                className={`absolute -right-6 -bottom-6 w-40 h-40 rounded-full blur-2xl pointer-events-none ${
                  routeOverlapAlert ? 'bg-red-500/20' : 'bg-purple-500/10'
                }`}
              />
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                      routeOverlapAlert
                        ? 'bg-red-500/25 border-red-400/50 shadow-md shadow-red-500/30'
                        : 'bg-purple-500/20 border-purple-400/30'
                    }`}
                  >
                    {routeOverlapAlert ? (
                      <AlertTriangle className="w-5 h-5 text-rose-300 animate-pulse" />
                    ) : (
                      <Bell className="w-5 h-5 text-purple-300 animate-bounce" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {routeOverlapAlert ? (
                        <>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-red-600 text-white border border-red-400/80 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            🚨 PRIORITAS TINGGI: Rute Harianmu Terdampak!
                          </span>
                          <span className="text-[10px] font-mono text-rose-200 bg-rose-950/80 border border-rose-700/60 px-2 py-0.5 rounded-full">
                            Lintasan Beririsan &lt; 100m
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                            Sistem Early-Warning (Radius &amp; LPSE)
                          </span>
                          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                            {earlyWarningProjects.length} Proyek Terdeteksi Hulu SiRUP
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="font-heading text-sm sm:text-base font-bold text-white mt-1.5">
                      {routeOverlapAlert ? routeOverlapAlert.title : earlyWarningProjects[0].nama_proyek}
                    </h3>
                    <p
                      className={`text-xs mt-0.5 max-w-2xl leading-relaxed ${
                        routeOverlapAlert ? 'text-rose-100 font-medium' : 'text-purple-200/90'
                      }`}
                    >
                      {routeOverlapAlert
                        ? routeOverlapAlert.message
                        : earlyWarningProjects[0].status === 'scheduled'
                        ? 'Pemberitahuan H-7: Proyek ini dijadwalkan memulai pekerjaan fisik dalam 7 hari. Rekomendasi rute pengalihan arus telah aktif di menu AI Route.'
                        : 'Kontrak LPSE/SiRUP telah terbit. Rute alternatif dan radius dampak ±1.200 meter telah dipetakan lebih awal dari Google Maps.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (routeOverlapAlert) {
                        onOpenAIRoute(
                          routeOverlapAlert.project.nama_proyek,
                          routeOverlapAlert.project,
                          routeOverlapAlert.savedRoute
                        );
                      } else {
                        onOpenAIRoute(earlyWarningProjects[0].nama_proyek);
                      }
                    }}
                    className={`flex-1 md:flex-initial px-4 py-2.5 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all hover:scale-102 cursor-pointer active:scale-98 ${
                      routeOverlapAlert
                        ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white shadow-red-950/40 ring-2 ring-red-400/40'
                        : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Lihat Rute Alternatif AI</span>
                  </button>
                  {onOpenMapExplorer && (
                    <button
                      type="button"
                      onClick={onOpenMapExplorer}
                      className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 flex items-center justify-center gap-1 transition-all cursor-pointer"
                      title="Lihat Titik Proyek di Peta Spasial"
                    >
                      <Compass className="w-3.5 h-3.5 text-cyan-300" />
                      <span className="hidden sm:inline">Peta Spasial</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── SPATIAL MINIMAP OVERVIEW WIDGET (GIS PREVIEW) ── */}
          {onOpenMapExplorer && (
            <MiniMapOverview
              projects={projects}
              onOpenMapExplorer={onOpenMapExplorer}
            />
          )}

          {/* ── METRIC CARDS ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => onSelectSection && onSelectSection('langganan')}
              className="bg-white p-5 rounded-2xl border border-[#DCE0E6] shadow-xs flex items-center gap-4 hover:border-[#184C78]/40 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#EBF4FB] text-[#184C78] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Bookmark className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-heading font-extrabold text-[#184C78]">
                  {subscribedList.length}
                </div>
                <div className="text-xs text-[#6C757D] font-medium">Proyek Diikuti</div>
              </div>
            </div>

            <div
              onClick={() => onSelectSection && onSelectSection('laporan')}
              className="bg-white p-5 rounded-2xl border border-[#DCE0E6] shadow-xs flex items-center gap-4 hover:border-[#E67E22]/40 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#FEF3E7] text-[#E67E22] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <MessageSquarePlus className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-heading font-extrabold text-[#212529]">
                  {laporanList.length}
                </div>
                <div className="text-xs text-[#6C757D] font-medium">Laporan Terkirim</div>
              </div>
            </div>

            <div
              onClick={() => onSelectSection && onSelectSection('rating')}
              className="bg-white p-5 rounded-2xl border border-[#DCE0E6] shadow-xs flex items-center gap-4 hover:border-[#1A9E6E]/40 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#E6F7F1] text-[#1A9E6E] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-heading font-extrabold text-[#212529]">
                  {ratingList.length}
                </div>
                <div className="text-xs text-[#6C757D] font-medium">Rating Diberikan</div>
              </div>
            </div>

            <div
              onClick={() => onSelectSection && onSelectSection('evaluasi')}
              className="bg-white p-5 rounded-2xl border border-[#DCE0E6] shadow-xs flex items-center gap-4 hover:border-[#E74C3C]/40 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#FDEDEC] text-[#E74C3C] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-heading font-extrabold text-[#212529]">
                  {evaluasiList.length}
                </div>
                <div className="text-xs text-[#6C757D] font-medium">Evaluasi Cacat Fisik</div>
              </div>
            </div>
          </div>

          {/* ── RINGKASAN PROYEK DI IKUTI (PREVIEW SINGKAT PADA DASHBOARD OVERVIEW) ── */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#DCE0E6] shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EBF4FB] text-[#184C78] flex items-center justify-center shrink-0">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold font-heading text-[#184C78]">
                    Ringkasan Proyek yang Anda Ikuti
                  </h2>
                  <p className="text-xs text-[#6C757D]">
                    Preview perkembangan terkini dari proyek pilihan Anda.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectSection && onSelectSection('langganan')}
                className="text-xs font-semibold px-3.5 py-1.5 bg-[#EBF4FB] hover:bg-[#dcebf7] text-[#184C78] rounded-xl border border-[#c5def2] shrink-0 self-start sm:self-auto flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Lihat Halaman Proyek Diikuti ({subscribedList.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subscribedList.slice(0, 3).map((sub) => {
                const p = sub.proyek;
                return (
                  <div
                    key={sub.id}
                    className="bg-white rounded-2xl border border-[#DCE0E6] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-heading font-bold text-base text-[#0B2540] leading-snug">
                            {p.nama_proyek}
                          </h3>
                          <p className="text-xs text-[#6C757D] mt-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#2980B9] shrink-0" />
                            <span className="truncate">{p.nama_wilayah}</span>
                          </p>
                        </div>

                        {/* Instagram-style Follow/Notif icon toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleNotification(sub.id)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                            sub.notifikasi_aktif
                              ? 'bg-[#EBF4FB] text-[#184C78] hover:bg-[#dcebf7]'
                              : 'bg-[#F1F5F9] text-[#94A3B8] hover:bg-[#E2E8F0] hover:text-[#64748B]'
                          }`}
                          title={sub.notifikasi_aktif ? 'Mengikuti (Klik untuk senyapkan)' : 'Tidak Mengikuti (Klik untuk ikuti)'}
                          aria-label={sub.notifikasi_aktif ? 'Mengikuti' : 'Tidak Mengikuti'}
                        >
                          {sub.notifikasi_aktif ? (
                            <Bell className="w-4 h-4 fill-[#184C78]" />
                          ) : (
                            <BellOff className="w-4 h-4" />
                          )}
                        </button>
                      </div>

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
                      <button
                        onClick={() => onOpenAIRoute(p.nama_proyek, p)}
                        className="px-3 py-2 bg-[#FEF3E7] hover:bg-[#FDEBD0] text-[#E67E22] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        title="Rute Alternatif AI"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── TAB CONTENT 2: HALAMAN KHUSUS PROYEK DI IKUTI ── */}
      {activeTab === 'langganan' && (
        <div className="space-y-5 animate-fade-in">
          {/* Dedicated Header for Proyek Diikuti */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[#DCE0E6] shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#EBF4FB] text-[#184C78] flex items-center justify-center shrink-0">
                <Bookmark className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-heading text-[#0B2540]">
                  Proyek Pilihan yang Anda Ikuti
                </h2>
                <p className="text-xs text-[#6C757D] mt-0.5">
                  Daftar seluruh proyek pembangunan yang Anda pantau linimasa, foto lapangan, dan notifikasi pembaruannya.
                </p>
              </div>
            </div>
            <div className="text-xs font-semibold px-3 py-1.5 bg-[#F5F7FA] text-[#184C78] rounded-xl border border-[#DCE0E6] shrink-0 self-start sm:self-auto">
              Total {subscribedList.length} Proyek Aktif
            </div>
          </div>

          {/* Grid Proyek Diikuti Lengkap */}
          {subscribedList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subscribedList.map((sub) => {
                const p = sub.proyek;
                return (
                  <div
                    key={sub.id}
                    className="bg-white rounded-2xl border border-[#DCE0E6] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-heading font-bold text-base text-[#0B2540] leading-snug">
                            {p.nama_proyek}
                          </h3>
                          <p className="text-xs text-[#6C757D] mt-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#2980B9] shrink-0" />
                            <span className="truncate">{p.nama_wilayah}</span>
                          </p>
                        </div>

                        {/* Instagram-style Follow/Notif icon toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleNotification(sub.id)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                            sub.notifikasi_aktif
                              ? 'bg-[#EBF4FB] text-[#184C78] hover:bg-[#dcebf7]'
                              : 'bg-[#F1F5F9] text-[#94A3B8] hover:bg-[#E2E8F0] hover:text-[#64748B]'
                          }`}
                          title={sub.notifikasi_aktif ? 'Mengikuti (Klik untuk senyapkan)' : 'Tidak Mengikuti (Klik untuk ikuti)'}
                          aria-label={sub.notifikasi_aktif ? 'Mengikuti' : 'Tidak Mengikuti'}
                        >
                          {sub.notifikasi_aktif ? (
                            <Bell className="w-4 h-4 fill-[#184C78]" />
                          ) : (
                            <BellOff className="w-4 h-4" />
                          )}
                        </button>
                      </div>

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
                      <button
                        onClick={() => onOpenAIRoute(p.nama_proyek, p)}
                        className="px-3 py-2 bg-[#FEF3E7] hover:bg-[#FDEBD0] text-[#E67E22] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        title="Rute Alternatif AI"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#DCE0E6] p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#F5F7FA] text-[#6C757D] flex items-center justify-center mx-auto mb-4">
                <Bookmark className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-[#0B2540] font-heading">
                Belum Ada Proyek yang Diikuti
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1.5 mb-5">
                Anda belum menandai proyek pembangunan untuk diikuti. Buka Peta Spasial untuk menemukan proyek di sekitar Anda dan tekan ikon lonceng untuk mengikutinya.
              </p>
              {onOpenMapExplorer && (
                <button
                  onClick={onOpenMapExplorer}
                  className="px-5 py-2.5 bg-[#184C78] hover:bg-[#0f3252] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Buka Peta Spasial Proyek</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB CONTENT 2: LAPORAN & ADUAN SAYA ── */}
      {activeTab === 'laporan' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#DCE0E6]">
            <div>
              <h2 className="text-base font-bold font-heading text-[#184C78]">
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

          {/* Sub-bar Filter & Urutan Aduan (Dropdown Rapi & Modern) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-4 py-3 rounded-xl border border-[#DCE0E6] shadow-2xs">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-heading font-bold text-[#184C78] text-sm">
                {filteredLaporan.length}
              </span>
              <span className="font-medium text-slate-500">Laporan ditampilkan</span>
              {reportFilter !== 'semua' && (
                <span className="text-[10px] font-bold text-[#184C78] bg-[#EBF4FB] px-2 py-0.5 rounded-full border border-[#c5def2] capitalize">
                  Status: {reportFilter}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <label htmlFor="sort-laporan-select" className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#184C78]" />
                <span>Urutkan:</span>
              </label>

              <div className="relative min-w-[230px]">
                <select
                  id="sort-laporan-select"
                  aria-label="Urutkan Riwayat Laporan"
                  value={reportSortBy}
                  onChange={(e) => setReportSortBy(e.target.value as any)}
                  className="w-full text-xs font-semibold bg-white border border-[#DCE0E6] text-slate-800 rounded-xl pl-3 pr-8 py-2 appearance-none focus:outline-none focus:border-[#184C78] focus:ring-1 focus:ring-[#184C78] shadow-2xs cursor-pointer hover:border-slate-400 transition-colors"
                >
                  <option value="terbaru">⏳ Terbaru (Paling Baru)</option>
                  <option value="terlama">🕰️ Terlama (Laporan Awal)</option>
                  <option value="terbanyak">🔥 Paling Banyak Terdapat Aduan</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
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
                  onClick={() => setSelectedAduanDetail(lap)}
                  className="bg-white rounded-2xl border border-[#DCE0E6] p-5 shadow-xs hover:border-[#184C78]/50 hover:shadow-md transition-all space-y-3 cursor-pointer group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-semibold text-[#2980B9] bg-[#EBF4FB] px-2 py-0.5 rounded mr-2">
                        {lap.kategori_aduan}
                      </span>
                      <span className="text-xs text-[#6C757D] font-mono">
                        {lap.tanggal_lapor}
                      </span>
                      {projectReportCounts[lap.proyek_id] > 1 && (
                        <span className="ml-2 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 inline-flex items-center gap-1">
                          🔥 {projectReportCounts[lap.proyek_id]} Aduan Terkait
                        </span>
                      )}
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${statusInfo.bg}`}>
                      {lap.status === 'selesai' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {lap.status === 'diproses' && <Clock className="w-3.5 h-3.5" />}
                      {statusInfo.text}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-base text-[#212529] group-hover:text-[#184C78] transition-colors">
                      {lap.judul}
                    </h3>
                    <div className="text-xs font-semibold text-[#184C78] mt-0.5">
                      Terkait: {lap.nama_proyek}
                    </div>
                    <p className="text-xs text-[#495057] mt-2 leading-relaxed bg-[#F5F7FA] p-3 rounded-xl border border-[#DCE0E6]/50">
                      "{lap.isi_laporan}"
                    </p>
                  </div>

                  {lap.tanggapan_dinas ? (
                    <div className="mt-3 p-3.5 bg-[#EBF4FB]/70 rounded-xl border border-[#c5def2] text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-[#184C78] flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-[#2980B9]" />
                          <span>Tanggapan Resmi: {lap.petugas_penjawab || 'Dinas Terkait'}</span>
                        </div>
                        <span className="text-[10px] text-[#6C757D] font-mono">{lap.tanggal_tanggapan}</span>
                      </div>
                      <p className="text-[#212529] leading-relaxed line-clamp-3">
                        {lap.tanggapan_dinas}
                      </p>
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#6C757D] italic flex items-center gap-1.5 pt-1">
                      <Clock className="w-3.5 h-3.5 text-[#E67E22]" />
                      <span>Sedang dalam antrean telaah teknis pengawas lapangan dinas.</span>
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#DCE0E6]/50">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAduanDetail(lap);
                      }}
                      className="text-xs font-bold text-[#184C78] hover:text-[#2980B9] flex items-center gap-1.5 cursor-pointer py-1"
                    >
                      <span>Lihat Detail Aduan &amp; Tanggapan &rarr;</span>
                    </button>

                    {!lap.tanggapan_dinas && lap.status === 'menunggu' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingAduan(lap);
                          setEditJudul(lap.judul);
                          setEditIsi(lap.isi_laporan);
                          setEditError(null);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#EBF4FB] text-[#184C78] hover:bg-[#d8eaf7] border border-[#c5def2] flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#2980B9]" />
                        <span>Edit Pengaduan</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB CONTENT 3: RATING & ULASAN ── */}
      {activeTab === 'rating' && (
        <div className="space-y-6">
          {/* Rating Submission / Edit Card (Full Width - Satu Kotak Sampai Ujung) */}
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-[#DCE0E6] shadow-xs space-y-5">
            {/* Header & Project Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DCE0E6]">
              <div>
                <h2 className="font-heading font-bold text-base sm:text-lg text-[#184C78]">
                  Beri Penilaian Proyek Selesai
                </h2>
                <p className="text-xs text-[#6C757D] mt-0.5">
                  Khusus proyek yang telah berstatus 100% Selesai untuk mengukur kepuasan publik.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="pilih-proyek-rating-select" className="text-xs font-semibold text-[#184C78] shrink-0">
                  Pilih Proyek Selesai:
                </label>
                <select
                  id="pilih-proyek-rating-select"
                  aria-label="Pilih Proyek Selesai"
                  value={ratingForm.proyek_id}
                  onChange={(e) => {
                    const nextPid = Number(e.target.value);
                    setRatingForm((prev) => ({ ...prev, proyek_id: nextPid }));
                    setIsEditingRating(false);
                  }}
                  className="px-3 py-1.5 border border-[#DCE0E6] rounded-xl bg-white text-xs font-medium text-slate-800 outline-none focus:border-[#2980B9] shadow-2xs max-w-[260px] sm:max-w-[320px] truncate"
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
            </div>

            {ratingSuccessMessage && (
              <div className="p-3 bg-[#E6F7F1] text-[#1A9E6E] text-xs font-semibold rounded-xl border border-[#B7EBD8] flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{ratingSuccessMessage}</span>
              </div>
            )}

            {userExistingRating && !isEditingRating ? (
              /* Tampilan Jika Warga Sudah Pernah Rating (Hanya Ada Opsi Edit Ulasan) */
              <div className="space-y-5">
                {/* Banner Status Sudah Dinilai */}
                <div className="p-4 bg-emerald-50/80 border border-emerald-200/90 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs sm:text-sm font-bold text-emerald-950">
                          Anda Sudah Memberikan Penilaian untuk Proyek Ini
                        </h3>
                        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Terverifikasi
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        Tercatat pada {userExistingRating.tanggal || 'hari ini'}. Anda dapat memperbarui penilaian sewaktu-waktu.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartEditRating(userExistingRating)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 shadow-2xs transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Edit Ulasan</span>
                  </button>
                </div>

                {/* Bagian Atas: Bagian Penilaian */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold text-[#184C78] uppercase tracking-wider block">
                    Bagian Penilaian Anda
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
                    {/* Skor Bintang card */}
                    <div className="bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] p-4 rounded-xl border border-[#DCE0E6] flex flex-col justify-between space-y-2">
                      <span className="text-[11px] font-semibold text-slate-500">Skor Bintang Keseluruhan</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-[#184C78] tabular-nums">
                          {userExistingRating.bintang.toFixed(1)}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">/ 5.0</span>
                      </div>
                      <div className="text-amber-400 text-base">
                        {'★'.repeat(userExistingRating.bintang)}{'☆'.repeat(5 - userExistingRating.bintang)}
                      </div>
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border self-start shadow-2xs ${getScoreDescriptor(userExistingRating.bintang).badgeClass}`}>
                        {getScoreDescriptor(userExistingRating.bintang).label}
                      </span>
                    </div>

                    {/* 3 Parameter cards */}
                    <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#DCE0E6] flex flex-col justify-between">
                        <div className="flex items-center gap-2 text-[#184C78] mb-2">
                          <ShieldCheck className="w-4 h-4 shrink-0" />
                          <span className="font-bold text-xs truncate">Mutu &amp; Kerapian Fisik</span>
                        </div>
                        <div>
                          <div className="text-xl font-black text-[#184C78]">{userExistingRating.aspek_kualitas} <span className="text-xs font-semibold text-slate-400">/ 5</span></div>
                          <span className="text-[10px] font-semibold text-slate-500 mt-1 block">{getParamValueDescriptor(userExistingRating.aspek_kualitas)}</span>
                        </div>
                      </div>

                      <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#DCE0E6] flex flex-col justify-between">
                        <div className="flex items-center gap-2 text-[#184C78] mb-2">
                          <Clock className="w-4 h-4 shrink-0" />
                          <span className="font-bold text-xs truncate">Ketepatan Waktu</span>
                        </div>
                        <div>
                          <div className="text-xl font-black text-[#184C78]">{userExistingRating.aspek_ketepatan_waktu} <span className="text-xs font-semibold text-slate-400">/ 5</span></div>
                          <span className="text-[10px] font-semibold text-slate-500 mt-1 block">{getParamValueDescriptor(userExistingRating.aspek_ketepatan_waktu)}</span>
                        </div>
                      </div>

                      <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#DCE0E6] flex flex-col justify-between">
                        <div className="flex items-center gap-2 text-[#184C78] mb-2">
                          <Sparkles className="w-4 h-4 shrink-0" />
                          <span className="font-bold text-xs truncate">Kemanfaatan bagi Warga</span>
                        </div>
                        <div>
                          <div className="text-xl font-black text-[#184C78]">{userExistingRating.aspek_manfaat} <span className="text-xs font-semibold text-slate-400">/ 5</span></div>
                          <span className="text-[10px] font-semibold text-slate-500 mt-1 block">{getParamValueDescriptor(userExistingRating.aspek_manfaat)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bagian Bawah: Isi Ulasan */}
                <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                  <span className="text-[11px] font-bold text-[#184C78] uppercase tracking-wider block">
                    Isi Ulasan &amp; Testimoni Anda
                  </span>
                  <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#DCE0E6] text-xs sm:text-sm text-slate-800 leading-relaxed">
                    {userExistingRating.komentar || 'Belum ada komentar tertulis.'}
                  </div>
                </div>
              </div>
            ) : (
              /* Form Mode: Baru atau Mode Edit */
              <form onSubmit={handleSubmitRating} className="space-y-5 text-xs">
                {isEditingRating && (
                  <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-amber-700 shrink-0" />
                      <span className="font-semibold text-xs">
                        Mode Edit Ulasan: Ubah penilaian bintang atau testimoni Anda di bawah.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingRating(false)}
                      className="text-xs text-amber-800 font-bold hover:underline cursor-pointer"
                    >
                      Batal Edit
                    </button>
                  </div>
                )}

                {/* BAGIAN ATAS: BAGIAN PENILAIAN */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#184C78]" />
                      <span className="font-bold text-[#184C78] text-xs uppercase tracking-wider">
                        Bagian Penilaian (Skor Bintang &amp; Parameter Detail)
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#184C78] bg-[#EBF4FB] px-2.5 py-0.5 rounded-full border border-[#BFDBFE]">
                      Rapi &amp; Realtime
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Skor Bintang Keseluruhan (Real-time Synced) */}
                    <div className="lg:col-span-4 bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] p-4 sm:p-5 rounded-xl border border-[#DCE0E6] shadow-xs flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <label className="block font-bold text-xs text-[#184C78]">
                            Skor Bintang Keseluruhan
                          </label>
                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border shadow-2xs ${
                              getScoreDescriptor(calculatedAvgRating).badgeClass
                            }`}
                          >
                            {getScoreDescriptor(calculatedAvgRating).label}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">
                          Otomatis tersinkronisasi realtime dengan 3 parameter
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => handleOverallStarClick(star)}
                              title={`Beri rating ${star} bintang (menyelaraskan semua parameter)`}
                              className="p-0.5 text-2xl text-amber-400 hover:scale-125 active:scale-95 transition-all cursor-pointer focus:outline-hidden"
                            >
                              {star <= ratingForm.bintang ? '★' : '☆'}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-baseline gap-1 bg-white px-3 py-1 rounded-lg border border-[#DCE0E6] shadow-2xs">
                          <span className="text-xl font-black text-[#184C78] tabular-nums">
                            {calculatedAvgRating.toFixed(1)}
                          </span>
                          <span className="text-[11px] font-semibold text-gray-400">/ 5.0</span>
                        </div>
                      </div>
                    </div>

                    {/* Penilaian Parameter Detail (1 - 5) */}
                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          key: 'aspek_kualitas' as const,
                          label: 'Mutu & Kerapian Fisik',
                          desc: 'Kekokohan material, finishing halus & kerapian',
                          icon: ShieldCheck,
                          val: ratingForm.aspek_kualitas,
                        },
                        {
                          key: 'aspek_ketepatan_waktu' as const,
                          label: 'Ketepatan Waktu Pelaksanaan',
                          desc: 'Kesesuaian durasi pengerjaan dengan jadwal rencana',
                          icon: Clock,
                          val: ratingForm.aspek_ketepatan_waktu,
                        },
                        {
                          key: 'aspek_manfaat' as const,
                          label: 'Kemanfaatan bagi Warga',
                          desc: 'Dampak nyata fasilitas bagi mobilitas & kenyamanan publik',
                          icon: Sparkles,
                          val: ratingForm.aspek_manfaat,
                        },
                      ].map((param) => {
                        const ParamIcon = param.icon;
                        const fillPercent = ((param.val - 1) / 4) * 100;
                        return (
                          <div
                            key={param.key}
                            className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-2 hover:border-[#BFDBFE] transition-colors flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <div className="w-5 h-5 rounded-md bg-[#EBF4FB] text-[#184C78] flex items-center justify-center shrink-0">
                                    <ParamIcon className="w-3 h-3" />
                                  </div>
                                  <span className="font-bold text-xs text-[#184C78] truncate">
                                    {param.label}
                                  </span>
                                </div>
                                <span className="px-1.5 py-0.5 text-[11px] font-black rounded-md bg-[#184C78] text-white tabular-nums shrink-0">
                                  {param.val} / 5
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-400 line-clamp-1 mb-2">
                                {param.desc}
                              </p>

                              {/* Interactive Custom Range Bar */}
                              <div className="pt-0.5">
                                <input
                                  type="range"
                                  min="1"
                                  max="5"
                                  step="1"
                                  aria-label={param.label}
                                  value={param.val}
                                  onChange={(e) => handleParameterChange(param.key, Number(e.target.value))}
                                  style={{
                                    background: `linear-gradient(to right, #184C78 0%, #2980B9 ${fillPercent}%, #E2E8F0 ${fillPercent}%, #E2E8F0 100%)`,
                                  }}
                                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#184C78] focus:outline-hidden"
                                />
                              </div>
                            </div>

                            {/* Quick 1-5 Step Buttons */}
                            <div className="flex justify-between items-center px-0.5 text-[10px] pt-1">
                              {[1, 2, 3, 4, 5].map((step) => {
                                const isActive = param.val === step;
                                return (
                                  <button
                                    type="button"
                                    key={step}
                                    onClick={() => handleParameterChange(param.key, step)}
                                    className={`w-6 h-5.5 flex items-center justify-center rounded font-bold text-xs transition-all cursor-pointer ${
                                      isActive
                                        ? 'bg-[#184C78] text-white shadow-2xs scale-105 ring-2 ring-[#184C78]/25'
                                        : 'bg-[#F8FAFC] text-gray-500 border border-gray-200 hover:border-[#184C78] hover:text-[#184C78]'
                                    }`}
                                    title={`Pilih nilai ${step} untuk ${param.label}`}
                                  >
                                    {step}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* BAGIAN BAWAH: ISI ULASAN */}
                <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                  <label className="block font-semibold text-[#184C78]">
                    Ulasan &amp; Testimoni Warga
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Bagikan pengalaman atau dampak positif infrastruktur yang selesai dibangun bagi kenyamanan warga..."
                    value={ratingForm.komentar}
                    onChange={(e) => setRatingForm({ ...ratingForm, komentar: e.target.value })}
                    className="w-full p-3 border border-[#DCE0E6] rounded-xl outline-none focus:border-[#2980B9] bg-white text-xs leading-relaxed"
                  />
                </div>

                {/* Tombol Aksi */}
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#184C78] hover:bg-[#0f3252] text-white font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
                  >
                    {isEditingRating ? 'Simpan Pembaruan Ulasan' : 'Kirim Penilaian Kepuasan'}
                  </button>
                  {isEditingRating && (
                    <button
                      type="button"
                      onClick={() => setIsEditingRating(false)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* List of Public Ratings (Full Width) */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-base text-[#184C78]">
                Daftar Ulasan &amp; Indeks Kepuasan Terkini
              </h2>
              <span className="text-xs text-[#6C757D] font-medium bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                {ratingList.length} Ulasan Masuk
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ratingList.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-[#DCE0E6] shadow-xs space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#EBF4FB] text-[#184C78] font-bold text-xs flex items-center justify-center shrink-0">
                          {(item.nama_warga || 'W').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-[#212529] truncate">{item.nama_warga || 'Warga Masyarakat'}</div>
                          <div className="text-[10px] text-[#6C757D] truncate">{item.nama_proyek || 'Proyek Selesai'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-xs shrink-0">
                        <span>{'★'.repeat(item.bintang)}</span>
                        <span className="text-[#6C757D] font-normal text-[11px] ml-1">({item.tanggal})</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#495057] leading-relaxed bg-[#F5F7FA] p-3 rounded-xl border border-[#DCE0E6]/50 mt-3">
                      "{item.komentar}"
                    </p>
                  </div>

                  <div className="flex gap-4 text-[11px] text-[#6C757D] pt-2 border-t border-slate-100 mt-2">
                    <span>Mutu: <strong className="text-[#184C78]">{item.aspek_kualitas}/5</strong></span>
                    <span>Waktu: <strong className="text-[#184C78]">{item.aspek_ketepatan_waktu}/5</strong></span>
                    <span>Manfaat: <strong className="text-[#184C78]">{item.aspek_manfaat}/5</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT 4: EVALUASI CACAT PASCA PROYEK ── */}
      {activeTab === 'evaluasi' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#DCE0E6]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-heading text-[#184C78]">
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
                    <span>Analisis Cerdas AI (Civic Groq AI Engine):</span>
                  </div>
                  <p className="text-[#495057] text-[11px] leading-relaxed">
                    {item.analisis_ai.split('\n\n[RAW_AI_DEBUG]:')[0]}
                  </p>
                </div>

                {/* Tindak Lanjut Dinas */}
                {item.catatan_dinas && item.status_verifikasi !== 'menunggu_verifikasi' && (
                  <div className="p-3 bg-[#E6F7F1] rounded-xl border border-[#B7EBD8] text-xs space-y-1">
                    <div className="font-bold text-[#1A9E6E] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Respon Tim Pemeliharaan Dinas{item.tanggal_tindakan ? ` (${item.tanggal_tindakan})` : ''}:</span>
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

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {isLoadingLogs ? (
                        <p className="text-[11px] text-slate-400 italic">Memuat jejak audit status...</p>
                      ) : (evalStatusLogsMap[item.id] && evalStatusLogsMap[item.id].length > 0) ? (
                        <div className="relative pl-6 border-l-2 border-[#2980B9] ml-2 space-y-4 pt-1">
                          {evalStatusLogsMap[item.id].map((log, lIdx) => (
                            <div key={lIdx} className="relative">
                              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#184C78] border-2 border-white ring-2 ring-[#2980B9]/30 flex items-center justify-center">
                                <span className="w-1.5 h-1.5 bg-white rounded-full" />
                              </div>
                              <div>
                                <div className="flex items-center justify-between">
                                  <strong className="text-[#184C78] font-bold text-xs">{log.status_baru}</strong>
                                  <span className="text-[10px] text-[#6C757D] font-mono">
                                    {log.created_at
                                      ? new Date(log.created_at).toLocaleDateString('id-ID', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })
                                      : log.waktu || ''}
                                  </span>
                                </div>
                                <div className="text-[11px] text-[#2980B9] font-medium">
                                  Oleh: {log.nama_pengubah || log.diubah_oleh || 'Sistem'} ({log.role_pengubah || 'Sistem'})
                                </div>
                                <p className="text-[11px] text-slate-600 mt-0.5 bg-white p-2 rounded-lg border border-slate-200">
                                  {log.catatan || '-'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">Belum ada riwayat perubahan status</p>
                      )}
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
        <div className="bg-white rounded-2xl border border-[#DCE0E6] p-4 sm:p-6 shadow-xs space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#E67E22] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-base sm:text-lg font-bold font-heading text-[#184C78]">
                  Sistem Rekomendasi Rute Pengalihan AI
                </h2>
              </div>
              <p className="text-xs text-[#6C757D] mt-1">
                Konsultasikan perjalanan Anda untuk mendapatkan masukan teknis dan 3 rute pengalihan terverifikasi OpenStreetMap di Kabupaten Lamongan.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>OSM Lamongan Grounded</span>
              </span>
            </div>
          </div>

          {/* Interactive Route Consultation Input Form */}
          <form onSubmit={(e) => handleConsultRoute(e)} className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-4 sm:p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#184C78] mb-1.5 flex items-center justify-between">
                <span>Tuliskan Titik Awal, Tujuan, atau Pertanyaan Rute Anda:</span>
                <span className="text-[11px] font-normal text-slate-500">Mendukung bahasa bebas</span>
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  value={routeQueryText}
                  onChange={(e) => {
                    setRouteQueryText(e.target.value);
                    if (routeFormError) setRouteFormError(null);
                  }}
                  placeholder="Contoh: Saya mau berangkat dari Alun-Alun Lamongan menuju Babat mengendarai mobil, jalur mana yang aman dari perbaikan jalan poros Deket/Pucuk?"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-[#DCE0E6] rounded-xl focus:border-[#2980B9] focus:ring-2 focus:ring-[#2980B9]/20 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Supporting Filters: Target Project & Vehicle Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Hindari Proyek Konstruksi Tertentu:
                </label>
                <select
                  value={selectedRouteProject}
                  onChange={(e) => setSelectedRouteProject(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#DCE0E6] rounded-lg focus:border-[#2980B9] outline-none text-slate-700 cursor-pointer"
                >
                  <option value="all">🔍 Deteksi Otomatis dari Input Teks</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id.toString().padStart(4, '0')} {p.nama_proyek} ({p.nama_wilayah || 'Lamongan'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Moda Kendaraan Perjalanan:
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-200/60 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setRouteVehicleType('semua')}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      routeVehicleType === 'semua' ? 'bg-white text-[#184C78] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setRouteVehicleType('mobil')}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      routeVehicleType === 'mobil' ? 'bg-white text-[#184C78] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Car className="w-3 h-3" />
                    <span>Mobil</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRouteVehicleType('motor')}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      routeVehicleType === 'motor' ? 'bg-white text-[#184C78] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Bike className="w-3 h-3" />
                    <span>Motor</span>
                  </button>
                </div>
              </div>
            </div>

            {routeFormError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{routeFormError}</span>
              </div>
            )}

            {/* Submit & Quick Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-slate-200/70">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-500 font-medium">Contoh Cepat:</span>
                <button
                  type="button"
                  onClick={() => handleConsultRoute(undefined, 'Dari Alun-Alun Lamongan ke Kecamatan Deket membawa mobil pribadi')}
                  className="text-[11px] bg-white hover:bg-slate-100 text-[#184C78] border border-slate-300 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                >
                  Alun-Alun ➔ Deket
                </button>
                <button
                  type="button"
                  onClick={() => handleConsultRoute(undefined, 'Jalur cepat Babat ke Lamongan Kota tanpa macet proyek Pucuk')}
                  className="text-[11px] bg-white hover:bg-slate-100 text-[#184C78] border border-slate-300 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                >
                  Babat ➔ Pucuk
                </button>
                <button
                  type="button"
                  onClick={() => handleConsultRoute(undefined, 'Rute pintas sepeda motor menghindari penyempitan jalan poros')}
                  className="text-[11px] bg-white hover:bg-slate-100 text-[#184C78] border border-slate-300 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                >
                  Jalur Roda 2
                </button>
              </div>

              <div className="flex items-center gap-2">
                {routeAnalysisResult && (
                  <button
                    type="button"
                    onClick={handleResetRouteConsultation}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isAnalyzingRoute}
                  className="px-4 py-2 bg-[#184C78] hover:bg-[#0f3252] text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isAnalyzingRoute ? 'Menganalisis Rute...' : 'Dapatkan Rekomendasi Rute AI'}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Loading Indicator */}
          {isAnalyzingRoute && (
            <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-fade-in">
              <div className="w-10 h-10 border-3 border-[#184C78] border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-xs font-bold text-[#184C78]">
                Sedang Memetakan Kondisi Lapangan &amp; Jaringan Jalan Lamongan...
              </div>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                AI sedang mencocokkan titik awal, tujuan, dan perlintasan proyek konstruksi menggunakan koridor jalan OpenStreetMap terverifikasi.
              </p>
            </div>
          )}

          {/* EMPTY STATE: Saat belum ada analisis (ini harusnya kosong) */}
          {!routeAnalysisResult && !isAnalyzingRoute && (
            <div className="p-8 sm:p-12 text-center bg-slate-50/70 border border-dashed border-slate-300 rounded-2xl space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-400 mx-auto">
                <Compass className="w-7 h-7 text-[#184C78]" />
              </div>
              <h3 className="font-heading text-sm sm:text-base font-bold text-slate-800">
                Belum Ada Rekomendasi Rute yang Diproses
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Tuliskan pertanyaan atau rencana perjalanan Anda pada formulir di atas, lalu tekan tombol <strong>"Dapatkan Rekomendasi Rute AI"</strong> untuk menampilkan masukan teknis dan 3 rute pengalihan nyata di Kabupaten Lamongan.
              </p>
            </div>
          )}

          {/* RESULT STATE: Masukan dan Rekomendasi yang Benar */}
          {routeAnalysisResult && !isAnalyzingRoute && (
            <div className="space-y-5 animate-fade-in">
              {/* Masukan & Analisis Cerdas AI */}
              <div className="bg-[#FEF3E7] border border-[#FBD8B3] rounded-2xl p-4 sm:p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-[#FBD8B3]/60 pb-2.5 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#E67E22]" />
                    <span className="font-heading font-bold text-[#9A4C08] uppercase tracking-wider text-xs">
                      Masukan &amp; Analisis Lapangan AI
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#184C78] bg-white px-2.5 py-0.5 rounded-full border border-[#CBD5E1]">
                    Proyek: {routeAnalysisResult.targetProject.nama_proyek}
                  </span>
                </div>

                <div className="space-y-2 text-[#495057] leading-relaxed">
                  <p>
                    <strong className="text-slate-900">Ringkasan Analisis:</strong> {routeAnalysisResult.feedback.summary}
                  </p>
                  <p>
                    <strong className="text-slate-900">Dampak Pekerjaan Fisik:</strong> {routeAnalysisResult.feedback.impactAnalysis}
                  </p>
                  <p>
                    <strong className="text-slate-900">Saran Pengalihan:</strong> {routeAnalysisResult.feedback.recommendationTips}
                  </p>
                  <p className="text-[11px] text-slate-500 pt-1 border-t border-[#FBD8B3]/50">
                    *Himbauan Keselamatan: {routeAnalysisResult.feedback.safetyAdvice}
                  </p>
                </div>
              </div>

              {/* 3 Rekomendasi Rute yang Benar di Lamongan */}
              <div>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <h3 className="font-heading text-xs font-bold text-[#184C78] uppercase tracking-wider">
                    3 Rekomendasi Jalur Pengalihan Resmi (Terverifikasi Lamongan):
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">Berdasarkan data spasial PU Bina Marga</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {routeAnalysisResult.routes.map((rute) => (
                    <div
                      key={rute.id}
                      className={`p-4 rounded-xl ${rute.cardBgColor} border ${rute.borderColor} flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-xs transition-shadow`}
                    >
                      <div className="space-y-2">
                        <div className={`text-[11px] font-bold uppercase tracking-wider ${rute.accentTextColor} flex items-center justify-between`}>
                          <span>{rute.priorityLabel}</span>
                          <span className={`${rute.badgeBgColor} text-white px-2 py-0.5 rounded text-[10px]`}>
                            {rute.vehicleBadge}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-[#212529] leading-snug">
                          {rute.title}
                        </h4>
                        <p className="text-xs text-[#495057] leading-relaxed">
                          {rute.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[11px]">
                        <span className={`font-semibold ${rute.accentTextColor}`}>{rute.timeEst}</span>
                        <span className="text-slate-500 font-mono text-[10px]">{rute.distanceEst}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons to View Interactive Simulation */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-600">
                  <strong className="text-slate-900 block font-bold">Ingin Melihat Simulasi Jalur &amp; Rambu Lengkap di Peta?</strong>
                  Buka peta interaktif untuk melihat simulasi laju kendaraan, titik penutupan jalan, dan alternatif rute di peta wilayah.
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    onClick={() => onOpenAIRoute(routeAnalysisResult.targetProject.nama_proyek, routeAnalysisResult.targetProject)}
                    className="btn-primary !h-9 text-xs flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer shadow-xs"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Buka Simulasi Peta Interaktif Lengkap</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
};


