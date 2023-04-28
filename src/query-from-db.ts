import { SupabaseVectorStore } from 'langchain/vectorstores/supabase'
import { initSupabase } from './lib/create-supabase-cli'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { callVectorDBQAChain } from './lib/vector-store-utils'

async function run() {
  const { dbConfig } = initSupabase() || {}

  if (!dbConfig) {
    throw new Error('Supabase dbConfig is not defined')
  }

  const vectorStore = await SupabaseVectorStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    dbConfig
  ).catch((err) => {
    throw new Error('Error creating vector store: ', err)
  })

  const query =
    'Tell me about object pooling technique and how it could help to save memory in Javascript'

  const response = await callVectorDBQAChain(query, vectorStore)
  console.log('Answer:\n', response.text)

  process.exit(0)
}

run()
