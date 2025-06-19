import type { ConversationMessage, StreamEventType } from '@/types';
import { Message } from './Message';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Bot, Clock, DollarSign } from 'lucide-react';
import { formatDateTime, formatCost, formatDuration } from '@/utils/formatters';

interface MessageListProps {
  messages: (ConversationMessage | StreamEventType)[];
  isStreaming?: boolean;
  showToolResults?: boolean;
}

// Helper function to determine if a message is from the user
const isUserMessage = (message: ConversationMessage | StreamEventType): boolean => {
  if ('message' in message && message.message) {
    const conversationMessage = message as ConversationMessage;
    
    // Check if this is a user message that's actually a tool result
    if (conversationMessage.type === 'user' && 
        conversationMessage.message && 
        typeof conversationMessage.message === 'object' &&
        'content' in conversationMessage.message &&
        Array.isArray(conversationMessage.message.content)) {
      
      const hasToolResult = conversationMessage.message.content.some((block: any) => 
        block && typeof block === 'object' && block.type === 'tool_result'
      );
      
      if (hasToolResult) {
        return false; // This is actually a tool result, not a user message
      }
    }
    
    return conversationMessage.type === 'user';
  }
  
  // Stream events are not user messages
  return false;
};

// Helper function to determine if a message is a tool result
const isToolMessage = (message: ConversationMessage | StreamEventType): boolean => {
  if ('message' in message && message.message) {
    const conversationMessage = message as ConversationMessage;
    
    // Check if this is a user message that's actually a tool result
    if (conversationMessage.type === 'user' && 
        conversationMessage.message && 
        typeof conversationMessage.message === 'object' &&
        'content' in conversationMessage.message &&
        Array.isArray(conversationMessage.message.content)) {
      
      const hasToolResult = conversationMessage.message.content.some((block: any) => 
        block && typeof block === 'object' && block.type === 'tool_result'
      );
      
      if (hasToolResult) {
        return true; // This is actually a tool result
      }
    }
    
    // Note: We deliberately don't check for tool_use messages here
    // because we want to show tool calls, just hide the results
  }
  
  return false;
};

// Group consecutive non-user messages together
const groupMessages = (messages: (ConversationMessage | StreamEventType)[]): (ConversationMessage | StreamEventType)[][] => {
  const groups: (ConversationMessage | StreamEventType)[][] = [];
  let currentGroup: (ConversationMessage | StreamEventType)[] = [];
  let lastWasUser = false;

  messages.forEach((message) => {
    const isUser = isUserMessage(message);
    
    if (isUser) {
      // If we have accumulated non-user messages, add them as a group
      if (currentGroup.length > 0) {
        groups.push([...currentGroup]);
        currentGroup = [];
      }
      // Add user message as its own group
      groups.push([message]);
      lastWasUser = true;
    } else {
      // This is a non-user message
      if (lastWasUser && currentGroup.length === 0) {
        // Start a new non-user group
        currentGroup = [message];
      } else {
        // Continue adding to the current non-user group
        currentGroup.push(message);
      }
      lastWasUser = false;
    }
  });

  // Don't forget the last group if it exists
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
};

// Helper to get group metadata (cost, duration, timestamp)
const getGroupMetadata = (group: (ConversationMessage | StreamEventType)[]) => {
  let totalCost = 0;
  let totalDuration = 0;
  let latestTimestamp = '';

  group.forEach((message) => {
    if ('message' in message && message.message) {
      const conversationMessage = message as ConversationMessage;
      if (conversationMessage.costUSD) {
        totalCost += conversationMessage.costUSD;
      }
      if (conversationMessage.durationMs) {
        totalDuration += conversationMessage.durationMs;
      }
      if (conversationMessage.timestamp > latestTimestamp) {
        latestTimestamp = conversationMessage.timestamp;
      }
    }
  });

  return {
    totalCost: totalCost > 0 ? totalCost : undefined,
    totalDuration: totalDuration > 0 ? totalDuration : undefined,
    timestamp: latestTimestamp || new Date().toISOString()
  };
};

export const MessageList = ({ messages, isStreaming, showToolResults = false }: MessageListProps) => {
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

  // Filter out tool messages if showToolResults is false
  const filteredMessages = showToolResults 
    ? messages 
    : messages.filter(message => !isToolMessage(message));

  const messageGroups = groupMessages(filteredMessages);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messageGroups.map((group, groupIndex) => {
        const isUserGroup = group.length === 1 && isUserMessage(group[0]);
        
        if (isUserGroup) {
          // Render user message normally
          return (
            <Message
              key={`group-${groupIndex}`}
              message={group[0]}
              grouped={false}
            />
          );
        } else {
          // Render non-user messages as a grouped container with single header
          const { totalCost, totalDuration, timestamp } = getGroupMetadata(group);
          
          return (
            <div 
              key={`group-${groupIndex}`}
              className="bg-assistant-bubble rounded-lg p-4 space-y-3 assistant-content"
            >
              {/* Single group header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm text-muted-foreground">
                    Claude
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {totalCost && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatCost(totalCost)}
                    </div>
                  )}
                  
                  {totalDuration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(totalDuration)}
                    </div>
                  )}
                  
                  <span>{formatDateTime(timestamp)}</span>
                </div>
              </div>

              {/* Group content - messages without headers */}
              <div className="space-y-3">
                {group.map((message, messageIndex) => (
                  <div key={`message-${groupIndex}-${messageIndex}`}>
                    <Message message={message} grouped={true} />
                    {messageIndex < group.length - 1 && (
                      <div className="border-b border-gray-200 my-3" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }
      })}
      
      {isStreaming && (
        <div className="flex items-center gap-2 text-gray-500">
          <LoadingSpinner size="sm" />
          <span className="text-sm">Claude is thinking...</span>
        </div>
      )}
    </div>
  );
}; 