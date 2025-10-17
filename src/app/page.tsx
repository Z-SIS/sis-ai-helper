'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Sparkles, Shield, Zap, Users, BarChart, ArrowRight, Target, TrendingUp, DollarSign, Eye } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const features = [
    {
      icon: Bot,
      title: "Intelligent Agents",
      description: "Self-learning AI agents with memory, context awareness, and adaptive behavior",
      color: "from-red-500 to-red-600"
    },
    {
      icon: Sparkles,
      title: "RAG Technology",
      description: "Retrieval-Augmented Generation for accurate, knowledge-based responses",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Shield,
      title: "Memory System",
      description: "Short-term, long-term, and working memory for persistent learning",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Zap,
      title: "Context Awareness",
      description: "Understand conversation context and user intent for relevant responses",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Users,
      title: "Multi-Agent Orchestration",
      description: "Coordinate multiple specialized agents for complex tasks",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: BarChart,
      title: "Learning Analytics",
      description: "Track performance, identify patterns, and optimize agent behavior",
      color: "from-cyan-500 to-cyan-600"
    }
  ];

  const agentTools = [
    {
      icon: Target,
      title: "Company Research",
      description: "AI-powered company research with comprehensive business intelligence",
      color: "from-red-500 to-red-600"
    },
    {
      icon: Users,
      title: "Email Generation",
      description: "Context-aware email composition with personalization",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Zap,
      title: "Document Creation",
      description: "Generate various business documents with AI assistance",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Shield,
      title: "Data Analysis",
      description: "Analyze complex data and provide actionable insights",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: BarChart,
      title: "Task Automation",
      description: "Automate repetitive tasks with intelligent workflows",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: TrendingUp,
      title: "Knowledge Management",
      description: "Build and maintain a knowledge base for continuous learning",
      color: "from-cyan-500 to-cyan-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-secondary text-secondary-foreground py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              SIS AI Knowledge Platform
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              A Market Leader in Security, Facility Management & Cash Logistics
            </p>
            <p className="text-lg mb-8 max-w-3xl mx-auto opacity-80">
              Experience the power of intelligent AI agents with memory, learning capabilities, and RAG technology. 
              Transform your business processes with context-aware, self-learning agents that adapt to your needs.
            </p>
            
            {/* RAG Capability Highlight */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 rounded-lg mb-8 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-4 text-foreground">
                🧠 RAG Technology: The Power of Knowledge-Driven AI
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">📚</div>
                  <h3 className="font-semibold mb-2">Smart Knowledge Base</h3>
                  <p className="text-muted-foreground">
                    Upload your documents and let AI learn from your company's knowledge
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">🎯</div>
                  <h3 className="font-semibold mb-2">Accurate Answers</h3>
                  <p className="text-muted-foreground">
                    Get precise responses based on your actual business data and documents
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">⚡</div>
                  <h3 className="font-semibold mb-2">Instant Insights</h3>
                  <p className="text-muted-foreground">
                    Find information instantly across all your knowledge sources
                  </p>
                </div>
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="mb-8">
              <Link href="/rag">
                <Button 
                  className="px-8 py-3 text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white mr-4"
                  size="lg"
                >
                  🚀 Try RAG Knowledge Base
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button 
                  className="px-8 py-3 text-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  size="lg"
                  variant="outline"
                >
                  Launch AI Agent Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <div className="mt-6 space-y-2">
                <p className="text-sm opacity-75">
                  ✅ <strong>Smart Document Search</strong> - Find answers in your PDFs, docs, and files instantly
                </p>
                <p className="text-sm opacity-75">
                  ✅ <strong>Knowledge-Based Responses</strong> - AI answers using your actual business data
                </p>
                <p className="text-sm opacity-75">
                  ✅ <strong>Continuous Learning</strong> - System gets smarter as you add more documents
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RAG Technology Benefits */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              🎯 How RAG Technology Transforms Your Business
            </h2>
            <p className="text-lg text-muted-foreground">
              Experience the power of AI that truly understands your business
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-blue-600">📈 Business Impact</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <div>
                    <strong>90% Faster Information Retrieval</strong>
                    <p className="text-sm text-muted-foreground">Find critical business data in seconds instead of hours</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <div>
                    <strong>85% Improvement in Decision Making</strong>
                    <p className="text-sm text-muted-foreground">Make informed decisions with accurate, data-driven insights</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <div>
                    <strong>75% Reduction in Training Time</strong>
                    <p className="text-sm text-muted-foreground">New employees get instant access to company knowledge</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-purple-600">🔧 Key Capabilities</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">🧠</span>
                  <div>
                    <strong>Intelligent Document Understanding</strong>
                    <p className="text-sm text-muted-foreground">AI comprehends context across all your documents</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">🎯</span>
                  <div>
                    <strong>Precise Question Answering</strong>
                    <p className="text-sm text-muted-foreground">Get exact answers with source citations</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">📚</span>
                  <div>
                    <strong>Continuous Knowledge Growth</strong>
                    <p className="text-sm text-muted-foreground">System learns and improves with each interaction</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-lg max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold mb-3">🚀 Ready to Transform Your Knowledge Management?</h3>
              <p className="mb-4">
                Upload your first document and experience the power of AI-driven knowledge discovery
              </p>
              <Link href="/rag">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Start Using RAG Technology
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* AI Agent Features */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              AI Agent Capabilities
            </h2>
            <p className="text-lg text-muted-foreground">
              Advanced features that make our AI agents intelligent and adaptive
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

      {/* AI Agent Tools */}
      <div className="bg-muted py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              AI-Powered Tools
            </h2>
            <p className="text-lg text-muted-foreground">
              Specialized tools for every aspect of your business operations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agentTools.map((tool, index) => (
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
                Why Choose SIS AI Agents?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Memory & Learning</h3>
                    <p className="text-muted-foreground">Agents learn from interactions and improve over time</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Context Awareness</h3>
                    <p className="text-muted-foreground">Understand conversation context and user intent</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">RAG Technology</h3>
                    <p className="text-muted-foreground">Knowledge-based responses with real-time research</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Multi-Agent Orchestration</h3>
                    <p className="text-muted-foreground">Coordinate specialized agents for complex tasks</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 rounded-lg">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">95%</div>
                <p className="text-muted-foreground mb-6">Task Completion Accuracy</p>
                
                <div className="text-4xl font-bold text-primary mb-2">5x</div>
                <p className="text-muted-foreground mb-6">Faster Task Processing</p>
                
                <div className="text-4xl font-bold text-primary mb-6">100%</div>
                <p className="text-muted-foreground mb-6">Data Privacy & Security</p>
                
                <Link href="/dashboard">
                  <Button className="w-full mt-6">
                    Start Using AI Agents
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
            <h3 className="text-lg font-semibold mb-4">ABOUT SIS GROUP</h3>
              <p className="text-sm opacity-80">
                SIS Group Enterprises is an Indian multinational conglomerate headquartered in Delhi.
                The company is engaged in providing security, facility management, and cash logistics services.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">USEFUL LINKS</h3>
              <ul className="space-y-2 text-sm opacity-80">
                <li><Link href="/dashboard" className="hover:opacity-100">Dashboard</Link></li>
                <li><Link href="/debug" className="hover:opacity-100">Debug Dashboard</Link></li>
                <li><Link href="#" className="hover:opacity-100">About Us</Link></li>
                <li><Link href="#" className="hover:opacity-100">Services</Link></li>
                <li><Link href="#" className="hover:opacity-100">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">OUR SOLUTIONS</h3>
              <ul className="space-y-2 text-sm opacity-80">
                <li>AI Agent Management</li>
                <li>Task Orchestration</li>
                <li>Memory & Learning Systems</li>
                <li>RAG Technology</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center text-sm opacity-60">
            © 2024 SIS Group Enterprises. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}