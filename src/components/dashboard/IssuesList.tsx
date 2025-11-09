import { motion, AnimatePresence } from 'framer-motion';
import type { DataIssue } from '@/types/dashboard';
import { IssueCard } from './IssueCard';
import { getDetailedSuggestion } from '@/utils/issueHelpers';

interface IssuesListProps {
  issues: DataIssue[];
  expandedIssueId: string | null;
  issueCreatingRule: string | null;
  pulsedIssueId: string | null;
  newRuleText: string;
  onToggleExpand: (issueId: string) => void;
  onStartRuleCreation: (issueId: string) => void;
  onCancelRuleCreation: () => void;
  onCreateRule: (issueId: string) => void;
  onQuickAction: (actionId: string, issue: DataIssue) => void;
  onResolve: (issueId: string) => void;
  onRuleTextChange: (text: string) => void;
}

export function IssuesList({
  issues,
  expandedIssueId,
  issueCreatingRule,
  pulsedIssueId,
  newRuleText,
  onToggleExpand,
  onStartRuleCreation,
  onCancelRuleCreation,
  onCreateRule,
  onQuickAction,
  onResolve,
  onRuleTextChange,
}: IssuesListProps) {
  if (issues.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="px-8 mb-8 overflow-hidden"
      >
        <div className="space-y-3">
          {issues.map((issue, index) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              isExpanded={expandedIssueId === issue.id}
              isCreatingRule={issueCreatingRule === issue.id}
              isResolving={issue.isResolving || false}
              isPulsed={pulsedIssueId === issue.id}
              newRuleText={newRuleText}
              onToggleExpand={() => onToggleExpand(issue.id)}
              onStartRuleCreation={() => onStartRuleCreation(issue.id)}
              onCancelRuleCreation={onCancelRuleCreation}
              onCreateRule={() => onCreateRule(issue.id)}
              onQuickAction={(actionId) => onQuickAction(actionId, issue)}
              onResolve={() => onResolve(issue.id)}
              onRuleTextChange={onRuleTextChange}
              getDetailedSuggestion={getDetailedSuggestion}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

