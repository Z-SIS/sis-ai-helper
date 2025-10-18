# API Setup Guide for SIS AI Helper

## 🚀 Quick Setup

The SIS AI Helper requires two API keys to provide full functionality:

### 1. Google AI API Key (Required)
- **Purpose**: AI-powered text generation and analysis
- **Cost**: Free tier available with generous limits
- **Get it here**: [Google AI Studio](https://aistudio.google.com/app/apikey)

### 2. Tavily API Key (Required for Web Search)
- **Purpose**: Real-time web search for company research
- **Cost**: Free tier available with 1,000 searches/month
- **Get it here**: [Tavily](https://tavily.com)

## 📋 Setup Steps

### Step 1: Create `.env.local` file
In your project root directory, create a file named `.env.local`:

```bash
touch .env.local
```

### Step 2: Add API Keys
Add the following to your `.env.local` file:

```env
# Google AI API Key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key_here

# Tavily API Key for Web Search
TAVILY_API_KEY=your_tavily_api_key_here
```

### Step 3: Replace with Your Keys
1. Replace `your_google_ai_api_key_here` with your actual Google AI API key
2. Replace `your_tavily_api_key_here` with your actual Tavily API key

### Step 4: Restart Development Server
```bash
npm run dev
```

## 🎯 Demo Mode

If you haven't configured API keys yet, the system will work in demo mode:

- **Try "SIS Limited"** as company name to see sample data with full features
- Other companies will return basic placeholder information
- Real-time web search and AI analysis require API keys

## 🔧 Troubleshooting

### Error: "API key not configured"
- Ensure you've created the `.env.local` file
- Check that API keys are correctly copied
- Restart the development server after adding keys

### Error: "403 Forbidden" from Google APIs
- Verify your Google AI API key is valid
- Check if you've enabled the Generative Language API
- Ensure the key hasn't expired

### Error: "Failed to load resource" or 404 errors
- Make sure the development server is running
- Check that API endpoints are accessible
- Verify your `.env.local` file is in the correct location

## 📊 API Usage & Limits

### Google AI API
- **Free Tier**: 15 requests per minute
- **Models Used**: Gemini 2.5 Flash (fast), Gemini 2.5 Pro (high quality)
- **Token Limits**: Optimized for cost efficiency

### Tavily API
- **Free Tier**: 1,000 searches per month
- **Rate Limits**: 20 requests per minute
- **Search Depth**: Basic (optimized for performance)

## 🚀 Production Deployment

For production deployment:

1. **Vercel**: Add environment variables in Vercel dashboard
2. **Other Platforms**: Set environment variables according to your hosting provider
3. **Security**: Never commit `.env.local` to version control
4. **Monitoring**: Monitor API usage to avoid exceeding limits

## 💡 Tips

- Start with the free tiers to test functionality
- Monitor your API usage in the respective dashboards
- The system automatically falls back to demo mode if APIs are unavailable
- Company research works best with well-known companies

## 🆘 Support

If you encounter issues:

1. Check the browser console for detailed error messages
2. Verify API keys are correctly configured
3. Ensure all required APIs are enabled in your Google Cloud Console
4. Check your Tavily dashboard for API key status

---

**Note**: The `.env.local` file is automatically ignored by Git for security reasons. Never share your API keys or commit them to version control.