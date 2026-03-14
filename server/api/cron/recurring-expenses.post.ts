export default defineEventHandler(async (event) => {
  try {
    const serverClient = serverSupabaseClient(event)
    
    // Buscar todas as despesas recorrentes
    const { data: recurringExpenses, error: fetchError } = await serverClient
      .from('transactions')
      .select('*')
      .eq('type', 'expense')
      .eq('is_recurring', true)

    if (fetchError) throw fetchError
    if (!recurringExpenses || recurringExpenses.length === 0) {
      return { success: true, message: 'Nenhuma despesa recorrente encontrada' }
    }

    const now = new Date()
    let createdCount = 0

    // Para cada despesa recorrente, verificar se precisa criar uma nova
    for (const expense of recurringExpenses) {
      const lastExpenseDate = new Date(expense.created_at)
      const nextDate = calculateNextRecurringDate(lastExpenseDate, expense.recurring_frequency)

      // Se a próxima data é hoje ou passou, criar uma nova despesa
      if (nextDate <= now) {
        const { error: insertError } = await serverClient
          .from('transactions')
          .insert({
            description: expense.description,
            category_id: expense.category_id,
            amount: expense.amount,
            status: 'pending',
            notes: expense.notes || `Gerada automaticamente de despesa recorrente`,
            type: 'expense',
            is_recurring: true,
            recurring_frequency: expense.recurring_frequency,
            user_id: expense.user_id,
            created_at: now.toISOString(),
            updated_at: now.toISOString()
          })

        if (insertError) {
          console.error('Erro ao criar despesa recorrente:', insertError)
        } else {
          createdCount++
        }
      }
    }

    return {
      success: true,
      message: `${createdCount} despesa(s) recorrente(s) criada(s)`,
      createdCount
    }
  } catch (error: any) {
    console.error('Erro no cron de despesas recorrentes:', error)
    return {
      success: false,
      error: error.message
    }
  }
})

function calculateNextRecurringDate(lastDate: Date, frequency: string): Date {
  const next = new Date(lastDate)
  
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1)
      break
    case 'weekly':
      next.setDate(next.getDate() + 7)
      break
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      break
    case 'quarterly':
      next.setMonth(next.getMonth() + 3)
      break
    case 'semiannual':
      next.setMonth(next.getMonth() + 6)
      break
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1)
      break
    default:
      next.setMonth(next.getMonth() + 1)
  }
  
  return next
}
