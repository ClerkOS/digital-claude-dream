import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lightbulb, RefreshCw, X, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Suggestion } from '@/types/v2/analysis';
import { useState } from 'react';

interface SuggestionsPanelProps {
  suggestions: Suggestion[];
  onApplySuggestion: (suggestion: Suggestion) => Promise<void>;
  isApplying?: string | null;
}

export function SuggestionsPanel({ 
  suggestions, 
  onApplySuggestion,
  isApplying = null 
}: SuggestionsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Filter out dismissed suggestions
  const visibleSuggestions = suggestions.filter((_, index) => {
    const id = `${suggestions[index].issue_type}-${index}`;
    return !dismissedIds.has(id);
  });

  if (visibleSuggestions.length === 0) return null;

  const handleApply = async (suggestion: Suggestion, index: number) => {
    const id = `${suggestion.issue_type}-${index}`;
    try {
      await onApplySuggestion(suggestion);
      setAppliedIds(prev => new Set([...prev, id]));
    } catch (error) {
      console.error('Failed to apply suggestion:', error);
    }
  };

  const handleDismiss = (index: number) => {
    const id = `${suggestions[index].issue_type}-${index}`;
    setDismissedIds(prev => new Set([...prev, id]));
  };

  const toggleExpand = (index: number) => {
    const id = `${suggestions[index].issue_type}-${index}`;
    setExpandedId(expandedId === id ? null : id);
  };

  const formatToolName = (tool: string): string => {
    return tool
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatArgs = (args: Record<string, any>): string => {
    const entries = Object.entries(args);
    if (entries.length === 0) return '';
    
    return entries
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: [${value.join(', ')}]`;
        }
        if (typeof value === 'object') {
          return `${key}: ${JSON.stringify(value)}`;
        }
        return `${key}: ${value}`;
      })
      .join(', ');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Suggested Improvements
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {visibleSuggestions.length === 1 
                ? '1 issue found' 
                : `${visibleSuggestions.length} issues found`} • Review and apply fixes that make sense
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {visibleSuggestions.map((suggestion, index) => {
            const id = `${suggestion.issue_type}-${index}`;
            const isExpanded = expandedId === id;
            const isApplied = appliedIds.has(id);
            const isCurrentlyApplying = isApplying === id;

            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: -20, scale: 0.98 }}
                animate={{ 
                  opacity: 1, 
                  x: 0, 
                  scale: 1 
                }}
                exit={{ opacity: 0, x: 20, scale: 0.98 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: index * 0.05
                }}
              >
                <Card 
                  className={`border transition-all duration-200 ${
                    isApplied 
                      ? 'border-green-200 bg-green-50/50 opacity-75' 
                      : 'border-blue-200 bg-blue-50/30 hover:shadow-md hover:border-blue-300'
                  } ${isExpanded ? 'shadow-md' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        {/* Header */}
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-background/80 mt-0.5">
                            <Lightbulb className={`h-4 w-4 ${isApplied ? 'text-green-600' : 'text-blue-600'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="font-medium text-foreground">
                                {formatToolName(suggestion.suggested_fix.tool)}
                              </h4>
                              {isApplied && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500 }}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium"
                                >
                                  <Check className="h-3 w-3" />
                                  Applied
                                </motion.div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {suggestion.description}
                            </p>

                            {/* Expanded Details */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-3 pt-3 border-t border-border/50">
                                    <p className="text-xs font-medium text-foreground mb-2">
                                      Details:
                                    </p>
                                    <div className="bg-background/80 rounded-md p-3 space-y-1.5">
                                      <div className="flex items-start gap-2">
                                        <span className="text-xs font-medium text-muted-foreground min-w-[60px]">
                                          Operation:
                                        </span>
                                        <span className="text-xs text-foreground font-mono">
                                          {suggestion.suggested_fix.tool}
                                        </span>
                                      </div>
                                      {Object.keys(suggestion.suggested_fix.args).length > 0 && (
                                        <div className="flex items-start gap-2">
                                          <span className="text-xs font-medium text-muted-foreground min-w-[60px]">
                                            Arguments:
                                          </span>
                                          <span className="text-xs text-foreground font-mono">
                                            {formatArgs(suggestion.suggested_fix.args)}
                                          </span>
                                        </div>
                                      )}
                                      <div className="flex items-start gap-2">
                                        <span className="text-xs font-medium text-muted-foreground min-w-[60px]">
                                          Issue Type:
                                        </span>
                                        <span className="text-xs text-foreground">
                                          {suggestion.issue_type}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-start gap-2 mt-0.5">
                        {!isApplied && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDismiss(index)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                            title="Dismiss suggestion"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(index)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          title={isExpanded ? "Show less" : "Show details"}
                        >
                          <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </motion.div>
                        </Button>

                        {isApplied ? (
                          <div className="flex items-center gap-1.5 px-3 h-8 rounded-md bg-green-100 text-green-700 text-xs font-medium">
                            <Check className="h-3 w-3" />
                            Applied
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleApply(suggestion, index)}
                            disabled={isCurrentlyApplying}
                            size="sm"
                            className="h-8 px-4 text-xs font-medium"
                          >
                            {isCurrentlyApplying ? (
                              <>
                                <RefreshCw className="h-3 w-3 mr-1.5 animate-spin" />
                                Applying...
                              </>
                            ) : (
                              <>
                                <Check className="h-3 w-3 mr-1.5" />
                                Apply
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Summary Footer */}
      {visibleSuggestions.some((_, i) => !appliedIds.has(`${visibleSuggestions[i].issue_type}-${i}`)) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-4 rounded-lg bg-blue-50/50 border border-blue-200/50"
        >
          <div className="flex items-start gap-3">
            <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground mb-1">
                Review Suggestions
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                These are automatic recommendations based on data analysis. Apply the ones that make sense for your workflow. All changes can be reviewed in the history.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* All Applied Message */}
      {visibleSuggestions.length > 0 && 
       visibleSuggestions.every((_, i) => appliedIds.has(`${visibleSuggestions[i].issue_type}-${i}`)) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 p-4 rounded-lg bg-green-50/50 border border-green-200/50"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-100">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">
                All suggestions applied!
              </p>
              <p className="text-xs text-green-700 mt-0.5">
                Your data has been improved. Check the history to review changes.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

