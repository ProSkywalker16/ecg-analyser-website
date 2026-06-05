import { Cpu, FileText, Brain, Cloud, Smartphone, Shield, Activity, BarChart3 } from 'lucide-react';
import useScrollReveal from '../../hooks/useScrollReveal';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Diagnostics',
    description: 'TFLite deep learning model detects 6 cardiac conditions with high accuracy — Normal, AFib, PVC, PAC, LBBB, RBBB.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Activity,
    title: 'Real-time Monitoring',
    description: 'Live ECG waveform visualization with hardware sampling at 360Hz via AD8232 sensor and Arduino integration.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: FileText,
    title: 'Auto-Generated Reports',
    description: 'Comprehensive PDF reports with ECG plots, patient data, ML predictions, and confidence scores — ready for clinical use.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Cloud,
    title: 'Cloud Sync & Backup',
    description: 'Automatic Supabase cloud synchronization. Access your ECG records and reports from anywhere, anytime.',
    color: 'from-orange-500 to-yellow-500',
  },
  {
    icon: Shield,
    title: 'Secure Dual Auth',
    description: 'Two-factor authentication with bcrypt-hashed password and passcode. Optional local-only storage for privacy.',
    color: 'from-red-500 to-rose-500',
  },
  {
    icon: BarChart3,
    title: 'Advanced DSP Pipeline',
    description: 'Multi-stage filtering: median filter baseline correction, Butterworth LPF, 50Hz notch, and 5s window extraction.',
    color: 'from-indigo-500 to-purple-500',
  },
];

export default function Features() {
  const [ref, visible] = useScrollReveal();

  return (
    <section id="features" className="py-24 relative bg-[var(--bg-primary)]">
      <div className="absolute inset-0 ecg-grid-bg opacity-20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={`text-center mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 mb-4">
            <Cpu size={14} className="text-primary-400" />
            <span className="text-sm font-medium text-primary-400">Platform Features</span>
          </div>
          <h2 className="section-title mb-4">
            Everything You Need for{' '}
            <span className="gradient-text">ECG Analysis</span>
          </h2>
          <p className="section-subtitle">
            From hardware data acquisition to AI-powered diagnosis, our platform covers the entire ECG analysis workflow.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className={`card-hover p-6 group transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-2.5 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
