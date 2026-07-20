import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Trash2, ArrowRight } from 'lucide-react';
import { useConversations } from '../hooks/useConversations';
import { useStore } from '../store';
import Skeleton from '../components/ui/Skeleton';

export default function History() {
  const { conversations, deleteConversation, loading } = useConversations();
  const { setActiveConversation } = useStore();
  const navigate = useNavigate();

  const handleOpen = (id: string) => {
    setActiveConversation(id);
    navigate('/workspace');
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="mb-2 text-2xl font-bold">Conversation History</h1>
        <p className="mb-8 text-sm text-text-secondary">
          Browse and revisit your past conversations.
        </p>

        {conversations.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <MessageSquare className="mx-auto mb-3 h-8 w-8 text-text-secondary/50" />
            <p className="text-text-secondary">No conversations yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv, i) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group glass flex items-center gap-4 rounded-xl p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-text-primary truncate">
                    {conv.title || 'Untitled'}
                  </h3>
                  <p className="text-xs text-text-secondary">
                    {new Date(conv.updatedAt || conv.createdAt).toLocaleDateString()} &middot; {conv.mode}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpen(conv.id)}
                    className="rounded-xl p-2 text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                    aria-label="Open conversation"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteConversation(conv.id)}
                    className="rounded-xl p-2 text-text-secondary hover:text-error hover:bg-white/5 transition-colors"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
