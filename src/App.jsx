import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import RegistrationPage from './pages/RegistrationPage';
import AdminLoginPage from './pages/AdminLoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateStaffPage from './pages/CreateStaffPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        {/* Public — registration only */}
        <Route path="/" element={<RegistrationPage />} />

        {/* Admin login — redirect to dashboard if already logged in */}
        <Route path="/admin/login" element={<AdminLoginGate />} />

        {/* Protected admin routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/admin/create-staff" element={
          <ProtectedRoute adminOnly><CreateStaffPage /></ProtectedRoute>
        } />

        {/* Any /admin/* route without token → login, not registration */}
        <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />

        {/* Everything else → registration */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// Redirect to dashboard if already authenticated
function AdminLoginGate() {
  const token = localStorage.getItem('access_token');
  if (token) return <Navigate to="/admin/dashboard" replace />;
  return <AdminLoginPage />;
}