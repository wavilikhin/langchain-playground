import { loadDocsFromGithub } from './lib/load-docs-from-github'
import { uploadDocumentsToDb } from './lib/vector-store-utils'

async function run() {
  const urls = [
    'https://github.com/reactjs/react.dev/tree/main/src/content/learn',
  ]

  console.info('Starting documents load...')
  const documents = await loadDocsFromGithub(urls)

  console.info('Starting documents upload...')
  await uploadDocumentsToDb({
    sourceType: 'fromDocuments',
    documents,
  })

  process.exit(0)
}

run()
