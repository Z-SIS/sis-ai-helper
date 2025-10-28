# SIS AI Agent System

A comprehensive, full-fledged AI agent system with memory, learning capabilities, and RAG (Retrieval-Augmented Generation) technology. This system transforms the existing AI tools into intelligent, context-aware agents that can learn from interactions and adapt over time.

## 🚀 Features

### Core Architecture
- **AI Agent Core**: Complete agent lifecycle management with state tracking
- **Memory System**: Short-term, long-term, episodic, semantic, and procedural memory
- **RAG Technology**: Knowledge-based responses with real-time research capabilities
- **Task History**: Comprehensive task tracking with local storage persistence
- **Context Management**: Context-aware responses with conversation history
- **Learning System**: Pattern recognition and adaptive behavior

### Advanced Capabilities
- **Multi-Agent Orchestration**: Coordinate multiple specialized agents
- **Context-Aware Responses**: Understand conversation context and user intent
- **Memory Consolidation**: Automatic memory management and optimization
- **Learning Analytics**: Track performance and identify patterns
- **Task Queue Management**: Priority-based task processing
- **Real-time Monitoring**: System health and performance metrics

## 📁 Architecture

```
src/lib/agent/
├── core/
│   └── AIAgent.ts              # Core agent implementation
├── rag/
│   └── RAGSystem.ts            # Retrieval-Augmented Generation
├── storage/
│   └── TaskHistory.ts          # Task history management
├── orchestration/
│   └── AgentOrchestrator.ts    # Multi-agent coordination
├── context/
│   └── ContextManager.ts       # Context-aware responses
├── learning/
│   └── MemoryManager.ts        # Memory and learning system
└── index.ts                    # Main exports and utilities
```

## 🔧 Components

### 1. AI Agent Core (`AIAgent.ts`)
- Agent lifecycle management
- State tracking and updates
- Tool registration and execution
- Memory management
- Message history

### 2. RAG System (`RAGSystem.ts`)
- Company research caching
- Web search integration
- Knowledge retrieval
- Context augmentation
- Source attribution

### 3. Task History (`TaskHistory.ts`)
- Local storage persistence
- Task filtering and search
- Performance analytics
- Export/import capabilities
- Storage optimization

### 4. Agent Orchestration (`AgentOrchestrator.ts`)
- Multi-agent coordination
- Task queue management
- Priority-based processing
- System monitoring
- Learning integration

### 5. Context Manager (`ContextManager.ts`)
- Conversation context tracking
- Intent analysis
- Entity extraction
- Response generation
- Context persistence

### 6. Memory Manager (`MemoryManager.ts`)
- Memory type management
- Pattern recognition
- Learning insights
- Memory consolidation
- Analytics and reporting

## 🎯 Usage Examples

### Creating an Agent

```typescript
import { AgentOrchestrator, PRESET_AGENT_CONFIGS } from '@/lib/agent';

const orchestrator = new AgentOrchestrator();

// Create a general assistant
const agent = await orchestrator.createAgent({
  ...PRESET_AGENT_CONFIGS.generalAssistant,
  userId: 'user123',
  id: 'assistant-1'
});
```

### Submitting a Task

```typescript
const taskId = await orchestrator.submitTask({
  id: 'task-1',
  userId: 'user123',
  agentId: 'assistant-1',
  task: 'Research Tesla Inc. and provide a comprehensive analysis',
  priority: 'high'
});

// Check task status
const status = await orchestrator.getTaskStatus(taskId);
```

### Using the React Hook

```typescript
import { useAgent } from '@/hooks/useAgent';

function AgentComponent() {
  const { agents, createAgent, submitTask, loading } = useAgent('user123');

  const handleCreateAgent = async () => {
    const result = await createAgent('user123', 'generalAssistant');
    if (result.success) {
      console.log('Agent created:', result.agentId);
    }
  };

  const handleSubmitTask = async () => {
    const result = await submitTask({
      userId: 'user123',
      agentId: 'agent-id',
      task: 'Analyze market trends',
      priority: 'medium'
    });
  };

  return (
    <div>
      <button onClick={handleCreateAgent} disabled={loading}>
        Create Agent
      </button>
      <button onClick={handleSubmitTask} disabled={loading}>
        Submit Task
      </button>
    </div>
  );
}
```

## 🔌 API Endpoints

### POST /api/agent

#### Actions:
- `create_agent`: Create a new agent
- `submit_task`: Submit a task to an agent
- `get_task_status`: Get task status
- `get_agent_status`: Get agent status
- `list_agents`: List user agents
- `delete_agent`: Delete an agent
- `enable_learning`: Enable learning for an agent
- `get_system_stats`: Get system statistics

### GET /api/agent

#### Actions:
- `health`: Get system health
- `presets`: Get available agent presets
- `agents`: List agents (requires userId parameter)

## 🧠 Memory Types

### Short-term Memory
- Recent interactions
- Current context
- Temporary data
- Automatic expiration

### Long-term Memory
- Important information
- Learned patterns
- User preferences
- Persistent knowledge

### Episodic Memory
- Specific events
- Conversation history
- Task outcomes
- Contextual memories

### Semantic Memory
- General knowledge
- Concepts and facts
- Research data
- Domain expertise

### Procedural Memory
- Task procedures
- Workflow steps
- Best practices
- Successful patterns

## 📊 Learning System

### Pattern Recognition
- Task success patterns
- Failure pattern analysis
- User behavior patterns
- Performance trends

### Learning Insights
- Performance metrics
- Behavioral analysis
- Optimization suggestions
- Improvement recommendations

### Memory Consolidation
- Automatic memory transfer
- Importance scoring
- Expiration management
- Storage optimization

## 🎨 Agent Presets

### General Assistant
- Conversational capabilities
- Research tools
- Content generation
- Learning enabled

### Business Researcher
- Company research
- Market analysis
- Data analysis
- Professional responses

### Content Creator
- Email generation
- Document creation
- Content optimization
- Professional tone

## 🔧 Configuration

### Agent Settings
```typescript
{
  maxMemorySize: 1000,        // Maximum memory entries
  contextWindowSize: 10,      // Context window size
  enableLearning: true,       // Enable learning
  enableRAG: true,           // Enable RAG
  responseStyle: 'conversational' // Response style
}
```

### Memory Settings
```typescript
{
  cacheExpiryDays: 30,        // Cache expiry in days
  consolidationThreshold: 24,  // Hours before consolidation
  maxShortTermSize: 50,       // Max short-term memories
  importanceThreshold: 0.7     // Importance threshold
}
```

## 📈 Performance Metrics

### System Metrics
- Total agents
- Active agents
- Queued tasks
- Processing tasks
- Task history size
- System uptime

### Agent Metrics
- Tasks processed
- Success rate
- Average processing time
- Memory usage
- Last activity

### Memory Metrics
- Total memories
- Memories by type
- Average importance
- Expired memories
- Learning patterns

## 🛡️ Security & Privacy

### Data Protection
- Local storage only
- No external data transmission
- User-specific data isolation
- Automatic data cleanup

### Privacy Features
- User-specific contexts
- Memory isolation
- Secure task processing
- Data encryption (when implemented)

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Access the Dashboard**
   Navigate to `http://localhost:3000/dashboard`

4. **Create Your First Agent**
   - Choose an agent preset
   - Configure settings
   - Start interacting

## 🔧 Development

### Code Structure
- TypeScript for type safety
- Modular architecture
- Comprehensive error handling
- Extensive logging

### Testing
- Unit tests for core components
- Integration tests for workflows
- Performance testing
- Error scenario testing

### Deployment
- Environment configuration
- Build optimization
- Performance monitoring
- Error tracking

## 📚 Advanced Usage

### Custom Agent Tools
```typescript
agent.registerTool({
  name: 'customTool',
  description: 'Custom tool description',
  parameters: { param1: 'string' },
  execute: async (params) => {
    // Custom logic
    return 'Result';
  }
});
```

### Custom Memory Types
```typescript
await memoryManager.addMemory({
  type: 'custom',
  content: { data: 'value' },
  importance: 0.8,
  tags: ['custom', 'important']
});
```

### Custom Learning Patterns
```typescript
const patterns = await memoryManager.getLearningPatterns(agentId);
const insights = await memoryManager.getLearningInsights(agentId);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is part of SIS Group Enterprises and is subject to company licensing terms.

## 🆘 Support

For support and questions:
- Internal documentation
- Development team
- Issue tracking system

---

**Note**: This AI Agent System is designed to replace the previous Firebase/Supabase-dependent architecture with a robust, local-storage-based system that provides better performance, reliability, and user privacy.