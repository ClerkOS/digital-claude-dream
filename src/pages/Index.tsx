import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EmptyState } from '@/components/EmptyState';
import { Dashboard } from '@/components/Dashboard';
import { SimpleRulesInterface } from '@/components/SimpleRulesInterface';
import { ChatInterface } from '@/components/ChatInterface';
import { ChatSidebar } from '@/components/ChatSidebar';
import { UploadProcessing } from '@/components/UploadProcessing';
import { DataPipelineProgress, PipelineStep } from '@/components/DataPipelineProgress';
import { DetachedSheetsRenderer } from '@/components/SheetTabs';
import { Project } from '@/types/chat';
import { STORAGE_KEYS, UPLOAD_CONFIG } from '@/constants';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useUploadAndAnalyze } from '@/hooks/useUploadAndAnalyze';

type AppState = 'empty' | 'dashboard' | 'chat' | 'uploading' | 'pipeline';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('empty');
  const [projects, setProjects] = useLocalStorage<Project[]>(STORAGE_KEYS.PROJECTS, []);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { sessionId, suggestions, currentStep, uploadAndAnalyze } = useUploadAndAnalyze();

  // Upload processing state
  const [uploadState, setUploadState] = useState<{
    files: Array<{ file: File }>;
    progress: number;
    stage: 'uploading' | 'processing' | 'complete';
    processingMessage: string;
  } | null>(null);

  // Pipeline processing state
  const [pipelineState, setPipelineState] = useState<{
    currentStep: PipelineStep;
    sheetsCount?: number;
    patternsCount?: number;
    rulesCount?: number;
    workbookId?: string;
  } | null>(null);

  // Load active project on mount
  useEffect(() => {
    if (projects.length > 0 && !activeProjectId && appState !== 'uploading' && appState !== 'pipeline') {
      setActiveProjectId(projects[0].id);
      setAppState('dashboard');
    }
  }, [projects, activeProjectId, appState]);

  const activeProject = projects.find(p => p.id === activeProjectId);

  useEffect(() => {
    if (appState === 'pipeline') {
      setPipelineState({ currentStep });
    }
  }, [currentStep, appState]);

  const handleFileUpload = async (files: any[]) => {
    if (files.length === 0) return;

    console.log('Starting file upload for files:', files);
    setUploadState({
      files,
      progress: 0,
      stage: 'uploading',
      processingMessage: ''
    });
    setAppState('uploading');

    const file = files[0]?.file;
    const uploadDuration = UPLOAD_CONFIG.DURATION;
    const progressInterval = UPLOAD_CONFIG.PROGRESS_INTERVAL;
    let currentProgress = 0;

    const uploadTimer = setInterval(async () => {
      currentProgress += (progressInterval / uploadDuration) * 100;

      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(uploadTimer);
        setUploadState(prev => prev ? {
          ...prev,
          progress: 100,
          stage: 'complete'
        } : null);

        // Show pipeline ui
        setUploadState(null);
        setPipelineState({ currentStep: 'creating' });
        setAppState('pipeline');

        // Start upload and analysis
        console.log('Uploading and analyzing file');
        (async () => {
          try {
            const { sessionId: newSessionId, suggestions } = await uploadAndAnalyze(file);
            console.log('Upload and analysis complete. Session ID:', newSessionId, 'Suggestions:', suggestions);

            const fileMetadata = {
              name: file.name,
              size: file.size,
              type: file.type,
              uploadedAt: new Date().toISOString(),
            };

            // Create new project with sessionId
            const newProject: Project = {
              id: `project-${Date.now()}`,
              name: file.name,
              timestamp: new Date().toLocaleString(),
              preview: `Uploaded ${file.name}`,
              messages: [],
              files: [fileMetadata],
              sessionId: newSessionId,
              suggestions: suggestions, // Store suggestions in project
              lastActivity: 'Just now',
            }

            setProjects(prev => [newProject, ...prev]);
            setActiveProjectId(newProject.id);

            // Update pipeline state to show analysis results
            setPipelineState({ currentStep: 'complete' });
            setAppState('dashboard');

          } catch (error) {
            console.error('Upload and analysis error:', error);
            setPipelineState(null);
            setAppState('empty');
          }
        })();

      } else {
        setUploadState(prev => prev ? { ...prev, progress: currentProgress } : null);
      }
    }, progressInterval);
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
      {/* Detached Sheets - Render at app level so they persist when main viewer closes */}
      <DetachedSheetsRenderer />

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
        {appState === 'uploading' && uploadState && (
          <UploadProcessing
            files={uploadState.files}
            progress={uploadState.progress}
            stage={uploadState.stage}
            processingMessage={uploadState.processingMessage}
          />
        )}

        {appState === 'pipeline' && pipelineState && (
          <DataPipelineProgress
            currentStep={pipelineState.currentStep}
            sheetsCount={pipelineState.sheetsCount}
            patternsCount={pipelineState.patternsCount}
            rulesCount={pipelineState.rulesCount}
          />
        )}

        {appState === 'empty' && (
          <EmptyState
            onFileUpload={handleFileUpload}
            onConnectSource={handleConnectSource}
          />
        )}

        {((appState === 'dashboard' && activeProject) || (activeProject && appState !== 'chat')) && (
          activeProject.files.length > 0 || activeProject.sessionId ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full"
            >
              <SimpleRulesInterface
                sessionId={activeProject.sessionId!}
                suggestions={activeProject.suggestions}
              />
            </motion.div>
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
