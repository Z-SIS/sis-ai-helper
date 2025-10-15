# Deployment Guide

## 🚀 Quick Deployment

This project is now configured for standard Next.js deployment and should work with most deployment platforms.

### ✅ Fixed Deployment Issues

1. **Custom Server Removed** - Now uses standard Next.js deployment
2. **Build Configuration Updated** - Added `output: 'standalone'` for better compatibility
3. **Environment Variables** - Clear template provided
4. **Scripts Standardized** - Uses standard `next dev`, `next build`, `next start`

### 🌐 Deployment Platforms

#### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically

#### Netlify
1. Connect repository
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 🔧 Environment Variables

Required for production deployment:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Google AI
GOOGLE_GENAI_API_KEY=your_google_gemini_api_key_here

# Tavily AI Search
TAVILY_API_KEY=your_tavily_api_key_here
```

### 📋 Pre-Deployment Checklist

- [ ] All environment variables set
- [ ] Supabase database created and schema applied
- [ ] Clerk application configured
- [ ] Google AI API key obtained
- [ ] Tavily API key obtained
- [ ] Build test passes: `npm run build`

### 🐛 Troubleshooting

If deployment fails:

1. **Check build logs** for specific errors
2. **Verify environment variables** are correctly set
3. **Ensure all API keys** are valid and active
4. **Check database connection** to Supabase
5. **Validate Clerk configuration** in dashboard

### 🔄 Development vs Production

- **Development**: Use `npm run dev` for local development
- **Custom Server**: Use `npm run dev:custom` if Socket.IO needed
- **Production**: Use `npm run build && npm start` for self-hosting

The app will display a landing page even without full configuration, but AI features require all environment variables.