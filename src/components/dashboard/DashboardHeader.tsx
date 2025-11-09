import { FileSpreadsheet, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  projectName: string;
  onOpenRules: () => void;
  onToggleSpreadsheet: () => void;
}

export function DashboardHeader({ projectName, onOpenRules, onToggleSpreadsheet }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-8 py-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-1">{projectName}</h1>
        <p className="text-sm text-muted-foreground">Financial overview and insights</p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenRules}
          className="h-9 px-3 text-xs font-medium hover:bg-primary/5 hover:border-primary/30"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Rules
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleSpreadsheet}
          className="h-9 px-3 text-xs font-medium hover:bg-primary/5 hover:border-primary/30"
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Sheet
        </Button>
      </div>
    </div>
  );
}

