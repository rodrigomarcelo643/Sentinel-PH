# RAG (Retrieval-Augmented Generation) System

## Overview

SentinelPH uses RAG to enhance AI responses with verified health data from uploaded textbooks stored in Supabase.

## Architecture

```
┌─────────────────┐
│ Upload Textbook │ (Supabase Storage)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Process & Chunk │ (backend/rag/prepare-rag.ts)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generate        │ (OpenAI Embeddings)
│ Embeddings      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Store in Vector │ (Supabase pgvector)
│ Database        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Query Context   │ (Semantic Search)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Enhance AI      │ (OpenAI + Context)
│ Categorization  │
└─────────────────┘
```

## Data Flow

1. **Upload**: Health textbooks uploaded to Supabase Storage
2. **Process**: `backend/rag/prepare-rag.ts` fetches and chunks text
3. **Embed**: OpenAI generates 1536-dimension embeddings
4. **Store**: Embeddings saved to Supabase `rag_embeddings` table
5. **Query**: Semantic search finds relevant context
6. **Enhance**: Context added to AI categorization prompts

## Folder Structure

```
rag/                              # Data storage (processed textbooks)
├── health-guidelines/
├── disease-patterns/
├── symptoms-database/
├── medication-reference/
├── training-materials/
└── advisories/

backend/rag/                      # Processing scripts
├── prepare-rag.ts               # Main processing script
├── query-rag.ts                 # Interactive query tool
└── supabase-schema.sql          # Database schema
```

## Setup

### 1. Create Supabase Database

```bash
# Run schema in Supabase SQL Editor
psql -h your-project.supabase.co -U postgres -f backend/rag/supabase-schema.sql
```

### 2. Upload Textbooks

Upload health textbooks to Supabase:
- Table: `uploaded_textbooks`
- Storage: `textbooks` bucket
- Categories: health-guidelines, disease-patterns, symptoms-database, etc.

### 3. Process Textbooks

```bash
cd backend
pnpm run rag:prepare
```

This will:
- Fetch textbooks from Supabase
- Split into 1000-character chunks (200 overlap)
- Generate embeddings via OpenAI
- Store in `rag_embeddings` table
- Save locally to `rag/` folder

### 4. Query RAG

```bash
cd backend
pnpm run rag:query
```

Interactive tool to test semantic search.

## Usage in Code

### Backend (Webhooks)

```typescript
import { queryRAGContext } from '../rag/prepare-rag';

// Get relevant context for observation
const ragContext = await queryRAGContext(description, 3);
const contextText = ragContext.map(doc => doc.pageContent).join('\n');

// Enhance AI categorization with context
const category = await categorizeObservation(
  `${description}\n\nContext: ${contextText}`
);
```

### Example Query

```typescript
const results = await queryRAGContext('dengue symptoms', 5);

// Returns:
[
  {
    pageContent: "Dengue fever symptoms include high fever, severe headache...",
    metadata: {
      bookId: "uuid",
      title: "DOH Dengue Guidelines",
      category: "health-guidelines"
    }
  },
  // ... more results
]
```

## Data Categories

### health-guidelines/
Official DOH and WHO health guidelines
- Disease surveillance protocols
- Community health guidelines
- Outbreak response procedures

### disease-patterns/
Historical outbreak data
- Seasonal patterns
- Geographic distribution
- Common symptoms by disease

### symptoms-database/
Verified symptom descriptions
- Disease-symptom mappings
- Severity indicators
- Differential diagnosis

### medication-reference/
Common medications and uses
- Generic and brand names
- Typical uses
- Purchase pattern indicators

### training-materials/
Sentinel training content
- Observation guidelines
- What to report
- How to report

### advisories/
Health advisories and protocols
- Current health alerts
- Prevention measures
- Community guidelines

## Vector Search

### Similarity Search

Uses cosine similarity on 1536-dimension embeddings:

```sql
SELECT
  id,
  content,
  metadata,
  1 - (embedding <=> query_embedding) AS similarity
FROM rag_embeddings
WHERE 1 - (embedding <=> query_embedding) > 0.7
ORDER BY similarity DESC
LIMIT 5;
```

### Embedding Model

- **Model**: OpenAI `text-embedding-ada-002`
- **Dimensions**: 1536
- **Cost**: ~$0.0001 per 1K tokens

## Performance

### Chunking Strategy

```typescript
{
  chunkSize: 1000,      // Characters per chunk
  chunkOverlap: 200,    // Overlap between chunks
}
```

### Query Performance

- Average query time: ~200ms
- Embedding generation: ~100ms
- Vector search: ~50ms
- Context retrieval: ~50ms

## Cost Estimation

### Processing Costs

```
1 textbook (50,000 words) = ~65,000 tokens
Embedding cost: 65 × $0.0001 = $0.0065 per book
```

### Query Costs

```
1 query (50 tokens) = $0.000005
1,000 queries = $0.005
```

## Maintenance

### Update Textbooks

```bash
# Re-process all textbooks
cd backend
npm run rag:prepare
```

### Add New Category

1. Create folder in `rag/new-category/`
2. Upload textbooks to Supabase with category
3. Run `npm run rag:prepare`

### Monitor Storage

```sql
-- Check embedding count
SELECT COUNT(*) FROM rag_embeddings;

-- Check by category
SELECT 
  metadata->>'category' as category,
  COUNT(*) as count
FROM rag_embeddings
GROUP BY category;
```

## Troubleshooting

**No results returned**:
- Check if textbooks are processed
- Verify embeddings exist in database
- Lower similarity threshold

**Slow queries**:
- Check vector index exists
- Increase `lists` parameter in index
- Reduce result limit

**High costs**:
- Cache common queries
- Reduce chunk overlap
- Use smaller context window

## Future Enhancements

1. **Multi-language**: Support Tagalog, Cebuano, Ilocano
2. **Hybrid Search**: Combine vector + keyword search
3. **Reranking**: Use cross-encoder for better results
4. **Caching**: Cache frequent queries
5. **Fine-tuning**: Train custom embedding model
