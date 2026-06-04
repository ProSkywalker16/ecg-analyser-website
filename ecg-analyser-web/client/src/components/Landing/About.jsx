import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Heart, Clock, Trophy, Users, X } from 'lucide-react';

const team = [
  {
    name: 'Promit Chaudhuri',
    role: 'Lead Developer & ML Engineer',
    photo: '/images/promit.jpeg',
    description: 'Handled the core execution and workflow of the project from beginning to end. Primarily focussed on Deeplearning, GUI dev, site dev and entire backend logic. Also assisted Koustav and Sneha in Research paper writings and other works.',
    color: 'from-primary-500 to-cyan-500',
  },
  {
    name: 'Koustav Dasgupta',
    role: 'Signal Processing & Research',
    photo: '/images/koustav.jpeg',
    description: 'Handled the signal processing and research paper works, also almost donated his body for our project! but didnt have to as it is non-invasive. Contributed valuable data and also endured immense pain as ecg electrodes had to be peeled off his chest many times, grateful man!',
    color: 'from-cyan-500 to-green-500',
  },
  {
    name: 'Sneha Chakraborty',
    role: 'Research Lead & ML Developer',
    photo: '/images/sneha.jpeg',
    description: 'Majorly handled the research paper works — from extensive research and writings to quality of report, handled with great precision and accuracy. Also helped in ML model development and presentations for the project.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Pranjal Chanda',
    role: 'Hardware & IoT Engineer',
    photo: '/images/pranjal.jpeg',
    description: 'Did extensive research on electronics and IoT aspect of the project. Thoroughly made significant works on the AD8232 ECG sensor, whose findings helped us to fix existing problems and make signal processing easier.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    name: 'Mimansa Chowdhury',
    role: 'Design & Documentation Lead',
    photo: '/images/mimansa.jpeg',
    description: 'Handled all the printing and publishing work single handedly. Contributed to designing workflows and visual representations of the project.',
    color: 'from-green-500 to-emerald-500',
  },
];

const milestones = [
  {
    icon: Clock,
    title: '2 Years in the Making',
    description: 'Countless nights, days, and weekends dedicated to building this from scratch.',
    color: 'from-primary-500 to-cyan-500',
  },
  {
    icon: Trophy,
    title: 'Overcame Every Hurdle',
    description: 'From hardware integration to ML model training, we solved every challenge together.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: BookOpen,
    title: 'Research Paper in Progress',
    description: 'A formal research paper documenting our methodology and findings is being written for publication.',
    color: 'from-green-500 to-emerald-500',
  },
];

export default function About() {
  const [lightbox, setLightbox] = useState(null);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => { if (e.key === 'Escape') closeLightbox(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, closeLightbox]);
  return (
    <section id="about" className="py-24 relative bg-[var(--bg-secondary)] overflow-hidden">
      <div className="absolute inset-0 ecg-grid-bg opacity-10" />
      <div className="absolute top-40 -left-40 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 -right-40 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 mb-4">
            <Users size={14} className="text-primary-400" />
            <span className="text-sm font-medium text-primary-400">Our Team</span>
          </div>
          <h2 className="section-title mb-4">
            Meet The{' '}
            <span className="gradient-text">Team</span>
          </h2>
          <p className="section-subtitle">
            A passionate group of engineers, researchers, and dreamers who built this project from the ground up.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {team.map((member, i) => (
            <div
              key={i}
              className="card-hover p-8 md:p-10 animate-slide-up flex flex-col items-center text-center group"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="relative mb-6">
                <div className={`w-44 h-44 md:w-52 md:h-52 rounded-full bg-gradient-to-br ${member.color} p-1.5 group-hover:scale-105 transition-transform duration-300 cursor-pointer`}
                  onClick={() => setLightbox(member.photo)}>
                  <div className="w-full h-full rounded-full overflow-hidden bg-[var(--bg-secondary)]">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className={`absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center shadow-lg`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-4">{member.name}</h3>
              <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-lg">
                {member.description}
              </p>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mb-16 animate-fade-in">
          <div className="card overflow-hidden cursor-pointer" onClick={() => setLightbox('/images/group_photo.jpeg')}>
            <img
              src="/images/group_photo.jpeg"
              alt="ECG Analyser Team"
              className="w-full h-auto object-cover"
            />
          </div>
          <p className="text-sm md:text-base text-[var(--text-tertiary)] text-center mt-3">
            <span className="font-semibold text-[var(--text-secondary)]">(From Left)</span>{' '}
            Promit Chaudhuri, Pranjal Chanda, Sneha Chakraborty, Mimansa Chowdhury, Koustav Dasgupta
          </p>
        </div>

        <div className="text-center mb-16 animate-fade-in">
          <div className="max-w-4xl mx-auto card p-10 md:p-12">
            <div className="flex items-center justify-center gap-3 mb-5">
              <Heart size={24} className="text-red-500" />
              <h3 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">Our Journey</h3>
              <Heart size={24} className="text-red-500" />
            </div>
            <p className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto">
              This project took two years to build from scratch. It brought us together through countless
              nights, hectic days, and intense struggles. We poured our hearts into every line of code,
              every DSP filter, every ML model iteration — and eventually, we succeeded.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-base text-[var(--text-tertiary)]">
              Built with <Heart size={14} className="text-red-500 mx-0.5" /> by the ECG Analyser Team
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 animate-fade-in">
          {milestones.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="card-hover p-8 text-center group">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} p-3.5 mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={30} className="text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-[var(--text-primary)] mb-3">{item.title}</h3>
                <p className="text-base text-[var(--text-secondary)]">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors z-10"
          >
            <X size={22} />
          </button>
          <img
            src={lightbox}
            alt="Enlarged view"
            className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
