import type { LucideIcon } from 'lucide-react';

export type PipelineStepStatus = 'pending' | 'in_progress' | 'complete' | 'error';

export interface PipelineStep {
  id: string;
  title: string;
  description: string;
  status: PipelineStepStatus;
  data?: any;
  details?: string;
  icon?: LucideIcon | string;
}

export interface PipelineConversation {
  id: string;
  message: string;
  choices?: Array<{
    id: string;
    label: string;
    action: string;
  }>;
  timestamp: Date;
}

export interface PipelineWorkflow {
  id: string;
  name: string;
  description: string;
  steps: PipelineStep[];
  createdAt: Date;
  lastUsed?: Date;
  isTemplate: boolean;
}

export interface PipelineState {
  currentStep: number;
  steps: PipelineStep[];
  conversations: PipelineConversation[];
  isComplete: boolean;
  workflowId?: string;
}

