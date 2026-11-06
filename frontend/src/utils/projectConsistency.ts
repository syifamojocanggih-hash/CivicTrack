import type { ProyekItem, LinimasaTahap, ProyekStatus } from '../types';

export interface ProjectMilestone {
  title: string;
  date: string;
  status: 'completed' | 'current' | 'upcoming';
  note: string;
}

/**
 * Menghasilkan tahapan milestone pelaksanaan (3 milestone strategis)
 * yang 100% konsisten dengan progres fisik dan status proyek.
 *
 * Menjamin:
 * 1. Jika proyek SELESAI (100%): Seluruh tahapan berstatus 'completed' (centang hijau),
 *    tidak ada yang berstatus 'current' atau kembali ke tahap sebelumnya.
 * 2. Jika proyek berjalan: status mencerminkan persentase real time secara kronologis.
 */
export function generateProjectMilestones(p: ProyekItem): ProjectMilestone[] {
  const isDone = p.progres_persen >= 100 || p.status === 'selesai';
  const pct = p.progres_persen ?? 0;

  if (isDone) {
    return [
      {
        title: 'Persiapan Lahan & Perizinan Amdal',
        date: p.tanggal_mulai ? `Mulai ${p.tanggal_mulai}` : 'Jan 2024',
        status: 'completed',
        note: 'Pembersihan area, perataan tanah, dan instalasi utilitas dasar selesai 100%.',
      },
      {
        title: 'Tahap 2: Konstruksi Fisik & Struktur Utama',
        date: 'Selesai 100%',
        status: 'completed',
        note: 'Pengerjaan struktur fisik, perkerasan dan spesifikasi teknis selesai 100%.',
      },
      {
        title: 'Finishing & Serah Terima Hasil (PHO / FHO)',
        date: p.estimasi_selesai || 'Tuntas & Beroperasi',
        status: 'completed',
        note: 'Uji fungsi kelayakan tuntas, serah terima FHO selesai, dan infrastruktur beroperasi penuh.',
      },
    ];
  }

  if (pct >= 85) {
    return [
      {
        title: 'Persiapan Lahan & Perizinan Amdal',
        date: p.tanggal_mulai || 'Selesai',
        status: 'completed',
        note: 'Perizinan dan pembersihan lahan telah tuntas 100%.',
      },
      {
        title: 'Tahap 2: Konstruksi Fisik & Struktur Utama',
        date: 'Selesai 100%',
        status: 'completed',
        note: 'Konstruksi fisik inti telah rampung dikerjakan dan diverifikasi.',
      },
      {
        title: 'Finishing & Serah Terima Hasil (PHO / FHO)',
        date: 'Aktif (Saat Ini)',
        status: 'current',
        note: p.tahap_terkini || 'Tahap akhir finishing, uji fungsi keselamatan jalan & persiapan serah terima.',
      },
    ];
  }

  if (pct >= 25) {
    return [
      {
        title: 'Persiapan Lahan & Perizinan Amdal',
        date: p.tanggal_mulai || 'Selesai',
        status: 'completed',
        note: 'Pembongkaran, perataan tanah dan relokasi utilitas selesai 100%.',
      },
      {
        title: 'Tahap 2: Konstruksi Fisik & Struktur Utama',
        date: 'Aktif (Saat Ini)',
        status: 'current',
        note: p.tahap_terkini || 'Pengecoran aspal/beton, penguatan pondasi & pengerjaan struktur fisik.',
      },
      {
        title: 'Finishing & Serah Terima Hasil (PHO / FHO)',
        date: p.estimasi_selesai || 'Target Akhir',
        status: 'upcoming',
        note: 'Uji kelayakan keselamatan, marka jalan & peresmian akses publik.',
      },
    ];
  }

  if (pct > 0) {
    return [
      {
        title: 'Persiapan Lahan & Perizinan Amdal',
        date: 'Aktif (Saat Ini)',
        status: 'current',
        note: p.tahap_terkini || 'Pengukuran topografi, perataan tanah dan persiapan izin teknis.',
      },
      {
        title: 'Tahap 2: Konstruksi Fisik & Struktur Utama',
        date: 'Akan Datang',
        status: 'upcoming',
        note: 'Pelaksanaan konstruksi struktur fisik utama di lapangan.',
      },
      {
        title: 'Finishing & Serah Terima Hasil (PHO / FHO)',
        date: p.estimasi_selesai || 'Target Akhir',
        status: 'upcoming',
        note: 'Penyelesaian akhir, uji kelaikan fungsi dan serah terima pekerjaan.',
      },
    ];
  }

  // pct === 0
  return [
    {
      title: 'Persiapan Lahan & Perizinan Amdal',
      date: p.tanggal_mulai || 'Jadwal Mulai',
      status: 'upcoming',
      note: 'Tahap persiapan awal pengerjaan proyek.',
    },
    {
      title: 'Tahap 2: Konstruksi Fisik & Struktur Utama',
      date: 'Akan Datang',
      status: 'upcoming',
      note: 'Konstruksi fisik lapangan sesuai rencana kerja.',
    },
    {
      title: 'Finishing & Serah Terima Hasil (PHO / FHO)',
      date: p.estimasi_selesai || 'Target Akhir',
      status: 'upcoming',
      note: 'Pemeriksaan akhir dan serah terima hasil proyek.',
    },
  ];
}

const CATEGORY_STAGE_TEMPLATES: Record<string, Array<{ nama: string; bobot: number; desc: string }>> = {
  jalan: [
    { nama: 'Pengukuran Ulang & Pembersihan Lahan (Clearing)', bobot: 15, desc: 'Pengukuran topografi dan relokasi utilitas kabel serta tiang penerangan jalan.' },
    { nama: 'Galian & Pemadatan Lapis Pondasi Bawah (Subbase)', bobot: 25, desc: 'Pengerukan tanah lunak, perkuatan geotekstil, dan penghamparan agregat sirtu.' },
    { nama: 'Pemasangan Drainase Samping & Trotoar Kerb', bobot: 20, desc: 'Pemasangan box culvert u-ditch dan saluran pembuangan sekunder.' },
    { nama: 'Pengaspalan Hotmix AC-BC dan AC-WC', bobot: 30, desc: 'Penghamparan lapis aspal perata dan lapis aus pengikat setebal 10 cm.' },
    { nama: 'Marka Jalan, Rambu, & Penerangan PJU LED (FHO)', bobot: 10, desc: 'Pengecatan marka thermoplastic reflektif, rambu arah, dan tiang PJU pintar.' },
  ],
  taman: [
    { nama: 'Pembersihan Lahan & Penataan Kontur Tanah', bobot: 15, desc: 'Pembersihan puing lama, perataan kontur lahan, dan penyiapan sistem resapan.' },
    { nama: 'Pemasangan Paving Block, Jalur Pedestrian & Drainase', bobot: 25, desc: 'Pemasangan paving ramah disabilitas, saluran drainase taman, dan batas plaza.' },
    { nama: 'Pembangunan Wahana Bermain & Mini Amphitheater', bobot: 20, desc: 'Konstruksi area bermain ramah anak bersertifikasi SNI dan panggung terbuka.' },
    { nama: 'Penanaman Vegetasi Floral, Tabebuya & Rumput Sintetis', bobot: 30, desc: 'Penghijauan lanskap floral, penanaman 45 pohon tabebuya peneduh dan rumput.' },
    { nama: 'Penerangan Taman Cerdas, Bangku & Serah Terima (FHO)', bobot: 10, desc: 'Instalasi lampu taman solar cell, fasilitas sanitasi, dan peresmian untuk warga.' },
  ],
  drainase: [
    { nama: 'Pengukuran Elevasi & Pematangan Lahan Saluran', bobot: 15, desc: 'Pengukuran kemiringan hidrolik dan pembersihan sedimen endapan awal.' },
    { nama: 'Pemasangan Dinding Penahan Tanah & Box Culvert', bobot: 25, desc: 'Pemasangan u-ditch beton bertulang dan perkuatan tebing saluran primer.' },
    { nama: 'Pemasangan Pintu Air Otomatis & Pompa Banjir', bobot: 20, desc: 'Instalasi 6 pintu klep otomatis dan rumah pompa penangkal luapan sungai.' },
    { nama: 'Pengecoran Pelat Penutup & Normalisasi Arus Air', bobot: 30, desc: 'Pengecoran manhole kontrol, pelat jembatan akses warga, dan pembersihan saluran.' },
    { nama: 'Uji Debit Aliran, Perkuatan Bronjong & Serah Terima (FHO)', bobot: 10, desc: 'Uji kelancaran debit air saat hujan lebat dan serah terima hasil pengerjaan.' },
  ],
  fasilitas: [
    { nama: 'Penyelidikan Tanah, Bouwplank & Pondasi Bore Pile', bobot: 15, desc: 'Uji sondir tanah, pengukuran bouwplank, dan pengecoran tiang pancang pondasi.' },
    { nama: 'Konstruksi Struktur Kolom, Balok & Pelat Lantai', bobot: 25, desc: 'Pemasangan bekisting, pembesian ulir SNI, dan pengecoran struktur gedung utama.' },
    { nama: 'Pemasangan Dinding, Atap Baja Ringan & Utilitas ME', bobot: 20, desc: 'Pemasangan bata ringan, rangka atap baja tahan karat, pipa sanitasi, dan kabel.' },
    { nama: 'Pekerjaan Arsitektural, Lantai Granit & Pengecatan', bobot: 30, desc: 'Pemasangan keramik granit, kusen aluminium, partisi ruangan, dan cat eksterior.' },
    { nama: 'Uji Laik Fungsi, Sertifikasi Keselamatan & Serah Terima (FHO)', bobot: 10, desc: 'Uji sistem proteksi kebakaran, kelistrikan gedung, dan serah terima kunci dinas.' },
  ],
};

/**
 * Mengambil atau menghasilkan runtutan 5 tahapan linimasa proyek
 * yang terjamin saling berkesinambungan dengan persentase progres dan status proyek.
 */
export function getProjectTimelineStages(p: ProyekItem): LinimasaTahap[] {
  // Cek jika ada custom stages tersimpan di localStorage
  try {
    const saved = localStorage.getItem(`civictrack_project_stages_${p.id}`);
    if (saved) {
      const parsed: LinimasaTahap[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Jika proyek sudah 100% atau selesai, pastikan semua stage konsisten berstatus 'selesai'
        if (p.progres_persen >= 100 || p.status === 'selesai') {
          return parsed.map((st) => ({
            ...st,
            status: 'selesai',
            realisasi_selesai: st.realisasi_selesai || p.estimasi_selesai || '2024-05-10',
            catatan_lapangan:
              st.catatan_lapangan || 'Tahap selesai 100% dan telah terverifikasi oleh pengawas dinas.',
          }));
        }
        return parsed;
      }
    }
  } catch {}

  const cat = (p.kategori || 'jalan').toLowerCase();
  const template = CATEGORY_STAGE_TEMPLATES[cat] || CATEGORY_STAGE_TEMPLATES.jalan;
  const isDone = p.progres_persen >= 100 || p.status === 'selesai';
  const pct = p.progres_persen ?? 0;

  let cumWeight = 0;

  return template.map((item, idx) => {
    cumWeight += item.bobot;
    const stageNumber = idx + 1;
    let stageStatus: 'belum_mulai' | 'sedang_berjalan' | 'selesai' = 'belum_mulai';
    let realSelesai: string | undefined = undefined;
    let catatan: string | undefined = undefined;

    if (isDone) {
      stageStatus = 'selesai';
      realSelesai = p.estimasi_selesai || '2024-05-10';
      catatan =
        idx === template.length - 1
          ? 'Seluruh pekerjaan tuntas 100%, serah terima FHO selesai, dan infrastruktur beroperasi penuh.'
          : `Tahap ${stageNumber} rampung sempurna dan telah diverifikasi oleh pengawas dinas.`;
    } else {
      if (pct >= cumWeight) {
        stageStatus = 'selesai';
        realSelesai = 'Selesai';
        catatan = `Pekerjaan tahap ${stageNumber} telah diselesaikan sesuai target teknis.`;
      } else if (pct > cumWeight - item.bobot) {
        stageStatus = 'sedang_berjalan';
        catatan =
          p.tahap_terkini ||
          `Pekerjaan konstruksi tahap ${stageNumber} sedang berlangsung aktif di lapangan.`;
      } else {
        stageStatus = 'belum_mulai';
        catatan = undefined;
      }
    }

    return {
      id: p.id * 100 + stageNumber,
      proyek_id: p.id,
      nomor_tahap: stageNumber,
      nama_tahap: item.nama,
      deskripsi: item.desc,
      target_mulai: p.tanggal_mulai || '2024-01-15',
      target_selesai: p.estimasi_selesai || '2024-10-31',
      realisasi_mulai: stageStatus !== 'belum_mulai' ? p.tanggal_mulai : undefined,
      realisasi_selesai: realSelesai,
      persentase_bobot: item.bobot,
      status: stageStatus,
      catatan_lapangan: catatan,
    };
  });
}

/**
 * Menyimpan tahapan linimasa proyek ke penyimpanan lokal
 */
export function saveProjectTimelineStages(projectId: number, stages: LinimasaTahap[]): void {
  try {
    localStorage.setItem(`civictrack_project_stages_${projectId}`, JSON.stringify(stages));
  } catch {}
}

/**
 * Menyiarkan pembaruan proyek ke seluruh komponen aplikasi secara live tanpa perlu reload / refresh halaman.
 */
export function broadcastProjectUpdate(updatedProject: ProyekItem): void {
  // Pastikan status strictly bernilai 'berjalan' | 'selesai' | 'ditangguhkan'
  let cleanStatus: ProyekStatus = 'berjalan';
  if (updatedProject.progres_persen >= 100 || updatedProject.status === 'selesai') {
    cleanStatus = 'selesai';
  } else if (
    updatedProject.status === 'ditangguhkan' ||
    (updatedProject.status as any) === 'tertunda' ||
    (updatedProject.status as any) === 'dalam_peninjauan_ulang'
  ) {
    cleanStatus = 'ditangguhkan';
  } else {
    cleanStatus = 'berjalan';
  }

  const normalized: ProyekItem = {
    ...updatedProject,
    status: cleanStatus,
    progres_persen:
      cleanStatus === 'selesai' && updatedProject.progres_persen < 100
        ? 100
        : updatedProject.progres_persen,
  };

  // Simpan ke daftar proyek global di localStorage
  try {
    const raw = localStorage.getItem('civictrack_all_projects');
    let list: ProyekItem[] = raw ? JSON.parse(raw) : [];
    const exists = list.some((p) => p.id === normalized.id);
    if (exists) {
      list = list.map((p) => (p.id === normalized.id ? normalized : p));
    } else {
      list = [normalized, ...list];
    }
    localStorage.setItem('civictrack_all_projects', JSON.stringify(list));
  } catch {}

  // Update tahapan linimasa agar selalu berkesinambungan
  const stages = getProjectTimelineStages(normalized);
  saveProjectTimelineStages(normalized.id, stages);

  // Broadcast event real-time ke semua komponen & tab browser
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('civictrack_project_updated', {
        detail: normalized,
      })
    );
  }
}

/**
 * Menyiarkan penghapusan proyek ke seluruh komponen aplikasi secara live tanpa refresh halaman.
 */
export function broadcastProjectDeletion(projectId: number): void {
  try {
    const raw = localStorage.getItem('civictrack_all_projects');
    if (raw) {
      const list: ProyekItem[] = JSON.parse(raw);
      const filtered = list.filter((p) => p.id !== projectId);
      localStorage.setItem('civictrack_all_projects', JSON.stringify(filtered));
    }
    localStorage.removeItem(`civictrack_project_stages_${projectId}`);
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('civictrack_project_deleted', {
        detail: { projectId },
      })
    );
  }
}

