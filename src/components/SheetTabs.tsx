import { useState } from 'react';
import { Plus, X, Edit3, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSpreadsheetStore } from '@/store/spreadsheetStore';

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
    duplicateSheet
  } = useSpreadsheetStore();

  if (!workbook || workbook.sheets.length === 0) {
    return null;
  }

  const handleTabClick = (sheetId: string) => {
    if (editingTab !== sheetId) {
      setActiveSheet(sheetId);
    }
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
          {workbook.sheets.map((sheet, index) => (
            <motion.div
              key={sheet.id}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              <motion.div
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 min-w-20
                  ${workbook.activeSheetId === sheet.id 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'hover:bg-accent hover:text-accent-foreground'
                  }
                `}
                onClick={() => handleTabClick(sheet.id)}
                onDoubleClick={() => handleTabDoubleClick(sheet.id, sheet.name)}
                onContextMenu={(e) => handleContextMenu(e, sheet.id)}
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
                      {sheet.name}
                    </span>
                    {workbook.sheets.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSheet(sheet.id);
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
              {workbook.activeSheetId === sheet.id && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-foreground"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.div>
          ))}
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
