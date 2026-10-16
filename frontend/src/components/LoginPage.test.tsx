import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from './LoginPage';
import { apiService } from '../services/api';

vi.mock('../services/api', () => ({
  apiService: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders split-screen with branding, illustration, and login form fields', () => {
    render(
      <LoginPage
        initialMode="login"
        onLoginSuccess={vi.fn()}
        onBackToHome={vi.fn()}
      />
    );

    // Left panel branding & welcome
    expect(screen.getByRole('region', { name: /informasi civictrack/i })).toBeInTheDocument();
    expect(screen.getByText('Welcome!')).toBeInTheDocument();

    // Right panel login header
    expect(screen.getByRole('heading', { level: 2, name: /log in/i })).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByText('It will take less than a minute.')).toBeInTheDocument();

    // Inputs & action controls
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/remember password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /forget your password\?/i })).toBeInTheDocument();
  });

  it('switches between Login and Create an Account modes', () => {
    render(
      <LoginPage
        initialMode="login"
        onLoginSuccess={vi.fn()}
        onBackToHome={vi.fn()}
      />
    );

    // Click 'Create an account'
    const switchBtn = screen.getByRole('button', { name: /create an account/i });
    fireEvent.click(switchBtn);

    // Now in Register mode
    expect(screen.getByRole('heading', { level: 2, name: /create an account/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Masukkan nama lengkap Anda')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('nama@email.com')).toBeInTheDocument();
    expect(screen.getByLabelText(/peran akun/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();

    // Switch back to Login
    const loginBackBtn = screen.getByRole('button', { name: /masuk sekarang/i });
    fireEvent.click(loginBackBtn);
    expect(screen.getByRole('heading', { level: 2, name: /log in/i })).toBeInTheDocument();
  });

  it('submits valid login credentials and calls onLoginSuccess', async () => {
    const mockUser = {
      id: 1,
      nama: 'Warga Lamongan',
      email: 'warga@civictrack.id',
      role: 'warga' as const,
    };
    (apiService.login as any).mockResolvedValueOnce({
      access_token: 'fake-token-123',
      user: mockUser,
    });

    const mockOnLoginSuccess = vi.fn();
    render(
      <LoginPage
        initialMode="login"
        onLoginSuccess={mockOnLoginSuccess}
        onBackToHome={vi.fn()}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'warga@civictrack.id' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(apiService.login).toHaveBeenCalledWith('warga@civictrack.id', 'password123');
      expect(mockOnLoginSuccess).toHaveBeenCalledWith(mockUser);
    });
  });

  it('displays error alert when login fails', async () => {
    (apiService.login as any).mockRejectedValueOnce(new Error('Email atau password salah'));

    render(
      <LoginPage
        initialMode="login"
        onLoginSuccess={vi.fn()}
        onBackToHome={vi.fn()}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'wrong@civictrack.id' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrongpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Email atau password salah')).toBeInTheDocument();
    });
  });

  it('navigates back to home when back button is clicked', () => {
    const mockOnBackToHome = vi.fn();
    render(
      <LoginPage
        initialMode="login"
        onLoginSuccess={vi.fn()}
        onBackToHome={mockOnBackToHome}
      />
    );

    const backBtn = screen.getByRole('button', { name: /kembali ke beranda civictrack/i });
    fireEvent.click(backBtn);
    expect(mockOnBackToHome).toHaveBeenCalled();
  });

  it('changes active carousel slide when clicking dot', () => {
    render(
      <LoginPage
        initialMode="login"
        onLoginSuccess={vi.fn()}
        onBackToHome={vi.fn()}
      />
    );

    const slide2Dot = screen.getByRole('tab', { name: /lihat slide 2/i });
    fireEvent.click(slide2Dot);

    expect(screen.getByText('Smart AI Routing')).toBeInTheDocument();
  });
});
