'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Users, 
  Target, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Brain,
  Shield,
  Zap,
  Globe,
  Award,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Star,
  Eye,
  Lightbulb
} from 'lucide-react';
import { CompanyResearchOutput } from '@/shared/schemas';

interface SalesIntelligenceReportProps {
  data: CompanyResearchOutput;
}

export function SalesIntelligenceReport({ data }: SalesIntelligenceReportProps) {
  const getInfluenceColor = (influence: string) => {
    switch (influence) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{data.companyName}</h1>
            <p className="text-lg opacity-90">Sales Intelligence Report</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{data.confidenceScore}%</div>
            <div className="text-sm opacity-75">Confidence Score</div>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium text-sm text-foreground mb-1">Headquarters</h4>
              <p className="text-sm text-muted-foreground">{data.companyOverview.headquarters}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium text-sm text-foreground mb-1">Founded</h4>
              <p className="text-sm text-muted-foreground">{data.companyOverview.foundedYear}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium text-sm text-foreground mb-1">Website</h4>
              <a 
                href={data.companyOverview.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {data.companyOverview.website}
              </a>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium text-sm text-foreground mb-1">Primary Business</h4>
              <p className="text-sm text-muted-foreground">{data.businessModel.primaryBusiness}</p>
            </div>
          </div>
          
          {data.companyOverview.description && (
            <div className="mt-4">
              <h4 className="font-medium text-sm text-foreground mb-2">Company Overview</h4>
              <p className="text-sm text-muted-foreground">{data.companyOverview.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sales Intelligence Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Decision Makers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Key Decision Makers
            </CardTitle>
            <CardDescription>Identify the right people to contact</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.salesIntelligence.decisionMakers.map((person, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{person.title}</div>
                    <div className="text-xs text-muted-foreground">{person.department}</div>
                  </div>
                  <Badge className={getInfluenceColor(person.influence)}>
                    {person.influence} influence
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pain Points */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              Key Pain Points
            </CardTitle>
            <CardDescription>Areas where your solution can help</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.salesIntelligence.painPoints.map((pain, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{pain}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Financial Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium text-sm text-foreground mb-1">Revenue</h4>
              <p className="text-lg font-semibold text-primary">{data.financials.revenue || 'N/A'}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium text-sm text-foreground mb-1">Funding Stage</h4>
              <p className="text-sm text-muted-foreground">{data.financials.fundingStage || 'N/A'}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium text-sm text-foreground mb-1">Valuation</h4>
              <p className="text-sm text-muted-foreground">{data.financials.estimatedValuation || 'N/A'}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium text-sm text-foreground mb-1">Growth Rate</h4>
              <p className="text-sm text-muted-foreground">{data.financials.growthRate || 'N/A'}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium text-sm text-foreground mb-1">Profitability</h4>
              <p className="text-sm text-muted-foreground">{data.financials.profitability || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Position */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Market Position
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-sm text-foreground mb-3">Competitive Advantages</h4>
              <div className="space-y-2">
                {data.marketPosition.competitiveAdvantages.map((advantage, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">{advantage}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm text-foreground mb-3">Unique Value Proposition</h4>
              <p className="text-sm text-muted-foreground">{data.marketPosition.uniqueValueProposition}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Sales Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-sm text-foreground mb-3">Entry Points</h4>
              <div className="space-y-2">
                {data.salesOpportunities.entryPoints.map((point, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm text-foreground mb-3">Potential Value</h4>
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-lg font-semibold text-primary">{data.salesOpportunities.potentialValue}</p>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-sm text-foreground mb-3">Timing</h4>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">{data.salesOpportunities.timing}</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm text-foreground mb-3">Recommended Approach</h4>
              <p className="text-sm text-muted-foreground">{data.salesOpportunities.recommendedApproach}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Sales Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-sm text-foreground mb-3">Key Talking Points</h4>
              <div className="space-y-2">
                {data.salesRecommendations.keyTalkingPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">{point}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm text-foreground mb-3">Next Steps</h4>
              <div className="space-y-2">
                {data.salesRecommendations.nextSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-sm text-muted-foreground">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Last updated: {new Date(data.lastUpdated).toLocaleDateString()}</p>
        <p className="mt-1">Generated by SIS Sales Intelligence Platform</p>
      </div>
    </div>
  );
}