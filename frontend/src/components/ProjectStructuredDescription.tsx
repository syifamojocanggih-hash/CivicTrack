import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Info,
  Building2,
  AlertTriangle,
  User,
  ShieldCheck,
  FileText,
  Hammer,
  BadgeDollarSign,
  CalendarCheck,
} from 'lucide-react';
import {
  parseProjectTechnicalDescription,
  type StructuredProjectDescription,
} from '../utils/projectTechnicalData';

export interface ProjectStructuredDescriptionProps {
  deskripsi?: string;
  project?: any;
  defaultExpanded?: boolean;
  showAdminMetadata?: boolean;
  className?: string;
  compact?: boolean;
}

export const ProjectStructuredDescription: React.FC<ProjectStructuredDescriptionProps> = ({
  deskripsi,
  project,
  defaultExpanded = false,
  showAdminMetadata = true,
  className = '',
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  const parsed: StructuredProjectDescription = parseProjectTechnicalDescription(deskripsi, project);

  // Fallback aman: jika teks tidak berformat standar atau parsing tidak menemukan struktur
  if (!parsed.isParsed && !parsed.metadataAdmin.kontraktor) {
    return (
      <div className={`space-y-2 ${className}`}>
        <p className="text-xs text-slate-700 leading-relaxed bg-[#F8FAFC] p-3 rounded-xl border border-slate-200">
          {parsed.rawDeskripsi || 'Pembangunan infrastruktur strategis untuk peningkatan pelayanan dan mobilitas warga Kabupaten Lamongan.'}
        </p>
      </div>
    );
  }

  const { metadataAdmin, alasanTunda, spesifikasiTeknis } = parsed;
  const hasMetadata = Object.values(metadataAdmin).some(Boolean);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 1. Deskripsi Singkat Ramah Warga (1-2 Kalimat) */}
      <div className="bg-[#F8FAFC] p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-[#184C78]" />
          <h5 className="text-[10px] sm:text-[11px] font-bold text-[#184C78] uppercase tracking-wider">
            Ringkasan Lingkup Pekerjaan
          </h5>
        </div>
        <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal">
          {parsed.ringkasan}
        </p>
      </div>

      {/* Alert Alasan Penundaan jika ada */}
      {alasanTunda && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 shadow-2xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Alasan Penundaan Lapangan:</strong>
            <span className="leading-relaxed">{alasanTunda}</span>
          </div>
        </div>
      )}

      {/* 2. Detail Teknis (Collapsible / Accordion Expand-Collapse) */}
      {spesifikasiTeknis && (
        <div className="border border-slate-200/90 rounded-xl overflow-hidden bg-white shadow-2xs transition-all">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-3.5 py-2.5 bg-slate-50/90 hover:bg-slate-100/90 text-left text-xs font-semibold text-[#184C78] flex items-center justify-between transition-colors cursor-pointer"
            aria-expanded={isExpanded}
          >
            <span className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-[#2980B9]" />
              <span className="font-heading">Rincian Spesifikasi &amp; Dimensi Teknis</span>
            </span>
            <span className="text-[10.5px] font-bold text-slate-500 flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              <span>{isExpanded ? 'Sembunyikan' : 'Lihat Selengkapnya'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </span>
          </button>

          {isExpanded && (
            <div className="p-3.5 border-t border-slate-200/80 text-xs text-slate-600 leading-relaxed bg-[#FBFCFD] animate-fade-in space-y-2">
              <div className="font-mono text-[11px] leading-relaxed whitespace-pre-line text-slate-700 bg-white p-3 rounded-lg border border-slate-200/70">
                {spesifikasiTeknis}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Info Administratif & Pihak Penanggung Jawab (Badge Grid Terpisah) */}
      {showAdminMetadata && hasMetadata && (
        <div className="p-3 sm:p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
            <div className="flex items-center gap-1.5 font-heading text-xs font-bold text-[#184C78] uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-[#184C78]" />
              <span>Info Kontrak &amp; Penanggung Jawab Resmi</span>
            </div>
            <span className="text-[9.5px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
              ✓ LPSE Terverifikasi
            </span>
          </div>

          <div className={`grid grid-cols-1 ${compact ? 'sm:grid-cols-1' : 'sm:grid-cols-2'} gap-2 text-xs`}>
            {metadataAdmin.sumberDana && (
              <div className="p-2 bg-white rounded-lg border border-slate-200/70 shadow-2xs">
                <span className="text-slate-400 block text-[10px] font-medium flex items-center gap-1">
                  <BadgeDollarSign className="w-3 h-3 text-emerald-600" />
                  Sumber Pembiayaan:
                </span>
                <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[10.5px] inline-block mt-0.5">
                  {metadataAdmin.sumberDana}
                </span>
              </div>
            )}

            {metadataAdmin.nomorKontrak && (
              <div className="p-2 bg-white rounded-lg border border-slate-200/70 shadow-2xs">
                <span className="text-slate-400 block text-[10px] font-medium flex items-center gap-1">
                  <FileText className="w-3 h-3 text-[#2980B9]" />
                  Nomor Kontrak LPSE:
                </span>
                <span className="font-mono text-slate-800 font-semibold text-[10.5px] block truncate mt-0.5">
                  {metadataAdmin.nomorKontrak}
                </span>
              </div>
            )}

            {metadataAdmin.kontraktor && (
              <div className="p-2 bg-white rounded-lg border border-slate-200/70 shadow-2xs">
                <span className="text-slate-400 block text-[10px] font-medium flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-[#184C78]" />
                  Kontraktor Pelaksana:
                </span>
                <span className="font-bold text-slate-800 text-[11px] block mt-0.5">
                  {metadataAdmin.kontraktor}
                </span>
              </div>
            )}

            {metadataAdmin.konsultan && (
              <div className="p-2 bg-white rounded-lg border border-slate-200/70 shadow-2xs">
                <span className="text-slate-400 block text-[10px] font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-600" />
                  Konsultan Pengawas:
                </span>
                <span className="font-bold text-slate-800 text-[11px] block mt-0.5">
                  {metadataAdmin.konsultan}
                </span>
              </div>
            )}

            {metadataAdmin.ppk && (
              <div className="p-2 bg-white rounded-lg border border-slate-200/70 shadow-2xs">
                <span className="text-slate-400 block text-[10px] font-medium flex items-center gap-1">
                  <User className="w-3 h-3 text-indigo-600" />
                  Pejabat Pembuat Komitmen (PPK):
                </span>
                <span className="font-bold text-slate-800 text-[11px] block mt-0.5">
                  {metadataAdmin.ppk}
                </span>
              </div>
            )}

            {metadataAdmin.kepalaMandor && (
              <div className="p-2 bg-white rounded-lg border border-slate-200/70 shadow-2xs">
                <span className="text-slate-400 block text-[10px] font-medium flex items-center gap-1">
                  <Hammer className="w-3 h-3 text-amber-600" />
                  Kepala Mandor / Site Manager:
                </span>
                <span className="font-bold text-[#184C78] text-[11px] block mt-0.5">
                  {metadataAdmin.kepalaMandor}
                </span>
              </div>
            )}

            {metadataAdmin.phoDate && (
              <div className="p-2 bg-white rounded-lg border border-slate-200/70 shadow-2xs sm:col-span-2">
                <span className="text-slate-400 block text-[10px] font-medium flex items-center gap-1">
                  <CalendarCheck className="w-3 h-3 text-emerald-600" />
                  Tanggal Selesai Aktual (PHO):
                </span>
                <span className="font-bold text-emerald-700 text-[11px] block mt-0.5">
                  {metadataAdmin.phoDate}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
