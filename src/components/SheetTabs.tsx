import { useSpreadsheetStore } from '@/store/spreadsheetStore';
import { Button } from '@/components/ui/button';
import { Plus, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DetachedSheetViewer } from './DetachedSheetViewer';

export function SheetTabs() {
  const { 
    workbook, 
    activeSheetId, 
    setActiveSheet,
    detachedSheets,
    detachSheet
  } = useSpreadsheetStore();

  if (!workbook) return null;

  const handleSheetClick = (sheetId: string) => {
    setActiveSheet(sheetId);
  };

  const handleAddSheet = () => {
    // Add new sheet functionality would go here
  };

  const handleDetachSheet = (e: React.MouseEvent, sheetId: string) => {
    e.stopPropagation();
    detachSheet(sheetId);
  };

  return (
    <div className="border-0 rounded-lg bg-background shadow-sm">
        <div className="flex items-center border border-border/50 rounded-lg overflow-hidden">
          {/* Sheet Tabs */}
          <div className="flex-1 flex overflow-x-auto">
            {workbook.sheets.map((sheet) => {
              const detachedSheet = detachedSheets.get(sheet.id);
              const isDetached = !!detachedSheet;
              return (
                <div
                  key={sheet.id}
                  className={cn(
                    "flex items-center border-r border-border/50 group",
                    activeSheetId === sheet.id && "bg-primary/10"
                  )}
                >
                  <button
                    onClick={() => handleSheetClick(sheet.id)}
                    className={cn(
                      "px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap flex-1",
                      "hover:bg-muted/30",
                      activeSheetId === sheet.id
                        ? "text-primary border-b-2 border-b-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {sheet.name}
                    {isDetached && (
                      <ExternalLink className="inline-block h-3 w-3 ml-1.5 text-primary" />
                    )}
                  </button>
                  <button
                    onClick={(e) => handleDetachSheet(e, sheet.id)}
                    className={cn(
                      "px-2 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors",
                      "opacity-0 group-hover:opacity-100"
                    )}
                    title="Detach sheet"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
          
          {/* Add Sheet Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddSheet}
            className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/30 border-l border-border/50 rounded-none"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
  );
}

// Separate component to render detached sheets globally
export function DetachedSheetsRenderer() {
  const { 
    workbook,
    detachedSheets,
    closeDetachedSheet,
    updateDetachedSheetPosition
  } = useSpreadsheetStore();

  if (!workbook || detachedSheets.size === 0) return null;

  return (
    <>
      {Array.from(detachedSheets.values()).map((detachedSheet) => (
        <DetachedSheetViewer
          key={detachedSheet.sheetId}
          sheetId={detachedSheet.sheetId}
          isOpen={true}
          onClose={() => closeDetachedSheet(detachedSheet.sheetId)}
          position={detachedSheet.position}
          onPositionChange={(newPosition) => updateDetachedSheetPosition(detachedSheet.sheetId, newPosition)}
        />
      ))}
    </>
  );
}