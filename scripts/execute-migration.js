import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL or SUPABASE_KEY not set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function executeMigration() {
  try {
    console.log('📝 Lendo migration...')
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20260323_add_position_to_tasks.sql')
    const sql = fs.readFileSync(migrationPath, 'utf-8')
    
    console.log('🚀 Executando migration...')
    console.log('SQL:', sql)
    
    // Executar via RPC ou query direta
    const { data, error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error('❌ Erro ao executar migration:', error)
      process.exit(1)
    }
    
    console.log('✅ Migration executada com sucesso!')
    console.log('Resultado:', data)
  } catch (err) {
    console.error('❌ Erro:', err)
    process.exit(1)
  }
}

executeMigration()
