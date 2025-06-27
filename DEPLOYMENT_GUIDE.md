# AutoJobr Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Database**: Set up a PostgreSQL database (Neon, PlanetScale, or Supabase)

## Step-by-Step Deployment

### 1. Database Setup

Since Replit's database isn't accessible from Vercel, you'll need an external database:

**Option A: Neon (Recommended)**
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

**Option B: Supabase**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get the database URL from Settings > Database

**Option C: PlanetScale**
1. Go to [planetscale.com](https://planetscale.com)
2. Create a new database
3. Get the connection string

### 2. Environment Variables

Set these in your Vercel project settings:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Database Connection Details
PGHOST=your-db-host
PGPORT=5432
PGUSER=your-username
PGPASSWORD=your-password
PGDATABASE=your-database-name

# Authentication
SESSION_SECRET=your-super-secret-session-key
REPL_ID=your-repl-id
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=your-vercel-domain.vercel.app

# AI Service
GROQ_API_KEY=your-groq-api-key

# PayPal (Optional)
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# Stripe (Optional)
STRIPE_SECRET_KEY=your-stripe-secret-key
VITE_STRIPE_PUBLIC_KEY=your-stripe-public-key
```

### 3. Deploy to Vercel

**Method 1: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Method 2: GitHub Integration**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables
5. Deploy

### 4. Database Migration

After deployment, run the database migration:

```bash
# Install dependencies locally
npm install

# Set DATABASE_URL in your local .env
echo "DATABASE_URL=your-production-database-url" > .env

# Run migration
npm run db:push
```

### 5. Chrome Extension Configuration

Update the Chrome extension to use your Vercel domain:

1. Open `extension/config.js`
2. Update the API URL:
```javascript
const PRODUCTION_API_URL = 'https://your-app.vercel.app';
```

3. Rebuild the extension for production

## Build Configuration

The project includes these build scripts:

```json
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "esbuild server/index.ts --bundle --platform=node --target=node18 --outfile=dist/server.js",
    "start": "node dist/server.js"
  }
}
```

## Domain Configuration

1. **Custom Domain** (Optional):
   - Add your domain in Vercel dashboard
   - Update `REPLIT_DOMAINS` environment variable

2. **CORS Configuration**:
   - The app is configured to work with Vercel domains
   - Chrome extension permissions include `*.vercel.app`

## Authentication Setup

For Replit Auth on Vercel:

1. **Callback URLs**: Update in Replit Auth settings
   - `https://your-app.vercel.app/api/callback`

2. **Environment Variables**:
   - `REPL_ID`: Your Replit application ID
   - `REPLIT_DOMAINS`: Your Vercel domain

## Troubleshooting

### Common Issues

1. **Database Connection**:
   - Ensure DATABASE_URL is correct
   - Check database provider's connection limits

2. **Authentication**:
   - Verify REPLIT_DOMAINS matches your domain
   - Check SESSION_SECRET is set

3. **Build Errors**:
   - Run `npm run build` locally first
   - Check Node.js version compatibility

4. **Chrome Extension**:
   - Update API URL in extension configuration
   - Rebuild extension with production settings

### Performance Optimization

1. **Database**:
   - Use connection pooling
   - Enable query caching if available

2. **Vercel**:
   - Enable Edge Functions for better performance
   - Use CDN for static assets

3. **Chrome Extension**:
   - Minimize API calls
   - Cache user profile data locally

## Post-Deployment Checklist

- [ ] Database migration completed
- [ ] Environment variables configured
- [ ] Authentication working
- [ ] Chrome extension updated
- [ ] API endpoints responding
- [ ] PayPal/Stripe integration working
- [ ] Form auto-fill functionality tested

## Monitoring

Set up monitoring for:
- Database performance
- API response times
- Error rates
- User activity
- Subscription metrics

Your AutoJobr application will be available at:
`https://your-app.vercel.app`

The Chrome extension will connect to this URL for all API operations.