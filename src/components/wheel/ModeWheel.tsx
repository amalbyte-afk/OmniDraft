import { motion } from 'framer-motion';
import { PenLine, AlignLeft, Sparkles } from 'lucide-react';
import { useStore } from '../../store';
import type { Mode } from '../../types';

interface ModeConfig {
  id: Mode;
  label: string;
  description: string;
  icon: typeof PenLine;
  color: string;
}

const modes: ModeConfig[] = [
  {
    id: 'draft',
    label: 'Draft',
    description: 'Write from scratch with AI guidance',
    icon: PenLine,
    color: '#FF4654',
  },
  {
    id: 'summarize',
    label: 'Summarize',
    description: 'Condense content into key points',
    icon: AlignLeft,
    color: '#BA3A46',
  },
  {
    id: 'creative',
    label: 'Creative',
    description: 'Generate creative content & ideas',
    icon: Sparkles,
    color: '#FF6B76',
  },
];

interface ModeWheelProps {
  onSelect: (mode: Mode) => void;
}

export default function ModeWheel({ onSelect }: ModeWheelProps) {
  const { mode: activeMode } = useStore();

  return (
    <div className="flex flex-col items-center gap-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative"
      >
        <div className="flex gap-6 md:gap-10">
          {modes.map((m, i) => {
            const Icon = m.icon;
            const isActive = activeMode === m.id;

            return (
              <motion.button
                key={m.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, type: 'spring', stiffness: 200, damping: 20 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(m.id)}
                className={`relative flex flex-col items-center gap-3 rounded-2xl p-6 md:p-8 transition-colors ${
                  isActive
                    ? 'glass border-primary/30 bg-primary/5'
                    : 'glass hover:border-white/20'
                }`}
                style={{ minWidth: 160 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeMode"
                    className="absolute inset-0 rounded-2xl border-2"
                    style={{ borderColor: m.color }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${m.color}20` }}
                >
                  <Icon className="h-7 w-7" style={{ color: m.color }} />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-semibold text-text-primary">
                    {m.label}
                  </h3>
                  <p className="mt-1 text-xs text-text-secondary max-w-[120px]">
                    {m.description}
                  </p>
                </div>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: m.color }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
