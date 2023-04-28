import { config } from 'dotenv-safe'
import { loadPdfDocuments } from './lib/load-pdf-documents'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'url'
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase'
import { initSupabase } from './lib/create-supabase-cli'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'

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

  const processedDocs: Promise<SupabaseVectorStore>[] = []
  docs.forEach((doc) => {
    processedDocs.push(
      SupabaseVectorStore.fromDocuments(doc, new OpenAIEmbeddings(), dbConfig)
    )
  })

  const dbUploadResults = await Promise.all(processedDocs)

  console.log(dbUploadResults[0])

  console.log('Successfully loaded all the docs')
  process.exit(0)
}

await run()
