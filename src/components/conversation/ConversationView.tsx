import { useMemo, useState } from 'react';
import { useConversation } from '@/hooks/useConversations';
import { useConversationStream } from '@/hooks/useConversationStream';
import { useConversationStore } from '@/stores/conversationStore';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { MessageList } from './MessageList';
import { ConversationControls } from '@/components/controls/ConversationControls';

interface ConversationViewProps {
  sessionId: string;
}

export const ConversationView = ({ sessionId }: ConversationViewProps) => {
  const { data: conversation, isLoading, error } = useConversation(sessionId);
  const { streamMessages, currentStreamingId } = useConversationStore();
  
  // State for toggling tool results visibility (defaults to false/hidden)
  const [showToolResults, setShowToolResults] = useState(false);
  
  // Connect to stream if this conversation is currently streaming
  useConversationStream(currentStreamingId === sessionId ? currentStreamingId : null);

  // Merge API messages with streaming updates
  const allMessages = useMemo(() => {
    const apiMessages = conversation?.messages || [];
    
    // If we have stream messages for this conversation, show them
    if (currentStreamingId === sessionId && streamMessages.length > 0) {
      return [...apiMessages, ...streamMessages];
    }
    
    return apiMessages;
  }, [conversation, streamMessages, currentStreamingId, sessionId]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-red-600">
          <h2 className="text-xl font-semibold mb-2">Failed to Load Conversation</h2>
          <p className="text-sm text-gray-500">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <h2 className="text-xl font-semibold mb-2">Conversation Not Found</h2>
          <p className="text-sm text-gray-500">
            The conversation you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ConversationControls 
        sessionId={sessionId}
        streamingId={currentStreamingId}
        conversation={conversation}
        showToolResults={showToolResults}
        onToggleToolResults={setShowToolResults}
      />
      <MessageList 
        messages={allMessages}
        isStreaming={currentStreamingId === sessionId}
        showToolResults={showToolResults}
      />
    </div>
  );
}; 