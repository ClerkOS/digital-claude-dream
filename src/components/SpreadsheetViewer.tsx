import { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSpreadsheetStore } from '@/store/spreadsheetStore';
import { SpreadsheetGrid } from './SpreadsheetGrid';
import { FormulaBar } from './FormulaBar';
import { SheetTabs } from './SheetTabs';
import { sampleFinancialData, dataToCSV } from '@/data/sampleSheets';

interface SpreadsheetViewerProps {
  workbookId?: string;
  className?: string;
}

export function SpreadsheetViewer({ workbookId, className = '' }: SpreadsheetViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [forceLoad, setForceLoad] = useState(false);

  const { 
    workbook, 
    isLoading, 
    exportToCSV,
    refreshWorkbook,
    loadFromFile
  } = useSpreadsheetStore();

  // Load workbook data if workbookId is provided, otherwise load sample data
  useEffect(() => {
    const loadData = async () => {
      if (workbookId) {
        if (!workbook) {
          await refreshWorkbook(workbookId);
        }
      } else if (!workbook) {
        // Only load sample data if no workbook exists
        const csvContent = dataToCSV(sampleFinancialData);
        const sampleFile = {
          name: 'Sample Financial Data',
          content: csvContent,
          type: 'text'
        };
        try {
          await loadFromFile(sampleFile);
        } catch (error) {
          console.error('Failed to load sample data:', error);
        }
      }
    };

    loadData();
  }, [workbookId]); // Only depend on workbookId to prevent loops

  const handleDownload = () => {
    const csvContent = exportToCSV();
    if (csvContent) {
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = workbook?.name || 'spreadsheet.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Always show the spreadsheet interface, with sample data if no workbookId

  return (
    <div className={`h-full flex flex-col bg-background ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <FileSpreadsheet className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{workbook?.name || 'Sample Financial Data'}</h3>
            <p className="text-xs text-muted-foreground">
              {workbook ? `${workbook.sheets.length} sheet${workbook.sheets.length !== 1 ? 's' : ''}` : 'Loading...'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSearch(!showSearch)}
            className="h-9 px-3 text-xs font-medium hover:bg-primary/5 hover:border-primary/30"
          >
            <Search className="w-3 h-3 mr-1.5" />
            Search
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownload} 
            className="h-9 px-3 text-xs font-medium hover:bg-primary/5 hover:border-primary/30"
          >
            <Download className="w-3 h-3 mr-1.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="border-b border-border/50 px-6 py-3 bg-muted/20">
          <Input
            type="text"
            placeholder="Search in spreadsheet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9"
          />
        </div>
      )}

      {/* Formula Bar */}
      <FormulaBar />

      {/* Spreadsheet Content */}
      <div className="flex-1 overflow-hidden bg-muted/20 flex flex-col p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileSpreadsheet className="w-8 h-8 animate-pulse" />
              </div>
              <p className="text-sm">Loading spreadsheet...</p>
            </div>
          </div>
        ) : workbook ? (
          <>
            {/* Spreadsheet Grid */}
            <div className="flex-1 min-h-0 mb-4">
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
              <p className="text-sm mb-4">No spreadsheet data available</p>
              <Button 
                onClick={async () => {
                  const csvContent = dataToCSV(sampleFinancialData);
                  const sampleFile = {
                    name: 'Sample Financial Data',
                    content: csvContent,
                    type: 'text'
                  };
                  try {
                    await loadFromFile(sampleFile);
                  } catch (error) {
                    console.error('Manual load failed:', error);
                  }
                }}
                variant="outline"
                className="h-9 px-4"
              >
                Load Sample Data
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
