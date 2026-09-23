import React from 'react';
import { Map, BarChart2, MessageSquare, Sparkles, Bell, Code2 } from 'lucide-react';
import type { FeatureItem } from '../types';

interface FeaturesSectionProps {
  features: FeatureItem[];
  onOpenFeature?: (featureId: string) => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features, onOpenFeature }) => {
  const getIcon = (type: FeatureItem['iconType']) => {
    switch (type) {
      case 'map':
        return (
          <div className="w-11 h-11 rounded-[10px] bg-[#EBF4FB] flex items-center justify-center mb-4 shrink-0 text-[#2980B9]">
            <Map className="w-5 h-5" />
          </div>
        );
      case 'progress':
        return (
          <div className="w-11 h-11 rounded-[10px] bg-[#E6F7F1] flex items-center justify-center mb-4 shrink-0 text-[#1A9E6E]">
            <BarChart2 className="w-5 h-5" />
          </div>
        );
      case 'report':
        return (
          <div className="w-11 h-11 rounded-[10px] bg-[#FEF3E7] flex items-center justify-center mb-4 shrink-0 text-[#E67E22]">
            <MessageSquare className="w-5 h-5" />
          </div>
        );
      case 'ai':
        return (
          <div className="w-11 h-11 rounded-[10px] bg-[#f0ebff] flex items-center justify-center mb-4 shrink-0 text-[#7C3AED]">
            <Sparkles className="w-5 h-5" />
          </div>
        );
      case 'notif':
        return (
          <div className="w-11 h-11 rounded-[10px] bg-[#EBF4FB] flex items-center justify-center mb-4 shrink-0 text-[#2980B9]">
            <Bell className="w-5 h-5" />
          </div>
        );
      case 'open':
        return (
          <div className="w-11 h-11 rounded-[10px] bg-[#E6F7F1] flex items-center justify-center mb-4 shrink-0 text-[#1A9E6E]">
            <Code2 className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <section id="features" className="max-w-[1180px] mx-auto px-6 sm:px-8 py-20">
      <div className="max-w-[520px] mb-12">
        <h2 className="font-['DM_Sans'] text-2xl sm:text-3xl font-extrabold text-[#184C78] tracking-[-0.6px] leading-[1.2] mb-3">
          Semua yang perlu warga tahu, dalam satu platform
        </h2>
        <p className="text-[15px] text-[#6C757D] leading-[1.65]">
          Dari lokasi hingga dokumen lapangan, CivicTrack menampilkan informasi proyek publik secara lengkap dan mudah dipahami.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feat) => (
          <div
            key={feat.id}
            onClick={() => onOpenFeature && onOpenFeature(feat.id)}
            className="bg-white border border-[#DCE0E6] rounded-xl p-6 hover:border-[#b0cde8] hover:shadow-[0_2px_8px_rgba(24,76,120,0.09),0_8px_24px_rgba(24,76,120,0.07)] transition-all cursor-pointer group"
          >
            {getIcon(feat.iconType)}
            <h3 className="font-['DM_Sans'] text-[15px] font-bold text-[#184C78] mb-2 group-hover:text-[#2980B9] transition-colors">
              {feat.title}
            </h3>
            <p className="text-[13px] text-[#6C757D] leading-[1.6]">
              {feat.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
