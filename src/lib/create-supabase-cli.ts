import { createClient } from '@supabase/supabase-js'
import { SupabaseLibArgs } from 'langchain/vectorstores/supabase'

export const initSupabase = () => {
  try {
    const supabaseCli = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_API_KEY!
    )

    return {
      client: supabaseCli,
      dbConfig: {
        client: supabaseCli,
        tableName: 'documents',
        queryName: 'match_documents',
      } as SupabaseLibArgs,
    }
  } catch (error) {
    console.error('Error creating Supabase cli:\n')
    console.error(error)
  }
}
