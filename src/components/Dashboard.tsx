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
import { TransformationPreview } from './transformations/TransformationPreview';
import { UndoTimeline } from './transformations/UndoTimeline';
import { generateMockIssues } from '@/data/mockIssues';
import { getAISuggestions } from '@/utils/dashboardHelpers';
import { useTransformationStore, generatePreview } from '@/store/transformationStore';
import type { TransformationAction } from '@/types/transformations';

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
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

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

  const { showPreview, hidePreview, currentPreview, addAction, actions, timelineOpen, setTimelineOpen } = useTransformationStore();

  const createRule = useCallback(async (issueId: string) => {
    if (!newRuleText.trim()) return;

    const issue = dataIssues.find(i => i.id === issueId);
    if (!issue) return;

    // Show preview before creating rule
    if (project.workbookId) {
      try {
        const preview = await generatePreview(
          `rule-${Date.now()}`,
          newRuleText,
          project.workbookId,
          'Sheet1'
        );
        showPreview(preview);
        
        // Store the rule data for when preview is approved
        (window as any).pendingRule = {
          issueId,
          ruleText: newRuleText,
          issue,
        };
        return;
      } catch (error) {
        console.error('Failed to generate preview:', error);
        // Continue with rule creation even if preview fails
      }
    }

    // If no preview needed or preview failed, create rule directly
    await applyRuleCreation(issueId, newRuleText, issue);
  }, [newRuleText, dataIssues, project.workbookId, showPreview]);

  const applyRuleCreation = useCallback(async (issueId: string, ruleText: string, issue: DataIssue) => {
    const newRule: ProjectRule = {
      id: `rule-${Date.now()}`,
      createdAt: new Date(),
      naturalLanguage: ruleText,
      category: RULE_CATEGORIES.DATA_VALIDATION,
      scope: RULE_SCOPES.FUTURE_ONLY,
      isActive: true,
      appliedToRecords: 0,
      relatedIssueType: issue.type,
      operations: [
        {
          type: 'transform',
          field: 'PhoneNumber',
          action: 'Trim whitespace, preserve extension codes, format to +233-XXXX-XXXX',
        }
      ]
    };

    setProjectRules(prev => [newRule, ...prev]);
    setNewRuleText('');
    setIssueCreatingRule(null);

    // Add to action history
    const action: TransformationAction = {
      id: `action-${Date.now()}`,
      type: 'rule_apply',
      ruleId: newRule.id,
      ruleName: ruleText,
      description: `Applied rule: ${ruleText}`,
      affectedRows: issue.count,
      changes: [],
      timestamp: new Date(),
      canUndo: true,
      undoAction: async () => {
        setProjectRules(prev => prev.filter(r => r.id !== newRule.id));
        setDataIssues(prev => [...prev, issue]);
      },
    };
    addAction(action);

    showSystemBanner(`✨ Rule created: ${ruleText}`);

    setPulsedIssueId(issueId);
    setTimeout(() => setPulsedIssueId(null), RULE_CREATION_DELAYS.PULSE_RESET);

    setTimeout(() => {
      handleResolveIssueByRule(issueId);
    }, RULE_CREATION_DELAYS.RESOLVE_ISSUE);
  }, [showSystemBanner, handleResolveIssueByRule, addAction, setProjectRules, setDataIssues]);

  const createStandaloneRule = useCallback(() => {
    if (!newRuleText.trim()) return;

    if (editingRuleId) {
      // Update existing rule
      setProjectRules(prev => prev.map(rule =>
        rule.id === editingRuleId
          ? { ...rule, naturalLanguage: newRuleText }
          : rule
      ));
      showSystemBanner(`✨ Rule updated: ${newRuleText}`);
      setEditingRuleId(null);
    } else {
      // Create new rule
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
      showSystemBanner(`✨ Rule created: ${newRuleText}`);
    }

    setNewRuleText('');
    setIsCreatingStandaloneRule(false);
  }, [newRuleText, showSystemBanner, editingRuleId]);

  const deleteRule = useCallback((ruleId: string) => {
    const rule = projectRules.find(r => r.id === ruleId);
    if (rule) {
      const action: TransformationAction = {
        id: `action-${Date.now()}`,
        type: 'rule_delete',
        ruleId: ruleId,
        ruleName: rule.naturalLanguage,
        description: `Deleted rule: ${rule.naturalLanguage}`,
        affectedRows: 0,
        changes: [],
        timestamp: new Date(),
        canUndo: true,
        undoAction: async () => {
          setProjectRules(prev => [...prev, rule]);
        },
      };
      addAction(action);
    }
    setProjectRules(prev => prev.filter(rule => rule.id !== ruleId));
  }, [projectRules, addAction]);

  const handleRunRule = useCallback(async (ruleId: string) => {
    const rule = projectRules.find(r => r.id === ruleId);
    if (!rule || !project.workbookId) return;

    // Show preview before running
    try {
      const preview = await generatePreview(
        ruleId,
        rule.naturalLanguage,
        project.workbookId,
        'Sheet1'
      );
      showPreview(preview);
      (window as any).pendingRuleRun = ruleId;
    } catch (error) {
      console.error('Failed to generate preview:', error);
    }
  }, [projectRules, project.workbookId, showPreview]);

  const handleEditRule = useCallback((ruleId: string) => {
    const rule = projectRules.find(r => r.id === ruleId);
    if (rule) {
      setNewRuleText(rule.naturalLanguage);
      setEditingRuleId(ruleId);
      setIsCreatingStandaloneRule(true);
    }
  }, [projectRules]);

  const handleToggleActive = useCallback((ruleId: string) => {
    setProjectRules(prev => prev.map(rule =>
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    ));
  }, []);

  const handleApprovePreview = useCallback(async () => {
    if (!currentPreview) return;

    const pendingRule = (window as any).pendingRule;
    const pendingRuleRun = (window as any).pendingRuleRun;

    if (pendingRule) {
      await applyRuleCreation(pendingRule.issueId, pendingRule.ruleText, pendingRule.issue);
      delete (window as any).pendingRule;
    } else if (pendingRuleRun) {
      // Apply the rule run
      const rule = projectRules.find(r => r.id === pendingRuleRun);
      if (rule) {
        const action: TransformationAction = {
          id: `action-${Date.now()}`,
          type: 'rule_apply',
          ruleId: rule.id,
          ruleName: rule.naturalLanguage,
          description: `Ran rule: ${rule.naturalLanguage}`,
          affectedRows: currentPreview.affectedRows,
          changes: currentPreview.affectedCells,
          timestamp: new Date(),
          canUndo: true,
          undoAction: async () => {
            // Revert changes - would need to store original values
            console.log('Undoing rule application');
          },
        };
        addAction(action);
        setProjectRules(prev => prev.map(r =>
          r.id === rule.id ? { ...r, appliedToRecords: r.appliedToRecords + currentPreview.affectedRows } : r
        ));
      }
      delete (window as any).pendingRuleRun;
    }

    hidePreview();
  }, [currentPreview, projectRules, applyRuleCreation, addAction, hidePreview]);

  const handleRejectPreview = useCallback(() => {
    delete (window as any).pendingRule;
    delete (window as any).pendingRuleRun;
    hidePreview();
  }, [hidePreview]);

  const handleEditPreview = useCallback(() => {
    // TODO: Open rule editor
    hidePreview();
  }, [hidePreview]);

  const handleUndoAction = useCallback(async (actionId: string) => {
    const { undoAction } = useTransformationStore.getState();
    await undoAction(actionId);
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
    setEditingRuleId(null);
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

      {/* Preview Modal */}
      {currentPreview && (
        <TransformationPreview
          preview={currentPreview}
          onApprove={handleApprovePreview}
          onReject={handleRejectPreview}
          onEdit={handleEditPreview}
        />
      )}

      {/* Undo Timeline */}
      <UndoTimeline
        actions={actions}
        onUndo={handleUndoAction}
        isOpen={timelineOpen}
        onClose={() => setTimelineOpen(false)}
      />

      <RulesPanel
        isOpen={showRulesPanel}
        projectName={project.name}
        rules={projectRules}
        isCreatingRule={isCreatingStandaloneRule}
        isEditingRule={!!editingRuleId}
        newRuleText={newRuleText}
        onClose={handleCloseRulesPanel}
        onStartCreating={() => {
          setIsCreatingStandaloneRule(true);
          setNewRuleText('');
        }}
        onCancelCreating={() => {
          setIsCreatingStandaloneRule(false);
          setNewRuleText('');
          setEditingRuleId(null);
        }}
        onCreateRule={createStandaloneRule}
        onDeleteRule={deleteRule}
        onRuleTextChange={setNewRuleText}
        onEditRule={handleEditRule}
        onRunRule={handleRunRule}
        onToggleActive={handleToggleActive}
        workbookId={project.workbookId}
      />

      <SpreadsheetSlideOver
        isOpen={showSpreadsheet}
        workbookId={project.workbookId}
        onClose={() => setShowSpreadsheet(false)}
      />
    </div>
  );
}
