# Vercel Deployment Guide - SIS AI Helper
**Complete setup for Vercel + Supabase integration**

## 🚀 **Quick Start Deployment**

### **1. Database Setup (Required First)**
⚠️ **MUST COMPLETE BEFORE DEPLOYMENT**

1. **Execute Database Migration**
   - 📁 Copy SQL from: `COMPLETE_MIGRATION.sql`
   - 🔗 Go to: https://your-project.supabase.co/project/sql
   - 📋 Paste and execute the complete script
   - ✅ Verify all tables are created

2. **Test Database Connection**
   ```bash
   node check-supabase-status.js
   ```
   Expected: `8/8 tables exist`

### **2. Vercel Deployment**

#### **Option A: Connect via Vercel Dashboard**
1. Go to: https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import GitHub repository: `Z-SIS/sis-ai-helper`
4. Configure environment variables (see below)
5. Deploy

#### **Option B: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## 🔧 **Environment Variables Configuration**

### **Required Environment Variables**
Add these in Vercel Dashboard → Settings → Environment Variables:

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your_supabase_anon_key` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | `your_supabase_service_role_key` | Service role key |

### **Optional Variables**
| Variable Name | Value | Description |
|---------------|-------|-------------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Your Google AI key | For AI features |
| `TAVILY_API_KEY` | Your Tavily key | For web search |

## 🔍 **Deployment Verification**

### **1. Check Supabase Connection**
Visit: `https://your-domain.vercel.app/api/supabase/check`

Expected response:
```json
{
  "status": "success",
  "connection": {
    "status": "connected",
    "tablesExist": true
  }
}
```

### **2. Test Application Features**
- ✅ Dashboard loads: `https://your-domain.vercel.app/dashboard`
- ✅ Company research works
- ✅ Document upload functions
- ✅ Search analytics active

### **3. Monitor Deployment**
- Vercel Dashboard: Functions tab
- Supabase Dashboard: Logs and usage
- Error tracking in browser console

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **Database Connection Errors**
```bash
# Test locally first
node check-supabase-status.js
```
**Solutions:**
- Verify environment variables in Vercel
- Check Supabase project URL and keys
- Ensure database migration was executed

#### **Build Errors**
```bash
# Test build locally
npm run build
```
**Solutions:**
- Check package.json dependencies
- Verify Next.js configuration
- Review build logs in Vercel

#### **Function Timeouts**
**Solutions:**
- Increase function timeout in `vercel.json`
- Optimize database queries
- Add proper error handling

### **Debug Commands**

#### **Local Testing**
```bash
# Start development server
npm run dev

# Test Supabase connection
curl http://localhost:3000/api/supabase/check

# Check environment variables
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

#### **Production Testing**
```bash
# Test deployed API
curl https://your-domain.vercel.app/api/supabase/check

# Check Vercel logs
vercel logs

# Test specific functions
curl https://your-domain.vercel.app/api/agent/health
```

## 📊 **Performance Monitoring**

### **Key Metrics to Monitor**
- API response times
- Database query performance
- Error rates
- User engagement

### **Monitoring Tools**
- **Vercel Analytics**: Built-in performance metrics
- **Supabase Dashboard**: Database usage and logs
- **Browser DevTools**: Frontend performance

## 🔄 **CI/CD Pipeline**

### **Automatic Deployments**
The repository is configured for:
- ✅ Automatic deployment on `master` push
- ✅ Preview deployments for PRs
- ✅ Environment-specific variables

### **Deployment Workflow**
1. **Code changes** → Push to GitHub
2. **Automatic build** → Vercel builds application
3. **Deployment** → Production or preview
4. **Health checks** → Verify Supabase connection

## 🎯 **Success Checklist**

### **Pre-Deployment**
- [ ] Database migration executed
- [ ] All environment variables set
- [ ] Local testing completed
- [ ] Build process verified

### **Post-Deployment**
- [ ] Application loads successfully
- [ ] Supabase connection working
- [ ] All API endpoints functional
- [ ] User authentication working
- [ ] Analytics tracking active

## 📞 **Support Resources**

### **Documentation**
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs

### **Helpful Links**
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://your-project.supabase.co
- **GitHub Repository**: https://github.com/Z-SIS/sis-ai-helper

---

## 🎉 **You're Ready for Production!**

Once you complete the database migration and deploy to Vercel, the SIS AI Helper will be fully functional with:
- ✅ Enhanced RAG system
- ✅ Search analytics
- ✅ Document management
- ✅ Company research
- ✅ Real-time performance monitoring

**🚀 Your AI-powered sales intelligence platform is ready!**

---

*Generated with [Claude Code](https://claude.ai/code)*
*Last Updated: 2025-10-22*