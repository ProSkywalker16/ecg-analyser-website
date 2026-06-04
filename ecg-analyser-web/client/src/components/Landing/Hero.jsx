import { Link } from 'react-router-dom';
import { ArrowRight, Play, Activity, Shield, Zap } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[var(--gradient-hero)]">
      <div className="ecg-grid-bg absolute inset-0 opacity-30" />

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary-600/10 via-transparent to-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6">
              <Activity size={14} className="text-primary-400" />
              <span className="text-sm font-medium text-primary-500">AI-Powered ECG Analysis</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-[var(--hero-text)] leading-tight mb-6">
              Advanced ECG{' '}
              <span className="gradient-text">Monitoring</span>
              <br />
              <span className="text-[var(--hero-text-muted)]">& AI Diagnosis</span>
            </h1>

            <p className="text-lg sm:text-xl text-[var(--hero-text-muted)] max-w-xl mb-8 leading-relaxed">
              Real-time cardiac signal processing, ML-based arrhythmia detection, 
              and comprehensive health reports — all in one integrated platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="btn-primary inline-flex items-center justify-center gap-2">
                Get Started Free
                <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" className="btn-secondary inline-flex items-center justify-center gap-2">
                <Play size={18} />
                Watch Demo
              </a>
            </div>

            <div className="flex flex-wrap gap-6 mt-10">
              <div className="flex items-center gap-2 text-[var(--hero-text-faint)]">
                <Shield size={16} className="text-green-500" />
                <span className="text-sm">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--hero-text-faint)]">
                <Zap size={16} className="text-amber-500" />
                <span className="text-sm">Real-time Processing</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--hero-text-faint)]">
                <Activity size={16} className="text-cyan-600" />
                <span className="text-sm">6-Class Detection</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center animate-slide-up">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 to-cyan-500/30 rounded-3xl blur-2xl" />
              <div className="relative glass rounded-3xl p-6 w-full max-w-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-xs text-[var(--hero-glass-text)] font-mono">ECG Monitor v2.0</span>
                </div>

                <svg viewBox="0 0 400 120" className="w-full h-auto">
                  <defs>
                    <linearGradient id="ecgLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  <path d="M0,60 L30,60 L40,60 L50,20 L60,60 L70,60 L80,60 L90,60 L100,60 L110,60 L120,50 L130,70 L140,60 L180,60 L190,60 L200,10 L210,60 L220,60 L230,60 L250,60 L260,55 L270,65 L280,60 L300,60 L310,35 L320,85 L330,60 L350,60 L360,60 L370,60 L380,60 L400,60"
                    fill="none" stroke="url(#ecgLine)" strokeWidth="2"
                    className="ecg-wave" />
                  <line x1="0" y1="60" x2="400" y2="60" stroke="var(--hero-text)" strokeOpacity="0.1" strokeWidth="0.5" />

                  {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                    <line key={i} x1={i * 50} y1="0" x2={i * 50} y2="120" stroke="var(--hero-text)" strokeOpacity="0.04" strokeWidth="0.5" />
                  ))}
                </svg>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  {[
                    { label: 'Heart Rate', value: '72', unit: 'BPM', color: 'text-cyan-400' },
                    { label: 'Signal Quality', value: '98', unit: '%', color: 'text-green-400' },
                    { label: 'Diagnosis', value: 'Normal', unit: 'Sinus', color: 'text-primary-400' },
                  ].map((stat, i) => (
                    <div key={i} className="text-center p-3 rounded-xl" style={{background: 'var(--hero-glass-bg)'}}>
                      <div className="text-xs text-[var(--hero-glass-text)] mb-1">{stat.label}</div>
                      <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-xs text-[var(--hero-text-faint)]">{stat.unit}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
