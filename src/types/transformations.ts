export interface CellChange {
  address: string;
  rowIndex: number;
  colIndex: number;
  before: string | number | null;
  after: string | number | null;
  columnName?: string;
}

export interface TransformationPreview {
  id: string;
  ruleId: string;
  ruleName: string;
  affectedRows: number;
  affectedCells: CellChange[];
  sampleChanges: CellChange[]; // First 10 examples
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected' | 'applied';
}

export interface TransformationAction {
  id: string;
  type: 'rule_apply' | 'rule_edit' | 'rule_delete' | 'rule_reorder' | 'manual_fix' | 'bulk_edit';
  ruleId?: string;
  ruleName: string;
  description: string;
  affectedRows: number;
  changes: CellChange[];
  timestamp: Date;
  canUndo: boolean;
  undoAction?: () => Promise<void>;
}

export interface RuleBlock {
  id: string;
  name: string;
  description: string;
  operations: RuleOperation[];
  isActive: boolean;
  appliedToRecords: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RuleOperation {
  type: 'transform' | 'validate' | 'categorize' | 'filter';
  field: string;
  action: string;
  parameters?: Record<string, any>;
}

