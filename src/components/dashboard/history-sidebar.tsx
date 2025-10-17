'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Clock, FileText, Building2, Mail, Table, CheckCircle, Rocket, Target, XCircle, Presentation } from 'lucide-react';
import { db } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const agentIcons = {
  'company-research': Building2,
  'generate-sop': FileText,
  'compose-email': Mail,
  'excel-helper': Table,
  'feasibility-check': CheckCircle,
  'deployment-plan': Rocket,
  'usps-battlecard': Target,
  'disbandment-plan': XCircle,
  'slide-template': Presentation,
};

interface TaskHistory {
  id: string;
  agent_type: string;
  input_data: any;
  output_data: any;
  created_at: string;
}

export function HistorySidebar() {
  const [tasks, setTasks] = useState<TaskHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTaskHistory();
  }, []);

  const loadTaskHistory = async () => {
    try {
      // Check if Supabase is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.log('Supabase not configured - using demo task history');
        // Provide demo data instead of empty array
        setTasks([
          {
            id: 'demo-1',
            agent_type: 'generate-sop',
            input_data: { processName: 'Employee Onboarding' },
            output_data: null,
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: 'demo-2', 
            agent_type: 'company-research',
            input_data: { companyName: 'Tech Corp' },
            output_data: null,
            created_at: new Date(Date.now() - 7200000).toISOString(),
          }
        ]);
        return;
      }
      
      // Use a default user ID for open platform
      const history = await db.getTaskHistory('open-user', 20);
      setTasks(history);
    } catch (error) {
      console.error('Failed to load task history:', error);
      // Provide demo data on error as well
      setTasks([
        {
          id: 'demo-1',
          agent_type: 'generate-sop',
          input_data: { processName: 'Employee Onboarding' },
          output_data: null,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getAgentName = (agentType: string) => {
    const agentNames: Record<string, string> = {
      'company-research': 'Company Research',
      'generate-sop': 'Generate SOP',
      'compose-email': 'Compose Email',
      'excel-helper': 'Excel Helper',
      'feasibility-check': 'Feasibility Check',
      'deployment-plan': 'Deployment Plan',
      'usps-battlecard': 'USPS Battlecard',
      'disbandment-plan': 'Disbandment Plan',
      'slide-template': 'Slide Template',
    };
    return agentNames[agentType] || agentType;
  };

  const getInputSummary = (inputData: any, agentType: string) => {
    switch (agentType) {
      case 'company-research':
        return inputData.companyName || 'Unknown company';
      case 'generate-sop':
        return inputData.processName || 'Unknown process';
      case 'compose-email':
        return inputData.subject || 'No subject';
      case 'excel-helper':
        return inputData.question?.substring(0, 50) + '...' || 'Unknown question';
      case 'feasibility-check':
        return inputData.projectName || 'Unknown project';
      case 'deployment-plan':
        return inputData.projectName || 'Unknown project';
      case 'usps-battlecard':
        return `${inputData.companyName} vs ${inputData.competitor}`;
      case 'disbandment-plan':
        return inputData.projectName || 'Unknown project';
      case 'slide-template':
        return inputData.topic || 'Unknown topic';
      default:
        return 'Unknown input';
    }
  };

  if (loading) {
    return (
      <div className="w-80 bg-card border-l border-border h-full overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-foreground mb-4">Task History</h2>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-card border-l border-border h-full overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Task History</h2>
          <Clock className="w-4 h-4 text-muted-foreground" />
        </div>
        
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No tasks yet</p>
            <p className="text-muted-foreground/70 text-xs mt-1">Start using an AI agent to see your history</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const Icon = agentIcons[task.agent_type as keyof typeof agentIcons] || FileText;
              return (
                <div
                  key={task.id}
                  className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <Icon className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-foreground">
                        {getAgentName(task.agent_type)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {getInputSummary(task.input_data, task.agent_type)}
                      </div>
                      <div className="text-xs text-muted-foreground/70 mt-2">
                        {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}