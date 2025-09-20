import { useState } from 'react';
import { Copy, Check, FileText, Eye, Code, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  onViewFile?: (file: { name: string; content: string; type: 'text' | 'code' | 'image' | 'markdown'; language?: string; }) => void;
}

export function ChatMessage({ content, role, timestamp, onViewFile }: ChatMessageProps) {
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

  // Check if message contains code or file content
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const codeBlocks = Array.from(content.matchAll(codeBlockRegex));

  const handleViewFile = (codeContent: string, language?: string) => {
    if (onViewFile) {
      onViewFile({
        name: `code.${language || 'txt'}`,
        content: codeContent,
        type: 'code',
        language: language || 'text'
      });
    }
  };

  const renderContentWithCodeBlocks = (text: string) => {
    if (codeBlocks.length === 0) {
      return <span className="whitespace-pre-wrap">{text}</span>;
    }

    const parts = [];
    let lastIndex = 0;

    codeBlocks.forEach((match, index) => {
      const [fullMatch, language, code] = match;
      const matchIndex = match.index!;

      // Add text before code block
      if (matchIndex > lastIndex) {
        parts.push(
          <span key={`text-${index}`} className="whitespace-pre-wrap">
            {text.slice(lastIndex, matchIndex)}
          </span>
        );
      }

      // Add collapsed file block (like Claude AI)
      const codePreview = code.trim().split('\n')[0].slice(0, 50) + (code.trim().split('\n')[0].length > 50 ? '...' : '');
      const lineCount = code.trim().split('\n').length;
      
      // Determine if this is an Excel/CSV file based on content or language
      const isExcelFile = language === 'csv' || 
                         language === 'excel' || 
                         code.includes(',') && code.split('\n').length > 1 && 
                         code.split('\n')[0].split(',').length > 1;
      
      const fileIcon = isExcelFile ? FileSpreadsheet : Code;
      const fileType = isExcelFile ? 'Excel/CSV file' : (language ? `${language} file` : 'Code file');
      const iconBg = isExcelFile ? 'bg-green-500/10' : 'bg-primary/10';
      const iconColor = isExcelFile ? 'text-green-600' : 'text-primary';
      
      parts.push(
        <div key={`code-${index}`} className="my-3">
          <div 
            className="bg-muted/30 border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => handleViewFile(code.trim(), language)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 ${iconBg} rounded-md flex items-center justify-center`}>
                  <fileIcon className={`h-4 w-4 ${iconColor}`} />
                </div>
                <div>
                  <div className="font-medium text-foreground">
                    {fileType}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {lineCount} line{lineCount !== 1 ? 's' : ''} • {codePreview}
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Click to view
              </div>
            </div>
          </div>
        </div>
      );

      lastIndex = matchIndex + fullMatch.length;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key="text-end" className="whitespace-pre-wrap">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return <>{parts}</>;
  };

  if (role === 'user') {
    return (
      <div className="flex justify-end mb-6 pr-8">
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
    <div className="flex justify-start mb-6 pl-8">
      <div className="flex gap-3 max-w-[85%]">
        {/* Clerk Avatar */}
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
          <span className="text-white font-bold text-xs">C</span>
        </div>

        <div className="flex-1">
          <div className="px-4 py-3 relative group">
            <div className="text-sm leading-relaxed text-foreground">
              {renderContentWithCodeBlocks(content)}
            </div>
            
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
            Clerk • {timestamp}
          </div>
        </div>
      </div>
    </div>
  );
}