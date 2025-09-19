import { useState, useRef, useEffect } from 'react';
// import { Menu } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { ChatSidebar } from './ChatSidebar';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { FileViewer } from './FileViewer';
import ExcelViewer from './ExcelViewer';
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

// Mock responses from Clerk
const mockResponses = [
  "I'd be happy to help you with your accounting needs! Could you provide more details about what you're looking for?",
  "That's a great accounting question. Let me analyze this step by step...",
  "I understand your accounting concern. Here's my analysis of this financial matter:",
  "Thanks for sharing that financial data with me. Based on what you've described, I think the best accounting approach would be:",
  "That's an interesting accounting point. Let me provide you with a comprehensive financial analysis:",
  "I see what you mean from an accounting perspective. Here's how I would approach this financial problem:",
  "I can help you organize your transactions and generate the appropriate journal entries. What specific accounts are involved?",
  "Let me help you with that accounting task. I can assist with transaction categorization, ledger management, or financial statement preparation.",
];

const generateResponse = (userMessage: string): string => {
  // Simple response generation based on user input
  if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
    return "Hello! I'm Clerk, your AI accounting assistant. I can help you with transaction processing, ledger management, audit checks, and financial statements. How can I assist with your accounting needs today?";
  }
  if (userMessage.toLowerCase().includes('help')) {
    return "I'm here to help with your accounting needs! I can assist with transaction organization, journal entry generation, audit checks, financial statement preparation, and anomaly detection. What accounting task would you like to work on?";
  }
  if (userMessage.toLowerCase().includes('profit loss') || userMessage.toLowerCase().includes('p&l') || userMessage.toLowerCase().includes('income statement')) {
    return "I'll create a Profit & Loss statement for you. Here's a comprehensive P&L report:\n\n```csv\nAccount,Current Month,Previous Month,Year to Date\nRevenue,125000,118000,1450000\nCost of Goods Sold,45000,42000,520000\nGross Profit,80000,76000,930000\nOperating Expenses,35000,33000,410000\n  - Salaries,20000,19000,230000\n  - Rent,5000,5000,60000\n  - Utilities,2000,1800,22000\n  - Marketing,3000,2800,35000\n  - Other,5000,4400,63000\nOperating Income,45000,43000,520000\nInterest Expense,1000,1200,14000\nIncome Before Tax,44000,41800,506000\nIncome Tax,13200,12540,151800\nNet Income,30800,29260,354200\n```\n\nThis P&L statement shows your financial performance with month-over-month and year-to-date comparisons. Click 'View' to see the full spreadsheet!";
  }
  if (userMessage.toLowerCase().includes('journal entry') || userMessage.toLowerCase().includes('ledger')) {
    return "I'll create a journal entry log for you. Here's a sample of recent journal entries:\n\n```csv\nDate,Entry #,Account,Description,Debit,Credit\n2024-01-15,JE-001,Cash,Initial Investment,50000,0\n2024-01-15,JE-001,Capital,Initial Investment,0,50000\n2024-01-16,JE-002,Equipment,Office Equipment Purchase,0,15000\n2024-01-16,JE-002,Cash,Office Equipment Purchase,15000,0\n2024-01-17,JE-003,Accounts Receivable,Sale to Customer A,0,2500\n2024-01-17,JE-003,Revenue,Sale Revenue,0,2500\n2024-01-18,JE-004,Office Supplies,Stationery Purchase,0,500\n2024-01-18,JE-004,Cash,Stationery Purchase,500,0\n2024-01-19,JE-005,Utilities,Electricity Bill,0,800\n2024-01-19,JE-005,Accounts Payable,Electricity Bill,800,0\n2024-01-20,JE-006,Cash,Customer Payment,1800,0\n2024-01-20,JE-006,Accounts Receivable,Customer Payment,0,1800\n```\n\nThis journal entry log shows proper double-entry bookkeeping with balanced debits and credits. Click 'View' to see the full ledger!";
  }
  if (userMessage.toLowerCase().includes('audit') || userMessage.toLowerCase().includes('check')) {
    return "I'll create an audit findings report for you. Here's a sample audit checklist with findings:\n\n```csv\nAudit Area,Item,Status,Issue,Recommendation,Priority\nCash,Reconcile Bank Statement,FAIL,Discrepancy of $250,Reconcile immediately,High\nAccounts Receivable,Aging Report,FAIL,Overdue accounts >90 days,Follow up with customers,Medium\nInventory,Physical Count,FAIL,Missing items worth $500,Implement better controls,High\nPayroll,Time Sheets,FAIL,Missing signatures,Require supervisor approval,Medium\nExpenses,Receipts,FAIL,Missing receipts for $1200,Implement expense policy,High\nRevenue,Invoice Matching,FAIL,Unmatched invoices,Review and reconcile,Medium\nFixed Assets,Depreciation,FAIL,Incorrect calculations,Recalculate depreciation,Low\nTaxes,Quarterly Returns,FAIL,Missing Q3 return,File immediately,High\n```\n\nThis audit report identifies issues and provides actionable recommendations. Click 'View' to see the full audit findings!";
  }
  if (userMessage.toLowerCase().includes('excel') || userMessage.toLowerCase().includes('csv') || userMessage.toLowerCase().includes('spreadsheet')) {
    return "I'll create a sample Excel/CSV file for you with accounting data. Here's a transaction log that you can use for testing:\n\n```csv\nDate,Account,Description,Debit,Credit,Balance\n2024-01-01,Cash,Initial Investment,10000,0,10000\n2024-01-02,Equipment,Office Equipment Purchase,0,2500,7500\n2024-01-03,Accounts Receivable,Sale to Customer A,0,1500,9000\n2024-01-04,Revenue,Sale Revenue,0,1500,10500\n2024-01-05,Office Supplies,Stationery Purchase,0,200,10300\n2024-01-06,Utilities,Electricity Bill,0,300,10000\n2024-01-07,Accounts Payable,Supplier Invoice,0,800,9200\n2024-01-08,Cash,Customer Payment,1200,0,10400\n2024-01-09,Salaries,Employee Salary,0,2000,8400\n2024-01-10,Revenue,Service Revenue,0,2500,10900\n2024-01-11,Rent,Office Rent,0,1500,9400\n2024-01-12,Insurance,Business Insurance,0,400,9000\n2024-01-13,Marketing,Advertising Campaign,0,600,8400\n2024-01-14,Accounts Receivable,Sale to Customer B,0,2000,10400\n2024-01-15,Revenue,Sale Revenue,0,2000,12400\n```\n\nThis CSV file contains sample accounting transactions with proper debit/credit entries. Click 'View' to see the spreadsheet interface!";
  }
  if (userMessage.toLowerCase().includes('balance sheet') || userMessage.toLowerCase().includes('balance')) {
    return "I'll create a Balance Sheet for you. Here's a comprehensive balance sheet report:\n\n```csv\nAccount,Current Period,Previous Period\nASSETS\nCurrent Assets,,\n  Cash,45000,38000\n  Accounts Receivable,25000,22000\n  Inventory,15000,18000\n  Prepaid Expenses,5000,4000\nTotal Current Assets,90000,82000\nFixed Assets,,\n  Equipment,50000,48000\n  Less: Accumulated Depreciation,-15000,-12000\n  Net Equipment,35000,36000\n  Building,200000,200000\n  Less: Accumulated Depreciation,-40000,-35000\n  Net Building,160000,165000\nTotal Fixed Assets,195000,201000\nTotal Assets,285000,283000\nLIABILITIES\nCurrent Liabilities,,\n  Accounts Payable,12000,15000\n  Accrued Expenses,8000,7000\n  Short-term Debt,10000,12000\nTotal Current Liabilities,30000,34000\nLong-term Liabilities,,\n  Long-term Debt,80000,85000\n  Deferred Tax Liability,5000,4000\nTotal Long-term Liabilities,85000,89000\nTotal Liabilities,115000,123000\nEQUITY\n  Capital Stock,100000,100000\n  Retained Earnings,70000,60000\nTotal Equity,170000,160000\nTotal Liabilities & Equity,285000,283000\n```\n\nThis balance sheet shows your company's financial position with assets, liabilities, and equity. Click 'View' to see the full spreadsheet!";
  }
  if (userMessage.toLowerCase().includes('cash flow') || userMessage.toLowerCase().includes('cashflow')) {
    return "I'll create a Cash Flow Statement for you. Here's a comprehensive cash flow report:\n\n```csv\nCash Flow Category,Current Month,Previous Month,Year to Date\nOPERATING ACTIVITIES,,\n  Net Income,30800,29260,354200\n  Depreciation,5000,5000,60000\n  Accounts Receivable Change,-3000,2000,-15000\n  Inventory Change,3000,-2000,8000\n  Accounts Payable Change,-3000,1000,-5000\n  Accrued Expenses Change,1000,-500,2000\nNet Cash from Operations,33800,33760,394200\nINVESTING ACTIVITIES,,\n  Equipment Purchase,-5000,-3000,-25000\n  Building Improvements,-2000,-1000,-8000\nNet Cash from Investing,-7000,-4000,-33000\nFINANCING ACTIVITIES,,\n  Loan Proceeds,0,5000,15000\n  Loan Payments,-2000,-2000,-24000\n  Dividends Paid,-5000,-5000,-60000\nNet Cash from Financing,-7000,-2000,-69000\nNet Change in Cash,19800,27760,292200\nBeginning Cash,25200,10240,0\nEnding Cash,45000,38000,292200\n```\n\nThis cash flow statement shows how cash moves through your business operations. Click 'View' to see the full spreadsheet!";
  }
  
  // Random response for other messages
  return mockResponses[Math.floor(Math.random() * mockResponses.length)];
};

export function ChatInterface() {
  // const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'Getting Started with Clerk',
      timestamp: '2 hours ago',
      preview: 'Hello! I\'m Clerk, your AI accounting assistant...',
      messages: [
        {
          id: '1',
          content: 'Hello! Can you help me understand what accounting features you offer?',
          role: 'user',
          timestamp: '2:30 PM',
        },
        {
          id: '2',
          content: "Hello! I'm Clerk, your AI accounting assistant. I can help you with a wide variety of accounting tasks including:\n\n• Transaction organization and normalization\n• Journal entry generation\n• General ledger management\n• Audit checks and anomaly detection\n• Financial statement preparation\n• P&L, Cash Flow, and Payables/Receivables reports\n\nWhat accounting task would you like to work on today?",
          role: 'assistant',
          timestamp: '2:30 PM',
        },
      ],
    },
    {
      id: '2',
      title: 'Financial Statement Analysis',
      timestamp: 'Yesterday',
      preview: 'I can help you with financial statements! What specific...',
      messages: [
        {
          id: '3',
          content: 'Can you help me prepare financial statements?',
          role: 'user',
          timestamp: 'Yesterday 4:15 PM',
        },
        {
          id: '4',
          content: "I can definitely help you with financial statement preparation! I can assist with:\n\n• Profit & Loss statement generation\n• Cash Flow statement analysis\n• Balance sheet preparation\n• Payables and Receivables reports\n• Financial data validation and cleanup\n\nWhat specific financial statement or accounting report would you like help with?",
          role: 'assistant',
          timestamp: 'Yesterday 4:15 PM',
        },
      ],
    },
  ]);
  const [activeConversationId, setActiveConversationId] = useState<string>('1');
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

  // const handleNewConversation = () => {
  //   const newConversation: Conversation = {
  //     id: Date.now().toString(),
  //     title: 'New conversation',
  //     timestamp: 'Now',
  //     preview: 'Start a new conversation...',
  //     messages: [],
  //   };

  //   setConversations(prev => [newConversation, ...prev]);
  //   setActiveConversationId(newConversation.id);
  //   setSidebarOpen(false);
  // };

  const handleViewFile = (file: { name: string; content: string; type: 'text' | 'code' | 'image' | 'markdown'; language?: string; }) => {
    setCurrentFile(file);
    
    // Determine if this is an Excel/CSV file
    const isExcelFile = file.language === 'csv' || 
                       file.language === 'excel' || 
                       (file.content.includes(',') && file.content.split('\n').length > 1 && 
                        file.content.split('\n')[0].split(',').length > 1);
    
    if (isExcelFile) {
      setExcelViewerOpen(true);
    } else {
    setFileViewerOpen(true);
    }
  };

  return (
    <div className="flex h-screen bg-background relative">
      {/* <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => {
          setActiveConversationId(id);
          setSidebarOpen(false);
        }}
        onNewConversation={handleNewConversation}
      /> */}

      {/* Main Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        fileViewerOpen ? "mr-0 lg:mr-[50%] xl:mr-[40%]" : ""
      )}>
        {/* Header */}
        <div className="border-b border-border p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-3">
            {/* <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button> */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <div>
                <h1 className="font-semibold text-foreground">Clerk</h1>
                <p className="text-xs text-muted-foreground">AI for Accounting</p>
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
                  Hello! I'm Clerk.
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

      {/* Excel Viewer */}
      <ExcelViewer
        isOpen={excelViewerOpen}
        onClose={() => setExcelViewerOpen(false)}
        file={currentFile}
      />
    </div>
  );
}