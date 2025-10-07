import { useCallback, useEffect, useState, useRef } from 'react';
import { useSpreadsheetStore } from '@/store/spreadsheetStore';
import { Input } from '@/components/ui/input';
import { setCell as apiSetCell } from '@/lib/api/cells';

// Minimal grid constants
const CELL_WIDTH = 100;
const CELL_HEIGHT = 28;

interface SpreadsheetGridProps {
  className?: string;
}

export function SpreadsheetGrid({ className }: SpreadsheetGridProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [scroll, setScroll] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 800, height: 400 });
  
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const { 
    workbook, 
    selectedCells, 
    activeCell, 
    selectCell, 
    updateCell,
  } = useSpreadsheetStore();

  const activeSheet = workbook?.sheets.find(s => s.id === workbook.activeSheetId);

  // Calculate grid dimensions
  const columnCount = activeSheet?.rows[0]?.cells.length || 10;
  const rowCount = activeSheet?.rows.length || 20;

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScroll({
      x: target.scrollLeft,
      y: target.scrollTop,
    });
  }, []);

  // Handle cell click
  const handleCellClick = useCallback((rowIndex: number, colIndex: number) => {
    const cellId = `cell-${rowIndex}-${colIndex}`;
    selectCell(cellId);
    setEditingCell(null);
  }, [selectCell]);

  // Handle cell double click
  const handleCellDoubleClick = useCallback((rowIndex: number, colIndex: number) => {
    const cellId = `cell-${rowIndex}-${colIndex}`;
    const cell = activeSheet?.rows[rowIndex]?.cells[colIndex];
    setEditingCell(cellId);
    setEditValue(cell?.value || '');
  }, [activeSheet]);

  // Handle edit value change
  const handleEditValueChange = useCallback((value: string) => {
    setEditValue(value);
  }, []);

  // Handle edit commit
  const handleEditCommit = useCallback(async () => {
    if (!editingCell || !activeSheet) return;

    const [_, rowIndexStr, colIndexStr] = editingCell.split('-');
    const rowIndex = parseInt(rowIndexStr);
    const colIndex = parseInt(colIndexStr);

    // Update local state
    updateCell(editingCell, editValue);

    // Update backend if workbook ID exists
    if (workbook?.id) {
      try {
        const address = String.fromCharCode(65 + colIndex) + (rowIndex + 1);
        await apiSetCell(workbook.id, activeSheet.name, address, editValue);
      } catch (error) {
        console.error('Failed to update cell:', error);
      }
    }

    setEditingCell(null);
    setEditValue('');
  }, [editingCell, editValue, activeSheet, updateCell, workbook?.id]);

  // Handle edit cancel
  const handleEditCancel = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  // Handle key down
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditCommit();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  }, [handleEditCommit, handleEditCancel]);

  // Update size on resize
  useEffect(() => {
    const updateSize = () => {
      if (gridRef.current) {
        const rect = gridRef.current.getBoundingClientRect();
        setSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  if (!activeSheet) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-muted-foreground">
          <div className="text-sm">No sheet selected</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={gridRef}
      className={`border border-border/50 rounded-lg overflow-hidden ${className}`}
    >
      <div
        ref={scrollContainerRef}
        className="h-full overflow-auto"
        onScroll={handleScroll}
      >
        {/* Column Headers */}
        <div className="flex sticky top-0 bg-muted/50 border-b border-border/50">
          <div className="w-8 h-7 bg-muted/50 border-r border-border/50 flex items-center justify-center text-xs text-muted-foreground font-mono">
            #
          </div>
          {Array.from({ length: columnCount }, (_, i) => (
            <div
              key={i}
              className="w-24 h-7 border-r border-border/50 flex items-center justify-center text-xs text-muted-foreground font-mono bg-muted/30"
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="relative">
          {activeSheet.rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {/* Row Header */}
              <div className="w-8 h-7 bg-muted/50 border-r border-border/50 border-b border-border/50 flex items-center justify-center text-xs text-muted-foreground font-mono">
                {rowIndex + 1}
              </div>
              
              {/* Cells */}
              {row.cells.map((cell, colIndex) => {
                const cellId = `cell-${rowIndex}-${colIndex}`;
                const isActive = activeCell === cellId;
                const isSelected = selectedCells.includes(cellId);
                const isEditing = editingCell === cellId;

                return (
                  <div
                    key={colIndex}
                    className={`
                      w-24 h-7 border-r border-border/50 border-b border-border/50 
                      flex items-center px-1 text-xs font-mono
                      ${isActive ? 'bg-blue-100 dark:bg-blue-900/20' : ''}
                      ${isSelected ? 'bg-muted' : ''}
                      hover:bg-muted/50 cursor-pointer
                    `}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                  >
                    {isEditing ? (
                      <Input
                        value={editValue}
                        onChange={(e) => handleEditValueChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleEditCommit}
                        className="h-6 px-1 text-xs font-mono border-0 focus-visible:ring-0"
                        autoFocus
                      />
                    ) : (
                      <span className="truncate">{cell.value || ''}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}