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
    'Explain to me how uselayoutEffect hook works, tell me how it differs from useEffect and provide some code examples'

  const response = await callVectorDBQAChain(query, vectorStore)
  console.log('Answer:\n', response.text)

  process.exit(0)
}

run()
