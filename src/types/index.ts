export type Mode = 'draft' | 'summarize' | 'creative';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  mode: Mode;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface Template {
  id: string;
  mode: Mode;
  title: string;
  description: string;
  prompt: string;
  icon: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

export type Theme = 'dark';
