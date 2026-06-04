import LoginForm from '../components/Auth/LoginForm';
import { Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-[var(--bg-secondary)]">
      <div className="absolute inset-0 ecg-grid-bg opacity-20" />
      <div className="absolute -top-40 left-20 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center">
              <Activity size={22} className="text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Welcome Back</h1>
          <p className="text-[var(--text-secondary)] mt-1">Sign in to your ECG Analyser account</p>
        </div>

        <div className="card p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
