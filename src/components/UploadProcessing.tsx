import { motion, AnimatePresence } from 'framer-motion';
import { FileSpreadsheet, CheckCircle2, Sparkles } from 'lucide-react';

interface UploadProcessingProps {
  files: Array<{ file: File }>;
  progress: number;
  stage: 'uploading' | 'processing' | 'complete';
  processingMessage?: string;
}

export function UploadProcessing({ files, progress, stage, processingMessage }: UploadProcessingProps) {
  const fileName = files[0]?.file?.name || 'file';

  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      <AnimatePresence mode="wait">
        {stage === 'uploading' && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center max-w-md"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-16 h-16 bg-foreground/5 rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <FileSpreadsheet className="w-8 h-8 text-foreground/60" />
            </motion.div>

            {/* File name */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm font-medium text-foreground mb-2"
            >
              {fileName}
            </motion.p>

            {/* Progress bar */}
            <div className="w-64 h-0.5 bg-muted rounded-full overflow-hidden mx-auto mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full bg-primary"
              />
            </div>

            <p className="text-xs text-muted-foreground">Uploading...</p>
          </motion.div>
        )}

        {stage === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center max-w-md"
          >
            {/* Animated icon */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6 relative"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-primary/20 border-t-primary rounded-2xl"
              />
              <Sparkles className="w-8 h-8 text-primary relative z-10" />
            </motion.div>

            {/* Processing text */}
            <AnimatePresence mode="wait">
              <motion.p
                key={processingMessage}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.4 }}
                className="text-sm font-medium text-foreground"
              >
                {processingMessage || 'Processing your data'}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        )}

        {stage === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-md"
          >
            {/* Success icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.1
              }}
              className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm font-medium text-foreground mb-1"
            >
              Ready
            </motion.p>
            <p className="text-xs text-muted-foreground">
              Your data has been processed
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
