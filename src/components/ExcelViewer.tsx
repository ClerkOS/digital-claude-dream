import { motion, AnimatePresence } from 'framer-motion';
import { FileSpreadsheet, X, Download, GripVertical, Search, Eye, EyeOff, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

interface ExcelViewerProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    name: string;
    content: string;
    type: 'text' | 'code' | 'image' | 'markdown';
    language?: string;
  } | null;
}

interface ExcelData {
  headers: string[];
  rows: any[][];
  totalRows: number;
  totalColumns: number;
}

function ExcelViewer({ isOpen, onClose, file }: ExcelViewerProps) {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [size, setSize] = useState({ width: 900, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filteredData, setFilteredData] = useState<ExcelData | null>(null);
  const [showHeaders, setShowHeaders] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(20);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [formulaBar, setFormulaBar] = useState('');
  const [editingCell, setEditingCell] = useState<{row: number, col: number} | null>(null);

  // Parse CSV/Excel-like data from file content
  const parseExcelData = (content: string): ExcelData => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      return { headers: [], rows: [], totalRows: 0, totalColumns: 0 };
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(line => 
      line.split(',').map(cell => cell.trim().replace(/"/g, ''))
    );

    return {
      headers,
      rows,
      totalRows: rows.length,
      totalColumns: headers.length
    };
  };

  const excelData = file ? parseExcelData(file.content) : null;

  useEffect(() => {
    if (excelData && searchTerm) {
      const filtered = {
        ...excelData,
        rows: excelData.rows.filter(row => 
          row.some(cell => 
            cell.toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
      };
      setFilteredData(filtered);
    } else {
      setFilteredData(excelData);
    }
  }, [excelData, searchTerm]);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart, position, size]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      const maxX = window.innerWidth - size.width;
      const maxY = window.innerHeight - size.height;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
    
    if (isResizing) {
      const newWidth = Math.max(600, resizeStart.width + (e.clientX - resizeStart.x));
      const newHeight = Math.max(400, resizeStart.height + (e.clientY - resizeStart.y));
      
      setSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  const handleDownload = () => {
    if (file) {
      const blob = new Blob([file.content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleCopy = async () => {
    if (file?.content) {
      try {
        await navigator.clipboard.writeText(file.content);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col });
    if (filteredData && filteredData.rows[row] && filteredData.rows[row][col]) {
      setFormulaBar(filteredData.rows[row][col]);
    } else {
      setFormulaBar('');
    }
    setEditingCell(null);
  };

  const handleCellDoubleClick = (row: number, col: number) => {
    setEditingCell({ row, col });
    if (filteredData && filteredData.rows[row] && filteredData.rows[row][col]) {
      setFormulaBar(filteredData.rows[row][col]);
    } else {
      setFormulaBar('');
    }
  };

  const handleFormulaBarChange = (value: string) => {
    setFormulaBar(value);
  };

  const handleFormulaBarSubmit = () => {
    if (selectedCell && filteredData) {
      // In a real implementation, you would update the data here
      // For now, we'll just update the formula bar display
      console.log(`Updating cell ${selectedCell.row},${selectedCell.col} with: ${formulaBar}`);
    }
  };

  const totalPages = filteredData ? Math.ceil(filteredData.rows.length / rowsPerPage) : 0;
  const startRow = (currentPage - 1) * rowsPerPage;
  const endRow = Math.min(startRow + rowsPerPage, filteredData?.rows.length || 0);
  const currentRows = filteredData?.rows.slice(startRow, endRow) || [];

  if (!file || !excelData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-50"
            onClick={onClose}
          />

          {/* Draggable Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed bg-background border rounded-xl z-50 flex flex-col transition-shadow ${
              isDragging ? 'shadow-2xl border-primary/50' : 'shadow-xl border-border'
            }`}
            style={{
              left: position.x,
              top: position.y,
              width: size.width,
              height: size.height,
              minWidth: 600,
              minHeight: 400,
              maxWidth: '95vw',
              maxHeight: '95vh'
            }}
          >
            {/* Draggable Header */}
            <div 
              className="flex items-center justify-between p-4 border-b border-border select-none hover:bg-muted/30 transition-colors"
              onMouseDown={handleMouseDown}
              style={{ 
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none'
              }}
              title="Drag to move file viewer"
            >
              <div className="flex items-center gap-3">
                <GripVertical className={`w-4 h-4 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground/70'}`} />
                <div className="w-8 h-8 bg-green-500/10 rounded-md flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{file.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {excelData.totalRows} rows × {excelData.totalColumns} columns
                    {searchTerm && ` • ${filteredData?.rows.length || 0} filtered`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowSearch(!showSearch)}
                  className="h-8 px-3"
                >
                  <Search className="w-3 h-3 mr-1" />
                  Search
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowHeaders(!showHeaders)}
                  className="h-8 px-3"
                >
                  {showHeaders ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                  Headers
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} className="h-8 px-3">
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <AnimatePresence>
              {showSearch && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-border overflow-hidden"
                >
                  <div className="p-3">
                    <Input
                      type="text"
                      placeholder="Search in spreadsheet..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Formula Bar */}
            <div className="border-b border-border bg-muted/20 p-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Calculator className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-mono text-muted-foreground min-w-0">
                    {selectedCell ? `${String.fromCharCode(65 + selectedCell.col)}${selectedCell.row + 1}` : 'A1'}
                  </span>
                </div>
                <div className="flex-1">
                  <Input
                    type="text"
                    value={formulaBar}
                    onChange={(e) => handleFormulaBarChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleFormulaBarSubmit();
                      }
                    }}
                    placeholder="Enter formula or value..."
                    className="font-mono text-sm"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFormulaBarSubmit}
                  className="h-8 px-3"
                >
                  Enter
                </Button>
              </div>
            </div>

            {/* Excel Content */}
            <div className="flex-1 overflow-auto bg-background">
              {excelData.totalRows === 0 ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileSpreadsheet className="w-8 h-8" />
                    </div>
                    <p>No data available in this file</p>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  {/* Excel-like table */}
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        {/* Headers */}
                        {showHeaders && (
                          <thead className="bg-muted/50">
                            <tr>
                              {excelData.headers.map((header, index) => (
                                <th
                                  key={index}
                                  className="px-3 py-2 text-left font-medium text-muted-foreground border-r border-border last:border-r-0 min-w-[120px]"
                                >
                                  {header || `Column ${index + 1}`}
                                </th>
                              ))}
                            </tr>
                          </thead>
                        )}
                        
                        {/* Data Rows */}
                        <tbody>
                          {currentRows.map((row, rowIndex) => (
                            <tr
                              key={startRow + rowIndex}
                              className="border-b border-border hover:bg-muted/30 transition-colors"
                            >
                              {row.map((cell, cellIndex) => {
                                const isSelected = selectedCell?.row === startRow + rowIndex && selectedCell?.col === cellIndex;
                                const isEditing = editingCell?.row === startRow + rowIndex && editingCell?.col === cellIndex;
                                
                                return (
                                  <td
                                    key={cellIndex}
                                    className={`px-3 py-2 border-r border-border last:border-r-0 min-w-[120px] max-w-[200px] cursor-pointer transition-colors ${
                                      isSelected ? 'bg-primary/10 border-primary/50' : ''
                                    }`}
                                    title={cell}
                                    onClick={() => handleCellClick(startRow + rowIndex, cellIndex)}
                                    onDoubleClick={() => handleCellDoubleClick(startRow + rowIndex, cellIndex)}
                                  >
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        value={formulaBar}
                                        onChange={(e) => handleFormulaBarChange(e.target.value)}
                                        onBlur={() => setEditingCell(null)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleFormulaBarSubmit();
                                            setEditingCell(null);
                                          }
                                          if (e.key === 'Escape') {
                                            setEditingCell(null);
                                          }
                                        }}
                                        className="w-full bg-transparent border-none outline-none font-mono text-sm"
                                        autoFocus
                                      />
                                    ) : (
                                      <span className="truncate block">{cell || '-'}</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 px-2">
                      <div className="text-sm text-muted-foreground">
                        Showing {startRow + 1}-{endRow} of {filteredData?.rows.length || 0} rows
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="h-8 px-3"
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground px-2">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="h-8 px-3"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/20">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div>
                  <span className="font-medium">File:</span> {file.name}
                </div>
                <div>
                  <span className="font-medium">Size:</span> {file.content.length.toLocaleString()} characters
                </div>
                <div>
                  <span className="font-medium">Type:</span> {file.language || 'CSV'}
                </div>
              </div>
            </div>

            {/* Resize Handle */}
            <div
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
              onMouseDown={handleResizeStart}
              style={{
                background: 'linear-gradient(-45deg, transparent 30%, hsl(var(--border)) 30%, hsl(var(--border)) 40%, transparent 40%, transparent 60%, hsl(var(--border)) 60%, hsl(var(--border)) 70%, transparent 70%)'
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ExcelViewer;
