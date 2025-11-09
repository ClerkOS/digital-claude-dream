import { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSpreadsheetStore } from '@/store/spreadsheetStore';
import { SpreadsheetGrid } from './SpreadsheetGrid';
import { FormulaBar } from './FormulaBar';
import { SheetTabs } from './SheetTabs';

// Sample financial data
const sampleFinancialData = [
  ['Date', 'Account', 'Description', 'Debit', 'Credit', 'Balance'],
  ['2024-01-01', 'Cash', 'Initial Investment', '10000', '0', '10000'],
  ['2024-01-02', 'Equipment', 'Office Equipment Purchase', '0', '2500', '7500'],
  ['2024-01-03', 'Accounts Receivable', 'Sale to Customer A', '0', '1500', '9000'],
  ['2024-01-04', 'Revenue', 'Sale Revenue', '0', '1500', '10500'],
  ['2024-01-05', 'Office Supplies', 'Stationery Purchase', '0', '200', '10300'],
  ['2024-01-06', 'Utilities', 'Electricity Bill', '0', '300', '10000'],
  ['2024-01-07', 'Accounts Payable', 'Supplier Invoice', '0', '800', '9200'],
  ['2024-01-08', 'Cash', 'Customer Payment', '1200', '0', '10400'],
  ['2024-01-09', 'Salaries', 'Employee Salary', '0', '2000', '8400'],
  ['2024-01-10', 'Revenue', 'Service Revenue', '0', '2500', '10900'],
  ['2024-01-11', 'Rent Expense', 'Office Rent', '0', '1200', '9700'],
  ['2024-01-12', 'Cash', 'Client Payment', '800', '0', '10500'],
  ['2024-01-13', 'Marketing', 'Advertising Campaign', '0', '500', '10000'],
  ['2024-01-14', 'Revenue', 'Product Sales', '0', '3200', '13200'],
  ['2024-01-15', 'Insurance', 'Business Insurance', '0', '400', '12800'],
  ['2024-01-16', 'Cash', 'Investment Return', '500', '0', '13300'],
  ['2024-01-17', 'Travel', 'Business Trip', '0', '600', '12700'],
  ['2024-01-18', 'Revenue', 'Consulting Fee', '0', '1800', '14500'],
  ['2024-01-19', 'Software', 'SaaS Subscription', '0', '150', '14350'],
  ['2024-01-20', 'Cash', 'Refund Received', '200', '0', '14550']
];

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
        const csvContent = sampleFinancialData.map(row => row.join(',')).join('\n');
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
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-green-500/10 rounded-md flex items-center justify-center">
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium">{workbook?.name || 'Sample Financial Data'}</h3>
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
            className="h-8 px-3"
          >
            <Search className="w-3 h-3 mr-1" />
            Search
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} className="h-8 px-3">
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="border-b border-border p-3">
          <Input
            type="text"
            placeholder="Search in spreadsheet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      )}

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
            <div className="flex-1 p-4 pb-1 min-h-0">
              <SpreadsheetGrid className="h-full" />
            </div>
            
            {/* Sheet Tabs */}
            <div className="flex-shrink-0 px-4 pb-4">
              <SheetTabs />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <p>No spreadsheet data available</p>
              <Button 
                onClick={async () => {
                  const csvContent = sampleFinancialData.map(row => row.join(',')).join('\n');
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
                className="mt-4"
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
