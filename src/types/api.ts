/**
 * API Request and Response Types
 * Centralized type definitions for all API endpoints
 */

// ============================================================================
// Common Types
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// Rules API Types
// ============================================================================

export interface CreateRuleRequest {
  naturalLanguage: string;
  category: 'data_validation' | 'categorization' | 'filtering';
  scope: 'all_records' | 'future_only' | 'specific_conditions';
  isActive: boolean;
  relatedIssueType?: string;
}

export interface UpdateRuleRequest {
  naturalLanguage?: string;
  category?: 'data_validation' | 'categorization' | 'filtering';
  scope?: 'all_records' | 'future_only' | 'specific_conditions';
  isActive?: boolean;
  relatedIssueType?: string;
}

export interface RuleResponse {
  id: string;
  createdAt: string; // ISO date string
  naturalLanguage: string;
  category: string;
  scope: string;
  isActive: boolean;
  appliedToRecords: number;
  relatedIssueType?: string;
  operations?: Array<{
    type: 'transform' | 'validate' | 'categorize' | 'filter';
    field: string;
    action: string;
    parameters?: Record<string, any>;
  }>;
}

export interface RulesListResponse {
  rules: RuleResponse[];
}

// ============================================================================
// Issues API Types
// ============================================================================

export interface IssueResponse {
  id: string;
  type: 'missing_id' | 'duplicate_receipt' | 'unrecognized_reference' | 'mismatched_name';
  title: string;
  description: string;
  count: number;
  severity: 'high' | 'medium' | 'low';
  suggestedFix?: string;
  affectedRows: number[];
  detectedAt: string; // ISO date string
  isResolved?: boolean;
}

export interface IssuesListResponse {
  issues: IssueResponse[];
}

export interface IssueDetailsResponse extends IssueResponse {
  // Additional details for individual issue view
  relatedRules?: string[];
  resolutionHistory?: Array<{
    resolvedAt: string;
    resolvedBy?: string;
    method: string;
  }>;
}

// ============================================================================
// Health Metrics API Types
// ============================================================================

export interface HealthMetricsResponse {
  cleanlinessPercentage: number;
  totalRecords: number;
  issuesFound: number;
  resolvedIssues: number;
  lastUpdated: string; // ISO date string
}

// ============================================================================
// Transformation Preview API Types
// ============================================================================

export interface PreviewRuleRequest {
  ruleText: string;
  sheetName?: string;
}

export interface CellChangeResponse {
  address: string;
  rowIndex: number;
  colIndex: number;
  before: any;
  after: any;
  columnName: string;
}

export interface TransformationPreviewResponse {
  id: string;
  ruleId: string;
  ruleName: string;
  affectedRows: number;
  affectedCells: CellChangeResponse[];
  sampleChanges: CellChangeResponse[]; // First 10 changes
  timestamp: string; // ISO date string
  status: 'pending' | 'ready' | 'error';
}

// ============================================================================
// Transformation Execution API Types
// ============================================================================

export interface ExecuteRuleRequest {
  previewId?: string; // If preview was approved
  sheetName?: string;
}

export interface TransformationStatusResponse {
  transformationId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  affectedRows: number;
  startedAt: string; // ISO date string
  completedAt?: string; // ISO date string
  error?: string;
}

// ============================================================================
// Transformation History API Types
// ============================================================================

export interface TransformationActionResponse {
  id: string;
  type: 'rule_apply' | 'rule_delete' | 'cell_edit' | 'sheet_operation';
  ruleId?: string;
  ruleName?: string;
  description: string;
  affectedRows: number;
  timestamp: string; // ISO date string
  canUndo: boolean;
}

export interface TransformationHistoryResponse {
  actions: TransformationActionResponse[];
}

// ============================================================================
// Workbook API Types (for reference)
// ============================================================================

export interface WorkbookResponse {
  workbook_id: string;
  sheets: Array<{
    Name: string;
    Cells: Record<string, { Value: any; Formula?: string }>;
  }>;
}

export interface ImportWorkbookResponse {
  workbook_id: string;
  sheets: string[];
  auto_analysis?: {
    issues_found: number;
    issues: Array<{
      type: string;
      severity: string;
      description: string;
      [key: string]: any;
    }>;
    recommended_rules: Array<{
      op: string;
      params: any;
      reason: string;
      priority: number;
    }>;
    rules_applied: number;
    applied_transformations: Array<any>;
  };
}

// ============================================================================
// Sheet API Types (for reference)
// ============================================================================

export interface SheetResponse {
  Name: string;
  Cells: Record<string, { Value: any; Formula?: string }>;
}

export interface SheetsListResponse {
  sheets: string[];
}

// ============================================================================
// Cell API Types (for reference)
// ============================================================================

export interface CellResponse {
  Address: string;
  Value: any;
  Formula?: string;
}

export interface BatchCellEdit {
  address: string;
  value?: any;
  formula?: string;
}

export interface BatchSetCellsRequest {
  sheet: string;
  edits: BatchCellEdit[];
}

export interface BatchSetCellsResponse {
  edits: CellResponse[];
}

