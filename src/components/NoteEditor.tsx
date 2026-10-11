import React, { useRef, useEffect, useCallback } from 'react';
import { FileText, Sparkles, List, Trash2, ArrowUpRight } from 'lucide-react';
import { wordCount } from '../utils/clipboard';

interface NoteEditorProps {
  value: string;
  onChange: (val: string) => void;
  onSummarize: () => void;
  onKeyPoints: () => void;
  onImprove: () => void;
  onClear: () => void;
  isLoading: boolean;
  activeAction: string | null;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  value,
  onChange,
  onSummarize,
  onKeyPoints,
  onImprove,
  onClear,
  isLoading,
  activeAction,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const charCount = value.length;
  const words = wordCount(value);
  const maxChars = 5000;

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(160, el.scrollHeight)}px`;
  }, []);

  useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= maxChars) {
      onChange(e.target.value);
    }
  };

  // Keyboard shortcuts listener inside text field
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading && value.trim()) {
        onSummarize();
      }
    }
  };

  return (
    <div className="premium-card p-6 mb-8 relative bg-[var(--card-bg)] border-[var(--card-border)] shadow-md">
      {/* Top Details */}
      <div className="flex items-center justify-between mb-4 border-b border-[var(--card-border)] pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[var(--primary)]" />
          <span className="text-sm font-semibold text-[var(--foreground)]">Editor</span>
        </div>
        <div className="text-xs text-[var(--text-muted)] font-medium">
          {words} words · {charCount}/{maxChars} characters
        </div>
      </div>

      {/* Text Area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          id="notes-input"
          onKeyDown={handleKeyDown}
          value={value}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="Paste or write your notes here..."
          className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--foreground)] rounded-xl px-4 py-3.5 text-sm leading-relaxed outline-none premium-input min-h-[160px] resize-none"
          aria-label="Notes text content"
        />
        
        {!value && (
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 pointer-events-none text-xs text-[var(--text-muted)] opacity-60">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded border border-[var(--card-border)] bg-[var(--card-bg)] text-[10px] font-mono">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 rounded border border-[var(--card-border)] bg-[var(--card-bg)] text-[10px] font-mono">Enter</kbd>
            <span>to Summarize</span>
          </div>
        )}
      </div>

      {/* Button Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-5">
        <div className="flex flex-wrap gap-2.5">
          <button
            id="btn-summarize"
            onClick={onSummarize}
            disabled={isLoading || !value.trim()}
            className="premium-btn premium-btn-primary px-4 py-2.5 text-sm gap-2"
          >
            {activeAction === 'summarize' && isLoading ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            Summarize
          </button>

          <button
            id="btn-keypoints"
            onClick={onKeyPoints}
            disabled={isLoading || !value.trim()}
            className="premium-btn premium-btn-secondary px-4 py-2.5 text-sm gap-2 bg-[var(--card-bg)]"
          >
            {activeAction === 'keyPoints' && isLoading ? (
              <span className="w-3.5 h-3.5 border-2 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin" />
            ) : (
              <List className="w-3.5 h-3.5 text-[var(--primary)]" />
            )}
            Key Points
          </button>

          <button
            id="btn-improve"
            onClick={onImprove}
            disabled={isLoading || !value.trim()}
            className="premium-btn premium-btn-secondary px-4 py-2.5 text-sm gap-2 bg-[var(--card-bg)]"
          >
            {(activeAction === 'improveWriting' || activeAction === 'improve') && isLoading ? (
              <span className="w-3.5 h-3.5 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
            ) : (
              <ArrowUpRight className="w-3.5 h-3.5 text-[var(--accent)]" />
            )}
            Improve Writing
          </button>
        </div>

        {value && (
          <button
            id="btn-clear"
            onClick={onClear}
            disabled={isLoading}
            className="premium-btn text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50/10 px-3 py-2 text-sm gap-1.5 rounded-lg border border-transparent transition-colors"
            title="Clear all text"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};
