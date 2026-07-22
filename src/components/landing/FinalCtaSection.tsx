import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function FinalCtaSection() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClick = useCallback(() => {
    navigate(user ? '/workspace' : '/auth');
  }, [user, navigate]);

  return (
    <section className="w-full">
      <div className="mx-auto max-w-[1280px] px-6 pb-24 md:pb-28 lg:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-accent/15"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 30% 40%, rgba(202,88,38,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(255,246,130,0.06) 0%, transparent 50%)',
            }}
          />
          <div
            className="absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-10"
            style={{
              background:
                'radial-gradient(circle, rgba(255,246,130,0.15) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />

          <div className="relative px-8 py-16 text-center md:px-16 md:py-24">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent"
            >
              <Sparkles className="h-7 w-7" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-4 text-3xl font-bold text-white md:text-4xl"
              style={{ fontFamily: 'Equinox, General Sans, sans-serif' }}
            >
              Ready to Create Better Content Faster?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-text-secondary"
            >
              Join OmniDraft and generate professional drafts, summaries, emails,
              blogs, translations, and more — all from one unified AI workspace.
            </motion.p>

            <motion.button
              onClick={handleClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-2xl bg-accent px-8 py-3.5 text-base font-medium text-white shadow-lg shadow-accent/20 transition-all duration-300 hover:bg-accent-hover hover:shadow-xl hover:shadow-accent/30"
            >
              Launch Workspace
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
