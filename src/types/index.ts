// Re-export all types
export * from './api.types';
export * from './streaming.types';

// Import specific types for use in UI types
import type { StreamEventType } from './streaming.types';
import type { PermissionRequest } from './api.types';

// Additional UI-specific types
export interface ConversationState {
  sessionId: string | null;
  streamingId: string | null;
  messages: StreamEventType[];
  isStreaming: boolean;
  error: string | null;
}

export interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  permissionDialogOpen: boolean;
  currentPermissionRequest: PermissionRequest | null;
}

export interface ApiError extends Error {
  code?: string;
  statusCode?: number;
} 