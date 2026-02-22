# RAG Data Storage

This folder stores processed textbook data from Supabase.

## Structure

```
rag/
├── health-guidelines/     # DOH and WHO guidelines
├── disease-patterns/      # Historical outbreak data
├── symptoms-database/     # Verified symptom descriptions
├── medication-reference/  # Common medications
├── training-materials/    # Sentinel training content
└── advisories/           # Health advisories
```

## Usage

Data is automatically saved here when running:

```bash
cd backend
npm run rag:prepare
```

## Note

- This is data storage only
- RAG processing scripts are in `backend/rag/`
- Files are JSON format with metadata
