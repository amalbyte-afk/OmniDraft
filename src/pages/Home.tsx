import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import ModeWheel from '../components/wheel/ModeWheel';
import { useStore } from '../store';
import type { Mode } from '../types';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const navigate = useNavigate();
  const { setMode } = useStore();
  const { user } = useAuth();

  const handleModeSelect = (mode: Mode) => {
    setMode(mode);
    if (user) {
      navigate('/workspace');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
        >
          <Sparkles className="h-8 w-8 text-primary" />
        </motion.div>
        <h1 className="mb-3 text-4xl font-bold tracking-tight md:text-5xl">
          Your AI{' '}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Content Workspace
          </span>
        </h1>
        <p className="mx-auto max-w-md text-text-secondary text-lg">
          Draft, summarize, and create with AI. Choose your mode and start creating.
        </p>
      </motion.div>

      <ModeWheel onSelect={handleModeSelect} />

      {!user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <button
            onClick={() => navigate('/auth')}
            className="group flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
          >
            Sign in to get started
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
