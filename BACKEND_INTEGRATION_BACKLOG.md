# Backend Integration Backlog

This document outlines all tasks needed to prepare the frontend for full backend integration. Items are organized by priority and category.

## ⚡ Quick Fixes (Do First)

### 0. API Base URL Consistency
**Status**: ⚠️ Inconsistent  
**Impact**: Some API files use port 8080, others use 8081

**Tasks**:
- [ ] Standardize all API base URLs to use same port (8081)
- [ ] Update `cells.ts` and `sheets.ts` to use port 8081 (match `workbook.ts` and `langgraph.ts`)
- [ ] Create shared `src/lib/api/config.ts` for API configuration:
  ```typescript
  export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8081/api/v1/langgraph';
  export const API_ROOT = import.meta.env.VITE_API_ROOT || API_BASE.replace(/\/langgraph$/, '');
  ```
- [ ] Update all API files to import from `config.ts` instead of duplicating

---

## 🔴 Critical Priority (Blocking Core Features)

### 1. Rules API Integration
**Status**: ✅ API Module Created (Ready for Integration)  
**Impact**: Rules are currently only stored in local state and lost on refresh

**Tasks**:
- [x] Create `src/lib/api/rules.ts` with CRUD operations:
  - [x] `createRule(workbookId, rule)` - POST `/rules/{workbookId}`
  - [x] `getRules(workbookId)` - GET `/rules/{workbookId}`
  - [x] `updateRule(workbookId, ruleId, updates)` - PUT `/rules/{workbookId}/{ruleId}`
  - [x] `deleteRule(workbookId, ruleId)` - DELETE `/rules/{workbookId}/{ruleId}`
  - [x] `toggleRuleActive(workbookId, ruleId, isActive)` - PATCH `/rules/{workbookId}/{ruleId}/active`
- [ ] Update `Dashboard.tsx` to:
  - [ ] Load rules from backend on mount (`useEffect` with `workbookId`)
  - [ ] Save rules to backend when created/updated/deleted
  - [ ] Handle loading states while fetching rules
  - [ ] Handle error states (network failures, validation errors)
- [ ] Add rule persistence to `useLocalStorage` as fallback/offline support
- [ ] Update `ProjectRule` type to match backend schema (verify date formats, IDs)

**Backend Contract Needed**:
```typescript
// POST /api/v1/rules/{workbookId}
{
  naturalLanguage: string;
  category: 'data_validation' | 'categorization' | 'filtering';
  scope: 'all_records' | 'future_only' | 'specific_conditions';
  isActive: boolean;
  relatedIssueType?: string;
}

// Response
{
  data: {
    id: string;
    createdAt: string; // ISO date
    naturalLanguage: string;
    category: string;
    scope: string;
    isActive: boolean;
    appliedToRecords: number;
    relatedIssueType?: string;
    operations?: Array<{...}>;
  }
}
```

---

### 2. Issues Detection API Integration
**Status**: ✅ API Module Created (Ready for Integration)  
**Impact**: Issues are currently mocked - need real data from backend

**Tasks**:
- [x] Create `src/lib/api/issues.ts`:
  - [x] `getIssues(workbookId)` - GET `/issues/{workbookId}`
  - [x] `resolveIssue(workbookId, issueId)` - POST `/issues/{workbookId}/{issueId}/resolve`
  - [x] `getIssueDetails(workbookId, issueId)` - GET `/issues/{workbookId}/{issueId}`
- [ ] Replace `generateMockIssues()` in `Dashboard.tsx` with API call
- [ ] Update `DataIssue` type to match backend response
- [ ] Add loading skeleton for issues list
- [ ] Handle empty state when no issues found

**Backend Contract Needed**:
```typescript
// GET /api/v1/issues/{workbookId}
// Response
{
  data: {
    issues: Array<{
      id: string;
      type: 'missing_id' | 'duplicate_receipt' | 'unrecognized_reference' | 'mismatched_name';
      title: string;
      description: string;
      count: number;
      severity: 'high' | 'medium' | 'low';
      suggestedFix?: string;
      affectedRows: number[];
      detectedAt: string; // ISO date
    }>
  }
}
```

---

### 3. Data Health Metrics API Integration
**Status**: ✅ API Module Created (Ready for Integration)  
**Impact**: Health metrics are currently calculated from mock data

**Tasks**:
- [x] Create `src/lib/api/health.ts`:
  - [x] `getDataHealth(workbookId)` - GET `/health/{workbookId}`
- [ ] Replace hardcoded `DATA_HEALTH_DEFAULTS` in `Dashboard.tsx`
- [ ] Update `DataHealthMetrics` type to match backend
- [ ] Add real-time updates (polling or WebSocket if available)

**Backend Contract Needed**:
```typescript
// GET /api/v1/health/{workbookId}
// Response
{
  data: {
    cleanlinessPercentage: number;
    totalRecords: number;
    issuesFound: number;
    resolvedIssues: number;
    lastUpdated: string; // ISO date
  }
}
```

---

### 4. Transformation Preview API Integration
**Status**: ✅ API Module Created (Ready for Integration)  
**Impact**: Preview is currently mocked - need real transformation simulation

**Tasks**:
- [x] Create `src/lib/api/transformations.ts` with `previewRule()` function
- [ ] Update `generatePreview()` in `transformationStore.ts`:
  - [ ] Replace mock implementation with API call
  - [ ] POST `/rules/{workbookId}/preview` with rule text
  - [ ] Handle preview generation errors
  - [ ] Add loading state during preview generation
- [ ] Update `TransformationPreview` type to match backend response
- [ ] Add timeout handling for long-running previews

**Backend Contract Needed**:
```typescript
// POST /api/v1/rules/{workbookId}/preview
{
  ruleText: string;
  sheetName?: string;
}

// Response
{
  data: {
    id: string;
    ruleId: string;
    ruleName: string;
    affectedRows: number;
    affectedCells: Array<{
      address: string;
      rowIndex: number;
      colIndex: number;
      before: any;
      after: any;
      columnName: string;
    }>;
    sampleChanges: Array<{...}>; // First 10 changes
    timestamp: string;
    status: 'pending' | 'ready' | 'error';
  }
}
```

---

## 🟡 High Priority (Important Features)

### 5. Rule Execution API Integration
**Status**: ✅ API Module Created (Ready for Integration)  
**Impact**: Rules can't actually be applied to data yet

**Tasks**:
- [x] Create `src/lib/api/transformations.ts`:
  - [x] `executeRule(workbookId, ruleId, previewId?)` - POST `/rules/{workbookId}/{ruleId}/execute`
  - [x] `getTransformationStatus(workbookId, transformationId)` - GET `/transformations/{workbookId}/{transformationId}`
  - [x] `pollTransformationStatus()` - Helper for polling long-running transformations
- [ ] Update `handleRunRule()` in `Dashboard.tsx` to call API
- [ ] Update `handleApprovePreview()` to execute transformation
- [ ] Add progress tracking for long-running transformations
- [ ] Update `appliedToRecords` count after execution

**Backend Contract Needed**:
```typescript
// POST /api/v1/rules/{workbookId}/{ruleId}/execute
{
  previewId?: string; // If preview was approved
  sheetName?: string;
}

// Response (async - may need polling)
{
  data: {
    transformationId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    affectedRows: number;
    startedAt: string;
    completedAt?: string;
  }
}
```

---

### 6. Undo/Redo API Integration
**Status**: ✅ API Module Created (Ready for Integration)  
**Impact**: Undo only works in memory - lost on refresh

**Tasks**:
- [x] Create undo API endpoints:
  - [x] `getTransformationHistory(workbookId)` - GET `/transformations/{workbookId}/history`
  - [x] `undoTransformation(workbookId, transformationId)` - POST `/transformations/{workbookId}/{transformationId}/undo`
- [ ] Update `transformationStore.ts` to:
  - [ ] Load action history from backend on mount
  - [ ] Save actions to backend when created
  - [ ] Call undo API when user clicks undo
- [ ] Handle undo conflicts (if transformation was already undone)
- [ ] Add redo support if backend supports it

**Backend Contract Needed**:
```typescript
// GET /api/v1/transformations/{workbookId}/history
// Response
{
  data: {
    actions: Array<{
      id: string;
      type: 'rule_apply' | 'rule_delete' | 'cell_edit' | 'sheet_operation';
      ruleId?: string;
      ruleName?: string;
      description: string;
      affectedRows: number;
      timestamp: string;
      canUndo: boolean;
    }>
  }
}
```

---

### 7. Chat API Integration
**Status**: ⚠️ Partial (executeAgent exists but may need updates)  
**Impact**: Chat works but may need rule creation integration

**Tasks**:
- [ ] Review `executeAgent()` in `langgraph.ts` - verify it handles rule creation
- [ ] Update `ChatInterface.tsx` to:
  - [ ] Handle rule creation responses from chat
  - [ ] Sync created rules with Dashboard rules list
  - [ ] Show rule creation confirmations
- [ ] Add error handling for chat API failures
- [ ] Add streaming support if backend provides it

**Backend Contract Needed**:
- Verify `/agents/execute/{workbookId}` handles rule creation commands
- Response format for rule creation through chat

---

## 🟢 Medium Priority (Enhancements)

### 8. Error Handling & Retry Logic
**Status**: ✅ Core Infrastructure Created  
**Impact**: Poor UX when network fails

**Tasks**:
- [x] Create `src/lib/api/errorHandler.ts`:
  - [x] Centralized error handling
  - [x] Retry logic for failed requests
  - [x] User-friendly error messages
  - [x] Implement exponential backoff for retries
  - [x] Add offline detection and queuing infrastructure
- [ ] Add error boundaries for API failures
- [ ] Add toast notifications for API errors

---

### 9. Loading States & Optimistic Updates
**Status**: ⚠️ Partial  
**Impact**: Some operations feel slow

**Tasks**:
- [ ] Add loading skeletons for:
  - [ ] Rules list
  - [ ] Issues list
  - [ ] Data health metrics
  - [ ] Transformation previews
- [ ] Implement optimistic updates for:
  - [ ] Rule creation (show immediately, sync in background)
  - [ ] Rule deletion
  - [ ] Issue resolution
- [ ] Add progress indicators for long operations

---

### 10. API Response Caching
**Status**: ❌ Not Started  
**Impact**: Unnecessary API calls, slower UX

**Tasks**:
- [ ] Integrate TanStack Query for:
  - [ ] Rules caching
  - [ ] Issues caching
  - [ ] Health metrics caching
- [ ] Add cache invalidation strategies
- [ ] Add stale-while-revalidate patterns
- [ ] Cache rules locally for offline support

---

### 11. Type Safety Improvements
**Status**: ✅ Core Types Created  
**Impact**: Runtime errors from type mismatches

**Tasks**:
- [x] Create `src/types/api.ts` with:
  - [x] Request/response types for all endpoints
  - [x] Error response types
  - [x] Pagination types (if needed)
- [x] Update all API functions to use strict types
- [ ] Add runtime validation with Zod schemas
- [x] Remove `any` types from API responses (mostly complete)

---

## 🔵 Low Priority (Nice to Have)

### 12. Real-time Updates (WebSocket/SSE)
**Status**: ❌ Not Started  
**Impact**: Data may be stale

**Tasks**:
- [ ] Add WebSocket or SSE connection for:
  - [ ] Real-time issue detection
  - [ ] Transformation progress updates
  - [ ] Rule execution status
- [ ] Handle connection drops and reconnection
- [ ] Add connection status indicator

---

### 13. Batch Operations API
**Status**: ❌ Not Started  
**Impact**: Multiple API calls for bulk operations

**Tasks**:
- [ ] Add batch endpoints:
  - [ ] Batch rule creation
  - [ ] Batch issue resolution
  - [ ] Batch cell updates
- [ ] Update UI to support bulk actions
- [ ] Add progress tracking for batch operations

---

### 14. API Versioning & Compatibility
**Status**: ❌ Not Started  
**Impact**: Breaking changes could break frontend

**Tasks**:
- [ ] Add API version headers
- [ ] Add version compatibility checks
- [ ] Add graceful degradation for missing features
- [ ] Document API version requirements

---

## 📋 API Endpoint Summary

### Required Endpoints

#### Rules
- `GET /api/v1/rules/{workbookId}` - List all rules
- `POST /api/v1/rules/{workbookId}` - Create rule
- `PUT /api/v1/rules/{workbookId}/{ruleId}` - Update rule
- `DELETE /api/v1/rules/{workbookId}/{ruleId}` - Delete rule
- `PATCH /api/v1/rules/{workbookId}/{ruleId}/active` - Toggle active
- `POST /api/v1/rules/{workbookId}/preview` - Preview transformation

#### Issues
- `GET /api/v1/issues/{workbookId}` - List all issues
- `GET /api/v1/issues/{workbookId}/{issueId}` - Get issue details
- `POST /api/v1/issues/{workbookId}/{issueId}/resolve` - Resolve issue

#### Health & Metrics
- `GET /api/v1/health/{workbookId}` - Get data health metrics

#### Transformations
- `POST /api/v1/rules/{workbookId}/{ruleId}/execute` - Execute rule
- `GET /api/v1/transformations/{workbookId}/history` - Get history
- `POST /api/v1/transformations/{workbookId}/{transformationId}/undo` - Undo transformation

#### Existing (Verify)
- `POST /api/v1/workbook/import` - Import workbook ✅
- `GET /api/v1/workbook/{workbookId}` - Get workbook ✅
- `POST /api/v1/workbook/create` - Create workbook ✅
- `GET /api/v1/sheet/list/{workbookId}` - List sheets ✅
- `GET /api/v1/sheet/get/{workbookId}/{sheetName}` - Get sheet ✅
- `POST /api/v1/sheet/{workbookId}` - Add sheet ✅
- `DELETE /api/v1/sheet/{workbookId}/{sheetName}` - Delete sheet ✅
- `GET /api/v1/cell/{workbookId}/{sheetName}/{address}` - Get cell ✅
- `POST /api/v1/cell/{workbookId}` - Set cell ✅
- `POST /api/v1/cell/batch/{workbookId}` - Batch set cells ✅
- `POST /api/v1/agents/execute/{workbookId}` - Execute agent ✅

---

## 🧪 Testing Requirements

### Unit Tests Needed
- [ ] API client functions
- [ ] Error handling
- [ ] Data transformation (frontend types ↔ backend types)
- [ ] Cache invalidation logic

### Integration Tests Needed
- [ ] Rule CRUD operations
- [ ] Issue detection and resolution
- [ ] Transformation preview and execution
- [ ] Undo/redo flow

### E2E Tests Needed
- [ ] Create rule from issue
- [ ] Execute rule and verify changes
- [ ] Undo transformation
- [ ] Chat rule creation

---

## 📝 Implementation Notes

### Data Transformation
- Backend likely uses ISO date strings - frontend uses `Date` objects
- Need conversion utilities: `dateToISO()`, `isoToDate()`
- Backend IDs may be UUIDs vs frontend timestamp-based IDs

### Error Handling Strategy
1. Network errors → Show toast, allow retry
2. Validation errors → Show inline errors, highlight fields
3. Server errors (500) → Show generic error, log details
4. Timeout errors → Show timeout message, allow retry

### State Management
- Keep Zustand stores for UI state
- Use TanStack Query for server state
- Sync Zustand with query cache when needed

### Migration Path
1. Add API calls alongside existing mock data
2. Feature flag to switch between mock/real
3. Gradually migrate features one by one
4. Remove mocks once all features migrated

---

## 🎯 Priority Order

1. **Rules API** (Critical - core feature)
2. **Issues API** (Critical - core feature)
3. **Health Metrics API** (Critical - dashboard data)
4. **Preview API** (Critical - rule workflow)
5. **Rule Execution** (High - actually apply rules)
6. **Undo/Redo API** (High - user expectations)
7. **Error Handling** (High - production readiness)
8. **Loading States** (Medium - UX)
9. **Caching** (Medium - performance)
10. **Type Safety** (Medium - maintainability)

---

## 📚 Related Documentation

- [Rules System Design](./docs/RULES_SYSTEM_DESIGN.md)
- [Frontend Improvements](./FRONTEND_IMPROVEMENTS.md)
- [Deployment Guide](./DEPLOYMENT.md)

---

**Last Updated**: [Current Date]  
**Status**: Planning Phase

