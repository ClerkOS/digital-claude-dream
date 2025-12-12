/**
 * API Module Index
 * Central export point for all API functions
 */

// Configuration
export { API_BASE, API_ROOT, getApiUrl, getLangGraphUrl } from './config';

// Error Handling
export {
  ApiErrorException,
  getUserFriendlyErrorMessage,
  handleApiResponse,
  fetchWithRetry,
  isOnline,
  OfflineQueue,
} from './errorHandler';
export type { RetryOptions } from './errorHandler';

// Workbook API
export {
  importWorkbook,
  getWorkbook,
  createWorkbook,
} from './workbook';

// Sheets API
export {
  listSheets,
  getSheet,
  addSheet,
  deleteSheet,
} from './sheets';

// Cells API
export {
  getCell,
  setCell,
  batchSetCells,
} from './cells';

// Sessions API
export {
  createSession,
  getSession,
} from './sessions';
export type {
  SessionResponse,
  GetSessionResponse,
  CreateSessionRequest,
} from './sessions';

// LangGraph API
export {
  executeAgent,
} from './langgraph';
export type {
  AgentExecutionResponse,
} from './langgraph';

// Rules API
export {
  getRules,
  createRule,
  updateRule,
  deleteRule,
  toggleRuleActive,
} from './rules';

// Issues API
export {
  getIssues,
  getIssueDetails,
  resolveIssue,
} from './issues';

// Health API
export {
  getDataHealth,
} from './health';

// Transformations API
export {
  previewRule,
  executeRule,
  getTransformationStatus,
  getTransformationHistory,
  undoTransformation,
  pollTransformationStatus,
} from './transformations';

