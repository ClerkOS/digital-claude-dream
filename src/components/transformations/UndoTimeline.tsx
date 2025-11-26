import { motion, AnimatePresence } from 'framer-motion';
import { Undo2, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { TransformationAction } from '@/types/transformations';

interface UndoTimelineProps {
  actions: TransformationAction[];
  onUndo: (actionId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function UndoTimeline({ actions, onUndo, isOpen, onClose }: UndoTimelineProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed inset-y-0 right-0 w-96 bg-background border-l border-border shadow-2xl z-50"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-foreground">Action Timeline</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              ×
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            All actions are undoable. Undo doesn't break later steps.
          </p>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-6">
          {actions.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">No actions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {actions.map((action, index) => (
                <TimelineItem
                  key={action.id}
                  action={action}
                  isLatest={index === 0}
                  onUndo={() => onUndo(action.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TimelineItem({ action, isLatest, onUndo }: { action: TransformationAction; isLatest: boolean; onUndo: () => void }) {
  const timeAgo = getTimeAgo(action.timestamp);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Timeline line */}
      {!isLatest && (
        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border" />
      )}

      <Card className={`p-4 ${isLatest ? 'border-primary/50 bg-primary/5' : ''}`}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isLatest ? 'bg-primary/10' : 'bg-muted'
          }`}>
            <CheckCircle2 className={`h-4 w-4 ${isLatest ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-sm font-medium text-foreground">
                {action.ruleName}
              </p>
              {action.canUndo && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onUndo}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Undo2 className="h-3 w-3 mr-1" />
                  Undo
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {action.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{action.affectedRows} rows affected</span>
              <span>•</span>
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function getTimeAgo(timestamp: Date): string {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

