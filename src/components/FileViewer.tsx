import { useState } from 'react';
import { X, Copy, Download, FileText, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileViewerProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    name: string;
    content: string;
    type: 'text' | 'code' | 'image' | 'markdown';
    language?: string;
  } | null;
}

export function FileViewer({ isOpen, onClose, file }: FileViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (file?.content) {
      try {
        await navigator.clipboard.writeText(file.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleDownload = () => {
    if (file) {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getFileIcon = () => {
    if (!file) return <FileText className="h-4 w-4" />;
    
    switch (file.type) {
      case 'code':
        return <Code className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border/50 rounded-lg w-full max-w-4xl h-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-muted rounded flex items-center justify-center">
              {getFileIcon()}
            </div>
            <div>
              <h2 className="text-sm font-medium">{file.name}</h2>
              <p className="text-xs text-muted-foreground">
                {file.language || file.type}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2"
            >
              {copied ? <Copy className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="h-7 px-2"
            >
              <Download className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-3">
          {file.type === 'code' ? (
            <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap">
              <code className={`language-${file.language || 'text'}`}>
                {file.content}
              </code>
            </pre>
          ) : (
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {file.content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}