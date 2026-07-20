import { motion } from 'framer-motion';

interface StreamingTextProps {
  content: string;
}

export default function StreamingText({ content }: StreamingTextProps) {
  if (!content) {
    return (
      <span className="inline-flex gap-1" role="status" aria-live="polite">
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="h-2 w-2 rounded-full bg-primary"
        />
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          className="h-2 w-2 rounded-full bg-primary/70"
        />
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          className="h-2 w-2 rounded-full bg-primary/40"
        />
      </span>
    );
  }

  const words = content.split(' ');

  return (
    <span className="whitespace-pre-wrap text-sm leading-relaxed font-mono" role="status" aria-live="polite">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: 'blur(4px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.15, delay: i * 0.01 }}
        >
          {word}{' '}
        </motion.span>
      ))}
    </span>
  );
}
