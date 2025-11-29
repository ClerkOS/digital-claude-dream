import { create } from 'zustand';
import type { TransformationAction, TransformationPreview, CellChange } from '@/types/transformations';
import type { DataIssue } from '@/types/dashboard';

interface PendingRule {
  issueId: string;
  ruleText: string;
  issue: DataIssue;
}

interface TransformationState {
  // Preview state
  currentPreview: TransformationPreview | null;
  showPreview: (preview: TransformationPreview) => void;
  hidePreview: () => void;

  // Action history (timeline)
  actions: TransformationAction[];
  addAction: (action: TransformationAction) => void;
  undoAction: (actionId: string) => Promise<void>;
  clearHistory: () => void;

  // Undo timeline UI
  timelineOpen: boolean;
  setTimelineOpen: (open: boolean) => void;

  // Pending rule state (replaces window object usage)
  pendingRule: PendingRule | null;
  setPendingRule: (rule: PendingRule | null) => void;
  pendingRuleRun: string | null;
  setPendingRuleRun: (ruleId: string | null) => void;
  clearPendingState: () => void;
}

export const useTransformationStore = create<TransformationState>((set, get) => ({
  // Preview state
  currentPreview: null,
  showPreview: (preview) => set({ currentPreview: preview }),
  hidePreview: () => set({ currentPreview: null }),

  // Action history
  actions: [],
  addAction: (action) => {
    const actions = get().actions;
    set({ actions: [action, ...actions] });
  },
  undoAction: async (actionId) => {
    const actions = get().actions;
    const action = actions.find(a => a.id === actionId);
    
    if (!action || !action.canUndo || !action.undoAction) {
      console.warn('Cannot undo action:', actionId);
      return;
    }

    try {
      // Execute undo
      await action.undoAction();
      
      // Remove from history (or mark as undone)
      const updatedActions = actions.map(a =>
        a.id === actionId ? { ...a, canUndo: false } : a
      );
      set({ actions: updatedActions });
    } catch (error) {
      console.error('Failed to undo action:', error);
    }
  },
  clearHistory: () => set({ actions: [] }),

  // Timeline UI
  timelineOpen: false,
  setTimelineOpen: (open) => set({ timelineOpen: open }),

  // Pending rule state
  pendingRule: null,
  setPendingRule: (rule) => set({ pendingRule: rule }),
  pendingRuleRun: null,
  setPendingRuleRun: (ruleId) => set({ pendingRuleRun: ruleId }),
  clearPendingState: () => set({ pendingRule: null, pendingRuleRun: null }),
}));

// Helper function to generate preview from rule
export async function generatePreview(
  ruleId: string,
  ruleName: string,
  workbookId: string,
  sheetName: string
): Promise<TransformationPreview> {
  // This would call the backend to simulate the transformation
  // For now, we'll create a mock preview
  
  // In a real implementation, this would:
  // 1. Send rule to backend
  // 2. Backend simulates transformation
  // 3. Returns affected cells and changes
  
  // Mock implementation
  const mockChanges: CellChange[] = Array.from({ length: 244 }, (_, i) => ({
    address: `A${i + 2}`,
    rowIndex: i + 1,
    colIndex: 0,
    before: `old-value-${i}`,
    after: `new-value-${i}`,
    columnName: 'PhoneNumber',
  }));

  return {
    id: `preview-${Date.now()}`,
    ruleId,
    ruleName,
    affectedRows: 244,
    affectedCells: mockChanges,
    sampleChanges: mockChanges.slice(0, 10),
    timestamp: new Date(),
    status: 'pending',
  };
}

