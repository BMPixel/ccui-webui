import { useEffect, useRef, useCallback } from 'react';
import { createStream } from '@/services/streaming';
import { useConversationStore } from '@/stores/conversationStore';
import { useUIStore } from '@/stores/uiStore';
import type { StreamEventType, PermissionRequestEvent, ResultStreamMessage } from '@/types';

export const useConversationStream = (streamingId: string | null) => {
  const streamRef = useRef<ReturnType<typeof createStream> | null>(null);
  const {
    addStreamMessage,
    clearStreamMessages,
    setIsStreaming,
    setError,
    addToSessionCost,
    setCurrentStreamingId,
  } = useConversationStore();
  
  const { addToast, setPermissionDialog } = useUIStore();

  // Handle different types of stream messages
  const handleMessage = useCallback((message: StreamEventType) => {
    addStreamMessage(message);

    switch (message.type) {
      case 'connected':
        setIsStreaming(true);
        setError(null);
        addToast({
          type: 'success',
          title: 'Connected',
          description: 'Stream connection established',
          duration: 3000,
        });
        break;

      case 'system':
        if (message.subtype === 'init') {
          console.log('Claude initialized:', message);
          addToast({
            type: 'info',
            title: 'Claude Initialized',
            description: `Working in ${message.cwd}`,
            duration: 4000,
          });
        }
        break;

      case 'assistant':
        // Handle assistant messages (Claude's responses)
        console.log('Assistant message:', message);
        break;

      case 'user':
        // Handle user messages
        console.log('User message:', message);
        break;

      case 'result':
        // Handle conversation completion
        const resultMessage = message as ResultStreamMessage;
        setIsStreaming(false);
        
        if (resultMessage.cost_usd) {
          addToSessionCost(resultMessage.cost_usd);
        }

        if (resultMessage.is_error) {
          addToast({
            type: 'error',
            title: 'Conversation Error',
            description: resultMessage.result || 'An error occurred',
            duration: 6000,
          });
        } else {
          addToast({
            type: 'success',
            title: 'Conversation Complete',
            description: `Cost: $${resultMessage.cost_usd?.toFixed(4) || '0'} | Duration: ${Math.round(resultMessage.duration_ms / 1000)}s`,
            duration: 5000,
          });
        }
        break;

      case 'permission_request':
        // Handle permission requests
        const permissionEvent = message as PermissionRequestEvent;
        setPermissionDialog(true, permissionEvent.data);
        addToast({
          type: 'warning',
          title: 'Permission Required',
          description: `Claude wants to use: ${permissionEvent.data.toolName}`,
          duration: 10000,
        });
        break;

      case 'error':
        setError(message.error);
        setIsStreaming(false);
        addToast({
          type: 'error',
          title: 'Stream Error',
          description: message.error,
          duration: 6000,
        });
        break;

      case 'closed':
        setIsStreaming(false);
        addToast({
          type: 'info',
          title: 'Connection Closed',
          description: 'Stream connection ended',
          duration: 3000,
        });
        break;

      default:
        console.log('Unknown message type:', message);
    }
  }, [addStreamMessage, setIsStreaming, setError, addToSessionCost, addToast, setPermissionDialog]);

  // Handle stream errors
  const handleError = useCallback((error: string) => {
    console.error('Stream error:', error);
    setError(error);
    setIsStreaming(false);
    addToast({
      type: 'error',
      title: 'Connection Error',
      description: error,
      duration: 6000,
    });
  }, [setError, setIsStreaming, addToast]);

  // Handle stream close
  const handleClose = useCallback(() => {
    console.log('Stream connection closed');
    setIsStreaming(false);
  }, [setIsStreaming]);

  // Connect to stream when streamingId changes
  useEffect(() => {
    if (!streamingId) {
      // Cleanup when no streaming ID
      if (streamRef.current) {
        streamRef.current.disconnect();
        streamRef.current = null;
      }
      setCurrentStreamingId(null);
      clearStreamMessages();
      setIsStreaming(false);
      return;
    }

    // Set current streaming ID
    setCurrentStreamingId(streamingId);
    clearStreamMessages();

    // Create new stream connection
    const stream = createStream(streamingId);
    streamRef.current = stream;

    // Set up event handlers
    stream.onMessage(handleMessage);
    stream.onError(handleError);
    stream.onClose(handleClose);

    // Connect to stream
    stream.connect().catch((error) => {
      console.error('Failed to connect to stream:', error);
      handleError(`Failed to connect: ${error.message}`);
    });

    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.disconnect();
        streamRef.current = null;
      }
    };
  }, [streamingId, setCurrentStreamingId, clearStreamMessages, setIsStreaming, handleMessage, handleError, handleClose]);

  // Disconnect function for manual disconnection
  const disconnect = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.disconnect();
      streamRef.current = null;
    }
    setCurrentStreamingId(null);
    setIsStreaming(false);
  }, [setCurrentStreamingId, setIsStreaming]);

  return {
    isConnected: streamRef.current?.isConnected || false,
    disconnect,
  };
}; 