import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpreadsheetStore } from '@/store/spreadsheetStore';
import { Input } from '@/components/ui/input';

// Virtualization constants
const CELL_WIDTH = 128; // w-32 = 128px
const CELL_HEIGHT = 32; // h-8 = 32px
const VIEWPORT_BUFFER = 5; // Extra cells to render for smooth scrolling

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
    gridViewport,
    setGridViewport,
  } = useSpreadsheetStore();

  const activeSheet = workbook?.sheets.find(s => s.id === workbook.activeSheetId);

  // Virtualization math
  // -------------------------
  
  // Number of rows/cols visible at once + buffer
  const visibleCols = Math.ceil(size.width / CELL_WIDTH) + VIEWPORT_BUFFER;
  const visibleRows = Math.ceil(size.height / CELL_HEIGHT) + VIEWPORT_BUFFER;

  // Which row/col indexes to start rendering from
  const startCol = Math.floor(scroll.x / CELL_WIDTH);
  const startRow = Math.floor(scroll.y / CELL_HEIGHT);

  // Pre-create the cell pool (reuse DOM nodes instead of creating new ones)
  const cellPool = useMemo(() => {
    const pool = [];
    for (let i = 0; i < visibleRows * visibleCols; i++) {
      pool.push({ row: 0, col: 0 });
    }
    return pool;
  }, [visibleCols, visibleRows]);

  // Update pool's actual row/col coordinates
  for (let i = 0; i < cellPool.length; i++) {
    const rowOffset = Math.floor(i / visibleCols);
    const colOffset = i % visibleCols;
    cellPool[i].row = startRow + rowOffset;
    cellPool[i].col = startCol + colOffset;
  }

  // Current raw scroll values
  const scrollX = scrollContainerRef.current?.scrollLeft ?? 0;
  const scrollY = scrollContainerRef.current?.scrollTop ?? 0;

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const scrollTop = scrollContainerRef.current.scrollTop;
      setScroll({ x: scrollLeft, y: scrollTop });
    }
  }, []);

  // Handle resize events
  const handleResize = useCallback(() => {
    if (gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    }
  }, []);

  // Set up scroll and resize listeners
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Update viewport in store when scroll changes
  useEffect(() => {
    const endCol = Math.min(startCol + visibleCols, 26);
    const endRow = Math.min(startRow + visibleRows, activeSheet?.rows.length || 100);
    
    setGridViewport({
      startRow,
      endRow,
      startCol,
      endCol,
    });
  }, [startRow, startCol, visibleRows, visibleCols, activeSheet?.rows.length, setGridViewport]);

  // Handle cell click
  const handleCellClick = useCallback((cellId: string) => {
    selectCell(cellId);
    setEditingCell(null);
  }, [selectCell]);

  // Handle cell double-click for editing
  const handleCellDoubleClick = useCallback((cellId: string, currentValue: any) => {
    setEditingCell(cellId);
    setEditValue(String(currentValue || ''));
  }, []);

  // Handle edit submission
  const handleEditSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (editingCell) {
      updateCell(editingCell, editValue);
      setEditingCell(null);
      setEditValue('');
    }
  }, [editingCell, editValue, updateCell]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeCell || editingCell) return;

      const [rowIndex, colIndex] = activeCell.split('-').slice(1).map(Number);
      let newRowIndex = rowIndex;
      let newColIndex = colIndex;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          newRowIndex = Math.max(0, rowIndex - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newRowIndex = Math.min(99, rowIndex + 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          newColIndex = Math.max(0, colIndex - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          newColIndex = Math.min(25, colIndex + 1);
          break;
        case 'Enter':
          e.preventDefault();
          if (activeSheet) {
            const cell = activeSheet.rows[rowIndex]?.cells[colIndex];
            handleCellDoubleClick(activeCell, cell?.value);
          }
          break;
        case 'Escape':
          setEditingCell(null);
          setEditValue('');
          break;
      }

      if (newRowIndex !== rowIndex || newColIndex !== colIndex) {
        const newCellId = `cell-${newRowIndex}-${newColIndex}`;
        selectCell(newCellId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCell, editingCell, activeSheet, selectCell, handleCellDoubleClick]);

  // Virtualization logic - only render visible cells
  const visibleRowsData = activeSheet?.rows.slice(
    gridViewport.startRow, 
    gridViewport.endRow
  ) || [];

  if (!activeSheet) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center text-muted-foreground">
          <p className="text-lg mb-2">No data loaded</p>
          <p className="text-sm">Upload a CSV or Excel file to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden border-2 border-primary/20 rounded-lg bg-background shadow-sm ${className}`} ref={gridRef}>
      {/* Virtualized Column headers */}
      <div className="flex border-b bg-grid-header sticky top-0 z-10">
        {/* Corner cell */}
        <div className="w-12 h-8 border-r grid-header flex items-center justify-center">
          <div className="w-3 h-3 bg-muted-foreground/20 rounded-sm" />
        </div>
        
        {/* Virtualized Column headers */}
        <div className="flex-1 overflow-hidden relative">
          <div 
            className="flex"
            style={{ 
              width: `${26 * CELL_WIDTH}px`,
              transform: `translateX(-${scroll.x}px)`
            }}
          >
            {Array.from({ length: 26 }, (_, colIndex) => {
              const header = String.fromCharCode(65 + colIndex);
              
              return (
                <motion.div
                  key={header}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: colIndex * 0.02 }}
                  style={{
                    width: `${CELL_WIDTH}px`,
                  }}
                  className="h-8 grid-header flex items-center justify-center text-xs font-medium cursor-pointer hover:bg-grid-hover border-r"
                >
                  {header}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Virtualized Grid Container */}
      <div className="flex">
        {/* Row Headers */}
        <div className="w-12 bg-grid-header border-r overflow-hidden virtualized-grid">
          <div 
            style={{
              height: `${(activeSheet?.rows.length || 100) * CELL_HEIGHT}px`,
              transform: `translateY(-${scroll.y}px)`
            }}
          >
            {Array.from({ length: activeSheet?.rows.length || 100 }, (_, rowIndex) => {
              return (
                <div
                  key={`row-header-${rowIndex}`}
                  style={{
                    height: `${CELL_HEIGHT}px`,
                  }}
                  className="grid-header flex items-center justify-center text-xs font-medium border-b"
                >
                  {rowIndex + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* Virtualized Grid */}
        <div 
          className="overflow-auto relative flex-1 virtualized-grid" 
          ref={scrollContainerRef}
          style={{
            height: `${size.height}px`,
          }}
        >
          {/* Total grid size for proper scrolling */}
          <div 
            style={{
              width: `${26 * CELL_WIDTH}px`,
              height: `${(activeSheet?.rows.length || 100) * CELL_HEIGHT}px`,
              position: 'relative'
            }}
          >
            {/* Render only visible cells using the cell pool */}
            {cellPool.map((cellPos, index) => {
              const { row, col } = cellPos;
              
              // Skip if outside valid range
              if (row >= (activeSheet?.rows.length || 0) || col >= 26) {
                return null;
              }

              const cell = activeSheet?.rows[row]?.cells[col];
              if (!cell) return null;

              const isSelected = selectedCells.includes(cell.id);
              const isActive = activeCell === cell.id;
              const isEditing = editingCell === cell.id;

              return (
                <div
                  key={`${row}-${col}`}
                  style={{
                    position: 'absolute',
                    left: `${col * CELL_WIDTH}px`,
                    top: `${row * CELL_HEIGHT}px`,
                    width: `${CELL_WIDTH}px`,
                    height: `${CELL_HEIGHT}px`,
                  }}
                  className={`
                    grid-cell relative cursor-pointer transition-all duration-150 border-r border-b
                    ${isSelected ? 'grid-cell-selected' : ''}
                    ${isActive ? 'ring-2 ring-primary ring-offset-1' : ''}
                  `}
                  onClick={() => handleCellClick(cell.id)}
                  onDoubleClick={() => handleCellDoubleClick(cell.id, cell.value)}
                >
                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.form
                        key="editing"
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.95 }}
                        onSubmit={handleEditSubmit}
                        className="w-full h-full"
                      >
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => {
                            handleEditSubmit({ preventDefault: () => {} } as React.FormEvent);
                          }}
                          className="w-full h-full border-0 bg-transparent px-2 text-xs focus:ring-0"
                          autoFocus
                        />
                      </motion.form>
                    ) : (
                      <motion.div
                        key="display"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center px-2 h-full text-xs overflow-hidden"
                      >
                        {cell.value && (
                          <motion.span
                            key={String(cell.value)}
                            initial={{ rotateX: -90, filter: 'blur(2px)' }}
                            animate={{ rotateX: 0, filter: 'blur(0px)' }}
                            transition={{ duration: 0.3 }}
                            className="truncate"
                          >
                            {String(cell.value)}
                          </motion.span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Selection indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="active-cell"
                      className="absolute inset-0 border-2 border-primary pointer-events-none"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
