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
  Presentation 
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

interface AgentSidebarProps {
  selectedAgent: string | null;
  onAgentSelect: (agentId: string) => void;
}

export function AgentSidebar({ selectedAgent, onAgentSelect }: AgentSidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Agents</h2>
        <div className="space-y-2">
          {agents.map((agent) => {
            const Icon = agent.icon;
            return (
              <button
                key={agent.id}
                onClick={() => onAgentSelect(agent.id)}
                className={cn(
                  'w-full flex items-start space-x-3 p-3 rounded-lg text-left transition-colors',
                  selectedAgent === agent.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'hover:bg-gray-50 text-gray-700'
                )}
              >
                <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{agent.name}</div>
                  <div className="text-sm text-gray-500 mt-1">{agent.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}