import type { InsightCard } from '@/types/dashboard';

export const generateMockInsights = (hasData: boolean): InsightCard[] => {
  if (hasData) {
    return [
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
    ];
  } else {
    return [
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
    ];
  }
};

