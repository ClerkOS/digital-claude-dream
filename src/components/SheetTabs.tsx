import { useEffect, useState } from 'react';
import { Plus, X, Edit3, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSpreadsheetStore } from '@/store/spreadsheetStore';
import { listSheets, getSheet } from '@/lib/api/sheets';

interface SheetTabsProps {
  className?: string;
}

export function SheetTabs({ className }: SheetTabsProps) {
  const [editingTab, setEditingTab] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    sheetId: string;
    x: number;
    y: number;
  } | null>(null);
  
  const { 
    workbook, 
    setActiveSheet, 
    addSheet, 
    removeSheet,
    duplicateSheet,
    setWorkbook
  } = useSpreadsheetStore();

  const [backendSheetNames, setBackendSheetNames] = useState<string[]>([]);

  useEffect(() => {
    const fetchSheets = async () => {
      try {
        if (workbook?.id) {
          const names = await listSheets(workbook.id);
          setBackendSheetNames(names);
        } else {
          setBackendSheetNames([]);
        }
      } catch (e) {
        setBackendSheetNames([]);
      }
    };
    fetchSheets();
  }, [workbook?.id]);

  if (!workbook || (backendSheetNames.length === 0 && workbook.sheets.length === 0)) {
    return null;
  }

  const handleTabClick = async (sheetKey: string) => {
    if (editingTab === sheetKey) return;
    // If backend names are available, sheetKey is the name; fetch cells and set store
    if (backendSheetNames.length && workbook?.id) {
      try {
        const data = await getSheet(workbook.id, sheetKey);
        const entries = Object.entries(data.Cells || {});
        const addresses = entries.map(([addr]) => addr);
        const coords = addresses.map(addr => {
          const m = addr.match(/([A-Z]+)(\d+)/);
          if (!m) return { col: 1, row: 1 };
          const colLetters = m[1];
          const row = parseInt(m[2], 10);
          const col = colLetters.split('').reduce((acc, ch) => acc * 26 + (ch.charCodeAt(0) - 64), 0);
          return { col, row };
        });
        const maxCol = Math.max(1, ...coords.map(c => c.col));
        const maxRow = Math.max(1, ...coords.map(c => c.row));
        const rows = Array.from({ length: Math.max(maxRow, 1) }, (_, r) => ({
          id: `row-${r}`,
          cells: Array.from({ length: Math.max(maxCol, 1) }, (_, c) => ({ id: `cell-${r}-${c}`, value: '' }))
        }));
        for (const [addr, cell] of entries) {
          const m = addr.match(/([A-Z]+)(\d+)/);
          if (!m) continue;
          const colLetters = m[1];
          const rowIdx = parseInt(m[2], 10) - 1;
          const colIdx = colLetters.split('').reduce((acc, ch) => acc * 26 + (ch.charCodeAt(0) - 64), 0) - 1;
          if (rows[rowIdx] && rows[rowIdx].cells[colIdx]) {
            rows[rowIdx].cells[colIdx].value = (cell as any).Value ?? '';
          }
        }
        const now = new Date().toISOString();
        const updated = {
          id: workbook.id,
          name: workbook.name,
          sheets: [{ id: 'sheet-1', name: data.Name, rows, createdAt: now, updatedAt: now }],
          activeSheetId: 'sheet-1',
          createdAt: workbook.createdAt,
          updatedAt: now
        } as any;
        setWorkbook(updated);
        setActiveSheet('sheet-1');
      } catch (e) {
        // ignore for now
      }
      return;
    }
    // Fallback to local sheets by id
    setActiveSheet(sheetKey);
  };

  const handleTabDoubleClick = (sheetId: string, currentName: string) => {
    setEditingTab(sheetId);
    setEditName(currentName);
  };

  const handleEditSubmit = () => {
    // In a real implementation, you'd update the sheet name
    setEditingTab(null);
    setEditName('');
  };

  const handleAddSheet = () => {
    const newSheetName = `Sheet ${workbook.sheets.length + 1}`;
    addSheet(newSheetName);
  };

  const handleRemoveSheet = (sheetId: string) => {
    if (workbook.sheets.length > 1) {
      removeSheet(sheetId);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, sheetId: string) => {
    e.preventDefault();
    setContextMenu({
      sheetId,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleDuplicateSheet = (sheetId: string) => {
    duplicateSheet(sheetId);
    setContextMenu(null);
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  return (
    <div className={`flex items-center gap-1 p-3 border-t bg-card ${className}`}>
      <div className="flex items-center gap-1 overflow-x-auto">
        <AnimatePresence>
          {(backendSheetNames.length ? backendSheetNames : workbook.sheets.map(s => s.name)).map((name, index) => {
            const isActive = backendSheetNames.length ? (workbook.sheets[0]?.name === name) : (workbook.activeSheetId === workbook.sheets[index]?.id);
            const sheetIdOrName = backendSheetNames.length ? name : (workbook.sheets[index]?.id || name);
            return (
            <motion.div
              key={name}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              <motion.div
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 min-w-20
                  ${isActive 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'hover:bg-accent hover:text-accent-foreground'
                  }
                `}
                onClick={() => handleTabClick(sheetIdOrName)}
                onDoubleClick={() => handleTabDoubleClick(workbook.sheets[index]?.id || 'sheet-1', name)}
                onContextMenu={(e) => handleContextMenu(e, workbook.sheets[index]?.id || 'sheet-1')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {editingTab === sheet.id ? (
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleEditSubmit(); }}
                    className="flex items-center"
                  >
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={handleEditSubmit}
                      className="w-20 h-6 px-1 text-xs bg-transparent border-0 focus:ring-1 focus:ring-primary-foreground"
                      autoFocus
                    />
                  </form>
                ) : (
                  <>
                    <span className="text-sm font-medium truncate">
                      {name}
                    </span>
                    {(!backendSheetNames.length && workbook.sheets.length > 1) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSheet(workbook.sheets[index]!.id);
                        }}
                        className="w-4 h-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </>
                )}
              </motion.div>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-foreground"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.div>
          );})}
        </AnimatePresence>
      </div>

      {/* Add sheet button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddSheet}
          className="w-8 h-8 p-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </motion.div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={closeContextMenu}
            />
            
            {/* Context Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="fixed z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-32"
              style={{
                left: contextMenu.x,
                top: contextMenu.y,
              }}
            >
              <button
                onClick={() => handleDuplicateSheet(contextMenu.sheetId)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
