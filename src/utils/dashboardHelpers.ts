import { AlertCircle, CheckCircle2, TriangleAlert, TrendingUp, Sparkles } from 'lucide-react';
import type { DataIssue, InsightCard } from '@/types/dashboard';

export const getInsightIcon = (type: InsightCard['type']) => {
  switch (type) {
    case 'success': return CheckCircle2;
    case 'warning': return AlertCircle;
    case 'growth': return TrendingUp;
    default: return Sparkles;
  }
};

export const getInsightColor = (type: InsightCard['type']) => {
  switch (type) {
    case 'success': return 'text-green-600 bg-green-50 border-green-200';
    case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'growth': return 'text-blue-600 bg-blue-50 border-blue-200';
    default: return 'text-slate-600 bg-slate-50 border-slate-200';
  }
};

export const getSeverityColor = (severity: DataIssue['severity']) => {
  switch (severity) {
    case 'high': return 'text-red-600 bg-red-50 border-red-200';
    case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
    default: return 'text-slate-600 bg-slate-50 border-slate-200';
  }
};

export const getSeverityIcon = (severity: DataIssue['severity']) => {
  switch (severity) {
    case 'high': return TriangleAlert;
    case 'medium': return AlertCircle;
    case 'low': return CheckCircle2;
    default: return AlertCircle;
  }
};

export const getQuickActions = (issueType: string): Array<{ id: string; label: string; primary: boolean }> => {
  switch (issueType) {
    case 'missing_id':
      return [
        { id: 'match-auto', label: 'Match automatically', primary: true },
        { id: 'create-rule', label: 'Create rule', primary: false }
      ];
    case 'duplicate_receipt':
      return [
        { id: 'merge-auto', label: 'Merge automatically', primary: true },
        { id: 'create-rule', label: 'Create rule', primary: false }
      ];
    case 'unrecognized_reference':
      return [
        { id: 'flag-review', label: 'Flag for review', primary: true },
        { id: 'create-rule', label: 'Create rule', primary: false }
      ];
    default:
      return [
        { id: 'create-rule', label: 'Create rule', primary: true }
      ];
  }
};

export const getAISuggestions = (issueType: string): string[] => {
  switch (issueType) {
    case 'missing_id':
      return [
        'Always require student ID for payment entries',
        'Match payments to student records by name and amount',
        'Ensure all payment records have a unique identifier'
      ];
    case 'duplicate_receipt':
      return [
        'Flag duplicate receipts for manual review',
        'Merge duplicate entries and keep the most complete record',
        'Ensure all payment transactions are unique'
      ];
    case 'unrecognized_reference':
      return [
        'Categorize unrecognized references as manual review',
        'Review and manually categorize these transactions',
        'Ensure all bank references are recognized'
      ];
    default:
      return [];
  }
};

export const getSuggestedRule = (issueType: string): string => {
  switch (issueType) {
    case 'missing_id':
      return 'Always require student ID for payment entries';
    case 'duplicate_receipt':
      return 'Flag duplicate receipts for manual review';
    case 'unrecognized_reference':
      return 'Categorize unrecognized references as manual review';
    default:
      return 'Create custom rule for this issue type';
  }
};

