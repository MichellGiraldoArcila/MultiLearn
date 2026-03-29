import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem('access_token');
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
