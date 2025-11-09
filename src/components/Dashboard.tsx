import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FileSpreadsheet, 
  DollarSign, 
  CreditCard, 
  Receipt,
  CheckCircle2,
  TriangleAlert,
} from 'lucide-react';
import { Project } from '@/types/chat';
import { 
  DataIssue, 
  DataHealthMetrics, 
  ProjectRule, 
  SummaryCard 
} from '@/types/dashboard';
import { 
  DATA_HEALTH_DEFAULTS, 
  HEALTH_IMPROVEMENT, 
  ANIMATION_DURATION,
  SYSTEM_BANNER_TIMEOUT,
  RULE_CREATION_DELAYS,
  RULE_CATEGORIES,
  RULE_SCOPES,
} from '@/constants';
import { SystemBanner } from './SystemBanner';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { SummaryCards } from './dashboard/SummaryCards';
import { IssuesList } from './dashboard/IssuesList';
import { ResolvedIssues } from './dashboard/ResolvedIssues';
import { RulesPanel } from './dashboard/RulesPanel';
import { SpreadsheetSlideOver } from './dashboard/SpreadsheetSlideOver';
import { generateMockIssues } from '@/data/mockIssues';
import { getAISuggestions } from '@/utils/dashboardHelpers';

interface DashboardProps {
  project: Project;
  onOpenSpreadsheet: () => void;
  onOpenChat: () => void;
  onUploadFiles: () => void;
}

export function Dashboard({ project, onOpenSpreadsheet, onOpenChat, onUploadFiles }: DashboardProps) {
  const [showSpreadsheet, setShowSpreadsheet] = useState(false);
  const [dataIssues, setDataIssues] = useState<DataIssue[]>([]);
  const [dataHealth, setDataHealth] = useState<DataHealthMetrics>({
    cleanlinessPercentage: DATA_HEALTH_DEFAULTS.CLEANLINESS_PERCENTAGE,
    totalRecords: DATA_HEALTH_DEFAULTS.TOTAL_RECORDS,
    issuesFound: DATA_HEALTH_DEFAULTS.ISSUES_FOUND,
    resolvedIssues: DATA_HEALTH_DEFAULTS.RESOLVED_ISSUES
  });

  const [projectRules, setProjectRules] = useState<ProjectRule[]>([]);
  const [showRulesPanel, setShowRulesPanel] = useState(false);
  const [newRuleText, setNewRuleText] = useState('');
  const [isCreatingStandaloneRule, setIsCreatingStandaloneRule] = useState(false);

  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);
  const [issueCreatingRule, setIssueCreatingRule] = useState<string | null>(null);
  const [resolvedIssues, setResolvedIssues] = useState<DataIssue[]>([]);

  const [systemBannerMessage, setSystemBannerMessage] = useState('');
  const [systemBannerVisible, setSystemBannerVisible] = useState(false);
  const [pulsedIssueId, setPulsedIssueId] = useState<string | null>(null);

  const hasData = project.files.length > 0 || project.workbookId;
  
  // Generate summary cards
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

  // Generate mock data issues
  useEffect(() => {
    if (hasData) {
      const issues = generateMockIssues();
      setDataIssues(issues);
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
  }, [hasData]);

  const showSystemBanner = useCallback((message: string) => {
    setSystemBannerMessage(message);
    setSystemBannerVisible(true);
    setTimeout(() => {
      setSystemBannerVisible(false);
    }, SYSTEM_BANNER_TIMEOUT);
  }, []);

  const handleResolveIssue = useCallback((issueId: string) => {
    const issueToResolve = dataIssues.find(issue => issue.id === issueId);
    if (!issueToResolve) return;
    
    setDataIssues(prev => prev.map(issue => 
      issue.id === issueId ? { ...issue, isResolving: true } : issue
    ));

    setTimeout(() => {
      setDataIssues(prev => {
        const updatedIssues = prev.filter(issue => issue.id !== issueId);
        const newTotalIssues = updatedIssues.reduce((sum, issue) => sum + issue.count, 0);
        
        setDataHealth(prevHealth => ({
          ...prevHealth,
          resolvedIssues: prevHealth.resolvedIssues + issueToResolve.count,
          issuesFound: newTotalIssues,
          cleanlinessPercentage: Math.min(100, prevHealth.cleanlinessPercentage + HEALTH_IMPROVEMENT.ON_RESOLVE)
        }));
        
        setResolvedIssues(prev => [...prev, { ...issueToResolve, isResolved: true }]);
        
        return updatedIssues;
      });
    }, ANIMATION_DURATION.FADE);
  }, [dataIssues]);

  const handleResolveIssueByRule = useCallback((issueId: string) => {
    const issueToResolve = dataIssues.find(i => i.id === issueId);
    if (!issueToResolve) return;

    setDataIssues(prev => prev.map(issue => 
      issue.id === issueId ? { ...issue, isResolving: true } : issue
    ));

    setTimeout(() => {
      setDataIssues(prev => {
        const updatedIssues = prev.filter(issue => issue.id !== issueId);
        const newTotalIssues = updatedIssues.reduce((sum, issue) => sum + issue.count, 0);
        
        setDataHealth(prevHealth => ({
          ...prevHealth,
          issuesFound: newTotalIssues,
          resolvedIssues: prevHealth.resolvedIssues + issueToResolve.count,
          cleanlinessPercentage: Math.min(100, prevHealth.cleanlinessPercentage + HEALTH_IMPROVEMENT.ON_RULE_RESOLVE)
        }));
        
        return updatedIssues;
      });

      setResolvedIssues(prev => [...prev, { ...issueToResolve, isResolved: true }]);
      setExpandedIssueId(null);
    }, ANIMATION_DURATION.FADE);
  }, [dataIssues]);

  const openRuleCreation = useCallback((issueId: string) => {
    setExpandedIssueId(issueId);
    setIssueCreatingRule(issueId);
    const issue = dataIssues.find(i => i.id === issueId);
    if (issue) {
      const suggestions = getAISuggestions(issue.type);
      setNewRuleText(suggestions[0] || '');
    }
  }, [dataIssues]);

  const createRule = useCallback((issueId: string) => {
    if (!newRuleText.trim()) return;

    const issue = dataIssues.find(i => i.id === issueId);
    if (!issue) return;

    const newRule: ProjectRule = {
      id: `rule-${Date.now()}`,
      createdAt: new Date(),
      naturalLanguage: newRuleText,
      category: RULE_CATEGORIES.DATA_VALIDATION,
      scope: RULE_SCOPES.FUTURE_ONLY,
      isActive: true,
      appliedToRecords: 0,
      relatedIssueType: issue.type
    };

    setProjectRules(prev => [newRule, ...prev]);
    setNewRuleText('');
    setIssueCreatingRule(null);

    showSystemBanner(`✨ Rule created: ${newRuleText}`);

    setPulsedIssueId(issueId);
    setTimeout(() => setPulsedIssueId(null), RULE_CREATION_DELAYS.PULSE_RESET);

    setTimeout(() => {
      handleResolveIssueByRule(issueId);
    }, RULE_CREATION_DELAYS.RESOLVE_ISSUE);
  }, [newRuleText, dataIssues, showSystemBanner, handleResolveIssueByRule]);

  const createStandaloneRule = useCallback(() => {
    if (!newRuleText.trim()) return;

    const newRule: ProjectRule = {
      id: `rule-${Date.now()}`,
      createdAt: new Date(),
      naturalLanguage: newRuleText,
      category: RULE_CATEGORIES.DATA_VALIDATION,
      scope: RULE_SCOPES.FUTURE_ONLY,
      isActive: true,
      appliedToRecords: 0
    };

    setProjectRules(prev => [newRule, ...prev]);
    setNewRuleText('');
    setIsCreatingStandaloneRule(false);

    showSystemBanner(`✨ Rule created: ${newRuleText}`);
  }, [newRuleText, showSystemBanner]);

  const deleteRule = useCallback((ruleId: string) => {
    setProjectRules(prev => prev.filter(rule => rule.id !== ruleId));
  }, []);

  const handleQuickAction = useCallback((actionId: string, issue: DataIssue) => {
    switch (actionId) {
      case 'match-auto':
        showSystemBanner(`✨ Matched ${issue.count} payment${issue.count > 1 ? 's' : ''} automatically`);
        handleResolveIssue(issue.id);
        break;
      case 'merge-auto':
        showSystemBanner(`✨ Merged ${issue.count} duplicate${issue.count > 1 ? 's' : ''} automatically`);
        handleResolveIssue(issue.id);
        break;
      case 'flag-review':
        showSystemBanner(`✨ Flagged ${issue.count} transaction${issue.count > 1 ? 's' : ''} for review`);
        handleResolveIssue(issue.id);
        break;
    }
  }, [showSystemBanner, handleResolveIssue]);

  const handleCloseRulesPanel = useCallback(() => {
    setShowRulesPanel(false);
    setIsCreatingStandaloneRule(false);
    setNewRuleText('');
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="flex-1 overflow-y-auto transition-all duration-200">
        <DashboardHeader
          projectName={project.name}
          onOpenRules={() => setShowRulesPanel(true)}
          onToggleSpreadsheet={() => setShowSpreadsheet(!showSpreadsheet)}
        />

        <SummaryCards cards={summaryCards} />

        {hasData && (
          <IssuesList
            issues={dataIssues}
            expandedIssueId={expandedIssueId}
            issueCreatingRule={issueCreatingRule}
            pulsedIssueId={pulsedIssueId}
            newRuleText={newRuleText}
            onToggleExpand={(issueId) => setExpandedIssueId(expandedIssueId === issueId ? null : issueId)}
            onStartRuleCreation={openRuleCreation}
            onCancelRuleCreation={() => {
              setIssueCreatingRule(null);
              setNewRuleText('');
            }}
            onCreateRule={createRule}
            onQuickAction={handleQuickAction}
            onResolve={handleResolveIssue}
            onRuleTextChange={setNewRuleText}
          />
        )}

        {resolvedIssues.length > 0 && <ResolvedIssues issues={resolvedIssues} />}

        <SystemBanner message={systemBannerMessage} isVisible={systemBannerVisible} />
      </div>

      <RulesPanel
        isOpen={showRulesPanel}
        projectName={project.name}
        rules={projectRules}
        isCreatingRule={isCreatingStandaloneRule}
        newRuleText={newRuleText}
        onClose={handleCloseRulesPanel}
        onStartCreating={() => {
          setIsCreatingStandaloneRule(true);
          setNewRuleText('');
        }}
        onCancelCreating={() => {
          setIsCreatingStandaloneRule(false);
          setNewRuleText('');
        }}
        onCreateRule={createStandaloneRule}
        onDeleteRule={deleteRule}
        onRuleTextChange={setNewRuleText}
      />

      <SpreadsheetSlideOver
        isOpen={showSpreadsheet}
        workbookId={project.workbookId}
        onClose={() => setShowSpreadsheet(false)}
      />
    </div>
  );
}
