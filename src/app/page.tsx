'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Sparkles, Shield, Zap, Users, BarChart, ArrowRight, Target, TrendingUp, DollarSign, Eye } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const features = [
    {
      icon: Sparkles,
      title: "RAG Technology",
      description: "Retrieval-Augmented Generation for accurate, knowledge-based responses from your documents",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Bot,
      title: "Smart Document Processing",
      description: "AI-powered analysis and understanding of PDFs, docs, and business files",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Shield,
      title: "Secure Knowledge Base",
      description: "Enterprise-grade security with encrypted document storage and access control",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Zap,
      title: "Instant Search",
      description: "Find information across thousands of documents in seconds with semantic search",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share knowledge and insights across your entire organization",
      color: "from-cyan-500 to-cyan-600"
    },
    {
      icon: BarChart,
      title: "Analytics & Insights",
      description: "Track usage patterns and gain insights from your knowledge base",
      color: "from-red-500 to-red-600"
    }
  ];

  const ragTools = [
    {
      icon: Target,
      title: "Document Upload",
      description: "Upload PDFs, Word docs, text files and more to build your knowledge base",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Users,
      title: "Smart Q&A",
      description: "Ask questions in natural language and get accurate, sourced answers",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Zap,
      title: "Semantic Search",
      description: "Find relevant information across all documents with intelligent search",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Shield,
      title: "Source Attribution",
      description: "Every answer includes source references for verification and trust",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: BarChart,
      title: "Knowledge Analytics",
      description: "Track document usage, search patterns, and knowledge gaps",
      color: "from-cyan-500 to-cyan-600"
    },
    {
      icon: TrendingUp,
      title: "Continuous Learning",
      description: "System improves as more documents and interactions are added",
      color: "from-red-500 to-red-600"
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
              Transform your business with AI-powered knowledge management. 
              Upload documents, ask questions, and get accurate answers instantly with our RAG technology.
            </p>
            
            {/* RAG Capability Section */}
            <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-6 rounded-lg mb-8 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-4 text-primary">
                🧠 RAG: Your Smart Knowledge Assistant
              </h2>
              <p className="text-base mb-6 text-center max-w-2xl mx-auto">
                <strong>What is RAG?</strong> It's like having a super-smart assistant who reads all your documents 
                and answers questions instantly with accurate information from your own files.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6">
                <div className="bg-background/50 p-4 rounded">
                  <div className="text-3xl mb-2">📚</div>
                  <h3 className="font-semibold mb-2">Knowledge Integration</h3>
                  <p>Upload PDFs, documents, and files. AI learns from your business context.</p>
                </div>
                <div className="bg-background/50 p-4 rounded">
                  <div className="text-3xl mb-2">🎯</div>
                  <h3 className="font-semibold mb-2">Smart Search</h3>
                  <p>Ask questions in plain English. Get precise answers with sources.</p>
                </div>
                <div className="bg-background/50 p-4 rounded">
                  <div className="text-3xl mb-2">⚡</div>
                  <h3 className="font-semibold mb-2">Instant Results</h3>
                  <p>No more manual searching. Get information in seconds, not hours.</p>
                </div>
              </div>
              
              {/* Business Impact */}
              <div className="bg-background/30 p-4 rounded">
                <h3 className="font-bold text-lg mb-3 text-center">🚀 How RAG Transforms Your Business</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span><strong>Save 10+ Hours Weekly:</strong> No more document hunting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span><strong>100% Accurate:</strong> Answers from your actual documents</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span><strong>Team Productivity:</strong> Everyone gets instant knowledge</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span><strong>Smart Decisions:</strong> Quick insights from business data</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="mb-8">
              <Link href="/dashboard">
                <Button 
                  className="px-8 py-3 text-lg bg-primary hover:bg-primary/90 text-primary-foreground mr-4"
                  size="lg"
                >
                  🚀 Launch AI Agent Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm mt-4 opacity-75">
                ✅ Smart Document Search • ✅ AI-Powered Answers • ✅ Real-time Insights • ✅ Secure Knowledge Base
              </p>
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
                Experience the power of AI-driven knowledge discovery with our intelligent agents
              </p>
              <Link href="/dashboard">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Launch AI Agent Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* RAG Platform Features */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              RAG Platform Features
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful capabilities that make knowledge management intelligent and efficient
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

      {/* RAG Tools */}
      <div className="bg-muted py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              RAG-Powered Tools
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to build and manage your intelligent knowledge base
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ragTools.map((tool, index) => (
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
                Why Choose SIS RAG Platform?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Document Intelligence</h3>
                    <p className="text-muted-foreground">AI understands your documents and provides accurate, sourced answers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Instant Knowledge Access</h3>
                    <p className="text-muted-foreground">Find information across thousands of documents in seconds</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">RAG Technology</h3>
                    <p className="text-muted-foreground">Advanced retrieval-augmented generation for precise responses</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Enterprise Security</h3>
                    <p className="text-muted-foreground">Bank-level encryption and secure document management</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 rounded-lg">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">98%</div>
                <p className="text-muted-foreground mb-6">Answer Accuracy</p>
                
                <div className="text-4xl font-bold text-primary mb-2">10x</div>
                <p className="text-muted-foreground mb-6">Faster Information Retrieval</p>
                
                <div className="text-4xl font-bold text-primary mb-6">100%</div>
                <p className="text-muted-foreground mb-6">Secure Document Management</p>
                
                <Link href="/dashboard">
                  <Button className="w-full mt-6">
                    Start Using AI Agent Platform
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
                <li><Link href="/dashboard" className="hover:opacity-100">AI Agent Dashboard</Link></li>
                <li><Link href="#" className="hover:opacity-100">About Us</Link></li>
                <li><Link href="#" className="hover:opacity-100">Services</Link></li>
                <li><Link href="#" className="hover:opacity-100">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">OUR SOLUTIONS</h3>
              <ul className="space-y-2 text-sm opacity-80">
                <li>RAG Knowledge Platform</li>
                <li>Document Intelligence</li>
                <li>Smart Search & Q&A</li>
                <li>Knowledge Analytics</li>
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