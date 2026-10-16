import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Check,
  Shield,
  Briefcase,
  HelpCircle,
} from 'lucide-react';
import { CivicTrackLogo } from './CivicTrackLogo';
import { apiService } from '../services/api';
import type { UserProfile, UserRole } from '../types';

interface LoginPageProps {
  initialMode?: 'login' | 'register';
  notice?: string;
  onLoginSuccess: (user: UserProfile) => void;
  onBackToHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  initialMode = 'login',
  notice,
  onLoginSuccess,
  onBackToHome,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('warga');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState<string | null>(null);

  // Slides data for the left hero carousel
  const slides = [
    {
      title: 'Welcome!',
      subtitle:
        'Pantau realisasi APBD dan progres pembangunan daerah secara transparan, partisipatif, dan akuntabel bersama CivicTrack.',
    },
    {
      title: 'Smart AI Routing',
      subtitle:
        'Hindari kemacetan akibat pengerjaan proyek jalan dengan analisis rute cerdas dan rekomendasi jalur alternatif otomatis.',
    },
    {
      title: 'Partisipasi Warga',
      subtitle:
        'Laporkan kendala fisik di lapangan, verifikasi transparansi anggaran, dan kawal pembangunan kota secara kolaboratif.',
    },
  ];

  // Auto-advance carousel slide every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setForgotPasswordNotice(null);

    try {
      if (mode === 'login') {
        const res = await apiService.login(email.trim(), password);
        try {
          if (rememberMe) {
            localStorage.setItem('civictrack_remember_email', email.trim());
          } else {
            localStorage.removeItem('civictrack_remember_email');
          }
        } catch {
          // ignore localStorage error in restricted environments
        }
        onLoginSuccess(res.user);
      } else {
        if (!agreeTerms) {
          setErrorMsg('Harap setujui Syarat & Ketentuan untuk melanjutkan pendaftaran.');
          setIsLoading(false);
          return;
        }
        const res = await apiService.register(name.trim(), email.trim(), password, role);
        onLoginSuccess(res.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses permintaan.');
    } finally {
      setIsLoading(false);
    }
  };

  // Restore remembered email if available
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('civictrack_remember_email');
      if (savedEmail && !email) {
        setEmail(savedEmail);
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white selection:bg-[#184C78] selection:text-white">
      {/* ─────────────────────────────────────────────────────────────
          LEFT PANEL: SIGNATURE CIVIC NAVY (#184C78) MATCHING LANDING PAGE
          ───────────────────────────────────────────────────────────── */}
      <section
        aria-label="Informasi CivicTrack"
        className="w-full lg:w-1/2 bg-[#184C78] text-white flex flex-col justify-between p-8 sm:p-12 lg:p-16 relative overflow-hidden select-none min-h-[460px] lg:min-h-screen"
      >
        {/* Subtle Decorative Background Radial Glows */}
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[rgba(41,128,185,0.25)] blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-[#0f3252]/70 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* 1. TOP HEADER: BRAND LOGO */}
        <div className="relative z-10 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg p-1"
            title="Kembali ke Beranda"
          >
            <CivicTrackLogo size="lg" theme="dark" subtitle="Kabupaten Lamongan" />
          </button>

          {/* Quick return button on mobile */}
          <button
            type="button"
            onClick={onBackToHome}
            className="lg:hidden inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Beranda</span>
          </button>
        </div>

        {/* 2. CENTER: VECTOR ILLUSTRATION (CLIPBOARD + CHECKLIST + PEN) */}
        <div className="relative z-10 my-8 lg:my-auto flex items-center justify-center">
          <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-square flex items-center justify-center">
            {/* Background layered cloud/pill bubble elements */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 400 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Soft blue back cloud shapes */}
              <rect x="30" y="140" width="160" height="48" rx="24" fill="white" fillOpacity="0.12" />
              <rect x="210" y="160" width="160" height="40" rx="20" fill="white" fillOpacity="0.14" />
              <rect x="180" y="210" width="180" height="44" rx="22" fill="white" fillOpacity="0.18" />
              <circle cx="340" cy="120" r="8" fill="white" fillOpacity="0.3" />
              <circle cx="60" cy="220" r="12" fill="white" fillOpacity="0.2" />
              <circle cx="365" cy="265" r="10" fill="white" fillOpacity="0.25" />
              <circle cx="110" cy="110" r="5" fill="white" fillOpacity="0.35" />
            </svg>

            {/* Main Clipboard Container */}
            <div className="relative z-10 transform -rotate-3 hover:rotate-0 transition-transform duration-500 ease-out">
              {/* Dark Backing Board (Deep Navy) */}
              <div className="w-[200px] sm:w-[220px] h-[260px] sm:h-[285px] bg-[#0f2e4a] rounded-[24px] p-2.5 shadow-2xl relative border-2 border-white/20">
                {/* Top Clip (Civic Blue) */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-24 h-7 bg-[#2980B9] rounded-t-lg rounded-b-md flex items-center justify-center shadow-md">
                  <div className="w-10 h-2 bg-[#0f2e4a]/40 rounded-full" />
                </div>

                {/* White Paper Sheet */}
                <div className="w-full h-full bg-white rounded-[18px] p-4 pt-6 flex flex-col justify-between shadow-inner">
                  {/* Item 1: Checkmark */}
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#EBF4FB] border border-[#2980B9]/40 flex items-center justify-center text-[#184C78] shrink-0">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2 bg-[#184C78]/90 rounded-full w-full" />
                      <div className="h-1.5 bg-[#2980B9]/60 rounded-full w-4/5" />
                      <div className="h-1.5 bg-[#c5def2] rounded-full w-1/2" />
                    </div>
                  </div>

                  {/* Item 2: Cross indicator */}
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#EBF4FB] border border-[#2980B9]/40 flex items-center justify-center text-[#184C78] shrink-0 font-bold text-xs">
                      ✕
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2 bg-[#184C78]/80 rounded-full w-5/6" />
                      <div className="h-1.5 bg-[#2980B9]/50 rounded-full w-3/4" />
                      <div className="h-1.5 bg-[#c5def2] rounded-full w-2/3" />
                    </div>
                  </div>

                  {/* Item 3: Checkmark */}
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#EBF4FB] border border-[#2980B9]/40 flex items-center justify-center text-[#184C78] shrink-0">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2 bg-[#184C78]/90 rounded-full w-full" />
                      <div className="h-1.5 bg-[#2980B9]/60 rounded-full w-2/3" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Angled Stylus Pen beside Clipboard (Civic Navy & Civic Blue) */}
              <div className="absolute -bottom-4 -left-6 sm:-left-8 w-11 h-32 sm:h-36 transform -rotate-45 drop-shadow-xl pointer-events-none">
                {/* Pen Body */}
                <div className="w-full h-full relative flex flex-col items-center">
                  {/* Top Cap */}
                  <div className="w-7 h-8 bg-[#0a1e30] rounded-t-md" />
                  {/* Grip ring */}
                  <div className="w-8 h-4 bg-[#061420]" />
                  {/* Main Shaft with highlight */}
                  <div className="w-7 flex-1 bg-gradient-to-r from-[#184C78] via-[#2980B9] to-[#3ca5e8] flex flex-col items-center justify-center">
                    <div className="w-1.5 h-12 bg-white/40 rounded-full" />
                  </div>
                  {/* Nib base */}
                  <div className="w-7 h-3 bg-[#0a1e30]" />
                  {/* Tip Point */}
                  <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[18px] border-t-[#061420]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. BOTTOM: WELCOME HEADING, SUBTITLE & CAROUSEL DOTS */}
        <div className="relative z-10 max-w-lg">
          <h1 className="text-3xl sm:text-4xl font-bold font-['DM_Sans'] tracking-tight text-white mb-3">
            {slides[activeSlide].title}
          </h1>
          <p className="text-white/85 text-sm sm:text-[15px] leading-relaxed mb-6 font-normal min-h-[44px]">
            {slides[activeSlide].subtitle}
          </p>

          {/* 3 Carousel Dots (Interactive) */}
          <div className="flex items-center gap-2.5" role="tablist" aria-label="Slides informasi">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={activeSlide === idx}
                aria-label={`Lihat slide ${idx + 1}`}
                onClick={() => setActiveSlide(idx)}
                className={`transition-all duration-300 cursor-pointer rounded-full h-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  activeSlide === idx
                    ? 'w-7 bg-white shadow-sm'
                    : 'w-2.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT PANEL: CLEAN MINIMALIST UNDERLINE FORM (MATCHES MOCKUP)
          ───────────────────────────────────────────────────────────── */}
      <main className="w-full lg:w-1/2 bg-white flex flex-col justify-between p-8 sm:p-12 lg:p-16 min-h-[500px]">
        {/* Top bar with Back button on desktop */}
        <div className="hidden lg:flex items-center justify-between w-full max-w-md mx-auto">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#184C78] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-[#184C78]" />
            <span>Kembali ke Beranda CivicTrack</span>
          </button>

          <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase">
            PORTAL LOGIN RESMI
          </span>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-6">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold font-['DM_Sans'] text-[#184C78] tracking-tight mb-2">
              {mode === 'login' ? 'Log In' : 'Create an Account'}
            </h2>

            <div className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
              <span>{mode === 'login' ? "Don't have an account?" : 'Sudah memiliki akun?'}</span>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setErrorMsg(null);
                  setForgotPasswordNotice(null);
                }}
                className="text-[#2980B9] hover:text-[#184C78] font-semibold hover:underline cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#184C78] rounded px-0.5"
              >
                {mode === 'login' ? 'Create an account' : 'Masuk sekarang'}
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-1">
              It will take less than a minute.
            </p>
          </div>

          {/* Notice Alert (e.g., redirected from dashboard) */}
          {notice && (
            <div
              role="status"
              className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 mb-6 animate-fade-in"
            >
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          {/* Error Alert */}
          {errorMsg && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 mb-6 animate-fade-in"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Forgot Password Feedback Notice */}
          {forgotPasswordNotice && (
            <div
              role="status"
              className="p-3 rounded-lg bg-[#EBF4FB] border border-[#c5def2] text-[#184C78] text-xs flex items-center gap-2 mb-6 animate-fade-in"
            >
              <HelpCircle className="w-4 h-4 text-[#184C78] shrink-0" />
              <span>{forgotPasswordNotice}</span>
            </div>
          )}

          {/* ── THE FORM ── */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name (Register Mode Only) */}
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="input-name"
                  className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1"
                >
                  Nama Lengkap
                </label>
                <div className="border-b border-slate-300 focus-within:border-[#184C78] flex items-center justify-between pb-2 transition-colors">
                  <input
                    id="input-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama lengkap Anda"
                    autoComplete="name"
                    className="w-full bg-transparent border-none outline-none text-[15px] text-slate-800 placeholder:text-slate-400"
                  />
                  <User className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
                </div>
              </div>
            )}

            {/* Username / Email */}
            <div>
              <label
                htmlFor="input-email"
                className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1"
              >
                {mode === 'login' ? 'Username / Email' : 'Alamat Email'}
              </label>
              <div className="border-b border-slate-300 focus-within:border-[#184C78] flex items-center justify-between pb-2 transition-colors">
                <input
                  id="input-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={mode === 'login' ? 'Username' : 'nama@email.com'}
                  autoComplete="email"
                  className="w-full bg-transparent border-none outline-none text-[15px] text-slate-800 placeholder:text-slate-400"
                />
                {mode === 'login' ? (
                  <User className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
                ) : (
                  <Mail className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="input-password"
                className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1"
              >
                Password
              </label>
              <div className="border-b border-slate-300 focus-within:border-[#184C78] flex items-center justify-between pb-2 transition-colors">
                <input
                  id="input-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full bg-transparent border-none outline-none text-[15px] text-slate-800 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  className="text-slate-400 hover:text-slate-600 shrink-0 ml-2 focus:outline-none cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : mode === 'login' ? (
                    <Lock className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Role Selector (Register Mode Only) */}
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="select-role"
                  className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1"
                >
                  Peran Akun
                </label>
                <div className="border-b border-slate-300 focus-within:border-[#184C78] flex items-center justify-between pb-2 transition-colors">
                  <select
                    id="select-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-transparent border-none outline-none text-[14px] text-slate-800 cursor-pointer"
                  >
                    <option value="warga">1. Warga Masyarakat (Partisipasi &amp; Pantau)</option>
                    <option value="aparatur_pemerintah">2. Aparatur Pemerintah (Monitoring Eksekutif)</option>
                    <option value="penanggung_jawab">3. Penanggung Jawab Proyek (Kelola Proyek)</option>
                  </select>
                  {role === 'warga' ? (
                    <User className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
                  ) : role === 'aparatur_pemerintah' ? (
                    <Shield className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
                  ) : (
                    <Briefcase className="w-5 h-5 text-slate-400 shrink-0 ml-2" />
                  )}
                </div>
              </div>
            )}

            {/* Agreement for Register Mode */}
            {mode === 'register' && (
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="checkbox-terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-[#184C78] border-slate-300 focus:ring-[#184C78] cursor-pointer"
                />
                <label
                  htmlFor="checkbox-terms"
                  className="text-xs text-slate-600 leading-normal select-none cursor-pointer"
                >
                  Saya menyetujui Ketentuan Layanan dan Kebijakan Privasi Keterbukaan Informasi Publik
                  Kabupaten Lamongan.
                </label>
              </div>
            )}

            {/* ── ACTION ROW: SIGN IN BUTTON + REMEMBER PASSWORD (MATCHES MOCKUP) ── */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="h-11 px-8 rounded-lg bg-[#184C78] hover:bg-[#12395b] text-white font-semibold text-sm shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#184C78] focus-visible:ring-offset-2 shrink-0 min-w-[120px]"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{mode === 'login' ? 'Sign in' : 'Sign up'}</span>
              </button>

              {/* Remember Password Checkbox (In Login Mode) */}
              {mode === 'login' && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="checkbox-remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#184C78] border-slate-300 focus:ring-[#184C78] cursor-pointer"
                  />
                  <label
                    htmlFor="checkbox-remember"
                    className="text-xs sm:text-sm text-slate-600 select-none cursor-pointer"
                  >
                    Remember password
                  </label>
                </div>
              )}
            </div>

            {/* Forget your password? Link (Matches mockup below the button row) */}
            {mode === 'login' && (
              <div className="pt-2 text-center sm:text-right">
                <button
                  type="button"
                  onClick={() => {
                    setForgotPasswordNotice(
                      'Untuk reset kata sandi, silakan hubungi administrator dinas terkait di halo@civictrack.lamongankab.go.id atau gunakan email dinas terdaftar.'
                    );
                  }}
                  className="text-xs sm:text-sm font-medium text-[#2980B9] hover:text-[#184C78] hover:underline cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#184C78] rounded px-1"
                >
                  Forget your password?
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400 py-2">
          &copy; 2026 CivicTrack Kabupaten Lamongan. Transparansi &amp; Akuntabilitas Publik.
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
