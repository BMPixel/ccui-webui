import React from 'react';
import type { ConversationMessage, StreamEventType } from '@/types';
import { Message } from './Message';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface MessageListProps {
  messages: (ConversationMessage | StreamEventType)[];
  isStreaming?: boolean;
}

export const MessageList = ({ messages, isStreaming }: MessageListProps) => {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium mb-2">No messages yet</p>
          <p className="text-sm">This conversation is empty</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <Message
          key={`message-${index}`}
          message={message}
        />
      ))}
      
      {isStreaming && (
        <div className="flex items-center gap-2 text-gray-500">
          <LoadingSpinner size="sm" />
          <span className="text-sm">Claude is thinking...</span>
        </div>
      )}
    </div>
  );
}; 