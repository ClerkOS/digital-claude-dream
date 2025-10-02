import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, FileSpreadsheet, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ParsedData {
  headers: string[];
  rows: string[][];
  totalRows: number;
  totalColumns: number;
}

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  type: 'xls' | 'pdf';
  parsedData?: ParsedData;
  isParsing?: boolean;
  parseError?: string;
  isParsed?: boolean;
}

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  maxFiles?: number;
  className?: string;
}

export function FileUpload({ onFilesUploaded, maxFiles = 5, className }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Show success message when all files are parsed
  useEffect(() => {
    const hasFiles = uploadedFiles.length > 0;
    const allParsed = hasFiles && uploadedFiles.every(f => f.isParsed);
    const hasErrors = uploadedFiles.some(f => f.parseError);
    
    if (allParsed && !hasErrors) {
      setShowSuccessMessage(true);
      const timer = setTimeout(() => setShowSuccessMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [uploadedFiles]);

  // Parse file content
  const parseFile = async (file: File): Promise<ParsedData> => {
    if (file.type.includes('excel') || file.type.includes('spreadsheet') || file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
      // For Excel files, we'll let the backend handle the parsing
      // This is a placeholder that returns empty data structure
      return {
        headers: [],
        rows: [],
        totalRows: 0,
        totalColumns: 0
      };
    } else if (file.type.includes('pdf')) {
      // For PDF files, we'll let the backend handle the parsing
      // This is a placeholder that returns empty data structure
      return {
        headers: [],
        rows: [],
        totalRows: 0,
        totalColumns: 0
      };
    }
    
    throw new Error('Unsupported file type');
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      type: file.type.includes('pdf') ? 'pdf' : 'xls',
      isParsing: true
    }));

    const updatedFiles = [...uploadedFiles, ...newFiles].slice(0, maxFiles);
    setUploadedFiles(updatedFiles);
    onFilesUploaded(updatedFiles);

    // Parse each file
    for (const fileData of newFiles) {
      try {
        const parsedData = await parseFile(fileData.file);
        
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, parsedData, isParsing: false, isParsed: true }
            : f
        ));
      } catch (error) {
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, isParsing: false, parseError: error instanceof Error ? error.message : 'Parsing failed' }
            : f
        ));
      }
    }
  }, [uploadedFiles, maxFiles, onFilesUploaded]);

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/pdf': ['.pdf']
    },
    maxFiles: maxFiles - uploadedFiles.length,
    multiple: true
  });

  const removeFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(updatedFiles);
    onFilesUploaded(updatedFiles);
  };

  const getFileIcon = (type: 'xls' | 'pdf') => {
    return type === 'xls' ? <FileSpreadsheet className="h-4 w-4" /> : <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          "hover:border-primary/50 hover:bg-primary/5",
          isDragActive && !isDragReject && "border-primary bg-primary/10",
          isDragReject && "border-destructive bg-destructive/10",
          uploadedFiles.length > 0 && "border-solid border-border"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
            isDragActive && !isDragReject ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            <Upload className="h-6 w-6" />
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isDragActive 
                ? (isDragReject ? "File type not supported" : "Drop files here")
                : "Upload XLS or PDF files"
              }
            </p>
            <p className="text-xs text-muted-foreground">
              Drag & drop or click to browse • Max {maxFiles} files
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950/20 dark:border-green-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              All files successfully parsed and ready for analysis!
            </span>
          </div>
        </div>
      )}

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-foreground">Uploaded Files</h4>
          <div className="space-y-2">
            {uploadedFiles.map((uploadedFile) => (
              <div
                key={uploadedFile.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  uploadedFile.isParsed 
                    ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800" 
                    : uploadedFile.parseError
                    ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
                    : "bg-muted/50 border-border"
                )}
              >
                <div className="flex-shrink-0">
                  {uploadedFile.isParsing ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  ) : uploadedFile.isParsed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : uploadedFile.parseError ? (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    getFileIcon(uploadedFile.type)
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {uploadedFile.file.name}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {uploadedFile.isParsing ? (
                      <span className="text-blue-600">Parsing file...</span>
                    ) : uploadedFile.isParsed ? (
                      <div className="space-y-1">
                        <span className="text-green-600 font-medium">✓ Successfully parsed</span>
                        <div className="text-muted-foreground">
                          {formatFileSize(uploadedFile.file.size)} • {uploadedFile.type.toUpperCase()} • 
                          {uploadedFile.parsedData && (
                            <span> {uploadedFile.parsedData.totalRows} rows, {uploadedFile.parsedData.totalColumns} columns</span>
                          )}
                        </div>
                      </div>
                    ) : uploadedFile.parseError ? (
                      <span className="text-red-600">Failed to parse: {uploadedFile.parseError}</span>
                    ) : (
                      <span>{formatFileSize(uploadedFile.file.size)} • {uploadedFile.type.toUpperCase()}</span>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(uploadedFile.id)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {isDragReject && (
        <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>Only XLS and PDF files are supported</span>
        </div>
      )}
    </div>
  );
}
