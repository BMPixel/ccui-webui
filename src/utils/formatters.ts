// Date formatting utilities
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatDate(dateString);
};

// Cost formatting utilities
export const formatCost = (costUSD: number): string => {
  if (costUSD < 0.01) {
    return `$${(costUSD * 1000).toFixed(2)}m`; // Show in millidollars for very small amounts
  }
  return `$${costUSD.toFixed(4)}`;
};

export const formatCostSummary = (costUSD: number): string => {
  if (costUSD === 0) return 'Free';
  if (costUSD < 0.01) return '< $0.01';
  return `$${costUSD.toFixed(2)}`;
};

// Duration formatting utilities
export const formatDuration = (durationMs: number): string => {
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

// Token count formatting
export const formatTokens = (tokens: number): string => {
  if (tokens < 1000) return tokens.toString();
  if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K`;
  return `${(tokens / 1000000).toFixed(1)}M`;
};

// Model name formatting
export const formatModelName = (model: string): string => {
  // Convert model names to more readable format
  const modelMappings: Record<string, string> = {
    'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
    'claude-3-5-haiku-20241022': 'Claude 3.5 Haiku',
    'claude-3-opus-20240229': 'Claude 3 Opus',
  };
  
  return modelMappings[model] || model;
};

// File path formatting
export const formatPath = (path: string, maxLength: number = 50): string => {
  if (path.length <= maxLength) return path;
  
  const parts = path.split('/');
  if (parts.length <= 2) {
    return `...${path.slice(-(maxLength - 3))}`;
  }
  
  const fileName = parts[parts.length - 1];
  const remainingLength = maxLength - fileName.length - 4; // 4 for ".../"
  
  if (remainingLength <= 0) {
    return `.../${fileName}`;
  }
  
  let result = parts[0];
  for (let i = 1; i < parts.length - 1; i++) {
    const nextPart = `/${parts[i]}`;
    if (result.length + nextPart.length <= remainingLength) {
      result += nextPart;
    } else {
      result += '/...';
      break;
    }
  }
  
  return `${result}/${fileName}`;
};

// Message content formatting
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
};

// Session ID utilities
export const formatSessionId = (sessionId: string): string => {
  // Format session ID for display (show first 8 chars)
  return sessionId.slice(0, 8);
}; 