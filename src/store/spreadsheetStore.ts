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
  
  // File operations
  loadFromFile: (file: { name: string; content: string; type: string }) => Promise<void>;
  exportToCSV: () => string;
}

// Helper function to create a cell ID
const createCellId = (row: number, col: number): string => `cell-${row}-${col}`;

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
  
  // Create cells for each row
  const sheetRows: Row[] = rows.map((rowData, rowIndex) => {
    const cells: Cell[] = headers.map((_, colIndex) => ({
      id: createCellId(rowIndex, colIndex),
      value: rowData[colIndex] || '',
      type: 'text'
    }));
    
    return {
      id: `row-${rowIndex}`,
      cells
    };
  });
  
  // Ensure we have at least one row
  if (sheetRows.length === 0) {
    sheetRows.push({
      id: 'row-0',
      cells: headers.map((_, colIndex) => ({
        id: createCellId(0, colIndex),
        value: '',
        type: 'text'
      }))
    });
  }
  
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
        const newSheet: Sheet = {
          id: `sheet-${Date.now()}`,
          name,
          rows: [{
            id: 'row-0',
            cells: Array.from({ length: 26 }, (_, colIndex) => ({
              id: createCellId(0, colIndex),
              value: '',
              type: 'text'
            }))
          }],
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
          rows: sheetToDuplicate.rows.map(row => ({
            ...row,
            id: `row-${Date.now()}-${Math.random()}`,
            cells: row.cells.map(cell => ({
              ...cell,
              id: createCellId(
                parseInt(cell.id.split('-')[1]),
                parseInt(cell.id.split('-')[2])
              )
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
