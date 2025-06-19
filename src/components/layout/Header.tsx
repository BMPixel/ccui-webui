import React from 'react';
import { Menu, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useUIStore } from '@/stores/uiStore';
import { useConversationStore } from '@/stores/conversationStore';

export const Header = () => {
  const { toggleSidebar, isMobile, setNewConversationModalOpen } = useUIStore();
  const { isStreaming } = useConversationStore();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        <h1 className="text-lg font-semibold text-gray-900">
          CCUI WebUI
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={() => setNewConversationModalOpen(true)}
          disabled={isStreaming}
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>

        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}; 