import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSpreadsheet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart3,
  PieChart,
  Calendar,
  AlertCircle,
  CheckCircle2,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Project } from '@/types/chat';

interface DashboardProps {
  project: Project;
  onOpenSpreadsheet: () => void;
  onOpenChat: () => void;
  onUploadFiles: () => void;
}

interface SummaryCard {
  id: string;
  title: string;
  value: string;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
}

interface InsightCard {
  id: string;
  type: 'growth' | 'warning' | 'success' | 'info';
  title: string;
  description: string;
  value?: string;
  trend?: 'up' | 'down';
}

export function Dashboard({ project, onOpenSpreadsheet, onOpenChat, onUploadFiles }: DashboardProps) {
  const [showSpreadsheet, setShowSpreadsheet] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [insights, setInsights] = useState<InsightCard[]>([]);

  // Calculate project-specific metrics
  const hasData = project.files.length > 0 || project.workbookId;
  const fileCount = project.files.length;

  // Mock financial data
  const summaryCards: SummaryCard[] = hasData ? [
    {
      id: 'cash-balance',
      title: 'Cash Balance',
      value: '$125,430',
      change: 2.5,
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      id: 'monthly-expenses',
      title: 'Monthly Expenses',
      value: '$18,750',
      change: -5.2,
      changeType: 'negative',
      icon: CreditCard,
      color: 'text-red-600'
    },
    {
      id: 'receivables',
      title: 'Receivables',
      value: '$32,500',
      change: 12.3,
      changeType: 'positive',
      icon: Receipt,
      color: 'text-blue-600'
    }
  ] : [
    {
      id: 'cash-balance',
      title: 'Cash Balance',
      value: '$0',
      change: 0,
      changeType: 'neutral',
      icon: DollarSign,
      color: 'text-muted-foreground'
    },
    {
      id: 'monthly-expenses',
      title: 'Monthly Expenses',
      value: '$0',
      change: 0,
      changeType: 'neutral',
      icon: CreditCard,
      color: 'text-muted-foreground'
    },
    {
      id: 'receivables',
      title: 'Receivables',
      value: '$0',
      change: 0,
      changeType: 'neutral',
      icon: Receipt,
      color: 'text-muted-foreground'
    }
  ];

  // Generate AI insights
  useEffect(() => {
    const generateInsights = () => {
      if (hasData) {
        setInsights([
          {
            id: 'margin-growth',
            type: 'success',
            title: 'Q3 Margin Growth',
            description: 'Your profit margin increased significantly this quarter',
            value: '+12%',
            trend: 'up'
          },
          {
            id: 'transport-warning',
            type: 'warning',
            title: 'Transport Overspend',
            description: 'You\'re spending 23% more on transport than budgeted',
            value: '$2,400',
            trend: 'down'
          },
          {
            id: 'cash-flow',
            type: 'info',
            title: 'Cash Flow Trend',
            description: 'Operating cash flow improved by 15% month-over-month',
            value: '+15%',
            trend: 'up'
          },
          {
            id: 'invoice-aging',
            type: 'warning',
            title: 'Invoice Aging',
            description: '3 invoices over 30 days old need attention',
            value: '$8,500',
            trend: 'down'
          }
        ]);
      } else {
        setInsights([
          {
            id: 'get-started',
            type: 'info',
            title: 'Get Started',
            description: 'Upload your financial data to unlock powerful insights',
          },
          {
            id: 'connect-sources',
            type: 'info',
            title: 'Connect Data Sources',
            description: 'Link your accounting software for real-time updates',
          }
        ]);
      }
    };

    generateInsights();
  }, [hasData]);

  const getInsightIcon = (type: InsightCard['type']) => {
    switch (type) {
      case 'success': return CheckCircle2;
      case 'warning': return AlertCircle;
      case 'growth': return TrendingUp;
      default: return Sparkles;
    }
  };

  const getInsightColor = (type: InsightCard['type']) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'growth': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Main Dashboard Surface */}
      <div className="flex-1 overflow-y-auto">
        {/* Header with Spreadsheet Toggle */}
        <div className="flex items-center justify-between px-8 py-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-1">{project.name}</h1>
            <p className="text-sm text-muted-foreground">Financial overview and insights</p>
          </div>
          
          {/* Spreadsheet Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSpreadsheet(!showSpreadsheet)}
            className="h-9 px-3 text-xs font-medium hover:bg-primary/5 hover:border-primary/30"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Sheet
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="px-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {summaryCards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            {card.title}
                          </p>
                          <p className="text-2xl font-semibold text-foreground">
                            {card.value}
                          </p>
                        </div>
                        <div className={`p-3 rounded-lg bg-muted/50 ${card.color}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                      </div>
                      
                      {card.change !== 0 && (
                        <div className="flex items-center mt-4">
                          {card.changeType === 'positive' ? (
                            <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                          )}
                          <span className={`text-sm font-medium ${
                            card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {Math.abs(card.change)}%
                          </span>
                          <span className="text-sm text-muted-foreground ml-1">vs last month</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* AI Insights */}
        <div className="px-8 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">AI Insights</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => {
              const IconComponent = getInsightIcon(insight.type);
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (index + 3) * 0.1 }}
                >
                  <Card className={`border ${getInsightColor(insight.type)} hover:shadow-md transition-shadow duration-200`}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-background/50">
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-foreground">{insight.title}</h3>
                            {insight.value && (
                              <span className="text-sm font-semibold text-foreground">
                                {insight.value}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {insight.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Charts Section - Appears on scroll */}
        <div className="px-8 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Revenue Chart Placeholder */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-foreground">Revenue Trend</h3>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="h-48 bg-muted/20 rounded-lg flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Chart visualization</p>
                </div>
              </CardContent>
            </Card>

            {/* Expense Breakdown Placeholder */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-foreground">Expense Breakdown</h3>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="h-48 bg-muted/20 rounded-lg flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Chart visualization</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Spreadsheet Slide-over */}
      <AnimatePresence>
        {showSpreadsheet && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-1/2 bg-background border-l border-border shadow-2xl z-50"
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Structured Data</h2>
                  <p className="text-sm text-muted-foreground">Explore your cleaned dataset</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSpreadsheet(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="bg-muted/20 rounded-lg h-full flex items-center justify-center">
                  <div className="text-center">
                    <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Spreadsheet view</p>
                    <p className="text-xs text-muted-foreground mt-1">Data exploration interface</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Chat Interface */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={() => setShowChat(!showChat)}
            className="h-12 px-6 bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Ask Zigma anything...
          </Button>
        </motion.div>
      </div>

      {/* Chat Drawer */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 h-2/3 bg-background border-t border-border shadow-2xl z-50"
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Chat with Zigma</h2>
                  <p className="text-sm text-muted-foreground">Get insights about your data</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChat(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                  <div className="bg-muted/20 rounded-lg p-8 text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Chat interface</p>
                    <p className="text-xs text-muted-foreground mt-1">Ask questions about your financial data</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}