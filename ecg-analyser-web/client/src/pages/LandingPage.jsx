import Hero from '../components/Landing/Hero';
import Features from '../components/Landing/Features';
import HowItWorks from '../components/Landing/HowItWorks';
import Stats from '../components/Landing/Stats';
import About from '../components/Landing/About';

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <Features />
      <HowItWorks />
      <Stats />
      <About />
    </main>
  );
}
