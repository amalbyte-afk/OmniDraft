import { useCallback, useState } from 'react';
import { useStore } from '../store';
import { getConversations, deleteConversation as apiDelete } from '../lib/api';
import type { Conversation } from '../types';

function mergeConversations(
  api: Conversation[],
  existing: Conversation[],
): Conversation[] {
  const apiIds = new Set(api.map((c) => c.id));
  const kept = existing.filter((c) => !apiIds.has(c.id) && c.messages.length > 0);
  return [...api, ...kept];
}

export function useConversations() {
  const { conversations, setConversations } = useStore();
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getConversations();
      const mapped: Conversation[] = data.map((c) => ({
        id: c.id,
        title: c.title,
        mode: c.mode,
        messages: [],
        createdAt: new Date(c.updated_at).getTime(),
        updatedAt: new Date(c.updated_at).getTime(),
      }));
      const existing = useStore.getState().conversations;
      setConversations(mergeConversations(mapped, existing));
    } catch {
      // Silently fail — user can retry
    } finally {
      setLoading(false);
    }
  }, [setConversations]);

  const deleteConversation = useCallback(
    async (id: string) => {
      try {
        await apiDelete(id);
        setConversations(conversations.filter((c) => c.id !== id));
      } catch {
        // Silently fail
      }
    },
    [conversations, setConversations],
  );

  return { conversations, loading, refresh, deleteConversation };
}
