-- Create table for uploaded textbooks
CREATE TABLE uploaded_textbooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  content TEXT,
  category TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE,
  metadata JSONB
);

-- Create table for RAG embeddings
CREATE TABLE rag_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID REFERENCES uploaded_textbooks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX ON rag_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create function for similarity search
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    id,
    content,
    metadata,
    1 - (embedding <=> query_embedding) AS similarity
  FROM rag_embeddings
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

-- Create storage bucket for textbooks
INSERT INTO storage.buckets (id, name, public)
VALUES ('textbooks', 'textbooks', false);

-- Storage policies
CREATE POLICY "Authenticated users can upload textbooks"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'textbooks');

CREATE POLICY "Authenticated users can read textbooks"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'textbooks');

-- Table policies
CREATE POLICY "Users can view all textbooks"
ON uploaded_textbooks FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can upload textbooks"
ON uploaded_textbooks FOR INSERT
TO authenticated
WITH CHECK (uploaded_by = auth.uid());

-- Enable Row Level Security
ALTER TABLE uploaded_textbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all embeddings"
ON rag_embeddings FOR SELECT
TO authenticated
USING (true);
