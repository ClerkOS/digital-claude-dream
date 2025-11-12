import { motion } from 'framer-motion';
import { FileSpreadsheet } from 'lucide-react';

interface DataPreviewGridProps {
  data: any[];
  columns: string[];
  highlightedCells?: Array<{ row: number; col: number; color: string }>;
}

export function DataPreviewGrid({ data, columns, highlightedCells = [] }: DataPreviewGridProps) {
  if (!data || data.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="bg-muted/20 rounded-lg p-8 text-center border border-border/50">
          <FileSpreadsheet className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">Data preview will appear here</p>
        </div>
      </div>
    );
  }

  const displayData = data.slice(0, 10); // Show max 10 rows
  const displayColumns = columns.slice(0, 8); // Show max 8 columns

  return (
    <div className="max-w-7xl mx-auto px-8 py-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-background border-0 rounded-lg overflow-hidden shadow-sm"
      >
        {/* Header */}
        <div className="px-6 py-3 border-b border-border bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground">Data Preview</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {data.length} row{data.length !== 1 ? 's' : ''} • {columns.length} column{columns.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Column Headers */}
            <div className="flex border-b border-border bg-muted/20 sticky top-0 z-10">
              <div className="w-12 px-3 py-2.5 text-xs font-medium text-muted-foreground border-r border-border">
                #
              </div>
              {displayColumns.map((col, idx) => (
                <div
                  key={idx}
                  className="min-w-[140px] px-3 py-2.5 text-xs font-medium text-muted-foreground border-r border-border last:border-r-0"
                >
                  {col}
                </div>
              ))}
            </div>

            {/* Rows */}
            {displayData.map((row, rowIdx) => (
              <motion.div
                key={rowIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: rowIdx * 0.02, duration: 0.2 }}
                className="flex border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors duration-150"
              >
                <div className="w-12 px-3 py-2 text-xs text-muted-foreground border-r border-border bg-muted/10">
                  {rowIdx + 1}
                </div>
                {displayColumns.map((col, colIdx) => {
                  const cellValue = row[col] ?? '';
                  const isHighlighted = highlightedCells.some(
                    (hc) => hc.row === rowIdx && hc.col === colIdx
                  );
                  const highlightColor = highlightedCells.find(
                    (hc) => hc.row === rowIdx && hc.col === colIdx
                  )?.color;

                  return (
                    <motion.div
                      key={colIdx}
                      initial={isHighlighted ? { backgroundColor: highlightColor } : {}}
                      animate={
                        isHighlighted
                          ? {
                              backgroundColor: [highlightColor || 'rgba(var(--primary-rgb), 0.1)', 'transparent'],
                            }
                          : {}
                      }
                      transition={{ duration: 0.8, repeat: isHighlighted ? 1 : 0 }}
                      className="min-w-[140px] px-3 py-2 text-xs text-foreground border-r border-border last:border-r-0 truncate"
                      title={String(cellValue)}
                    >
                      {String(cellValue)}
                    </motion.div>
                  );
                })}
              </motion.div>
            ))}
          </div>
        </div>

        {data.length > 10 && (
          <div className="px-6 py-2.5 bg-muted/10 text-center text-xs text-muted-foreground border-t border-border">
            Showing 10 of {data.length} rows
          </div>
        )}
      </motion.div>
    </div>
  );
}

