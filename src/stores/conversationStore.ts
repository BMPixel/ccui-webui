import { create } from 'zustand';
import type { ConversationSummary, StreamEventType } from '@/types';

interface ConversationStore {
  // Conversation list management
  conversations: ConversationSummary[];
  setConversations: (conversations: ConversationSummary[]) => void;
  updateConversation: (sessionId: string, update: Partial<ConversationSummary>) => void;
  addConversation: (conversation: ConversationSummary) => void;
  removeConversation: (sessionId: string) => void;

  // Active conversation
  activeConversation: string | null;
  setActiveConversation: (sessionId: string | null) => void;

  // Current streaming conversation
  currentStreamingId: string | null;
  setCurrentStreamingId: (streamingId: string | null) => void;

  // Stream messages for active conversation
  streamMessages: StreamEventType[];
  addStreamMessage: (message: StreamEventType) => void;
  clearStreamMessages: () => void;
  setStreamMessages: (messages: StreamEventType[]) => void;

  // Conversation metadata
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
  
  error: string | null;
  setError: (error: string | null) => void;

  // Cost tracking for current session
  currentSessionCost: number;
  addToSessionCost: (cost: number) => void;
  resetSessionCost: () => void;
}

export const useConversationStore = create<ConversationStore>((set) => ({
  // Conversation list
  conversations: [],
  setConversations: (conversations) => set({ conversations }),
  
  updateConversation: (sessionId, update) => set((state) => ({
    conversations: state.conversations.map(conv => 
      conv.sessionId === sessionId ? { ...conv, ...update } : conv
    )
  })),
  
  addConversation: (conversation) => set((state) => ({
    conversations: [conversation, ...state.conversations]
  })),
  
  removeConversation: (sessionId) => set((state) => ({
    conversations: state.conversations.filter(conv => conv.sessionId !== sessionId)
  })),

  // Active conversation
  activeConversation: null,
  setActiveConversation: (sessionId) => set({ activeConversation: sessionId }),

  // Streaming
  currentStreamingId: null,
  setCurrentStreamingId: (streamingId) => set({ currentStreamingId: streamingId }),

  // Stream messages
  streamMessages: [],
  addStreamMessage: (message) => set((state) => ({
    streamMessages: [...state.streamMessages, message]
  })),
  
  clearStreamMessages: () => set({ streamMessages: [] }),
  
  setStreamMessages: (messages) => set({ streamMessages: messages }),

  // Status
  isStreaming: false,
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
  
  error: null,
  setError: (error) => set({ error }),

  // Cost tracking
  currentSessionCost: 0,
  addToSessionCost: (cost) => set((state) => ({
    currentSessionCost: state.currentSessionCost + cost
  })),
  resetSessionCost: () => set({ currentSessionCost: 0 }),
})); 