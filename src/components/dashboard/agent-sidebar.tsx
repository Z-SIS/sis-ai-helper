'use client';

import { useState } from 'react';
import { 
  Building2, 
  FileText, 
  Mail, 
  Table, 
  CheckCircle, 
  Rocket, 
  Target, 
  XCircle, 
  Presentation,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentMetadata } from '@/shared/schemas';

// Icon mapping function
function getIconForCategory(category: string) {
  switch (category) {
    case 'research': return Building2;
    case 'documentation': return FileText;
    case 'communication': return Mail;
    case 'productivity': return Table;
    case 'analysis': return CheckCircle;
    case 'operations': return Rocket;
    case 'sales': return Target;
    case 'presentation': return Presentation;
    default: return Building2;
  }
}

const agents = Object.entries(AgentMetadata).map(([id, metadata]) => ({
  id,
  name: metadata.name,
  description: metadata.description,
  category: metadata.category,
  icon: getIconForCategory(metadata.category),
}));

// Settings option
const settingsOption = {
  id: 'settings',
  name: 'Settings',
  description: 'Profile & API Connection Status',
  category: 'system',
  icon: Settings,
};

interface AgentSidebarProps {
  selectedAgent: string | null;
  onAgentSelect: (agentId: string) => void;
}

export function AgentSidebar({ selectedAgent, onAgentSelect }: AgentSidebarProps) {
  const allOptions = [...agents, settingsOption];

  return (
    <div className="w-64 bg-card border-r border-border h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">AI Agents</h2>
        <div className="space-y-2">
          {allOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => onAgentSelect(option.id)}
                className={cn(
                  'w-full flex items-start space-x-3 p-3 rounded-lg text-left transition-colors',
                  selectedAgent === option.id
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'hover:bg-accent text-foreground'
                )}
              >
                <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{option.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}