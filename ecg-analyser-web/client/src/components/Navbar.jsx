import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import { Activity, Menu, X, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === '/dashboard';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || isDashboard
          ? 'bg-[var(--nav-bg)] backdrop-blur-xl shadow-sm border-b border-[var(--border-color)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary-500/30 transition-shadow">
              <Activity size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-[var(--text-primary)]">
              ECG<span className="text-primary-400">Analyser</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {!isDashboard && (
              <div className="flex items-center gap-1">
                <a href="#features" className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-all">Features</a>
                <a href="#how-it-works" className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-all">How It Works</a>
                <a href="#about" className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-all">About</a>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <>
                <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-all">
                  <User size={16} />
                  {user.name}
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-all">
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:text-primary-400 transition-colors">Log In</Link>
                <Link to="/register" className="btn-primary !px-5 !py-2.5 !text-sm">Sign Up Free</Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 py-3 space-y-1 bg-[var(--nav-bg)] backdrop-blur-xl border-t border-[var(--border-color)]">
          {!isDashboard && (
            <>
              <a href="#features" className="block px-4 py-3 text-sm text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-tertiary)]" onClick={() => setMobileOpen(false)}>Features</a>
              <a href="#how-it-works" className="block px-4 py-3 text-sm text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-tertiary)]" onClick={() => setMobileOpen(false)}>How It Works</a>
              <a href="#about" className="block px-4 py-3 text-sm text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-tertiary)]" onClick={() => setMobileOpen(false)}>About</a>
            </>
          )}
          <hr className="border-[var(--border-color)] my-2" />
          {user ? (
            <>
              <Link to="/dashboard" className="block px-4 py-3 text-sm text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-tertiary)]"><User size={16} className="inline mr-2" />Dashboard</Link>
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-red-400 rounded-lg hover:bg-red-500/10"><LogOut size={16} className="inline mr-2" />Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block px-4 py-3 text-sm text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-tertiary)]">Log In</Link>
              <Link to="/register" className="block px-4 py-3 text-sm font-medium text-primary-400 rounded-lg hover:bg-primary-500/10">Sign Up Free</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
