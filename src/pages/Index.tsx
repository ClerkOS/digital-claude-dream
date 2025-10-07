import { useState, useEffect } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { Dashboard } from '@/components/Dashboard';
import { ChatInterface } from '@/components/ChatInterface';
import { ChatSidebar } from '@/components/ChatSidebar';
import { Project } from '@/types/chat';

type AppState = 'empty' | 'dashboard' | 'chat';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('empty');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load projects from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('zigma-projects');
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      setProjects(parsedProjects);
      if (parsedProjects.length > 0) {
        setActiveProjectId(parsedProjects[0].id);
        setAppState('dashboard');
      }
    }
  }, []);

  // Save projects to localStorage whenever projects change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('zigma-projects', JSON.stringify(projects));
    }
  }, [projects]);

  const activeProject = projects.find(p => p.id === activeProjectId);

  const handleFileUpload = async (files: any[]) => {
    console.log('Files uploaded:', files);

    // If no active project, create one
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
      // Add files to existing project
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

    // Transition to dashboard view
    setAppState('dashboard');
  };

  const handleConnectSource = () => {
    console.log('Connect source clicked');
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
    // Don't set appState - let the render logic handle showing EmptyState for empty projects
  };

  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    // Don't set appState - let the render logic handle showing EmptyState for empty projects
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
      {/* Sidebar */}
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
        {appState === 'empty' && (
          <EmptyState
            onFileUpload={handleFileUpload}
            onConnectSource={handleConnectSource}
          />
        )}

        {((appState === 'dashboard' && activeProject) || (activeProject && appState !== 'chat')) && (
          activeProject.files.length > 0 || activeProject.workbookId ? (
            <Dashboard
              project={activeProject}
              onOpenSpreadsheet={handleOpenSpreadsheet}
              onOpenChat={handleOpenChat}
              onUploadFiles={handleUploadFiles}
            />
          ) : (
            <EmptyState
              onFileUpload={handleFileUpload}
              onConnectSource={handleConnectSource}
            />
          )
        )}

        {appState === 'chat' && activeProject && (
          <ChatInterface
            project={activeProject}
            onBackToDashboard={handleBackToDashboard}
            onUpdateProject={(updatedProject) => {
              setProjects(prev => prev.map(p => 
                p.id === updatedProject.id ? updatedProject : p
              ));
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
