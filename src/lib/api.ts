import { supabase } from './supabase';
import type { Message, Mode } from '../types';

const API_BASE = '/api';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) {
    headers['Authorization'] = `Bearer ${data.session.access_token}`;
  }
  return headers;
}

async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { ...authHeaders, ...(options?.headers as Record<string, string>) },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'Request failed');
  }

  return res.json();
}

export async function sendChatMessage(
  mode: Mode,
  message: string,
  conversationId?: string,
  fileContent?: string,
): Promise<Response> {
  const authHeaders = await getAuthHeaders();
  return fetch(`${API_BASE}/chat/stream`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ mode, message, conversation_id: conversationId, file_content: fileContent }),
  });
}

export async function authCallback(userId: string, email: string): Promise<void> {
  try {
    await request('/auth/callback', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, email }),
    });
  } catch { /* profile may already exist */ }
}

export async function getConversations(): Promise<
  { id: string; title: string; mode: Mode; updated_at: string }[]
> {
  return request('/conversations');
}

export async function getConversation(id: string): Promise<{
  id: string;
  title: string;
  mode: Mode;
  messages: Message[];
}> {
  return request(`/conversations/${id}`);
}

export async function deleteConversation(id: string): Promise<void> {
  return request(`/conversations/${id}`, { method: 'DELETE' });
}
