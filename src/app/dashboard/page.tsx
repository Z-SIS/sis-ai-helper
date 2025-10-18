'use client';

import { useState } from 'react';
import { AgentSidebar } from '@/components/dashboard/agent-sidebar';
import { CompanyResearchForm } from '@/components/dashboard/forms/CompanyResearchForm';
import { SopGenerationForm } from '@/components/dashboard/forms/SopGenerationForm';
import { EmailCompositionForm } from '@/components/dashboard/forms/EmailCompositionForm';
import { ExcelHelperForm } from '@/components/dashboard/forms/ExcelHelperForm';
import { FeasibilityCheckForm } from '@/components/dashboard/forms/FeasibilityCheckForm';
import { DeploymentPlanForm } from '@/components/dashboard/forms/DeploymentPlanForm';
import { UspsBattlecardForm } from '@/components/dashboard/forms/UspsBattlecardForm';
import { DisbandmentPlanForm } from '@/components/dashboard/forms/DisbandmentPlanForm';
import { SlideTemplateForm } from '@/components/dashboard/forms/SlideTemplateForm';
import { HistorySidebar } from '@/components/dashboard/history-sidebar';
<<<<<<< HEAD
import { SupabaseSetupWizard } from '@/components/dashboard/supabase-setup-wizard';
=======
>>>>>>> ce90f203a7f4fdbb224ace3244ef0e4aad1043b2

const agentForms = {
  'company-research': CompanyResearchForm,
  'generate-sop': SopGenerationForm,
  'compose-email': EmailCompositionForm,
  'excel-helper': ExcelHelperForm,
  'feasibility-check': FeasibilityCheckForm,
  'deployment-plan': DeploymentPlanForm,
  'usps-battlecard': UspsBattlecardForm,
  'disbandment-plan': DisbandmentPlanForm,
  'slide-template': SlideTemplateForm,
};

export default function DashboardPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const SelectedForm = selectedAgent ? agentForms[selectedAgent as keyof typeof agentForms] : null;

  return (
    <div className="h-screen flex bg-background">
      <AgentSidebar 
        selectedAgent={selectedAgent}
        onAgentSelect={setSelectedAgent}
      />
      
      <div className="flex-1 flex flex-col">
        <main className="flex-1 flex">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {SelectedForm ? (
                <SelectedForm />
              ) : (
                <div className="text-center py-12">
                  <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-foreground mb-4">
                      SIS Sales Intelligence Dashboard
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8">
                      Transform your sales process with AI-powered insights. Select a tool from the sidebar to get started with comprehensive sales intelligence and research.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                      <div className="bg-card p-6 rounded-lg border-2 border-primary/20 hover:border-primary/40 transition-colors">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                          <div className="w-6 h-6 bg-primary rounded-full" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">Company Research</h3>
                        <p className="text-sm text-muted-foreground">Generate comprehensive sales intelligence with decision maker identification, pain points, and competitive analysis.</p>
                      </div>
                      <div className="bg-card p-6 rounded-lg border-2 border-blue-500/20 hover:border-blue-500/40 transition-colors">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                          <div className="w-6 h-6 bg-blue-500 rounded-full" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">USPS Battlecard</h3>
                        <p className="text-sm text-muted-foreground">Create competitive positioning cards and unique selling proposition analysis.</p>
                      </div>
                      <div className="bg-card p-6 rounded-lg border-2 border-green-500/20 hover:border-green-500/40 transition-colors">
                        <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                          <div className="w-6 h-6 bg-green-500 rounded-full" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">Email Composition</h3>
                        <p className="text-sm text-muted-foreground">Draft AI-powered sales outreach and follow-up emails for maximum impact.</p>
                      </div>
                      <div className="bg-card p-6 rounded-lg border-2 border-purple-500/20 hover:border-purple-500/40 transition-colors">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                          <div className="w-6 h-6 bg-purple-500 rounded-full" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">SOP Generation</h3>
                        <p className="text-sm text-muted-foreground">Create standard operating procedures for your sales team and processes.</p>
                      </div>
                      <div className="bg-card p-6 rounded-lg border-2 border-orange-500/20 hover:border-orange-500/40 transition-colors">
                        <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                          <div className="w-6 h-6 bg-orange-500 rounded-full" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">Excel Helper</h3>
                        <p className="text-sm text-muted-foreground">Analyze sales data and create automated reporting dashboards.</p>
                      </div>
                      <div className="bg-card p-6 rounded-lg border-2 border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
                        <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
                          <div className="w-6 h-6 bg-cyan-500 rounded-full" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">Feasibility Check</h3>
                        <p className="text-sm text-muted-foreground">Assess market entry viability and opportunity potential.</p>
                      </div>
                    </div>
                    
<<<<<<< HEAD
                    {/* Supabase Setup Section */}
                    <div className="mt-8">
                      <SupabaseSetupWizard />
                    </div>
                    
=======
>>>>>>> ce90f203a7f4fdbb224ace3244ef0e4aad1043b2
                    <div className="mt-12 p-8 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                      <h3 className="text-xl font-semibold text-foreground mb-4">Start with Sales Intelligence</h3>
                      <p className="text-muted-foreground mb-6">
                        Get comprehensive company research including decision makers, pain points, competitive landscape, and sales opportunities. 
                        Our AI analyzes multiple data sources to provide actionable insights for your sales team.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">85%</div>
                          <div className="text-sm text-muted-foreground">Increase in productivity</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">3x</div>
                          <div className="text-sm text-muted-foreground">Faster deal closing</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">92%</div>
                          <div className="text-sm text-muted-foreground">Accuracy in insights</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <HistorySidebar />
        </main>
      </div>
    </div>
  );
}