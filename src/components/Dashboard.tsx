import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSpreadsheet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  MessageCircle,
  TriangleAlert,
  UserX,
  FileX,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Project } from '@/types/chat';
import { SpreadsheetViewer } from './SpreadsheetViewer';

interface DashboardProps {
  project: Project;
  onOpenSpreadsheet: () => void;
  onOpenChat: () => void;
  onUploadFiles: () => void;
}

interface SummaryCard {
  id: string;
  title: string;
  value: string;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
}

interface InsightCard {
  id: string;
  type: 'growth' | 'warning' | 'success' | 'info';
  title: string;
  description: string;
  value?: string;
  trend?: 'up' | 'down';
}

interface DataIssue {
  id: string;
  type: 'missing_id' | 'duplicate_receipt' | 'unrecognized_reference' | 'mismatched_name';
  title: string;
  description: string;
  count: number;
  severity: 'high' | 'medium' | 'low';
  suggestedFix?: string;
  affectedRows: number[];
  icon: React.ComponentType<any>;
}

interface DataHealthMetrics {
  cleanlinessPercentage: number;
  totalRecords: number;
  issuesFound: number;
  resolvedIssues: number;
}

interface ProjectRule {
  id: string;
  createdAt: Date;
  naturalLanguage: string;
  category: 'data_validation' | 'categorization' | 'filtering';
  scope: 'all_records' | 'future_only' | 'specific_conditions';
  isActive: boolean;
  appliedToRecords: number;
  relatedIssueType?: string;
}

interface RuleCreationContext {
  issueType: string;
  suggestedRule: string;
  isOpen: boolean;
}

export function Dashboard({ project, onOpenSpreadsheet, onOpenChat, onUploadFiles }: DashboardProps) {
  const [showSpreadsheet, setShowSpreadsheet] = useState(false);
  // const [showChat, setShowChat] = useState(false);
  // const [showCommandBar, setShowCommandBar] = useState(false);
  // const [showConversationDrawer, setShowConversationDrawer] = useState(false);
  // const [commandInput, setCommandInput] = useState('');
  const [insights, setInsights] = useState<InsightCard[]>([]);
  // const [commandHistory, setCommandHistory] = useState<string[]>([]);
  
  // Issues Detection System State
  const [showIssuesDetail, setShowIssuesDetail] = useState(false);
  const [dataIssues, setDataIssues] = useState<DataIssue[]>([]);
  const [dataHealth, setDataHealth] = useState<DataHealthMetrics>({
    cleanlinessPercentage: 85,
    totalRecords: 1250,
    issuesFound: 0, // Will be calculated from dataIssues
    resolvedIssues: 0
  });

  // Rules System State
  const [projectRules, setProjectRules] = useState<ProjectRule[]>([]);
  const [showRulesPanel, setShowRulesPanel] = useState(false);
  const [ruleCreationContext, setRuleCreationContext] = useState<RuleCreationContext>({
    issueType: '',
    suggestedRule: '',
    isOpen: false
  });
  const [newRuleText, setNewRuleText] = useState('');

  // Calculate project-specific metrics
  const hasData = project.files.length > 0 || project.workbookId;
  const fileCount = project.files.length;
  
  // Mock financial data with data health metrics
  const summaryCards: SummaryCard[] = hasData ? [
    {
      id: 'data-health',
      title: 'Data Health',
      value: `${dataHealth.cleanlinessPercentage}%`,
      change: dataHealth.cleanlinessPercentage >= 90 ? 5.2 : -2.1,
      changeType: dataHealth.cleanlinessPercentage >= 90 ? 'positive' : 'negative',
      icon: CheckCircle2,
      color: dataHealth.cleanlinessPercentage >= 90 ? 'text-green-600' : 'text-amber-600'
    },
    {
      id: 'records-organized',
      title: 'Records Organized',
      value: dataHealth.totalRecords.toLocaleString(),
      change: 0,
      changeType: 'neutral',
      icon: FileSpreadsheet,
      color: 'text-blue-600'
    },
    {
      id: 'issues-found',
      title: 'Issues Found',
      value: dataHealth.issuesFound.toString(),
      change: dataHealth.issuesFound > 0 ? -15.3 : 0,
      changeType: dataHealth.issuesFound > 0 ? 'negative' : 'neutral',
      icon: TriangleAlert,
      color: dataHealth.issuesFound > 0 ? 'text-red-600' : 'text-green-600'
    }
  ] : [
    {
      id: 'cash-balance',
      title: 'Cash Balance',
      value: '$0',
      change: 0,
      changeType: 'neutral',
      icon: DollarSign,
      color: 'text-muted-foreground'
    },
    {
      id: 'monthly-expenses',
      title: 'Monthly Expenses',
      value: '$0',
      change: 0,
      changeType: 'neutral',
      icon: CreditCard,
      color: 'text-muted-foreground'
    },
    {
      id: 'receivables',
      title: 'Receivables',
      value: '$0',
      change: 0,
      changeType: 'neutral',
      icon: Receipt,
      color: 'text-muted-foreground'
    }
  ];

  // Generate AI insights
  useEffect(() => {
    const generateInsights = () => {
      if (hasData) {
        setInsights([
          {
            id: 'margin-growth',
            type: 'success',
            title: 'Q3 Margin Growth',
            description: 'Your profit margin increased significantly this quarter',
            value: '+12%',
            trend: 'up'
          },
          {
            id: 'transport-warning',
            type: 'warning',
            title: 'Transport Overspend',
            description: 'You\'re spending 23% more on transport than budgeted',
            value: '$2,400',
            trend: 'down'
          },
          {
            id: 'cash-flow',
            type: 'info',
            title: 'Cash Flow Trend',
            description: 'Operating cash flow improved by 15% month-over-month',
            value: '+15%',
            trend: 'up'
          },
          {
            id: 'invoice-aging',
            type: 'warning',
            title: 'Invoice Aging',
            description: '3 invoices over 30 days old need attention',
            value: '$8,500',
            trend: 'down'
          }
        ]);
      } else {
        setInsights([
          {
            id: 'get-started',
            type: 'info',
            title: 'Get Started',
            description: 'Upload your financial data to unlock powerful insights',
          },
          {
            id: 'connect-sources',
            type: 'info',
            title: 'Connect Data Sources',
            description: 'Link your accounting software for real-time updates',
          }
        ]);
      }
    };

    generateInsights();
  }, [hasData]);

  // Generate mock data issues for demonstration
  useEffect(() => {
    const generateDataIssues = () => {
      if (hasData) {
        const issues = [
          {
            id: 'missing-student-ids',
            type: 'missing_id',
            title: 'Missing Student IDs',
            description: 'Payment records without student identification',
            count: 7,
            severity: 'high',
            suggestedFix: 'Match payments to student records by name and amount',
            affectedRows: [45, 67, 123, 234, 345, 456, 567],
            icon: UserX
          },
          {
            id: 'duplicate-receipts',
            type: 'duplicate_receipt',
            title: 'Duplicate Receipts',
            description: 'Multiple entries for the same payment transaction',
            count: 3,
            severity: 'medium',
            suggestedFix: 'Merge duplicate entries and keep the most complete record',
            affectedRows: [12, 89, 156],
            icon: FileX
          },
          {
            id: 'unrecognized-references',
            type: 'unrecognized_reference',
            title: 'Unrecognized References',
            description: 'Bank references that don\'t match known payment patterns',
            count: 5,
            severity: 'low',
            suggestedFix: 'Review and manually categorize these transactions',
            affectedRows: [78, 134, 201, 289, 378],
            icon: AlertCircle
          }
        ];
        
        setDataIssues(issues);
        
        // Calculate total issues count from the issues array
        const totalIssues = issues.reduce((sum, issue) => sum + issue.count, 0);
        
        setDataHealth(prev => ({
          ...prev,
          issuesFound: totalIssues
        }));
      } else {
        setDataIssues([]);
        setDataHealth({
          cleanlinessPercentage: 0,
          totalRecords: 0,
          issuesFound: 0,
          resolvedIssues: 0
        });
      }
    };

    generateDataIssues();
  }, [hasData]);

  const getInsightIcon = (type: InsightCard['type']) => {
    switch (type) {
      case 'success': return CheckCircle2;
      case 'warning': return AlertCircle;
      case 'growth': return TrendingUp;
      default: return Sparkles;
    }
  };

  const getInsightColor = (type: InsightCard['type']) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'growth': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  // Helper functions for issues system
  const getSeverityColor = (severity: DataIssue['severity']) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getSeverityIcon = (severity: DataIssue['severity']) => {
    switch (severity) {
      case 'high': return TriangleAlert;
      case 'medium': return AlertCircle;
      case 'low': return CheckCircle2;
      default: return AlertCircle;
    }
  };

  const handleResolveIssue = (issueId: string) => {
    const issueToResolve = dataIssues.find(issue => issue.id === issueId);
    
    setDataIssues(prev => {
      const updatedIssues = prev.filter(issue => issue.id !== issueId);
      
      // Calculate new total issues count
      const newTotalIssues = updatedIssues.reduce((sum, issue) => sum + issue.count, 0);
      
      // Update data health with new counts
      setDataHealth(prevHealth => ({
        ...prevHealth,
        resolvedIssues: prevHealth.resolvedIssues + (issueToResolve?.count || 0),
        issuesFound: newTotalIssues,
        cleanlinessPercentage: Math.min(100, prevHealth.cleanlinessPercentage + 2)
      }));
      
      return updatedIssues;
    });
  };

  const handleViewAffectedRows = (issue: DataIssue) => {
    // In a real implementation, this would open a side panel or modal
    // showing the specific rows that have this issue
    console.log('Viewing affected rows for issue:', issue.title, issue.affectedRows);
  };

  // Rules System Helper Functions
  const getSuggestedRule = (issueType: string): string => {
    switch (issueType) {
      case 'missing_id':
        return 'Always require student ID for payment entries';
      case 'duplicate_receipt':
        return 'Flag duplicate receipts for manual review';
      case 'unrecognized_reference':
        return 'Categorize unrecognized references as manual review';
      default:
        return 'Create custom rule for this issue type';
    }
  };

  const openRuleCreation = (issueType: string) => {
    setRuleCreationContext({
      issueType,
      suggestedRule: getSuggestedRule(issueType),
      isOpen: true
    });
    setNewRuleText(getSuggestedRule(issueType));
  };

  const createRule = () => {
    if (!newRuleText.trim()) return;

    const newRule: ProjectRule = {
      id: `rule-${Date.now()}`,
      createdAt: new Date(),
      naturalLanguage: newRuleText,
      category: 'data_validation',
      scope: 'future_only',
      isActive: true,
      appliedToRecords: 0,
      relatedIssueType: ruleCreationContext.issueType
    };

    setProjectRules(prev => [newRule, ...prev]);
    setRuleCreationContext({ issueType: '', suggestedRule: '', isOpen: false });
    setNewRuleText('');

    // Auto-apply rule to resolve related issues
    if (ruleCreationContext.issueType) {
      handleResolveIssueByRule(ruleCreationContext.issueType);
    }
  };

  const handleResolveIssueByRule = (issueType: string) => {
    setDataIssues(prev => {
      const updatedIssues = prev.filter(issue => issue.type !== issueType);
      
      const newTotalIssues = updatedIssues.reduce((sum, issue) => sum + issue.count, 0);
      
      setDataHealth(prevHealth => ({
        ...prevHealth,
        issuesFound: newTotalIssues,
        cleanlinessPercentage: Math.min(100, prevHealth.cleanlinessPercentage + 3)
      }));
      
      return updatedIssues;
    });
  };

  const deleteRule = (ruleId: string) => {
    setProjectRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  // Handle command submission
  // const handleCommandSubmit = () => {
  //   if (!commandInput.trim()) return;

  //   // Add to history
  //   setCommandHistory(prev => [...prev, commandInput]);
    
  //   // Generate new insight based on command
  //   const newInsight: InsightCard = {
  //     id: `command-${Date.now()}`,
  //     type: 'info',
  //     title: 'AI Analysis',
  //     description: `Based on your request: "${commandInput}"`,
  //     value: 'New',
  //     trend: 'up'
  //   };

  //   // Add new insight to the top
  //   setInsights(prev => [newInsight, ...prev]);

  //   // Clear input and close command bar
  //   setCommandInput('');
  //   setShowCommandBar(false);
  // };

  // Handle keyboard shortcuts
  // useEffect(() => {
  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     // Cmd/Ctrl + K to open command bar
  //     if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
  //       e.preventDefault();
  //       setShowCommandBar(true);
  //     }
  //     // Escape to close command bar
  //     if (e.key === 'Escape' && showCommandBar) {
  //       setShowCommandBar(false);
  //       setCommandInput('');
  //     }
  //   };

  //   window.addEventListener('keydown', handleKeyDown);
  //   return () => window.removeEventListener('keydown', handleKeyDown);
  // }, [showCommandBar]);

  return (
    <div className="h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Dimming Overlay */}
      {/* <AnimatePresence>
        {showCommandBar && (
      <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 z-30"
            onClick={() => setShowCommandBar(false)}
          />
        )}
      </AnimatePresence> */}

      {/* Main Dashboard Surface */}
      <div className="flex-1 overflow-y-auto transition-all duration-200">
        {/* Header with Spreadsheet Toggle */}
        <div className="flex items-center justify-between px-8 py-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-1">{project.name}</h1>
            <p className="text-sm text-muted-foreground">Financial overview and insights</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Rules Panel Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRulesPanel(true)}
              className="h-9 px-3 text-xs font-medium hover:bg-primary/5 hover:border-primary/30"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Rules
            </Button>
            
            {/* Spreadsheet Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSpreadsheet(!showSpreadsheet)}
              className="h-9 px-3 text-xs font-medium hover:bg-primary/5 hover:border-primary/30"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Sheet
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="px-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {summaryCards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
          <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            {card.title}
                          </p>
                          <p className="text-2xl font-semibold text-foreground">
                            {card.value}
                          </p>
                        </div>
                        <div className={`p-3 rounded-lg bg-muted/50 ${card.color}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                      </div>
                      
                      {card.change !== 0 && (
                        <div className="flex items-center mt-4">
                          {card.changeType === 'positive' ? (
                            <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                          )}
                          <span className={`text-sm font-medium ${
                            card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {Math.abs(card.change)}%
                          </span>
                          <span className="text-sm text-muted-foreground ml-1">vs last month</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Issues Detected Card */}
        {hasData && dataIssues.length > 0 && (
          <div className="px-8 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-amber-200 bg-amber-50 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    onClick={() => setShowIssuesDetail(!showIssuesDetail)}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <TriangleAlert className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-amber-900">Issues Detected</h3>
                        <p className="text-sm text-amber-700">
                          {dataHealth.issuesFound} issue{dataHealth.issuesFound !== 1 ? 's' : ''} found in your data
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-amber-800">
                        {showIssuesDetail ? 'Hide Details' : 'View Details'}
                      </span>
                      {showIssuesDetail ? (
                        <ChevronUp className="h-4 w-4 text-amber-600" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-amber-600" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Issues Detail View */}
        <AnimatePresence>
          {showIssuesDetail && hasData && dataIssues.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="px-8 mb-8 overflow-hidden"
            >
              <div className="space-y-4">
                {dataIssues.map((issue, index) => {
                  const SeverityIcon = getSeverityIcon(issue.severity);
                  const IssueIcon = issue.icon;
                  
                  return (
                    <motion.div
                      key={issue.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`border ${getSeverityColor(issue.severity)} hover:shadow-md transition-shadow duration-200`}>
                        <CardContent className="p-5">
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
                                {issue.suggestedFix && (
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                    <p className="text-sm text-blue-800">
                                      <strong>Suggestion:</strong> {issue.suggestedFix}
                                    </p>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewAffectedRows(issue);
                                    }}
                                    className="h-8 px-3 text-xs"
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View Rows
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openRuleCreation(issue.type);
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
                                      handleResolveIssue(issue.id);
                                    }}
                                    className="h-8 px-3 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Mark Resolved
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Rule Creation Panel */}
      <AnimatePresence>
        {ruleCreationContext.isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-96 bg-background border-l border-border shadow-2xl z-50"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Create Rule</h2>
                  <p className="text-sm text-muted-foreground">Prevent this issue in the future</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRuleCreationContext({ issueType: '', suggestedRule: '', isOpen: false })}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              
              {/* Content */}
              <div className="flex-1 p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Rule (Plain English)
                    </label>
                    <textarea
                      value={newRuleText}
                      onChange={(e) => setNewRuleText(e.target.value)}
                      placeholder="Type your rule in plain English..."
                      className="w-full h-24 px-3 py-2 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      autoFocus
                    />
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Auto-commit:</strong> Rules are applied immediately when created.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-6 border-t border-border">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setRuleCreationContext({ issueType: '', suggestedRule: '', isOpen: false })}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={createRule}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    Create Rule
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules Panel */}
      <AnimatePresence>
        {showRulesPanel && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-80 bg-background border-l border-border shadow-2xl z-40"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Rules</h2>
                  <p className="text-sm text-muted-foreground">{project.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRulesPanel(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              
              {/* Rules List */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-4">
                  {projectRules.length === 0 ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">No rules created yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Create rules from issues to prevent them in the future</p>
                    </div>
                  ) : (
                    projectRules.map((rule) => (
                      <div key={rule.id} className="bg-muted/20 rounded-lg p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-foreground leading-relaxed">
                              • {rule.naturalLanguage}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Created {rule.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteRule(rule.id)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* AI Insights */}
        <div className="px-8 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">AI Insights</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => {
              const IconComponent = getInsightIcon(insight.type);
              const isNewInsight = insight.id.startsWith('command-');
              return (
                <motion.div
                  key={insight.id}
                  initial={{ 
                    opacity: 0, 
                    y: isNewInsight ? -20 : 20,
                    scale: isNewInsight ? 0.95 : 1
                  }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: 1
                  }}
                  transition={{ 
                    delay: isNewInsight ? 0 : (index + 3) * 0.1,
                    duration: isNewInsight ? 0.3 : 0.2
                  }}
                >
                  <Card className={`border ${getInsightColor(insight.type)} hover:shadow-md transition-shadow duration-200 ${isNewInsight ? 'ring-2 ring-primary/20' : ''}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-background/50">
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-foreground">{insight.title}</h3>
                            {insight.value && (
                              <span className="text-sm font-semibold text-foreground">
                                {insight.value}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {insight.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* End of main content */}
        <div className="px-8 pb-8">
        </div>
      </div>

      {/* Spreadsheet Slide-over */}
      <AnimatePresence>
        {showSpreadsheet && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-1/2 bg-background border-l border-border shadow-2xl z-50"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Structured Data</h2>
                  <p className="text-sm text-muted-foreground">Explore your cleaned dataset</p>
                  </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSpreadsheet(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              
              {/* Spreadsheet Content */}
              <div className="flex-1 overflow-hidden">
                <SpreadsheetViewer 
                  workbookId={project.workbookId}
                  className="h-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command Bar Trigger */}
      {/* <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
                <Button
            onClick={() => setShowCommandBar(true)}
            className="h-12 px-6 bg-white border border-border shadow-lg hover:shadow-xl hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 text-foreground font-medium"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Ask Zigma anything...
                </Button>
          </motion.div>
      </div> */}

      {/* Command Bar */}
      {/* <AnimatePresence>
        {showCommandBar && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50"
          >
            <div className="bg-white/95 backdrop-blur-sm border-t border-border shadow-2xl">
              <div className="max-w-2xl mx-auto p-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-primary text-sm font-semibold">Z</span>
                  </div>
                  <input
                    type="text"
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCommandSubmit();
                      }
                    }}
                    placeholder="Ask Zigma anything..."
                    className="flex-1 bg-transparent border-none outline-none text-lg font-medium placeholder:text-muted-foreground"
                    autoFocus
                  />
                  <div className="text-xs text-muted-foreground">
                    Press Enter to submit
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence> */}

      {/* Conversation Drawer for Power Users */}
      {/* <AnimatePresence>
        {showConversationDrawer && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-96 bg-background border-l border-border shadow-2xl z-50"
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Conversation</h2>
                  <p className="text-sm text-muted-foreground">Message history</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConversationDrawer(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-4">
                  {commandHistory.map((command, index) => (
                    <div key={index} className="bg-muted/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-primary text-xs font-semibold">U</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{command}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date().toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {commandHistory.length === 0 && (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">No conversation history</p>
                      <p className="text-xs text-muted-foreground mt-1">Start typing commands to see them here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence> */}

      {/* Conversation Button */}
      {/* {commandHistory.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={() => setShowConversationDrawer(true)}
            variant="outline"
            size="sm"
            className="h-10 px-3 bg-white/95 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Conversation
          </Button>
          </div>
      )} */}
    </div>
  );
}