import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const passwordChecks = (pw) => ({
  length: pw.length >= 8,
  upper: /[A-Z]/.test(pw),
  lower: /[a-z]/.test(pw),
  digit: /\d/.test(pw),
  special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(pw),
});

export default function RegisterForm() {
  const [form, setForm] = useState({ name: '', password: '', confirmPassword: '', passcode: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const checks = passwordChecks(form.password);
  const allChecksPass = Object.values(checks).every(Boolean);
  const strength = Object.values(checks).filter(Boolean).length;
  const strengthLabel = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.password || !form.confirmPassword || !form.passcode) {
      setError('All fields are required');
      return;
    }
    if (!allChecksPass) {
      setError('Password does not meet requirements');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.password, form.passcode);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Username</label>
        <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Choose a username" className="input-field" autoComplete="username" />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Password</label>
        <div className="relative">
          <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Create a strong password" className="input-field pr-10" autoComplete="new-password" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {form.password && (
          <div className="mt-2 space-y-1.5">
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength ? strengthColors[strength - 1] : 'bg-gray-200 dark:bg-gray-700'}`} />
              ))}
            </div>
            <p className="text-xs text-[var(--text-tertiary)]">Password strength: {strengthLabel}</p>
            <div className="grid grid-cols-2 gap-1">
              {[
                { key: 'length', label: '8+ characters' },
                { key: 'upper', label: 'Uppercase letter' },
                { key: 'lower', label: 'Lowercase letter' },
                { key: 'digit', label: 'One digit' },
                { key: 'special', label: 'Special character' },
              ].map(({ key, label }) => (
                <div key={key} className={`flex items-center gap-1.5 text-xs ${checks[key] ? 'text-green-500' : 'text-[var(--text-tertiary)]'}`}>
                  {checks[key] ? <CheckCircle size={10} /> : <div className="w-2.5 h-2.5 rounded-full border border-current" />}
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Confirm Password</label>
        <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm your password" className="input-field" autoComplete="new-password" />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Secret Passcode</label>
        <div className="relative">
          <input type={showPasscode ? 'text' : 'password'} name="passcode" value={form.passcode} onChange={handleChange} placeholder="Create a secret passcode" className="input-field pr-10" autoComplete="off" />
          <button type="button" onClick={() => setShowPasscode(!showPasscode)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
            {showPasscode ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-6">
        {loading ? <Loader2 size={20} className="animate-spin" /> : <UserPlus size={20} />}
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>

      <p className="text-center text-sm text-[var(--text-secondary)]">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
      </p>
    </form>
  );
}
