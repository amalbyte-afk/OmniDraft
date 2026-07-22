import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'Is OmniDraft completely free?',
    a: 'Yes, you can start with a free account to explore all modes and generate limited content. Upgrade for unlimited credits and premium features.',
  },
  {
    q: 'What content can I generate?',
    a: 'Blog posts, emails, social posts, reports, summaries, rewrites, creative writing, and translations — with new types being added regularly.',
  },
  {
    q: 'Do I need an account?',
    a: 'Yes, a free account lets you save your documents, track your history, and pick up where you left off across sessions.',
  },
  {
    q: 'How does OmniDraft work?',
    a: 'Choose a content type, describe what you need, and the AI streams the result in real time. Copy, edit, or regenerate as needed.',
  },
  {
    q: 'Can I regenerate responses?',
    a: 'Absolutely. You can regenerate any response or refine your prompt to get exactly the content you need.',
  },
  {
    q: 'Is my data secure?',
    a: 'Your documents are private to your account and encrypted in transit. We use Supabase for secure authentication and storage.',
  },
  {
    q: 'Are there any usage limits?',
    a: 'Free accounts have monthly generation limits. Paid plans offer higher limits, faster generation, and priority support.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="w-full">
      <div className="mx-auto max-w-[768px] px-6 py-24 md:py-28 lg:py-32">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl" style={{ fontFamily: 'Equinox, General Sans, sans-serif' }}>
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-text-secondary">
            Everything you need to know about OmniDraft.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`rounded-2xl border transition-all duration-300 ${
                  isOpen
                    ? 'border-accent/20 bg-accent/[0.02]'
                    : 'border-glass-border bg-white/[0.02] hover:border-glass-border/60'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="pr-4 text-sm font-medium text-white md:text-base">
                    {faq.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-glass-border px-6 pb-5 pt-4">
                        <p className="text-sm leading-relaxed text-text-secondary">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
