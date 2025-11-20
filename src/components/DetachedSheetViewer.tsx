import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpreadsheetStore } from '@/store/spreadsheetStore';
import { SpreadsheetGrid } from './SpreadsheetGrid';
import { FormulaBar } from './FormulaBar';
import { cn } from '@/lib/utils';

interface DetachedSheetViewerProps {
  sheetId: string;
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
}

export function DetachedSheetViewer({ 
  sheetId, 
  isOpen, 
  onClose,
  position = { x: 50, y: 20 },
  onPositionChange
}: DetachedSheetViewerProps) {
  const { workbook, setActiveSheet } = useSpreadsheetStore();
  const [currentPosition, setCurrentPosition] = useState(position);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const headerRef = useRef<HTMLDivElement>(null);
  
  // Don't return null if workbook is missing - detached sheets should persist
  // The workbook data should remain in the store even when main viewer closes
  const sheet = workbook?.sheets.find(s => s.id === sheetId);
  
  if (!sheet || !workbook) {
    // Show a loading/error state instead of hiding
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bg-background border border-border rounded-lg shadow-2xl z-[100] flex flex-col"
            style={{
              left: `${currentPosition.x}px`,
              top: `${currentPosition.y}px`,
              width: '800px',
              height: '600px',
              maxWidth: '90vw',
              maxHeight: '90vh',
            }}
          >
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">Loading sheet data...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Set this sheet as active when detached
  useEffect(() => {
    if (isOpen && sheetId !== workbook.activeSheetId) {
      setActiveSheet(sheetId);
    }
  }, [isOpen, sheetId, workbook.activeSheetId, setActiveSheet]);

  // Update position when prop changes
  useEffect(() => {
    setCurrentPosition(position);
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - currentPosition.x,
      y: e.clientY - currentPosition.y,
    });
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      };
      setCurrentPosition(newPosition);
      if (onPositionChange) {
        onPositionChange(newPosition);
      }
    }
  }, [isDragging, dragOffset, onPositionChange]);

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed bg-background border border-border rounded-lg shadow-2xl z-[100] flex flex-col"
          style={{
            left: `${currentPosition.x}px`,
            top: `${currentPosition.y}px`,
            width: '800px',
            height: '600px',
            maxWidth: '90vw',
            maxHeight: '90vh',
          }}
        >
          {/* Header - Draggable */}
          <div
            ref={headerRef}
            onMouseDown={handleMouseDown}
            className={cn(
              "flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20",
              isDragging ? "cursor-grabbing" : "cursor-move"
            )}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
                <FileSpreadsheet className="w-3 h-3 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{sheet.name}</h3>
                <p className="text-xs text-muted-foreground">Detached sheet</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Formula Bar */}
          <div className="border-b border-border">
            <FormulaBar />
          </div>

          {/* Spreadsheet Grid */}
          <div className="flex-1 overflow-hidden bg-muted/20 p-4">
            <SpreadsheetGrid className="h-full" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

