import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, RefreshCw, Check, X, Clock, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { getSession, executeAgent } from '@/lib/api';
import type { AgentExecutionResponse } from '@/lib/api/langgraph';
import type { GetSessionResponse } from '@/lib/api/sessions';
import { DataViewer } from './DataViewer';

interface Rule {
  id: string;
  request: string;
  timestamp: string;
  status: 'success' | 'failed';
  steps?: Array<{
    op: string;
    status: string;
  }>;
}

interface SimpleRulesInterfaceProps {
  sessionId: string;
}

export function SimpleRulesInterface({ sessionId }: SimpleRulesInterfaceProps) {
  const [ruleInput, setRuleInput] = useState('');
  const [rules, setRules] = useState<Rule[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [sessionData, setSessionData] = useState<GetSessionResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [showDataViewer, setShowDataViewer] = useState(false);

  // Load session and history on mount
  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const session = await getSession(sessionId);
      setSessionData(session);
      
      // Convert history to rules format
      const historyRules: Rule[] = session.history.map((item, index) => ({
        id: `rule-${index}`,
        request: item.step?.op || 'Unknown operation',
        timestamp: new Date().toISOString(),
        status: 'success',
        steps: item.step ? [{ op: item.step.op, status: 'success' }] : [],
      }));
      
      setRules(historyRules);
    } catch (err) {
      console.error('Failed to load session:', err);
      setError('Failed to load session data');
    }
  };

  const handleExecuteRule = async () => {
    if (!ruleInput.trim() || isExecuting) return;

    setIsExecuting(true);
    setError('');

    try {
      const result: AgentExecutionResponse = await executeAgent(sessionId, ruleInput.trim());
      
      // Add to rules list
      const newRule: Rule = {
        id: `rule-${Date.now()}`,
        request: ruleInput.trim(),
        timestamp: new Date().toISOString(),
        status: result.execution_status === 'success' ? 'success' : 'failed',
        steps: result.steps,
      };

      setRules(prev => [newRule, ...prev]);
      setRuleInput('');
      
      // Reload session to get updated history
      await loadSession();
    } catch (err: any) {
      console.error('Failed to execute rule:', err);
      setError(err.message || 'Failed to execute rule');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRerunRule = async (rule: Rule) => {
    setRuleInput(rule.request);
    setTimeout(() => handleExecuteRule(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleExecuteRule();
    }
  };

  return (
    <>
      {/* Data Viewer Modal */}
      {showDataViewer && (
        <DataViewer
          sessionId={sessionId}
          onClose={() => setShowDataViewer(false)}
        />
      )}

      <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-1">Data Rules</h1>
            <p className="text-sm text-muted-foreground">
              {sessionData ? (
                <>
                  {sessionData.schema.row_count.toLocaleString()} rows • 
                  {sessionData.schema.columns.length} columns • 
                  {rules.length} rules applied
                </>
              ) : (
                'Loading...'
              )}
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDataViewer(true)}
            disabled={!sessionData}
            className="h-9 px-3 text-xs font-medium"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            View Data
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Rule Input */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Create a new rule
                </label>
                <div className="flex gap-2">
                  <Textarea
                    value={ruleInput}
                    onChange={(e) => setRuleInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder='e.g., "Rename column A to Name" or "Filter rows where amount > 100"'
                    className="min-h-[80px] resize-none"
                    disabled={isExecuting}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Press Enter to execute • Shift+Enter for new line
                  </p>
                  <Button
                    onClick={handleExecuteRule}
                    disabled={!ruleInput.trim() || isExecuting}
                    size="sm"
                    className="h-8"
                  >
                    {isExecuting ? (
                      <>
                        <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Send className="h-3 w-3 mr-2" />
                        Execute Rule
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-xs text-red-700">{error}</p>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Rules History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Previous Rules
              </h2>
              {rules.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadSession}
                  className="h-8 text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              )}
            </div>

            {rules.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No rules executed yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create your first rule to transform your data
                  </p>
                </CardContent>
              </Card>
            ) : (
              <AnimatePresence>
                {rules.map((rule, index) => (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              {rule.status === 'success' ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <X className="h-4 w-4 text-red-600" />
                              )}
                              <p className="text-sm font-medium text-foreground">
                                {rule.request}
                              </p>
                            </div>
                            
                            {rule.steps && rule.steps.length > 0 && (
                              <div className="pl-6 space-y-1">
                                {rule.steps.map((step, idx) => (
                                  <p key={idx} className="text-xs text-muted-foreground">
                                    {step.status === 'success' ? '✓' : '✗'} {step.op}
                                  </p>
                                ))}
                              </div>
                            )}
                            
                            <p className="text-xs text-muted-foreground pl-6">
                              {new Date(rule.timestamp).toLocaleString()}
                            </p>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRerunRule(rule)}
                            disabled={isExecuting}
                            className="h-8 px-3 text-xs"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Re-run
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

