import { UserX, FileX, AlertCircle } from 'lucide-react';
import type { DataIssue } from '@/types/dashboard';
import { ISSUE_TYPES, SEVERITY } from '@/constants';

export const generateMockIssues = (): DataIssue[] => {
  return [
    {
      id: 'missing-student-ids',
      type: ISSUE_TYPES.MISSING_ID,
      title: 'Missing Student IDs',
      description: 'Payment records without student identification',
      count: 7,
      severity: SEVERITY.HIGH,
      suggestedFix: 'Match payments to student records by name and amount',
      affectedRows: [45, 67, 123, 234, 345, 456, 567],
      icon: UserX
    },
    {
      id: 'duplicate-receipts',
      type: ISSUE_TYPES.DUPLICATE_RECEIPT,
      title: 'Duplicate Receipts',
      description: 'Multiple entries for the same payment transaction',
      count: 3,
      severity: SEVERITY.MEDIUM,
      suggestedFix: 'Merge duplicate entries and keep the most complete record',
      affectedRows: [12, 89, 156],
      icon: FileX
    },
    {
      id: 'unrecognized-references',
      type: ISSUE_TYPES.UNRECOGNIZED_REFERENCE,
      title: 'Unrecognized References',
      description: 'Bank references that don\'t match known payment patterns',
      count: 5,
      severity: SEVERITY.LOW,
      suggestedFix: 'Review and manually categorize these transactions',
      affectedRows: [78, 134, 201, 289, 378],
      icon: AlertCircle
    }
  ];
};

