import type React from 'react';

export interface SummaryCard {
  id: string;
  title: string;
  value: string;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
}

export interface InsightCard {
  id: string;
  type: 'growth' | 'warning' | 'success' | 'info';
  title: string;
  description: string;
  value?: string;
  trend?: 'up' | 'down';
}

export interface DataIssue {
  id: string;
  type: 'missing_id' | 'duplicate_receipt' | 'unrecognized_reference' | 'mismatched_name';
  title: string;
  description: string;
  count: number;
  severity: 'high' | 'medium' | 'low';
  suggestedFix?: string;
  affectedRows: number[];
  icon: React.ComponentType<any>;
  isResolved?: boolean;
  isResolving?: boolean;
}

export interface DataHealthMetrics {
  cleanlinessPercentage: number;
  totalRecords: number;
  issuesFound: number;
  resolvedIssues: number;
}

export interface ProjectRule {
  id: string;
  createdAt: Date;
  naturalLanguage: string;
  category: 'data_validation' | 'categorization' | 'filtering';
  scope: 'all_records' | 'future_only' | 'specific_conditions';
  isActive: boolean;
  appliedToRecords: number;
  relatedIssueType?: string;
}

