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
    <div className="fixed inset-0 z-[2200] flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* ── CARD WRAPPER WITH PRECISE PROPORTIONS (NOT GEPENG) ── */}
      <div className="bg-white rounded-[32px] w-full max-w-[820px] md:h-[500px] shadow-2xl overflow-hidden relative flex flex-col md:flex-row my-auto transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Tutup dialog"
          className="absolute top-4 right-4 z-40 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-xs"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── 1. DESKTOP LEFT PANEL: BLUE WITH VOLUMINOUS CLOUD BORDER ── */}
        <div className="hidden md:flex flex-col justify-between w-[42%] bg-gradient-to-br from-[#0b5ec2] via-[#1272d7] to-[#258bf4] text-white p-9 relative overflow-hidden shrink-0 select-none">
          {/* Subtle background ambient blur */}
          <div className="absolute -top-10 -left-10 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute bottom-10 -left-6 w-32 h-32 rounded-full bg-sky-300/15 blur-lg pointer-events-none" />

          {/* Top Brand Content */}
          <div className="relative z-10 space-y-3.5 my-auto pr-6">
            <span className="text-sm font-medium tracking-wide text-white/90">
              Welcome to
            </span>

            {/* Circular Logo Badge */}
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl p-3 ring-4 ring-white/20 transition-transform hover:scale-105">
              <img
                src="/civictrack-icon.png"
                alt="CivicTrack"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <Rocket className="w-9 h-9 text-[#0b63c5] hidden only:block" />
            </div>

            <div>
              <h2 className="text-3xl font-extrabold tracking-tight font-['DM_Sans'] text-white">
                CivicTrack
              </h2>
              <p className="text-xs text-white/80 leading-relaxed mt-2.5 max-w-[210px]">
                Sistem transparansi dan pemantauan proyek daerah secara akuntabel, inklusif, dan real-time.
              </p>
            </div>
          </div>

          {/* Bottom Left Footer */}
          <div className="relative z-10 text-[9.5px] text-white/60 tracking-wider font-mono uppercase">
            CIVICTRACK &bull; KABUPATEN LAMONGAN
          </div>

          {/* Fluffy Voluminous Vertical Cloud Border (3-Tier Layered Scallops) */}
          <svg
            className="absolute -right-0.5 top-0 bottom-0 h-full w-20 pointer-events-none z-20"
            viewBox="0 0 80 480"
            preserveAspectRatio="none"
          >
            {/* Layer 1: Outermost Translucent Sky Blue Cloud */}
            <path
              d="M80,0 L20,0 C5,25 0,65 15,95 C2,125 5,165 25,195 C0,225 2,275 22,305 C2,335 0,385 18,415 C5,445 15,470 30,480 L80,480 Z"
              fill="rgba(147, 197, 253, 0.4)"
            />
            {/* Layer 2: Middle Soft Cloud */}
            <path
              d="M80,0 L35,0 C20,25 15,65 30,95 C18,125 20,165 40,195 C15,225 18,275 38,305 C18,335 15,385 32,415 C20,445 28,470 45,480 L80,480 Z"
              fill="rgba(219, 234, 254, 0.65)"
            />
            {/* Layer 3: Foreground Solid White Cloud */}
            <path
              d="M80,0 L50,0 C35,25 30,65 45,95 C32,125 35,165 55,195 C30,225 32,275 52,305 C32,335 30,385 48,415 C35,445 42,470 60,480 L80,480 Z"
              fill="#ffffff"
            />
          </svg>
        </div>

        {/* ── 2. MOBILE TOP HEADER WITH HORIZONTAL CLOUD BORDER ── */}
        <div className="md:hidden relative bg-gradient-to-br from-[#0b5ec2] via-[#1272d7] to-[#258bf4] text-white p-6 pb-12 text-center overflow-hidden shrink-0 select-none">
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-xs font-medium text-white/80 mb-1">
              Welcome to
            </span>
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg p-2.5 my-1 ring-3 ring-white/20">
              <img
                src="/civictrack-icon.png"
                alt="CivicTrack"
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight font-['DM_Sans']">
              CivicTrack
            </h2>
            <p className="text-[11px] text-white/80 max-w-xs mt-0.5">
              Sistem Transparansi Pembangunan Daerah
            </p>
          </div>

          {/* Fluffy Horizontal Cloud Bottom Edge */}
          <svg
            className="absolute left-0 right-0 -bottom-0.5 w-full h-11 pointer-events-none z-20"
            viewBox="0 0 400 50"
            preserveAspectRatio="none"
          >
            <path
              d="M0,50 L0,30 C25,12 65,10 95,25 C125,5 165,8 195,28 C225,5 275,8 305,25 C335,10 375,12 400,28 L400,50 Z"
              fill="rgba(147, 197, 253, 0.4)"
            />
            <path
              d="M0,50 L0,38 C25,20 65,18 95,33 C125,15 165,18 195,36 C225,15 275,18 305,33 C335,20 375,22 400,36 L400,50 Z"
              fill="rgba(219, 234, 254, 0.65)"
            />
            <path
              d="M0,50 L0,44 C25,28 65,26 95,41 C125,23 165,26 195,44 C225,23 275,26 305,41 C335,28 375,30 400,44 L400,50 Z"
              fill="#ffffff"
            />
          </svg>
        </div>

        {/* ── 3. RIGHT PANEL: ELEGANT MINIMALIST FORM (UNDERLINE STYLE) ── */}
        <div className="flex-1 bg-white p-7 sm:p-10 flex flex-col justify-center overflow-y-auto">
          <div className="max-w-md w-full mx-auto">
            {/* Title */}
            <div className="mb-6">
              <h3 className="text-2xl sm:text-[26px] font-bold text-slate-800 tracking-tight font-['DM_Sans']">
                {mode === 'login' ? 'Masuk ke Akun' : 'Create your account'}
              </h3>
              {notice && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2">
                  {notice}
                </p>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name (Register Only) */}
              {mode === 'register' && (
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      className="w-full bg-transparent border-0 border-b-2 border-sky-200 focus:border-[#0b63c5] pb-2 pt-1 text-sm text-slate-800 placeholder:text-slate-300 outline-none transition-colors pr-7"
                    />
                    <Check className="w-4 h-4 text-sky-400 absolute right-1 bottom-2.5 opacity-80" />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contoh@civictrack.id"
                    className="w-full bg-transparent border-0 border-b-2 border-sky-200 focus:border-[#0b63c5] pb-2 pt-1 text-sm text-slate-800 placeholder:text-slate-300 outline-none transition-colors pr-7"
                  />
                  <Check className="w-4 h-4 text-sky-400 absolute right-1 bottom-2.5 opacity-80" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full bg-transparent border-0 border-b-2 border-sky-200 focus:border-[#0b63c5] pb-2 pt-1 text-sm text-slate-800 placeholder:text-slate-300 outline-none transition-colors pr-7"
                  />
                  <Check className="w-4 h-4 text-sky-400 absolute right-1 bottom-2.5 opacity-80" />
                </div>
              </div>

              {/* Role Selection (Register Only) */}
              {mode === 'register' && (
                <div>
                  <label htmlFor="role" className="block text-xs font-bold text-slate-700 mb-1">
                    Peran Akun
                  </label>
                  <div className="relative">
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full bg-transparent border-0 border-b-2 border-sky-200 focus:border-[#0b63c5] pb-2 pt-1 text-xs sm:text-sm text-slate-800 outline-none transition-colors cursor-pointer pr-7"
                    >
                      <option value="warga">1. Warga Masyarakat (Partisipasi, Pantau &amp; Lapor)</option>
                      <option value="aparatur_pemerintah">2. Aparatur Pemerintah (Monitoring Eksekutif &amp; Wilayah)</option>
                      <option value="penanggung_jawab">3. Penanggung Jawab Proyek (Kelola Proyek &amp; Tanggapi Aduan)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Terms Checkbox */}
              <div className="flex items-center gap-2 pt-1.5">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0b63c5] border-slate-300 focus:ring-[#0b63c5] cursor-pointer"
                />
                <label htmlFor="terms" className="cursor-pointer select-none text-[11px] sm:text-xs text-slate-600">
                  Saya menyetujui <span className="text-[#0b63c5] font-semibold hover:underline">Ketentuan &amp; Kebijakan Privasi</span>
                </label>
              </div>

              {/* Action Buttons: Pill Sign Up / Sign In */}
              <div className="pt-3 flex flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={isLoading || !agreeTerms}
                  className="px-7 py-2.5 rounded-full bg-gradient-to-r from-[#0b63c5] to-[#1e85eb] hover:from-[#0952a5] hover:to-[#176fc6] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
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
                  className="px-7 py-2.5 rounded-full border border-slate-300 hover:border-[#0b63c5] text-slate-600 hover:text-[#0b63c5] hover:bg-slate-50 font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer text-center"
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
