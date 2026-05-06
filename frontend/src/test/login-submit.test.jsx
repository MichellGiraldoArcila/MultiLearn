import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from '../pages/Login';
import { auth } from '../services/api';

vi.mock('../services/api', () => ({
  auth: {
    login: vi.fn(),
  },
}));

function renderLoginWithRoutes(initialPath = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Login submission', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('stores tokens and navigates to dashboard on success', async () => {
    auth.login.mockResolvedValue({
      data: { access: 'access-123', refresh: 'refresh-456' },
    });

    renderLoginWithRoutes();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@mail.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i, { selector: 'input' }), {
      target: { value: 'Password123' },
    });
    await waitFor(() => expect(screen.getByRole('button', { name: /entrar/i })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => expect(screen.getByText('Dashboard')).toBeInTheDocument());
    expect(localStorage.getItem('access_token')).toBe('access-123');
    expect(localStorage.getItem('refresh_token')).toBe('refresh-456');
  });

  it('shows backend message when login fails', async () => {
    auth.login.mockRejectedValue({
      response: { status: 401, data: { detail: 'Credenciales inválidas' } },
    });

    renderLoginWithRoutes();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@mail.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i, { selector: 'input' }), {
      target: { value: 'bad-password' },
    });
    await waitFor(() => expect(screen.getByRole('button', { name: /entrar/i })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument();
    });
  });
});
