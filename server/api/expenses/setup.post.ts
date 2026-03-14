export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  
  try {
    const serverClient = serverSupabaseClient(event)
    
    // Adicionar campos à tabela expense_categories
    await serverClient.rpc('exec_sql', {
      sql: `
        ALTER TABLE expense_categories 
        ADD COLUMN IF NOT EXISTS budget_limit DECIMAL(10, 2),
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
      `
    }).catch(() => {
      // Ignorar erro se as colunas já existem
    })

    // Adicionar campos à tabela transactions
    await serverClient.rpc('exec_sql', {
      sql: `
        ALTER TABLE transactions 
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS notes TEXT,
        ADD COLUMN IF NOT EXISTS receipt_url TEXT,
        ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS recurring_frequency VARCHAR(20);
      `
    }).catch(() => {
      // Ignorar erro se as colunas já existem
    })

    // Criar índices
    await serverClient.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
        CREATE INDEX IF NOT EXISTS idx_transactions_is_recurring ON transactions(is_recurring);
        CREATE INDEX IF NOT EXISTS idx_expense_categories_is_active ON expense_categories(is_active);
      `
    }).catch(() => {
      // Ignorar erro se os índices já existem
    })

    return {
      success: true,
      message: 'Campos adicionados com sucesso'
    }
  } catch (error: any) {
    console.error('Erro ao adicionar campos:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
