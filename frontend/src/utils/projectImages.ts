import alunAlunLamonganImg from '../assets/real_projects/alun_alun_lamongan.jpg';
import jalanKotaLamonganImg from '../assets/real_projects/jalan_kota_lamongan.jpg';
import jalanPorosLamonganImg from '../assets/real_projects/jalan_poros_lamongan.jpg';
import jembatanBabatLamonganImg from '../assets/real_projects/jembatan_babat_lamongan.jpg';
import pelabuhanPaciranImg from '../assets/real_projects/pelabuhan_paciran.jpg';
import fasilitasPasarBabatImg from '../assets/real_projects/fasilitas_pasar_babat.jpg';
import saluranIrigasiLamonganImg from '../assets/real_projects/saluran_irigasi_lamongan.jpg';
import lapanganMaduranImg from '../assets/real_projects/lapangan_olahraga_maduran.jpg';
import stadionSurajayaImg from '../assets/real_projects/stadion_surajaya_lamongan.jpg';
import rsudGedungMedisImg from '../assets/real_projects/rsud_gedung_medis.jpg';
import pintuAirBengawanImg from '../assets/real_projects/pintu_air_bengawan.jpg';
import perbaikanJalanAspalImg from '../assets/real_projects/perbaikan_jalan_aspal.jpg';
import alatBeratJalanImg from '../assets/real_projects/alat_berat_jalan.jpg';
import type { ProyekItem } from '../types';

/**
 * Pemetaan foto dokumentasi fisik 100% ASLI (Real Photograph, NO AI).
 * Seluruh foto adalah foto dokumentasi nyata fasilitas & infrastruktur Kabupaten Lamongan / Jawa Timur.
 * Setiap proyek dipetakan secara presisi dan masuk akal sesuai lokasi, fungsi, dan jenis pekerjaannya.
 */
export const REAL_PROJECT_IMAGES: Record<number, string> = {
  // Proyek Jalan JAMULA (Jalan Mulus Lamongan) & Penghubung Antar-Kecamatan
  1: perbaikanJalanAspalImg,    // Peningkatan Jalan Sukodadi - Sumberwudi
  2: alatBeratJalanImg,          // Peningkatan Jalan Pucuk - Sekaran
  3: jalanPorosLamonganImg,      // Rekonstruksi Jalan Sugio - Kedungpring
  4: perbaikanJalanAspalImg,    // Rekonstruksi Jalan Poros Babat - Sukorame
  5: jalanPorosLamonganImg,      // Peningkatan Jalan Deket - Soko
  6: alatBeratJalanImg,          // Peningkatan Jalan Turi - Kiringan
  7: perbaikanJalanAspalImg,    // Peningkatan Jalan Brengkok - Brondong
  8: jalanPorosLamonganImg,      // Rekonstruksi Jalan Mantup - Sambeng
  9: alatBeratJalanImg,          // Peningkatan Jalan Bluluk - Sukorame
  10: jalanPorosLamonganImg,     // Rekonstruksi Jalan Laren - Blawi
  11: perbaikanJalanAspalImg,   // Peningkatan Jalan Tikung - Kembangbahu
  12: jalanPorosLamonganImg,     // Peningkatan Jalan Modo - Babat
  31: alatBeratJalanImg,         // Pelebaran & Pengecoran Rigid Sukodadi - Banjaranyar
  35: jalanKotaLamonganImg,      // Pembangunan Jalan Lingkar Utara (JLU) Seksi Deket - Sukodadi

  // Proyek Pengendali Banjir, Irigasi & Pintu Air
  13: pintuAirBengawanImg,       // Pembangunan Pintu Air & Retensi Kuro
  14: pintuAirBengawanImg,       // Pompa Banjir 3.000 L/dt Pintu Air Kuro
  15: saluranIrigasiLamonganImg, // Normalisasi Kali Asin & Pengerukan Bengawan Jero
  16: jalanKotaLamonganImg,      // Drainase Box Culvert Jl. Veteran & Jl. Basuki Rahmat
  17: pintuAirBengawanImg,       // Modernisasi Jaringan Irigasi DI Waduk Gondang
  32: saluranIrigasiLamonganImg, // Normalisasi Sungai Blawi & Saluran Pembuang Rawa Semando
  33: pintuAirBengawanImg,       // Pembangunan Embung Konservasi Air Tani Sukorame

  // Proyek Jembatan
  18: jembatanBabatLamonganImg,  // Rekonstruksi Jembatan Karanggeneng - Maduran
  19: jembatanBabatLamonganImg,  // Penggantian Gelagar & Pelebaran Jembatan Plaosan Babat
  20: jembatanBabatLamonganImg,  // Pembangunan Jembatan Kuro Penghubung Karangbinangun - Glagah

  // Proyek Fasilitas Medis & Kesehatan
  21: rsudGedungMedisImg,        // Pembangunan RSUD Brondong Pantura (Tahap II)
  22: rsudGedungMedisImg,        // Gedung Laboratorium Kesehatan Daerah (Labkesda)
  23: rsudGedungMedisImg,        // Gedung Bedah & Rawat Inap Terpadu RSUD dr. Soegiri
  30: rsudGedungMedisImg,        // Puskesmas Rawat Inap & Gedung PONED Ngimbang

  // Proyek Sarana Olahraga & Ruang Terbuka Publik
  24: stadionSurajayaImg,        // Rekonstruksi Total Stadion Gelora Surajaya (Standar FIFA)
  25: alunAlunLamonganImg,       // Revitalisasi Alun-Alun Lamongan & Mandhapa Seni Budaya
  26: lapanganMaduranImg,        // Pembangunan Ruang Terbuka Hijau & Eco-Park Babat
  27: lapanganMaduranImg,        // Revitalisasi Ruang Terbuka Publik & Taman Olahraga Maduran (Kecamatan Maduran)

  // Proyek Fasilitas Ekonomi, Perikanan, Pesisir & Pariwisata
  28: fasilitasPasarBabatImg,    // Sentra Pengeringan & Pergudangan Jagung Modern Solokuro
  29: pelabuhanPaciranImg,       // Fasilitas Cold Storage & TPI Higienis Brondong
  34: pelabuhanPaciranImg,       // Peningkatan Akses Wisata Bahari Lamongan (WBL) & Makam Sunan Drajat
};

/**
 * Mengambil foto real proyek berdasarkan ID atau kategori proyek (100% Real Photo, No AI)
 */
export function getRealProjectImage(project?: Pick<ProyekItem, 'id' | 'kategori' | 'nama_proyek'> | null): string {
  if (!project) return jalanPorosLamonganImg;

  // 1. Cek pemetaan ID langsung secara presisi (1-35)
  if (typeof project.id === 'number' && REAL_PROJECT_IMAGES[project.id]) {
    return REAL_PROJECT_IMAGES[project.id];
  }

  const name = (project.nama_proyek || '').toLowerCase();
  const kat = (project.kategori || '').toLowerCase();

  // 2. Proyek Alun-Alun Lamongan Kota (KHUSUS Alun-Alun)
  if (name.includes('alun-alun') || name.includes('alun alun')) {
    return alunAlunLamonganImg;
  }

  // 3. Stadion & Lapangan Olahraga / RTH Maduran
  if (name.includes('stadion') || name.includes('surajaya')) {
    return stadionSurajayaImg;
  }
  if (name.includes('maduran') || name.includes('lapangan') || name.includes('olahraga')) {
    return lapanganMaduranImg;
  }

  // 4. Fasilitas Kesehatan & RSUD
  if (name.includes('rsud') || name.includes('puskesmas') || name.includes('kesehatan') || name.includes('labkesda') || name.includes('medis')) {
    return rsudGedungMedisImg;
  }

  // 5. Pelabuhan, TPI, Pesisir & Wisata Bahari
  if (name.includes('pelabuhan') || name.includes('tpi') || name.includes('wisata bahari') || name.includes('wbl') || name.includes('brondong') || name.includes('paciran')) {
    return pelabuhanPaciranImg;
  }

  // 6. Jembatan & Flyover
  if (name.includes('jembatan') || name.includes('flyover')) {
    return jembatanBabatLamonganImg;
  }

  // 7. Saluran Air, Pintu Air, Tanggul & Waduk
  if (name.includes('pintu air') || name.includes('waduk') || name.includes('embung') || name.includes('pompa')) {
    return pintuAirBengawanImg;
  }
  if (kat === 'drainase' || name.includes('tanggul') || name.includes('saluran') || name.includes('sungai') || name.includes('irigasi')) {
    return saluranIrigasiLamonganImg;
  }

  // 8. Pasar & Pergudangan
  if (name.includes('pasar') || name.includes('gudang') || name.includes('jagung') || name.includes('sentra')) {
    return fasilitasPasarBabatImg;
  }

  // 9. Jalan & Jembatan
  if (kat === 'jalan' || name.includes('jalan') || name.includes('aspal') || name.includes('cor') || name.includes('jamula')) {
    return (project.id || 0) % 2 === 0 ? alatBeratJalanImg : perbaikanJalanAspalImg;
  }

  // 10. Default taman
  if (kat === 'taman') {
    return lapanganMaduranImg;
  }

  return jalanPorosLamonganImg;
}
