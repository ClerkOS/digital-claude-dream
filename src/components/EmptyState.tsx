import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from './FileUpload';

interface EmptyStateProps {
  onFileUpload: (files: any[]) => void;
  onConnectSource: () => void;
}

export function EmptyState({ onFileUpload, onConnectSource }: EmptyStateProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileUpload(files.map(file => ({ file })));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      {/* Minimal Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-16 max-w-md"
      >
        <div className="w-12 h-12 bg-foreground rounded-lg flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-6 h-6 text-background" />
        </div>
        
        <h1 className="text-2xl font-medium text-foreground mb-3">
          Upload your financial data
        </h1>
        
        <p className="text-muted-foreground text-sm leading-relaxed">
          We'll analyze and organize it automatically. Start with any spreadsheet or CSV file.
        </p>
      </motion.div>

      {/* Clean Upload Zone */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className={`w-full max-w-lg border border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragOver 
            ? 'border-foreground bg-muted/30' 
            : 'border-muted-foreground/40 hover:border-foreground/60 hover:bg-muted/10'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
          
          <div>
            <p className="text-sm text-foreground mb-1">
              Drag and drop files here
            </p>
            <p className="text-xs text-muted-foreground">
              Excel, CSV, or other formats
            </p>
          </div>

          <div className="pt-2">
            <FileUpload onFileUpload={onFileUpload}>
              <Button variant="ghost" size="sm" className="text-xs">
                <FileText className="w-3 h-3 mr-1" />
                Choose files
              </Button>
            </FileUpload>
          </div>
        </div>
      </motion.div>

      {/* Subtle hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-8 text-center"
      >
        <p className="text-xs text-muted-foreground">
          Your data stays private and secure
        </p>
      </motion.div>
    </div>
  );
}
