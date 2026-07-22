import { useCallback, useRef, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { useStore } from '../store';
import { useStreamingChat } from '../hooks/useStreamingChat';
import MessageBubble from '../components/chat/MessageBubble';
import InputBar from '../components/chat/InputBar';
import FileUploadZone from '../components/chat/FileUploadZone';
import TemplatePicker from '../components/templates/TemplatePicker';
import CopyButton from '../components/export/CopyButton';
import ExportDropdown from '../components/export/ExportDropdown';
import type { Mode } from '../types';

export default function Workspace() {
  const { mode, setMode, activeConversationId, conversations, showToast } = useStore();
  const { sendMessage, streaming, streamingContent } = useStreamingChat();
  const [searchParams] = useSearchParams();
  const [showTemplates, setShowTemplates] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const modeParam = searchParams.get('mode') as Mode | null;
    if (modeParam && ['draft', 'summarize', 'creative'].includes(modeParam)) {
      setMode(modeParam);
    }
  }, [searchParams, setMode]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = useCallback(
    async (message: string) => {
      await sendMessage(message);
    },
    [sendMessage],
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      const text = await file.text();
      showToast(`Uploaded ${file.name}`, 'success');
      await sendMessage(`Please summarize the following document:\n\n${text}`);
    },
    [sendMessage, showToast],
  );

  const handleTemplateSelect = useCallback(
    (prompt: string) => {
      handleSend(prompt);
    },
    [handleSend],
  );

  const allContent = messages.map((m) => `${m.role}: ${m.content}`).join('\n\n');

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="flex items-center justify-between border-b border-glass-border px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">
            {mode}
          </span>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            Templates
          </button>
        </div>
        {messages.length > 0 && (
          <div className="flex items-center gap-1">
            <CopyButton content={allContent} />
            <ExportDropdown content={allContent} />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
        <div className="mx-auto max-w-3xl space-y-4">
          <TemplatePicker
            onSelect={handleTemplateSelect}
            open={showTemplates}
            onClose={() => setShowTemplates(false)}
          />

          {messages.length === 0 && !streaming ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-8 max-w-md"
              >
                <p className="text-lg font-medium text-text-primary mb-2">
                  Start a conversation
                </p>
                <p className="text-sm text-text-secondary">
                  Type a message below or pick a template to get started.
                </p>
              </motion.div>
              {mode === 'summarize' && (
                <div className="mt-6 w-full max-w-md">
                  <FileUploadZone onFileSelect={handleFileUpload} />
                </div>
              )}
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {streaming && (
                <MessageBubble
                  message={{
                    id: 'streaming',
                    role: 'assistant',
                    content: streamingContent,
                    timestamp: Date.now(),
                  }}
                  isStreaming
                />
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-glass-border px-4 py-4 md:px-6">
        <InputBar
          onSend={handleSend}
          onFileUpload={mode === 'summarize' ? handleFileUpload : undefined}
          disabled={streaming}
          placeholder={
            mode === 'draft'
              ? 'Start drafting...'
              : mode === 'summarize'
                ? 'Paste content to summarize...'
                : 'Get creative...'
          }
        />
      </div>
    </div>
  );
}
