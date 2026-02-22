import { createClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import * as fs from 'fs';
import * as path from 'path';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

interface UploadedBook {
  id: string;
  title: string;
  file_path: string;
  content: string;
  category: string;
  uploaded_at: string;
}

export async function fetchTextbooksFromSupabase(): Promise<UploadedBook[]> {
  const { data, error } = await supabase
    .from('uploaded_textbooks')
    .select('*')
    .order('uploaded_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function downloadBookContent(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('textbooks')
    .download(filePath);

  if (error) throw error;
  return await data.text();
}

export async function splitTextIntoChunks(text: string) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  return await splitter.createDocuments([text]);
}

export async function storeEmbeddings(documents: any[], metadata: any) {
  await SupabaseVectorStore.fromDocuments(
    documents,
    embeddings,
    {
      client: supabase,
      tableName: 'rag_embeddings',
      queryName: 'match_documents',
    }
  );

  console.log(`Stored ${documents.length} chunks for: ${metadata.title}`);
}

export async function prepareRAGData() {
  console.log('Fetching textbooks from Supabase...');
  const books = await fetchTextbooksFromSupabase();

  console.log(`Found ${books.length} textbooks to process`);

  for (const book of books) {
    console.log(`Processing: ${book.title}`);

    const content = book.content || await downloadBookContent(book.file_path);
    const chunks = await splitTextIntoChunks(content);

    const documentsWithMetadata = chunks.map((chunk) => ({
      ...chunk,
      metadata: {
        bookId: book.id,
        title: book.title,
        category: book.category,
        uploadedAt: book.uploaded_at,
      },
    }));

    await storeEmbeddings(documentsWithMetadata, book);

    const localPath = path.join(
      __dirname,
      '../../rag',
      book.category,
      `${book.id}.json`
    );
    
    fs.mkdirSync(path.dirname(localPath), { recursive: true });
    fs.writeFileSync(
      localPath,
      JSON.stringify({
        id: book.id,
        title: book.title,
        category: book.category,
        content: content,
        processedAt: new Date().toISOString(),
      }, null, 2)
    );

    console.log(`✓ Completed: ${book.title}`);
  }

  console.log('RAG data preparation complete!');
}

export async function queryRAGContext(query: string, limit: number = 5) {
  const vectorStore = await SupabaseVectorStore.fromExistingIndex(
    embeddings,
    {
      client: supabase,
      tableName: 'rag_embeddings',
      queryName: 'match_documents',
    }
  );

  const results = await vectorStore.similaritySearch(query, limit);
  return results;
}

if (require.main === module) {
  prepareRAGData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}
