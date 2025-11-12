import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PipelineSavePanelProps {
  isOpen: boolean;
  onSave: (name: string, description: string) => void;
  onSkip: () => void;
  onClose: () => void;
}

export function PipelineSavePanel({ isOpen, onSave, onSkip, onClose }: PipelineSavePanelProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 z-50 flex items-end justify-end p-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md"
        >
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Save Workflow
              </h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Would you like to save this workflow as a reusable template?
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Next time you upload similar data, I can apply these same steps automatically.
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Workflow Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., School Payment Matching v1"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Description (optional)
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this workflow"
                className="w-full"
              />
            </div>
          </div>

          <div className="p-6 border-t border-border flex gap-3">
            <Button
              variant="outline"
              onClick={onSkip}
              className="flex-1"
            >
              Skip for Now
            </Button>
            <Button
              onClick={() => {
                if (name.trim()) {
                  onSave(name, description);
                  setName('');
                  setDescription('');
                }
              }}
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={!name.trim()}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Workflow
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

