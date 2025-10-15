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
                  <div className="max-w-md mx-auto">
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                      Welcome to SIS AI Helper
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      Select an AI agent from the sidebar to get started with automating your security services tasks.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                      <div className="bg-card p-4 rounded-lg border border-border">
                        <h3 className="font-semibold text-foreground mb-2">Company Research</h3>
                        <p className="text-sm text-muted-foreground">Gather comprehensive information about companies and competitors.</p>
                      </div>
                      <div className="bg-card p-4 rounded-lg border border-border">
                        <h3 className="font-semibold text-foreground mb-2">SOP Generation</h3>
                        <p className="text-sm text-muted-foreground">Create detailed Standard Operating Procedures for your team.</p>
                      </div>
                      <div className="bg-card p-4 rounded-lg border border-border">
                        <h3 className="font-semibold text-foreground mb-2">Email Composition</h3>
                        <p className="text-sm text-muted-foreground">Draft professional emails for various business purposes.</p>
                      </div>
                      <div className="bg-card p-4 rounded-lg border border-border">
                        <h3 className="font-semibold text-foreground mb-2">Excel Helper</h3>
                        <p className="text-sm text-muted-foreground">Get Excel formulas, tips, and solutions for your data needs.</p>
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