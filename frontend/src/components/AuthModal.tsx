import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, AlertCircle, Loader2 } from 'lucide-react';
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
      // If server returned specific invalid credentials
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
    let targetEmail = 'budi.santoso@gmail.com';
    if (demoRole === 'penanggung_jawab') targetEmail = 'admin.pu@bojonegoro.go.id';
    if (demoRole === 'aparatur_pemerintah') targetEmail = 'pimpinan.pu@bojonegoro.go.id';

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
            nama: 'Ir. Hendro Wijaya, S.T.',
            email: 'penanggungjawab.pu@bojonegoro.go.id',
            role: 'penanggung_jawab',
            nama_dinas: 'Dinas PUPR / Tim Pelaksana Proyek',
            nip: '19780412 200312 1 004',
            dinas_id: 1,
          };
          break;
        case 'aparatur_pemerintah':
          demoUser = {
            id: 2,
            nama: 'Drs. H. M. Fauzi, M.Si',
            email: 'aparatur.pemerintah@bojonegoro.go.id',
            role: 'aparatur_pemerintah',
            nama_dinas: 'Sekretariat Daerah & Bappeda',
            nip: '19690815 199403 1 002',
          };
          break;
        case 'warga':
        default:
          demoUser = {
            id: 3,
            nama: 'Budi Santoso',
            email: 'budi.santoso@gmail.com',
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
    <div className="fixed inset-0 z-[2200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-[#DCE0E6] relative">
        {/* Header */}
        <div className="bg-[#184C78] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center mb-3">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-['DM_Sans'] text-xl font-bold">
            {mode === 'login' ? 'Masuk ke CivicTrack' : 'Buat Akun Baru'}
          </h3>
          <p className="text-xs text-white/70 mt-1">
            {mode === 'login'
              ? 'Akses laporan, langganan proyek, dan monitoring pembangunan daerah'
              : 'Daftarkan diri untuk memantau transparansi pembangunan daerah'}
          </p>
        </div>

        {/* Optional Context Notice Banner */}
        {notice && (
          <div className="bg-[#EBF4FB] border-b border-[#c5def2] px-5 py-2.5 flex items-center gap-2 text-xs font-semibold text-[#184C78]">
            <span className="w-2 h-2 rounded-full bg-[#2980B9] animate-ping" />
            <span>{notice}</span>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex border-b border-[#DCE0E6] bg-[#F5F7FA]">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-xs font-bold font-['DM_Sans'] transition-colors ${
              mode === 'login'
                ? 'bg-white text-[#184C78] border-b-2 border-[#184C78]'
                : 'text-[#6C757D] hover:text-[#184C78]'
            }`}
          >
            Masuk
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-3 text-xs font-bold font-['DM_Sans'] transition-colors ${
              mode === 'register'
                ? 'bg-white text-[#184C78] border-b-2 border-[#184C78]'
                : 'text-[#6C757D] hover:text-[#184C78]'
            }`}
          >
            Daftar
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#184C78] mb-1.5">Nama Lengkap</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#6C757D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-[#DCE0E6] rounded-lg focus:border-[#2980B9] outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#184C78] mb-1.5">Alamat Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#6C757D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#DCE0E6] rounded-lg focus:border-[#2980B9] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#184C78] mb-1.5">Kata Sandi</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#6C757D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#DCE0E6] rounded-lg focus:border-[#2980B9] outline-none"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#184C78] mb-1.5">Peran Akun</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-[#DCE0E6] rounded-lg focus:border-[#2980B9] outline-none bg-white text-[#212529]"
              >
                <option value="warga">1. Warga Masyarakat (Partisipasi, Pantau &amp; Lapor)</option>
                <option value="aparatur_pemerintah">2. Aparatur Pemerintah (Monitoring Eksekutif &amp; Wilayah)</option>
                <option value="penanggung_jawab">3. Penanggung Jawab Proyek (Kelola Proyek &amp; Tanggapi Aduan)</option>
              </select>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-[#184C78] hover:bg-[#0f3252] disabled:opacity-70 text-white font-bold rounded-lg text-sm transition-colors shadow-sm mt-2 cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{mode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun'}</span>
          </button>
        </form>

        {/* Quick Demo Login Preset (3 Roles) */}
        <div className="px-6 pb-6 pt-2 border-t border-[#DCE0E6] bg-[#F5F7FA]">
          <div className="text-[11px] font-bold text-[#6C757D] uppercase tracking-wider mb-2.5">
            ⚡ Quick Demo Login (3 Role):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin('warga')}
              className="px-2.5 py-2 bg-white border border-[#DCE0E6] rounded-lg text-xs font-semibold text-[#184C78] hover:border-[#2980B9] hover:bg-[#EBF4FB] text-left transition-colors cursor-pointer shadow-2xs"
            >
              👤 Warga
              <div className="text-[10px] text-[#6C757D] font-normal truncate">Budi Santoso</div>
            </button>
            <button
              onClick={() => handleQuickLogin('aparatur_pemerintah')}
              className="px-2.5 py-2 bg-white border border-[#DCE0E6] rounded-lg text-xs font-semibold text-[#184C78] hover:border-[#2980B9] hover:bg-[#EBF4FB] text-left transition-colors cursor-pointer shadow-2xs"
            >
              🏛️ Aparatur Pemda
              <div className="text-[10px] text-[#6C757D] font-normal truncate">Eksekutif / Bappeda</div>
            </button>
            <button
              onClick={() => handleQuickLogin('penanggung_jawab')}
              className="px-2.5 py-2 bg-white border border-[#DCE0E6] rounded-lg text-xs font-semibold text-[#184C78] hover:border-[#2980B9] hover:bg-[#EBF4FB] text-left transition-colors cursor-pointer shadow-2xs"
            >
              👷 Penanggung Jawab
              <div className="text-[10px] text-[#6C757D] font-normal truncate">Dinas PUPR / Pelaksana</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
