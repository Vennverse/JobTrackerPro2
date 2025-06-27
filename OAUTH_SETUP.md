# OAuth Setup Guide for AutoJobr

## Quick Start - Demo Login
The demo login works immediately without any setup. Just click "Continue with Demo Account" to access all features.

## Adding OAuth Providers

To enable social login (Google, GitHub, LinkedIn), you need to add API keys to your environment. Here's how:

### 1. Create a `.env` file (if it doesn't exist)
```bash
# Copy the example file
cp .env.example .env
```

### 2. Add OAuth Keys to `.env`

Open the `.env` file and add your OAuth credentials:

```env
# Session secret (required)
NEXTAUTH_SECRET=your-random-secret-key-at-least-32-characters

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth  
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
```

### 3. Getting OAuth Credentials

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.developers.google.com)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set application type to "Web application"
6. Add redirect URI: `http://localhost:5000/api/auth/callback/google`
7. Copy the Client ID and Client Secret to your `.env` file

#### GitHub OAuth Setup
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the form:
   - Application name: `AutoJobr`
   - Homepage URL: `http://localhost:5000`
   - Authorization callback URL: `http://localhost:5000/api/auth/callback/github`
4. Copy the Client ID and Client Secret to your `.env` file

#### LinkedIn OAuth Setup
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click "Create app"
3. Fill in the required information
4. In "Auth" tab, add redirect URL: `http://localhost:5000/api/auth/callback/linkedin`
5. Copy the Client ID and Client Secret to your `.env` file

### 4. Restart the Application
After adding the keys, restart the server:
```bash
# The workflow will restart automatically
```

### 5. Test OAuth Login
Once configured, the social login buttons will become functional and the "Setup Required" labels will disappear.

## Current Status
- ✅ Demo login works immediately
- ✅ Session management working
- ⏳ OAuth providers require setup (optional)
- ✅ All features available with demo account

## Production Deployment
For production deployment on other platforms:
1. Update redirect URIs to your production domain
2. Set `NODE_ENV=production` 
3. Use secure session secrets
4. Enable HTTPS for OAuth providers

The system is designed to work seamlessly across different hosting platforms.