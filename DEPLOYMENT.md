# Deployment Guide

## Vercel Deployment

This project is pre-configured for deployment on Vercel.

### Quick Start

1. **Push to Git**
   ```bash
   git add .
   git commit -m "Configure Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your Git repository
   - Vercel will auto-detect the Vite configuration

3. **Configure Environment Variables**
   
   In Vercel project settings → Environment Variables, add:
   
   ```
   VITE_API_BASE=https://your-backend-api.com/api/v1/langgraph
   VITE_API_ROOT=https://your-backend-api.com/api/v1
   ```
   
   Replace with your actual backend API URLs.

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

### Configuration Details

#### vercel.json
The project includes a `vercel.json` file that configures:

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework**: Vite (auto-detected)
- **SPA Routing**: All routes redirect to `index.html` for client-side routing
- **Asset Caching**: Static assets cached for 1 year with immutable flag

#### Environment Variables

The application requires these environment variables:

| Variable | Default (Local) | Description |
|----------|----------------|-------------|
| `VITE_API_BASE` | `http://localhost:8081/api/v1/langgraph` | Base URL for LangGraph API |
| `VITE_API_ROOT` | `http://localhost:8081/api/v1` | Root URL for all API endpoints |

**Important**: Vite requires the `VITE_` prefix for environment variables to be exposed to the client.

### Local Development

For local development:

1. Copy the environment template:
   ```bash
   cp ENV.example .env
   ```

2. Update `.env` with your local backend URLs

3. Start the dev server:
   ```bash
   npm run dev
   ```

### Production Checklist

- [ ] Set up your backend API
- [ ] Configure CORS on backend to allow your Vercel domain
- [ ] Add environment variables in Vercel
- [ ] Test the deployment
- [ ] Configure custom domain (optional)

### Troubleshooting

#### Build Fails
- Check Node.js version (should be v18+)
- Clear cache: `vercel build --debug`
- Check Vercel build logs for specific errors

#### API Calls Fail in Production
- Verify environment variables are set correctly
- Check CORS configuration on your backend
- Ensure backend is accessible from the internet

#### Routing Issues
- Verify `vercel.json` rewrites configuration
- Check that your React Router is configured correctly
- Ensure `index.html` has the root div

### Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Configuration](https://vitejs.dev/config/)
- [Environment Variables in Vite](https://vitejs.dev/guide/env-and-mode.html)

