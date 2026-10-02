import React from 'react';
import { CivicTrackLogo } from './CivicTrackLogo';

interface FooterProps {
  onOpenOpenData?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenOpenData }) => {
  return (
    <footer className="bg-[#0f3252] py-10 px-6 sm:px-8 text-white/50 border-t border-white/5">
      <div className="max-w-[1180px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 flex-wrap">
        <a
          href="#"
          className="flex items-center no-underline"
          title="CivicTrack"
        >
          <CivicTrackLogo size="xs" theme="dark" />
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
