import React from 'react';
import { useParams } from 'react-router-dom';
import { ConversationView } from '@/components/conversation/ConversationView';

export const ConversationPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();

  if (!sessionId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-red-600">
          <h2 className="text-xl font-semibold mb-2">Invalid Conversation</h2>
          <p>No conversation ID provided.</p>
        </div>
      </div>
    );
  }

  return <ConversationView sessionId={sessionId} />;
}; 