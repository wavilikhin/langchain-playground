import { Chroma } from 'langchain/vectorstores/chroma'
import type { Document } from 'langchain/dist/document'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { ChromaClient } from 'chromadb'

export const embedDocsToStore = async (
  docs: Document<Record<string, any>>[][]
) => {
  try {
    const vectors: Promise<Chroma>[] = []

    docs.forEach((doc) => {
      vectors.push(
        Chroma.fromDocuments(doc, new OpenAIEmbeddings({ verbose: true }), {
          collectionName: 'ecma-script',
        })
      )
    })

    const result = await Promise.all(vectors)
    return result
  } catch (error) {
    console.error('Erorr embeding documents to Chroma:')
    console.error(error)
  }
}
