import React from 'react';

interface CTASectionProps {
  onRegisterClick: () => void;
  onOpenMapClick: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({
  onRegisterClick,
  onOpenMapClick,
}) => {
  return (
    <section className="bg-[#184C78] py-20 px-6 sm:px-8 text-center relative overflow-hidden">
      {/* Background radial glow */}
      <div 
        className="absolute -top-16 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[rgba(41,128,185,0.15)] pointer-events-none blur-2xl" 
      />

      <div className="relative z-10 max-w-[560px] mx-auto">
        <h2 className="font-['DM_Sans'] text-3xl sm:text-4xl font-extrabold text-white tracking-[-0.6px] leading-[1.2] mb-3.5">
          Jadilah warga aktif yang peduli pembangunan
        </h2>
        <p className="text-[15px] text-white/65 leading-[1.65] mb-8">
          Daftarkan diri untuk mengikuti proyek, mengirim laporan, dan mendapat notifikasi pembaruan langsung di kotamu.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={onRegisterClick}
            className="h-11 px-7 bg-white text-[#184C78] border-none rounded-[9px] text-sm font-bold cursor-pointer font-['DM_Sans'] hover:bg-[#e8f2fb] transition-colors shadow-sm"
          >
            Daftar Gratis
          </button>
          <button
            onClick={onOpenMapClick}
            className="h-11 px-6 bg-transparent text-white/90 border-[1.5px] border-white/30 rounded-[9px] text-sm font-semibold cursor-pointer font-['DM_Sans'] hover:border-white/70 hover:text-white transition-all"
          >
            Buka Peta Proyek
          </button>
        </div>
      </div>
    </section>
  );
};
