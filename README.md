# Zigma - AI for Accounting

Zigma is an AI-powered accounting automation platform that helps organizations streamline their financial processes through intelligent data processing and analysis.

## Features

### Automatic Data Processing
When you upload your financial data, Zigma automatically:

- **Organization**: Cleans and normalizes transactions for accurate processing
- **Ledger**: Generates journal entries and maintains a comprehensive general ledger
- **Audit Checks**: Flags anomalies or missing items to ensure data integrity
- **Statements**: Prepares Profit & Loss statements, Cash Flow reports, and Payables/Receivables summaries

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:

```bash
npm run dev
```

### Build

Build the project for production:

```bash
npm run build
```

### Deployment

#### Vercel

This project is configured for easy deployment on Vercel.

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `VITE_API_BASE` - Your backend API base URL (default: `http://localhost:8081/api/v1/langgraph`)
   - `VITE_API_ROOT` - Your backend API root URL (default: `http://localhost:8081/api/v1`)
4. Deploy!

The `vercel.json` configuration handles:
- SPA routing with rewrites
- Asset caching for optimal performance
- Automatic build detection

For local development, copy `ENV.example` to `.env` and configure your API endpoints.

## Technologies Used

- **Vite** - Build tool and development server
- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

## Project Structure

- `src/` - Source code
- `public/` - Static assets
- `components/` - React components
- `pages/` - Page components
- `hooks/` - Custom React hooks
- `lib/` - Utility functions

## AI Accounting Capabilities

Zigma leverages advanced AI to provide:

- **Transaction Normalization**: Automatically categorizes and standardizes financial data
- **Journal Entry Generation**: Creates accurate journal entries based on transaction patterns
- **Anomaly Detection**: Identifies unusual transactions or potential errors
- **Financial Reporting**: Generates comprehensive financial statements and reports
- **Audit Trail**: Maintains detailed records for compliance and verification