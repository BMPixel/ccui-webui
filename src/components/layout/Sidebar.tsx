import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Clock, DollarSign } from 'lucide-react';
import { useConversations } from '@/hooks/useConversations';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatRelativeTime, formatCostSummary, formatPath } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: conversationsData, isLoading, error } = useConversations();

  const conversations = conversationsData?.conversations || [];

  const handleConversationClick = (sessionId: string) => {
    navigate(`/conversation/${sessionId}`);
  };

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-red-600">
            <p>Failed to load conversations</p>
            <p className="text-sm text-gray-500 mt-1">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
        <p className="text-sm text-gray-500 mt-1">
          {conversations.length} total
        </p>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">No conversations yet</p>
            <p className="text-sm text-gray-500">
              Start a new conversation to begin
            </p>
          </div>
        ) : (
          <div className="p-2">
            {conversations.map((conversation) => {
              const isActive = location.pathname === `/conversation/${conversation.sessionId}`;
              
              return (
                <button
                  key={conversation.sessionId}
                  onClick={() => handleConversationClick(conversation.sessionId)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg mb-2 transition-colors",
                    "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                    isActive && "bg-blue-50 border border-blue-200"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                      {conversation.summary || 'Untitled Conversation'}
                    </h3>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatRelativeTime(conversation.updatedAt)}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {conversation.messageCount} messages
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-400 truncate">
                      {formatPath(conversation.projectPath, 35)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}; 