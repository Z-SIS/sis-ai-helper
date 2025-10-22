# 🚀 Quick Deployment Guide

## DNS Error Solution

The DNS error for `review-chat-18034e36-b525-4542-8a1a-fa5acf5eac09.space.z.ai` indicates the deployment URL is not working. Here are multiple deployment options:

## 🎯 **Option 1: Vercel (Recommended)**

### Automatic Deployment
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   CLERK_SECRET_KEY=sk_test_your_key_here
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_key_here
   GOOGLE_GENAI_API_KEY=your_key_here
   TAVILY_API_KEY=your_key_here
   ```
5. Click "Deploy"

### Manual Deployment
```bash
npm install -g vercel
vercel --prod
```

## 🐳 **Option 2: Docker (Universal)**

### Build and Run Locally
```bash
# Build the Docker image
docker build -t sis-ai-helper .

# Run the container
docker run -p 3000:3000 sis-ai-helper
```

### Deploy to Docker Hub
```bash
# Tag and push
docker tag sis-ai-helper yourusername/sis-ai-helper
docker push yourusername/sis-ai-helper

# Pull and run on any server
docker run -p 3000:3000 yourusername/sis-ai-helper
```

## 🚂 **Option 3: Railway**

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Connect GitHub repository
4. Railway will auto-detect Next.js
5. Add environment variables
6. Deploy

## 🔵 **Option 4: Netlify**

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Add environment variables
6. Deploy

## ☁️ **Option 5: DigitalOcean App Platform**

1. Go to [digitalocean.com](https://digitalocean.com)
2. Create App → Deploy from GitHub
3. Select your repository
4. Build command: `npm run build`
5. Run command: `npm start`
6. Add environment variables
7. Deploy

## 🛠️ **Option 6: Self-Hosted VPS**

### On any Linux Server:
```bash
# Clone repository
git clone https://github.com/Z-SIS/sis-ai-helper.git
cd sis-ai-helper

# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start npm --name "sis-ai-helper" -- start
pm2 startup
pm2 save
```

## 🔧 **Environment Variables Template**

Create `.env` file with:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
SUPABASE_SERVICE_ROLE_KEY=your_key_here

# AI Services
GOOGLE_GENAI_API_KEY=your_google_gemini_key
TAVILY_API_KEY=your_tavily_key
```

## ⚡ **Quick Test Locally**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## 🐛 **Troubleshooting**

### If deployment fails:
1. **Check build logs** for specific errors
2. **Verify all environment variables** are set
3. **Ensure Node.js 18+** is available
4. **Check API keys** are valid
5. **Verify database connection** to Supabase

### For DNS issues:
1. **Wait 5-10 minutes** for DNS propagation
2. **Try a different deployment platform**
3. **Use the provided deployment configurations**
4. **Check domain settings** in deployment platform

## 🎯 **Recommended Approach**

1. **Try Vercel first** - Easiest and most reliable
2. **If Vercel fails** - Try Railway
3. **For full control** - Use Docker
4. **For enterprise** - Self-hosted VPS

The app is now fully configured for deployment on any platform! 🚀