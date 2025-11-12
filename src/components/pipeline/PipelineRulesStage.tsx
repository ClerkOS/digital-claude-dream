import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface PipelineRule {
  id: string;
  title: string;
  description: string;
  hint?: string;
}

interface PipelineRulesStageProps {
  rules: PipelineRule[];
  selectedRuleIds: string[];
  customRuleText: string;
  onToggleRule: (ruleId: string) => void;
  onCustomRuleChange: (value: string) => void;
  onApplyRules: () => void;
  isApplyDisabled: boolean;
  appliedRules: string[];
  status?: 'pending' | 'in_progress' | 'complete' | 'error';
}

export function PipelineRulesStage({
  rules,
  selectedRuleIds,
  customRuleText,
  onToggleRule,
  onCustomRuleChange,
  onApplyRules,
  isApplyDisabled,
  appliedRules,
  status,
}: PipelineRulesStageProps) {
  const isComplete = status === 'complete';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto px-8 w-full"
    >
      <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">
            {isComplete ? 'Rules Applied' : 'Apply Rules'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isComplete
              ? 'Great—your cleanup rules have been applied to this dataset.'
              : 'Choose the clean-up rules you want Zigma to apply before building your dashboard.'}
          </p>
        </div>

        {!isComplete && (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {rules.map(rule => {
                const selected = selectedRuleIds.includes(rule.id);
                return (
                  <button
                    key={rule.id}
                    type="button"
                    onClick={() => onToggleRule(rule.id)}
                    className={cn(
                      'text-left rounded-xl border p-4 transition-all duration-200',
                      selected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/40 hover:bg-muted/30'
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-sm text-foreground">{rule.title}</p>
                      <span
                        className={cn(
                          'inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-medium',
                          selected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border text-muted-foreground'
                        )}
                      >
                        {selected ? '✓' : ''}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                      {rule.description}
                    </p>
                    {rule.hint && (
                      <p className="mt-2 text-[11px] text-primary">
                        {rule.hint}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">
                Add a custom rule
              </p>
              <Textarea
                value={customRuleText}
                onChange={(event) => onCustomRuleChange(event.target.value)}
                placeholder="Describe how you'd like Zigma to clean or transform this dataset..."
                className="min-h-[96px]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-xs text-muted-foreground">
                Select one or more rules—or describe a new one—and Zigma will apply them to this dataset.
              </p>
              <Button
                onClick={onApplyRules}
                disabled={isApplyDisabled}
                className="px-4"
              >
                Apply selected rules
              </Button>
            </div>
          </div>
        )}

        {isComplete && appliedRules.length > 0 && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
            <p className="text-sm font-medium text-primary">
              Zigma applied the following rules:
            </p>
            <ul className="list-disc list-inside text-sm text-primary">
              {appliedRules.map(rule => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}

