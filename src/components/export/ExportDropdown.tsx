import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, FileCode } from 'lucide-react';
import { useStore } from '../../store';

interface ExportDropdownProps {
  content: string;
}

export default function ExportDropdown({ content }: ExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const { showToast } = useStore();

  const exportAs = (format: 'txt' | 'md') => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnidraft-export.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
    showToast(`Exported as ${format.toUpperCase()}`, 'success');
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
        aria-label="Export"
      >
        <Download className="h-3.5 w-3.5" />
        Export
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            className="glass absolute right-0 top-full mt-1 w-36 overflow-hidden rounded-xl border border-glass-border py-1 shadow-xl z-50"
          >
            <button
              onClick={() => exportAs('txt')}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
            >
              <FileText className="h-4 w-4" />
              Plain Text (.txt)
            </button>
            <button
              onClick={() => exportAs('md')}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
            >
              <FileCode className="h-4 w-4" />
              Markdown (.md)
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
