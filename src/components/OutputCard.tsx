import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, RotateCw, Terminal } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

interface OutputCardProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  content: string | string[] | null;
  isLoading: boolean;
  onCopy: (text: string) => void;
  onRegenerate: () => void;
  hasInput: boolean;
}

// Check if content contains code-like structure to render cleanly
const isCodeFormat = (text: string): boolean => {
  if (text.includes('```')) return true;
  if (text.includes('const ') || text.includes('let ') || text.includes('function ') || text.includes('import ')) {
    return text.includes('{') && text.includes('}');
  }
  return false;
};

export const OutputCard: React.FC<OutputCardProps> = ({
  id,
  title,
  icon,
  accentColor,
  content,
  isLoading,
  onCopy,
  onRegenerate,
  hasInput,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const t = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(t);
    }
  }, [copied]);


  const handleCopy = async () => {
    const text = Array.isArray(content) ? content.join('\n') : content ?? '';
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      onCopy(title);
    }
  };

  const hasContent = content !== null && (Array.isArray(content) ? content.length > 0 : content.length > 0);

  // Clean raw markdown backticks if any
  const formatText = (text: string) => {
    return text.replace(/```[a-z]*\n([\s\S]*?)\n```/g, '$1').trim();
  };

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      id={id}
      className="premium-card overflow-hidden bg-[var(--card-bg)] border-[var(--card-border)] shadow-sm flex flex-col justify-between"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--card-border)] bg-[var(--background)]/30">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
            style={{ backgroundColor: `${accentColor}12`, color: accentColor }}
          >
            {icon}
          </div>
          <span className="font-semibold text-xs uppercase tracking-wider text-[var(--foreground)] opacity-95">
            {title}
          </span>
        </div>

        {hasContent && !isLoading && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onRegenerate}
              id={`regenerate-${id}`}
              className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)] transition-colors cursor-pointer"
              title="Regenerate this card"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCopy}
              id={`copy-${id}`}
              className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)] transition-colors cursor-pointer flex items-center gap-1"
              title={`Copy ${title}`}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Card Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-center min-h-[140px]">
        {isLoading ? (
          <div className="space-y-2.5 w-full">
            <div className="h-3 rounded skeleton-line w-full" />
            <div className="h-3 rounded skeleton-line w-[85%]" />
            <div className="h-3 rounded skeleton-line w-[70%]" />
          </div>
        ) : !hasContent ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="p-2.5 rounded-full bg-[var(--background)] border border-[var(--card-border)] mb-2.5 opacity-40">
              {icon}
            </div>
            <p className="text-xs text-[var(--text-muted)] max-w-[200px] leading-relaxed">
              {hasInput ? `Click command button to generate ${title.toLowerCase()}` : `Your ${title.toLowerCase()} will appear here`}
            </p>
          </div>
        ) : Array.isArray(content) ? (
          <ul className="space-y-2 w-full text-left self-start">
            {content.map((point, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-[var(--foreground)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-2 flex-shrink-0" />
                <span className="opacity-90">{point}</span>
              </li>
            ))}
          </ul>
        ) : isCodeFormat(content) ? (
          <div className="w-full text-left self-start rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-3 font-mono text-xs leading-relaxed overflow-x-auto text-[var(--foreground)]">
            <div className="flex items-center gap-1.5 border-b border-[var(--card-border)] pb-1.5 mb-2 text-[var(--text-muted)]">
              <Terminal className="w-3 h-3" />
              <span>Generated Code</span>
            </div>
            <pre className="whitespace-pre-wrap">{formatText(content)}</pre>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-[var(--foreground)] text-left self-start opacity-90 whitespace-pre-wrap">
            {content}
          </p>
        )}
      </div>
    </motion.div>
  );
};
