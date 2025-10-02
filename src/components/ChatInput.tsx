import { useState, useRef } from 'react';
import { Send, Paperclip, X, CheckCircle, Loader2, AlertCircle, BookOpen, FileText, TrendingUp, CreditCard, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  type: 'xls' | 'pdf';
  parsedData?: any;
  isParsing?: boolean;
  parseError?: string;
  isParsed?: boolean;
}

interface ChatInputProps {
  onSendMessage: (message: string, files?: UploadedFile[]) => void;
  disabled?: boolean;
}

const accountingQuickActions = [
  {
    id: 'journals',
    icon: BookOpen,
    label: 'Journals',
    prompt: 'Create journal entries for recent transactions'
  },
  {
    id: 'ledgers',
    icon: FileText,
    label: 'Ledgers',
    prompt: 'Show me the general ledger for all accounts'
  },
  {
    id: 'profit-loss',
    icon: TrendingUp,
    label: 'P&L',
    prompt: 'Generate a profit and loss statement'
  },
  {
    id: 'payables',
    icon: CreditCard,
    label: 'Payables',
    prompt: 'Show accounts payable aging report'
  },
  {
    id: 'receivables',
    icon: Receipt,
    label: 'Receivables',
    prompt: 'Show accounts receivable aging report'
  }
];

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if ((message.trim() || uploadedFiles.length > 0) && !disabled) {
      onSendMessage(message.trim(), uploadedFiles);
      setMessage('');
      setUploadedFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };


  const handleQuickAction = (action: typeof accountingQuickActions[0]) => {
    onSendMessage(action.prompt);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Process files similar to FileUpload component
      const processedFiles: UploadedFile[] = files.map(file => ({
        id: `file-${Date.now()}-${Math.random()}`,
        file,
        type: file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'xls',
        isParsing: true,
        isParsed: false
      }));
      
      setUploadedFiles(prev => [...prev, ...processedFiles]);
      
      // Simulate parsing for each file
      processedFiles.forEach(async (uploadedFile) => {
        try {
          // Simulate parsing delay
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
          
          setUploadedFiles(prev => prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, isParsing: false, isParsed: true, parsedData: { headers: ['Sample'], rows: [['Data']], totalRows: 1, totalColumns: 1 } }
              : f
          ));
        } catch (error) {
          setUploadedFiles(prev => prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, isParsing: false, parseError: 'Failed to parse file' }
              : f
          ));
        }
      });
    }
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="border-t border-border bg-background p-4">
      <div className="max-w-4xl mx-auto">

        {/* Uploaded Files Preview */}
        {uploadedFiles.length > 0 && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">Files to send</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUploadedFiles([])}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors",
                    file.isParsed 
                      ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800" 
                      : file.parseError
                      ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
                      : "bg-muted/50 border-border"
                  )}
                >
                  {file.isParsing ? (
                    <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                  ) : file.isParsed ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : file.parseError ? (
                    <AlertCircle className="h-3 w-3 text-red-600" />
                  ) : (
                    <span className="text-muted-foreground">
                      {file.type === 'xls' ? '📊' : '📄'}
                    </span>
                  )}
                  <span className="truncate max-w-[200px]">{file.file.name}</span>
                  {file.isParsed && (
                    <span className="text-xs text-green-600 font-medium">✓</span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadedFiles(prev => prev.filter(f => f.id !== file.id))}
                    className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="relative flex items-end gap-3 bg-card border border-border rounded-xl p-3">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".xls,.xlsx,.csv,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {/* Attachment button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFileSelect}
            className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Message input */}
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Message Zigma..."
            disabled={disabled}
            className={cn(
              "min-h-[20px] max-h-[120px] border-0 bg-transparent resize-none",
              "focus-visible:ring-0 focus-visible:ring-offset-0 p-0",
              "placeholder:text-muted-foreground"
            )}
            rows={1}
          />

          {/* Send button */}
          <Button
            onClick={handleSubmit}
            disabled={(!message.trim() && uploadedFiles.length === 0) || disabled}
            size="icon"
            className={cn(
              "h-8 w-8 flex-shrink-0",
              (message.trim() || uploadedFiles.length > 0) && !disabled
                ? "bg-primary hover:bg-primary/90 text-white"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Footer text */}
        <p className="text-xs text-muted-foreground text-center mt-2">
          Zigma can make mistakes. Please use with care.
        </p>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {accountingQuickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action)}
                disabled={disabled}
                className={cn(
                  "h-8 px-3 text-xs font-normal",
                  "hover:bg-primary/10 hover:border-primary/20 hover:text-primary",
                  "transition-colors duration-200"
                )}
              >
                <IconComponent className="h-3 w-3 mr-1.5" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}