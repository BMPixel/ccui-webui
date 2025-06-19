import { Globe, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface WebSearchResult {
  type: 'web_search_result';
  title: string;
  url: string;
  encrypted_content?: string;
}

interface WebSearchProps {
  tool_use_id: string;
  content: WebSearchResult[];
}

export const WebSearchRenderer = ({ tool_use_id, content }: WebSearchProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const displayResults = expanded ? content : content.slice(0, 3);
  const hasMore = content.length > 3;

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg transition-all duration-200">
      <div className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="h-4 w-4 text-indigo-600" />
          <span className="font-semibold text-sm text-indigo-900">
            Web Search Results
          </span>
          <span className="text-xs font-mono text-indigo-600 opacity-60">
            {tool_use_id.slice(-8)}
          </span>
          <span className="text-xs text-indigo-700 bg-indigo-100 px-2 py-1 rounded">
            {content.length} results
          </span>
          
          {hasMore && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-auto flex items-center gap-1 text-xs text-indigo-700 hover:text-indigo-900 transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronDown className="h-3 w-3" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronRight className="h-3 w-3" />
                  Show all {content.length}
                </>
              )}
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          {displayResults.map((result, index) => (
            <div 
              key={index}
              className="bg-white border border-indigo-200 rounded p-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-2">
                <ExternalLink className="h-3 w-3 text-indigo-500 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-indigo-900 mb-1">
                    {result.title}
                  </div>
                  <div className="text-xs text-indigo-600 break-all">
                    {result.url}
                  </div>
                  {result.encrypted_content && (
                    <div className="text-xs text-gray-500 mt-1 italic">
                      Content available (encrypted)
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {hasMore && !expanded && (
          <div className="text-center mt-2">
            <span className="text-xs text-indigo-600">
              ... and {content.length - 3} more results
            </span>
          </div>
        )}
      </div>
    </div>
  );
}; 