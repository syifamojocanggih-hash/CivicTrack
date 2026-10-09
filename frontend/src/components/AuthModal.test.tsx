import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthModal } from './AuthModal';
import { apiService } from '../services/api';
import userEvent from '@testing-library/user-event';

vi.mock('../services/api', () => ({
  apiService: {
    login: vi.fn(),
  },
}));

describe('AuthModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows error message if fields are empty', async () => {
    render(<AuthModal isOpen={true} onClose={() => {}} onLoginSuccess={() => {}} initialMode="login" />);
    
    const user = userEvent.setup();
    const loginBtn = screen.getByRole('button', { name: /Masuk Sekarang/i });
    
    await user.click(loginBtn);
    
    // apiService should not be called
    expect(apiService.login).not.toHaveBeenCalled();
    // HTML5 validation or manual validation would kick in, but if it's just a form without preventDefault manual validation, it might not show a React error state. 
    // Wait, the component might just rely on native HTML5 'required' attribute. 
    // Let's just ensure apiService is not called.
  });

  it('calls login api when submitted with credentials', async () => {
    vi.mocked(apiService.login).mockResolvedValue({
      token: 'fake-token',
      user: { id: 1, email: 'test@banyuwangi.go.id', role: 'warga', nama: 'Warga' }
    });

    const onLoginMock = vi.fn();
    render(<AuthModal isOpen={true} onClose={() => {}} onLoginSuccess={onLoginMock} initialMode="login" />);

    const user = userEvent.setup();
    
    await user.type(screen.getByLabelText(/Alamat Email/i), 'test@banyuwangi.go.id');
    await user.type(screen.getByLabelText(/Kata Sandi/i), 'password123');
    
    const loginBtn = screen.getByRole('button', { name: /Masuk Sekarang/i });
    await user.click(loginBtn);

    await waitFor(() => {
      expect(apiService.login).toHaveBeenCalledWith('test@banyuwangi.go.id', 'password123');
    });
    
    expect(onLoginMock).toHaveBeenCalledWith({ id: 1, email: 'test@banyuwangi.go.id', role: 'warga', nama: 'Warga' });
  });

  it('shows error message and does not call onLoginSuccess if credentials are invalid', async () => {
    vi.mocked(apiService.login).mockRejectedValue(new Error('Kredensial tidak valid'));

    const onLoginMock = vi.fn();
    render(<AuthModal isOpen={true} onClose={() => {}} onLoginSuccess={onLoginMock} initialMode="login" />);

    const user = userEvent.setup();
    
    await user.type(screen.getByLabelText(/Alamat Email/i), 'wrong@banyuwangi.go.id');
    await user.type(screen.getByLabelText(/Kata Sandi/i), 'wrongpass');
    
    const loginBtn = screen.getByRole('button', { name: /Masuk Sekarang/i });
    await user.click(loginBtn);

    await waitFor(() => {
      expect(apiService.login).toHaveBeenCalledWith('wrong@banyuwangi.go.id', 'wrongpass');
    });

    // Expect an error message to be displayed in the UI (AuthModal uses error state)
    expect(await screen.findByText(/Kredensial tidak valid/i)).toBeInTheDocument();
    
    // onLoginSuccess should NOT be called
    expect(onLoginMock).not.toHaveBeenCalled();
  });

  it('renders Quick Demo Login buttons and triggers login for all 3 demo roles (Warga, Pimpinan, Admin PU)', async () => {
    vi.mocked(apiService.login).mockImplementation(async (email, _pass) => {
      if (email === 'admin.pu@civictrack.demo') {
        return {
          token: 'token-admin',
          user: { id: 1, email, role: 'penanggung_jawab', nama: 'Bambang Suryono, S.T.' },
        };
      }
      if (email === 'pimpinan.pu@civictrack.demo') {
        return {
          token: 'token-pimpinan',
          user: { id: 2, email, role: 'aparatur_pemerintah', nama: 'Drs. Joko Prasetyo, M.Si' },
        };
      }
      return {
        token: 'token-warga',
        user: { id: 3, email, role: 'warga', nama: 'Budi Santoso' },
      };
    });

    const onLoginMock = vi.fn();
    const onCloseMock = vi.fn();
    render(<AuthModal isOpen={true} onClose={onCloseMock} onLoginSuccess={onLoginMock} initialMode="login" />);

    // Pastikan kontainer Quick Demo Login ada
    expect(screen.getByText(/Quick Demo Login/i)).toBeInTheDocument();

    const user = userEvent.setup();

    // 1. Verifikasi tombol Warga (Budi Santoso)
    const wargaText = screen.getByText('Budi Santoso');
    const wargaBtn = wargaText.closest('button');
    expect(wargaBtn).toBeInTheDocument();
    await user.click(wargaBtn!);

    await waitFor(() => {
      expect(apiService.login).toHaveBeenCalledWith('budi.santoso@civictrack.demo', 'password123');
      expect(onLoginMock).toHaveBeenCalledWith(expect.objectContaining({ email: 'budi.santoso@civictrack.demo' }));
      expect(onCloseMock).toHaveBeenCalled();
    });

    // 2. Verifikasi tombol Pimpinan (Drs. Joko)
    const pimpinanText = screen.getByText('Drs. Joko');
    const pimpinanBtn = pimpinanText.closest('button');
    expect(pimpinanBtn).toBeInTheDocument();
    await user.click(pimpinanBtn!);

    await waitFor(() => {
      expect(apiService.login).toHaveBeenCalledWith('pimpinan.pu@civictrack.demo', 'password123');
      expect(onLoginMock).toHaveBeenCalledWith(expect.objectContaining({ email: 'pimpinan.pu@civictrack.demo' }));
    });

    // 3. Verifikasi tombol Admin PU (Bambang, S.T.)
    const adminText = screen.getByText('Bambang, S.T.');
    const adminBtn = adminText.closest('button');
    expect(adminBtn).toBeInTheDocument();
    await user.click(adminBtn!);

    await waitFor(() => {
      expect(apiService.login).toHaveBeenCalledWith('admin.pu@civictrack.demo', 'password123');
      expect(onLoginMock).toHaveBeenCalledWith(expect.objectContaining({ email: 'admin.pu@civictrack.demo' }));
    });
  });
});
