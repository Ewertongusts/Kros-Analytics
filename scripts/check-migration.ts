import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://bbxphigcyipwqzqyehhg.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_E3pACPb4ENzJTvG3-_0IyA_b70tY4An'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkMigration() {
  try {
    console.log('🔍 Verificando schema da tabela tasks...')
    
    // Tentar fazer uma query simples para verificar se as colunas existem
    const { data, error } = await supabase
      .from('tasks')
      .select('position, column_id')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro ao verificar schema:', error.message)
      
      // Se a coluna não existe, a query vai falhar
      if (error.message.includes('column') || error.message.includes('position')) {
        console.log('⚠️  Colunas position/column_id não existem ainda')
        console.log('📝 Você precisa executar a migration manualmente no Supabase Dashboard')
        console.log('SQL a executar:')
        console.log(`
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS position NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS column_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_tasks_column_id_position ON public.tasks(column_id, position);

UPDATE public.tasks 
SET position = ROW_NUMBER() OVER (PARTITION BY column_id ORDER BY created_at ASC) - 1
WHERE position = 0 OR position IS NULL;
        `)
      }
      return
    }
    
    console.log('✅ Colunas position e column_id já existem!')
    console.log('Dados:', data)
  } catch (err) {
    console.error('❌ Erro:', err)
  }
}

checkMigration()
