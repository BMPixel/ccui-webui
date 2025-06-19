import React from 'react';
import { User, Bot, Settings, Clock, DollarSign } from 'lucide-react';
import type { ConversationMessage, StreamEventType } from '@/types';
import { formatDateTime, formatCost, formatDuration } from '@/utils/formatters';
import { JsonViewer } from './JsonViewer';
import { cn } from '@/utils/cn';

interface MessageProps {
  message: ConversationMessage | StreamEventType;
}

export const Message = ({ message }: MessageProps) => {
  // Handle different message types
  const getMessageContent = () => {
    if ('message' in message && message.message) {
      // This is a ConversationMessage
      const conversationMessage = message as ConversationMessage;
      return {
        type: conversationMessage.type,
        content: conversationMessage.message,
        timestamp: conversationMessage.timestamp,
        cost: conversationMessage.costUSD,
        duration: conversationMessage.durationMs,
      };
    } else {
      // This is a StreamEventType
      const streamMessage = message as StreamEventType;
      return {
        type: streamMessage.type,
        content: streamMessage,
        timestamp: new Date().toISOString(),
      };
    }
  };

  const { type, content, timestamp, cost, duration } = getMessageContent();

  const getIcon = () => {
    switch (type) {
      case 'user':
        return <User className="h-5 w-5" />;
      case 'assistant':
        return <Bot className="h-5 w-5" />;
      case 'system':
        return <Settings className="h-5 w-5" />;
      default:
        return <Bot className="h-5 w-5" />;
    }
  };

  const getMessageClass = () => {
    switch (type) {
      case 'user':
        return 'bg-blue-50 border-blue-200';
      case 'assistant':
        return 'bg-gray-50 border-gray-200';
      case 'system':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const renderContent = () => {
    if (type === 'user' || type === 'assistant') {
      // Handle text content from conversation messages
      if (typeof content === 'object' && 'content' in content && Array.isArray(content.content)) {
        return content.content.map((block: any, index: number) => {
          if (block.type === 'text') {
            return (
              <div key={index} className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{block.text}</p>
              </div>
            );
          }
          return <JsonViewer key={index} data={block} />;
        });
      }
    }
    
    // For system messages or unknown content, show JSON
    return <JsonViewer data={content} />;
  };

  return (
    <div className={cn(
      "border rounded-lg p-4 space-y-3",
      getMessageClass()
    )}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="font-medium text-sm capitalize">
            {type === 'assistant' ? 'Claude' : type}
          </span>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {cost && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {formatCost(cost)}
            </div>
          )}
          
          {duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(duration)}
            </div>
          )}
          
          <span>{formatDateTime(timestamp)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        {renderContent()}
      </div>
    </div>
  );
}; 