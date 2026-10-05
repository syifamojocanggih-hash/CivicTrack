import React from 'react';
import { Search, FileSpreadsheet, Camera, CheckCircle2 } from 'lucide-react';
import type { StepItem } from '../types';

interface HowItWorksSectionProps {
  steps?: StepItem[];
  onExploreClick?: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onExploreClick }) => {
  const civicSteps = [
    {
      num: '01',
      title: 'Pemetaan & Penelusuran',
      desc: 'Cari proyek pembangunan di sekitar lingkungan tempat tinggal melalui peta spasial atau filter per wilayah kecamatan.',
      icon: Search,
      tag: 'Akses Publik',
    },
    {
      num: '02',
      title: 'Transparansi Data & Anggaran',
      desc: 'Periksa detail nilai kontrak APBD, target tenggat waktu penyelesaian, volume pekerjaan fisik, dan dinas penanggung jawab.',
      icon: FileSpreadsheet,
      tag: 'Keterbukaan Data',
    },
    {
      num: '03',
      title: 'Laporan & Bukti Lapangan',
      desc: 'Warga dapat mengunggah foto lapangan ber-geotag dan catatan kendala bila pengerjaan mengalami keterlambatan atau kerusakan.',
      icon: Camera,
      tag: 'Partisipasi Warga',
    },
    {
      num: '04',
      title: 'Tindak Lanjut & Verifikasi',
      desc: 'Dinas teknis meninjau laporan, memberikan klarifikasi resmi di linimasa proyek, dan memperbarui persentase realisasi fisik.',
      icon: CheckCircle2,
      tag: 'Akuntabilitas',
    },
  ];

  return (
    <section id="how-it-works" className="bg-[#F5F7FA] border-t border-b border-[#DCE0E6] py-16 px-6 sm:px-8">
      <div className="max-w-[1180px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-[620px]">
            <h2 className="font-['DM_Sans'] text-2xl sm:text-3xl font-extrabold text-[#184C78] tracking-[-0.6px] leading-[1.2] mb-2">
              Alur Partisipasi dan Pengawasan Proyek
            </h2>
            <p className="text-[15px] text-[#6C757D] leading-[1.65]">
              Mulai memantau proyek, memeriksa serapan anggaran, dan menyampaikan laporan kendala fisik secara terstruktur.
            </p>
          </div>

          {onExploreClick && (
            <button
              type="button"
              onClick={onExploreClick}
              className="px-4 py-2 bg-[#184C78] hover:bg-[#12395b] text-white font-bold text-xs rounded-xl transition-colors shadow-xs shrink-0 cursor-pointer self-start md:self-end"
            >
              Buka Peta Proyek
            </button>
          )}
        </div>

        {/* 4-Column Layout Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {civicSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white border border-[#DCE0E6] rounded-xl p-5 flex flex-col justify-between hover:border-[#2980B9] hover:shadow-[0_2px_8px_rgba(24,76,120,0.08)] transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#EBF4FB] flex items-center justify-center text-[#2980B9]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-['DM_Sans'] text-lg font-black text-slate-300 group-hover:text-[#2980B9] transition-colors">
                      {step.num}
                    </span>
                  </div>

                  <span className="inline-block text-[10px] font-bold text-[#2980B9] bg-[#EBF4FB] px-2 py-0.5 rounded border border-[#cbe1f5] mb-2">
                    {step.tag}
                  </span>

                  <h3 className="font-['DM_Sans'] text-[15px] font-bold text-[#184C78] mb-1.5 leading-snug">
                    {step.title}
                  </h3>

                  <p className="text-[13px] text-[#6C757D] leading-[1.6]">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>Tahap {step.num} dari 04</span>
                  <span className="text-[#2980B9] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Detail &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
