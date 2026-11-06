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
});

