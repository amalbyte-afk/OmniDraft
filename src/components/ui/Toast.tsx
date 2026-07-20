import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useStore } from '../../store';

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const colors = {
  success: 'border-success/30 bg-success/10 text-success',
  error: 'border-error/30 bg-error/10 text-error',
  info: 'border-accent/30 bg-accent/10 text-accent',
};

export default function Toast() {
  const { toast, hideToast } = useStore();
  const Icon = icons[toast.type];

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(hideToast, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible, hideToast]);

  return (
    <AnimatePresence>
      {toast.visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          className={`fixed bottom-6 left-1/2 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xl ${colors[toast.type]}`}
        >
          <Icon className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={hideToast} className="ml-2 opacity-60 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
