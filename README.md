# SIS AI Helper - Open Platform

🚀 **AI-Powered Security Services Dashboard** - A comprehensive web application that provides 9 specialized AI agents to automate business tasks for security services providers.

## 🌟 Key Features

### 🤖 AI Agents (9 Tools)
1. **Company Research** - Gather comprehensive company information with RAG pattern and 30-day caching
2. **Generate SOP** - Create detailed Standard Operating Procedures
3. **Compose Email** - Draft professional emails with various tones
4. **Excel Helper** - Get Excel formulas, tips, and solutions
5. **Feasibility Check** - Assess project feasibility across multiple dimensions
6. **Deployment Plan** - Create comprehensive deployment strategies
7. **USPS Battlecard** - Generate competitive analysis tools
8. **Disbandment Plan** - Create project wind-down procedures
9. **Slide Template** - Generate presentation content and structure

### 🎨 Platform Features
- **🔓 Open Access** - No registration or authentication required
- **Modern Dashboard** - Clean, responsive three-column layout
- **Real-time Task History** - Track all AI agent interactions
- **Smart Caching** - RAG pattern with intelligent cache management
- **Export Functionality** - Download results as Markdown files
- **Responsive Design** - Works seamlessly on all devices
- **Instant Access** - Start using AI agents immediately

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (New York style)
- **State Management**: TanStack Query
- **Forms**: React Hook Form with Zod validation

### Backend & AI
- **Database**: Supabase (PostgreSQL) for task history
- **AI Integration**: Vercel AI SDK
- **AI Model**: Google Gemini 1.5 Flash
- **Web Search**: Tavily AI
- **API**: Next.js API Routes (Open Access)

### Development
- **Package Manager**: npm
- **Code Quality**: ESLint
- **Type Safety**: TypeScript throughout

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/sis-ai-helper.git
   cd sis-ai-helper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Supabase Configuration (Optional - for task history)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Google AI (Required)
   GOOGLE_GENAI_API_KEY=your_google_gemini_api_key

   # Tavily AI Search (Required for web search features)
   TAVILY_API_KEY=your_tavily_api_key
   ```

4. **Set up Supabase database (Optional)**
   - Create a new Supabase project
   - Run the SQL from `supabase-schema.sql` in your Supabase SQL editor
   - This enables task history functionality (optional)

5. **Get API keys**
   - **Google AI**: Get Gemini API key from Google AI Studio (Required)
   - **Tavily**: Sign up at Tavily AI and get your API key (Required for web search)

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)
   - No login required - start using AI agents immediately!

## 📁 Project Structure

```
sis-ai-helper/
├── src/
│   ├── app/
│   │   ├── api/agent/[slug]/    # Unified API for all 9 agents (Open Access)
│   │   ├── api/health/          # Health check endpoint
│   │   ├── dashboard/           # Main dashboard
│   │   └── page.tsx             # Landing page
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── forms/           # 9 AI agent forms
│   │   │   ├── agent-sidebar.tsx
│   │   │   └── history-sidebar.tsx
│   │   └── ui/                  # shadcn/ui components
│   ├── lib/
│   │   ├── supabase.ts          # Database client (optional)
│   │   └── utils.ts
│   └── shared/
│       └── agent-schemas.ts     # Zod schemas for all agents
├── public/                      # Static assets
├── .env.example                 # Environment variables template
├── supabase-schema.sql          # Database schema (optional)
└── README.md
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_GENAI_API_KEY` | Google Gemini API key | ✅ |
| `TAVILY_API_KEY` | Tavily search API key | ✅* |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ❌ (Optional) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ❌ (Optional) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ❌ (Optional) |

*Required for web search features in Company Research agent

### Database Setup (Optional)

The application works without a database. However, if you want to enable task history functionality:

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and keys

2. **Run Database Schema**
   - Open the SQL editor in your Supabase dashboard
   - Copy and paste the contents of `supabase-schema.sql`
   - Execute the SQL to create tables and policies

3. **Configure Environment Variables**
   - Add the Supabase variables to your `.env.local`
   - This will enable task history tracking

## 🚀 Deployment

### Vercel (Recommended)

1. **Deploy to Vercel**
   ```bash
   npx vercel --prod
   ```
   Or connect your GitHub repository to Vercel for automatic deployments.

2. **Configure Environment Variables in Vercel**
   
   In your Vercel dashboard, add these environment variables:
   
   ```env
   # Google AI (Required)
   GOOGLE_GENAI_API_KEY=your_google_gemini_api_key_here
   
   # Tavily AI Search (Required for web search)
   TAVILY_API_KEY=your_tavily_api_key_here
   
   # Supabase Configuration (Optional - for task history)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   ```

3. **Required Setup Steps**
   - **Google AI**: Get Gemini API key from [ai.google.dev](https://ai.google.dev)
   - **Tavily**: Get API key from [tavily.com](https://tavily.com) (for web search)
   - **Supabase**: Optional - Create project at [supabase.com](https://supabase.com) for task history

4. **Deploy**
   - Vercel will automatically build and deploy
   - Your app will be live at a `.vercel.app` domain

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 🤖 AI Agent Details

### Company Research
- **Features**: Web search, 30-day caching, comprehensive company data
- **Output**: Company info, executives, competitors, recent news
- **Cache**: RAG pattern with automatic cache updates

### SOP Generation
- **Features**: Structured procedures, responsibilities, timelines
- **Output**: Professional SOP documents in Markdown format
- **Export**: Download as .md file

### Email Composition
- **Features**: Multiple tones, key points integration, CTAs
- **Output**: Professional emails with word count
- **Copy**: One-click copy to clipboard

### Excel Helper
- **Features**: Formula generation, step-by-step instructions
- **Output**: Solutions with alternatives and tips
- **Format**: Copy-ready formulas

### Feasibility Check
- **Features**: Multi-dimensional analysis, risk assessment
- **Output**: Detailed feasibility reports with scores
- **Visualization**: Progress bars and status badges

### Deployment Plan
- **Features**: Phased deployment, rollback procedures
- **Output**: Comprehensive deployment documentation
- **Export**: Download as .md file

### USPS Battlecard
- **Features**: Competitive analysis, talking points
- **Output**: Battlecards with strengths/weaknesses
- **Export**: Download as .md file

### Disbandment Plan
- **Features**: Asset distribution, knowledge transfer
- **Output**: Complete wind-down procedures
- **Export**: Download as .md file

### Slide Template
- **Features**: Presentation structure, speaker notes
- **Output: Complete slide decks with visual suggestions
- **Export**: Download as .md file

## 🔒 Security

- **Input Validation**: Zod schemas for all inputs
- **API Security**: Protected routes with input sanitization
- **Environment**: Secure environment variable handling
- **Open Access**: No authentication required for AI agents
- **Rate Limiting**: Built-in request validation

## 🎨 UI/UX

- **Design System**: shadcn/ui components
- **Responsive**: Mobile-first design approach
- **Accessibility**: ARIA labels, keyboard navigation
- **Performance**: Optimized loading and caching
- **Dark Mode**: Ready for dark mode implementation

## 📊 Monitoring & Analytics

- **Task History**: Complete audit trail of all AI interactions
- **User Analytics**: Track agent usage patterns
- **Performance**: Monitor API response times
- **Error Tracking**: Comprehensive error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. **Check the logs**: Look at browser console and server logs
2. **Verify environment variables**: Ensure all required variables are set
3. **Database connection**: Confirm Supabase is accessible
4. **API keys**: Validate all API keys are correct and active

## 🎯 Roadmap

- [ ] Add more AI agents
- [ ] Implement team collaboration features
- [ ] Add advanced analytics dashboard
- [ ] Support for more file export formats
- [ ] Mobile app development
- [ ] Integration with more AI models

## 📞 Contact

- **Project Maintainer**: Sid T
- **Email**: tewari.85@gmail.com
- **Website**: stepupdigiworld.com

---

⭐ **Star this repository if it helped you!**

🚀 **Built with Next.js, TypeScript, and modern AI technologies**