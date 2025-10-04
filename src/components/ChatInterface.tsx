import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatSidebar } from './ChatSidebar';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { FileViewer } from './FileViewer';
import ExcelViewer from './ExcelViewer';
import { useSpreadsheetStore } from '@/store/spreadsheetStore';
import { cn } from '@/lib/utils';
import { Message, Conversation } from '@/types/chat';

// Simple responses for basic interactions
const simpleResponses = [
  "I'd be happy to help you with your data! Could you provide more details about what you're looking for?",
  "That's a great question. Let me analyze this step by step...",
  "I understand your request. Here's my analysis:",
  "Thanks for sharing that information with me. Based on what you've described, I think the best approach would be:",
  "That's an interesting point. Let me provide you with a comprehensive analysis:",
  "I see what you mean. Here's how I would approach this:",
  "I can help you organize and analyze your data. What specific information are you looking for?",
  "Let me help you with that. I can assist with data analysis, visualization, or answering questions about your data.",
];

const generateResponse = (userMessage: string): string => {
  // Simple response generation based on user input
  if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
    return "Hello! I'm your AI assistant. I can help you analyze and work with your spreadsheet data. How can I assist you today?";
  }
  if (userMessage.toLowerCase().includes('help')) {
    return "I'm here to help you work with your spreadsheet data! I can assist with data analysis, formula generation, and answering questions about your data. What would you like to work on?";
  }
  
  // Random response for other messages
  return simpleResponses[Math.floor(Math.random() * simpleResponses.length)];
};

export function ChatInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
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

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const { refreshWorkbook, workbook } = useSpreadsheetStore();

  // Load workbook data when conversation has a workbookId
  useEffect(() => {
    const loadWorkbookData = async () => {
      if (activeConversation && (activeConversation as any).workbookId && !workbook) {
        console.log('Loading workbook data for:', (activeConversation as any).workbookId);
        await refreshWorkbook((activeConversation as any).workbookId);
      }
    };

    loadWorkbookData();
  }, [activeConversation, workbook, refreshWorkbook]);

  // Removed auto-opening ExcelViewer - user must click "Click to view" button

  // Listen for spreadsheet refresh events
  useEffect(() => {
    const handleRefresh = (event: CustomEvent) => {
      const { workbookId } = event.detail;
      console.log('Received spreadsheet refresh event for workbook:', workbookId);
      refreshWorkbook(workbookId).then(() => {
        // Auto-open ExcelViewer after refresh
        console.log('Auto-opening ExcelViewer after refresh');
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
  }, [activeConversation?.messages, isTyping]);

  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        
        if (file.type.includes('pdf')) {
          resolve(`PDF file uploaded: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB\n\nNote: PDF content extraction would require additional processing.`);
        } else if (file.type.includes('excel') || file.type.includes('spreadsheet') || file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
          // For Excel files, we'll show a preview of the content
          resolve(`Excel file uploaded: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB\n\nNote: Excel content can be viewed in the spreadsheet viewer.`);
        } else {
          resolve(`File uploaded: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB`);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleSendMessage = async (content: string, files?: any[]) => {
    console.log('handleSendMessage called with:', { content, filesCount: files?.length || 0 });
    
    // Create a conversation if none exists
    let currentConversationId = activeConversationId;
    if (!currentConversationId) {
      console.log('No active conversation, creating new one');
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
        timestamp: 'Now',
        preview: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        messages: [],
      };
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversationId(newConversation.id);
      currentConversationId = newConversation.id; // Use the ID directly
      console.log('Created new conversation with ID:', currentConversationId);
    } else {
      console.log('Using existing conversation ID:', currentConversationId);
    }

    // Handle file uploads
    if (files && files.length > 0) {
      for (const fileData of files) {
        const file = fileData.file;
        const fileContent = await readFileContent(file);
        
        // Create a file message
        const fileMessage: Message = {
          id: Date.now().toString() + '_file',
          content: `📎 **${file.name}** (${file.type.includes('pdf') ? 'PDF' : 'Excel'})\n\n${fileContent}`,
          role: 'user',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        // Add file message
        setConversations(prev => prev.map(conv => 
          conv.id === currentConversationId 
            ? { 
                ...conv, 
                messages: [...conv.messages, fileMessage],
                preview: `📎 ${file.name}`,
                timestamp: 'Just now'
              }
            : conv
        ));
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Add user message
    console.log('Adding user message:', userMessage);
    setConversations(prev => {
      const updated = prev.map(conv => 
        conv.id === currentConversationId 
        ? { 
            ...conv, 
            messages: [...conv.messages, userMessage],
            preview: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
            timestamp: 'Just now'
          }
        : conv
      );
      console.log('Updated conversations:', updated.length, 'conversations');
      return updated;
    });

    // Show typing indicator
    setIsTyping(true);

    try {
      // For simple greetings and basic questions, use local responses
      // For spreadsheet operations, use the AI planning system
      const isSpreadsheetOperation = content.toLowerCase().includes('create') || 
                                   content.toLowerCase().includes('add') ||
                                   content.toLowerCase().includes('sheet') ||
                                   content.toLowerCase().includes('table') ||
                                   content.toLowerCase().includes('data') ||
                                   content.toLowerCase().includes('ledger');

      let responseContent = generateResponse(content);

      if (isSpreadsheetOperation) {
        // Create a workbook if conversation doesn't have one
        let convo = (conversations.find(c => c.id === currentConversationId) as any) || {};
        let workbookIdForConvo: string | undefined = convo.workbookId;
        
        if (!workbookIdForConvo) {
          // Create a new workbook
          const created = await (await import('@/lib/api/workbook')).createWorkbook();
          workbookIdForConvo = created.workbook_id;
          setConversations(prev => prev.map(c => c.id === currentConversationId ? { ...c, workbookId: workbookIdForConvo } : c));
        }

        // Use the first sheet for now
        const sheetName = "Sheet1";

        // Get context from the sheet
        const context = await (await import('@/lib/api/langgraph')).getSheetContext(
          workbookIdForConvo, 
          sheetName, 
          content
        );

        // Create an agent plan
        const plan = await (await import('@/lib/api/langgraph')).createAgentPlan(
          workbookIdForConvo,
          sheetName,
          content,
          context
        );

        console.log('Plan received from API:', plan);

        // Execute the plan if it has steps
        if (plan && plan.steps && plan.steps.length > 0) {
          console.log('Executing plan with steps:', plan.steps);
          const executionResults = await (await import('@/lib/api/langgraph')).executePlan(
            workbookIdForConvo,
            plan
          );

          console.log('Plan execution results:', executionResults);

          // Build response based on execution results
          const successfulSteps = executionResults.filter(r => r.success);
          const failedSteps = executionResults.filter(r => !r.success);

          if (successfulSteps.length > 0) {
            responseContent = `✅ Successfully executed ${successfulSteps.length} step(s):\n`;
            successfulSteps.forEach((result, index) => {
              responseContent += `${index + 1}. ${result.step.description}\n`;
            });

            if (failedSteps.length > 0) {
              responseContent += `\n⚠️ ${failedSteps.length} step(s) failed:\n`;
              failedSteps.forEach((result, index) => {
                responseContent += `${index + 1}. ${result.step.description}: ${result.error}\n`;
              });
            }

            responseContent += `\n📊 **Click to view** your updated spreadsheet!`;

            // Trigger spreadsheet refresh
    setTimeout(() => {
              window.dispatchEvent(new CustomEvent('spreadsheet-refresh', { 
                detail: { workbookId: workbookIdForConvo } 
              }));
            }, 1000);
          } else {
            responseContent = `❌ Plan execution failed. ${generateResponse(content)}`;
          }
        } else if (plan && plan.goal) {
          responseContent = `I understand you want to: ${plan.goal}. ${generateResponse(content)}`;
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Add assistant response
      setConversations(prev => prev.map(conv => 
        conv.id === currentConversationId 
          ? { ...conv, messages: [...conv.messages, assistantMessage] }
          : conv
      ));

    } catch (error) {
      console.error('Error calling AI API:', error);
      
      // Fallback to local response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Error: ${error.message}. ${generateResponse(content)}`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setConversations(prev => prev.map(conv => 
        conv.id === currentConversationId 
          ? { ...conv, messages: [...conv.messages, assistantMessage] }
          : conv
      ));
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New conversation',
      timestamp: 'Now',
      preview: 'Start a new conversation...',
      messages: [],
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setSidebarOpen(false);
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

  const handleViewSpreadsheet = () => {
    setExcelViewerOpen(true);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-background relative">
      <ChatSidebar
        isOpen={sidebarOpen && !excelViewerOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewConversation={handleNewConversation}
      />

      {/* Main Chat Area */}
      <motion.div 
        className="flex-1 flex flex-col transition-all duration-300"
        animate={{
          width: excelViewerOpen ? "50%" : "100%"
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        {/* Header */}
        <div className="border-b border-border p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">Z</span>
              </div>
              <div>
                <h1 className="font-semibold text-foreground">Zigma</h1>
                <p className="text-xs text-muted-foreground">AI for Accounting</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className={`max-w-4xl mx-auto py-6 transition-all duration-300 ${
            excelViewerOpen 
              ? 'px-12 lg:px-16' // Much more padding when Excel viewer is open
              : 'px-8 lg:px-12'  // More padding when closed
          }`}>
            {!activeConversation?.messages.length ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-xl">Z</span>
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Hello! I'm Zigma.
                </h2>
                <p className="text-muted-foreground max-w-md">
                  I'm your AI accounting assistant. I can help you with transaction processing, ledger management, audit checks, financial statements, and more. How can I assist with your accounting needs today?
                </p>
              </div>
            ) : (
              <>
                {activeConversation.messages.map((message) => (
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
                  <div className="flex justify-start mb-6">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white font-bold text-xs">L</span>
                      </div>
                      <div className="bg-card border border-border rounded-2xl rounded-tl-md px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
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
          workbookId={activeConversation ? (activeConversation as any).workbookId : undefined}
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