# CCUI Backend API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Base URL and Configuration](#base-url-and-configuration)
3. [API Endpoints](#api-endpoints)
4. [Real-Time Streaming](#real-time-streaming)
5. [TypeScript Types](#typescript-types)
6. [Error Handling](#error-handling)
7. [Frontend Integration Patterns](#frontend-integration-patterns)

## Overview

CCUI (Claude Code Web UI) is a backend server that provides a web interface for managing Claude CLI processes. The backend offers REST APIs for conversation management, real-time streaming for Claude interactions, and permission handling through the Model Context Protocol (MCP).

### Architecture

```
Frontend (Browser) ──► CCUI Backend ──► Claude CLI Process
        │                     │                │
        │                     ▼                │
        └──────────────► MCP Server ◄──────────┘
                    (Permission Handling)
```

## Base URL and Configuration

**Default Base URL:** `http://localhost:3001`

**Environment Variables:**
- `PORT`: Server port (default: 3001)
- `CLAUDE_HOME_PATH`: Claude data directory (default: ~/.claude)
- `MCP_CONFIG_PATH`: MCP configuration file path
- `LOG_LEVEL`: Logging level (debug, info, warn, error)

## API Endpoints

### Health Check

#### `GET /health`

Check if the server is running.

**Response:**
```json
{
  "status": "ok"
}
```

### Conversation Management

#### `POST /api/conversations/start`

Start a new conversation with Claude.

**Request Body:**
```typescript
interface StartConversationRequest {
  workingDirectory: string;    // Absolute path where Claude should operate
  initialPrompt: string;       // First message to send to Claude
  model?: string;              // Optional: specific model version (e.g., 'opus', 'sonnet')
  allowedTools?: string[];     // Optional: whitelist of tools Claude can use without asking
  disallowedTools?: string[];  // Optional: blacklist of tools Claude cannot use
  systemPrompt?: string;       // Optional: override default system prompt
}
```

**Example Request:**
```javascript
const response = await fetch('/api/conversations/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    workingDirectory: '/home/user/project',
    initialPrompt: 'List files in the current directory',
    model: 'claude-opus-4-20250514'
  })
});
```

**Response:**
```typescript
interface StartConversationResponse {
  sessionId: string;           // Unique identifier for this conversation
  streamUrl: string;           // Streaming endpoint to receive real-time updates
}
```

**Example Response:**
```json
{
  "sessionId": "abc123-def456-ghi789",
  "streamUrl": "/api/stream/abc123-def456-ghi789"
}
```

#### `GET /api/conversations`

List all conversations with optional filtering and pagination.

**Query Parameters:**
```typescript
interface ConversationListQuery {
  projectPath?: string;        // Filter by working directory
  limit?: number;              // Max results per page (default: 20)
  offset?: number;             // Skip N results for pagination
  sortBy?: 'created' | 'updated';  // Sort field
  order?: 'asc' | 'desc';      // Sort direction
}
```

**Example Request:**
```javascript
const response = await fetch('/api/conversations?limit=10&sortBy=updated&order=desc');
```

**Response:**
```typescript
interface ConversationListResponse {
  conversations: ConversationSummary[];  // Array of conversation metadata
  total: number;               // Total count for pagination
}

interface ConversationSummary {
  sessionId: string;        // Unique identifier for the conversation
  projectPath: string;      // Original working directory
  summary: string;          // Brief description of the conversation
  createdAt: string;        // ISO 8601 timestamp when conversation started
  updatedAt: string;        // ISO 8601 timestamp of last modification
  messageCount: number;     // Total number of messages in the conversation
}
```

#### `GET /api/conversations/:sessionId`

Get complete conversation details including all messages.

**Response:**
```typescript
interface ConversationDetailsResponse {
  messages: ConversationMessage[];  // Complete message history
  summary: string;             // Conversation summary
  projectPath: string;         // Working directory
  metadata: {
    totalCost: number;         // Sum of all message costs
    totalDuration: number;     // Total processing time
    model: string;             // Model used for conversation
  };
}

interface ConversationMessage {
  uuid: string;             // Unique identifier for this specific message
  type: 'user' | 'assistant' | 'system';  // Who sent the message
  message: any;             // Anthropic Message or MessageParam type
  timestamp: string;        // ISO 8601 timestamp when message was created
  sessionId: string;        // Links message to parent conversation
  parentUuid?: string;      // For threading - references previous message in chain
  costUSD?: number;         // API cost for this message (assistant messages only)
  durationMs?: number;      // Time taken to generate response (assistant messages only)
}
```

#### `POST /api/conversations/:sessionId/continue`

Continue an existing conversation with a new message.

**Request Body:**
```typescript
interface ContinueConversationRequest {
  prompt: string;              // New message to send to Claude
}
```

**Response:**
```typescript
interface ContinueConversationResponse {
  streamUrl: string;           // Same streaming endpoint as before
}
```

#### `POST /api/conversations/:sessionId/stop`

Stop an active conversation.

**Response:**
```typescript
interface StopConversationResponse {
  success: boolean;            // Whether process was successfully terminated
}
```

### Permission Management

#### `GET /api/permissions`

List pending permission requests.

**Query Parameters:**
```typescript
interface PermissionListQuery {
  sessionId?: string;          // Filter by conversation
  status?: 'pending' | 'approved' | 'denied';  // Filter by status
}
```

**Response:**
```typescript
interface PermissionListResponse {
  permissions: PermissionRequest[];  // Array of permission requests
}

interface PermissionRequest {
  id: string;               // Unique request identifier
  sessionId: string;        // Which conversation triggered this request
  toolName: string;         // Name of the tool Claude wants to use
  toolInput: any;           // Parameters Claude wants to pass to the tool
  timestamp: string;        // When permission was requested
  status: 'pending' | 'approved' | 'denied';  // Current state of the request
  modifiedInput?: any;      // User-modified parameters (if approved with changes)
  denyReason?: string;      // Reason for denial (if denied)
}
```

#### `POST /api/permissions/:requestId`

Approve or deny a permission request.

**Request Body:**
```typescript
interface PermissionDecisionRequest {
  action: 'approve' | 'deny';  // User's decision
  modifiedInput?: any;         // Optional: user can modify tool parameters before approval
}
```

**Response:**
```typescript
interface PermissionDecisionResponse {
  success: boolean;            // Whether decision was recorded
}
```

### System Management

#### `GET /api/system/status`

Get Claude installation and system information.

**Response:**
```typescript
interface SystemStatusResponse {
  claudeVersion: string;       // Version of Claude CLI installed
  claudePath: string;          // Location of Claude executable
  configPath: string;          // Location of Claude config directory
  activeConversations: number; // Number of running Claude processes
}
```

#### `GET /api/models`

Get available Claude models.

**Response:**
```typescript
interface ModelsResponse {
  models: string[];            // List of available model identifiers
  defaultModel: string;        // Default model to use if none specified
}
```

## Real-Time Streaming

### `GET /api/stream/:sessionId`

Establish a real-time streaming connection to receive conversation updates.

**Connection Type:** HTTP streaming with newline-delimited JSON (not Server-Sent Events)

**Headers Set by Server:**
```
Content-Type: application/x-ndjson
Cache-Control: no-cache
Connection: keep-alive
X-Accel-Buffering: no
```

### Frontend Streaming Implementation

```javascript
// Connect to stream
const response = await fetch(`/api/stream/${sessionId}`);
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const lines = decoder.decode(value).split('\n');
  for (const line of lines) {
    if (line.trim()) {
      const message = JSON.parse(line);
      handleStreamMessage(message);
    }
  }
}
```

### Stream Message Types

All stream messages include these base fields:
```typescript
interface StreamMessage {
  type: string;
  session_id: string;
  parent_tool_use_id?: string | null;
}
```

#### Connection Events

**Connected:**
```typescript
interface ConnectedEvent {
  type: 'connected';
  session_id: string;
  timestamp: string;
}
```

**Error:**
```typescript
interface ErrorEvent {
  type: 'error';
  error: string;
  sessionId: string;
  timestamp: string;
}
```

**Closed:**
```typescript
interface ClosedEvent {
  type: 'closed';
  sessionId: string;
  timestamp: string;
}
```

#### Claude CLI Stream Messages

**System Initialization:**
```typescript
interface SystemInitMessage {
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
```

**Assistant Message:**
```typescript
interface AssistantStreamMessage {
  type: 'assistant';
  message: {
    id: string;
    content: Array<ContentBlock>;
    role: 'assistant';
    model: string;
    stop_reason: StopReason | null;
    stop_sequence: string | null;
    usage: Usage;
  };
  parent_tool_use_id: string | null;
  session_id: string;
}
```

**User Message:**
```typescript
interface UserStreamMessage {
  type: 'user';
  message: {
    role: 'user';
    content: Array<ContentBlockParam>;
  };
  parent_tool_use_id: string | null;
  session_id: string;
}
```

**Result Message:**
```typescript
interface ResultStreamMessage {
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
```

#### Permission Request Events

**Permission Request:**
```typescript
interface PermissionRequestEvent {
  type: 'permission_request';
  data: PermissionRequest;
  sessionId: string;
  timestamp: string;
}
```

## TypeScript Types

### Core Types

```typescript
// Configuration types
interface ConversationConfig {
  workingDirectory: string;
  initialPrompt: string;
  model?: string;
  allowedTools?: string[];
  disallowedTools?: string[];
  systemPrompt?: string;
}

// Error types
class CCUIError extends Error {
  constructor(public code: string, message: string, public statusCode: number = 500);
}

// MCP types
interface MCPPermissionToolInput {
  tool_name: string;
  input: Record<string, any>;
  session_id: string;
}

interface MCPPermissionResponse {
  behavior: 'allow' | 'deny';
  updatedInput?: any;
  message?: string;
}
```

### Content Block Types

```typescript
// Based on Anthropic SDK types
type ContentBlock =
  | TextBlock
  | ToolUseBlock
  | ServerToolUseBlock
  | WebSearchToolResultBlock
  | ThinkingBlock
  | RedactedThinkingBlock;

interface TextBlock {
  type: 'text';
  text: string;
  citations?: Array<TextCitation> | null;
}

interface ToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: unknown;
}

interface ServerToolUseBlock {
  type: 'server_tool_use';
  id: string;
  name: 'web_search';
  input: unknown;
}

interface ThinkingBlock {
  type: 'thinking';
  thinking: string;
  signature: string;
}

interface RedactedThinkingBlock {
  type: 'redacted_thinking';
  data: string;
}
```

### Usage and Billing Types

```typescript
interface Usage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens: number | null;
  cache_read_input_tokens: number | null;
  server_tool_use: ServerToolUsage | null;
  service_tier: 'standard' | 'priority' | 'batch' | null;
}

interface ServerToolUsage {
  web_search_requests: number;
}

type StopReason = 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use' | 'pause_turn' | 'refusal';
```

## Error Handling

### HTTP Status Codes

- `200`: Success
- `400`: Bad Request (invalid request format)
- `404`: Not Found (conversation/resource not found)
- `500`: Internal Server Error

### Error Response Format

```typescript
interface ErrorResponse {
  error: string;               // Human-readable error message
  code?: string;               // Machine-readable error code
}
```

### Common Error Codes

- `CONVERSATION_NOT_FOUND`: Specified conversation doesn't exist
- `SYSTEM_STATUS_ERROR`: Failed to get system status
- `MODELS_ERROR`: Failed to get available models
- `PROCESS_START_FAILED`: Failed to start Claude CLI process
- `PERMISSION_REQUEST_NOT_FOUND`: Permission request doesn't exist

### Frontend Error Handling

```javascript
try {
  const response = await fetch('/api/conversations/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API Error: ${error.error} (${error.code || 'unknown'})`);
  }
  
  const data = await response.json();
  // Handle success
} catch (error) {
  console.error('Failed to start conversation:', error);
  // Handle error in UI
}
```

## Frontend Integration Patterns

### Starting a Conversation

```javascript
// 1. Start conversation
const startResponse = await fetch('/api/conversations/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    workingDirectory: '/home/user/project',
    initialPrompt: 'Help me refactor this code',
    model: 'claude-opus-4-20250514'
  })
});

const { sessionId, streamUrl } = await startResponse.json();

// 2. Connect to stream for real-time updates
const streamResponse = await fetch(streamUrl);
const reader = streamResponse.body.getReader();
const decoder = new TextDecoder();

// 3. Process streaming messages
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const lines = decoder.decode(value).split('\n');
  for (const line of lines) {
    if (line.trim()) {
      const message = JSON.parse(line);
      
      switch (message.type) {
        case 'connected':
          console.log('Connected to stream');
          break;
        case 'system':
          console.log('Claude initialized:', message);
          break;
        case 'assistant':
          displayAssistantMessage(message.message);
          break;
        case 'result':
          console.log('Conversation complete:', message);
          break;
        case 'permission_request':
          handlePermissionRequest(message.data);
          break;
        case 'error':
          console.error('Stream error:', message.error);
          break;
      }
    }
  }
}
```

### Permission Handling

```javascript
// Handle permission requests from stream
function handlePermissionRequest(request) {
  const { id, toolName, toolInput } = request;
  
  // Show UI to user
  const userDecision = await showPermissionDialog(toolName, toolInput);
  
  // Send decision back to server
  await fetch(`/api/permissions/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: userDecision.approved ? 'approve' : 'deny',
      modifiedInput: userDecision.modifiedInput
    })
  });
}
```

### Continuing Conversations

```javascript
// Continue existing conversation
async function continueConversation(sessionId, newMessage) {
  const response = await fetch(`/api/conversations/${sessionId}/continue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: newMessage
    })
  });
  
  const { streamUrl } = await response.json();
  // Reconnect to same stream URL for updates
  // (Stream URL remains the same for a given session)
}
```

### Building Conversation History UI

```javascript
// Load conversation history
async function loadConversation(sessionId) {
  const response = await fetch(`/api/conversations/${sessionId}`);
  const conversation = await response.json();
  
  // conversation.messages contains all messages
  // conversation.metadata contains cost and duration info
  
  conversation.messages.forEach(msg => {
    switch (msg.type) {
      case 'user':
        displayUserMessage(msg.message.content);
        break;
      case 'assistant':
        displayAssistantMessage(msg.message.content);
        if (msg.costUSD) {
          displayCost(msg.costUSD);
        }
        break;
    }
  });
}
```

---

**Last Updated:** December 6, 2025  
**Backend Version:** Current main branch