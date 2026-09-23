import React from 'react';
import type { StepItem } from '../types';

interface HowItWorksSectionProps {
  steps: StepItem[];
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ steps }) => {
  return (
    <section id="how-it-works" className="bg-[#F5F7FA] border-t border-b border-[#DCE0E6] py-20 px-6 sm:px-8">
      <div className="max-w-[1180px] mx-auto">
        <div className="max-w-[520px] mb-12">
          <h2 className="font-['DM_Sans'] text-2xl sm:text-3xl font-extrabold text-[#184C78] tracking-[-0.6px] leading-[1.2] mb-3">
            Cara menggunakan CivicTrack
          </h2>
          <p className="text-[15px] text-[#6C757D] leading-[1.65]">
            Mulai memantau proyek di sekitar tempat tinggalmu dalam tiga langkah mudah.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 mt-12">
          {/* Connecting Line between steps (Desktop only) */}
          <div className="hidden md:block absolute top-6 left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-[1px] bg-[#DCE0E6] z-0" />

          {steps.map((step) => (
            <div key={step.step} className="text-center px-4 md:px-8 relative z-10 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-white border-2 border-[#2980B9] flex items-center justify-center mb-5 font-['DM_Sans'] text-lg font-extrabold text-[#2980B9] shadow-sm">
                {step.step}
              </div>
              <h3 className="font-['DM_Sans'] text-[15px] font-bold text-[#184C78] mb-2">
                {step.title}
              </h3>
              <p className="text-[13px] text-[#6C757D] leading-[1.6] max-w-[220px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
