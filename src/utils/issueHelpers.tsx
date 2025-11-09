import type React from 'react';
import type { DataIssue } from '@/types/dashboard';

export const getDetailedSuggestion = (issue: DataIssue): React.ReactNode | null => {
  switch (issue.type) {
    case 'duplicate_receipt':
      const exampleReceipts = issue.affectedRows.slice(0, 3).map(row => 
        `Receipt #${row}`
      ).join(', ');
      const moreCount = issue.affectedRows.length - 3;
      return (
        <div className="text-xs text-blue-700">
          <p className="font-medium mb-1">Examples:</p>
          <p>{exampleReceipts}{moreCount > 0 ? `, and ${moreCount} more...` : ''}</p>
        </div>
      );
    case 'missing_id':
      const examplePayments = issue.affectedRows.slice(0, 3).map(row => 
        `Payment #${row}`
      ).join(', ');
      const morePayments = issue.affectedRows.length - 3;
      return (
        <div className="text-xs text-blue-700">
          <p className="font-medium mb-1">Affected payments:</p>
          <p>{examplePayments}{morePayments > 0 ? `, and ${morePayments} more...` : ''}</p>
        </div>
      );
    case 'unrecognized_reference':
      return (
        <div className="text-xs text-blue-700">
          <p className="font-medium mb-1">Unrecognized references:</p>
          <p>REF-{issue.affectedRows[0]}, REF-{issue.affectedRows[1]}{issue.affectedRows.length > 2 ? `, and ${issue.affectedRows.length - 2} more...` : ''}</p>
        </div>
      );
    default:
      return null;
  }
};

