import { useSpreadsheetStore } from '@/store/spreadsheetStore';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SheetTabs() {
  const { workbook, activeSheetId, setActiveSheet } = useSpreadsheetStore();

  if (!workbook) return null;

  const handleSheetClick = (sheetId: string) => {
    setActiveSheet(sheetId);
  };

  const handleAddSheet = () => {
    // Add new sheet functionality would go here
  };

  return (
    <div className="border-t border-border/50 bg-muted/30">
      <div className="flex items-center">
        {/* Sheet Tabs */}
        <div className="flex-1 flex overflow-x-auto">
          {workbook.sheets.map((sheet) => (
            <button
              key={sheet.id}
              onClick={() => handleSheetClick(sheet.id)}
              className={cn(
                "px-3 py-2 text-sm font-medium border-r border-border/50 transition-colors",
                "hover:bg-muted/50 whitespace-nowrap",
                activeSheetId === sheet.id
                  ? "bg-background text-foreground border-b-2 border-b-foreground"
                  : "text-muted-foreground"
              )}
            >
              {sheet.name}
            </button>
          ))}
        </div>
        
        {/* Add Sheet Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddSheet}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}