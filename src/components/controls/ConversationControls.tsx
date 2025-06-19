import React from 'react';
import { Square, Play, MessageSquare, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useStopConversation, useResumeConversation } from '@/hooks/useConversations';
import { useConversationStore } from '@/stores/conversationStore';
import { useUIStore } from '@/stores/uiStore';
import type { ConversationDetailsResponse } from '@/types';
import { formatCostSummary, formatDuration, formatModelName } from '@/utils/formatters';

interface ConversationControlsProps {
  sessionId: string;
  streamingId: string | null;
  conversation: ConversationDetailsResponse;
}

export const ConversationControls = ({ 
  sessionId, 
  streamingId, 
  conversation 
}: ConversationControlsProps) => {
  const { isStreaming, currentSessionCost } = useConversationStore();
  const { addToast } = useUIStore();
  
  const stopConversation = useStopConversation();
  const resumeConversation = useResumeConversation();

  const handleStop = () => {
    if (streamingId) {
      stopConversation.mutate(streamingId, {
        onSuccess: () => {
          addToast({
            type: 'success',
            title: 'Conversation Stopped',
            description: 'The conversation has been stopped successfully.',
          });
        },
        onError: (error) => {
          addToast({
            type: 'error',
            title: 'Failed to Stop',
            description: error instanceof Error ? error.message : 'Unknown error',
          });
        },
      });
    }
  };

  const handleResume = () => {
    // For resume, we would need a way to get new input from the user
    // This could open a modal or input field
    const newMessage = prompt('Enter your message to continue the conversation:');
    if (newMessage) {
      resumeConversation.mutate({
        sessionId,
        message: newMessage,
      }, {
        onSuccess: () => {
          addToast({
            type: 'success',
            title: 'Conversation Resumed',
            description: 'The conversation has been resumed.',
          });
        },
        onError: (error) => {
          addToast({
            type: 'error',
            title: 'Failed to Resume',
            description: error instanceof Error ? error.message : 'Unknown error',
          });
        },
      });
    }
  };

  const totalCost = conversation.metadata.totalCost + currentSessionCost;

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        {/* Conversation Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-gray-500" />
            <span className="font-medium">{conversation.summary || 'Untitled Conversation'}</span>
          </div>
          
          <div className="text-sm text-gray-500">
            {formatModelName(conversation.metadata.model)}
          </div>
        </div>

        {/* Stats and Controls */}
        <div className="flex items-center gap-4">
          {/* Cost */}
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <DollarSign className="h-4 w-4" />
            {formatCostSummary(totalCost)}
          </div>

          {/* Duration */}
          {conversation.metadata.totalDuration > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              {formatDuration(conversation.metadata.totalDuration)}
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            {isStreaming && streamingId ? (
              <Button
                onClick={handleStop}
                variant="destructive"
                size="sm"
                disabled={stopConversation.isPending}
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Stop
              </Button>
            ) : (
              <Button
                onClick={handleResume}
                variant="outline"
                size="sm"
                disabled={resumeConversation.isPending}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Continue
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 