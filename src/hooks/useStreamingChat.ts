import { useCallback, useRef } from 'react';
import { useStore } from '../store';
import { sendChatMessage } from '../lib/api';
import type { Message } from '../types';

function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function parseSSEChunk(buffer: string): { tokens: string[]; done: boolean; error?: string; conversationId?: string; remaining: string } {
  const tokens: string[] = [];
  let done = false;
  let error: string | undefined;
  let conversationId: string | undefined;
  let remaining = buffer;

  const lines = remaining.split('\n');
  const parsedLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      try {
        const json = JSON.parse(line.slice(6));
        if (json.token) tokens.push(json.token);
        if (json.done) { done = true; conversationId = json.conversation_id; }
        if (json.error) error = json.error;
        parsedLines.push(line);
      } catch { /* skip malformed */ }
    } else if (line === '') {
      parsedLines.push(line);
    }
  }

  const lastParsedIdx = lines.lastIndexOf(parsedLines[parsedLines.length - 1]);
  remaining = lines.slice(lastParsedIdx + 1).join('\n');

  return { tokens, done, error, conversationId, remaining };
}

export function useStreamingChat() {
  const {
    mode,
    activeConversationId,
    setActiveConversation,
    addMessage,
    showToast,
    streamingContent,
    setStreamingContent,
  } = useStore();
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      const userMessage: Message = {
        id: uuid(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
      };

      const convId = activeConversationId || uuid();
      if (!activeConversationId) {
        setActiveConversation(convId);
        const newConv = {
          id: convId,
          title: text.slice(0, 50),
          mode,
          messages: [userMessage],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        useStore.getState().setConversations([
          ...useStore.getState().conversations,
          newConv,
        ]);
      } else {
        addMessage(convId, userMessage);
      }

      abortRef.current = new AbortController();

      try {
        const response = await sendChatMessage(mode, text, convId);
        if (!response.ok) throw new Error('Chat request failed');

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response stream');

        const decoder = new TextDecoder();
        const assistantMessage: Message = {
          id: uuid(),
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
        };
        addMessage(convId, assistantMessage);
        setStreamingContent('');

        let accumulatedText = '';
        let sseBuffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          sseBuffer += chunk;

          const result = parseSSEChunk(sseBuffer);
          sseBuffer = result.remaining;

          if (result.error) {
            showToast(result.error, 'error');
            break;
          }

          if (result.tokens.length > 0) {
            accumulatedText += result.tokens.join('');
            setStreamingContent(accumulatedText);
          }

          if (result.done) {
            if (result.conversationId) setActiveConversation(result.conversationId);
            break;
          }
        }

        useStore.getState().updateStreamingContent(convId, accumulatedText);
        setStreamingContent('');
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        showToast('Failed to send message', 'error');
      }
    },
    [mode, activeConversationId, addMessage, setActiveConversation, showToast, setStreamingContent],
  );

  return { sendMessage, streaming: streamingContent !== '', streamingContent };
}
