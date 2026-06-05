import { Link } from 'react-router-dom';
import { ArrowRight, Play, Activity, Shield, Zap } from 'lucide-react';
import useTypewriter from '../../hooks/useTypewriter';

export default function Hero() {
  const typedText = useTypewriter('Real-time cardiac signal processing, ML-based arrhythmia detection, and comprehensive health reports — all in one integrated platform.', 25);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[var(--gradient-hero)]">
      <div className="ecg-grid-bg absolute inset-0 opacity-30" />

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-orb-pulse" style={{ animationDelay: '0s' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-orb-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary-600/10 via-transparent to-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6 animate-scale-in">
              <Activity size={14} className="text-primary-400" />
              <span className="text-sm font-medium text-primary-500">AI-Powered ECG Analysis</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-[var(--hero-text)] leading-tight mb-6 overflow-hidden">
              <span className="inline-block animate-fade-in-left" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                Advanced ECG{' '}
              </span>
              <span className="inline-block gradient-text animate-fade-in-left" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
                Monitoring
              </span>
              <br />
              <span className="inline-block text-[var(--hero-text-muted)] animate-fade-in-right" style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
                & AI Diagnosis
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[var(--hero-text-muted)] max-w-xl mb-8 leading-relaxed min-h-[4rem] typewriter-cursor">
              {typedText}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="btn-primary inline-flex items-center justify-center gap-2 group">
                Get Started Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 to-cyan-500/30 rounded-3xl blur-2xl animate-orb-pulse" />
              <div className="relative glass rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-xs text-[var(--hero-glass-text)] font-mono">ECG Monitor v2.0</span>
                </div>

                <svg viewBox="0 0 400 120" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="ecgLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                    <clipPath id="monitor-clip">
                      <rect x="0" y="0" width="400" height="120" />
                    </clipPath>
                  </defs>
                  <g clipPath="url(#monitor-clip)">
                    <g className="ecg-scroll-group" style={{ animationDuration: '2.5s' }}>
                      <path d="M0,80 L25,80 L35,55 L45,80 L65,80 L72,94 L76,5 L80,94 L88,80 L110,80 L128,45 L148,80 L200,80 L225,80 L235,55 L245,80 L265,80 L272,94 L276,5 L280,94 L288,80 L310,80 L328,45 L348,80 L400,80 L425,80 L435,55 L445,80 L465,80 L472,94 L476,5 L480,94 L488,80 L510,80 L528,45 L548,80 L600,80 L625,80 L635,55 L645,80 L665,80 L672,94 L676,5 L680,94 L688,80 L710,80 L728,45 L748,80 L800,80" fill="none" stroke="url(#ecgLine)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                      <circle cx="76" cy="5" r="0" fill="#ef4444" className="ecg-peak-dot" />
                      <circle cx="276" cy="5" r="0" fill="#ef4444" className="ecg-peak-dot" />
                      <circle cx="476" cy="5" r="0" fill="#ef4444" className="ecg-peak-dot" />
                      <circle cx="676" cy="5" r="0" fill="#ef4444" className="ecg-peak-dot" />
                    </g>
                  </g>
                  <line x1="0" y1="80" x2="400" y2="80" stroke="var(--hero-text)" strokeOpacity="0.1" strokeWidth="0.5" />
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
