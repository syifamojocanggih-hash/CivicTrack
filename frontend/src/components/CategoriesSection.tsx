import React from 'react';
import type { CategoryItem, ProyekKategori } from '../types';

interface CategoriesSectionProps {
  categories: CategoryItem[];
  selectedCategory: ProyekKategori | null;
  onSelectCategory: (cat: ProyekKategori | null) => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <section id="categories" className="max-w-[1180px] mx-auto px-6 sm:px-8 py-20">
      <div className="max-w-[520px] mb-10">
        <h2 className="font-['DM_Sans'] text-2xl sm:text-3xl font-extrabold text-[#184C78] tracking-[-0.6px] leading-[1.2] mb-3">
          Telusuri berdasarkan kategori
        </h2>
        <p className="text-[15px] text-[#6C757D] leading-[1.65]">
          Jenis proyek apa yang ingin kamu pantau?
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className={`border-[1.5px] rounded-xl p-5 text-center cursor-pointer transition-all bg-white ${
                isSelected
                  ? 'border-[#2980B9] bg-[#EBF4FB] shadow-md -translate-y-1'
                  : 'border-[#DCE0E6] hover:border-[#2980B9] hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(24,76,120,0.09),0_8px_24px_rgba(24,76,120,0.07)]'
              }`}
            >
              <span className="text-3xl mb-2.5 block transform transition-transform group-hover:scale-110">
                {cat.icon}
              </span>
              <h3 className="font-['DM_Sans'] text-sm font-bold text-[#184C78] mb-1">
                {cat.name}
              </h3>
              <p className="text-xs text-[#6C757D]">
                {cat.count} proyek
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
