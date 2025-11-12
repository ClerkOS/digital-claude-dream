import { Upload, Search, Brain, Settings, LayoutDashboard } from 'lucide-react';

export const PIPELINE_STEPS = {
  UPLOAD: 'upload_files',
  DETECT_SHEETS: 'detect_sheets',
  DETECT_PATTERNS: 'detect_patterns',
  APPLY_RULES: 'apply_rules',
  GENERATE_DASHBOARD: 'generate_dashboard',
} as const;

export const PIPELINE_STEP_CONFIG = {
  [PIPELINE_STEPS.UPLOAD]: {
    title: 'Upload Files',
    description: 'Bringing your data into Zigma',
    icon: Upload,
  },
  [PIPELINE_STEPS.DETECT_SHEETS]: {
    title: 'Understand Sheets',
    description: 'Identifying individual data tables',
    icon: Search,
  },
  [PIPELINE_STEPS.DETECT_PATTERNS]: {
    title: 'Detect Patterns',
    description: 'Finding structure and relationships',
    icon: Brain,
  },
  [PIPELINE_STEPS.APPLY_RULES]: {
    title: 'Apply Rules',
    description: 'Cleaning and transforming your data',
    icon: Settings,
  },
  [PIPELINE_STEPS.GENERATE_DASHBOARD]: {
    title: 'Generate Dashboard',
    description: 'Creating your financial overview',
    icon: LayoutDashboard,
  },
} as const;

export const PIPELINE_ANIMATIONS = {
  STEP_COMPLETE_DELAY: 1500, // 1.5 seconds between steps for demo
} as const;

export const CONVERSATIONAL_PROMPTS = {
  SHEETS_DETECTED: (count: number) => 
    `Alright, I've found ${count} sheet${count > 1 ? 's' : ''}.`,
  SHEETS_MERGE_QUESTION: (sheet1: string, sheet2: string) =>
    `Would you like me to merge '${sheet1}' and '${sheet2}' since they look identical?`,
  PATTERNS_DETECTED: (count: number) =>
    `I've detected ${count} pattern${count > 1 ? 's' : ''} in your data.`,
  RULES_APPLIED: (count: number) =>
    `Applied ${count} rule${count > 1 ? 's' : ''} to organize your data.`,
} as const;

