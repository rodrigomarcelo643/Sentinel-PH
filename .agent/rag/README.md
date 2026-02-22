# RAG System Documentation

## Quick Reference

**Location**: 
- Processing: `backend/rag/`
- Data Storage: `rag/`
- Full Docs: `rag/RAG_DOCUMENTATION.md`

## Key Files

### Backend Processing
- `backend/rag/prepare-rag.ts` - Process textbooks from Supabase
- `backend/rag/query-rag.ts` - Interactive query tool
- `backend/rag/supabase-schema.sql` - Database schema

### Data Storage
- `rag/health-guidelines/` - DOH/WHO guidelines
- `rag/disease-patterns/` - Historical outbreak data
- `rag/symptoms-database/` - Verified symptoms
- `rag/medication-reference/` - Common medications
- `rag/training-materials/` - Sentinel training
- `rag/advisories/` - Health advisories

## Quick Start

```bash
# Setup database
psql -h your-project.supabase.co -U postgres -f backend/rag/supabase-schema.sql

# Process textbooks
cd backend
pnpm run rag:prepare

# Query RAG
pnpm run rag:query
```

## How It Works

1. Upload textbooks to Supabase Storage
2. Run `prepare-rag.ts` to process and embed
3. Store embeddings in Supabase pgvector
4. Query for relevant context during observation processing
5. Enhance AI categorization with context

## Integration

```typescript
// In webhooks
import { queryRAGContext } from '../rag/prepare-rag';

const context = await queryRAGContext(observation, 3);
const category = await categorizeObservation(
  `${observation}\n\nContext: ${context}`
);
```

## Environment Variables

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
OPENAI_API_KEY=sk-xxxxx
```

## See Full Documentation

For complete details, see: `rag/RAG_DOCUMENTATION.md`
