import { useState } from 'react';
import { X, Copy, Download, FileText, Code, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const renderContent = () => {
    if (!file) return null;

    switch (file.type) {
      case 'code':
        return (
          <pre className="text-sm font-mono text-foreground whitespace-pre-wrap break-words p-4 bg-muted/30 rounded-lg overflow-auto">
            <code className={`language-${file.language || 'text'}`}>
              {file.content}
            </code>
          </pre>
        );
      case 'image':
        return (
          <div className="flex items-center justify-center p-4">
            <img
              src={file.content}
              alt={file.name}
              className="max-w-full max-h-96 object-contain rounded-lg"
            />
          </div>
        );
      default:
        return (
          <div className="text-sm text-foreground whitespace-pre-wrap break-words p-4">
            {file.content}
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* File Viewer Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full bg-background border-l border-border z-50",
          "w-full max-w-2xl lg:w-1/2 xl:w-2/5",
          "flex flex-col shadow-xl"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex items-center gap-2 min-w-0">
            {getFileIcon()}
            <span className="font-medium text-foreground truncate">
              {file?.name || 'Untitled'}
            </span>
            {file?.language && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                {file.language}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {file?.type !== 'image' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="text-muted-foreground hover:text-foreground"
              >
                <Copy className="h-4 w-4" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-muted-foreground hover:text-foreground"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {file ? (
            renderContent()
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No file selected</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}