import { 
  AgentInputSchemas, 
  AgentOutputSchemas,
  AgentMetadata,
  AgentType,
  AgentInput,
  AgentOutput
} from '@/shared/schemas';

// ============================================================================
// SCHEMA INTEGRITY TYPES
// ============================================================================

export interface SchemaIntegrityResult {
  isValid: boolean;
  errors: SchemaError[];
  warnings: SchemaWarning[];
  summary: {
    totalAgents: number;
    validAgents: number;
    invalidAgents: number;
    agentsWithWarnings: number;
  };
}

export interface SchemaError {
  agentType: AgentType | 'global';
  type: 'input' | 'output';
  message: string;
  code: string;
  severity: 'critical' | 'error';
}

export interface SchemaWarning {
  agentType: AgentType | 'global';
  type: 'input' | 'output' | 'metadata';
  message: string;
  code: string;
}

export interface SchemaTestResult {
  agentType: AgentType;
  inputTests: TestResult[];
  outputTests: TestResult[];
  overallStatus: 'pass' | 'fail' | 'warning';
}

export interface TestResult {
  testName: string;
  status: 'pass' | 'fail' | 'skip';
  message?: string;
  duration?: number;
}

// ============================================================================
// SCHEMA INTEGRITY CHECKER
// ============================================================================

export class SchemaIntegrityChecker {
  private static instance: SchemaIntegrityChecker;
  
  public static getInstance(): SchemaIntegrityChecker {
    if (!SchemaIntegrityChecker.instance) {
      SchemaIntegrityChecker.instance = new SchemaIntegrityChecker();
    }
    return SchemaIntegrityChecker.instance;
  }
  
  // Main integrity check
  public async checkIntegrity(): Promise<SchemaIntegrityResult> {
    console.log('🔍 Starting schema integrity check...');
    
    const errors: SchemaError[] = [];
    const warnings: SchemaWarning[] = [];
    
    const agentTypes = Object.keys(AgentInputSchemas) as AgentType[];
    
    for (const agentType of agentTypes) {
      console.log(`  Checking agent: ${agentType}`);
      
      // Check input schema
      const inputErrors = this.checkInputSchema(agentType);
      errors.push(...inputErrors);
      
      // Check output schema
      const outputErrors = this.checkOutputSchema(agentType);
      errors.push(...outputErrors);
      
      // Check metadata
      const metadataWarnings = this.checkMetadata(agentType);
      warnings.push(...metadataWarnings);
      
      // Check schema consistency
      const consistencyWarnings = this.checkSchemaConsistency(agentType);
      warnings.push(...consistencyWarnings);
    }
    
    // Check global consistency
    const globalWarnings = this.checkGlobalConsistency();
    warnings.push(...globalWarnings);
    
    const totalAgents = agentTypes.length;
    const invalidAgents = new Set(errors.map(e => e.agentType)).size;
    const agentsWithWarnings = new Set(warnings.map(w => w.agentType)).size;
    const validAgents = totalAgents - invalidAgents;
    
    const result: SchemaIntegrityResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalAgents,
        validAgents,
        invalidAgents,
        agentsWithWarnings,
      },
    };
    
    console.log(`✅ Schema integrity check completed:`);
    console.log(`   Total agents: ${totalAgents}`);
    console.log(`   Valid agents: ${validAgents}`);
    console.log(`   Invalid agents: ${invalidAgents}`);
    console.log(`   Agents with warnings: ${agentsWithWarnings}`);
    console.log(`   Errors: ${errors.length}`);
    console.log(`   Warnings: ${warnings.length}`);
    
    return result;
  }
  
  // Test schemas with sample data
  public async testSchemas(): Promise<SchemaTestResult[]> {
    console.log('🧪 Starting schema tests...');
    
    const results: SchemaTestResult[] = [];
    const agentTypes = Object.keys(AgentInputSchemas) as AgentType[];
    
    for (const agentType of agentTypes) {
      const result = await this.testAgentSchema(agentType);
      results.push(result);
    }
    
    return results;
  }
  
  // Private methods
  private checkInputSchema(agentType: AgentType): SchemaError[] {
    const errors: SchemaError[] = [];
    
    try {
      const schema = AgentInputSchemas[agentType];
      
      if (!schema) {
        errors.push({
          agentType,
          type: 'input',
          message: 'Input schema is missing',
          code: 'MISSING_INPUT_SCHEMA',
          severity: 'critical',
        });
        return errors;
      }
      
      // Test schema parsing
      const testResult = schema.safeParse({});
      if (!testResult.success && testResult.error.issues.length === 0) {
        errors.push({
          agentType,
          type: 'input',
          message: 'Input schema produces no validation errors for empty object',
          code: 'PERMISSIVE_INPUT_SCHEMA',
          severity: 'error',
        });
      }
      
    } catch (error) {
      errors.push({
        agentType,
        type: 'input',
        message: `Input schema error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: 'INPUT_SCHEMA_ERROR',
        severity: 'critical',
      });
    }
    
    return errors;
  }
  
  private checkOutputSchema(agentType: AgentType): SchemaError[] {
    const errors: SchemaError[] = [];
    
    try {
      const schema = AgentOutputSchemas[agentType];
      
      if (!schema) {
        errors.push({
          agentType,
          type: 'output',
          message: 'Output schema is missing',
          code: 'MISSING_OUTPUT_SCHEMA',
          severity: 'critical',
        });
        return errors;
      }
      
      // Test schema parsing
      const testResult = schema.safeParse({});
      if (!testResult.success && testResult.error.issues.length === 0) {
        errors.push({
          agentType,
          type: 'output',
          message: 'Output schema produces no validation errors for empty object',
          code: 'PERMISSIVE_OUTPUT_SCHEMA',
          severity: 'error',
        });
      }
      
    } catch (error) {
      errors.push({
        agentType,
        type: 'output',
        message: `Output schema error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: 'OUTPUT_SCHEMA_ERROR',
        severity: 'critical',
      });
    }
    
    return errors;
  }
  
  private checkMetadata(agentType: AgentType): SchemaWarning[] {
    const warnings: SchemaWarning[] = [];
    const metadata = AgentMetadata[agentType];
    
    if (!metadata) {
      warnings.push({
        agentType,
        type: 'metadata',
        message: 'Agent metadata is missing',
        code: 'MISSING_METADATA',
      });
      return warnings;
    }
    
    // Check required metadata fields
    if (!metadata.name) {
      warnings.push({
        agentType,
        type: 'metadata',
        message: 'Agent name is missing',
        code: 'MISSING_NAME',
      });
    }
    
    if (!metadata.description) {
      warnings.push({
        agentType,
        type: 'metadata',
        message: 'Agent description is missing',
        code: 'MISSING_DESCRIPTION',
      });
    }
    
    if (!metadata.category) {
      warnings.push({
        agentType,
        type: 'metadata',
        message: 'Agent category is missing',
        code: 'MISSING_CATEGORY',
      });
    }
    
    if (!metadata.estimatedTokens) {
      warnings.push({
        agentType,
        type: 'metadata',
        message: 'Token estimation is missing',
        code: 'MISSING_TOKEN_ESTIMATION',
      });
    }
    
    return warnings;
  }
  
  private checkSchemaConsistency(agentType: AgentType): SchemaWarning[] {
    const warnings: SchemaWarning[] = [];
    const metadata = AgentMetadata[agentType];
    
    if (!metadata) return warnings;
    
    // Check if web search requirement matches metadata
    const webSearchAgents = ['company-research', 'usps-battlecard'];
    if (webSearchAgents.includes(agentType) && !metadata.requiresWebSearch) {
      warnings.push({
        agentType,
        type: 'metadata',
        message: 'Agent likely requires web search but metadata indicates otherwise',
        code: 'MISSING_WEB_SEARCH_REQUIREMENT',
      });
    }
    
    // Check token estimation reasonableness
    if (metadata.estimatedTokens) {
      const { input: inputTokens, output: outputTokens } = metadata.estimatedTokens;
      
      if (inputTokens > 1000) {
        warnings.push({
          agentType,
          type: 'metadata',
          message: 'Input token estimation seems high',
          code: 'HIGH_INPUT_TOKEN_ESTIMATION',
        });
      }
      
      if (outputTokens > 3000) {
        warnings.push({
          agentType,
          type: 'metadata',
          message: 'Output token estimation seems high',
          code: 'HIGH_OUTPUT_TOKEN_ESTIMATION',
        });
      }
    }
    
    return warnings;
  }
  
  private checkGlobalConsistency(): SchemaWarning[] {
    const warnings: SchemaWarning[] = [];
    
    // Check for duplicate agent names
    const agentNames = Object.values(AgentMetadata).map(m => m.name);
    const duplicateNames = agentNames.filter((name, index) => agentNames.indexOf(name) !== index);
    
    if (duplicateNames.length > 0) {
      warnings.push({
        agentType: 'global',
        type: 'metadata',
        message: `Duplicate agent names found: ${duplicateNames.join(', ')}`,
        code: 'DUPLICATE_AGENT_NAMES',
      });
    }
    
    // Check for category consistency
    const categories = Object.values(AgentMetadata).map(m => m.category);
    const uniqueCategories = [...new Set(categories)];
    
    if (uniqueCategories.length < 3) {
      warnings.push({
        agentType: 'global',
        type: 'metadata',
        message: 'Limited variety of agent categories',
        code: 'LIMITED_CATEGORIES',
      });
    }
    
    return warnings;
  }
  
  private async testAgentSchema(agentType: AgentType): Promise<SchemaTestResult> {
    const startTime = Date.now();
    const inputTests: TestResult[] = [];
    const outputTests: TestResult[] = [];
    
    // Test input schema
    inputTests.push(this.testInputSchemaParsing(agentType));
    inputTests.push(this.testInputSchemaValidation(agentType));
    
    // Test output schema
    outputTests.push(this.testOutputSchemaParsing(agentType));
    outputTests.push(this.testOutputSchemaValidation(agentType));
    
    const allTests = [...inputTests, ...outputTests];
    const failedTests = allTests.filter(t => t.status === 'fail');
    const warningTests = allTests.filter(t => t.status === 'skip');
    
    let overallStatus: 'pass' | 'fail' | 'warning' = 'pass';
    if (failedTests.length > 0) overallStatus = 'fail';
    else if (warningTests.length > 0) overallStatus = 'warning';
    
    return {
      agentType,
      inputTests,
      outputTests,
      overallStatus,
    };
  }
  
  private testInputSchemaParsing(agentType: AgentType): TestResult {
    const startTime = Date.now();
    
    try {
      const schema = AgentInputSchemas[agentType];
      if (!schema) {
        return {
          testName: 'Input Schema Parsing',
          status: 'fail',
          message: 'Schema is missing',
          duration: Date.now() - startTime,
        };
      }
      
      // Try to parse the schema
      JSON.stringify(schema);
      
      return {
        testName: 'Input Schema Parsing',
        status: 'pass',
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        testName: 'Input Schema Parsing',
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      };
    }
  }
  
  private testInputSchemaValidation(agentType: AgentType): TestResult {
    const startTime = Date.now();
    
    try {
      const schema = AgentInputSchemas[agentType];
      if (!schema) {
        return {
          testName: 'Input Schema Validation',
          status: 'skip',
          message: 'Schema is missing',
          duration: Date.now() - startTime,
        };
      }
      
      // Test with invalid data
      const result = schema.safeParse({ invalidField: 'test' });
      
      if (result.success) {
        return {
          testName: 'Input Schema Validation',
          status: 'fail',
          message: 'Schema accepts invalid data',
          duration: Date.now() - startTime,
        };
      }
      
      return {
        testName: 'Input Schema Validation',
        status: 'pass',
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        testName: 'Input Schema Validation',
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      };
    }
  }
  
  private testOutputSchemaParsing(agentType: AgentType): TestResult {
    const startTime = Date.now();
    
    try {
      const schema = AgentOutputSchemas[agentType];
      if (!schema) {
        return {
          testName: 'Output Schema Parsing',
          status: 'fail',
          message: 'Schema is missing',
          duration: Date.now() - startTime,
        };
      }
      
      // Try to parse the schema
      JSON.stringify(schema);
      
      return {
        testName: 'Output Schema Parsing',
        status: 'pass',
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        testName: 'Output Schema Parsing',
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      };
    }
  }
  
  private testOutputSchemaValidation(agentType: AgentType): TestResult {
    const startTime = Date.now();
    
    try {
      const schema = AgentOutputSchemas[agentType];
      if (!schema) {
        return {
          testName: 'Output Schema Validation',
          status: 'skip',
          message: 'Schema is missing',
          duration: Date.now() - startTime,
        };
      }
      
      // Test with invalid data
      const result = schema.safeParse({ invalidField: 'test' });
      
      if (result.success) {
        return {
          testName: 'Output Schema Validation',
          status: 'fail',
          message: 'Schema accepts invalid data',
          duration: Date.now() - startTime,
        };
      }
      
      return {
        testName: 'Output Schema Validation',
        status: 'pass',
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        testName: 'Output Schema Validation',
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      };
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const schemaIntegrityChecker = SchemaIntegrityChecker.getInstance();

export const checkSchemaIntegrity = async (): Promise<SchemaIntegrityResult> => {
  return await schemaIntegrityChecker.checkIntegrity();
};

export const testSchemas = async (): Promise<SchemaTestResult[]> => {
  return await schemaIntegrityChecker.testSchemas();
};

// Quick integrity check for runtime
export const quickIntegrityCheck = (): boolean => {
  try {
    const agentTypes = Object.keys(AgentInputSchemas) as AgentType[];
    
    for (const agentType of agentTypes) {
      if (!AgentInputSchemas[agentType]) return false;
      if (!AgentOutputSchemas[agentType]) return false;
      if (!AgentMetadata[agentType]) return false;
    }
    
    return true;
  } catch (error) {
    console.error('Quick integrity check failed:', error);
    return false;
  }
};