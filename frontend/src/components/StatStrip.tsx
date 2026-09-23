import React from 'react';
import type { StatSummary } from '../types';

interface StatStripProps {
  stats: StatSummary;
}

export const StatStrip: React.FC<StatStripProps> = ({ stats }) => {
  return (
    <div id="stats" className="bg-[#184C78] py-9 px-6 sm:px-8 text-white transition-all">
      <div className="max-w-[1180px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0">
        <div className="text-center px-4 md:border-r border-white/15">
          <div className="font-['DM_Sans'] text-3xl sm:text-4xl font-extrabold tracking-[-1px] leading-none mb-1.5 text-white">
            {stats.totalProyekCount}<span className="text-[22px] opacity-70">+</span>
          </div>
          <div className="text-[13px] text-white/60 font-medium">Proyek terdaftar</div>
        </div>

        <div className="text-center px-4 md:border-r border-white/15">
          <div className="font-['DM_Sans'] text-3xl sm:text-4xl font-extrabold tracking-[-1px] leading-none mb-1.5 text-white">
            {stats.totalAnggaran.replace('Rp ', 'Rp ')}
          </div>
          <div className="text-[13px] text-white/60 font-medium">Total anggaran transparan</div>
        </div>

        <div className="text-center px-4 md:border-r border-white/15">
          <div className="font-['DM_Sans'] text-3xl sm:text-4xl font-extrabold tracking-[-1px] leading-none mb-1.5 text-white">
            {stats.totalWarga}
          </div>
          <div className="text-[13px] text-white/60 font-medium">Warga memantau</div>
        </div>

        <div className="text-center px-4">
          <div className="font-['DM_Sans'] text-3xl sm:text-4xl font-extrabold tracking-[-1px] leading-none mb-1.5 text-white">
            {stats.totalDinas}
          </div>
          <div className="text-[13px] text-white/60 font-medium">Dinas terhubung</div>
        </div>
      </div>
    </div>
  );
};
