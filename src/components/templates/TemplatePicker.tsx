import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { templates } from './TemplateCard';
import TemplateCard from './TemplateCard';

interface TemplatePickerProps {
  onSelect: (prompt: string) => void;
  open: boolean;
  onClose: () => void;
}

export default function TemplatePicker({ onSelect, open, onClose }: TemplatePickerProps) {
  const { mode } = useStore();
  const filtered = templates.filter((t) => t.mode === mode);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-secondary">
                Templates
              </h3>
              <button
                onClick={onClose}
                className="text-xs text-text-secondary/50 hover:text-text-secondary transition-colors"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={() => {
                    onSelect(template.prompt);
                    onClose();
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
