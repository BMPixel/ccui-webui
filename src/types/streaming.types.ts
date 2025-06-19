// Streaming types based on CCUI Backend API Documentation

// Base stream message interface
export interface StreamMessage {
  type: string;
  session_id: string; // Claude CLI's session ID (in stream messages)
  parent_tool_use_id?: string | null;
}

// Connection Events
export interface ConnectedEvent {
  type: 'connected';
  streaming_id: string; // CCUI's streaming ID
  timestamp: string;
}

export interface ErrorEvent {
  type: 'error';
  error: string;
  streamingId: string; // CCUI's streaming ID
  timestamp: string;
}

export interface ClosedEvent {
  type: 'closed';
  streamingId: string; // CCUI's streaming ID
  timestamp: string;
}

// Claude CLI Stream Messages
export interface SystemInitMessage extends StreamMessage {
  type: 'system';
  subtype: 'init';
  cwd: string;
  session_id: string;
  tools: string[];
  mcp_servers: { name: string; status: string; }[];
  model: string;
  permissionMode: string;
  apiKeySource: string;
}

export interface AssistantStreamMessage extends StreamMessage {
  type: 'assistant';
  message: {
    id: string;
    content: ContentBlock[];
    role: 'assistant';
    model: string;
    stop_reason: StopReason | null;
    stop_sequence: string | null;
    usage: Usage;
  };
  parent_tool_use_id: string | null;
  session_id: string;
}

export interface UserStreamMessage extends StreamMessage {
  type: 'user';
  message: {
    role: 'user';
    content: ContentBlockParam[];
  };
  parent_tool_use_id: string | null;
  session_id: string;
}

export interface ResultStreamMessage extends StreamMessage {
  type: 'result';
  subtype: 'success' | 'error_max_turns';
  cost_usd: number;
  is_error: boolean;
  duration_ms: number;
  duration_api_ms: number;
  num_turns: number;
  result?: string;
  total_cost: number;
  usage: {
    input_tokens: number;
    cache_creation_input_tokens: number;
    cache_read_input_tokens: number;
    output_tokens: number;
    server_tool_use: {
      web_search_requests: number;
    };
  };
  session_id: string;
}

// Permission Events
export interface PermissionRequestEvent {
  type: 'permission_request';
  data: {
    id: string;
    streamingId: string;
    toolName: string;
    toolInput: any;
    timestamp: string;
    status: 'pending';
  };
  streamingId: string; // CCUI's streaming ID
  timestamp: string;
}

// Content Block Types (based on Anthropic SDK)
export type ContentBlock =
  | TextBlock
  | ToolUseBlock
  | ServerToolUseBlock
  | WebSearchToolResultBlock
  | ThinkingBlock
  | RedactedThinkingBlock;

export interface TextBlock {
  type: 'text';
  text: string;
  citations?: TextCitation[] | null;
}

export interface ToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: unknown;
}

export interface ServerToolUseBlock {
  type: 'server_tool_use';
  id: string;
  name: 'web_search';
  input: unknown;
}

export interface ThinkingBlock {
  type: 'thinking';
  thinking: string;
  signature: string;
}

export interface RedactedThinkingBlock {
  type: 'redacted_thinking';
  data: string;
}

export interface WebSearchToolResultBlock {
  type: 'web_search_tool_result';
  // Add specific fields when available
}

export interface TextCitation {
  // Add citation fields when available
}

export type ContentBlockParam = any; // To be defined based on Anthropic SDK

// Usage and Billing Types
export interface Usage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens: number | null;
  cache_read_input_tokens: number | null;
  server_tool_use: ServerToolUsage | null;
  service_tier: 'standard' | 'priority' | 'batch' | null;
}

export interface ServerToolUsage {
  web_search_requests: number;
}

export type StopReason = 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use' | 'pause_turn' | 'refusal';

// Union type for all possible stream messages
export type StreamEventType = 
  | ConnectedEvent
  | ErrorEvent
  | ClosedEvent
  | SystemInitMessage
  | AssistantStreamMessage
  | UserStreamMessage
  | ResultStreamMessage
  | PermissionRequestEvent; 