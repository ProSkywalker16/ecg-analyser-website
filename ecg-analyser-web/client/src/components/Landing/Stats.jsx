import { Activity, Users, FileText, Award } from 'lucide-react';

const stats = [
  { icon: Activity, value: '5000+', label: 'ECG Sessions', color: 'from-cyan-500 to-blue-500' },
  { icon: Users, value: '100+', label: 'Active Users', color: 'from-purple-500 to-pink-500' },
  { icon: FileText, value: '10K+', label: 'Reports Generated', color: 'from-green-500 to-emerald-500' },
  { icon: Award, value: '98.5%', label: 'Diagnostic Accuracy', color: 'from-amber-500 to-orange-500' },
];

export default function Stats() {
  return (
    <section id="stats" className="py-24 relative bg-[var(--bg-primary)]">
      <div className="absolute inset-0 ecg-grid-bg opacity-10" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="section-title mb-4">
            Trusted by Healthcare{' '}
            <span className="gradient-text">Professionals</span>
          </h2>
          <p className="section-subtitle">
            Our platform delivers reliable ECG analysis with proven accuracy and real-world impact.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="card-hover p-8 text-center animate-slide-up group" style={{ animationDelay: `${i * 100}ms` }}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} p-3 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={28} className="text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-[var(--text-secondary)]">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 glass-card rounded-2xl p-8 md:p-12 text-center animate-fade-in">
          <h3 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4">
            Ready to Transform Your ECG Analysis?
          </h3>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
            Join healthcare professionals using AI-powered ECG diagnostics. 
            Get started for free — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register" className="btn-primary inline-flex items-center justify-center gap-2">
              Get Started Free
            </a>
            <a href="#features" className="inline-flex items-center justify-center gap-2 px-8 py-3 font-semibold rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all duration-300 active:scale-[0.98]">
              Explore Features
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
