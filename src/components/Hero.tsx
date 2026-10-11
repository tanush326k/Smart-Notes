import React from 'react';
import { Theme } from '../hooks/useTheme';

interface HeroProps {
  theme: Theme;
}

export const Hero: React.FC<HeroProps> = ({ theme }) => {
  return (
    <div className="text-center pt-8 pb-10 flex flex-col items-center">
      {/* CSS Shapes Premium Illustration */}
      <div className="illustration-container mb-6">
        <div className="illustration-shape-circle" />
        <div className="illustration-shape-grid" />
        <div className="illustration-shape-card" />
        <div 
          className="illustration-shape-card" 
          style={{ 
            transform: 'rotate(6deg) translateY(15px) translateX(20px)', 
            borderStyle: 'solid',
            opacity: theme === 'dark' ? 0.05 : 0.03
          }} 
        />
      </div>

      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--foreground)] mb-4">
        SmartNotes <span className="text-[var(--primary)]">AI</span>
      </h1>
      
      <p className="max-w-[500px] text-base sm:text-lg text-[var(--text-muted)] font-normal leading-relaxed">
        Write. Summarize. Improve.
      </p>
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)] mt-1.5 opacity-90">
        Everything powered by AI.
      </p>
    </div>
  );
};
