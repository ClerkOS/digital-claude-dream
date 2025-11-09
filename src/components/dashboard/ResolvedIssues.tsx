import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { DataIssue } from '@/types/dashboard';

interface ResolvedIssuesProps {
  issues: DataIssue[];
}

export function ResolvedIssues({ issues }: ResolvedIssuesProps) {
  if (issues.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-8 mb-8"
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Resolved Issues</h3>
      <div className="space-y-3">
        <AnimatePresence>
          {issues.map((issue) => {
            const IssueIcon = issue.icon;
            return (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 0.6, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <Card className="border-muted bg-muted/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-background/50">
                        <IssueIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-muted-foreground line-through">{issue.title}</h4>
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {issue.count} records resolved
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

