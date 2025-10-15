'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
<<<<<<< HEAD
import { Bot, Sparkles, Shield, Zap, Users, BarChart, ArrowRight, Target, TrendingUp, DollarSign, Eye } from 'lucide-react';
=======
import { Bot, Sparkles, Shield, Zap, Users, BarChart, ArrowRight } from 'lucide-react';
>>>>>>> 320175aecb664ade96ffb95e59012c5e62a1005d
import Link from 'next/link';

export default function Home() {
  const features = [
    {
<<<<<<< HEAD
      icon: Target,
      title: "Sales Intelligence",
      description: "AI-powered company research with decision maker identification and pain point analysis",
      color: "from-red-500 to-red-600"
    },
    {
      icon: TrendingUp,
      title: "Market Insights",
      description: "Competitive landscape analysis and positioning opportunities",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: DollarSign,
      title: "Financial Health",
      description: "Revenue analysis, funding stages, and growth potential assessment",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Users,
      title: "Decision Makers",
      description: "Identify key stakeholders and their influence levels",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Eye,
      title: "Pain Points",
      description: "Discover business challenges and solution opportunities",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: BarChart,
      title: "ROI Analysis",
      description: "Calculate potential value and success metrics for opportunities",
      color: "from-cyan-500 to-cyan-600"
    }
  ];

  const salesTools = [
    {
      icon: Target,
      title: "Company Research",
      description: "Comprehensive sales intelligence with decision maker identification",
      color: "from-red-500 to-red-600"
    },
    {
      icon: Users,
      title: "USPS Battlecard",
      description: "Competitive positioning and unique selling proposition analysis",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Zap,
      title: "Email Composition",
      description: "AI-powered sales outreach and follow-up email generation",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Shield,
      title: "Generate SOP",
      description: "Standard operating procedures for sales processes",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: BarChart,
      title: "Excel Helper",
      description: "Sales data analysis and reporting automation",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: TrendingUp,
      title: "Feasibility Check",
      description: "Market entry and opportunity viability assessment",
      color: "from-cyan-500 to-cyan-600"
=======
      icon: Bot,
      title: "9 AI Agents",
      description: "Specialized AI tools for business automation"
    },
    {
      icon: Sparkles,
      title: "Smart Processing",
      description: "Advanced AI with context-aware responses"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Enterprise-grade security with data protection"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized performance with intelligent caching"
    },
    {
      icon: Users,
      title: "User-Friendly",
      description: "Intuitive interface designed for productivity"
    },
    {
      icon: BarChart,
      title: "Task History",
      description: "Complete audit trail of all AI interactions"
>>>>>>> 320175aecb664ade96ffb95e59012c5e62a1005d
    }
  ];

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-secondary text-secondary-foreground py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="relative w-24 h-24 md:w-32 md:h-32 mb-8 mx-auto">
              <img
                src="/logo.svg"
                alt="SIS Group Enterprises"
                className="w-full h-full object-contain"
              />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              SIS Sales Intelligence Platform
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              A Market Leader in Security, Facility Management & Cash Logistics
            </p>
            <p className="text-lg mb-8 max-w-3xl mx-auto opacity-80">
              Transform your sales process with AI-powered company research, decision maker identification, 
              and competitive intelligence. Close more deals with data-driven insights.
            </p>
            
            {/* Call to Action */}
            <div className="mb-8">
              <Link href="/dashboard">
                <Button 
                  className="px-8 py-3 text-lg bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  Start Sales Intelligence Research
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm mt-4 opacity-75">
                ✅ Enterprise-Grade Security • ✅ Real-Time Data • ✅ AI-Powered Insights
              </p>
            </div>
=======
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Header */}
      <div className="flex flex-col items-center justify-center pt-16 pb-8 px-4">
        <div className="relative w-24 h-24 md:w-32 md:h-32 mb-8">
          <img
            src="/logo.svg"
            alt="SIS AI Helper"
            className="w-full h-full object-contain animate-pulse"
          />
        </div>
        
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Welcome to <span className="text-primary">SIS AI Helper</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            AI-Powered Security Services Dashboard
          </p>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Automate your business tasks with 9 specialized AI agents designed for security services providers.
            From company research to deployment planning, we've got you covered.
          </p>
          
          {/* Call to Action */}
          <div className="mb-8">
            <Link href="/dashboard">
              <Button 
                className="px-8 py-3 text-lg"
                size="lg"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-sm text-primary font-medium mt-4">
              ✅ Open Platform - No registration required
            </p>
>>>>>>> 320175aecb664ade96ffb95e59012c5e62a1005d
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {/* Sales Intelligence Features */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Sales Intelligence Features
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to identify opportunities and close deals faster
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className={`mx-auto w-12 h-12 bg-gradient-to-r ${feature.color === undefined ? "from-primary to-primary/90" : feature.color} rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Sales Tools */}
      <div className="bg-muted py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              AI-Powered Sales Tools
            </h2>
            <p className="text-lg text-muted-foreground">
              Specialized tools for every aspect of your sales process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salesTools.map((tool, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <div className={`mx-auto w-12 h-12 bg-gradient-to-r ${tool.color} rounded-lg flex items-center justify-center mb-4`}>
                    <tool.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{tool.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {tool.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Why Choose SIS Sales Intelligence?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Identify Decision Makers</h3>
                    <p className="text-muted-foreground">Find the right people with influence levels and contact strategies</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Understand Pain Points</h3>
                    <p className="text-muted-foreground">Discover business challenges and position your solution effectively</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Competitive Intelligence</h3>
                    <p className="text-muted-foreground">Analyze market position and differentiate from competitors</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">ROI-Focused Insights</h3>
                    <p className="text-muted-foreground">Calculate potential value and success metrics for every opportunity</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 rounded-lg">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">85%</div>
                <p className="text-muted-foreground mb-6">Increase in Sales Team Productivity</p>
                
                <div className="text-4xl font-bold text-primary mb-2">3x</div>
                <p className="text-muted-foreground mb-6">Faster Deal Closing</p>
                
                <div className="text-4xl font-bold text-primary mb-6">92%</div>
                <p className="text-muted-foreground">Accuracy in Decision Maker Identification</p>
                
                <Link href="/dashboard">
                  <Button className="w-full mt-6">
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
=======
      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Powerful Features for Your Business
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to automate and optimize your security services
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Agents Preview */}
      <div className="bg-card py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Meet Your AI Agents
            </h2>
            <p className="text-lg text-muted-foreground">
              Specialized tools for every business need
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-center">
            {[
              "Company Research", "Generate SOP", "Compose Email",
              "Excel Helper", "Feasibility Check", "Deployment Plan",
              "USPS Battlecard", "Disbandment Plan", "Slide Template"
            ].map((agent, index) => (
              <div 
                key={index}
                className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20 hover:shadow-md transition-shadow"
              >
                <div className="font-semibold text-foreground">{agent}</div>
              </div>
            ))}
>>>>>>> 320175aecb664ade96ffb95e59012c5e62a1005d
          </div>
        </div>
      </div>

      {/* Footer */}
<<<<<<< HEAD
      <div className="bg-secondary text-secondary-foreground py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About SIS Group</h3>
              <p className="text-sm opacity-80 mb-4">
                A market leader in security, facility management & cash logistics solutions. 
                Providing innovative services to businesses across multiple countries.
              </p>
              <div className="flex items-center gap-2">
                <img src="/logo.svg" alt="SIS Group" className="w-8 h-8" />
                <span className="font-semibold">SIS Group Enterprises</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Our Solutions</h3>
              <ul className="space-y-2 text-sm opacity-80">
                <li>Security Services</li>
                <li>Facility Management</li>
                <li>Cash Logistics</li>
                <li>Sales Intelligence Platform</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
              <p className="text-sm opacity-80 mb-4">
                Transform your sales process with AI-powered insights and intelligence.
              </p>
              <Link href="/dashboard">
                <Button variant="outline" className="text-secondary-foreground border-secondary-foreground hover:bg-secondary-foreground hover:text-secondary">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center text-sm opacity-60">
            <p>© 2024 SIS Group Enterprises. Sales Intelligence Platform.</p>
            <p className="mt-2">Built with enterprise-grade security and AI-powered insights.</p>
          </div>
=======
      <div className="bg-foreground text-background py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-lg mb-2">
            Built with ❤️ using Next.js, TypeScript, and modern AI technologies
          </p>
          <p className="text-muted-foreground">
            © 2024 SIS AI Helper. Maintained by Sid T
          </p>
>>>>>>> 320175aecb664ade96ffb95e59012c5e62a1005d
        </div>
      </div>
    </div>
  );
}