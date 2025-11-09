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
    <div className="border-0 rounded-lg bg-background shadow-sm">
      <div className="flex items-center border border-border/50 rounded-lg overflow-hidden">
        {/* Sheet Tabs */}
        <div className="flex-1 flex overflow-x-auto">
          {workbook.sheets.map((sheet) => (
            <button
              key={sheet.id}
              onClick={() => handleSheetClick(sheet.id)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-r border-border/50 transition-colors",
                "hover:bg-muted/30 whitespace-nowrap",
                activeSheetId === sheet.id
                  ? "bg-primary/10 text-primary border-b-2 border-b-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
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
          className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/30 border-l border-border/50 rounded-none"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}