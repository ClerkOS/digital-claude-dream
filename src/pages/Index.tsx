import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyState } from '@/components/EmptyState';
import { Dashboard } from '@/components/Dashboard';
import { ChatInterface } from '@/components/ChatInterface';
import { ChatSidebar } from '@/components/ChatSidebar';
import { PipelineContainer } from '@/components/pipeline/PipelineContainer';
import { Project } from '@/types/chat';
import { STORAGE_KEYS } from '@/constants';

type AppState = 'empty' | 'dashboard' | 'chat' | 'pipeline';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('empty');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  

  // Load projects from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects);
        setProjects(parsedProjects);
        if (parsedProjects.length > 0 && !activeProjectId) {
          const firstProject = parsedProjects[0];
          setActiveProjectId(firstProject.id);
          // Start with dashboard for existing projects with data, empty state for empty projects
          if (firstProject.files.length > 0 || firstProject.workbookId) {
            setAppState('dashboard');
          } else {
            setAppState('empty');
          }
        }
      } catch (e) {
        console.error('Failed to load projects:', e);
      }
    }
  }, [activeProjectId]);

  // Save projects to localStorage whenever projects change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    }
  }, [projects]);

  const activeProject = projects.find(p => p.id === activeProjectId);

  const handleFileUpload = async (files: any[]) => {
    // Create or update project with uploaded files immediately
    if (!activeProjectId) {
      const newProject: Project = {
        id: `project-${Date.now()}`,
        name: 'New Project',
        timestamp: 'Just now',
        preview: 'New project created',
        messages: [],
        files: files.map(file => ({
          name: file.file.name,
          size: file.file.size,
          type: file.file.type,
          uploadedAt: new Date().toISOString(),
        })),
        lastActivity: 'Just now',
      };

      setProjects(prev => [newProject, ...prev]);
      setActiveProjectId(newProject.id);
    } else {
      setProjects(prev => prev.map(p => 
        p.id === activeProjectId 
          ? {
              ...p,
              files: [...p.files, ...files.map(file => ({
                name: file.file.name,
                size: file.file.size,
                type: file.file.type,
                uploadedAt: new Date().toISOString(),
              }))],
              lastActivity: 'Just now'
            }
          : p
      ));
    }

    // Go directly to pipeline - it will handle showing the processing steps
    setAppState('pipeline');
  };

  const handleConnectSource = () => {
    // Connect source functionality
  };

  const handleNewProject = () => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: 'New Project',
      timestamp: 'Just now',
      preview: 'New project created',
      messages: [],
      files: [],
      lastActivity: 'Just now',
    };

    setProjects(prev => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
    // Route to empty state (old upload center) for new project
    setAppState('empty');
  };

  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    const selectedProject = projects.find(p => p.id === projectId);
    // Route to appropriate state based on project data
    if (selectedProject) {
      if (selectedProject.files.length > 0 || selectedProject.workbookId) {
        setAppState('dashboard');
      } else {
        setAppState('empty');
      }
    }
  };

  const handleRenameProject = (projectId: string, newName: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, name: newName, lastActivity: 'Just now' }
        : p
    ));
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    
    // If we deleted the active project, select another one or go to empty state
    if (activeProjectId === projectId) {
      const remainingProjects = projects.filter(p => p.id !== projectId);
      if (remainingProjects.length > 0) {
        setActiveProjectId(remainingProjects[0].id);
      } else {
        setActiveProjectId('');
        setAppState('empty');
      }
    }
  };

  const handleOpenSpreadsheet = () => {
    setAppState('chat');
  };

  const handleOpenChat = () => {
    setAppState('chat');
  };

  const handleBackToDashboard = () => {
    setAppState('dashboard');
  };

  const handleUploadFiles = () => {
    // Trigger file upload - this would open the file picker
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.csv,.xls,.xlsx';
    input.onchange = (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const filesArray = Array.from(files).map(file => ({ file }));
        handleFileUpload(filesArray);
      }
    };
    input.click();
  };

  return (
    <div className="h-screen w-full flex">
      {/* Sidebar - Show when we have projects */}
      {projects.length > 0 && (
        <ChatSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onNewProject={handleNewProject}
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={handleSelectProject}
          onRenameProject={handleRenameProject}
          onDeleteProject={handleDeleteProject}
        />
      )}

      {/* Main Content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {appState === 'empty' && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <EmptyState
                onFileUpload={handleFileUpload}
                onConnectSource={handleConnectSource}
              />
            </motion.div>
          )}

          {appState === 'pipeline' && (
            <motion.div
              key={`pipeline-${activeProjectId || 'new'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <PipelineContainer
                onComplete={(workbookId) => {
                  // Update the active project with workbookId if it exists
                  if (activeProjectId) {
                    setProjects(prev => prev.map(p => 
                      p.id === activeProjectId 
                        ? { ...p, workbookId, lastActivity: 'Just now' }
                        : p
                    ));
                  } else {
                    // Create new project if none exists
                    const newProject: Project = {
                      id: `project-${Date.now()}`,
                      name: 'New Project',
                      timestamp: 'Just now',
                      preview: 'New project created',
                      messages: [],
                      files: [],
                      workbookId,
                      lastActivity: 'Just now',
                    };
                    setProjects(prev => [newProject, ...prev]);
                    setActiveProjectId(newProject.id);
                  }
                  setAppState('dashboard');
                }}
                onNavigateToDashboard={() => {
                  if (activeProject) {
                    setAppState('dashboard');
                  }
                }}
                onNavigateToRules={() => {
                  if (activeProject) {
                    setAppState('dashboard');
                  }
                }}
              />
            </motion.div>
          )}

          {appState === 'dashboard' && activeProject && (
            activeProject.files.length > 0 || activeProject.workbookId ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full"
              >
                <Dashboard
                  project={activeProject}
                  onOpenSpreadsheet={handleOpenSpreadsheet}
                  onOpenChat={handleOpenChat}
                  onUploadFiles={handleUploadFiles}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty-project"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <EmptyState
                  onFileUpload={handleFileUpload}
                  onConnectSource={handleConnectSource}
                />
              </motion.div>
            )
          )}

          {appState === 'chat' && activeProject && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ChatInterface
                project={activeProject}
                onBackToDashboard={handleBackToDashboard}
                onUpdateProject={(updatedProject) => {
                  setProjects(prev => prev.map(p => 
                    p.id === updatedProject.id ? updatedProject : p
                  ));
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
