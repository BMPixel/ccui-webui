import { 
  File, 
  FileEdit, 
  Terminal, 
  Search, 
  Globe, 
  List, 
  Play, 
  Settings, 
  Brain, 
  ChevronRight,
  Folder
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ToolUseProps {
  id: string;
  name: string;
  input: any;
}

export const ToolUseRenderer = ({ id, name, input }: ToolUseProps) => {
  const getToolIcon = (toolName: string) => {
    switch (toolName.toLowerCase()) {
      case 'read':
        return <File className="h-4 w-4" />;
      case 'edit':
      case 'multiedit':
        return <FileEdit className="h-4 w-4" />;
      case 'bash':
        return <Terminal className="h-4 w-4" />;
      case 'grep':
        return <Search className="h-4 w-4" />;
      case 'websearch':
        return <Globe className="h-4 w-4" />;
      case 'webfetch':
        return <Globe className="h-4 w-4" />;
      case 'todoread':
      case 'todowrite':
        return <List className="h-4 w-4" />;
      case 'task':
        return <Play className="h-4 w-4" />;
      case 'exit_plan_mode':
        return <Brain className="h-4 w-4" />;
      case 'glob':
        return <Folder className="h-4 w-4" />;
      case 'ls':
        return <Folder className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getToolColor = () => {
    // All tools now use muted colors consistent with minimal design
    return 'text-muted-foreground bg-muted/30';
  };

  const renderInputDetails = () => {
    switch (name.toLowerCase()) {
      case 'read':
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium text-foreground">File: {input.file_path}</div>
            {input.offset && <div className="text-xs text-muted-foreground">Offset: {input.offset}</div>}
            {input.limit && <div className="text-xs text-muted-foreground">Limit: {input.limit}</div>}
          </div>
        );
      
      case 'edit':
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium text-foreground">File: {input.file_path}</div>
            <div className="text-xs bg-muted/50 rounded p-2">
              <div className="text-muted-foreground font-medium">- {input.old_string?.substring(0, 50)}...</div>
            </div>
            <div className="text-xs bg-highlight/10 rounded p-2">
              <div className="text-highlight font-medium">+ {input.new_string?.substring(0, 50)}...</div>
            </div>
          </div>
        );
      
      case 'multiedit':
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium text-foreground">File: {input.file_path}</div>
            <div className="text-xs text-muted-foreground">{input.edits?.length} edits</div>
            {input.edits?.slice(0, 2).map((edit: any, index: number) => (
              <div key={index} className="text-xs space-y-1">
                <div className="bg-muted/50 rounded p-1">
                  <div className="text-muted-foreground">- {edit.old_string?.substring(0, 30)}...</div>
                </div>
                <div className="bg-highlight/10 rounded p-1">
                  <div className="text-highlight">+ {edit.new_string?.substring(0, 30)}...</div>
                </div>
              </div>
            ))}
            {input.edits?.length > 2 && (
              <div className="text-xs text-muted-foreground">... and {input.edits.length - 2} more</div>
            )}
          </div>
        );
      
      case 'bash':
        return (
          <div className="space-y-1">
            <div className="text-sm font-mono bg-muted text-foreground p-2 rounded">
              {input.command}
            </div>
            {input.description && (
              <div className="text-xs text-muted-foreground">{input.description}</div>
            )}
          </div>
        );
      
      case 'grep':
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium text-foreground">Search: "{input.pattern}"</div>
            <div className="text-xs text-muted-foreground">Path: {input.path}</div>
            {input.include && <div className="text-xs text-muted-foreground">Include: {input.include}</div>}
          </div>
        );
      
      case 'websearch':
        return (
          <div className="text-sm font-medium text-foreground">Query: "{input.query}"</div>
        );
      
      case 'webfetch':
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium text-foreground">URL: {input.url}</div>
            {input.prompt && <div className="text-xs text-muted-foreground">Prompt: {input.prompt}</div>}
          </div>
        );
      
      case 'todowrite':
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium text-foreground">{input.todos?.length} todo items</div>
            {input.todos?.slice(0, 3).map((todo: any, index: number) => (
              <div key={index} className="text-xs flex items-center gap-2">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  todo.status === 'completed' ? 'bg-highlight' :
                  todo.status === 'in_progress' ? 'bg-muted-foreground' : 'bg-muted'
                )} />
                <span className="text-muted-foreground">{todo.content?.substring(0, 40)}...</span>
              </div>
            ))}
            {input.todos?.length > 3 && (
              <div className="text-xs text-muted-foreground">... and {input.todos.length - 3} more</div>
            )}
          </div>
        );
      
      case 'task':
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium text-foreground">{input.description}</div>
            {input.prompt && (
              <div className="text-xs text-muted-foreground italic">"{input.prompt}"</div>
            )}
          </div>
        );
      
      case 'exit_plan_mode':
        return (
          <div className="text-sm">
            <div className="font-medium mb-1 text-foreground">Plan:</div>
            <div className="text-xs bg-muted/50 p-2 rounded whitespace-pre-wrap text-muted-foreground">
              {input.plan?.substring(0, 100)}...
            </div>
          </div>
        );

      case 'glob':
      case 'ls':
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium text-foreground">Path: {input.path}</div>
            {input.pattern && <div className="text-xs text-muted-foreground">Pattern: {input.pattern}</div>}
            {input.include && <div className="text-xs text-muted-foreground">Include: {input.include}</div>}
          </div>
        );

      default:
        return (
          <div className="text-sm text-muted-foreground">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(input, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className={cn(
      "rounded-lg p-3",
      getToolColor()
    )}>
      <div className="flex items-center gap-2 mb-2">
        {getToolIcon(name)}
        <span className="font-semibold text-sm text-foreground capitalize">
          {name}
        </span>
        <span className="text-xs font-mono text-muted-foreground">
          {id.slice(-8)}
        </span>
        <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto" />
      </div>
      
      {renderInputDetails()}
    </div>
  );
}; 