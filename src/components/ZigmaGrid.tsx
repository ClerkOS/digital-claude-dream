import { useCallback, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpreadsheetStore } from '@/store/spreadsheetStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, RefreshCw, Layers, Lightbulb, Grid3x3 } from 'lucide-react';
import { setCell as apiSetCell } from '@/lib/api/cells';

// Grid constants
const CELL_WIDTH = 100;
const CELL_HEIGHT = 28;

type GridMode = 'full' | 'context' | 'learning';

interface AffectedArea {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
  issueId?: string;
  issueType?: string;
  ruleId?: string;
}

interface ZigmaGridProps {
  className?: string;
  affectedRows?: number[];
  issues?: Array<{
    id: string;
    type: string;
    affectedRows: number[];
  }>;
}

export function ZigmaGrid({ className, affectedRows = [], issues = [] }: ZigmaGridProps) {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [scroll, setScroll] = useState({ x: 0, y: 0 });
  const [gridMode, setGridMode] = useState<GridMode>('context'); // Default to context
  const [focusArea, setFocusArea] = useState<AffectedArea | null>(null);
  const [compressedSections, setCompressedSections] = useState<number[][]>([]);
  const [showFullGrid, setShowFullGrid] = useState(false);
  const [rippleTrigger, setRippleTrigger] = useState<number>(0);
  const [hoveredIssueId, setHoveredIssueId] = useState<string | null>(null);
  
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

  // Process affected areas from issues
  useEffect(() => {
    if (issues.length > 0 && gridMode === 'context') {
      // Group affected rows into sections
      const allAffectedRows = new Set<number>();
      issues.forEach(issue => {
        issue.affectedRows.forEach(row => allAffectedRows.add(row));
      });

      // Create compressed sections (groups of consecutive rows)
      const sortedRows = Array.from(allAffectedRows).sort((a, b) => a - b);
      const sections: number[][] = [];
      let currentSection: number[] = [];

      sortedRows.forEach((row, index) => {
        if (index === 0 || row === sortedRows[index - 1] + 1) {
          currentSection.push(row);
        } else {
          if (currentSection.length > 0) {
            sections.push(currentSection);
          }
          currentSection = [row];
        }
      });
      if (currentSection.length > 0) {
        sections.push(currentSection);
      }

      setCompressedSections(sections);

      // Set focus area to first section
      if (sections.length > 0) {
        const firstSection = sections[0];
        setFocusArea({
          startRow: firstSection[0],
          endRow: firstSection[firstSection.length - 1],
          startCol: 0,
          endCol: columnCount - 1,
          issueId: issues[0]?.id,
        });
      }
    } else {
      setCompressedSections([]);
      setFocusArea(null);
    }
  }, [issues, gridMode, columnCount]);

  // Auto-focus on affected areas
  useEffect(() => {
    if (focusArea && scrollContainerRef.current) {
      const rowHeight = CELL_HEIGHT;
      const targetScrollY = focusArea.startRow * rowHeight - 100; // Offset for better visibility
      
      scrollContainerRef.current.scrollTo({
        top: targetScrollY,
        behavior: 'smooth'
      });
    }
  }, [focusArea]);

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

  // Handle edit commit
  const handleEditCommit = useCallback(async () => {
    if (!editingCell || !activeSheet) return;

    const [_, rowIndexStr, colIndexStr] = editingCell.split('-');
    const rowIndex = parseInt(rowIndexStr);
    const colIndex = parseInt(colIndexStr);

    updateCell(editingCell, editValue);

    if (workbook?.id) {
      try {
        const address = String.fromCharCode(65 + colIndex) + (rowIndex + 1);
        await apiSetCell(workbook.id, activeSheet.name, address, editValue);
      } catch (error) {
        console.error('Failed to update cell:', error);
      }
    }

    // Trigger ripple effect
    setRippleTrigger(Date.now());

    setEditingCell(null);
    setEditValue('');
  }, [editingCell, editValue, activeSheet, updateCell, workbook?.id]);

  // Check if row is affected
  const isRowAffected = useCallback((rowIndex: number): string | null => {
    for (const issue of issues) {
      if (issue.affectedRows.includes(rowIndex)) {
        return issue.id;
      }
    }
    return null;
  }, [issues]);

  // Check if row should be compressed
  const isRowCompressed = useCallback((rowIndex: number): boolean => {
    if (gridMode !== 'context' || compressedSections.length === 0) return false;
    
    return !compressedSections.some(section => section.includes(rowIndex));
  }, [gridMode, compressedSections]);

  // Get rows to display based on mode
  const getDisplayRows = useCallback((): Array<{ row: typeof activeSheet.rows[0], actualIndex: number } | { separator: true, id: string }> => {
    if (!activeSheet) return [];

    if (gridMode === 'context' && compressedSections.length > 0 && !showFullGrid) {
      // Show only affected sections
      const rowsToShow: Array<{ row: typeof activeSheet.rows[0], actualIndex: number } | { separator: true, id: string }> = [];
      compressedSections.forEach((section, sectionIndex) => {
        section.forEach(rowIndex => {
          if (activeSheet.rows[rowIndex]) {
            rowsToShow.push({ row: activeSheet.rows[rowIndex], actualIndex: rowIndex });
          }
        });
        // Add separator between sections (except last)
        if (sectionIndex < compressedSections.length - 1) {
          rowsToShow.push({ separator: true, id: `separator-${sectionIndex}` });
        }
      });
      return rowsToShow;
    }

    // Full mode - show all rows with their actual indices
    return activeSheet.rows.map((row, index) => ({ row, actualIndex: index }));
  }, [activeSheet, gridMode, compressedSections, showFullGrid]);

  if (!activeSheet) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-muted-foreground">
          <div className="text-sm">No sheet selected</div>
        </div>
      </div>
    );
  }

  const displayRows = getDisplayRows();
  const affectedRowSet = new Set(affectedRows);

  return (
    <div className={`relative h-full w-full ${className}`}>
      {/* Grid Container */}
      <div 
        ref={gridRef}
        className="border border-border/30 rounded-lg overflow-hidden bg-background h-full w-full shadow-sm"
      >
        <div
          ref={scrollContainerRef}
          className="h-full overflow-auto"
          onScroll={handleScroll}
        >
          {/* Column Headers */}
          <div className="flex sticky top-0 bg-muted/50 border-b border-border/50 z-10">
            <div className="w-10 h-7 bg-muted/50 border-r border-border/50 flex items-center justify-center text-xs text-muted-foreground font-mono">
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

          {/* Rows with Animations */}
          <div className="relative">
            <AnimatePresence>
              {displayRows.map((item, displayIndex) => {
                // Handle separator
                if ('separator' in item && item.separator) {
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 20 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center justify-center text-xs text-muted-foreground bg-muted/20"
                    >
                      <span>...</span>
                    </motion.div>
                  );
                }

                // Handle actual row
                const { row, actualIndex: actualRowIndex } = item;
                const issueId = isRowAffected(actualRowIndex);
                const isCompressed = isRowCompressed(actualRowIndex);
                const isAffected = affectedRowSet.has(actualRowIndex) || issueId !== null;

                if (isCompressed) return null;

                return (
                  <motion.div
                    key={row.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: isAffected ? 1 : 0.4,
                      x: 0,
                      scale: isAffected ? 1 : 0.98
                    }}
                    transition={{ 
                      duration: 0.3,
                      delay: displayIndex * 0.01
                    }}
                    className={`
                      relative flex
                      ${isAffected ? 'bg-amber-50/30 border-l-2 border-l-amber-400' : ''}
                    `}
                  >
                    {/* Row Gutter with Issue Indicator */}
                    <div className="w-10 h-7 bg-muted/50 border-r border-border/50 border-b border-border/50 flex items-center justify-center text-xs text-muted-foreground font-mono relative group">
                      {actualRowIndex + 1}
                      {issueId && (
                        <>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -left-1 top-0 bottom-0 flex items-center cursor-pointer z-10"
                            onMouseEnter={() => setHoveredIssueId(issueId)}
                            onMouseLeave={() => setHoveredIssueId(null)}
                          >
                            <div className={`w-1 h-full bg-amber-400 rounded-r transition-all ${
                              hoveredIssueId === issueId ? 'w-1.5' : ''
                            }`} />
                          </motion.div>
                          {/* Smart Stripe - appears on hover */}
                          {hoveredIssueId === issueId && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              className="absolute left-full ml-2 top-0 z-50"
                            >
                              <div className="bg-background border border-border rounded-lg px-3 py-2 shadow-lg min-w-[200px]">
                                <p className="text-xs font-medium text-foreground mb-1 capitalize">
                                  {issues.find(i => i.id === issueId)?.type.replace(/_/g, ' ') || 'Issue'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Row {actualRowIndex + 1} is part of this issue group
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </>
                      )}
                    </div>
                    
                    {/* Cells */}
                    {row.cells.map((cell, colIndex) => {
                      const cellId = `cell-${actualRowIndex}-${colIndex}`;
                      const isActive = activeCell === cellId;
                      const isSelected = selectedCells.includes(cellId);
                      const isEditing = editingCell === cellId;

                      return (
                        <motion.div
                          key={colIndex}
                          initial={false}
                          animate={{
                            backgroundColor: isAffected ? 'rgba(251, 191, 36, 0.1)' : 'transparent',
                          }}
                          className={`
                            w-24 h-7 border-r border-border/50 border-b border-border/50 
                            flex items-center px-1 text-xs font-mono
                            ${isActive ? 'bg-blue-100 dark:bg-blue-900/20 ring-1 ring-blue-400' : ''}
                            ${isSelected ? 'bg-muted' : ''}
                            hover:bg-muted/50 cursor-pointer relative
                            ${isAffected ? 'border-amber-200' : ''}
                          `}
                          onClick={() => handleCellClick(actualRowIndex, colIndex)}
                          onDoubleClick={() => handleCellDoubleClick(actualRowIndex, colIndex)}
                        >
                          {/* Ripple Effect */}
                          {rippleTrigger > 0 && isActive && (
                            <motion.div
                              key={rippleTrigger}
                              className="absolute inset-0 bg-primary/10 rounded"
                              initial={{ scale: 0, opacity: 0.5 }}
                              animate={{ scale: 2, opacity: 0 }}
                              transition={{ duration: 0.6 }}
                            />
                          )}

                          {isEditing ? (
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleEditCommit();
                                if (e.key === 'Escape') {
                                  setEditingCell(null);
                                  setEditValue('');
                                }
                              }}
                              onBlur={handleEditCommit}
                              className="h-6 px-1 text-xs font-mono border-0 focus-visible:ring-0 bg-transparent"
                              autoFocus
                            />
                          ) : (
                            <span className="truncate">{cell.value || ''}</span>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

