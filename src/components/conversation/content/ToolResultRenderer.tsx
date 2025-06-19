import { CheckCircle, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';

interface ToolResultProps {
  tool_use_id: string;
  content: any; // Allow any type, we'll handle it safely
  is_error?: boolean;
}

export const ToolResultRenderer = ({ content, is_error }: ToolResultProps) => {
  const [expanded, setExpanded] = useState(false);
  
  // Convert content to string safely
  const contentStr = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  
  const isLongContent = contentStr.length > 200;
  const displayContent = expanded || !isLongContent 
    ? contentStr 
    : contentStr.substring(0, 200) + '...';

  const getStatusIcon = () => {
    if (is_error) {
      return <XCircle className="h-4 w-4 text-muted-foreground" />;
    }
    return <CheckCircle className="h-4 w-4 text-highlight" />;
  };

  const getStatusClass = () => {
    if (is_error) {
      return 'bg-muted/30';
    }
    return 'bg-highlight/5';
  };

  const isJson = (() => {
    if (typeof content !== 'string') {
      return true; // Non-string content will be JSON stringified
    }
    try {
      JSON.parse(content);
      return true;
    } catch {
      return false;
    }
  })();

  const renderContent = () => {
    if (isJson) {
      try {
        const parsed = JSON.parse(displayContent);
        return (
          <pre className="text-xs overflow-x-auto whitespace-pre-wrap bg-muted text-muted-foreground p-3 rounded">
            {JSON.stringify(parsed, null, 2)}
          </pre>
        );
      } catch {
        // Fall through to text rendering
      }
    }

    // Check if it looks like terminal output
    if (contentStr.includes('\n') && (contentStr.includes('$') || contentStr.includes('>'))) {
      return (
        <pre className="text-xs font-mono bg-muted text-muted-foreground p-3 rounded overflow-x-auto whitespace-pre-wrap">
          {displayContent}
        </pre>
      );
    }

    // Regular text content
    return (
      <div className="text-sm whitespace-pre-wrap text-muted-foreground">
        {displayContent}
      </div>
    );
  };

  return (
    <div className={cn(
      "rounded-lg transition-all duration-200",
      getStatusClass()
    )}>
      <div className="p-3">
        <div 
          className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-muted/10 -mx-1 px-1 py-1 rounded transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          {getStatusIcon()}
          <span className="font-semibold text-sm text-foreground">
            {is_error ? 'Tool Error' : 'Tool Result'}
          </span>
          
          <div className="ml-auto flex items-center gap-1">
            {expanded ? (
              <>
                <ChevronDown className="h-3 w-3" />
                <span className="text-xs text-muted-foreground">Show less</span>
              </>
            ) : (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="text-xs text-muted-foreground">
                  {isLongContent ? 'Show more' : 'Show details'}
                </span>
              </>
            )}
          </div>
        </div>
        
        {expanded && (
          <div className="transition-all duration-200">
            {renderContent()}
          </div>
        )}
      </div>
    </div>
  );
}; 