import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import RegistrationPage from './pages/RegistrationPage';
import AdminLoginPage from './pages/AdminLoginPage';
import DashboardPage from './pages/DashboardPage';
import CandidateDetailPage from './pages/CandidateDetailPage';
import CreateStaffPage from './pages/CreateStaffPage';
import ProtectedRoute from './components/ProtectedRoute';

function AdminLoginGate() {
  const token = localStorage.getItem('access_token');
  if (token) return <Navigate to="/admin/dashboard" replace />;
  return <AdminLoginPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<RegistrationPage />} />
        <Route path="/admin/login" element={<AdminLoginGate />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/admin/candidate/:id" element={
          <ProtectedRoute><CandidateDetailPage /></ProtectedRoute>
        } />
        <Route path="/admin/create-staff" element={
          <ProtectedRoute adminOnly><CreateStaffPage /></ProtectedRoute>
        } />
        <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}