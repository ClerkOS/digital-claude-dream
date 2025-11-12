import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet } from 'lucide-react';

interface PipelineUploadStageProps {
  onFilesUploaded: (files: File[]) => void;
}

export function PipelineUploadStage({ onFilesUploaded }: PipelineUploadStageProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesUploaded(files);
    }
  }, [onFilesUploaded]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesUploaded(files);
    }
  }, [onFilesUploaded]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-2xl"
      >
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={`
            relative border-2 border-dashed rounded-2xl p-16
            transition-all duration-300 ease-out
            ${isDragging || isHovering 
              ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
              : 'border-border bg-background shadow-sm'
            }
          `}
        >
          <input
            type="file"
            multiple
            accept=".xlsx,.xls,.csv,.txt"
            onChange={handleFileInput}
            className="hidden"
            id="pipeline-file-upload"
          />
          
          <label
            htmlFor="pipeline-file-upload"
            className="cursor-pointer flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{
                scale: isDragging || isHovering ? 1.1 : 1,
                opacity: isDragging || isHovering ? 1 : 0.8,
              }}
              transition={{ duration: 0.3 }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
              <div className="relative w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="w-12 h-12 text-primary" />
              </div>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-primary/30 rounded-full blur-xl"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-4"
            >
              <h2 className="text-2xl font-semibold text-foreground">
                Drop your financial data files here to begin.
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
                Zigma will help you organize and understand them — step by step.
              </p>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="pt-4"
              >
                <button
                  type="button"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
                >
                  Choose Files
                </button>
              </motion.div>
            </motion.div>
          </label>

          <AnimatePresence>
            {(isDragging || isHovering) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 pointer-events-none"
              >
                <div className="absolute inset-0 bg-primary/5 rounded-2xl" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Supports Excel, CSV, and text files
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

