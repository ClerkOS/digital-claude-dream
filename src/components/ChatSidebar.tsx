import { Plus, MessageSquare, X, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Project } from '@/types/chat';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewProject: () => void;
  projects?: Project[];
  activeProjectId?: string;
  onSelectProject?: (id: string) => void;
  onRenameProject?: (id: string, newName: string) => void;
  onDeleteProject?: (id: string) => void;
}

export function ChatSidebar({
  isOpen,
  onToggle,
  onNewProject,
  projects = [],
  activeProjectId,
  onSelectProject,
  onRenameProject,
  onDeleteProject,
}: ChatSidebarProps) {
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleStartEdit = (project: Project) => {
    setEditingProjectId(project.id);
    setEditName(project.name);
  };

  const handleSaveEdit = () => {
    if (editingProjectId && editName.trim() && onRenameProject) {
      onRenameProject(editingProjectId, editName.trim());
    }
    setEditingProjectId(null);
    setEditName('');
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setEditName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <motion.div
        className="fixed left-0 top-0 h-full bg-background/95 backdrop-blur-sm z-50 w-72 flex flex-col lg:relative"
        initial={{ x: "-100%" }}
        animate={{ 
          x: isDesktop ? 0 : (isOpen ? 0 : "-100%"),
        }}
        transition={{ 
          type: "spring", 
          damping: 30, 
          stiffness: 300,
          duration: 0.4
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-foreground rounded-lg flex items-center justify-center">
              <span className="text-background text-sm font-semibold">Z</span>
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">Zigma</h1>
              <p className="text-xs text-muted-foreground">Projects</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="lg:hidden h-8 w-8 p-0 hover:bg-muted/50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* New Project Button */}
        <div className="px-6 pb-4">
          <Button
            onClick={onNewProject}
            className="w-full justify-start h-9 text-sm font-medium bg-primary/5 hover:bg-primary/10 text-primary border-primary/20 hover:border-primary/30"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            New project
          </Button>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto px-3">
          <div className="space-y-1">
            {projects.map((project) => (
              <div
                key={project.id}
                className={cn(
                  "group relative rounded-lg transition-all duration-200",
                  activeProjectId === project.id
                    ? "bg-primary/5 border border-primary/20"
                    : "hover:bg-muted/30"
                )}
              >
                <button
                  onClick={() => onSelectProject?.(project.id)}
                  className="w-full text-left p-3"
                >
                  {editingProjectId === project.id ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={handleSaveEdit}
                      className="w-full bg-transparent border-none outline-none font-medium text-sm"
                      autoFocus
                    />
                  ) : (
                    <>
                      <div className="truncate font-medium text-sm text-foreground mb-1">
                        {project.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {project.lastActivity}
                      </div>
                    </>
                  )}
                </button>
                
                {/* Project Actions */}
                {editingProjectId !== project.id && (
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(project);
                        }}
                        className="h-7 w-7 p-0 hover:bg-muted/50"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject?.(project.id);
                        }}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}