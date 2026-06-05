import { ArrowRight } from 'lucide-react';
import useScrollReveal from '../../hooks/useScrollReveal';

const steps = [
  {
    num: '01',
    title: 'Connect Hardware',
    description: 'Plug in the AD8232 ECG sensor via Arduino. Our software auto-detects the serial port and begins capturing 360Hz cardiac signals.',
    color: 'from-primary-500 to-cyan-500',
  },
  {
    num: '02',
    title: 'AI Analysis',
    description: 'Captured ECG data passes through advanced DSP filters and our TFLite deep learning model for 6-class arrhythmia classification.',
    color: 'from-cyan-500 to-green-500',
  },
  {
    num: '03',
    title: 'Review & Download',
    description: 'Access your ECG waveforms, AI predictions, and auto-generated PDF reports. All data syncs securely to the cloud for anytime access.',
    color: 'from-green-500 to-amber-500',
  },
];

export default function HowItWorks() {
  const [ref, visible] = useScrollReveal();

  return (
    <section id="how-it-works" className="py-24 relative bg-[var(--bg-secondary)] overflow-hidden">
      <div className="absolute inset-0 ecg-grid-bg opacity-10" />
      <div className="absolute -top-40 right-40 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl animate-float" />
      <div className="absolute -bottom-40 left-40 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-float-delayed" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={`text-center mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="section-title mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="section-subtitle">
            Three simple steps from hardware to diagnosis. No cloud engineering required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map((step, i) => (
            <div key={i} className={`relative transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`} style={{ transitionDelay: `${i * 200}ms` }}>
              <div className="glass-card rounded-2xl p-8 h-full">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 text-2xl font-bold text-white transition-all duration-500 ${visible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} style={{ transitionDelay: `${i * 200 + 300}ms` }}>
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">{step.title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">{step.description}</p>
              </div>

              {i < steps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-[36px] transform -translate-y-1/2 z-10">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary-500/30 transition-all duration-700 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} style={{ transitionDelay: `${i * 200 + 500}ms` }}>
                    <ArrowRight size={18} className="text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
