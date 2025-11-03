# Pre-Deployment Checklist

Use this checklist before deploying to Vercel to ensure everything is properly configured.

## Environment Setup

- [ ] Backend API is deployed and accessible
- [ ] Backend CORS configured to allow Vercel domain
- [ ] API endpoints tested and working
- [ ] Environment variables documented in `ENV.example`

## Vercel Configuration

- [ ] `vercel.json` created with correct settings
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Framework detected: `vite`

## Environment Variables

Configure these in Vercel project settings:

- [ ] `VITE_API_BASE` - Backend API base URL
- [ ] `VITE_API_ROOT` - Backend API root URL
- [ ] All variables have correct values
- [ ] No sensitive data exposed in client-side code

## Build Verification

- [ ] Local build succeeds: `npm run build`
- [ ] No build warnings or errors
- [ ] Bundle size optimized (vendor chunks configured)
- [ ] Production preview works: `npm run preview`
- [ ] All pages and routes accessible

## Code Quality

- [ ] No linting errors: `npm run lint`
- [ ] TypeScript compilation succeeds
- [ ] No console errors in browser
- [ ] All environment variables have defaults for local dev

## Security

- [ ] `.gitignore` includes `.env` files
- [ ] No hardcoded API keys or secrets
- [ ] Sensitive data in environment variables only
- [ ] HTTPS configured in production

## Testing

- [ ] File upload functionality works
- [ ] API calls succeed in production
- [ ] Spreadsheet viewer loads correctly
- [ ] Chat interface responds properly
- [ ] All interactive features functional
- [ ] Mobile responsiveness verified

## Performance

- [ ] Asset caching configured
- [ ] Images optimized
- [ ] Large chunks split appropriately
- [ ] Bundle size reasonable (< 500KB per chunk)
- [ ] Lighthouse score acceptable

## Documentation

- [ ] `README.md` updated with deployment instructions
- [ ] `DEPLOYMENT.md` created with detailed guide
- [ ] `ENV.example` includes all required variables
- [ ] Troubleshooting section complete

## Vercel Deployment

- [ ] Git repository pushed to remote
- [ ] Vercel project imported from Git
- [ ] Environment variables added in Vercel dashboard
- [ ] Build settings verified
- [ ] Deployment successful
- [ ] Production URL tested

## Post-Deployment

- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Monitoring set up
- [ ] Error tracking configured
- [ ] Analytics enabled (if needed)

## Ready to Deploy! 🚀

Once all items are checked, you're ready to deploy to Vercel!

```bash
# Push to Git
git add .
git commit -m "Ready for Vercel deployment"
git push origin main

# Vercel will automatically deploy on push
```

