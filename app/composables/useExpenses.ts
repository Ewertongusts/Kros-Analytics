import { ref, computed } from 'vue'

export interface Expense {
  id: string
  description: string
  category_id: string
  amount: number
  status: 'pending' | 'paid'
  notes?: string
  receipt_url?: string
  is_recurring: boolean
  recurring_frequency?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  budget_limit?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export const useExpenses = () => {
  const supabase = useSupabaseClient()
  const expenses = ref<Expense[]>([])
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchExpenses = async () => {
    loading.value = true
    error.value = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      let query = (supabase.from('transactions') as any)
        .select('*')
        .eq('type', 'expense')
      
      if (user) {
        query = query.eq('user_id', user.id)
      }
      
      query = query.order('created_at', { ascending: false })

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      expenses.value = data || []
    } catch (e: any) {
      error.value = e.message
      console.error('Erro ao buscar despesas:', e)
    } finally {
      loading.value = false
    }
  }

  const fetchCategories = async () => {
    loading.value = true
    error.value = null
    try {
      // Fetch all active categories (not filtered by user_id since old categories don't have it)
      const { data, error: fetchError } = await (supabase.from('expense_categories') as any)
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (fetchError) {
        console.error('fetchCategories error details:', fetchError)
        throw fetchError
      }
      
      // Force reactivity by creating a new array reference
      categories.value = data ? [...data] : []
      console.log('fetchCategories: categories.value updated:', categories.value.length, 'items')
      
      // Log each category
      categories.value.forEach((cat, idx) => {
        console.log(`  [${idx}] id=${cat.id}, name=${cat.name}, user_id=${cat.user_id}, is_active=${cat.is_active}`)
      })
    } catch (e: any) {
      error.value = e.message
      console.error('Erro ao buscar categorias:', e)
    } finally {
      loading.value = false
    }
  }

  const upsertExpense = async (expense: Partial<Expense>) => {
    loading.value = true
    error.value = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const payload: any = {
        description: expense.description,
        category_id: expense.category_id,
        amount: expense.amount,
        status: expense.status || 'pending',
        notes: expense.notes || null,
        receipt_url: expense.receipt_url || null,
        is_recurring: expense.is_recurring || false,
        recurring_frequency: expense.recurring_frequency || null,
        type: 'expense'
      }

      if (user) {
        payload.user_id = user.id
      }

      if (expense.id) {
        payload.id = expense.id
      }

      const { data, error: upsertError } = await (supabase.from('transactions') as any)
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single()

      if (upsertError) throw upsertError

      await fetchExpenses()
      return { success: true, data }
    } catch (e: any) {
      error.value = e.message
      console.error('Erro ao salvar despesa:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  const deleteExpense = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      let query = (supabase.from('transactions') as any)
        .delete()
        .eq('id', id)
      
      if (user) {
        query = query.eq('user_id', user.id)
      }

      const { error: deleteError } = await query

      if (deleteError) throw deleteError

      await fetchExpenses()
      return { success: true }
    } catch (e: any) {
      error.value = e.message
      console.error('Erro ao deletar despesa:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  const upsertCategory = async (category: Partial<Category>) => {
    loading.value = true
    error.value = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }
      
      const payload: any = {
        name: category.name,
        color: category.color || '#' + Math.floor(Math.random() * 16777215).toString(16),
        is_active: category.is_active !== false,
        user_id: user.id
      }

      if (category.id) {
        payload.id = category.id
      }

      console.log('Salvando categoria com payload:', payload)

      const { data, error: upsertError } = await (supabase.from('expense_categories') as any)
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single()

      if (upsertError) throw upsertError

      await fetchCategories()
      return { success: true, data }
    } catch (e: any) {
      error.value = e.message
      console.error('Erro ao salvar categoria:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  const deleteCategory = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      let query = (supabase.from('expense_categories') as any)
        .update({ is_active: false })
        .eq('id', id)
      
      if (user) {
        query = query.eq('user_id', user.id)
      }

      const { error: deleteError } = await query

      if (deleteError) throw deleteError

      await fetchCategories()
      return { success: true }
    } catch (e: any) {
      error.value = e.message
      console.error('Erro ao deletar categoria:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  const markExpenseAsPaid = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      let query = (supabase.from('transactions') as any)
        .update({ status: 'paid' })
        .eq('id', id)
      
      if (user) {
        query = query.eq('user_id', user.id)
      }

      const { error: updateError } = await query

      if (updateError) throw updateError

      await fetchExpenses()
      return { success: true }
    } catch (e: any) {
      error.value = e.message
      console.error('Erro ao marcar como pago:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  const getExpensesByCategory = computed(() => {
    const grouped: Record<string, Expense[]> = {}
    expenses.value.forEach((expense: Expense) => {
      if (!grouped[expense.category_id]) {
        grouped[expense.category_id] = []
      }
      grouped[expense.category_id]!.push(expense)
    })
    return grouped
  })

  const getExpensesByMonth = computed(() => {
    const grouped: Record<string, Expense[]> = {}
    expenses.value.forEach((expense: Expense) => {
      const date = new Date(expense.created_at)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(expense)
    })
    return grouped
  })

  const getTotalByCategory = computed(() => {
    const totals: Record<string, number> = {}
    expenses.value.forEach((expense: Expense) => {
      if (!totals[expense.category_id]) {
        totals[expense.category_id] = 0
      }
      totals[expense.category_id]! += expense.amount
    })
    return totals
  })

  const getTotalByMonth = computed(() => {
    const totals: Record<string, number> = {}
    expenses.value.forEach((expense: Expense) => {
      const date = new Date(expense.created_at)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!totals[key]) {
        totals[key] = 0
      }
      totals[key] += expense.amount
    })
    return totals
  })

  const getCurrentMonthTotal = computed(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    return expenses.value
      .filter(e => {
        const date = new Date(e.created_at)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      })
      .reduce((sum, e) => sum + e.amount, 0)
  })

  const getPendingExpenses = computed(() => {
    return expenses.value.filter(e => e.status === 'pending')
  })

  const getPaidExpenses = computed(() => {
    return expenses.value.filter(e => e.status === 'paid')
  })

  return {
    expenses,
    categories,
    loading,
    error,
    fetchExpenses,
    fetchCategories,
    upsertExpense,
    deleteExpense,
    upsertCategory,
    deleteCategory,
    markExpenseAsPaid,
    getExpensesByCategory,
    getExpensesByMonth,
    getTotalByCategory,
    getTotalByMonth,
    getCurrentMonthTotal,
    getPendingExpenses,
    getPaidExpenses
  }
}
