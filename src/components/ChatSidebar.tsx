import { Plus, MessageSquare, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewConversation: () => void;
}

export function ChatSidebar({
  isOpen,
  onToggle,
  onNewConversation,
}: ChatSidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full bg-background border-r border-border z-50 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "w-16 flex flex-col items-center py-4"
        )}
      >
        {/* Logo/Brand */}
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-md flex items-center justify-center mb-8">
          <span className="text-white font-bold text-sm">C</span>
        </div>

        {/* Main Actions */}
        <div className="flex flex-col items-center gap-4 flex-1">
          {/* New Conversation Button */}
          <Button
            onClick={onNewConversation}
            size="icon"
            className="w-10 h-10 bg-primary hover:bg-primary/90 text-white rounded-full"
          >
            <Plus className="h-5 w-5" />
          </Button>

          {/* Chat/Conversation Icon (Decorative) */}
          <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted/50 transition-colors cursor-pointer">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col items-center gap-4">
          {/* Settings Icon */}
          <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted/50 transition-colors cursor-pointer">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Account Icon */}
          <div className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted/50 transition-colors cursor-pointer">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </>
  );
}