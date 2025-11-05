import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface SystemBannerProps {
  message: string;
  isVisible: boolean;
}

export function SystemBanner({ message, isVisible }: SystemBannerProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg px-4 py-2.5 shadow-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-foreground">{message}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

