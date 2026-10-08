import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle, Loader2, Check, Rocket } from 'lucide-react';
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
      console.warn('Backend login warning, falling back to local session:', err.message);
      if (err.message && (err.message.includes('tidak valid') || err.message.includes('terdaftar'))) {
        setErrorMsg(err.message);
      } else {
        // Fallback for seamless demo
        const loggedUser: UserProfile = {
          id: Math.floor(Math.random() * 1000) + 1,
          nama: name || (email.split('@')[0] || 'Pengguna'),
          email: email || 'user@civictrack.id',
          role: role,
        };
        onLoginSuccess(loggedUser);
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoRole: 'warga' | 'aparatur_pemerintah' | 'penanggung_jawab') => {
    setIsLoading(true);
    setErrorMsg(null);
    let targetEmail = 'budi.santoso@civictrack.demo';
    if (demoRole === 'penanggung_jawab') targetEmail = 'admin.pu@civictrack.demo';
    if (demoRole === 'aparatur_pemerintah') targetEmail = 'pimpinan.pu@civictrack.demo';

    try {
      const res = await apiService.login(targetEmail, 'password123');
      onLoginSuccess(res.user);
      onClose();
    } catch (err) {
      console.warn('Quick login fallback:', err);
      let demoUser: UserProfile;
      switch (demoRole) {
        case 'penanggung_jawab':
          demoUser = {
            id: 1,
            nama: 'Bambang Suryono, S.T.',
            email: 'admin.pu@civictrack.demo',
            role: 'penanggung_jawab',
            nama_dinas: 'Dinas PU Bina Marga Lamongan',
            nip: '19780412 200312 1 004',
            dinas_id: 1,
          };
          break;
        case 'aparatur_pemerintah':
          demoUser = {
            id: 2,
            nama: 'Drs. Joko Prasetyo, M.Si',
            email: 'pimpinan.pu@civictrack.demo',
            role: 'aparatur_pemerintah',
            nama_dinas: 'Sekretariat Daerah & Bappeda Lamongan',
            nip: '19690815 199403 1 002',
          };
          break;
        case 'warga':
        default:
          demoUser = {
            id: 3,
            nama: 'Budi Santoso',
            email: 'budi.santoso@civictrack.demo',
            role: 'warga',
            telepon: '081234567890',
          };
          break;
      }
      onLoginSuccess(demoUser);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2200] flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-100 overflow-hidden relative flex flex-col md:flex-row my-auto max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Tutup dialog"
          className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-slate-100/80 hover:bg-slate-200/90 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer shadow-xs"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── LEFT PANEL: DESKTOP BRANDING WITH CLOUD SCALLOPED EDGE ── */}
        <div className="hidden md:flex flex-col justify-between w-[40%] bg-gradient-to-br from-[#0b63c5] via-[#1272d7] to-[#1e85eb] text-white p-8 relative overflow-hidden shrink-0 select-none">
          {/* Decorative ambient bubbles */}
          <div className="absolute -top-12 -left-12 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute bottom-16 -left-10 w-36 h-36 rounded-full bg-blue-300/15 blur-lg pointer-events-none" />

          {/* Top branding content */}
          <div className="relative z-10 space-y-4 my-auto">
            <div className="text-sm font-semibold tracking-wide text-white/90">
              Welcome to
            </div>

            {/* Circular Logo Badge */}
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl p-3 mx-0 ring-4 ring-white/20 transition-transform hover:scale-105">
              <img
                src="/civictrack-icon.png"
                alt="CivicTrack"
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback if image not rendered
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <Rocket className="w-8 h-8 text-[#0b63c5] hidden only:block" />
            </div>

            <div>
              <h2 className="text-3xl font-extrabold tracking-tight font-['DM_Sans']">
                CivicTrack
              </h2>
              <p className="text-xs text-white/80 leading-relaxed mt-2.5 max-w-xs font-normal">
                Platform resmi transparansi, partisipasi warga, dan akuntabilitas pembangunan infrastruktur Kabupaten Lamongan.
              </p>
            </div>

            {/* Feature Highlights Pills */}
            <div className="pt-2 space-y-1.5 text-[11px] text-white/90 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                <span>Peta Interaktif 27 Kecamatan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                <span>Rekomendasi Rute AI &amp; Aduan Real-Time</span>
              </div>
            </div>
          </div>

          {/* Bottom badge */}
          <div className="relative z-10 pt-6 border-t border-white/15 flex items-center justify-between text-[10px] text-white/70 font-mono">
            <span>KABUPATEN LAMONGAN</span>
            <span>PROYEK APBD 2026</span>
          </div>

          {/* Fluffy Vertical Cloud Scallop SVG (matches user reference image) */}
          <svg
            className="absolute right-0 top-0 bottom-0 h-full w-9 pointer-events-none z-10"
            viewBox="0 0 36 400"
            preserveAspectRatio="none"
          >
            {/* Darker translucent blue cloud layer */}
            <path
              d="M36,0 L20,0 C8,25 12,50 24,70 C10,95 12,130 26,150 C8,175 10,210 24,230 C8,255 12,295 26,315 C10,335 12,370 26,385 L36,400 Z"
              fill="rgba(255,255,255,0.2)"
            />
            {/* Lighter translucent cloud layer */}
            <path
              d="M36,0 L26,0 C14,25 18,50 30,70 C16,95 18,130 32,150 C14,175 16,210 30,230 C14,255 18,295 32,315 C16,335 18,370 32,385 L36,400 Z"
              fill="rgba(255,255,255,0.4)"
            />
            {/* Solid White cloud scallop cutting into the blue background */}
            <path
              d="M36,0 L32,0 C20,25 24,50 34,70 C22,95 24,130 35,150 C20,175 22,210 34,230 C20,255 24,295 35,315 C22,335 24,370 35,385 L36,400 Z"
              fill="#ffffff"
            />
          </svg>
        </div>

        {/* ── TOP BANNER: MOBILE VIEW WITH CLOUD SCALLOPED BOTTOM EDGE ── */}
        <div className="md:hidden relative bg-gradient-to-br from-[#0b63c5] via-[#1272d7] to-[#1e85eb] text-white p-5 pb-9 text-center overflow-hidden shrink-0 select-none">
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-[11px] font-medium text-white/80 mb-1">
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
              Transparansi &amp; Akuntabilitas Pembangunan Daerah
            </p>
          </div>

          {/* Fluffy Horizontal Cloud Scallop SVG on Mobile Bottom */}
          <svg
            className="absolute bottom-0 left-0 right-0 w-full h-6 pointer-events-none z-10"
            viewBox="0 0 375 24"
            preserveAspectRatio="none"
          >
            {/* Layer 1: translucent */}
            <path
              d="M0,24 L0,12 C25,2 50,4 75,14 C100,2 135,4 160,14 C185,2 220,4 245,13 C270,2 305,4 330,13 C350,4 365,6 375,12 L375,24 Z"
              fill="rgba(255,255,255,0.25)"
            />
            {/* Layer 2: translucent */}
            <path
              d="M0,24 L0,16 C30,6 55,8 80,18 C105,6 140,8 165,18 C190,5 225,8 250,17 C275,6 310,8 335,17 C355,7 368,9 375,15 L375,24 Z"
              fill="rgba(255,255,255,0.45)"
            />
            {/* Layer 3: Solid white merging into form */}
            <path
              d="M0,24 L0,20 C35,10 60,12 85,21 C110,10 145,12 170,21 C195,9 230,12 255,20 C280,10 315,12 340,20 C360,11 370,12 375,18 L375,24 Z"
              fill="#ffffff"
            />
          </svg>
        </div>

        {/* ── RIGHT PANEL: FORM CONTENT ── */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Notice Banner */}
            {notice && (
              <div className="mb-4 bg-sky-50 border border-sky-200 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold text-[#0b63c5] animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-[#1272d7] animate-ping" />
                <span>{notice}</span>
              </div>
            )}

            {/* Header Titles */}
            <div className="mb-5">
              <h3 className="font-['DM_Sans'] text-2xl font-bold text-slate-800 tracking-tight">
                {mode === 'login' ? 'Masuk ke Akun Anda' : 'Buat Akun Baru'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {mode === 'login'
                  ? 'Masukkan email dan kata sandi Anda untuk mengakses portal CivicTrack.'
                  : 'Daftarkan data Anda untuk berpartisipasi dan memantau proyek pembangunan.'}
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div role="alert" className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            {/* The Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Field: Name (Register only) */}
              {mode === 'register' && (
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm border-b-2 border-slate-200 focus:border-[#1272d7] bg-slate-50/50 hover:bg-slate-50 focus:bg-white rounded-t-lg transition-colors outline-none"
                    />
                    {name.length >= 3 && (
                      <Check className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    )}
                  </div>
                </div>
              )}

              {/* Field: Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm border-b-2 border-slate-200 focus:border-[#1272d7] bg-slate-50/50 hover:bg-slate-50 focus:bg-white rounded-t-lg transition-colors outline-none"
                  />
                  {email.includes('@') && email.includes('.') && (
                    <Check className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  )}
                </div>
              </div>

              {/* Field: Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm border-b-2 border-slate-200 focus:border-[#1272d7] bg-slate-50/50 hover:bg-slate-50 focus:bg-white rounded-t-lg transition-colors outline-none"
                  />
                  {password.length >= 6 && (
                    <Check className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  )}
                </div>
              </div>

              {/* Field: Role (Register only) */}
              {mode === 'register' && (
                <div>
                  <label htmlFor="role" className="block text-xs font-semibold text-slate-700 mb-1">
                    Peran Akun
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-[#1272d7] outline-none bg-white text-slate-800"
                  >
                    <option value="warga">1. Warga Masyarakat (Partisipasi, Pantau &amp; Lapor)</option>
                    <option value="aparatur_pemerintah">2. Aparatur Pemerintah (Monitoring Eksekutif &amp; Wilayah)</option>
                    <option value="penanggung_jawab">3. Penanggung Jawab Proyek (Kelola Proyek &amp; Tanggapi Aduan)</option>
                  </select>
                </div>
              )}

              {/* Checkbox: Terms & Conditions (as shown in reference image) */}
              <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1272d7] border-slate-300 focus:ring-[#1272d7] cursor-pointer"
                />
                <label htmlFor="terms" className="cursor-pointer select-none text-[11px] sm:text-xs text-slate-600">
                  Saya menyetujui <span className="text-[#0b63c5] font-semibold hover:underline">Ketentuan &amp; Kebijakan Privasi</span>
                </label>
              </div>

              {/* Action Buttons: Pill Sign Up / Sign In (matches reference) */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={isLoading || !agreeTerms}
                  className="w-full sm:w-auto flex-1 py-2.5 px-6 rounded-full bg-gradient-to-r from-[#0b63c5] to-[#1e85eb] hover:from-[#0952a5] hover:to-[#176fc6] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{mode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setErrorMsg(null);
                  }}
                  className="w-full sm:w-auto py-2.5 px-6 rounded-full border border-[#0b63c5] text-[#0b63c5] hover:bg-[#EBF4FB] font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer text-center"
                >
                  {mode === 'login' ? 'Daftar Akun Baru' : 'Masuk ke Akun'}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Demo Login Preset (3 Roles) */}
          <div className="mt-5 pt-3.5 border-t border-slate-100">
            <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <span>⚡ Quick Demo Login (3 Role):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('warga')}
                className="px-3 py-2 bg-slate-50 hover:bg-[#EBF4FB] border border-slate-200/80 hover:border-[#1272d7] rounded-xl text-left transition-all duration-150 cursor-pointer shadow-2xs group"
              >
                <div className="text-xs font-semibold text-slate-800 group-hover:text-[#0b63c5] flex items-center gap-1.5">
                  <span>👤</span>
                  <span>Warga</span>
                </div>
                <div className="text-[10px] text-slate-500 font-normal truncate mt-0.5">
                  Budi Santoso
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('aparatur_pemerintah')}
                className="px-3 py-2 bg-slate-50 hover:bg-[#EBF4FB] border border-slate-200/80 hover:border-[#1272d7] rounded-xl text-left transition-all duration-150 cursor-pointer shadow-2xs group"
              >
                <div className="text-xs font-semibold text-slate-800 group-hover:text-[#0b63c5] flex items-center gap-1.5">
                  <span>🏛️</span>
                  <span>Aparatur Pemda</span>
                </div>
                <div className="text-[10px] text-slate-500 font-normal truncate mt-0.5">
                  Eksekutif / Bappeda
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('penanggung_jawab')}
                className="px-3 py-2 bg-slate-50 hover:bg-[#EBF4FB] border border-slate-200/80 hover:border-[#1272d7] rounded-xl text-left transition-all duration-150 cursor-pointer shadow-2xs group"
              >
                <div className="text-xs font-semibold text-slate-800 group-hover:text-[#0b63c5] flex items-center gap-1.5">
                  <span>👷</span>
                  <span>Penanggung Jawab</span>
                </div>
                <div className="text-[10px] text-slate-500 font-normal truncate mt-0.5">
                  Dinas PUPR / Pelaksana
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
