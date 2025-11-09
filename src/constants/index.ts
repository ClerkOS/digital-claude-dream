// Storage keys
export const STORAGE_KEYS = {
  PROJECTS: 'zigma-projects',
} as const;

// Animation durations
export const ANIMATION_DURATION = {
  FADE: 600,
  PULSE: 600,
  BANNER_HIDE: 3000,
} as const;

// Upload simulation
export const UPLOAD_CONFIG = {
  DURATION: 2000,
  PROGRESS_INTERVAL: 50,
  PROCESSING_MESSAGES: [
    'Analyzing structure…',
    'Matching references…',
    'Balancing books…',
  ],
  SUCCESS_DELAY: 800,
  PROCESSING_DELAY: 2500,
} as const;

// Issue types
export const ISSUE_TYPES = {
  MISSING_ID: 'missing_id',
  DUPLICATE_RECEIPT: 'duplicate_receipt',
  UNRECOGNIZED_REFERENCE: 'unrecognized_reference',
  MISMATCHED_NAME: 'mismatched_name',
} as const;

// Severity levels
export const SEVERITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

// Rule categories
export const RULE_CATEGORIES = {
  DATA_VALIDATION: 'data_validation',
  CATEGORIZATION: 'categorization',
  FILTERING: 'filtering',
} as const;

// Rule scopes
export const RULE_SCOPES = {
  ALL_RECORDS: 'all_records',
  FUTURE_ONLY: 'future_only',
  SPECIFIC_CONDITIONS: 'specific_conditions',
} as const;

// Data health defaults
export const DATA_HEALTH_DEFAULTS = {
  CLEANLINESS_PERCENTAGE: 85,
  TOTAL_RECORDS: 1250,
  ISSUES_FOUND: 0,
  RESOLVED_ISSUES: 0,
} as const;

// Health improvement on resolve
export const HEALTH_IMPROVEMENT = {
  ON_RESOLVE: 2,
  ON_RULE_RESOLVE: 3,
} as const;

// Rule creation delays
export const RULE_CREATION_DELAYS = {
  PULSE_RESET: 600,
  RESOLVE_ISSUE: 500,
} as const;

// System banner timeout
export const SYSTEM_BANNER_TIMEOUT = 3000;

