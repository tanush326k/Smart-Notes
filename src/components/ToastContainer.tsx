import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { Toast } from '../hooks/useToast';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const toastStyle = {
  success: {
    icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  },
  error: {
    icon: <AlertCircle className="w-4 h-4 text-rose-500" />,
    bg: 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300',
  },
  info: {
    icon: <Info className="w-4 h-4 text-blue-500" />,
    bg: 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300',
  },
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div
      className="fixed bottom-6 right-6 flex flex-col gap-2 z-50 pointer-events-none"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map(toast => {
          const style = toastStyle[toast.type] || toastStyle.info;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md ${style.bg}`}
              style={{ minWidth: '240px', maxWidth: '340px' }}
            >
              <div className="flex items-center gap-2.5">
                {style.icon}
                <span className="text-sm font-medium">{toast.message}</span>
              </div>
              <button
                onClick={() => onRemove(toast.id)}
                className="opacity-45 hover:opacity-100 p-0.5 rounded transition-opacity cursor-pointer text-[var(--foreground)]"
                aria-label="Dismiss toast"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
