# Zigma - AI for Accounting

Zigma is an AI-powered accounting automation platform that helps organizations streamline their financial processes through intelligent data processing, analysis, and rule-based transformations.

## 🎯 Overview

Zigma transforms raw financial data into organized, validated, and actionable insights. The platform combines AI-powered analysis with an intuitive rules system that lets users create data transformation rules in plain English, right where problems are detected.

## ✨ Key Features

### 📊 Data Processing & Analysis
- **Automatic Data Processing**: Upload spreadsheets and Excel files for automatic processing
- **Data Health Dashboard**: Real-time metrics on data cleanliness, record organization, and issue detection
- **Issue Detection**: Automatically identifies missing IDs, duplicate receipts, unrecognized references, and mismatched names
- **Spreadsheet Viewer**: Full-featured spreadsheet viewer with cell editing, formula bar, and multi-sheet support

### 🔧 Rules System
- **Contextual Rule Creation**: Create rules directly from detected issues - no need to navigate to settings
- **Plain English Interface**: Write rules in natural language (e.g., "From now on, always require student ID for payment entries")
- **Transformation Preview**: Preview changes before applying rules to your data
- **Undo Timeline**: Complete action history with undo capability for all transformations
- **Rule Management**: Activate, deactivate, edit, and reorder rules with a clean interface

### 💬 AI Chat Interface
- **Conversational Rules**: Create rules through natural language chat
- **Data Insights**: Ask questions about your data and get AI-powered insights
- **Contextual Help**: Get suggestions and recommendations based on your data

### 📈 Dashboard Features
- **Summary Cards**: Quick overview of data health, records organized, and issues found
- **Issues List**: Detailed view of all detected data issues with severity indicators
- **Resolved Issues**: Track issues that have been fixed
- **Rules Panel**: Manage all project rules in one place
- **Timeline View**: Visual history of all transformations and rule applications

## 🛠️ Tech Stack

### Core Technologies
- **React 18** - UI library with modern hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Icon library

### Data & API
- **TanStack Query** - Data fetching and caching
- **XLSX** - Excel file parsing
- **LangGraph API** - Backend integration for AI features

### Development Tools
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **PostCSS** - CSS processing

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn** or **bun**
- Backend API running (see [Deployment](#deployment) for API configuration)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd digital-claude-dream
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp ENV.example .env
   ```
   
   Edit `.env` and configure your API endpoints:
   ```env
   VITE_API_BASE=http://localhost:8081/api/v1/langgraph
   VITE_API_ROOT=http://localhost:8081/api/v1
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

   The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
# or
yarn build
# or
bun build
```

The production build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── dashboard/       # Dashboard-specific components
│   │   ├── DashboardHeader.tsx
│   │   ├── IssuesList.tsx
│   │   ├── RulesPanel.tsx
│   │   └── ...
│   ├── transformations/ # Transformation and rules UI
│   │   ├── RuleBlock.tsx
│   │   ├── TransformationPreview.tsx
│   │   └── UndoTimeline.tsx
│   ├── ui/             # shadcn/ui components
│   └── ...
├── pages/              # Page-level components
│   ├── Index.tsx       # Main app entry point
│   └── NotFound.tsx
├── store/              # State management (Zustand)
│   ├── spreadsheetStore.ts
│   └── transformationStore.ts
├── hooks/              # Custom React hooks
│   ├── useLocalStorage.ts
│   └── use-mobile.tsx
├── types/              # TypeScript type definitions
│   ├── chat.ts
│   ├── dashboard.ts
│   └── transformations.ts
├── lib/                # Utility libraries
│   ├── api/            # API client functions
│   │   ├── cells.ts
│   │   ├── langgraph.ts
│   │   ├── sheets.ts
│   │   └── workbook.ts
│   └── utils.ts
├── utils/              # Helper functions
│   ├── clipboard.ts
│   ├── dashboardHelpers.ts
│   └── issueHelpers.tsx
├── constants/          # App-wide constants
│   └── index.ts
└── data/              # Mock data and samples
    ├── mockIssues.ts
    └── sampleSheets.ts
```

## 🎨 Key Features Explained

### Rules System

The rules system is the heart of Zigma's data transformation capabilities:

- **Contextual Creation**: Rules are created where problems are detected, not in a separate settings page
- **Plain English**: No complex logic builders - just natural language
- **Preview Before Apply**: See exactly what will change before committing
- **Undo Support**: Every transformation can be undone through the timeline
- **Active/Inactive**: Toggle rules on and off without deleting them

### Data Health Dashboard

The dashboard provides real-time insights into your data:

- **Cleanliness Percentage**: Overall data quality score
- **Issues Detected**: Categorized by severity (high, medium, low)
- **Resolved Issues**: Track your progress in fixing data problems
- **Quick Actions**: Resolve issues with one click or create rules to prevent them

### Spreadsheet Viewer

Full-featured spreadsheet interface:

- **Multi-sheet Support**: Navigate between sheets with tabs
- **Cell Editing**: Click to edit cells directly
- **Formula Bar**: View and edit formulas
- **Detached Sheets**: View multiple sheets in separate windows
- **Grid Navigation**: Keyboard shortcuts for efficient navigation

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Quality

The codebase follows modern React best practices:

- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **State Management**: Zustand for global state, React hooks for local state
- ✅ **Component Organization**: Logical grouping by feature
- ✅ **Custom Hooks**: Reusable logic extracted to hooks
- ✅ **Type Definitions**: Centralized in `types/` directory
- ✅ **Constants**: Centralized in `constants/` directory

### State Management

- **Zustand Stores**: 
  - `transformationStore` - Rules, previews, and undo timeline
  - `spreadsheetStore` - Spreadsheet data and UI state
- **Local State**: Component-specific state using `useState`
- **Local Storage**: Project persistence via `useLocalStorage` hook

## 🚢 Deployment

### Vercel (Recommended)

This project is optimized for Vercel deployment:

1. **Push to Git**: Push your code to GitHub, GitLab, or Bitbucket

2. **Import to Vercel**: 
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your repository

3. **Configure Environment Variables**:
   - `VITE_API_BASE` - Backend API base URL for LangGraph
   - `VITE_API_ROOT` - Backend API root URL

4. **Deploy**: Vercel will automatically detect Vite and deploy

The `vercel.json` configuration handles:
- SPA routing with rewrites
- Asset caching for optimal performance
- Automatic build detection

### Other Platforms

The project can be deployed to any static hosting service:

1. Run `npm run build`
2. Deploy the `dist/` directory
3. Configure your server to handle SPA routing (redirect all routes to `index.html`)

## 📚 Documentation

- **[Rules System Design](./docs/RULES_SYSTEM_DESIGN.md)** - Detailed documentation on the rules system
- **[Deployment Guide](./DEPLOYMENT.md)** - Comprehensive deployment instructions
- **[Frontend Improvements](./FRONTEND_IMPROVEMENTS.md)** - Code quality improvements and roadmap

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE` | LangGraph API base URL | `http://localhost:8081/api/v1/langgraph` |
| `VITE_API_ROOT` | Backend API root URL | `http://localhost:8081/api/v1` |

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Ensure code passes linting (`npm run lint`)
4. Test thoroughly
5. Submit a pull request

## 📝 License

[Add your license information here]

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**Zigma** - Making accounting data management as simple as a conversation.
