import { motion } from 'framer-motion';
import { PenLine, FileText, Sparkles } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: PenLine,
    title: 'Choose a Content Type',
    desc: 'Pick from Draft, Creative, Summarize, Rewrite, or more. Each mode is optimized for its task.',
  },
  {
    number: '02',
    icon: FileText,
    title: 'Describe What You Need',
    desc: 'Tell the AI what you want to create — a blog, email, summary, or anything else.',
  },
  {
    number: '03',
    icon: Sparkles,
    title: 'Generate Instantly',
    desc: 'Watch your content stream in real time. Copy, refine, or regenerate in one click.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full">
      <div className="mx-auto max-w-[1280px] px-6 py-24 md:py-28 lg:py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center"
        >
          <motion.h2
            variants={itemVariants}
            className="mb-4 text-3xl font-bold text-white md:text-4xl"
            style={{ fontFamily: 'Equinox, General Sans, sans-serif' }}
          >
            How It Works
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="mx-auto mb-16 max-w-xl text-base text-text-secondary"
          >
            Three simple steps from idea to finished content.
          </motion.p>
        </motion.div>

        <div className="relative grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative"
              >
                {i < STEPS.length - 1 && (
                  <div className="absolute -right-5 top-12 hidden text-accent/15 md:block">
                    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                )}
                <div className="group rounded-2xl border border-glass-border bg-white/[0.02] p-8 transition-all duration-300 hover:border-accent/20 hover:shadow-lg hover:shadow-accent/5">
                  <div className="mb-6 text-5xl font-bold tracking-tight text-accent/15">
                    {step.number}
                  </div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-all duration-300 group-hover:bg-accent/15">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-3 text-lg font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
