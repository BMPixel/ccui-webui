import { User, Bot, Settings, Clock, DollarSign, Cog } from 'lucide-react';
import type { ConversationMessage, StreamEventType } from '@/types';
import { formatDateTime, formatCost, formatDuration } from '@/utils/formatters';
import { ContentRenderer } from '@/components/conversation/content/ContentRenderer';
import { JsonViewer } from '@/components/conversation/JsonViewer';
import { cn } from '@/utils/cn';

interface MessageProps {
  message: ConversationMessage | StreamEventType;
  grouped?: boolean; // New prop to indicate if this message is part of a group
}

export const Message = ({ message, grouped = false }: MessageProps) => {
  // Handle different message types
  const getMessageContent = () => {
    if ('message' in message && message.message) {
      // This is a ConversationMessage
      const conversationMessage = message as ConversationMessage;
      
      // Check if this is a user message that's actually a tool result
      let messageType: string = conversationMessage.type;
      
      if (conversationMessage.type === 'user' && 
          conversationMessage.message && 
          typeof conversationMessage.message === 'object' &&
          'content' in conversationMessage.message &&
          Array.isArray(conversationMessage.message.content)) {
        
        // Check if any content block is a tool_result
        const hasToolResult = conversationMessage.message.content.some((block: any) => 
          block && typeof block === 'object' && block.type === 'tool_result'
        );
        
        if (hasToolResult) {
          messageType = 'tool_result';
        }
      }
      
      return {
        type: messageType as any,
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
    switch (type as string) {
      case 'user':
        return <User className="h-4 w-4 text-highlight" />;
      case 'assistant':
        return <Bot className="h-4 w-4 text-muted-foreground" />;
      case 'system':
        return <Settings className="h-4 w-4 text-muted-foreground" />;
      case 'tool_result':
        return <Cog className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Bot className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getMessageClass = () => {
    // If grouped, don't apply background - the group container handles it
    if (grouped) {
      return '';
    }
    
    switch (type as string) {
      case 'user':
        return 'bg-user-bubble user-content';
      case 'assistant':
        return 'bg-assistant-bubble assistant-content';
      case 'system':
        return 'bg-system-bubble assistant-content';
      case 'tool_result':
        return 'bg-tool-bubble assistant-content';
      default:
        return 'bg-assistant-bubble assistant-content';
    }
  };

  // Get the content class based on message type
  const getContentClass = () => {
    if (grouped) {
      // When grouped, the container already has assistant-content class
      return '';
    }
    
    switch (type as string) {
      case 'user':
        return 'user-content';
      default:
        return ''; // assistant-content is already applied to the container
    }
  };

  const renderContent = () => {
    if ((type as string) === 'user' || (type as string) === 'assistant' || (type as string) === 'tool_result') {
      // Handle content from conversation messages
      if (typeof content === 'object' && 'content' in content) {
        return <ContentRenderer content={content.content} />;
      }
    }
    
    // For system messages or unknown content, use ContentRenderer first, fallback to JSON
    if (content && typeof content === 'object' && 'content' in content) {
      return <ContentRenderer content={content.content} />;
    }
    
    return <JsonViewer data={content} />;
  };

  // For grouped messages, show a subtle type indicator if it's not an assistant message
  const renderGroupedTypeIndicator = () => {
    if (!grouped || (type as string) === 'assistant') {
      return null;
    }
    
    return (
      <div className="flex items-center gap-1 mb-2 text-xs text-muted-foreground">
        {getIcon()}
        <span>
          {(type as string) === 'tool_result' ? 'Tool Result' : type}
        </span>
      </div>
    );
  };

  return (
    <div className={cn(
      grouped ? "space-y-2" : "rounded-lg p-4 space-y-3",
      getMessageClass()
    )}>
      {/* Header - only show when not grouped */}
      {!grouped && (
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className="font-medium text-sm text-muted-foreground">
              {type === 'assistant' ? 'Claude' : (type as string) === 'tool_result' ? 'Tool Result' : type}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
      )}

      {/* Type indicator for grouped non-assistant messages */}
      {renderGroupedTypeIndicator()}

      {/* Content */}
      <div className={cn("space-y-2", getContentClass())}>
        {renderContent()}
      </div>
    </div>
  );
}; 