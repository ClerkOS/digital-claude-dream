import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, Edit2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { TransformationPreview, CellChange } from '@/types/transformations';

interface TransformationPreviewProps {
  preview: TransformationPreview;
  onApprove: () => void;
  onReject: () => void;
  onEdit: () => void;
}

export function TransformationPreview({ preview, onApprove, onReject, onEdit }: TransformationPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onReject()}
    >
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Preview Transformation
          </h2>
          <p className="text-sm text-muted-foreground">
            {preview.ruleName}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  This rule will modify <span className="text-primary font-semibold">{preview.affectedRows}</span> rows
                </p>
                <p className="text-xs text-muted-foreground">
                  {preview.affectedCells.length} cells will be changed
                </p>
              </div>
            </div>
          </div>

          {/* Sample Changes */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">
              Sample Changes ({preview.sampleChanges.length} of {preview.affectedCells.length})
            </h3>
            <div className="space-y-2">
              {preview.sampleChanges.map((change, index) => (
                <ChangeRow key={index} change={change} />
              ))}
            </div>
            {preview.affectedCells.length > preview.sampleChanges.length && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                ... and {preview.affectedCells.length - preview.sampleChanges.length} more changes
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-border flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={onReject}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Reject
          </Button>
          <Button
            variant="outline"
            onClick={onEdit}
            className="flex-1"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Rule
          </Button>
          <Button
            onClick={onApprove}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Approve
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function ChangeRow({ change }: { change: CellChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-background border border-border rounded-lg p-3 hover:bg-muted/30 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-muted-foreground">
              {change.address}
            </span>
            {change.columnName && (
              <span className="text-xs text-muted-foreground">
                ({change.columnName})
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Before</p>
              <p className="text-sm text-foreground line-through text-muted-foreground truncate">
                {change.before === null || change.before === '' ? '(empty)' : String(change.before)}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">After</p>
              <p className="text-sm text-foreground font-medium truncate">
                {change.after === null || change.after === '' ? '(empty)' : String(change.after)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

