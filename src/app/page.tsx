'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Sparkles, Shield, Zap, Users, BarChart, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const features = [
    {
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
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-blue-600">SIS AI Helper</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            AI-Powered Security Services Dashboard
          </p>
          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
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
            <p className="text-sm text-green-600 font-medium mt-4">
              ✅ Open Platform - No registration required
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Powerful Features for Your Business
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to automate and optimize your security services
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
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
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Meet Your AI Agents
            </h2>
            <p className="text-lg text-gray-600">
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
                className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100 hover:shadow-md transition-shadow"
              >
                <div className="font-semibold text-gray-800">{agent}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-lg mb-2">
            Built with ❤️ using Next.js, TypeScript, and modern AI technologies
          </p>
          <p className="text-gray-400">
            © 2024 SIS AI Helper. Maintained by Sid T
          </p>
        </div>
      </div>
    </div>
  );
}