import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Trash2, ChevronLeft, History } from 'lucide-react';
import { useStore } from '../../store';
import { useConversations } from '../../hooks/useConversations';
import type { Conversation } from '../../types';

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, setActiveConversation } = useStore();
  const { conversations, deleteConversation, refresh } = useConversations();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    refresh();
  }, [refresh, location.pathname]);

  const handleNewChat = () => {
    setActiveConversation(null);
    navigate('/workspace');
  };

  const handleSelectConversation = (conv: Conversation) => {
    setActiveConversation(conv.id);
    navigate('/workspace');
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteConversation(id);
  };

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="glass hidden border-r border-glass-border md:flex md:flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between p-4">
            <h2 className="text-sm font-semibold text-text-secondary flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </h2>
            <button
              onClick={handleNewChat}
              className="flex items-center gap-1 rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/30 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {conversations.length === 0 ? (
              <p className="px-2 text-xs text-text-secondary/50 text-center mt-8">
                No conversations yet
              </p>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className="group flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate">{conv.title || 'New conversation'}</span>
                    <button
                      onClick={(e) => handleDelete(e, conv.id)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 text-text-secondary hover:text-error transition-all"
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-glass-border p-3">
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Collapse
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
