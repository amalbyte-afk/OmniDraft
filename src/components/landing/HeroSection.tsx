import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { useCallback, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../store';
import OptionWheel from '../wheel/OptionWheel';
import type { Mode } from '../../types';

const WHEEL_ITEMS = [
  "Draft", "Summarize", "Creative",
];

function MagneticButton({
  children,
  onClick,
  variant = 'primary',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      x.set((e.clientX - cx) * 0.12);
      y.set((e.clientY - cy) * 0.12);
    },
    [x, y],
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const springX = useSpring(x, { stiffness: 250, damping: 18 });
  const springY = useSpring(y, { stiffness: 250, damping: 18 });

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={`group relative overflow-hidden rounded-2xl font-medium transition-shadow duration-300 ${
        variant === 'primary'
          ? 'bg-accent text-white shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30'
          : 'border border-glass-border bg-white/[0.03] text-white hover:bg-white/[0.06]'
      }`}
    >
      <span className="relative z-10 flex items-center gap-2 px-6 py-3 text-sm md:text-base">
        {children}
      </span>
    </motion.button>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function HeroSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setMode } = useStore();

  const handleWheelClick = useCallback(
    (_index: number, item: string) => {
      const modeMap: Record<string, Mode> = { Draft: 'draft', Summarize: 'summarize', Creative: 'creative' };
      const mode = modeMap[item] || 'draft';
      setMode(mode);
      navigate(user ? `/workspace?mode=${mode}` : '/auth');
    },
    [user, navigate, setMode],
  );

  const handleLaunch = useCallback(() => {
    navigate(user ? '/workspace' : '/auth');
  }, [user, navigate]);

  return (
    <section className="relative z-10 mx-auto min-h-[calc(100vh-4rem)] max-w-[1280px] px-6 pt-24 md:pt-28 lg:pt-32">
      <div className="absolute top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/4 rounded-full opacity-20" style={{ background: 'radial-gradient(ellipse, rgba(202,88,38,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute top-1/3 right-0 h-[300px] w-[300px] opacity-10" style={{ background: 'radial-gradient(ellipse, rgba(255,246,130,0.1) 0%, transparent 70%)', filter: 'blur(80px)' }} />

      <motion.div
        className="mx-auto flex max-w-[1120px] flex-col items-center text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/[0.04] px-3.5 py-1 text-xs font-medium tracking-wide text-accent">
            <Sparkles className="h-3 w-3" />
            Unified AI Content Workspace
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl xl:text-7xl"
          style={{ fontFamily: 'Equinox, General Sans, sans-serif' }}
        >
          <span>Write Anything.</span>
          <br />
          <span className="bg-gradient-to-r from-accent via-accent to-accent-hover bg-clip-text text-transparent">
            Create Everything.
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-6 max-w-xl text-base leading-relaxed text-text-secondary md:text-lg"
        >
          Generate blogs, emails, summaries, reports, translations, rewrites, and
          more from one AI-powered workspace.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <MagneticButton onClick={handleLaunch} variant="primary">
            Launch Workspace
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </MagneticButton>

          <MagneticButton
            onClick={() => {
              const el = document.getElementById('how-it-works');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            variant="secondary"
          >
            <Play className="h-4 w-4" />
            See How It Works
          </MagneticButton>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-text-secondary"
        >
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            No credit card
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Free to start
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Streaming AI
          </span>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative mx-auto mt-16 max-w-[900px]"
      >
        <div
          className="absolute -inset-4 rounded-3xl opacity-40"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(202,88,38,0.08) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative overflow-hidden rounded-2xl border border-glass-border bg-bg-glass/40 shadow-2xl shadow-accent/5"
          style={{
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          <div className="flex items-center justify-between border-b border-glass-border px-5 py-3.5">
            <div className="flex gap-2">
              <div className="h-3 w-3 rounded-full bg-error/60" />
              <div className="h-3 w-3 rounded-full bg-warning/60" />
              <div className="h-3 w-3 rounded-full bg-success/60" />
            </div>
            <span className="text-xs font-medium text-text-secondary/40">
              omnidraft.app
            </span>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="text-xs text-text-secondary/40">AI Ready</span>
            </div>
          </div>

          <div className="flex items-center justify-center px-4 py-6 md:px-8 md:py-10" style={{ minHeight: 380 }}>
            <div className="h-[340px] w-full md:h-[360px]">
              <OptionWheel
                items={WHEEL_ITEMS}
                defaultSelected={0}
                onItemClick={handleWheelClick}
                side="left"
                fontSize={2.8}
                spacing={2.2}
                curve={0.6}
                tilt={4}
                blur={1.5}
                fade={0.1}
                inset={30}
                textColor="rgba(255,255,255,0.35)"
                activeColor="#CA5826"
                draggable
                loop
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
