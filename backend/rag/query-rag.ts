import { queryRAGContext } from './prepare-rag';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function interactiveQuery() {
  console.log('🔍 RAG Context Query Tool');
  console.log('Type your query or "exit" to quit\n');

  rl.on('line', async (input) => {
    if (input.toLowerCase() === 'exit') {
      console.log('Goodbye!');
      process.exit(0);
    }

    if (!input.trim()) return;

    console.log('\nSearching...\n');

    try {
      const results = await queryRAGContext(input, 5);

      if (results.length === 0) {
        console.log('No relevant context found.\n');
        return;
      }

      console.log(`Found ${results.length} relevant documents:\n`);

      results.forEach((doc, index) => {
        console.log(`--- Result ${index + 1} ---`);
        console.log(`Content: ${doc.pageContent.substring(0, 200)}...`);
        console.log(`Metadata:`, doc.metadata);
        console.log('');
      });

    } catch (error) {
      console.error('Error querying RAG:', error);
    }

    console.log('Enter another query:\n');
  });
}

if (require.main === module) {
  interactiveQuery();
}

export { interactiveQuery };
