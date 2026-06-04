import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { dark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div
        className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300 ${
          dark ? 'translate-x-7.5 left-0' : 'left-0.5'
        }`}
        style={{ transform: dark ? 'translateX(28px)' : 'translateX(2px)' }}
      >
        {dark ? (
          <Sun size={14} className="text-amber-500" />
        ) : (
          <Moon size={14} className="text-indigo-600" />
        )}
      </div>
    </button>
  );
}
