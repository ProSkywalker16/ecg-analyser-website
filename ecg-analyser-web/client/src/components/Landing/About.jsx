import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Heart, Clock, Trophy, Users, X } from 'lucide-react';
import useScrollReveal from '../../hooks/useScrollReveal';

const team = [
  {
    name: 'Promit Chaudhuri',
    role: 'Lead Developer & ML Engineer',
    photo: '/images/promit.jpeg',
    description: 'Managed the core execution and development of the project from inception to completion. Led the deep learning implementation, GUI development, website development, and backend system design. Additionally, collaborated with Koustav and Sneha in research paper preparation, technical documentation, and various project-related tasks.',
    color: 'from-primary-500 to-cyan-500',
  },
  {
    name: 'Koustav Dasgupta',
    role: 'Signal Processing & Research',
    photo: '/images/koustav.jpeg',
    description: 'Managed signal processing and research paper activities while simultaneously functioning as the unofficial laboratory rat. Volunteered enough ECG recordings to populate a small medical database and bravely survived repeated electrode removals that felt suspiciously similar to budget-friendly chest waxing sessions. Was fully prepared to donate his body to science, but fortunately learned that ECG monitoring is non-invasive. His pain, patience, and premium-quality biological data were instrumental to the success of the project!',
    color: 'from-cyan-500 to-green-500',
  },
  {
    name: 'Sneha Chakraborty',
    role: 'Research Lead & ML Developer',
    photo: '/images/sneha.jpeg',
    description: 'Led the research paper development process, handling everything from extensive literature review and technical writing to ensuring the overall quality, accuracy, and polish of the final report. Demonstrated exceptional attention to detail and an uncanny ability to spot formatting issues from several pages away. Also contributed to machine learning model development and played a key role in preparing project presentations, helping transform complex technical concepts into content that humans could actually understand.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Pranjal Chanda',
    role: 'Hardware & IoT Engineer',
    photo: '/images/pranjal.jpeg',
    description: "Served as the team's electronics and IoT specialist, carrying out detailed research on the AD8232 ECG sensor and related hardware components. His work played a crucial role in troubleshooting existing issues and making ECG signal processing considerably more manageable. Widely recognized for being one of the most knowledgeable members of the team and simultaneously one of the most pessimistic, he spent nearly two months forecasting every possible technical catastrophe before eventually deciding to solve them. Under the influence of approaching deadlines, he entered a brief but highly productive state of existence and completed a remarkable amount of work in just two days. His contributions ultimately proved that procrastination is not a project management strategy, but occasionally an interesting phenomenon to observe.",
    color: 'from-amber-500 to-orange-500',
  },
  {
    name: 'Mimansa Chowdhury',
    role: 'Design & Documentation Lead',
    photo: '/images/mimansa.jpeg',
    description: 'Managed all printing, publishing, and documentation logistics single handedly, ensuring that every report reached its destination in one piece and on time. Contributed to workflow design and visual representations of the project, stepping in reliably whenever a deadline became impossible to ignore.',
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
  const [headerRef, headerVisible] = useScrollReveal();
  const [teamRef, teamVisible] = useScrollReveal();
  const [journeyRef, journeyVisible] = useScrollReveal();
  const [milestonesRef, milestonesVisible] = useScrollReveal();

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
      <div className="absolute top-40 -left-40 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-40 -right-40 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-float-delayed" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headerRef} className={`text-center mb-16 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
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

        <div ref={teamRef} className="grid md:grid-cols-2 gap-8 mb-20">
          {team.map((member, i) => (
            <div
              key={i}
              className={`card-hover p-8 md:p-10 flex flex-col items-center text-center group transition-all duration-700 ${teamVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
              style={{ transitionDelay: `${i * 100}ms` }}
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

        <div ref={journeyRef} className={`max-w-4xl mx-auto mb-16 transition-all duration-700 ${journeyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
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

        <div className={`text-center mb-16 transition-all duration-700 ${journeyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="max-w-4xl mx-auto card p-10 md:p-12">
            <div className="flex items-center justify-center gap-3 mb-5">
              <Heart size={24} className="text-red-500 animate-pulse-slow" />
              <h3 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">Our Journey</h3>
              <Heart size={24} className="text-red-500 animate-pulse-slow" />
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

        <div ref={milestonesRef} className="grid md:grid-cols-3 gap-8">
          {milestones.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className={`card-hover p-8 text-center group transition-all duration-700 ${milestonesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: `${i * 150}ms` }}>
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
