import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

export function ChatMessage({ content, role, timestamp }: ChatMessageProps) {
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

  if (role === 'user') {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-[70%]">
          <div className="bg-primary text-white rounded-2xl rounded-br-md px-4 py-3">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          </div>
          <div className="text-xs text-muted-foreground mt-1 text-right">
            {timestamp}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6">
      <div className="flex gap-3 max-w-[85%]">
        {/* Claude Avatar */}
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
          <span className="text-white font-bold text-xs">C</span>
        </div>

        <div className="flex-1">
          <div className="bg-card border border-border rounded-2xl rounded-tl-md px-4 py-3 relative group">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
              {content}
            </p>
            
            {/* Copy button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className={cn(
                "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity",
                "h-8 w-8 p-0"
              )}
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground mt-1">
            Claude • {timestamp}
          </div>
        </div>
      </div>
    </div>
  );
}