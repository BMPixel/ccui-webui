import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import type {
  ConversationListQuery,
  StartConversationRequest,
  ResumeConversationRequest,
} from '@/types';

// Query keys for React Query cache management
export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (params?: ConversationListQuery) => [...conversationKeys.lists(), params] as const,
  details: () => [...conversationKeys.all, 'detail'] as const,
  detail: (sessionId: string) => [...conversationKeys.details(), sessionId] as const,
};

// Hook to fetch conversations list
export const useConversations = (params?: ConversationListQuery) => {
  return useQuery({
    queryKey: conversationKeys.list(params),
    queryFn: () => api.conversations.list(params),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
};

// Hook to fetch a specific conversation
export const useConversation = (sessionId: string) => {
  return useQuery({
    queryKey: conversationKeys.detail(sessionId),
    queryFn: () => api.conversations.get(sessionId),
    enabled: !!sessionId, // Only run if sessionId is provided
    staleTime: 5000, // Consider data stale after 5 seconds
  });
};

// Hook to start a new conversation
export const useStartConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StartConversationRequest) => api.conversations.start(data),
    onSuccess: () => {
      // Invalidate and refetch conversations list
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to start conversation:', error);
    },
  });
};

// Hook to resume an existing conversation
export const useResumeConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ResumeConversationRequest) => api.conversations.resume(data),
    onSuccess: (_, variables) => {
      // Invalidate conversations list and the specific conversation
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
      queryClient.invalidateQueries({ 
        queryKey: conversationKeys.detail(variables.sessionId) 
      });
    },
    onError: (error) => {
      console.error('Failed to resume conversation:', error);
    },
  });
};

// Hook to stop a conversation
export const useStopConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (streamingId: string) => api.conversations.stop(streamingId),
    onSuccess: () => {
      // Invalidate conversations list to update status
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to stop conversation:', error);
    },
  });
};

// Hook to prefetch a conversation (useful for preloading)
export const usePrefetchConversation = () => {
  const queryClient = useQueryClient();

  return (sessionId: string) => {
    queryClient.prefetchQuery({
      queryKey: conversationKeys.detail(sessionId),
      queryFn: () => api.conversations.get(sessionId),
      staleTime: 5000,
    });
  };
}; 