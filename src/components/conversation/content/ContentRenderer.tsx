import { ToolUseRenderer } from './ToolUseRenderer';
import { ToolResultRenderer } from './ToolResultRenderer';
import { ThinkingRenderer } from './ThinkingRenderer';
import { WebSearchRenderer } from './WebSearchRenderer';
import { JsonViewer } from '../JsonViewer';

interface ContentBlock {
  type: string;
  [key: string]: any;
}

interface ContentRendererProps {
  content: string | ContentBlock | ContentBlock[];
}

export const ContentRenderer = ({ content }: ContentRendererProps) => {
  // Handle null or undefined content
  if (!content) {
    return <div className="text-sm text-gray-500 italic">No content</div>;
  }

  // Handle simple string content
  if (typeof content === 'string') {
    return (
      <div className="prose prose-sm max-w-none">
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    );
  }

  // Handle array of content blocks
  if (Array.isArray(content)) {
    if (content.length === 0) {
      return <div className="text-sm text-gray-500 italic">Empty content</div>;
    }
    
    return (
      <div className="space-y-3">
        {content.map((block, index) => {
          // Additional safety check - ensure we're not accidentally rendering an object
          if (block && typeof block === 'object' && block.type && block.text && typeof block.text === 'string') {
            // This is a text block - handle it specially to prevent the React error
            if (block.type === 'text') {
              return (
                <div key={index} className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{block.text}</p>
                </div>
              );
            }
          }
          return <ContentBlockRenderer key={index} block={block} index={index} />;
        })}
      </div>
    );
  }

  // Handle single content block
  if (content && typeof content === 'object') {
    // Special case for direct text blocks that might be passed incorrectly
    if (content.type === 'text' && typeof content.text === 'string') {
      return (
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap">{content.text}</p>
        </div>
      );
    }
    return <ContentBlockRenderer block={content} index={0} />;
  }

  // Fallback to JSON viewer - ensure we never render raw objects
  return <JsonViewer data={content} />;
};

const ContentBlockRenderer = ({ block, index }: { block: ContentBlock; index: number }) => {
  try {
    // Handle null/undefined blocks
    if (!block) {
      return (
        <div className="text-sm text-gray-500 italic">
          Empty block at position {index}
        </div>
      );
    }

    // Handle non-object blocks
    if (typeof block !== 'object') {
      return <JsonViewer data={block} title={`Block ${index}`} />;
    }

    // Handle blocks without a type
    if (!block.type) {
      return <JsonViewer data={block} title={`Untyped block ${index}`} />;
    }

    const { type } = block;

  switch (type) {
    case 'text':
      // Ensure we have text content
      if (typeof block.text !== 'string') {
        return <JsonViewer data={block} title={`Invalid text block ${index}`} />;
      }
      return (
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap">{block.text}</p>
        </div>
      );

    case 'tool_use':
      // Validate required fields
      if (!block.id || !block.name) {
        return <JsonViewer data={block} title={`Invalid tool_use block ${index}`} />;
      }
      return (
        <ToolUseRenderer
          id={block.id}
          name={block.name}
          input={block.input || {}}
        />
      );

    case 'tool_result':
      // Validate required fields
      if (!block.tool_use_id || block.content === undefined) {
        return <JsonViewer data={block} title={`Invalid tool_result block ${index}`} />;
      }
      return (
        <ToolResultRenderer
          tool_use_id={block.tool_use_id}
          content={block.content}
          is_error={block.is_error}
        />
      );

    case 'thinking':
      return (
        <ThinkingRenderer
          thinking={block.thinking}
          signature={block.signature}
        />
      );

    case 'redacted_thinking':
      return (
        <ThinkingRenderer
          data={block.data}
          isRedacted={true}
        />
      );

    case 'server_tool_use':
      return (
        <ToolUseRenderer
          id={block.id}
          name={`${block.name} (server)`}
          input={block.input || {}}
        />
      );

    case 'web_search_tool_result':
      return (
        <WebSearchRenderer
          tool_use_id={block.tool_use_id}
          content={block.content || []}
        />
      );

    default:
      // For unknown types, show a minimal visual representation if possible
      if (type && typeof type === 'string') {
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              <span className="font-semibold text-sm text-gray-700 capitalize">
                {type.replace(/_/g, ' ')}
              </span>
            </div>
            <JsonViewer data={block} defaultExpanded={false} />
          </div>
        );
      }
      
      return <JsonViewer data={block} />;
  }
  } catch (error) {
    console.error('Error rendering content block:', error, block);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <div className="text-red-800 text-sm font-medium">
          Rendering Error at block {index}
        </div>
        <div className="text-red-600 text-xs mt-1">
          {error instanceof Error ? error.message : 'Unknown error'}
        </div>
        <JsonViewer data={block} title="Raw block data" defaultExpanded={false} />
      </div>
    );
  }
}; 