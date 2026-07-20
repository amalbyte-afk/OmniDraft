import { create } from 'zustand';
import type { Mode, Conversation, Message, ToastState } from '../types';

interface ModeSlice {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

interface ConversationSlice {
  conversations: Conversation[];
  activeConversationId: string | null;
  setConversations: (convs: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateStreamingContent: (conversationId: string, content: string) => void;
}

interface UISlice {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toast: ToastState;
  showToast: (message: string, type: ToastState['type']) => void;
  hideToast: () => void;
  streamingContent: string;
  setStreamingContent: (content: string) => void;
}

type StoreState = ModeSlice & ConversationSlice & UISlice;

export const useStore = create<StoreState>((set) => ({
  mode: 'draft' as Mode,
  setMode: (mode) => set({ mode }),

  conversations: [],
  activeConversationId: null,
  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (id) => set({ activeConversationId: id }),
  addMessage: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, message], updatedAt: Date.now() }
          : c,
      ),
    })),
  updateStreamingContent: (conversationId, content) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: c.messages.map((m, i) =>
                i === c.messages.length - 1 ? { ...m, content } : m,
              ),
              updatedAt: Date.now(),
            }
          : c,
      ),
    })),

  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toast: { message: '', type: 'info', visible: false },
  showToast: (message, type) =>
    set({ toast: { message, type, visible: true } }),
  hideToast: () =>
    set({ toast: { message: '', type: 'info', visible: false } }),
  streamingContent: '',
  setStreamingContent: (content) => set({ streamingContent: content }),
}));
