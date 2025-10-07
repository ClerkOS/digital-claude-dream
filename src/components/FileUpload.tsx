import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileUpload: (files: any[]) => void;
  children?: React.ReactNode;
  className?: string;
}

export function FileUpload({ onFileUpload, children, className }: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const filesWithMetadata = acceptedFiles.map(file => ({
        file,
        id: `file-${Date.now()}-${Math.random()}`,
      }));
      onFileUpload(filesWithMetadata);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive: dropzoneDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: true,
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.csv,.xls,.xlsx';
    input.onchange = (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        onDrop(Array.from(files));
      }
    };
    input.click();
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        "inline-block",
        isDragActive && "opacity-50",
        className
      )}
    >
      <input {...getInputProps()} />
      {children ? (
        <div onClick={handleClick} className="cursor-pointer">
          {children}
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClick}
          className="h-8 text-xs"
        >
          <Upload className="h-3 w-3 mr-1" />
          Upload files
        </Button>
      )}
    </div>
  );
}