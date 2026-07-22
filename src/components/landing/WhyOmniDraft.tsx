import { motion } from 'framer-motion';
import { LayoutGrid, Zap, Layers, Sparkles } from 'lucide-react';

const FEATURES = [
  {
    icon: LayoutGrid,
    title: 'One Unified Workspace',
    desc: 'All your AI writing tools in a single place. No switching between apps.',
  },
  {
    icon: Zap,
    title: 'Fast AI Generation',
    desc: 'Real-time streaming output. See your content appear as it\'s created.',
  },
  {
    icon: Layers,
    title: 'Multiple Writing Modes',
    desc: 'Draft, summarize, rewrite, translate, and more — each optimized for its task.',
  },
  {
    icon: Sparkles,
    title: 'Free to Use',
    desc: 'Start creating without upfront costs. Upgrade only when you need more.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function WhyOmniDraft() {
  return (
    <section id="why" className="w-full">
      <div className="mx-auto max-w-[1280px] px-6 py-24 md:py-28 lg:py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.h2
            variants={itemVariants}
            className="mb-4 text-center text-3xl font-bold text-white md:text-4xl"
            style={{ fontFamily: 'Equinox, General Sans, sans-serif' }}
          >
            Why OmniDraft?
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="mx-auto mb-16 max-w-xl text-center text-base text-text-secondary"
          >
            Everything you need to create better content, faster.
          </motion.p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="group rounded-2xl border border-glass-border bg-white/[0.02] p-6 transition-all duration-300 hover:border-accent/20 hover:shadow-lg hover:shadow-accent/5"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent transition-all duration-300 group-hover:bg-accent/15">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {feature.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
