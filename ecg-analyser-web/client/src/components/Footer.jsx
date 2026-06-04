import { Link } from 'react-router-dom';
import { Activity, Github, Heart, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center">
                <Activity size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold">ECG<span className="text-primary-400">Analyser</span></span>
            </Link>
            <p className="text-sm text-[var(--text-secondary)] max-w-md">
              Advanced ECG monitoring and analysis platform powered by AI. 
              Real-time cardiac signal processing, ML-based diagnostics, and comprehensive health insights.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-sm text-[var(--text-secondary)] hover:text-primary-400 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="text-sm text-[var(--text-secondary)] hover:text-primary-400 transition-colors">How It Works</a></li>
              <li><Link to="/register" className="text-sm text-[var(--text-secondary)] hover:text-primary-400 transition-colors">Get Started</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#about" className="text-sm text-[var(--text-secondary)] hover:text-primary-400 transition-colors">About</a></li>
              <li><a href="#" className="text-sm text-[var(--text-secondary)] hover:text-primary-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-[var(--text-secondary)] hover:text-primary-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-[var(--border-color)]">
          <p className="text-xs text-[var(--text-tertiary)]">
            &copy; {new Date().getFullYear()} ECG Analyser. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-[var(--text-tertiary)] mt-2 sm:mt-0">
            Made with <Heart size={12} className="text-red-500 mx-1" /> for better healthcare
          </div>
        </div>
      </div>
    </footer>
  );
}
