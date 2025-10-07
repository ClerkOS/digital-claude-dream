import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatSidebar } from './ChatSidebar';
import { FileViewer } from './FileViewer';
import ExcelViewer from './ExcelViewer';
import { useSpreadsheetStore } from '@/store/spreadsheetStore';
import { cn } from '@/lib/utils';
import { Message, Project } from '@/types/chat';

interface ChatInterfaceProps {
  project: Project;
  onBackToDashboard?: () => void;
  onUpdateProject?: (project: Project) => void;
}

// Simple responses for basic interactions
const simpleResponses = [
  "I'd be happy to help you with your data! Could you provide more details about what you're looking for?",
  "That's a great question. Let me analyze this step by step...",
  "I understand your request. Here's my analysis:",
  "Thanks for sharing that information with me. Based on what you've described, I think the best approach would be:",
  "That's an interesting point. Let me provide you with a comprehensive analysis:",
  "I'm here to assist you with your spreadsheet tasks. What can I do for you today?",
  "Tell me more about what you're trying to achieve with your spreadsheet data.",
  "I'm ready to help you organize, analyze, or manipulate your data. Just let me know!",
];

const generateResponse = (input: string): string => {
  const lowerInput = input.toLowerCase();
  if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
    return "Hello there! How can I assist you with your spreadsheet today?";
  }
  if (lowerInput.includes('thank you') || lowerInput.includes('thanks')) {
    return "You're welcome! Let me know if you need anything else.";
  }
  return simpleResponses[Math.floor(Math.random() * simpleResponses.length)];
};

export function ChatInterface({ project, onBackToDashboard, onUpdateProject }: ChatInterfaceProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [excelViewerOpen, setExcelViewerOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<{
    name: string;
    content: string;
    type: 'text' | 'code' | 'image' | 'markdown';
    language?: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { refreshWorkbook, workbook } = useSpreadsheetStore();

  // Load workbook data when project has a workbookId
  useEffect(() => {
    const loadWorkbookData = async () => {
      if (project.workbookId && !workbook) {
        await refreshWorkbook(project.workbookId);
      }
    };

    loadWorkbookData();
  }, [project.workbookId, workbook, refreshWorkbook]);

  // Listen for spreadsheet refresh events
  useEffect(() => {
    const handleRefresh = (event: CustomEvent) => {
      const { workbookId } = event.detail;
      refreshWorkbook(workbookId).then(() => {
        // Auto-open ExcelViewer after refresh
        setTimeout(() => {
          setExcelViewerOpen(true);
        }, 1000);
      });
    };

    window.addEventListener('spreadsheet-refresh', handleRefresh as EventListener);
    return () => {
      window.removeEventListener('spreadsheet-refresh', handleRefresh as EventListener);
    };
  }, [refreshWorkbook]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [project.messages]);

  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleViewFile = (file: { name: string; content: string; type: 'text' | 'code' | 'image' | 'markdown'; language?: string; }) => {
    setCurrentFile(file);
    
    // Determine if this is an Excel/CSV file
    const isExcelFile = file.language === 'csv' || 
                       file.language === 'excel' || 
                       (file.content.includes(',') && file.content.split('\n').length > 1 && 
                        file.content.split('\n')[0].split(',').length > 1);
    
    if (isExcelFile) {
      setExcelViewerOpen(true);
      setSidebarOpen(false); // Close left sidebar when opening Excel viewer
    } else {
    setFileViewerOpen(true);
    }
  };

  const handleCloseExcelViewer = () => {
    setExcelViewerOpen(false);
    setSidebarOpen(true); // Reopen left sidebar when closing Excel viewer
  };

  const handleNewConversation = () => {
    // Create a new project/conversation
    const newProject: Project = {
      id: Date.now().toString(),
      name: 'New Project',
      timestamp: new Date().toISOString(),
      lastActivity: 'Just now',
      messages: []
    };
    
    if (onUpdateProject) {
      onUpdateProject(newProject);
    }
  };

  const handleViewSpreadsheet = () => {
    setExcelViewerOpen(true);
    setSidebarOpen(false);
  };

  const updateProject = (updatedProject: Project) => {
    if (onUpdateProject) {
      onUpdateProject(updatedProject);
    }
  };

  const handleSendMessage = async (content: string, files?: any[]) => {
    // Handle file uploads - IMPORT TO BACKEND
    if (files && files.length > 0) {
      for (const fileData of files) {
        const file = fileData.file;
        const fileContent = await readFileContent(file);

        try {
          // Import the file to the backend
          const importResult = await (await import('@/lib/api/workbook')).importWorkbook(file, project.workbookId || '');

          // Create a file message with import success
          const fileMessage: Message = {
            id: Date.now().toString() + '_file',
            content: `📎 **${file.name}** imported successfully!\n\nSheets: ${importResult.sheets.join(', ')}`,
            role: 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          // Add file message to project
          const updatedProject = {
            ...project,
            messages: [...project.messages, fileMessage],
            files: [...project.files, {
              name: file.name,
              size: file.size,
              type: file.type,
              uploadedAt: new Date().toISOString(),
            }],
            lastActivity: 'Just now'
          };

          updateProject(updatedProject);
        } catch (error) {
          // Create a file message with error
          const fileMessage: Message = {
            id: Date.now().toString() + '_file',
            content: `❌ **${file.name}** import failed: ${error.message}`,
            role: 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          // Add error message to project
          const updatedProject = {
            ...project,
            messages: [...project.messages, fileMessage],
            lastActivity: 'Just now'
          };

          updateProject(updatedProject);
        }
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Add user message to project
    const projectWithUserMessage = {
      ...project,
      messages: [...project.messages, userMessage],
      lastActivity: 'Just now'
    };

    updateProject(projectWithUserMessage);

    setIsTyping(true);

    try {
      const isSpreadsheetOperation = content.toLowerCase().includes('create') ||
                                   content.toLowerCase().includes('add') ||
                                   content.toLowerCase().includes('sheet') ||
                                   content.toLowerCase().includes('table') ||
                                   content.toLowerCase().includes('data') ||
                                   content.toLowerCase().includes('ledger') ||
                                   content.toLowerCase().includes('analyze');

      let responseContent = generateResponse(content);
      let workbookIdForConvo = project.workbookId;

      if (isSpreadsheetOperation) {
        // Use the project's workbookId, or create one if needed
        if (!workbookIdForConvo) {
          const created = await (await import('@/lib/api/workbook')).createWorkbook();
          workbookIdForConvo = created.workbook_id;
          
          // Update project with new workbookId
          const projectWithWorkbook = {
            ...projectWithUserMessage,
            workbookId: workbookIdForConvo
          };
          updateProject(projectWithWorkbook);
        }

        const sheetName = "Sheet1";

        const result = await (await import('@/lib/api/langgraph')).executeAgent(
          workbookIdForConvo,
          content,
          sheetName
        );

        if (result && result.plan && result.execution_result) {
          const plan = result.plan;

          responseContent = `✅ Successfully executed: ${plan.goal}\n\n`;

          if (plan.steps && plan.steps.length > 0) {
            plan.steps.forEach((step, index) => {
              responseContent += `${index + 1}. ${step.description}\n`;
            });
          }

          responseContent += `\n📊 **Click to view** your updated spreadsheet!`;

          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('spreadsheet-refresh', {
              detail: { workbookId: workbookIdForConvo }
            }));
          }, 1000);
        } else if (result && result.plan && result.plan.goal) {
          responseContent = `I understand you want to: ${result.plan.goal}. ${generateResponse(content)}`;
        } else {
          responseContent = `❌ Agent execution failed. ${generateResponse(content)}`;
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Add assistant message to project
      const finalProject = {
        ...projectWithUserMessage,
        messages: [...projectWithUserMessage.messages, assistantMessage],
        lastActivity: 'Just now'
      };

      updateProject(finalProject);

    } catch (error) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Error: ${error.message}. ${generateResponse(content)}`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      // Add error message to project
      const projectWithError = {
        ...projectWithUserMessage,
        messages: [...projectWithUserMessage.messages, assistantMessage],
        lastActivity: 'Just now'
      };

      updateProject(projectWithError);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-background relative">
      {/* Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewProject={handleNewConversation}
        projects={[]}
        activeProjectId={project.id}
        onSelectProject={() => {}}
        onRenameProject={() => {}}
        onDeleteProject={() => {}}
      />

      {/* Main Chat Area */}
      <motion.div 
        className="flex-1 flex flex-col"
        animate={{
          width: excelViewerOpen ? "50%" : "100%"
        }}
        transition={{ 
          type: "spring", 
          damping: 30, 
          stiffness: 300,
          duration: 0.4
        }}
      >
        {/* Clean Header */}
        <div className="px-6 py-4 bg-background/95 backdrop-blur-sm border-b border-border/30">
          <div className="flex items-center gap-4">
            {onBackToDashboard && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToDashboard}
                className="h-8 w-8 p-0 hover:bg-muted/50"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden h-8 w-8 p-0 hover:bg-muted/50"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                <span className="text-background text-sm font-semibold">Z</span>
              </div>
              <div>
                <h1 className="text-base font-semibold text-foreground">{project.name}</h1>
                <p className="text-xs text-muted-foreground">AI-powered accounting assistant</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <motion.div 
            className="max-w-4xl mx-auto"
            animate={{
              paddingLeft: excelViewerOpen ? '2rem' : '1.5rem',
              paddingRight: excelViewerOpen ? '2rem' : '1.5rem'
            }}
            transition={{ 
              type: "spring", 
              damping: 30, 
              stiffness: 300,
              duration: 0.4
            }}
          >
            {!project.messages.length ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-primary text-lg font-semibold">Z</span>
                </div>
                <h2 className="text-xl font-semibold mb-3 text-foreground">
                  Welcome to Zigma
                </h2>
                <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                  Your AI-powered accounting assistant. Upload financial data, ask questions, and get intelligent insights.
                </p>
              </div>
            ) : (
              <div className="py-6 space-y-6">
                {project.messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    content={message.content}
                    role={message.role}
                    timestamp={message.timestamp}
                    onViewFile={handleViewFile}
                    onViewSpreadsheet={handleViewSpreadsheet}
                  />
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-sm font-semibold">Z</span>
                    </div>
                    <div className="bg-muted/50 rounded-xl px-4 py-3">
                      <div className="flex gap-1.5">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </motion.div>
        </div>

        {/* Input Area */}
        <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
      </motion.div>

      {/* Excel Viewer - Part of flex layout */}
      {excelViewerOpen && (
        <ExcelViewer
          isOpen={excelViewerOpen}
          onClose={handleCloseExcelViewer}
          file={currentFile}
          workbookId={project.workbookId}
        />
      )}

      {/* File Viewer */}
      <FileViewer
        isOpen={fileViewerOpen}
        onClose={() => setFileViewerOpen(false)}
        file={currentFile}
      />
    </div>
  );
}