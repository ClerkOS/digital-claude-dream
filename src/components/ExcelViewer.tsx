import { motion, AnimatePresence } from 'framer-motion';
import { FileSpreadsheet, X, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { useSpreadsheetStore } from '@/store/spreadsheetStore';
import { SpreadsheetGrid } from './SpreadsheetGrid';
import { FormulaBar } from './FormulaBar';
import { SheetTabs } from './SheetTabs';

interface ExcelViewerProps {
  isOpen: boolean;
  onClose: () => void;
  file?: {
    name: string;
    content: string;
    type: 'text' | 'code' | 'image' | 'markdown';
    language?: string;
  } | null;
  workbookId?: string;
}

function ExcelViewer({ isOpen, onClose, file, workbookId }: ExcelViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const { 
    workbook, 
    isLoading, 
    loadFromFile, 
    exportToCSV,
    refreshWorkbook
  } = useSpreadsheetStore();

  // Load workbook data if workbookId is provided
  useEffect(() => {
    const loadWorkbook = async () => {
      if (workbookId && !workbook) {
        await refreshWorkbook(workbookId);
      }
    };

    if (isOpen) {
      loadWorkbook();
    }
  }, [isOpen, workbookId, workbook, refreshWorkbook]);

  // Load file when it changes
  useEffect(() => {
    if (file && isOpen) {
      loadFromFile(file);
    }
  }, [file, isOpen, loadFromFile]);

  // Handle search functionality
  useEffect(() => {
    // Search functionality can be implemented here if needed
    // For now, we'll keep it simple
  }, [searchTerm]);

  const handleDownload = () => {
    const csvContent = exportToCSV();
    if (csvContent) {
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file?.name || workbook?.name || 'spreadsheet.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (!file && !workbookId) return null;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="h-full w-full lg:w-1/2 bg-background border-l border-border flex flex-col shadow-xl"
    >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/10 rounded-md flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{file?.name || workbook?.name || 'Spreadsheet'}</h2>
                <p className="text-xs text-muted-foreground">
                  {workbook ? `${workbook.sheets.length} sheet${workbook.sheets.length !== 1 ? 's' : ''}` : 'Loading...'}
                  {isLoading && ' • Loading...'}
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Formula Bar */}
          <FormulaBar />

          {/* Spreadsheet Content */}
          <div className="flex-1 overflow-hidden bg-background flex flex-col">
            {isLoading ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileSpreadsheet className="w-8 h-8 animate-pulse" />
                  </div>
                  <p>Loading spreadsheet...</p>
                </div>
              </div>
            ) : workbook ? (
              <>
                {/* Spreadsheet Grid */}
                <div className="flex-1 p-4 pb-2 min-h-0">
                  <SpreadsheetGrid className="h-full" />
                </div>
                
                {/* Sheet Tabs */}
                <div className="flex-shrink-0">
                  <SheetTabs />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileSpreadsheet className="w-8 h-8" />
                  </div>
                  <p>No data available in this file</p>
                </div>
              </div>
            )}
          </div>

          </motion.div>
  );
}

export default ExcelViewer;
