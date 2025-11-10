export interface AuditLogger {
  save(entry: AuditLogEntry): Promise<void>;
  getEntries(filter?: {
    startDate?: string;
    endDate?: string;
    agentType?: string;
    limit?: number;
  }): Promise<AuditLogEntry[]>;
  clear(): Promise<void>;
}

export interface AuditLogEntry {
  timestamp: string;
  agentType: string;
  sessionId?: string;
  userId?: string;
  requestId?: string;
  input: any;
  output: any;
  confidence: number;
  success: boolean;
  needsReview: boolean;
  warnings: string[];
  errors: string[];
  metadata?: Record<string, any>;
}