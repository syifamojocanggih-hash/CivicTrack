import React from 'react';

interface FooterProps {
  onOpenOpenData?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenOpenData }) => {
  return (
    <footer className="bg-[#0f3252] py-10 px-6 sm:px-8 text-white/50 border-t border-white/5">
      <div className="max-w-[1180px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 flex-wrap">
        <a
          href="#"
          className="flex items-center gap-2 font-['DM_Sans'] font-extrabold text-[15px] text-white/85 no-underline"
        >
          <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          CivicTrack
        </a>

        <div className="flex gap-5 flex-wrap text-center">
          <a href="#" className="text-xs text-white/40 hover:text-white/80 transition-colors">
            Kebijakan Privasi
          </a>
          <a href="#" className="text-xs text-white/40 hover:text-white/80 transition-colors">
            Syarat Penggunaan
          </a>
          <button
            onClick={onOpenOpenData}
            className="text-xs text-white/40 hover:text-white/80 transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            Open API Docs
          </button>
          <a href="#" className="text-xs text-white/40 hover:text-white/80 transition-colors">
            Kontak Dinas
          </a>
        </div>

        <span className="text-xs text-white/40">
          &copy; 2024–2026 CivicTrack &middot; Platform Transparansi Pembangunan Daerah
        </span>
      </div>
    </footer>
  );
};
