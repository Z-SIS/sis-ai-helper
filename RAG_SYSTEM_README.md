# RAG Knowledge Base System

A comprehensive Retrieval-Augmented Generation (RAG) system built with Next.js, Supabase, and pgvector for intelligent document search and AI-powered responses.

## 🚀 Features

### Core RAG Capabilities
- **Vector Search**: Advanced semantic search using pgvector and OpenAI embeddings
- **Knowledge Base Ingestion**: Automatic document chunking and embedding generation
- **Intelligent Retrieval**: Context-aware document retrieval with similarity scoring
- **AI-Powered Responses**: Generate answers using retrieved context with LLM
- **Multi-Source Search**: Search across knowledge documents and company research

### Document Management
- **File Upload**: Support for PDF, TXT, and MD files
- **Text Creation**: Create documents directly from text content
- **Tagging System**: Organize documents with custom tags
- **Processing Queue**: Asynchronous document processing with status tracking
- **Version Control**: Track document updates and changes

### Analytics & Monitoring
- **Usage Analytics**: Track search queries and response times
- **Performance Metrics**: Monitor cache hit rates and system performance
- **Knowledge Base Stats**: Document count, storage usage, and chunk statistics
- **Search Analytics**: Query patterns and relevance scores

### Caching & Optimization
- **Multi-Level Caching**: Query cache, document cache, and embedding cache
- **Performance Optimization**: Automatic cache cleanup and optimization
- **Storage Management**: Efficient localStorage usage with TTL management
- **Cache Analytics**: Monitor cache performance and hit rates

## 📁 Architecture

```
src/
├── lib/rag/
│   ├── ingestion.ts          # Document ingestion pipeline
│   ├── retrieval.ts          # Vector search and RAG
│   └── cache.ts              # Caching and optimization
├── hooks/
│   └── useRAG.ts             # React hooks for RAG functionality
├── app/
│   ├── api/rag/              # API routes
│   │   ├── upload/           # File upload endpoint
│   │   ├── search/           # Search and retrieval
│   │   ├── documents/        # Document management
│   │   └── analytics/        # Analytics endpoints
│   └── rag/                  # RAG dashboard UI
└── supabase/migrations/
    └── 20240101000001_rag_schema.sql  # Database schema
```

## 🗄️ Database Schema

### Core Tables

#### knowledge_documents
Stores document metadata and content
- `id`: UUID primary key
- `title`: Document title
- `content`: Full document content
- `file_type`: File type (pdf, txt, md)
- `tags`: Array of tags
- `created_by`: User ID
- `created_at`, `updated_at`: Timestamps

#### knowledge_chunks
Stores document chunks with embeddings
- `id`: UUID primary key
- `document_id`: Foreign key to knowledge_documents
- `chunk_index`: Chunk order
- `chunk_text`: Chunk content
- `embedding`: Vector (1536 dimensions)
- `metadata`: Additional chunk metadata

#### company_research_cache
Enhanced with vector search
- `company_embedding`: Vector for semantic search
- All existing company research fields

#### knowledge_usage
Analytics for search queries
- `query`: Search query
- `retrieved_chunks`: Array of retrieved chunk IDs
- `response`: Generated response
- `response_time_ms`: Response time
- `relevance_score`: Average similarity score

#### document_processing_queue
Async processing tracking
- `document_id`: Foreign key to knowledge_documents
- `status`: pending, processing, completed, failed
- `error_message`: Error details
- `processing_started_at`, `processing_completed_at`: Timestamps

## 🔧 Setup Instructions

### 1. Database Setup

```sql
-- Run the migration file
-- supabase/migrations/20240101000001_rag_schema.sql
```

### 2. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# ZAI (for embeddings and LLM)
ZAI_API_KEY=your_zai_api_key
```

### 3. Install Dependencies

```bash
npm install @supabase/supabase-js z-ai-web-dev-sdk
```

### 4. Run the Application

```bash
npm run dev
```

## 🎯 Usage Examples

### Upload a Document

```typescript
import { useRAG } from '@/hooks/useRAG';

function DocumentUpload() {
  const { uploadDocument } = useRAG('user-id');

  const handleUpload = async (file: File) => {
    const result = await uploadDocument(file, {
      title: 'My Document',
      tags: ['important', 'research'],
      sourceUrl: 'https://example.com',
      userId: 'user-id'
    });
    
    if (result.success) {
      console.log('Document uploaded:', result.documentId);
    }
  };

  return (
    <input type="file" onChange={(e) => handleUpload(e.target.files?.[0])} />
  );
}
```

### Search Knowledge Base

```typescript
import { useRAG } from '@/hooks/useRAG';

function KnowledgeSearch() {
  const { search } = useRAG('user-id');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);

  const handleSearch = async () => {
    const result = await search(query, 'user-id', {
      match_count: 5,
      similarity_threshold: 0.7,
      include_company_research: true
    });
    
    setResults(result);
  };

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <button onClick={handleSearch}>Search</button>
      {results && <div>{results.answer}</div>}
    </div>
  );
}
```

### Direct API Usage

```typescript
// Upload document
const formData = new FormData();
formData.append('file', file);
formData.append('title', 'Document Title');
formData.append('user_id', 'user-id');

const response = await fetch('/api/rag/upload', {
  method: 'POST',
  body: formData
});

// Search
const searchResponse = await fetch('/api/rag/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'What is machine learning?',
    user_id: 'user-id',
    match_count: 5,
    similarity_threshold: 0.7
  })
});
```

## 🔍 Search Options

### Query Parameters
- `query`: Search query text
- `user_id`: User identifier
- `match_count`: Number of results to return (default: 5)
- `similarity_threshold`: Minimum similarity score (default: 0.7)
- `filter_tags`: Filter by document tags
- `include_company_research`: Include company research (default: true)

### Response Format
```json
{
  "success": true,
  "result": {
    "answer": "AI-generated response based on retrieved context",
    "sources": [
      {
        "type": "knowledge",
        "id": "chunk-id",
        "title": "Document Title",
        "content": "Relevant chunk content",
        "similarity": 0.85,
        "metadata": {}
      }
    ],
    "context": "Combined context from retrieved documents",
    "query": "Original query",
    "response_time_ms": 1500,
    "usage_id": "usage-tracking-id"
  }
}
```

## 📊 Analytics

### Knowledge Base Statistics
```typescript
const stats = await fetch('/api/rag/analytics?type=stats&user_id=user-id');
```

Returns:
- `total_documents`: Number of documents
- `total_chunks`: Number of chunks
- `total_size_bytes`: Storage usage
- `avg_chunks_per_document`: Average chunks per document
- `most_common_tags`: Popular tags
- `recent_uploads`: Recent document uploads

### Usage Analytics
```typescript
const analytics = await fetch('/api/rag/analytics?type=usage&user_id=user-id&days=30');
```

Returns:
- `total_queries`: Total number of searches
- `avg_response_time`: Average response time
- `avg_relevance_score`: Average relevance score
- `recent_queries`: Recent search queries
- `daily_usage`: Daily usage statistics

## 🚀 Performance Optimization

### Caching Strategy

#### Query Cache (In-Memory)
- **TTL**: 5 minutes
- **Size**: 100 entries
- **Eviction**: LRU (Least Recently Used)

#### Document Cache (LocalStorage)
- **TTL**: 30 minutes
- **Storage**: Browser localStorage
- **Cleanup**: Automatic expired entry removal

#### Embedding Cache (LocalStorage)
- **TTL**: 24 hours
- **Purpose**: Avoid re-generating embeddings
- **Hash-based**: Text hashing for cache keys

### Optimization Tips

1. **Chunk Size**: Use 300-500 tokens per chunk for optimal retrieval
2. **Similarity Threshold**: Adjust based on use case (0.6-0.8 recommended)
3. **Batch Processing**: Process embeddings in batches to avoid rate limits
4. **Cache Monitoring**: Monitor cache hit rates and adjust TTL accordingly
5. **Storage Cleanup**: Regular cleanup of old usage logs and expired cache

### Cache Statistics

```typescript
import { ragCache } from '@/lib/rag/cache';

const stats = ragCache.getCacheStats();
console.log('Cache hit rate:', stats.queryCache.hitRate);
console.log('Storage usage:', stats.localStorage.usagePercentage);
```

## 🔒 Security

### Row Level Security (RLS)
- Users can only access their own documents
- Company research is read-only for authenticated users
- Usage analytics are isolated per user

### Data Privacy
- All processing happens server-side
- No external data transmission beyond required APIs
- Local storage for caching (client-side only)

## 🛠️ Development

### Running Tests

```bash
npm run test
```

### Building for Production

```bash
npm run build
npm start
```

### Database Migrations

```bash
# Create new migration
supabase migration new add_new_feature

# Apply migrations
supabase db push
```

## 📈 Monitoring

### Performance Metrics
- Query response times
- Cache hit rates
- Embedding generation times
- Document processing speed

### Error Tracking
- Failed document processing
- API error rates
- Cache eviction counts
- Storage usage warnings

## 🔧 Configuration

### Chunking Configuration
```typescript
const CHUNK_SIZE = 500; // tokens per chunk
const CHUNK_OVERLAP = 50; // tokens overlap
```

### Cache Configuration
```typescript
const CACHE_CONFIG = {
  QUERY_CACHE_SIZE: 100,
  QUERY_CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  DOCUMENT_CACHE_TTL: 30 * 60 * 1000, // 30 minutes
  EMBEDDING_CACHE_TTL: 24 * 60 * 60 * 1000, // 24 hours
};
```

### Search Configuration
```typescript
const DEFAULT_SEARCH_OPTIONS = {
  match_count: 5,
  similarity_threshold: 0.7,
  include_company_research: true,
  company_match_count: 3,
  company_similarity_threshold: 0.6
};
```

## 🚨 Troubleshooting

### Common Issues

#### Document Processing Failed
- Check file format (PDF, TXT, MD only)
- Verify file size (< 10MB)
- Check ZAI API key and rate limits

#### Search Returns No Results
- Lower similarity threshold
- Check if documents are fully processed
- Verify query format and keywords

#### Cache Issues
- Clear cache if stale data
- Check localStorage quota
- Monitor cache hit rates

#### Performance Issues
- Optimize chunk size
- Increase cache TTL
- Monitor embedding generation times

### Debug Mode

Enable debug logging:
```typescript
// In development
const DEBUG = true;
if (DEBUG) {
  console.log('RAG Debug:', { query, results, cache });
}
```

## 📚 API Reference

### Upload Document
```
POST /api/rag/upload
Content-Type: multipart/form-data

file: File
title: string
tags: string (comma-separated)
source_url: string (optional)
user_id: string
```

### Search
```
POST /api/rag/search
Content-Type: application/json

{
  "query": "search query",
  "user_id": "user-id",
  "match_count": 5,
  "similarity_threshold": 0.7,
  "filter_tags": ["tag1", "tag2"],
  "include_company_research": true
}
```

### List Documents
```
GET /api/rag/documents?user_id=user-id&limit=10&offset=0&tags=tag1,tag2&search=query
```

### Get Analytics
```
GET /api/rag/analytics?type=stats&user_id=user-id
GET /api/rag/analytics?type=usage&user_id=user-id&days=30
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is part of SIS Group Enterprises and is subject to company licensing terms.

---

**Built with**: Next.js, Supabase, pgvector, ZAI, TypeScript