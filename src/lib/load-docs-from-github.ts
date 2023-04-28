import { GithubRepoLoader } from 'langchain/document_loaders/web/github'
import { TokenTextSplitter } from 'langchain/text_splitter'
import type { Document } from 'langchain/dist/document'

export const loadDocsFromGithub = async (urls: string[]) => {
  const splitter = new TokenTextSplitter({
    encodingName: 'gpt2',
    chunkSize: 15,
    chunkOverlap: 1,
  })

  console.info('Initializing loaders...')
  const loaders: GithubRepoLoader[] = []
  for (const url of urls) {
    loaders.push(
      new GithubRepoLoader(url, {
        branch: 'main',
        recursive: false,
        unknown: 'warn',
      })
    )
  }

  console.info('Starting processing laoders data...')
  const processedDocs: Document<Record<string, any>>[][] = []
  for await (const loader of loaders) {
    const docs = await loader.load()
    const texts = docs.map((doc) => doc.pageContent)
    const chunks = await splitter.createDocuments(texts)
    processedDocs.push(chunks)
  }

  console.info('Lodaers data prepared')
  return processedDocs
}
