import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();
const INACTIVITY_TIMEOUT = 4 * 60 * 1000;
const WARNING_BEFORE = 30 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inactivityWarning, setInactivityWarning] = useState(false);
  const inactivityTimerRef = useRef(null);
  const warningTimerRef = useRef(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    setInactivityWarning(false);
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    setInactivityWarning(false);
    if (!token) return;
    warningTimerRef.current = setTimeout(() => setInactivityWarning(true), INACTIVITY_TIMEOUT - WARNING_BEFORE);
    inactivityTimerRef.current = setTimeout(() => logout(), INACTIVITY_TIMEOUT);
  }, [token, logout]);

  useEffect(() => {
    if (!token) {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      setInactivityWarning(false);
      return;
    }
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'mousemove'];
    events.forEach(e => window.addEventListener(e, resetInactivityTimer));
    resetInactivityTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetInactivityTimer));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, [token, resetInactivityTimer]);

  const login = async (name, password, passcode) => {
    const result = await authService.login(name, password, passcode);
    setToken(result.token);
    setUser(result.user);
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    return result;
  };

  const register = async (name, password, passcode) => {
    const result = await authService.register(name, password, passcode);
    setToken(result.token);
    setUser(result.user);
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
    return result;
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, resetInactivityTimer }}>
      {children}
      {inactivityWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Session Expiring</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Your session will expire in 30 seconds due to inactivity.
              </p>
              <button
                onClick={resetInactivityTimer}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-primary-500 to-cyan-500 text-white text-sm font-medium rounded-xl hover:from-primary-600 hover:to-cyan-600 transition-all"
              >
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
