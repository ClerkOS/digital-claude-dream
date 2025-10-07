import { useState } from 'react';
import { useSpreadsheetStore } from '@/store/spreadsheetStore';
import { Input } from '@/components/ui/input';

export function FormulaBar() {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  
  const { activeCell, workbook } = useSpreadsheetStore();
  
  const activeSheet = workbook?.sheets.find(s => s.id === workbook.activeSheetId);
  
  // Find the active cell data
  let cellData = null;
  if (activeCell && activeSheet) {
    const [_, rowIndexStr, colIndexStr] = activeCell.split('-');
    const rowIndex = parseInt(rowIndexStr);
    const colIndex = parseInt(colIndexStr);
    cellData = activeSheet.rows[rowIndex]?.cells[colIndex];
  }

  const handleEditStart = () => {
    setIsEditing(true);
    setEditValue(cellData?.value || '');
  };

  const handleEditCommit = () => {
    setIsEditing(false);
    // Here you would update the cell value
    // For now, we'll just exit edit mode
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditCommit();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  return (
    <div className="border-b border-border/50 p-2 bg-muted/30">
      <div className="flex items-center gap-2">
        <div className="text-xs font-mono text-muted-foreground min-w-[60px]">
          {activeCell || 'A1'}
        </div>
        <div className="flex-1">
          {isEditing ? (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleEditCommit}
              className="h-6 text-xs font-mono border-0 bg-background"
              placeholder="Enter value or formula..."
              autoFocus
            />
          ) : (
            <div
              className="h-6 px-2 text-xs font-mono bg-background border border-border/50 rounded flex items-center cursor-text hover:bg-muted/50"
              onClick={handleEditStart}
            >
              {cellData?.value || ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}