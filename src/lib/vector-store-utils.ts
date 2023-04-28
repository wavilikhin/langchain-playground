import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { OpenAI } from 'langchain/llms/openai'
import { loadQAChain } from 'langchain/chains'
import { Document } from 'langchain/document'
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase'
import { initSupabase } from './create-supabase-cli'

type PineConeMetadata = Record<string, any>

const embeddings = new OpenAIEmbeddings()

export async function callVectorDBQAChain(
  query: string,
  index: SupabaseVectorStore
) {
  const question = query
  const returnedResults = 30
  const questionEmbedding = await embedQuery(question, embeddings)
  const docs = await similarityVectorSearch(
    questionEmbedding,
    returnedResults,
    index
  )
  const inputs = { question, input_documents: docs }
  const llm = new OpenAI()
  const qaChain = loadQAChain(llm, {
    type: 'stuff',
  })
  console.log('qachain', qaChain)
  const result = await qaChain.call(inputs)
  console.log('result', result)

  return result
}

export async function embedQuery(
  query: string,
  embeddings: OpenAIEmbeddings
): Promise<number[]> {
  const embeddedQuery = await embeddings.embedQuery(query)
  console.log('embeddedQuery', embeddedQuery)
  return embeddedQuery
}

export async function similarityVectorSearch(
  vectorQuery: number[],
  k = 3,
  index: SupabaseVectorStore
): Promise<Document[]> {
  const results = await index.similaritySearchVectorWithScore(vectorQuery, k)

  const result: [Document, number][] = []

  // FIXME: check if valid
  if (results.matches) {
    for (const res of results.matches) {
      console.log('res', res)
      const { text: pageContent, ...metadata } =
        res?.metadata as PineConeMetadata
      if (res.score) {
        result.push([new Document({ metadata, pageContent }), res.score])
      }
    }
  }

  return result.map((result) => result[0])
}

type UploadDocsToDb =
  | {
      sourceType: 'fromText'
      strings: { pageContent: string; metadata: any }[]
    }
  | {
      sourceType: 'fromDocuments'
      documents: Document<Record<string, any>>[][]
    }

export const uploadDocumentsToDb = async (config: UploadDocsToDb) => {
  if (!config) {
    throw new Error('No config provided for upload')
  }

  const { dbConfig } = initSupabase() || {}

  if (!dbConfig) {
    throw new Error('Supabase db config is not defined')
  }

  const processedDocs: Promise<SupabaseVectorStore>[] = []

  if (config.sourceType === 'fromDocuments') {
    // TODO:add logs, take a lot of time
    config.documents.forEach((document) => {
      processedDocs.push(
        SupabaseVectorStore.fromDocuments(
          document,
          new OpenAIEmbeddings(),
          dbConfig
        )
      )
    })
  } else {
    config.strings.forEach((string) => {
      processedDocs.push(
        SupabaseVectorStore.fromTexts(
          // FIXME:
          string.pageContent,
          string.metadata,
          new OpenAIEmbeddings(),
          dbConfig
        )
      )
    })
  }

  await Promise.all(processedDocs)

  console.log('Successfully loaded all the docs')
}
