import { Brain, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface ThinkingProps {
  thinking?: string;
  signature?: string;
  data?: string; // For redacted thinking
  isRedacted?: boolean;
}

export const ThinkingRenderer = ({ thinking, signature, data, isRedacted }: ThinkingProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const content = thinking || data || '';
  const isLongContent = content.length > 300;
  const displayContent = expanded || !isLongContent 
    ? content 
    : content.substring(0, 300) + '...';

  return (
    <div className="py-2">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-sm">
          {isRedacted ? 'Redacted Thinking' : 'Thinking'}
        </span>
        
        {signature && (
          <span className="text-xs font-mono text-muted-foreground opacity-60">
            {signature.slice(-8)}
          </span>
        )}
        
        {isLongContent && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? (
              <>
                <ChevronDown className="h-3 w-3" />
                Show less
              </>
            ) : (
              <>
                <ChevronRight className="h-3 w-3" />
                Show more
              </>
            )}
          </button>
        )}
      </div>
      
      {isRedacted ? (
        <div className="text-sm italic">
          <div className="flex items-center gap-2 mb-2">
            <EyeOff className="h-4 w-4" />
            <span className="font-medium">Content is encrypted/redacted</span>
          </div>
          <div className="text-xs font-mono break-all opacity-70">
            {displayContent}
          </div>
        </div>
      ) : (
        <div className="text-sm whitespace-pre-wrap">
          {displayContent}
        </div>
      )}
    </div>
  );
};