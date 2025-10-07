import { useState } from 'react';
import { Copy, Check, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  onViewFile?: (file: { name: string; content: string; type: 'text' | 'code' | 'image' | 'markdown'; language?: string; }) => void;
  onViewSpreadsheet?: () => void;
}

export function ChatMessage({ content, role, timestamp, onViewFile, onViewSpreadsheet }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const renderContent = (text: string) => {
    // Check for "Click to view" spreadsheet text
    const clickToViewMatch = text.match(/(.*?)\n📊 \*\*Click to view\*\* your updated spreadsheet!(.*)/);
    
    if (clickToViewMatch && onViewSpreadsheet) {
      const [, beforeText, afterText] = clickToViewMatch;
      return (
        <div className="space-y-3">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{beforeText}</div>
          <div
            className="bg-muted border border-border/50 rounded-lg p-3 cursor-pointer hover:bg-muted/80 transition-colors"
            onClick={onViewSpreadsheet}
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">View updated spreadsheet</span>
            </div>
          </div>
          {afterText && <div className="whitespace-pre-wrap text-sm leading-relaxed">{afterText}</div>}
        </div>
      );
    }

    // Handle code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = text.split(codeBlockRegex);
    
    return parts.map((part, index) => {
      if (index % 3 === 0) {
        // Regular text
        return <span key={index} className="whitespace-pre-wrap text-sm leading-relaxed">{part}</span>;
      } else if (index % 3 === 1) {
        // Language identifier
        return null;
      } else {
        // Code content
        const language = parts[index - 1] || 'text';
        return (
          <div key={index} className="my-3">
            <div className="bg-muted border border-border/50 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border/50">
                <span className="text-xs font-mono text-muted-foreground">{language}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(part)}
                  className="h-6 px-2 text-xs"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
              <pre className="p-3 overflow-x-auto text-xs font-mono">
                <code>{part}</code>
              </pre>
            </div>
          </div>
        );
      }
    });
  };

  return (
    <div className={cn(
      "flex gap-3 py-2",
      role === 'user' ? "justify-end" : "justify-start"
    )}>
      {role === 'assistant' && (
        <div className="w-6 h-6 bg-muted rounded flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-xs font-medium text-muted-foreground">Z</span>
        </div>
      )}
      
      <div className={cn(
        "flex-1 max-w-[85%]",
        role === 'user' && "flex flex-col items-end"
      )}>
        <div className={cn(
          "rounded-lg px-3 py-2",
          role === 'user' 
            ? "bg-foreground text-background" 
            : "bg-muted"
        )}>
          {renderContent(content)}
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">{timestamp}</span>
          {role === 'assistant' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 px-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          )}
        </div>
      </div>
      
      {role === 'user' && (
        <div className="w-6 h-6 bg-foreground rounded flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-xs font-medium text-background">U</span>
        </div>
      )}
    </div>
  );
}