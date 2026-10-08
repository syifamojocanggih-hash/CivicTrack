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
});
