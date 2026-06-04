import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, LogIn, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginForm() {
  const [form, setForm] = useState({ name: '', password: '', passcode: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.password || !form.passcode) {
      setError('All fields are required');
      return;
    }
    setLoading(true);
    try {
      await login(form.name, form.password, form.passcode);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Username</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter your username"
          className="input-field"
          autoComplete="username"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="input-field pr-10"
            autoComplete="current-password"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Secret Passcode</label>
        <div className="relative">
          <input
            type={showPasscode ? 'text' : 'password'}
            name="passcode"
            value={form.passcode}
            onChange={handleChange}
            placeholder="Enter your secret passcode"
            className="input-field pr-10"
            autoComplete="off"
          />
          <button type="button" onClick={() => setShowPasscode(!showPasscode)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
            {showPasscode ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
        {loading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <LogIn size={20} />
        )}
        {loading ? 'Signing In...' : 'Sign In'}
      </button>

      <p className="text-center text-sm text-[var(--text-secondary)]">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">Create one</Link>
      </p>
    </form>
  );
}
