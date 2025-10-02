import { create } from 'zustand';

export interface Cell {
  id: string;
  value: any;
  formula?: string;
  type?: 'text' | 'number' | 'date' | 'formula';
  format?: string;
}

export interface Row {
  id: string;
  cells: Cell[];
}

export interface Sheet {
  id: string;
  name: string;
  rows: Row[];
  createdAt: string;
  updatedAt: string;
}

export interface Workbook {
  id: string;
  name: string;
  sheets: Sheet[];
  activeSheetId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GridViewport {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
}

interface SpreadsheetState {
  // Data
  workbook: Workbook | null;
  isLoading: boolean;
  
  // Selection
  selectedCells: string[];
  activeCell: string | null;
  
  // Viewport
  gridViewport: GridViewport;
  
  // Actions
  setWorkbook: (workbook: Workbook | null) => void;
  setLoading: (loading: boolean) => void;
  setActiveSheet: (sheetId: string) => void;
  addSheet: (name: string) => void;
  removeSheet: (sheetId: string) => void;
  duplicateSheet: (sheetId: string) => void;
  selectCell: (cellId: string) => void;
  selectCells: (cellIds: string[]) => void;
  updateCell: (cellId: string, value: any) => void;
  setGridViewport: (viewport: GridViewport) => void;
  refreshWorkbook: (workbookId: string) => Promise<void>;
  
  // File operations
  loadFromFile: (file: { name: string; content: string; type: string }) => Promise<void>;
  exportToCSV: () => string;
}

// Helper function to create a cell ID
const createCellId = (row: number, col: number): string => `cell-${row}-${col}`;

// Helper function to convert backend sheet format to frontend format
const convertSheetToRows = (sheet: any): Row[] => {
  console.log('Converting sheet to rows:', sheet);
  const cells = sheet.cells || {}; // Backend returns 'cells', not 'Cells'
  const cellAddresses = Object.keys(cells);
  
  console.log('Cell addresses found:', cellAddresses);
  console.log('Cells data:', cells);
  
  if (cellAddresses.length === 0) {
    console.log('No cells found, creating empty structure');
    // Empty sheet - create default empty structure
    return Array.from({ length: 10 }, (_, rowIndex) => ({
      id: `row-${rowIndex}`,
      cells: Array.from({ length: 5 }, (_, colIndex) => ({
        id: createCellId(rowIndex, colIndex),
        value: '',
        type: 'text' as const
      }))
    }));
  }
  
  // Parse cell addresses to determine grid size
  const rows = new Map<number, Map<number, any>>();
  let maxRow = 0;
  let maxCol = 0;
  
  cellAddresses.forEach(address => {
    const match = address.match(/^([A-Z]+)(\d+)$/);
    if (match) {
      const colStr = match[1];
      const rowNum = parseInt(match[2]) - 1; // Convert to 0-based
      
      // Convert column letters to number (A=0, B=1, etc.)
      let colNum = 0;
      for (let i = 0; i < colStr.length; i++) {
        colNum = colNum * 26 + (colStr.charCodeAt(i) - 64);
      }
      colNum -= 1; // Convert to 0-based
      
      maxRow = Math.max(maxRow, rowNum);
      maxCol = Math.max(maxCol, colNum);
      
      if (!rows.has(rowNum)) {
        rows.set(rowNum, new Map());
      }
      rows.get(rowNum)!.set(colNum, cells[address]);
    }
  });
  
  // Create rows with proper structure
  const result: Row[] = [];
  const rowCount = Math.max(maxRow + 1, 10);
  const colCount = Math.max(maxCol + 1, 5);
  
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const rowCells: Cell[] = [];
    for (let colIndex = 0; colIndex < colCount; colIndex++) {
      const cellData = rows.get(rowIndex)?.get(colIndex);
      rowCells.push({
        id: createCellId(rowIndex, colIndex),
        value: cellData?.value || '',
        formula: cellData?.formula,
        type: 'text'
      });
    }
    result.push({
      id: `row-${rowIndex}`,
      cells: rowCells
    });
  }
  
  return result;
};

// Helper function to parse CSV content
const parseCSVContent = (content: string): { headers: string[]; rows: string[][] } => {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // Simple CSV parsing - handles basic cases
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result.map(cell => cell.replace(/^"(.*)"$/, '$1')); // Remove surrounding quotes
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  
  return { headers, rows };
};

// Helper function to create a workbook from CSV data
const createWorkbookFromCSV = (name: string, content: string): Workbook => {
  const { headers, rows } = parseCSVContent(content);
  const now = new Date().toISOString();
  
  // Calculate data bounds
  const dataRowCount = Math.max(rows.length, 1); // At least 1 row
  const dataColCount = Math.max(headers.length, 1); // At least 1 column
  
  // Extend with 2 additional columns and 5 additional rows
  const extendedRowCount = dataRowCount + 5;
  const extendedColCount = dataColCount + 2;
  
  // Create cells for each row (including extended rows)
  const sheetRows: Row[] = Array.from({ length: extendedRowCount }, (_, rowIndex) => {
    const cells: Cell[] = Array.from({ length: extendedColCount }, (_, colIndex) => {
      // If this is within the original data bounds, use the data
      if (rowIndex < dataRowCount && colIndex < dataColCount) {
        const rowData = rows[rowIndex] || [];
        return {
          id: createCellId(rowIndex, colIndex),
          value: rowData[colIndex] || '',
          type: 'text'
        };
      }
      // Otherwise, create empty cells
      return {
        id: createCellId(rowIndex, colIndex),
        value: '',
        type: 'text'
      };
    });
    
    return {
      id: `row-${rowIndex}`,
      cells
    };
  });
  
  const sheet: Sheet = {
    id: 'sheet-1',
    name: 'Sheet 1',
    rows: sheetRows,
    createdAt: now,
    updatedAt: now
  };
  
  return {
    id: `workbook-${Date.now()}`,
    name: name.replace(/\.[^/.]+$/, ''), // Remove file extension
    sheets: [sheet],
    activeSheetId: sheet.id,
    createdAt: now,
    updatedAt: now
  };
};

export const useSpreadsheetStore = create<SpreadsheetState>()((set, get) => ({
      // Initial state
      workbook: null,
      isLoading: false,
      selectedCells: [],
      activeCell: null,
      gridViewport: {
        startRow: 0,
        endRow: 50,
        startCol: 0,
        endCol: 26
      },
      
      // Actions
      setWorkbook: (workbook) => set({ workbook }),
      setLoading: (loading) => set({ isLoading: loading }),
      
      setActiveSheet: (sheetId) => set((state) => {
        if (!state.workbook) return state;
        
        const updatedWorkbook = {
          ...state.workbook,
          activeSheetId: sheetId,
          updatedAt: new Date().toISOString()
        };
        
        return { workbook: updatedWorkbook };
      }),
      
      addSheet: (name) => set((state) => {
        if (!state.workbook) return state;
        
        const now = new Date().toISOString();
        
        // Create a new sheet with 6 rows (1 + 5 extension) and 3 columns (1 + 2 extension)
        const newSheet: Sheet = {
          id: `sheet-${Date.now()}`,
          name,
          rows: Array.from({ length: 6 }, (_, rowIndex) => ({
            id: `row-${rowIndex}`,
            cells: Array.from({ length: 3 }, (_, colIndex) => ({
              id: createCellId(rowIndex, colIndex),
              value: '',
              type: 'text'
            }))
          })),
          createdAt: now,
          updatedAt: now
        };
        
        const updatedWorkbook = {
          ...state.workbook,
          sheets: [...state.workbook.sheets, newSheet],
          activeSheetId: newSheet.id,
          updatedAt: now
        };
        
        return { workbook: updatedWorkbook };
      }),
      
      removeSheet: (sheetId) => set((state) => {
        if (!state.workbook || state.workbook.sheets.length <= 1) return state;
        
        const updatedSheets = state.workbook.sheets.filter(sheet => sheet.id !== sheetId);
        const newActiveSheetId = updatedSheets[0]?.id || '';
        
        const updatedWorkbook = {
          ...state.workbook,
          sheets: updatedSheets,
          activeSheetId: newActiveSheetId,
          updatedAt: new Date().toISOString()
        };
        
        return { workbook: updatedWorkbook };
      }),
      
      duplicateSheet: (sheetId) => set((state) => {
        if (!state.workbook) return state;
        
        const sheetToDuplicate = state.workbook.sheets.find(sheet => sheet.id === sheetId);
        if (!sheetToDuplicate) return state;
        
        const now = new Date().toISOString();
        const duplicatedSheet: Sheet = {
          ...sheetToDuplicate,
          id: `sheet-${Date.now()}`,
          name: `${sheetToDuplicate.name} Copy`,
          createdAt: now,
          updatedAt: now,
          rows: sheetToDuplicate.rows.map((row, rowIndex) => ({
            ...row,
            id: `row-${rowIndex}`,
            cells: row.cells.map((cell, colIndex) => ({
              ...cell,
              id: createCellId(rowIndex, colIndex)
            }))
          }))
        };
        
        const updatedWorkbook = {
          ...state.workbook,
          sheets: [...state.workbook.sheets, duplicatedSheet],
          activeSheetId: duplicatedSheet.id,
          updatedAt: now
        };
        
        return { workbook: updatedWorkbook };
      }),
      
      selectCell: (cellId) => set({
        selectedCells: [cellId],
        activeCell: cellId
      }),
      
      selectCells: (cellIds) => set({
        selectedCells: cellIds,
        activeCell: cellIds[0] || null
      }),
      
      updateCell: (cellId, value) => set((state) => {
        if (!state.workbook) return state;
        
        const activeSheet = state.workbook.sheets.find(sheet => sheet.id === state.workbook!.activeSheetId);
        if (!activeSheet) return state;
        
        const updatedRows = activeSheet.rows.map(row => ({
          ...row,
          cells: row.cells.map(cell => 
            cell.id === cellId 
              ? { ...cell, value, updatedAt: new Date().toISOString() }
              : cell
          )
        }));
        
        const updatedSheets = state.workbook.sheets.map(sheet =>
          sheet.id === activeSheet.id
            ? { ...sheet, rows: updatedRows, updatedAt: new Date().toISOString() }
            : sheet
        );
        
        const updatedWorkbook = {
          ...state.workbook,
          sheets: updatedSheets,
          updatedAt: new Date().toISOString()
        };
        
        return { workbook: updatedWorkbook };
      }),
      
      setGridViewport: (viewport) => set({ gridViewport: viewport }),
      
      refreshWorkbook: async (workbookId) => {
        try {
          // Import the workbook API function
          const { getWorkbook } = await import('@/lib/api/workbook');
          const workbookData = await getWorkbook(workbookId);
          
          console.log('Backend workbook data:', workbookData);
          
          // Convert the backend workbook format to our frontend format
          const convertedWorkbook: Workbook = {
            id: workbookData.workbook_id,
            name: workbookData.workbook_name || 'Workbook', // Use backend name if available
            sheets: workbookData.sheets.map((sheet: any, index: number) => {
              console.log(`Converting sheet ${index}:`, sheet);
              return {
                id: `sheet-${index}`,
                name: sheet.name, // Backend returns 'name', not 'Name'
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                rows: convertSheetToRows(sheet)
              };
            }),
            activeSheetId: 'sheet-0', // Default to first sheet
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          console.log('Converted workbook:', convertedWorkbook);
          set({ workbook: convertedWorkbook });
        } catch (error) {
          console.error('Failed to refresh workbook:', error);
        }
      },
      
      loadFromFile: async (file) => {
        set({ isLoading: true });
        
        try {
          // Simulate loading delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const workbook = createWorkbookFromCSV(file.name, file.content);
          set({ workbook, isLoading: false });
        } catch (error) {
          console.error('Failed to load file:', error);
          set({ isLoading: false });
        }
      },
      
      exportToCSV: () => {
        const { workbook } = get();
        if (!workbook) return '';
        
        const activeSheet = workbook.sheets.find(sheet => sheet.id === workbook.activeSheetId);
        if (!activeSheet || activeSheet.rows.length === 0) return '';
        
        // Get headers from first row
        const headers = activeSheet.rows[0].cells.map(cell => cell.value || '');
        
        // Get data rows
        const rows = activeSheet.rows.map(row => 
          row.cells.map(cell => {
            const value = cell.value || '';
            // Escape CSV values
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
        );
        
        // Combine headers and rows
        const csvContent = [headers, ...rows]
          .map(row => row.join(','))
          .join('\n');
        
        return csvContent;
      }
    })
);
