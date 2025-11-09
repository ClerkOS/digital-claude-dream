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
    <div className="border-b border-border/50 px-6 py-2.5 bg-muted/20">
      <div className="flex items-center gap-3">
        <div className="text-xs font-mono text-muted-foreground min-w-[60px] font-medium">
          {activeCell || 'A1'}
        </div>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs text-muted-foreground">=</span>
          {isEditing ? (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleEditCommit}
              className="h-8 text-xs font-mono border border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 bg-background"
              placeholder="Enter value or formula..."
              autoFocus
            />
          ) : (
            <div
              className="h-8 px-3 text-xs font-mono bg-background border border-border/50 rounded-md flex items-center cursor-text hover:bg-muted/30 hover:border-border transition-colors flex-1"
              onClick={handleEditStart}
            >
              <span className="text-foreground">{cellData?.value || ''}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}