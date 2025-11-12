import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LayoutDashboard, RefreshCw, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PipelineWorkflow } from '@/types/pipeline';

interface PipelineNavProps {
  workflows: PipelineWorkflow[];
  onSelectWorkflow: (workflowId: string) => void;
  onNavigateToDashboard: () => void;
  onNavigateToRules: () => void;
}

export function PipelineNav({
  workflows,
  onSelectWorkflow,
  onNavigateToDashboard,
  onNavigateToRules,
}: PipelineNavProps) {
  const [showPipelines, setShowPipelines] = useState(false);

  return (
    <nav className="w-full border-b border-border bg-background z-50">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-end">
          {/* Nav Items */}
          <div className="flex items-center gap-2">
            {/* Pipelines Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPipelines(!showPipelines)}
                className="h-9 px-3 text-xs font-medium hover:bg-primary/5 hover:border-primary/30"
              >
                Pipelines
                <ChevronDown
                  className={`w-3 h-3 ml-2 transition-transform ${showPipelines ? 'rotate-180' : ''}`}
                />
              </Button>

              <AnimatePresence>
                {showPipelines && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowPipelines(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-md z-50"
                    >
                      <div className="p-2">
                        {workflows.length === 0 ? (
                          <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                            No saved workflows yet
                          </div>
                        ) : (
                          workflows.map((workflow) => (
                            <button
                              key={workflow.id}
                              onClick={() => {
                                onSelectWorkflow(workflow.id);
                                setShowPipelines(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-muted/50 rounded-md transition-colors"
                            >
                              <div className="font-medium text-foreground text-xs">
                                {workflow.name}
                              </div>
                              {workflow.description && (
                                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                  {workflow.description}
                                </div>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Dashboard */}
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateToDashboard}
              className="h-9 px-3 text-xs font-medium hover:bg-primary/5 hover:border-primary/30"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>

            {/* Rules */}
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateToRules}
              className="h-9 px-3 text-xs font-medium hover:bg-primary/5 hover:border-primary/30"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Rules
            </Button>

            {/* Help */}
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-xs font-medium hover:bg-primary/5 hover:border-primary/30"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Help
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

