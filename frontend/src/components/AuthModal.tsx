import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield } from 'lucide-react';
import type { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'register';
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'warga' | 'admin_dinas' | 'pimpinan_instansi' | 'media_peneliti'>('warga');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login / register with realistic user
    const loggedUser: UserProfile = {
      id: Math.floor(Math.random() * 1000) + 1,
      nama: name || (email.split('@')[0] || 'Pengguna'),
      email: email || 'user@civictrack.id',
      role: role,
    };
    onLoginSuccess(loggedUser);
    onClose();
  };

  const handleQuickLogin = (demoRole: 'admin' | 'pimpinan' | 'warga' | 'peneliti') => {
    let demoUser: UserProfile;
    switch (demoRole) {
      case 'admin':
        demoUser = {
          id: 1,
          nama: 'Ir. Hendro Wijaya',
          email: 'admin.pu@bojonegoro.go.id',
          role: 'admin_dinas',
          dinas_id: 1,
        };
        break;
      case 'pimpinan':
        demoUser = {
          id: 2,
          nama: 'Drs. H. M. Fauzi, M.Si',
          email: 'pimpinan.pu@bojonegoro.go.id',
          role: 'pimpinan_instansi',
        };
        break;
      case 'peneliti':
        demoUser = {
          id: 4,
          nama: 'Dr. Rahmat Hidayat',
          email: 'rahmat.peneliti@unair.ac.id',
          role: 'media_peneliti',
        };
        break;
      case 'warga':
      default:
        demoUser = {
          id: 3,
          nama: 'Budi Santoso',
          email: 'budi.santoso@gmail.com',
          role: 'warga',
        };
        break;
    }
    onLoginSuccess(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
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
              ? 'Akses laporan, langganan proyek, dan fitur partisipasi warga'
              : 'Daftarkan diri untuk memantau transparansi pembangunan daerah'}
          </p>
        </div>

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
                <option value="warga">Warga Masyarakat</option>
                <option value="media_peneliti">Media / Akademisi / Peneliti</option>
                <option value="admin_dinas">Admin Dinas (Instansi Teknis)</option>
                <option value="pimpinan_instansi">Pimpinan Instansi (Monitoring)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-[#184C78] hover:bg-[#0f3252] text-white font-bold rounded-lg text-sm transition-colors shadow-sm mt-2"
          >
            {mode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun'}
          </button>
        </form>

        {/* Quick Demo Login Preset (Helpful for quick testing) */}
        <div className="px-6 pb-6 pt-1 border-t border-[#DCE0E6] bg-[#F5F7FA]">
          <div className="text-[11px] font-bold text-[#6C757D] uppercase tracking-wider mb-2.5">
            ⚡ Quick Demo Login (Siap Pakai dari Backend Seed):
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('warga')}
              className="px-2.5 py-1.5 bg-white border border-[#DCE0E6] rounded-lg text-xs font-semibold text-[#184C78] hover:border-[#2980B9] hover:bg-[#EBF4FB] text-left transition-colors"
            >
              👤 Warga (Budi)
            </button>
            <button
              onClick={() => handleQuickLogin('admin')}
              className="px-2.5 py-1.5 bg-white border border-[#DCE0E6] rounded-lg text-xs font-semibold text-[#184C78] hover:border-[#2980B9] hover:bg-[#EBF4FB] text-left transition-colors"
            >
              🏛️ Admin PU Dinas
            </button>
            <button
              onClick={() => handleQuickLogin('pimpinan')}
              className="px-2.5 py-1.5 bg-white border border-[#DCE0E6] rounded-lg text-xs font-semibold text-[#184C78] hover:border-[#2980B9] hover:bg-[#EBF4FB] text-left transition-colors"
            >
              ⭐ Pimpinan Instansi
            </button>
            <button
              onClick={() => handleQuickLogin('peneliti')}
              className="px-2.5 py-1.5 bg-white border border-[#DCE0E6] rounded-lg text-xs font-semibold text-[#184C78] hover:border-[#2980B9] hover:bg-[#EBF4FB] text-left transition-colors"
            >
              🔬 Media / Peneliti
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
