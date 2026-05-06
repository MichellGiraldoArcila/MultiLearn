import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

function renderRoute(initialPath = '/privada') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/privada"
          element={
            <ProtectedRoute>
              <div>Contenido privado</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Página login</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirects to login when no token exists', () => {
    renderRoute();
    expect(screen.getByText(/página login/i)).toBeInTheDocument();
  });

  it('renders private content when token exists', () => {
    localStorage.setItem('access_token', 'test-token');
    renderRoute();
    expect(screen.getByText(/contenido privado/i)).toBeInTheDocument();
  });
});
