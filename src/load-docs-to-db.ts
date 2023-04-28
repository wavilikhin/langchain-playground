import { config } from 'dotenv-safe'
import { loadPdfDocuments } from './lib/load-pdf-documents'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'url'
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase'
import { initSupabase } from './lib/create-supabase-cli'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { uploadDocumentsToDb } from './lib/vector-store-utils'

config()

const run = async () => {
  const { dbConfig } = initSupabase() || {}

  if (!dbConfig) {
    throw new Error('No Supabase db config found')
  }

  const docs = await loadPdfDocuments(
    join(dirname(fileURLToPath(import.meta.url)), '..', 'documents')
  )

  if (!docs) {
    throw new Error('No documents provided')
  }

  await uploadDocumentsToDb(docs)

  process.exit(0)
}

await run()
