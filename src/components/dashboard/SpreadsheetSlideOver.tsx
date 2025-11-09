import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SpreadsheetViewer } from '../SpreadsheetViewer';

interface SpreadsheetSlideOverProps {
  isOpen: boolean;
  workbookId?: string;
  onClose: () => void;
}

export function SpreadsheetSlideOver({ isOpen, workbookId, onClose }: SpreadsheetSlideOverProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed inset-y-0 right-0 w-1/2 bg-background border-l border-border shadow-2xl z-50"
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Structured Data</h2>
                <p className="text-sm text-muted-foreground">Explore your cleaned dataset</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <SpreadsheetViewer 
                workbookId={workbookId}
                className="h-full"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

