import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupWebhooks() {
  try {
    console.log('🚀 Iniciando setup de webhooks...')
    
    // Ler arquivo de migration
    const migrationPath = path.join(__dirname, '../server/migrations/webhook_events.sql')
    const sql = fs.readFileSync(migrationPath, 'utf-8')
    
    // Executar SQL
    const { error } = await supabase.rpc('exec', { sql })
    
    if (error) {
      console.error('❌ Erro ao executar migration:', error)
      process.exit(1)
    }
    
    console.log('✅ Tabelas de webhook criadas com sucesso!')
    console.log('✅ Setup concluído!')
    
  } catch (err: any) {
    console.error('❌ Erro:', err.message)
    process.exit(1)
  }
}

setupWebhooks()
