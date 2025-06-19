// Request/Response types based on CCUI Backend API Documentation

export interface StartConversationRequest {
  workingDirectory: string;
  initialPrompt: string;
  model?: string;
  allowedTools?: string[];
  disallowedTools?: string[];
  systemPrompt?: string;
}

export interface StartConversationResponse {
  sessionId: string; // CCUI's internal streaming identifier
  streamUrl: string; // Streaming endpoint URL
}

export interface ResumeConversationRequest {
  sessionId: string; // Claude CLI's session ID from conversation history
  message: string;
}

export interface ConversationListQuery {
  projectPath?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'created' | 'updated';
  order?: 'asc' | 'desc';
}

export interface ConversationSummary {
  sessionId: string; // Claude CLI's actual session ID
  projectPath: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface ConversationListResponse {
  conversations: ConversationSummary[];
  total: number;
}

export interface ConversationMessage {
  uuid: string;
  type: 'user' | 'assistant' | 'system';
  message: any; // Anthropic Message or MessageParam type
  timestamp: string;
  sessionId: string; // Claude CLI's actual session ID
  parentUuid?: string;
  costUSD?: number;
  durationMs?: number;
}

export interface ConversationDetailsResponse {
  messages: ConversationMessage[];
  summary: string;
  projectPath: string;
  metadata: {
    totalCost: number;
    totalDuration: number;
    model: string;
  };
}

export interface StopConversationResponse {
  success: boolean;
}

export interface PermissionRequest {
  id: string;
  streamingId: string; // CCUI's streaming ID
  toolName: string;
  toolInput: any;
  timestamp: string;
  status: 'pending' | 'approved' | 'denied';
  modifiedInput?: any;
  denyReason?: string;
}

export interface PermissionListQuery {
  streamingId?: string;
  status?: 'pending' | 'approved' | 'denied';
}

export interface PermissionListResponse {
  permissions: PermissionRequest[];
}

export interface PermissionDecisionRequest {
  action: 'approve' | 'deny';
  modifiedInput?: any;
}

export interface PermissionDecisionResponse {
  success: boolean;
}

export interface SystemStatusResponse {
  claudeVersion: string;
  claudePath: string;
  configPath: string;
  activeConversations: number;
}

export interface ModelsResponse {
  models: string[];
  defaultModel: string;
}

export interface ErrorResponse {
  error: string;
  code?: string;
} 