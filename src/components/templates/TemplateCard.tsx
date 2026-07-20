import { memo } from 'react';
import { motion } from 'framer-motion';
import { PenLine, AlignLeft, Sparkles } from 'lucide-react';
import type { Template } from '../../types';

export const templates: Template[] = [
  { id: 'd1', mode: 'draft', title: 'Blog Post', description: 'Write a compelling blog post', prompt: 'Write a blog post about', icon: 'PenLine' },
  { id: 'd2', mode: 'draft', title: 'Email', description: 'Draft a professional email', prompt: 'Draft an email about', icon: 'PenLine' },
  { id: 'd3', mode: 'draft', title: 'Essay', description: 'Structure an academic essay', prompt: 'Write an essay on the topic of', icon: 'PenLine' },
  { id: 's1', mode: 'summarize', title: 'Article Summary', description: 'Condense an article', prompt: 'Summarize the following:', icon: 'AlignLeft' },
  { id: 's2', mode: 'summarize', title: 'Bullet Points', description: 'Extract key points', prompt: 'Extract the key points from:', icon: 'AlignLeft' },
  { id: 's3', mode: 'summarize', title: 'Executive Summary', description: 'High-level overview', prompt: 'Provide an executive summary of:', icon: 'AlignLeft' },
  { id: 'c1', mode: 'creative', title: 'Story Idea', description: 'Generate story concepts', prompt: 'Generate a creative story idea about', icon: 'Sparkles' },
  { id: 'c2', mode: 'creative', title: 'Poem', description: 'Write a poem', prompt: 'Write a poem about', icon: 'Sparkles' },
  { id: 'c3', mode: 'creative', title: 'Social Post', description: 'Viral social content', prompt: 'Write a social media post about', icon: 'Sparkles' },
];

const iconMap = { PenLine, AlignLeft, Sparkles };

interface TemplateCardProps {
  template: Template;
  onSelect: () => void;
}

const TemplateCard = memo(function TemplateCard({ template, onSelect }: TemplateCardProps) {
  const Icon = iconMap[template.icon as keyof typeof iconMap];

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className="glass flex items-start gap-3 rounded-xl p-4 text-left hover:bg-white/5 transition-colors"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h4 className="text-sm font-medium text-text-primary">{template.title}</h4>
        <p className="mt-0.5 text-xs text-text-secondary">{template.description}</p>
      </div>
    </motion.button>
  );
});

export default TemplateCard;
