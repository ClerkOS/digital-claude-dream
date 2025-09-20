import { useState, useEffect } from 'react';
import { Calculator, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSpreadsheetStore } from '@/store/spreadsheetStore';

export function FormulaBar() {
  const [formula, setFormula] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const { 
    workbook, 
    activeCell, 
    updateCell 
  } = useSpreadsheetStore();

  // Get the active cell value
  const activeCellValue = (() => {
    if (!workbook || !activeCell) return '';
    
    const activeSheet = workbook.sheets.find(sheet => sheet.id === workbook.activeSheetId);
    if (!activeSheet) return '';
    
    for (const row of activeSheet.rows) {
      const cell = row.cells.find(cell => cell.id === activeCell);
      if (cell) return cell.value || '';
    }
    
    return '';
  })();

  // Update formula when active cell changes
  useEffect(() => {
    if (!isEditing) {
      setFormula(String(activeCellValue));
    }
  }, [activeCell, activeCellValue, isEditing]);

  // Get cell reference (e.g., "A1", "B5")
  const getCellReference = (cellId: string): string => {
    if (!cellId) return 'A1';
    
    const parts = cellId.split('-');
    if (parts.length !== 3) return 'A1';
    
    const row = parseInt(parts[1]);
    const col = parseInt(parts[2]);
    
    const colLetter = String.fromCharCode(65 + col);
    return `${colLetter}${row + 1}`;
  };

  const handleSubmit = () => {
    if (activeCell) {
      updateCell(activeCell, formula);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormula(String(activeCellValue));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else {
      setIsEditing(true);
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 border-b border-border bg-muted/20">
      {/* Cell Reference */}
      <div className="flex items-center gap-2 min-w-0">
        <Calculator className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm font-mono text-muted-foreground min-w-0 bg-muted px-2 py-1 rounded">
          {getCellReference(activeCell || '')}
        </span>
      </div>

      {/* Formula Input */}
      <div className="flex-1 flex items-center gap-2">
        <Input
          value={formula}
          onChange={(e) => {
            setFormula(e.target.value);
            setIsEditing(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsEditing(true)}
          placeholder="Enter formula or value..."
          className="font-mono text-sm"
        />
        
        {isEditing && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSubmit}
              className="h-8 w-8 p-0 hover:bg-green-500/10 hover:text-green-600"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
