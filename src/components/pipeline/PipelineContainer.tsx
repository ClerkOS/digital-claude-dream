import { useState, useEffect, useCallback, useRef } from 'react';
import { PipelineView } from './PipelineView';
import { DataPreviewGrid } from './DataPreviewGrid';
import { PipelineSavePanel } from './PipelineSavePanel';
import { PipelineNav } from './PipelineNav';
import { PipelineRulesStage, PipelineRule } from './PipelineRulesStage';
import type { PipelineState, PipelineStep, PipelineWorkflow } from '@/types/pipeline';
import { PIPELINE_STEPS, PIPELINE_STEP_CONFIG } from '@/constants/pipeline';
import { STORAGE_KEYS } from '@/constants';

const RULE_SUGGESTIONS: PipelineRule[] = [
  {
    id: 'rule-merge-duplicates',
    title: 'Merge duplicate student records',
    description: 'Combine rows that share the same email address or student ID across sheets.',
    hint: 'Keeps student contact information consistent.',
  },
  {
    id: 'rule-standardize-names',
    title: 'Normalize student names',
    description: 'Apply sentence case and remove trailing spaces to keep student names consistent.',
    hint: 'Prevents duplicate dashboards for the same student.',
  },
  {
    id: 'rule-align-payments',
    title: 'Align unmatched payments',
    description: 'Auto-match pending payments in the ledger with uploaded transactions when the amounts differ by < ₵10.',
  },
  {
    id: 'rule-flag-anomalies',
    title: 'Flag anomalies for review',
    description: 'Surface any transactions that fall outside the expected range for manual review.',
  },
];

const PREVIEW_COLUMNS = ['Record', 'Detected Issue', 'Status'];

const BASE_PREVIEW_DATA = [
  {
    Record: 'Student · Ama Owusu',
    'Detected Issue': 'Duplicate entry found in Students and Student_Info sheets',
    Status: 'Waiting for cleanup rule',
  },
  {
    Record: 'Student · Kojo Mensah',
    'Detected Issue': 'Name format mismatch between sheets (KOJO MENSAH vs Kojo Mensah)',
    Status: 'Waiting for cleanup rule',
  },
  {
    Record: 'Payment · Invoice #281',
    'Detected Issue': 'Payment amount differs by ₵5.00 between ledger and upload',
    Status: 'Waiting for cleanup rule',
  },
];

const buildPreviewData = (appliedRules: string[]) => {
  if (appliedRules.length === 0) {
    return BASE_PREVIEW_DATA;
  }

  return [
    {
      Record: 'Student · Ama Owusu',
      'Detected Issue': 'Duplicate entry found in Students and Student_Info sheets',
      Status: `Resolved • ${appliedRules[0]}`,
    },
    {
      Record: 'Student · Kojo Mensah',
      'Detected Issue': 'Name format mismatch between sheets (KOJO MENSAH vs Kojo Mensah)',
      Status: appliedRules[1]
        ? `Resolved • ${appliedRules[1]}`
        : `Resolved • ${appliedRules[0]}`,
    },
    {
      Record: 'Payment · Invoice #281',
      'Detected Issue': 'Payment amount differs by ₵5.00 between ledger and upload',
      Status:
        appliedRules.length > 1
          ? `Reconciled • ${appliedRules[appliedRules.length - 1]}`
          : `Reconciled • ${appliedRules[0]}`,
    },
  ];
};

interface PipelineContainerProps {
  onComplete: (workbookId?: string) => void;
  onNavigateToDashboard: () => void;
  onNavigateToRules: () => void;
}

export function PipelineContainer({
  onComplete,
  onNavigateToDashboard,
  onNavigateToRules,
}: PipelineContainerProps) {
  const [pipelineState, setPipelineState] = useState<PipelineState>({
    currentStep: 0,
    steps: [],
    conversations: [],
    isComplete: false,
  });
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewColumns, setPreviewColumns] = useState<string[]>([]);
  const [showSavePanel, setShowSavePanel] = useState(false);
  const [workflows, setWorkflows] = useState<PipelineWorkflow[]>([]);
  const [availableRules, setAvailableRules] = useState<PipelineRule[]>([]);
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);
  const [customRuleText, setCustomRuleText] = useState('');
  const [appliedRules, setAppliedRules] = useState<string[]>([]);
  const rulesSectionRef = useRef<HTMLDivElement | null>(null);

  // Load saved workflows
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS + '-workflows');
    if (saved) {
      try {
        setWorkflows(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load workflows:', e);
      }
    }
  }, []);

  // Initialize pipeline steps when component mounts (files already uploaded via old upload center)
  useEffect(() => {
    const steps: PipelineStep[] = [
      {
        id: PIPELINE_STEPS.UPLOAD,
        title: PIPELINE_STEP_CONFIG[PIPELINE_STEPS.UPLOAD].title,
        description: PIPELINE_STEP_CONFIG[PIPELINE_STEPS.UPLOAD].description,
        status: 'complete',
        icon: PIPELINE_STEP_CONFIG[PIPELINE_STEPS.UPLOAD].icon,
        details: 'Files uploaded successfully',
      },
      {
        id: PIPELINE_STEPS.DETECT_SHEETS,
        title: PIPELINE_STEP_CONFIG[PIPELINE_STEPS.DETECT_SHEETS].title,
        description: PIPELINE_STEP_CONFIG[PIPELINE_STEPS.DETECT_SHEETS].description,
        status: 'in_progress',
        icon: PIPELINE_STEP_CONFIG[PIPELINE_STEPS.DETECT_SHEETS].icon,
      },
      {
        id: PIPELINE_STEPS.DETECT_PATTERNS,
        title: PIPELINE_STEP_CONFIG[PIPELINE_STEPS.DETECT_PATTERNS].title,
        description: PIPELINE_STEP_CONFIG[PIPELINE_STEPS.DETECT_PATTERNS].description,
        status: 'pending',
        icon: PIPELINE_STEP_CONFIG[PIPELINE_STEPS.DETECT_PATTERNS].icon,
      },
      {
        id: PIPELINE_STEPS.APPLY_RULES,
        title: PIPELINE_STEP_CONFIG[PIPELINE_STEPS.APPLY_RULES].title,
        description: PIPELINE_STEP_CONFIG[PIPELINE_STEPS.APPLY_RULES].description,
        status: 'pending',
        icon: PIPELINE_STEP_CONFIG[PIPELINE_STEPS.APPLY_RULES].icon,
      },
      {
        id: PIPELINE_STEPS.GENERATE_DASHBOARD,
        title: PIPELINE_STEP_CONFIG[PIPELINE_STEPS.GENERATE_DASHBOARD].title,
        description: PIPELINE_STEP_CONFIG[PIPELINE_STEPS.GENERATE_DASHBOARD].description,
        status: 'pending',
        icon: PIPELINE_STEP_CONFIG[PIPELINE_STEPS.GENERATE_DASHBOARD].icon,
      },
    ];

    // Set initial state
    setPipelineState({
      currentStep: 1,
      steps,
      conversations: [],
      isComplete: false,
    });
    setPreviewColumns(PREVIEW_COLUMNS);
    setPreviewData(BASE_PREVIEW_DATA);
    setAvailableRules([]);
    setSelectedRuleIds([]);
    setCustomRuleText('');
    setAppliedRules([]);

    // Auto-progress through all steps for demo - start timers immediately
    const sheetsDelay = 10000; // 10 seconds for understanding sheets
    const patternsDelay = 10000; // 10 seconds for detecting patterns
    const timers: number[] = [];
    
    // Step 1: Complete Detect Sheets after ~10s
    timers.push(
      window.setTimeout(() => {
      setPipelineState(prev => {
        const newSteps = [...prev.steps];
        if (newSteps[1]) {
          newSteps[1] = {
            ...newSteps[1],
            status: 'complete',
            details: '3 sheets detected: Payments, Students, References',
          };
        }
        if (newSteps[2]) {
          newSteps[2].status = 'in_progress';
        }
        return {
          ...prev,
          steps: newSteps,
          currentStep: 2,
        };
      });
    }, sheetsDelay)
    );

    // Step 2: Complete Detect Patterns after another ~10s
    timers.push(
      window.setTimeout(() => {
        setPipelineState(prev => {
          const newSteps = [...prev.steps];
          if (newSteps[2]) {
            newSteps[2] = {
              ...newSteps[2],
              status: 'complete',
              details: '5 patterns detected',
            };
          }
          if (newSteps[3]) {
            newSteps[3].status = 'in_progress';
          }
          return {
            ...prev,
            steps: newSteps,
            currentStep: 3,
          };
        });
        setAvailableRules(RULE_SUGGESTIONS);
      }, sheetsDelay + patternsDelay)
    );

    // Cleanup all timers on unmount
    return () => {
      timers.forEach(timer => window.clearTimeout(timer));
    };
  }, []);

  const handleToggleRule = useCallback((ruleId: string) => {
    setSelectedRuleIds(prev =>
      prev.includes(ruleId)
        ? prev.filter(id => id !== ruleId)
        : [...prev, ruleId]
    );
  }, []);

  const handleCustomRuleChange = useCallback((value: string) => {
    setCustomRuleText(value);
  }, []);

  const handleApplyRules = useCallback(() => {
    const selectedRules = availableRules.filter(rule => selectedRuleIds.includes(rule.id));
    const applied = [
      ...selectedRules.map(rule => rule.title),
      ...(customRuleText.trim() ? [customRuleText.trim()] : []),
    ];

    if (applied.length === 0) {
      return;
    }

    setAppliedRules(applied);
    setPreviewData(buildPreviewData(applied));
    setSelectedRuleIds([]);
    setCustomRuleText('');

    setPipelineState(prev => {
      const newSteps = [...prev.steps];
      if (newSteps[3]) {
        newSteps[3] = {
          ...newSteps[3],
          status: 'complete',
          details: `Applied ${applied.length} rule${applied.length === 1 ? '' : 's'}`,
        };
      }
      if (newSteps[4]) {
        newSteps[4].status = 'in_progress';
      }
      return {
        ...prev,
        steps: newSteps,
        currentStep: 4,
      };
    });

    // Finalize dashboard generation after applying rules
    window.setTimeout(() => {
      setPipelineState(prev => {
        const newSteps = [...prev.steps];
        if (newSteps[4]) {
          newSteps[4] = {
            ...newSteps[4],
            status: 'complete',
            details: 'Dashboard ready',
          };
        }
        return {
          ...prev,
          steps: newSteps,
          currentStep: 4,
          isComplete: true,
        };
      });
      setShowSavePanel(true);
    }, 1000);
  }, [availableRules, customRuleText, selectedRuleIds]);

  const handleRulesButtonClick = useCallback(() => {
    const applyRulesStep = pipelineState.steps[3];
    if (applyRulesStep && applyRulesStep.status !== 'complete') {
      rulesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      onNavigateToRules();
    }
  }, [pipelineState.steps, onNavigateToRules]);

  const handleSaveWorkflow = useCallback((name: string, description: string) => {
    const workflow: PipelineWorkflow = {
      id: `workflow-${Date.now()}`,
      name,
      description,
      steps: pipelineState.steps,
      createdAt: new Date(),
      isTemplate: true,
    };

    const newWorkflows = [...workflows, workflow];
    setWorkflows(newWorkflows);
    localStorage.setItem(STORAGE_KEYS.PROJECTS + '-workflows', JSON.stringify(newWorkflows));

    setShowSavePanel(false);
    onComplete();
  }, [pipelineState.steps, workflows, onComplete]);

  const handleSkipSave = useCallback(() => {
    setShowSavePanel(false);
    onComplete();
  }, [onComplete]);

  const applyRulesStep = pipelineState.steps[3];
  const shouldRenderRulesStage = Boolean(applyRulesStep && applyRulesStep.status !== 'pending');
  const rulesStageStatus = shouldRenderRulesStage ? applyRulesStep?.status : undefined;
  const isApplyRulesDisabled =
    !shouldRenderRulesStage ||
    rulesStageStatus !== 'in_progress' ||
    (selectedRuleIds.length === 0 && !customRuleText.trim());

  // Files are already uploaded when we reach pipeline (from EmptyState upload)
  // Auto-progresses through all steps for demo

  // If pipeline hasn't started yet, show loading state briefly
  if (pipelineState.steps.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-muted/30 rounded-lg flex items-center justify-center mx-auto mb-3">
            <div className="w-6 h-6 border-2 border-primary/60 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Preparing your data pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PipelineNav
        workflows={workflows}
        onSelectWorkflow={(id) => {
          const workflow = workflows.find(w => w.id === id);
          if (workflow) {
            setPipelineState(prev => ({
              ...prev,
              steps: workflow.steps,
            }));
          }
        }}
        onNavigateToDashboard={onNavigateToDashboard}
        onNavigateToRules={handleRulesButtonClick}
      />

      <PipelineView
        steps={pipelineState.steps}
        currentStepIndex={pipelineState.currentStep}
      />

      {shouldRenderRulesStage && (
        <div ref={rulesSectionRef} className="w-full py-6">
          <PipelineRulesStage
            rules={availableRules}
            selectedRuleIds={selectedRuleIds}
            customRuleText={customRuleText}
            onToggleRule={handleToggleRule}
            onCustomRuleChange={handleCustomRuleChange}
            onApplyRules={handleApplyRules}
            isApplyDisabled={isApplyRulesDisabled}
            appliedRules={appliedRules}
            status={rulesStageStatus}
          />
        </div>
      )}


      <div className="flex-1">
        <DataPreviewGrid
          data={previewData}
          columns={previewColumns}
        />
      </div>

      <PipelineSavePanel
        isOpen={showSavePanel}
        onSave={handleSaveWorkflow}
        onSkip={handleSkipSave}
        onClose={() => setShowSavePanel(false)}
      />
    </div>
  );
}

