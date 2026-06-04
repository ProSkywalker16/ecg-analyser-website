import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0e27]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-400"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0e27]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-400"></div></div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <Routes>
        <Route path="/" element={
          <>
            <Navbar />
            <LandingPage />
            <Footer />
          </>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <Navbar />
            <LoginPage />
            <Footer />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Navbar />
            <RegisterPage />
            <Footer />
          </PublicRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
