import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../store';
import type { Mode } from '../../types';

const CONTENT_TYPES = [
  {
    icon: (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    title: 'Draft',
    desc: 'Professional drafting for blogs, emails, reports, and more.',
    mode: 'draft' as Mode,
  },
  {
    icon: (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    title: 'Summarize',
    desc: 'Condense content into key bullet points instantly.',
    mode: 'summarize' as Mode,
  },
  {
    icon: (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: 'Creative',
    desc: 'Original, imaginative content for any project.',
    mode: 'creative' as Mode,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function SupportedContentTypes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setMode } = useStore();

  const handleClick = useCallback(
    (mode: Mode) => {
      setMode(mode);
      navigate(user ? '/workspace' : '/auth');
    },
    [user, navigate, setMode],
  );

  return (
    <section id="features" className="w-full">
      <div className="mx-auto max-w-[1280px] px-6 py-24 md:py-28 lg:py-32">
        <div className="mb-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-white md:text-4xl"
            style={{ fontFamily: 'Equinox, General Sans, sans-serif' }}
          >
            Supported Content Types
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mx-auto mt-4 max-w-xl text-base text-text-secondary"
          >
            Choose from multiple AI-powered writing tools — all in one workspace.
          </motion.p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CONTENT_TYPES.map((item, i) => (
            <motion.button
              key={item.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              onClick={() => handleClick(item.mode)}
              className="group relative overflow-hidden rounded-2xl border border-glass-border bg-white/[0.02] p-6 text-left transition-all duration-300 hover:border-accent/30 hover:bg-accent/[0.02] hover:shadow-lg hover:shadow-accent/5"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-all duration-300 group-hover:scale-105 group-hover:bg-accent/15">
                {item.icon}
              </div>
              <h3 className="mb-1.5 text-base font-semibold text-white">
                {item.title}
              </h3>
              <p className="mb-4 text-sm text-text-secondary">{item.desc}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-all duration-300 group-hover:gap-2">
                Generate
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
