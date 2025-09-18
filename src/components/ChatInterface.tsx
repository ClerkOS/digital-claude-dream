import { useState, useRef, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatSidebar } from './ChatSidebar';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { FileViewer } from './FileViewer';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  preview: string;
  messages: Message[];
}

// Mock responses from Claude
const mockResponses = [
  "I'd be happy to help you with that! Could you provide more details about what you're looking for?",
  "That's a great question. Let me think through this step by step...",
  "I understand what you're asking. Here's my perspective on this topic:",
  "Thanks for sharing that with me. Based on what you've described, I think the best approach would be:",
  "That's an interesting point. Let me provide you with a comprehensive answer:",
  "I see what you mean. Here's how I would approach this problem:",
  "Here's a simple React component example:\n\n```tsx\nimport React from 'react';\n\nconst MyComponent = () => {\n  return (\n    <div className=\"p-4\">\n      <h1>Hello World!</h1>\n      <p>This is a sample component.</p>\n    </div>\n  );\n};\n\nexport default MyComponent;\n```\n\nThis component demonstrates basic JSX structure with Tailwind CSS classes.",
  "I can help you with that! Here's a Python function:\n\n```python\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\n# Example usage\nfor i in range(10):\n    print(f\"fib({i}) = {fibonacci(i)}\")\n```",
];

const generateResponse = (userMessage: string): string => {
  // Simple response generation based on user input
  if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
    return "Hello! I'm Claude, an AI assistant created by Anthropic. How can I help you today?";
  }
  if (userMessage.toLowerCase().includes('help')) {
    return "I'm here to help! I can assist with a wide variety of tasks including writing, analysis, math, coding, creative projects, and answering questions. What would you like to work on?";
  }
  if (userMessage.toLowerCase().includes('code') || userMessage.toLowerCase().includes('programming')) {
    return mockResponses[6]; // Return the code example
  }
  if (userMessage.toLowerCase().includes('python')) {
    return mockResponses[7]; // Return the Python example
  }
  if (userMessage.toLowerCase().includes('react') || userMessage.toLowerCase().includes('component')) {
    return mockResponses[6]; // Return the React example
  }
  
  // Random response for other messages
  return mockResponses[Math.floor(Math.random() * mockResponses.length)];
};

export function ChatInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'Getting Started with Claude',
      timestamp: '2 hours ago',
      preview: 'Hello! I\'m Claude, an AI assistant...',
      messages: [
        {
          id: '1',
          content: 'Hello! Can you help me understand what you can do?',
          role: 'user',
          timestamp: '2:30 PM',
        },
        {
          id: '2',
          content: "Hello! I'm Claude, an AI assistant created by Anthropic. I can help you with a wide variety of tasks including:\n\n• Writing and editing\n• Research and analysis\n• Math and coding\n• Creative projects\n• Answering questions\n• Problem-solving\n\nWhat would you like to work on today?",
          role: 'assistant',
          timestamp: '2:30 PM',
        },
      ],
    },
    {
      id: '2',
      title: 'Python Programming Help',
      timestamp: 'Yesterday',
      preview: 'I can help you with Python! What specific...',
      messages: [
        {
          id: '3',
          content: 'Can you help me with Python programming?',
          role: 'user',
          timestamp: 'Yesterday 4:15 PM',
        },
        {
          id: '4',
          content: "I can definitely help you with Python programming! I can assist with:\n\n• Writing and debugging code\n• Explaining concepts and syntax\n• Code optimization\n• Libraries and frameworks\n• Best practices\n\nWhat specific Python topic or problem would you like help with?",
          role: 'assistant',
          timestamp: 'Yesterday 4:15 PM',
        },
      ],
    },
  ]);
  const [activeConversationId, setActiveConversationId] = useState<string>('1');
  const [isTyping, setIsTyping] = useState(false);
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<{
    name: string;
    content: string;
    type: 'text' | 'code' | 'image' | 'markdown';
    language?: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, isTyping]);

  const handleSendMessage = async (content: string) => {
    if (!activeConversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Add user message
    setConversations(prev => prev.map(conv => 
      conv.id === activeConversationId 
        ? { 
            ...conv, 
            messages: [...conv.messages, userMessage],
            preview: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
            timestamp: 'Just now'
          }
        : conv
    ));

    // Show typing indicator
    setIsTyping(true);

    // Simulate API delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateResponse(content),
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Add assistant response
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversationId 
          ? { ...conv, messages: [...conv.messages, assistantMessage] }
          : conv
      ));

      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
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
    setFileViewerOpen(true);
  };

  return (
    <div className="flex h-screen bg-background relative">
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => {
          setActiveConversationId(id);
          setSidebarOpen(false);
        }}
        onNewConversation={handleNewConversation}
      />

      {/* Main Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        fileViewerOpen ? "mr-0 lg:mr-[50%] xl:mr-[40%]" : ""
      )}>
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
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <div>
                <h1 className="font-semibold text-foreground">Claude</h1>
                <p className="text-xs text-muted-foreground">AI Assistant</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {!activeConversation?.messages.length ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Hello! I'm Claude.
                </h2>
                <p className="text-muted-foreground max-w-md">
                  I'm an AI assistant created by Anthropic. I can help you with writing, analysis, math, coding, creative projects, and more. How can I assist you today?
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
                  />
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start mb-6">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white font-bold text-xs">C</span>
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
      </div>

      {/* File Viewer */}
      <FileViewer
        isOpen={fileViewerOpen}
        onClose={() => setFileViewerOpen(false)}
        file={currentFile}
      />
    </div>
  );
}