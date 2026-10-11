import { useState, useCallback } from 'react';
import { Sparkles, List, FileText } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import { processWithAI, AIResult, AIAction } from './utils/aiProcessor';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { NoteEditor } from './components/NoteEditor';
import { OutputCard } from './components/OutputCard';
import { ToastContainer } from './components/ToastContainer';

function App() {
  const { theme, toggleTheme } = useTheme();
  const { toasts, addToast, removeToast } = useToast();


  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<AIAction | null>(null);
  const [results, setResults] = useState<Partial<AIResult>>({});
  const [loadingCards, setLoadingCards] = useState<Set<string>>(new Set());

  const handleAction = useCallback(async (action: AIAction) => {
    if (isLoading) return;

    if (!notes.trim()) {
      addToast('Please enter some notes first!', 'error');
      return;
    }
    setIsLoading(true);
    setActiveAction(action);
    setLoadingCards(new Set([action]));

    try {
      const result = await processWithAI(notes, action);
      setResults(prev => ({ ...prev, ...result }));
      addToast(
        action === 'summarize'
          ? 'Summary generated!'
          : action === 'keyPoints'
          ? 'Key points extracted!'
          : 'Writing improved!',
        'success'
      );
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Something went wrong.', 'error');
    } finally {
      setIsLoading(false);
      setActiveAction(null);
      setLoadingCards(new Set());
    }
  }, [notes, isLoading, addToast]);

  const handleClear = useCallback(() => {
    setNotes('');
    setResults({});
    setIsLoading(false);
    setActiveAction(null);
    setLoadingCards(new Set());
    addToast('Cleared all contents.', 'info');
  }, [addToast]);

  const handleCopied = useCallback((cardTitle: string) => {
    addToast(`${cardTitle} copied to clipboard!`, 'success');
  }, [addToast]);

  const outputCards = [
    {
      id: 'card-summary',
      actionKey: 'summarize' as AIAction,
      title: 'Summary',
      accentColor: '#4F46E5',
      content: results.summary ?? null,
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'card-keypoints',
      actionKey: 'keyPoints' as AIAction,
      title: 'Key Points',
      accentColor: '#8B5CF6',
      content: results.keyPoints ?? null,
      icon: <List className="w-4 h-4" />,
    },
    {
      id: 'card-improved',
      actionKey: 'improveWriting' as AIAction,
      title: 'Improved Version',
      accentColor: '#06B6D4',
      content: results.improved ?? null,
      icon: <FileText className="w-4 h-4" />,
    },
  ];

  return (
    <div
      className={`min-h-screen relative bg-[var(--background)] selection:bg-[var(--primary)]/10 text-[var(--foreground)]`}
    >
      <Navbar theme={theme} onToggleTheme={toggleTheme} />

      <main className="max-w-[1100px] mx-auto px-6 pt-24 pb-20">
        <Hero theme={theme} />

        {/* Editor */}
        <NoteEditor
          value={notes}
          onChange={setNotes}
          onSummarize={() => handleAction('summarize')}
          onKeyPoints={() => handleAction('keyPoints')}
          onImprove={() => handleAction('improveWriting')}
          onClear={handleClear}
          isLoading={isLoading}
          activeAction={activeAction}
        />

        {/* Output Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {outputCards.map(card => (
            <OutputCard
              key={card.id}
              id={card.id}
              title={card.title}
              icon={card.icon}
              accentColor={card.accentColor}
              content={card.content}
              isLoading={loadingCards.has(card.actionKey)}
              onCopy={handleCopied}
              onRegenerate={() => handleAction(card.actionKey)}
              hasInput={!!notes.trim()}
            />
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-20 border-t border-[var(--card-border)] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-muted)] gap-4">
          <div>SmartNotes AI · Premium Note Organizer</div>
          <div className="flex items-center gap-1.5 font-medium">
            <span>Powered by Google Gemini</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
        </footer>
      </main>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;
