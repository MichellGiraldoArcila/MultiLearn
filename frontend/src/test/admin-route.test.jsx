import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminRoute from '../components/AdminRoute';
import { auth } from '../services/api';

vi.mock('../services/api', () => ({
  auth: {
    adminStatus: vi.fn(),
  },
}));

function renderAdminRoute(initialPath = '/admin') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <div>Panel admin</div>
            </AdminRoute>
          }
        />
        <Route path="/" element={<div>Inicio</div>} />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AdminRoute', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('redirects to login when no access token exists', async () => {
    renderAdminRoute();
    await waitFor(() => expect(screen.getByText('Login')).toBeInTheDocument());
  });

  it('renders children when user is staff', async () => {
    localStorage.setItem('access_token', 'staff-token');
    auth.adminStatus.mockResolvedValue({ data: { is_staff: true } });

    renderAdminRoute();

    await waitFor(() => expect(screen.getByText('Panel admin')).toBeInTheDocument());
  });

  it('redirects to home when user is not staff', async () => {
    localStorage.setItem('access_token', 'user-token');
    auth.adminStatus.mockResolvedValue({ data: { is_staff: false } });

    renderAdminRoute();

    await waitFor(() => expect(screen.getByText('Inicio')).toBeInTheDocument());
  });

  it('redirects to login when admin status call fails', async () => {
    localStorage.setItem('access_token', 'bad-token');
    auth.adminStatus.mockRejectedValue(new Error('network'));

    renderAdminRoute();

    await waitFor(() => expect(screen.getByText('Login')).toBeInTheDocument());
  });
});
