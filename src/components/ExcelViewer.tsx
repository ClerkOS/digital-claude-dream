import { motion } from 'framer-motion';
import { FileText, X, Download, Search } from 'lucide-react';
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
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed right-0 top-0 h-full bg-background border-l border-border/50 flex flex-col z-50 w-full lg:w-[50%]"
    >
      {/* Minimal Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-muted rounded flex items-center justify-center">
            <FileText className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-medium">{file?.name || workbook?.name || 'Spreadsheet'}</h2>
            <p className="text-xs text-muted-foreground">
              {workbook ? `${workbook.sheets.length} sheet${workbook.sheets.length !== 1 ? 's' : ''}` : 'Loading...'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
            className="h-7 px-2"
          >
            <Search className="w-3 h-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDownload} 
            className="h-7 px-2"
          >
            <Download className="w-3 h-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose} 
            className="h-7 w-7 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="p-3 border-b border-border/50">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      )}

      {/* Formula Bar */}
      <FormulaBar />

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-background flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <div className="w-8 h-8 bg-muted rounded flex items-center justify-center mx-auto mb-3">
                <FileText className="w-4 h-4 animate-pulse" />
              </div>
              <p className="text-sm">Loading...</p>
            </div>
          </div>
        ) : workbook ? (
          <>
            {/* Spreadsheet Grid */}
            <div className="flex-1 p-3 pb-2 min-h-0">
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
              <div className="w-8 h-8 bg-muted rounded flex items-center justify-center mx-auto mb-3">
                <FileText className="w-4 h-4" />
              </div>
              <p className="text-sm">No data available</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ExcelViewer;