import { motion } from 'framer-motion';
import { GripVertical, Edit2, Trash2, Play, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ProjectRule } from '@/types/dashboard';

interface RuleBlockProps {
  rule: ProjectRule;
  index: number;
  isDragging?: boolean;
  onEdit: (ruleId: string) => void;
  onDelete: (ruleId: string) => void;
  onReorder: (ruleId: string, newIndex: number) => void;
  onRun: (ruleId: string) => void;
  onToggleActive: (ruleId: string) => void;
}

export function RuleBlock({
  rule,
  index,
  isDragging = false,
  onEdit,
  onDelete,
  onReorder,
  onRun,
  onToggleActive,
}: RuleBlockProps) {
  const operations = rule.operations || [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`group relative ${isDragging ? 'opacity-50' : ''}`}
    >
      <Card className={`p-4 hover:bg-muted/30 transition-colors ${
        !rule.isActive ? 'opacity-60' : ''
      }`}>
        <div className="flex items-start gap-3">
          {/* Drag handle */}
          <button
            className="flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
            onMouseDown={() => {/* Start drag */}}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  {rule.naturalLanguage}
                </h3>
                {operations.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {operations.map((op, idx) => (
                      <OperationBadge key={idx} operation={op} />
                    ))}
                  </div>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(rule.id)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onRun(rule.id)}>
                    <Play className="h-4 w-4 mr-2" />
                    Run
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleActive(rule.id)}>
                    {rule.isActive ? 'Deactivate' : 'Activate'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(rule.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
              <span>{rule.appliedToRecords} records</span>
              <span>•</span>
              <span>{rule.category.replace('_', ' ')}</span>
              {rule.scope !== 'all_records' && (
                <>
                  <span>•</span>
                  <span>{rule.scope.replace('_', ' ')}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function OperationBadge({ operation }: { operation: { type: string; field: string; action: string } }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-muted rounded text-xs">
      <span className="font-medium text-foreground">{operation.field}:</span>
      <span className="text-muted-foreground">{operation.action}</span>
    </div>
  );
}

