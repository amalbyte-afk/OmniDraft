import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip } from 'lucide-react';

interface InputBarProps {
  onSend: (message: string) => void;
  onFileUpload?: (file: File) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function InputBar({ onSend, onFileUpload, disabled, placeholder }: InputBarProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="glass mx-auto flex w-full max-w-3xl items-end gap-2 rounded-2xl border border-glass-border p-2">
      {onFileUpload && (
        <label className="flex cursor-pointer items-center justify-center rounded-xl p-2 text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors">
          <Paperclip className="h-5 w-5" />
          <input
            type="file"
            className="hidden"
            accept=".txt,.md,.pdf,.doc,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileUpload(file);
            }}
          />
        </label>
      )}
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || 'Type your message...'}
        rows={1}
        className="flex-1 resize-none bg-transparent px-2 py-2 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none max-h-[200px]"
        disabled={disabled}
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSubmit}
        disabled={!input.trim() || disabled}
        className="flex shrink-0 items-center justify-center rounded-xl bg-primary p-2.5 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors"
        aria-label="Send message"
      >
        <Send className="h-4 w-4" />
      </motion.button>
    </div>
  );
}
