import React, { useState } from 'react';
import { X, AlertCircle, Loader2, Check, Rocket } from 'lucide-react';
import type { UserProfile } from '../types';
import { apiService } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'register';
  onLoginSuccess: (user: UserProfile) => void;
  notice?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode,
  onLoginSuccess,
  notice,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserProfile['role']>('warga');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (mode === 'login') {
        const res = await apiService.login(email, password);
        onLoginSuccess(res.user);
        onClose();
      } else {
        const res = await apiService.register(name, email, password, role);
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses permintaan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2200] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      {/* ── CARD CONTAINER: MATCHES MOCKUP ASPECT RATIO & ROUNDED CORNERS ── */}
      <div className="bg-white rounded-[32px] w-full max-w-[860px] md:h-[500px] shadow-2xl overflow-hidden relative flex flex-col md:flex-row my-auto transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Tutup dialog"
          className="absolute top-4 right-4 z-40 w-8 h-8 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-xs"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── 1. DESKTOP LEFT PANEL: BLUE WITH FLUFFY VOLUMINOUS CLOUD BOUNDARY ── */}
        <div
          className="hidden md:flex flex-col items-center justify-between w-[43%] text-white p-8 pb-6 relative overflow-hidden shrink-0 select-none text-center"
          style={{
            background: 'linear-gradient(180deg, #0b50bc 0%, #176ddb 55%, #2a94f6 100%)',
          }}
        >
          {/* Top Welcome Text */}
          <div className="pt-2 text-[15px] font-medium tracking-wide text-white/95">
            Welcome to
          </div>

          {/* Center Brand Group */}
          <div className="my-auto flex flex-col items-center">
            {/* Circular Logo Badge */}
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg p-3 mx-auto transition-transform hover:scale-105">
              <Rocket className="w-10 h-10 text-[#0c61cf] -rotate-45" />
            </div>

            {/* Title */}
            <h2 className="text-[28px] font-bold tracking-tight font-['DM_Sans'] text-white mt-3">
              CivicTrack
            </h2>

            {/* Description */}
            <p className="text-[11px] text-white/85 leading-relaxed mt-3 max-w-[230px] font-normal mx-auto">
              Sistem keterbukaan informasi dan pemantauan proyek daerah secara akuntabel, inklusif, dan partisipatif.
            </p>
          </div>

          {/* Bottom Footer Label */}
          <div className="w-full pt-4 text-[10px] text-white/70 font-mono tracking-wider uppercase border-t border-white/10 flex items-center justify-center gap-2">
            <span>KABUPATEN LAMONGAN</span>
            <span className="text-white/40">&bull;</span>
            <span>APBD 2026</span>
          </div>

          {/* ── MULTI-LAYERED ORGANIC CLOUD SVG BOUNDARY ── */}
          <svg
            className="absolute top-0 -right-0.5 bottom-0 h-full w-[115px] pointer-events-none z-20"
            viewBox="0 0 110 500"
            preserveAspectRatio="none"
          >
            {/* Layer 1: Darker Translucent Blue Cloud Base */}
            <path
              d="M110,0 L9,0 C-6,20 -6,65 16,85 C-11,105 -11,155 20,175 C-4,200 -4,255 24,275 C-8,300 -8,360 19,385 C-14,415 -14,480 4,500 L110,500 Z"
              fill="#3b85e0"
              opacity="0.45"
            />
            {/* Layer 2: Medium Sky-Blue Cloud */}
            <path
              d="M110,0 L21,0 C6,20 6,65 28,85 C1,105 1,155 32,175 C8,200 8,255 36,275 C4,300 4,360 31,385 C-2,415 -2,480 16,500 L110,500 Z"
              fill="#72b0f2"
              opacity="0.65"
            />
            {/* Layer 3: Soft Pale Cloud */}
            <path
              d="M110,0 L33,0 C18,20 18,65 40,85 C13,105 13,155 44,175 C20,200 20,255 48,275 C16,300 16,360 43,385 C10,415 10,480 28,500 L110,500 Z"
              fill="#b9dcfa"
              opacity="0.8"
            />
            {/* Layer 4: Solid White Foreground Cloud Bank */}
            <path
              d="M110,0 L45,0 C30,20 30,65 52,85 C25,105 25,155 56,175 C32,200 32,255 60,275 C28,300 28,360 55,385 C22,415 22,480 40,500 L110,500 Z"
              fill="#ffffff"
            />
          </svg>
        </div>

        {/* ── 2. MOBILE TOP HEADER WITH HORIZONTAL CLOUDS ── */}
        <div
          className="md:hidden relative text-white p-6 pb-12 text-center overflow-hidden shrink-0 select-none"
          style={{
            background: 'linear-gradient(180deg, #0b50bc 0%, #176ddb 60%, #2a94f6 100%)',
          }}
        >
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-xs font-medium text-white/90 mb-1">
              Welcome to
            </span>
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md p-2 my-1">
              <Rocket className="w-8 h-8 text-[#0c61cf] -rotate-45" />
            </div>
            <h2 className="text-xl font-bold tracking-tight font-['DM_Sans']">
              CivicTrack
            </h2>
            <p className="text-[11px] text-white/80 max-w-xs mt-0.5">
              Sistem Transparansi Pembangunan Daerah
            </p>
          </div>

          {/* Horizontal Cloud Bottom Edge */}
          <svg
            className="absolute left-0 right-0 -bottom-0.5 w-full h-11 pointer-events-none z-20"
            viewBox="0 0 400 50"
            preserveAspectRatio="none"
          >
            <path
              d="M0,50 L0,25 C25,8 65,6 95,20 C125,2 165,5 195,22 C225,2 275,5 305,20 C335,8 375,10 400,22 L400,50 Z"
              fill="#72b0f2"
              opacity="0.6"
            />
            <path
              d="M0,50 L0,32 C25,16 65,14 95,28 C125,10 165,13 195,30 C225,10 275,13 305,28 C335,16 375,18 400,30 L400,50 Z"
              fill="#b9dcfa"
              opacity="0.8"
            />
            <path
              d="M0,50 L0,38 C25,24 65,22 95,36 C125,18 165,21 195,38 C225,18 275,21 305,36 C335,24 375,26 400,38 L400,50 Z"
              fill="#ffffff"
            />
          </svg>
        </div>

        {/* ── 3. RIGHT PANEL: CLEAN UNDERLINE FORM (IDENTICAL TO MOCKUP) ── */}
        <div className="flex-1 bg-white p-8 sm:p-12 flex flex-col justify-center overflow-y-auto">
          <div className="max-w-[340px] w-full mx-auto">
            {/* Title */}
            <h3 className="text-2xl font-bold text-[#2d3748] tracking-tight mb-7 text-center font-['DM_Sans']">
              {mode === 'login' ? 'Masuk ke Akun' : 'Create your account'}
            </h3>

            {notice && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mb-4">
                {notice}
              </p>
            )}

            {/* Error Alert */}
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 mb-4 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name (Register Mode Only) */}
              {mode === 'register' && (
                <div>
                  <label htmlFor="name" className="block text-[13px] font-bold text-[#2d3748] mb-1">
                    Nama Lengkap
                  </label>
                  <div className="border-b-[1.5px] border-[#8bc4fa] focus-within:border-[#0062d2] flex items-center justify-between pb-1 transition-colors">
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full bg-transparent border-none outline-none text-sm text-[#2d3748] placeholder:text-[#a0aec0] placeholder:font-light"
                    />
                    <Check className="w-4 h-4 text-[#8bc4fa] shrink-0 ml-2" />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-[13px] font-bold text-[#2d3748] mb-1">
                  Alamat Email
                </label>
                <div className="border-b-[1.5px] border-[#8bc4fa] focus-within:border-[#0062d2] flex items-center justify-between pb-1 transition-colors">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your mail"
                    className="w-full bg-transparent border-none outline-none text-sm text-[#2d3748] placeholder:text-[#a0aec0] placeholder:font-light"
                  />
                  <Check className="w-4 h-4 text-[#8bc4fa] shrink-0 ml-2" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-[13px] font-bold text-[#2d3748] mb-1">
                  Kata Sandi
                </label>
                <div className="border-b-[1.5px] border-[#8bc4fa] focus-within:border-[#0062d2] flex items-center justify-between pb-1 transition-colors">
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-transparent border-none outline-none text-sm text-[#2d3748] placeholder:text-[#a0aec0] placeholder:font-light"
                  />
                  <Check className="w-4 h-4 text-[#8bc4fa] shrink-0 ml-2" />
                </div>
              </div>

              {/* Role (Register Mode Only) */}
              {mode === 'register' && (
                <div>
                  <label htmlFor="role" className="block text-[13px] font-bold text-[#2d3748] mb-1">
                    Peran Akun
                  </label>
                  <div className="border-b-[1.5px] border-[#8bc4fa] focus-within:border-[#0062d2] flex items-center justify-between pb-1 transition-colors">
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full bg-transparent border-none outline-none text-sm text-[#2d3748] cursor-pointer"
                    >
                      <option value="warga">1. Warga Masyarakat (Partisipasi &amp; Pantau)</option>
                      <option value="aparatur_pemerintah">2. Aparatur Pemerintah (Monitoring Eksekutif)</option>
                      <option value="penanggung_jawab">3. Penanggung Jawab Proyek (Kelola Proyek)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-[#0062d2] border-slate-300 focus:ring-[#0062d2] cursor-pointer"
                />
                <label htmlFor="terms" className="cursor-pointer select-none text-[11px] text-[#718096]">
                  By Signing Up, I agree with <span className="text-[#0062d2] font-medium hover:underline">Terms &amp; Conditions</span>
                </label>
              </div>

              {/* Buttons: Pill Sign Up & Sign In Side by Side */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isLoading || !agreeTerms}
                  className="flex-1 py-2.5 px-6 rounded-full bg-gradient-to-r from-[#0062d2] to-[#1c84ee] hover:from-[#0051ad] hover:to-[#146ecc] text-white font-bold text-sm shadow-[0_4px_14px_rgba(0,98,210,0.35)] hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{mode === 'login' ? 'Masuk Sekarang' : 'Sign Up'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setErrorMsg(null);
                  }}
                  className="flex-1 py-2.5 px-6 rounded-full bg-white border border-[#cbd5e0] hover:border-[#a0aec0] text-[#718096] hover:text-[#2d3748] font-semibold text-sm transition-all cursor-pointer text-center"
                >
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
