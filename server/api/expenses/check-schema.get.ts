export default defineEventHandler(async (event) => {
  try {
    const serverClient = serverSupabaseClient(event)
    
    // Verificar colunas da tabela categories
    const { data: categoriesColumns, error: categoriesError } = await serverClient
      .from('categories')
      .select('*')
      .limit(1)

    // Verificar colunas da tabela transactions
    const { data: transactionsColumns, error: transactionsError } = await serverClient
      .from('transactions')
      .select('*')
      .limit(1)

    return {
      success: true,
      categoriesColumns: categoriesColumns ? Object.keys(categoriesColumns[0] || {}) : [],
      transactionsColumns: transactionsColumns ? Object.keys(transactionsColumns[0] || {}) : [],
      categoriesError: categoriesError?.message,
      transactionsError: transactionsError?.message
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
})
