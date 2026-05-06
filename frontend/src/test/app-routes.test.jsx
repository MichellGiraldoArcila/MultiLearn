import { render, screen } from '@testing-library/react';
import App from '../App';

vi.mock('../components/Navbar', () => ({
  default: () => <div>Navbar</div>,
}));

vi.mock('../pages/Home', () => ({
  default: () => <div>Home page</div>,
}));
vi.mock('../pages/Login', () => ({
  default: () => <div>Login page</div>,
}));
vi.mock('../pages/Register', () => ({
  default: () => <div>Register page</div>,
}));
vi.mock('../pages/CourseDetail', () => ({
  default: () => <div>Course detail page</div>,
}));
vi.mock('../pages/Favorites', () => ({
  default: () => <div>Favorites page</div>,
}));
vi.mock('../pages/Recommendations', () => ({
  default: () => <div>Recommendations page</div>,
}));
vi.mock('../pages/Profile', () => ({
  default: () => <div>Profile page</div>,
}));
vi.mock('../pages/ResetPassword', () => ({
  default: () => <div>Reset password page</div>,
}));
vi.mock('../pages/AdminDashboard', () => ({
  default: () => <div>Admin dashboard page</div>,
}));

vi.mock('../components/ProtectedRoute', () => ({
  default: ({ children }) => <>{children}</>,
}));

vi.mock('../components/AdminRoute', () => ({
  default: ({ children }) => <>{children}</>,
}));

describe('App routing', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('renders home route', () => {
    window.history.pushState({}, '', '/');
    render(<App />);
    expect(screen.getByText('Home page')).toBeInTheDocument();
  });

  it('renders login route', () => {
    window.history.pushState({}, '', '/login');
    render(<App />);
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('renders register route', () => {
    window.history.pushState({}, '', '/register');
    render(<App />);
    expect(screen.getByText('Register page')).toBeInTheDocument();
  });

  it('renders course detail route for both aliases', () => {
    window.history.pushState({}, '', '/course/1');
    const { unmount } = render(<App />);
    expect(screen.getByText('Course detail page')).toBeInTheDocument();
    unmount();

    window.history.pushState({}, '', '/courses/1');
    render(<App />);
    expect(screen.getByText('Course detail page')).toBeInTheDocument();
  });

  it('renders reset password route', () => {
    window.history.pushState({}, '', '/reset-password');
    render(<App />);
    expect(screen.getByText('Reset password page')).toBeInTheDocument();
  });

  it('redirects unknown routes to home', () => {
    window.history.pushState({}, '', '/ruta-inexistente');
    render(<App />);
    expect(screen.getByText('Home page')).toBeInTheDocument();
  });
});
