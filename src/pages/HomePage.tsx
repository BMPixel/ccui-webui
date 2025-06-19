import React from 'react';
import { MessageSquare, Plus, Zap } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useUIStore } from '@/stores/uiStore';
import { useConversations } from '@/hooks/useConversations';

export const HomePage = () => {
  const { setNewConversationModalOpen } = useUIStore();
  const { data: conversationsData } = useConversations();

  const conversations = conversationsData?.conversations || [];
  const hasConversations = conversations.length > 0;

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        {hasConversations ? (
          <>
            <MessageSquare className="h-16 w-16 text-blue-500 mx-auto mb-6" />
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">
              Welcome to CCUI WebUI
            </h1>
            <p className="text-gray-600 mb-6">
              Select a conversation from the sidebar to continue, or start a new chat with Claude.
            </p>
            <Button
              onClick={() => setNewConversationModalOpen(true)}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              Start New Conversation
            </Button>
          </>
        ) : (
          <>
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <Zap className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <MessageSquare className="h-16 w-16 text-blue-500 mx-auto relative z-10" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Get started with Claude
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Start your first conversation and let Claude help you with coding tasks, file operations, and more.
            </p>
            <Button
              onClick={() => setNewConversationModalOpen(true)}
              size="lg"
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Start Your First Chat
            </Button>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg text-left">
              <h3 className="font-semibold text-blue-900 mb-2">What can Claude help with?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Code review and refactoring</li>
                <li>• File management and operations</li>
                <li>• Project analysis and documentation</li>
                <li>• Debugging and troubleshooting</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 