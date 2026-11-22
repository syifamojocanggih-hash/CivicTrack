import { describe, it, expect } from 'vitest';
import {
  generateProjectMilestones,
  getProjectTimelineStages,
  broadcastProjectUpdate,
} from './projectConsistency';
import type { ProyekItem } from '../types';

describe('projectConsistency utils', () => {
  const completedProject: ProyekItem = {
    id: 16,
    nama_proyek: 'Rekonstruksi Akses Wisata Bahari Lamongan & Sunan Drajat',
    kategori: 'jalan',
    deskripsi: 'Jalan pantura 4 lajur',
    latitude: -6.885,
    longitude: 112.375,
    wilayah_id: 16,
    dinas_id: 1,
    anggaran: 16800000000,
    status: 'selesai',
    progres_persen: 100,
    tanggal_mulai: '2023-09-01',
    estimasi_selesai: 'Mei 2024',
    nama_wilayah: 'Kec. Paciran',
  };

  const inProgressProject: ProyekItem = {
    id: 9,
    nama_proyek: 'Pembangunan Jembatan Penghubung Laren - Maduran',
    kategori: 'jalan',
    deskripsi: 'Jembatan sungai',
    latitude: -6.985,
    longitude: 112.275,
    wilayah_id: 9,
    dinas_id: 1,
    anggaran: 9800000000,
    status: 'berjalan',
    progres_persen: 35,
    tanggal_mulai: '2024-03-15',
    estimasi_selesai: '2025-12-31',
    nama_wilayah: 'Kecamatan Laren',
  };

  it('generateProjectMilestones marks ALL milestones as completed when project is 100% or selesai', () => {
    const milestones = generateProjectMilestones(completedProject);
    expect(milestones).toHaveLength(3);
    milestones.forEach((m) => {
      expect(m.status).toBe('completed');
    });
    // Ensure no stage is rollback to 'current' or 'upcoming'
    expect(milestones.some((m) => m.status === 'current')).toBe(false);
    expect(milestones.some((m) => m.status === 'upcoming')).toBe(false);
  });

  it('generateProjectMilestones reflects active stage for in-progress project without premature completion', () => {
    const milestones = generateProjectMilestones(inProgressProject);
    expect(milestones).toHaveLength(3);
    expect(milestones[0].status).toBe('completed');
    expect(milestones[1].status).toBe('current');
    expect(milestones[2].status).toBe('upcoming');
  });

  it('getProjectTimelineStages marks ALL 5 stages as selesai for 100% completed project', () => {
    const stages = getProjectTimelineStages(completedProject);
    expect(stages).toHaveLength(5);
    stages.forEach((st) => {
      expect(st.status).toBe('selesai');
      expect(st.realisasi_selesai).toBeDefined();
    });
  });

  it('getProjectTimelineStages assigns stages chronologically based on progress weight for in-progress project', () => {
    const stages = getProjectTimelineStages(inProgressProject);
    expect(stages).toHaveLength(5);
    // Cumulative weight: Stage 1 (15%), Stage 2 (15+25 = 40%). With 35% progress:
    expect(stages[0].status).toBe('selesai');
    expect(stages[1].status).toBe('sedang_berjalan');
    expect(stages[2].status).toBe('belum_mulai');
    expect(stages[3].status).toBe('belum_mulai');
    expect(stages[4].status).toBe('belum_mulai');
  });

  it('broadcastProjectUpdate normalizes status and fires custom event', () => {
    let capturedEventDetail: any = null;
    const handler = (e: any) => {
      capturedEventDetail = e.detail;
    };
    window.addEventListener('civictrack_project_updated', handler);

    broadcastProjectUpdate({
      ...completedProject,
      status: 'berjalan',
      progres_persen: 100,
    });

    expect(capturedEventDetail).not.toBeNull();
    expect(capturedEventDetail.status).toBe('selesai');
    expect(capturedEventDetail.progres_persen).toBe(100);

    window.removeEventListener('civictrack_project_updated', handler);
  });

  it('getProjectTimelineStages returns empty array for newly added project (id >= 36)', () => {
    const newProject: ProyekItem = {
      id: 38,
      nama_proyek: 'Proyek Baru Lamongan',
      kategori: 'jalan',
      deskripsi: 'Deskripsi proyek baru',
      latitude: -7.12,
      longitude: 112.41,
      wilayah_id: 23,
      dinas_id: 1,
      anggaran: 5000000000,
      status: 'berjalan',
      progres_persen: 0,
    };
    const stages = getProjectTimelineStages(newProject);
    expect(stages).toEqual([]);
  });

  it('getProjectTimelineStages purges legacy template cache in localStorage for new project and returns empty', () => {
    const newProject: ProyekItem = {
      id: 38,
      nama_proyek: 'perbaikan jalan area mantup',
      kategori: 'jalan',
      deskripsi: 'Deskripsi proyek baru',
      latitude: -7.12,
      longitude: 112.41,
      wilayah_id: 23,
      dinas_id: 1,
      anggaran: 5000000000,
      status: 'berjalan',
      progres_persen: 0,
    };

    // Simulate old template generated cache in localStorage
    localStorage.setItem(
      'civictrack_project_stages_38',
      JSON.stringify([
        { id: 3801, nomor_tahap: 1, nama_tahap: 'Pengukuran Ulang & Pembersihan Lahan (Clearing)', persentase_bobot: 15, status: 'belum_mulai' },
        { id: 3802, nomor_tahap: 2, nama_tahap: 'Galian & Pemadatan Lapis Pondasi Bawah (Subbase)', persentase_bobot: 25, status: 'belum_mulai' },
      ])
    );

    const stages = getProjectTimelineStages(newProject);
    expect(stages).toEqual([]);
    expect(localStorage.getItem('civictrack_project_stages_38')).toBe('[]');
  });

  it('getProjectTimelineStages preserves user-created manual stages for new project', () => {
    const newProject: ProyekItem = {
      id: 38,
      nama_proyek: 'perbaikan jalan area mantup',
      kategori: 'jalan',
      deskripsi: 'Deskripsi proyek baru',
      latitude: -7.12,
      longitude: 112.41,
      wilayah_id: 23,
      dinas_id: 1,
      anggaran: 5000000000,
      status: 'berjalan',
      progres_persen: 0,
    };

    const manualStages = [
      {
        id: 99991,
        proyek_id: 38,
        nomor_tahap: 1,
        nama_tahap: 'Pengecekan Manual Pertama',
        deskripsi: 'Tahap manual dari dinas',
        target_mulai: '2026-11-20',
        target_selesai: '2026-12-20',
        persentase_bobot: 20,
        status: 'belum_mulai' as const,
        is_manual: true,
      },
    ];

    localStorage.setItem('civictrack_project_stages_38', JSON.stringify(manualStages));

    const stages = getProjectTimelineStages(newProject);
    expect(stages).toHaveLength(1);
    expect(stages[0].nama_tahap).toBe('Pengecekan Manual Pertama');
  });
});

