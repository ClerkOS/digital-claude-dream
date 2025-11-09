import { motion } from 'framer-motion';
import type React from 'react';
import { ChevronDown, ChevronUp, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { DataIssue } from '@/types/dashboard';
import { getSeverityColor, getSeverityIcon, getQuickActions } from '@/utils/dashboardHelpers';

interface IssueCardProps {
  issue: DataIssue;
  isExpanded: boolean;
  isCreatingRule: boolean;
  isResolving: boolean;
  isPulsed: boolean;
  newRuleText: string;
  onToggleExpand: () => void;
  onStartRuleCreation: () => void;
  onCancelRuleCreation: () => void;
  onCreateRule: () => void;
  onQuickAction: (actionId: string) => void;
  onResolve: () => void;
  onRuleTextChange: (text: string) => void;
  getDetailedSuggestion: (issue: DataIssue) => React.ReactNode | null;
}

export function IssueCard({
  issue,
  isExpanded,
  isCreatingRule,
  isResolving,
  isPulsed,
  newRuleText,
  onToggleExpand,
  onStartRuleCreation,
  onCancelRuleCreation,
  onCreateRule,
  onQuickAction,
  onResolve,
  onRuleTextChange,
  getDetailedSuggestion,
}: IssueCardProps) {
  const SeverityIcon = getSeverityIcon(issue.severity);
  const IssueIcon = issue.icon;
  const quickActions = getQuickActions(issue.type);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.98 }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        scale: 1,
      }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      className={isPulsed ? 'relative' : ''}
    >
      {isPulsed && (
        <motion.div
          key={`pulse-${issue.id}`}
          className="absolute inset-0 rounded-lg bg-primary/5 pointer-events-none"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.02, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}
      
      <motion.div
        animate={{
          scale: isExpanded ? 1 : 1,
          y: 0
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25
        }}
      >
        <Card 
          className={`border ${getSeverityColor(issue.severity)} hover:shadow-md transition-all duration-200 ${
            isExpanded ? 'shadow-md cursor-default' : 'cursor-pointer'
          } ${isResolving ? 'opacity-40 bg-muted/20' : ''}`}
          onClick={() => !isCreatingRule && !isResolving && onToggleExpand()}
        >
          <CardContent className="p-5">
            {!isExpanded && (
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 rounded-lg bg-background/50">
                    <IssueIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground">{issue.title}</h4>
                      <SeverityIcon className="h-4 w-4" />
                      <span className="text-sm font-semibold text-foreground">
                        {issue.count} affected
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {issue.description}
                    </p>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            )}

            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-background/50">
                        <IssueIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-foreground">{issue.title}</h4>
                          <SeverityIcon className="h-4 w-4" />
                          <span className="text-sm font-semibold text-foreground">
                            {issue.count} affected
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {issue.description}
                        </p>
                        {getDetailedSuggestion(issue) && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                            {getDetailedSuggestion(issue)}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleExpand();
                        onCancelRuleCreation();
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </div>

                  {isCreatingRule ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 pt-4 border-t border-border"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div>
                        <p className="text-sm text-foreground mb-3">
                          What rule should I create for this?
                        </p>
                        <Textarea
                          value={newRuleText}
                          onChange={(e) => onRuleTextChange(e.target.value)}
                          placeholder="Type your rule in plain English..."
                          className="w-full h-24 px-3 py-2 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          autoFocus
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCancelRuleCreation();
                          }}
                          className="flex-1 text-muted-foreground"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCreateRule();
                          }}
                          className="flex-1 bg-primary hover:bg-primary/90 rounded-full"
                        >
                          Create Rule
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      {quickActions[0] && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickAction(quickActions[0].id);
                          }}
                          className="h-8 px-3 text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          {quickActions[0].label}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartRuleCreation();
                        }}
                        className="h-8 px-3 text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Create Rule
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onResolve();
                        }}
                        className="h-8 px-3 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Mark Resolved
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

