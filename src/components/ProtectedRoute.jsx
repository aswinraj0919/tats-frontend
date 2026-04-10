import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('role');
  const location = useLocation();

  if (!token) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  if (adminOnly && role !== 'admin') return <Navigate to="/admin/dashboard" replace />;
  return children;
}