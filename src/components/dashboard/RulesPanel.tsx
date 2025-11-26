import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Plus, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RuleBlock } from '@/components/transformations/RuleBlock';
import { useTransformationStore } from '@/store/transformationStore';
import type { ProjectRule } from '@/types/dashboard';

interface RulesPanelProps {
  isOpen: boolean;
  projectName: string;
  rules: ProjectRule[];
  isCreatingRule: boolean;
  isEditingRule?: boolean;
  newRuleText: string;
  onClose: () => void;
  onStartCreating: () => void;
  onCancelCreating: () => void;
  onCreateRule: () => void;
  onDeleteRule: (ruleId: string) => void;
  onRuleTextChange: (text: string) => void;
  onEditRule?: (ruleId: string) => void;
  onRunRule?: (ruleId: string) => void;
  onToggleActive?: (ruleId: string) => void;
  onReorderRules?: (ruleId: string, newIndex: number) => void;
  workbookId?: string;
}

export function RulesPanel({
  isOpen,
  projectName,
  rules,
  isCreatingRule,
  isEditingRule = false,
  newRuleText,
  onClose,
  onStartCreating,
  onCancelCreating,
  onCreateRule,
  onDeleteRule,
  onRuleTextChange,
  onEditRule,
  onRunRule,
  onToggleActive,
  onReorderRules,
  workbookId,
}: RulesPanelProps) {
  const { setTimelineOpen, timelineOpen } = useTransformationStore();
  
  if (!isOpen) return null;

  // Sort rules by order if available, otherwise by creation date
  const sortedRules = [...rules].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed inset-y-0 right-0 w-80 bg-background border-l border-border shadow-2xl z-40"
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Rules</h2>
              <p className="text-sm text-muted-foreground">{projectName}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTimelineOpen(!timelineOpen)}
                className="h-8 text-xs"
              >
                <Clock className="h-4 w-4 mr-1" />
                Timeline
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              {isCreatingRule && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-muted/20 rounded-lg p-4 border border-border"
                >
                  <p className="text-sm font-medium text-foreground mb-3">
                    {isEditingRule ? 'Edit Rule' : 'Create New Rule'}
                  </p>
                  <Textarea
                    value={newRuleText}
                    onChange={(e) => onRuleTextChange(e.target.value)}
                    placeholder="Type your rule in plain English..."
                    className="w-full h-24 px-3 py-2 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-3"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onCancelCreating}
                      className="flex-1 text-muted-foreground"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={onCreateRule}
                      className="flex-1 bg-primary hover:bg-primary/90"
                      disabled={!newRuleText.trim()}
                    >
                      {isEditingRule ? 'Save Changes' : 'Create Rule'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {rules.length === 0 && !isCreatingRule && (
                <div className="text-center py-8">
                  <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No rules created yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Create rules to validate and organize your data</p>
                </div>
              )}
              
              {sortedRules.map((rule, index) => (
                <RuleBlock
                  key={rule.id}
                  rule={rule}
                  index={index}
                  onEdit={onEditRule || (() => {})}
                  onDelete={onDeleteRule}
                  onReorder={onReorderRules || (() => {})}
                  onRun={onRunRule || (() => {})}
                  onToggleActive={onToggleActive || (() => {})}
                />
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-border">
            {!isCreatingRule && (
              <Button
                onClick={onStartCreating}
                variant="outline"
                className="w-full h-9 text-sm font-medium bg-primary/5 hover:bg-primary/10 text-primary border-primary/20 hover:border-primary/30"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Rule
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

