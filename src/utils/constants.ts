// App constants and configuration
export const APP_CONFIG = {
  name: 'CCUI WebUI',
  version: '1.0.0',
  description: 'Claude Code Web Interface',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  health: '/health',
  conversations: {
    base: '/api/conversations',
    start: '/api/conversations/start',
    resume: '/api/conversations/resume',
    stop: (streamingId: string) => `/api/conversations/${streamingId}/stop`,
    get: (sessionId: string) => `/api/conversations/${sessionId}`,
  },
  permissions: {
    base: '/api/permissions',
    decide: (requestId: string) => `/api/permissions/${requestId}`,
  },
  system: {
    status: '/api/system/status',
    models: '/api/models',
  },
  stream: (streamingId: string) => `/api/stream/${streamingId}`,
} as const;

// UI constants
export const UI_CONFIG = {
  sidebar: {
    width: 320,
    mobileBreakpoint: 768,
  },
  conversation: {
    maxMessages: 1000,
    messageBuffer: 50,
  },
  polling: {
    conversationListInterval: 30000, // 30 seconds
    systemStatusInterval: 60000,     // 1 minute
  },
  animations: {
    sidebarTransition: 300,
    messageAppear: 200,
  },
} as const;

// Model options (these can be updated based on API response)
export const DEFAULT_MODELS = [
  'claude-3-5-sonnet-20241022',
  'claude-3-5-haiku-20241022',
  'claude-3-opus-20240229',
] as const;

// Color scheme for different message types
export const MESSAGE_COLORS = {
  user: 'bg-blue-50 border-blue-200',
  assistant: 'bg-gray-50 border-gray-200',
  system: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  thinking: 'bg-purple-50 border-purple-200',
} as const;

// Permission statuses
export const PERMISSION_STATUS = {
  pending: 'pending',
  approved: 'approved',
  denied: 'denied',
} as const;

// Error codes that might be returned by the API
export const ERROR_CODES = {
  CONVERSATION_NOT_FOUND: 'CONVERSATION_NOT_FOUND',
  SYSTEM_STATUS_ERROR: 'SYSTEM_STATUS_ERROR',
  MODELS_ERROR: 'MODELS_ERROR',
  PROCESS_START_FAILED: 'PROCESS_START_FAILED',
  PERMISSION_REQUEST_NOT_FOUND: 'PERMISSION_REQUEST_NOT_FOUND',
} as const; 