import axios from 'axios';
import type {
  StartConversationRequest,
  StartConversationResponse,
  ResumeConversationRequest,
  ConversationListQuery,
  ConversationListResponse,
  ConversationDetailsResponse,
  StopConversationResponse,
  PermissionListQuery,
  PermissionListResponse,
  PermissionDecisionRequest,
  PermissionDecisionResponse,
  SystemStatusResponse,
  ModelsResponse,
} from '@/types';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.error) {
      const apiError = new Error(error.response.data.error);
      (apiError as any).code = error.response.data.code;
      (apiError as any).statusCode = error.response.status;
      throw apiError;
    }
    throw error;
  }
);

// API service object with all endpoints
export const api = {
  // Health check
  health: () => apiClient.get('/health'),

  // Conversation management
  conversations: {
    // Start a new conversation
    start: (data: StartConversationRequest) =>
      apiClient.post<StartConversationResponse>('/api/conversations/start', data)
        .then(response => response.data),

    // Resume an existing conversation
    resume: (data: ResumeConversationRequest) =>
      apiClient.post<StartConversationResponse>('/api/conversations/resume', data)
        .then(response => response.data),

    // List conversations with optional filtering
    list: (params?: ConversationListQuery) =>
      apiClient.get<ConversationListResponse>('/api/conversations', { params })
        .then(response => response.data),

    // Get specific conversation details
    get: (sessionId: string) =>
      apiClient.get<ConversationDetailsResponse>(`/api/conversations/${sessionId}`)
        .then(response => response.data),

    // Stop an active conversation
    stop: (streamingId: string) =>
      apiClient.post<StopConversationResponse>(`/api/conversations/${streamingId}/stop`)
        .then(response => response.data),
  },

  // Permission management
  permissions: {
    // List permission requests
    list: (params?: PermissionListQuery) =>
      apiClient.get<PermissionListResponse>('/api/permissions', { params })
        .then(response => response.data),

    // Make decision on permission request
    decide: (requestId: string, decision: PermissionDecisionRequest) =>
      apiClient.post<PermissionDecisionResponse>(`/api/permissions/${requestId}`, decision)
        .then(response => response.data),
  },

  // System management
  system: {
    // Get system status
    status: () =>
      apiClient.get<SystemStatusResponse>('/api/system/status')
        .then(response => response.data),

    // Get available models
    models: () =>
      apiClient.get<ModelsResponse>('/api/models')
        .then(response => response.data),
  },
};

export default apiClient; 