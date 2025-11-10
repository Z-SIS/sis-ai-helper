// Audit logger for deterministic agent system
import { DeterministicConfig, AuditLogEntry } from './deterministic-config';

export interface AuditStorage {
  save(entry: AuditLogEntry): Promise<void>;
  getEntries(filter?: {
    agentType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<AuditLogEntry[]>;
  clear(): Promise<void>;
}

export class InMemoryAuditStorage implements AuditStorage {
  private entries: AuditLogEntry[] = [];

  async save(entry: AuditLogEntry): Promise<void> {
    this.entries.push(entry);
  }

  async getEntries(filter?: {
    agentType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    let filtered = [...this.entries];

    if (filter?.agentType) {
      filtered = filtered.filter(entry => entry.agentType === filter.agentType);
    }

    if (filter?.startDate) {
      const start = new Date(filter.startDate);
      filtered = filtered.filter(entry => new Date(entry.timestamp) >= start);
    }

    if (filter?.endDate) {
      const end = new Date(filter.endDate);
      filtered = filtered.filter(entry => new Date(entry.timestamp) <= end);
    }

    if (filter?.limit) {
      filtered = filtered.slice(-filter.limit);
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async clear(): Promise<void> {
    this.entries = [];
  }
}

export class AuditLogger {
  private storage: AuditStorage;
  private config: DeterministicConfig;

  constructor(storage: AuditStorage, config: DeterministicConfig) {
    this.storage = storage;
    this.config = config;
  }

  async log(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
    const auditEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    await this.storage.save(auditEntry);
  }

  async getAuditLog(filter?: {
    agentType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    return this.storage.getEntries(filter);
  }

  async clearAuditLog(): Promise<void> {
    await this.storage.clear();
  }
}

// Factory function
export function createAuditLogger(config: DeterministicConfig): AuditLogger {
  const storage = new InMemoryAuditStorage();
  return new AuditLogger(storage, config);
}