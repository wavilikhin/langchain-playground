import { readdir } from 'fs'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { promisify } from 'node:util'
import { join } from 'node:path'
import type { Document } from 'langchain/dist/document'

const readDir = promisify(readdir)

export const loadPdfDocuments = async (folderPath: string) => {
  try {
    const files = await readDir(folderPath)
    const docsPromises: Array<Promise<Document<Record<string, any>>[]>> = []

    files.forEach((file) => {
      const loader = new PDFLoader(join(folderPath, file), {
        splitPages: true,
      })

      docsPromises.push(loader.load())
    })

    const docs = await Promise.all(docsPromises)
    return docs
  } catch (error) {
    console.error(`Error reading dir "${folderPath}" :`)
    console.error(error)
  }
}
