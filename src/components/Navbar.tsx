import React from 'react';
import { Sparkles, Sun, Moon } from 'lucide-react';
import { Theme } from '../hooks/useTheme';

interface NavbarProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ theme, onToggleTheme }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--card-border)] bg-[var(--background)]/80 backdrop-blur-md">
      <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-semibold text-base tracking-tight text-[var(--foreground)]">
            SmartNotes <span className="text-[var(--accent)] font-medium">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] text-xs text-[var(--text-muted)] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            v1.0.0 Stable
          </div>

          <button
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-[var(--card-border)] flex items-center justify-center text-[var(--foreground)] cursor-pointer transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-[var(--primary)]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
