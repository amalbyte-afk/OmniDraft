import { memo } from 'react';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import type { Message } from '../../types';
import StreamingText from './StreamingText';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

const MessageBubble = memo(function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
          isUser ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-primary/10 text-text-primary rounded-tr-md'
            : 'glass rounded-tl-md'
        }`}
      >
        {isStreaming ? (
          <StreamingText content={message.content} />
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </p>
        )}
        <span className="mt-1 block text-[10px] text-text-secondary/40">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </motion.div>
  );
});

export default MessageBubble;
