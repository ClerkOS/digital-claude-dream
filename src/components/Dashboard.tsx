import { useState, useEffect } from 'react';
import type React from 'react';
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
  X,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Project } from '@/types/chat';
import { SpreadsheetViewer } from './SpreadsheetViewer';
import { Textarea } from '@/components/ui/textarea';
import { SystemBanner } from './SystemBanner';

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
  isResolved?: boolean;
  isResolving?: boolean;
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
  const [isCreatingStandaloneRule, setIsCreatingStandaloneRule] = useState(false);

  // Issue Expansion State
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);
  const [issueCreatingRule, setIssueCreatingRule] = useState<string | null>(null);
  const [resolvedIssues, setResolvedIssues] = useState<DataIssue[]>([]);

  // System Banner State
  const [systemBannerMessage, setSystemBannerMessage] = useState('');
  const [systemBannerVisible, setSystemBannerVisible] = useState(false);
  
  // Pulse effect state - track which issue triggered it
  const [pulsedIssueId, setPulsedIssueId] = useState<string | null>(null);

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
    if (!issueToResolve) return;
    
    // First, mark as resolving (fade to gray)
    setDataIssues(prev => prev.map(issue => 
      issue.id === issueId ? { ...issue, isResolving: true } : issue
    ));

    // After fade animation, move to resolved
    setTimeout(() => {
      setDataIssues(prev => {
        const updatedIssues = prev.filter(issue => issue.id !== issueId);
        
        // Calculate new total issues count
        const newTotalIssues = updatedIssues.reduce((sum, issue) => sum + issue.count, 0);
        
        // Update data health with new counts
        setDataHealth(prevHealth => ({
          ...prevHealth,
          resolvedIssues: prevHealth.resolvedIssues + issueToResolve.count,
          issuesFound: newTotalIssues,
          cleanlinessPercentage: Math.min(100, prevHealth.cleanlinessPercentage + 2)
        }));
        
        // Add to resolved issues list
        setResolvedIssues(prev => [...prev, { ...issueToResolve, isResolved: true }]);
        
        return updatedIssues;
      });
    }, 600); // Wait for fade animation
  };

  const handleViewAffectedRows = (issue: DataIssue) => {
    // In a real implementation, this would open a side panel or modal
    // showing the specific rows that have this issue
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

  const openRuleCreation = (issueId: string) => {
    setExpandedIssueId(issueId);
    setIssueCreatingRule(issueId);
    const issue = dataIssues.find(i => i.id === issueId);
    if (issue) {
      const suggestions = getAISuggestions(issue.type);
      setNewRuleText(suggestions[0] || '');
    }
  };

  const createRule = (issueId: string) => {
    if (!newRuleText.trim()) return;

    const issue = dataIssues.find(i => i.id === issueId);
    if (!issue) return;

    const newRule: ProjectRule = {
      id: `rule-${Date.now()}`,
      createdAt: new Date(),
      naturalLanguage: newRuleText,
      category: 'data_validation',
      scope: 'future_only',
      isActive: true,
      appliedToRecords: 0,
      relatedIssueType: issue.type
    };

    setProjectRules(prev => [newRule, ...prev]);
    setNewRuleText('');
    setIssueCreatingRule(null);

    // Show system banner
    setSystemBannerMessage(`✨ Rule created: ${newRuleText}`);
    setSystemBannerVisible(true);
    setTimeout(() => {
      setSystemBannerVisible(false);
    }, 3000);

    // Trigger pulse effect on this specific issue
    setPulsedIssueId(issueId);
    setTimeout(() => setPulsedIssueId(null), 600);

    // Resolve issue with alive feedback after a brief delay
    setTimeout(() => {
      handleResolveIssueByRule(issueId);
    }, 500);
  };

  const createStandaloneRule = () => {
    if (!newRuleText.trim()) return;

    const newRule: ProjectRule = {
      id: `rule-${Date.now()}`,
      createdAt: new Date(),
      naturalLanguage: newRuleText,
      category: 'data_validation',
      scope: 'future_only',
      isActive: true,
      appliedToRecords: 0
      // No relatedIssueType for standalone rules
    };

    setProjectRules(prev => [newRule, ...prev]);
    setNewRuleText('');
    setIsCreatingStandaloneRule(false);

    // Show system banner
    setSystemBannerMessage(`✨ Rule created: ${newRuleText}`);
    setSystemBannerVisible(true);
    setTimeout(() => {
      setSystemBannerVisible(false);
    }, 3000);
  };

  const handleResolveIssueByRule = (issueId: string) => {
    const issueToResolve = dataIssues.find(i => i.id === issueId);
    if (!issueToResolve) return;

    // First, mark as resolving (fade to gray)
    setDataIssues(prev => prev.map(issue => 
      issue.id === issueId ? { ...issue, isResolving: true } : issue
    ));

    // After fade animation, move to resolved
    setTimeout(() => {
      setDataIssues(prev => {
        const updatedIssues = prev.filter(issue => issue.id !== issueId);
        const newTotalIssues = updatedIssues.reduce((sum, issue) => sum + issue.count, 0);
        
        setDataHealth(prevHealth => ({
          ...prevHealth,
          issuesFound: newTotalIssues,
          resolvedIssues: prevHealth.resolvedIssues + issueToResolve.count,
          cleanlinessPercentage: Math.min(100, prevHealth.cleanlinessPercentage + 3)
        }));
        
        return updatedIssues;
      });

      // Add to resolved issues
      setResolvedIssues(prev => [...prev, { ...issueToResolve, isResolved: true }]);
      setExpandedIssueId(null);
    }, 600); // Wait for fade animation
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

  // Get detailed suggestion with specific information
  const getDetailedSuggestion = (issue: DataIssue): React.ReactNode | null => {
    switch (issue.type) {
      case 'duplicate_receipt':
        // Show example duplicate receipt names/IDs
        const exampleReceipts = issue.affectedRows.slice(0, 3).map(row => 
          `Receipt #${row}`
        ).join(', ');
        const moreCount = issue.affectedRows.length - 3;
        return (
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-1">Examples:</p>
            <p>{exampleReceipts}{moreCount > 0 ? `, and ${moreCount} more...` : ''}</p>
          </div>
        );
      case 'missing_id':
        const examplePayments = issue.affectedRows.slice(0, 3).map(row => 
          `Payment #${row}`
        ).join(', ');
        const morePayments = issue.affectedRows.length - 3;
        return (
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-1">Affected payments:</p>
            <p>{examplePayments}{morePayments > 0 ? `, and ${morePayments} more...` : ''}</p>
          </div>
        );
      case 'unrecognized_reference':
        return (
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-1">Unrecognized references:</p>
            <p>REF-{issue.affectedRows[0]}, REF-{issue.affectedRows[1]}{issue.affectedRows.length > 2 ? `, and ${issue.affectedRows.length - 2} more...` : ''}</p>
          </div>
        );
      default:
        return null;
    }
  };

  // Get quick actions based on issue type
  const getQuickActions = (issueType: string): Array<{ id: string; label: string; primary: boolean }> => {
    switch (issueType) {
      case 'missing_id':
        return [
          { id: 'match-auto', label: 'Match automatically', primary: true },
          { id: 'create-rule', label: 'Create rule', primary: false }
        ];
      case 'duplicate_receipt':
        return [
          { id: 'merge-auto', label: 'Merge automatically', primary: true },
          { id: 'create-rule', label: 'Create rule', primary: false }
        ];
      case 'unrecognized_reference':
        return [
          { id: 'flag-review', label: 'Flag for review', primary: true },
          { id: 'create-rule', label: 'Create rule', primary: false }
        ];
      default:
        return [
          { id: 'create-rule', label: 'Create rule', primary: true }
        ];
    }
  };

  // Handle quick actions
  const handleQuickAction = (actionId: string, issue: DataIssue) => {
    switch (actionId) {
      case 'match-auto':
        // Auto-match missing IDs
        setSystemBannerMessage(`✨ Matched ${issue.count} payment${issue.count > 1 ? 's' : ''} automatically`);
        setSystemBannerVisible(true);
        setTimeout(() => setSystemBannerVisible(false), 3000);
        handleResolveIssue(issue.id);
        break;
      case 'merge-auto':
        // Auto-merge duplicates
        setSystemBannerMessage(`✨ Merged ${issue.count} duplicate${issue.count > 1 ? 's' : ''} automatically`);
        setSystemBannerVisible(true);
        setTimeout(() => setSystemBannerVisible(false), 3000);
        handleResolveIssue(issue.id);
        break;
      case 'flag-review':
        // Flag for review
        setSystemBannerMessage(`✨ Flagged ${issue.count} transaction${issue.count > 1 ? 's' : ''} for review`);
        setSystemBannerVisible(true);
        setTimeout(() => setSystemBannerVisible(false), 3000);
        handleResolveIssue(issue.id);
        break;
    }
  };

  // Get AI suggestions for inline rule creation
  const getAISuggestions = (issueType: string): string[] => {
    switch (issueType) {
      case 'missing_id':
        return [
          'Always require student ID for payment entries',
          'Match payments to student records by name and amount',
          'Ensure all payment records have a unique identifier'
        ];
      case 'duplicate_receipt':
        return [
          'Flag duplicate receipts for manual review',
          'Merge duplicate entries and keep the most complete record',
          'Ensure all payment transactions are unique'
        ];
      case 'unrecognized_reference':
        return [
          'Categorize unrecognized references as manual review',
          'Review and manually categorize these transactions',
          'Ensure all bank references are recognized'
        ];
      default:
        return [];
    }
  };



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

        
        {/* Issues Detail View */}
        <AnimatePresence>
          {hasData && dataIssues.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="px-8 mb-8 overflow-hidden"
            >
              <div className="space-y-3">
                {dataIssues.map((issue, index) => {
                  const SeverityIcon = getSeverityIcon(issue.severity);
                  const IssueIcon = issue.icon;
                  const isExpanded = expandedIssueId === issue.id;
                  const isCreatingRule = issueCreatingRule === issue.id;
                  const aiSuggestions = isCreatingRule ? getAISuggestions(issue.type) : [];
                  
                  return (
                    <motion.div
                      key={issue.id}
                      initial={{ opacity: 0, x: -20, scale: 0.98 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0, 
                        scale: 1,
                      }}
                      transition={{ 
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                      }}
                      className={pulsedIssueId === issue.id ? 'relative' : ''}
                    >
                      {pulsedIssueId === issue.id && (
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
                          } ${issue.isResolving ? 'opacity-40 bg-muted/20' : ''}`}
                          onClick={() => !isCreatingRule && !issue.isResolving && setExpandedIssueId(isExpanded ? null : issue.id)}
                        >
                          <CardContent className="p-5">
                                                      {/* Collapsed View */}
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

                          {/* Expanded View */}
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="space-y-4">
                                {/* Issue Header */}
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
                                      {/* Enhanced Suggestion with Details */}
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
                                      setExpandedIssueId(null);
                                      setIssueCreatingRule(null);
                                    }}
                                    className="h-8 w-8 p-0"
                                  >
                                    <ChevronUp className="h-4 w-4" />
                                  </Button>
                                </div>

                                                                 {/* Inline Rule Creation */}
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
                                          onChange={(e) => setNewRuleText(e.target.value)}
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
                                           setIssueCreatingRule(null);
                                           setNewRuleText('');
                                         }}
                                         className="flex-1 text-muted-foreground"
                                       >
                                         Cancel
                                       </Button>
                                       <Button
                                         size="sm"
                                         onClick={(e) => {
                                           e.stopPropagation();
                                           createRule(issue.id);
                                         }}
                                         className="flex-1 bg-primary hover:bg-primary/90 rounded-full"
                                       >
                                         Create Rule
                                       </Button>
                                     </div>
                                  </motion.div>
                                                                 ) : (
                                   <div className="flex items-center gap-2 pt-2 border-t border-border">
                                     {/* Automatic Action Button (replaces View Rows) */}
                                     {getQuickActions(issue.type)[0] && (
                                       <Button
                                         variant="outline"
                                         size="sm"
                                         onClick={(e) => {
                                           e.stopPropagation();
                                           const primaryAction = getQuickActions(issue.type)[0];
                                           handleQuickAction(primaryAction.id, issue);
                                         }}
                                         className="h-8 px-3 text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                       >
                                         <Check className="h-3 w-3 mr-1" />
                                         {getQuickActions(issue.type)[0].label}
                                       </Button>
                                     )}
                                     <Button
                                       variant="outline"
                                       size="sm"
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         openRuleCreation(issue.id);
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
                                 )}
                              </div>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resolved Issues Section */}
        {resolvedIssues.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-8 mb-8"
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Resolved Issues</h3>
            <div className="space-y-3">
              <AnimatePresence>
                {resolvedIssues.map((issue) => {
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
        )}

        {/* System Banner */}
        <SystemBanner message={systemBannerMessage} isVisible={systemBannerVisible} />

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
                  onClick={() => {
                    setShowRulesPanel(false);
                    setIsCreatingStandaloneRule(false);
                    setNewRuleText('');
                  }}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              
              {/* Rules List */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-4">
                  {/* Standalone Rule Creation Form */}
                  {isCreatingStandaloneRule && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-muted/20 rounded-lg p-4 border border-border"
                    >
                      <p className="text-sm font-medium text-foreground mb-3">
                        Create New Rule
                      </p>
                      <Textarea
                        value={newRuleText}
                        onChange={(e) => setNewRuleText(e.target.value)}
                        placeholder="Type your rule in plain English..."
                        className="w-full h-24 px-3 py-2 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-3"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsCreatingStandaloneRule(false);
                            setNewRuleText('');
                          }}
                          className="flex-1 text-muted-foreground"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={createStandaloneRule}
                          className="flex-1 bg-primary hover:bg-primary/90"
                          disabled={!newRuleText.trim()}
                        >
                          Create Rule
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {projectRules.length === 0 && !isCreatingStandaloneRule && (
                    <div className="text-center py-8">
                      <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">No rules created yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Create rules to validate and organize your data</p>
                    </div>
                  )}
                  
                  {projectRules.map((rule) => (
                    <div key={rule.id} className="bg-muted/20 rounded-lg p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-foreground leading-relaxed">
                            • {rule.naturalLanguage}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Created {rule.createdAt.toLocaleDateString()}
                            {rule.relatedIssueType && (
                              <span className="ml-2 text-xs text-blue-600">
                                (from {rule.relatedIssueType.replace(/_/g, ' ')})
                              </span>
                            )}
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
                  ))}
                </div>
              </div>

              {/* Footer with Create Button */}
              <div className="p-6 border-t border-border">
                {!isCreatingStandaloneRule ? (
                  <Button
                    onClick={() => {
                      setIsCreatingStandaloneRule(true);
                      setNewRuleText('');
                    }}
                    variant="outline"
                    className="w-full h-9 text-sm font-medium bg-primary/5 hover:bg-primary/10 text-primary border-primary/20 hover:border-primary/30"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Rule
                  </Button>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>



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