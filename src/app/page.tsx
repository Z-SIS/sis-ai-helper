'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Sparkles, Shield, Zap, Users, BarChart, ArrowRight, Target, TrendingUp, DollarSign, Eye } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const features = [
    {
      icon: Target,
      title: "Sales Intelligence",
      description: "AI-powered company research with decision maker identification and pain point analysis",
      color: "from-red-700 to-red-800" // SIS brand color
    },
    {
      icon: TrendingUp,
      title: "Market Insights",
      description: "Competitive landscape analysis and positioning opportunities",
      color: "from-gray-800 to-gray-900" // Supporting color
    },
    {
      icon: DollarSign,
      title: "Financial Health",
      description: "Revenue analysis, funding stages, and growth potential assessment",
      color: "from-red-700 to-red-800" // SIS brand color
    },
    {
      icon: Users,
      title: "Decision Makers",
      description: "Identify key stakeholders and their influence levels",
      color: "from-gray-800 to-gray-900" // Supporting color
    },
    {
      icon: Eye,
      title: "Pain Points",
      description: "Discover business challenges and solution opportunities",
      color: "from-red-700 to-red-800" // SIS brand color
    },
    {
      icon: BarChart,
      title: "ROI Analysis",
      description: "Calculate potential value and success metrics for opportunities",
      color: "from-gray-800 to-gray-900" // Supporting color
    }
  ];

  const salesTools = [
    {
      icon: Target,
      title: "Company Research",
      description: "Comprehensive sales intelligence with decision maker identification",
      color: "from-red-700 to-red-800" // SIS brand color
    },
    {
      icon: Users,
      title: "USPS Battlecard",
      description: "Competitive positioning and unique selling proposition analysis",
      color: "from-gray-800 to-gray-900" // Supporting color
    },
    {
      icon: Zap,
      title: "Email Composition",
      description: "AI-powered sales outreach and follow-up email generation",
      color: "from-red-700 to-red-800" // SIS brand color
    },
    {
      icon: Shield,
      title: "Generate SOP",
      description: "Standard operating procedures for sales processes",
      color: "from-gray-800 to-gray-900" // Supporting color
    },
    {
      icon: BarChart,
      title: "Excel Helper",
      description: "Sales data analysis and reporting automation",
      color: "from-red-700 to-red-800" // SIS brand color
    },
    {
      icon: TrendingUp,
      title: "Feasibility Check",
      description: "Market entry and opportunity viability assessment",
      color: "from-gray-800 to-gray-900" // Supporting color
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-red-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="relative w-24 h-24 md:w-32 md:h-32 mb-8 mx-auto">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                <span className="text-red-700 font-bold text-2xl md:text-3xl">SIS</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              SIS Sales Intelligence Platform
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-95">
              A Market Leader in Security, Facility Management & Cash Logistics
            </p>
            <p className="text-lg mb-8 max-w-3xl mx-auto opacity-90">
              Transform your sales process with AI-powered company research, decision maker identification, 
              and competitive intelligence. Close more deals with data-driven insights.
            </p>
            
            {/* Call to Action */}
            <div className="mb-8">
              <Link href="/dashboard">
                <Button 
                  className="px-8 py-3 text-lg bg-white text-red-700 hover:bg-gray-100"
                  size="lg"
                >
                  Start Sales Intelligence Research
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm mt-4 opacity-90">
                ✅ Enterprise-Grade Security • ✅ Real-Time Data • ✅ AI-Powered Insights
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Intelligence Features */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Sales Intelligence Features
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to identify opportunities and close deals faster
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className={`mx-auto w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg text-gray-800">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Sales Tools */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              AI-Powered Sales Tools
            </h2>
            <p className="text-lg text-gray-600">
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
                  <CardTitle className="text-lg text-gray-800">{tool.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-600">
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
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Why Choose SIS Sales Intelligence?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Identify Decision Makers</h3>
                    <p className="text-gray-600">Find the right people with influence levels and contact strategies</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Understand Pain Points</h3>
                    <p className="text-gray-600">Discover business challenges and position your solution effectively</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Competitive Intelligence</h3>
                    <p className="text-gray-600">Analyze market position and differentiate from competitors</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">ROI-Focused Insights</h3>
                    <p className="text-gray-600">Calculate potential value and success metrics for every opportunity</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-700/10 to-red-700/5 p-8 rounded-lg border border-red-700/20">
              <div className="text-center">
                <div className="text-4xl font-bold text-red-700 mb-2">85%</div>
                <p className="text-gray-600 mb-6">Increase in Sales Team Productivity</p>
                
                <div className="text-4xl font-bold text-red-700 mb-2">3x</div>
                <p className="text-gray-600 mb-6">Faster Deal Closing</p>
                
                <div className="text-4xl font-bold text-red-700 mb-6">92%</div>
                <p className="text-gray-600 mb-6">Accuracy in Decision Maker Identification</p>
                
                <Link href="/dashboard">
                  <Button className="w-full mt-6 bg-red-700 hover:bg-red-800 text-white">
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-red-400">ABOUT SIS AI HELPER</h3>
              <p className="text-sm opacity-80">
                SIS AI Helper is a cutting-edge sales intelligence platform designed for security services companies. 
                Leverage AI-powered insights to identify opportunities, understand prospects, and close deals faster.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-red-400">USEFUL LINKS</h3>
              <ul className="space-y-2 text-sm opacity-80">
                <li><Link href="/dashboard" className="hover:text-red-400 transition-colors">Dashboard</Link></li>
                <li><Link href="#" className="hover:text-red-400 transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-red-400 transition-colors">Services</Link></li>
                <li><Link href="#" className="hover:text-red-400 transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-red-400">AI SOLUTIONS</h3>
              <ul className="space-y-2 text-sm opacity-80">
                <li>Company Research</li>
                <li>Email Composition</li>
                <li>SOP Generation</li>
                <li>Competitive Analysis</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm opacity-60">
            © 2024 SIS AI Helper. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}