import { ref, computed } from 'vue'

/**
 * Expense interface - Represents a registered expense (recurring or unique)
 * NOT an occurrence or payment record
 */
export interface Expense {
  id: string
  user_id: string
  description: string
  category_id: string
  amount: number
  is_recurring: boolean
  recurring_frequency?: string // 'daily', 'weekly', 'monthly', 'quarterly', 'semiannual', 'yearly'
  start_date: string // DATE format: YYYY-MM-DD
  end_date?: string // DATE format: YYYY-MM-DD (null = no end date)
  is_active: boolean
  notes?: string
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

  /**
   * Fetch all expenses for the current user
   * Filters by is_active status
   */
  const fetchExpenses = async (includeInactive: boolean = false) => {
    loading.value = true
    error.value = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      let query = supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)

      if (!includeInactive) {
        query = query.eq('is_active', true)
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

      if (fetchError) throw fetchError

      categories.value = data ? [...data] : []
    } catch (e: any) {
      error.value = e.message
      console.error('Erro ao buscar categorias:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * Create or update an expense
   * If is_recurring, automatically generates occurrences
   */
  const upsertExpense = async (expense: Partial<Expense>) => {
    loading.value = true
    error.value = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const payload: any = {
        description: expense.description,
        category_id: expense.category_id,
        amount: expense.amount,
        is_recurring: expense.is_recurring || false,
        recurring_frequency: expense.recurring_frequency || null,
        start_date: expense.start_date,
        end_date: expense.end_date || null,
        is_active: expense.is_active !== false,
        notes: expense.notes || null,
        user_id: user.id
      }

      if (expense.id) {
        payload.id = expense.id
      }

      const { data, error: upsertError } = await supabase
        .from('expenses')
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

  /**
   * Delete an expense and all its occurrences
   */
  const deleteExpense = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { error: deleteError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

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
      if (!user) throw new Error('Usuário não autenticado')
      
      const payload: any = {
        name: category.name,
        color: category.color || '#' + Math.floor(Math.random() * 16777215).toString(16),
        is_active: category.is_active !== false,
        user_id: user.id
      }

      if (category.id) {
        payload.id = category.id
      }

      const { data, error: upsertError } = await (supabase.from('categories') as any)
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
      if (!user) throw new Error('Usuário não autenticado')

      // Check if category has expenses
      const { data: expensesInCategory, error: checkError } = await (supabase.from('expenses') as any)
        .select('id')
        .eq('category_id', id)
        .limit(1)

      if (checkError) throw checkError

      if (expensesInCategory && expensesInCategory.length > 0) {
        return { success: false, error: 'Categorias com despesas não podem ser deletadas' }
      }

      const { error: deleteError } = await (supabase.from('categories') as any)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

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

  /**
   * Pause/resume an expense (toggle is_active)
   */
  const toggleExpenseActive = async (id: string, isActive: boolean) => {
    loading.value = true
    error.value = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { data, error: updateError } = await (supabase
        .from('expenses') as any)
        .update({ is_active: isActive })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      await fetchExpenses()
      return { success: true, data }
    } catch (e: any) {
      error.value = e.message
      console.error('Erro ao atualizar status da despesa:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Get recurring expenses only
   */
  const getRecurringExpenses = computed(() => {
    return expenses.value.filter(e => e.is_recurring && e.is_active)
  })

  /**
   * Get unique (non-recurring) expenses only
   */
  const getUniqueExpenses = computed(() => {
    return expenses.value.filter(e => !e.is_recurring && e.is_active)
  })

  /**
   * Get active expenses only
   */
  const getActiveExpenses = computed(() => {
    return expenses.value.filter(e => e.is_active)
  })

  /**
   * Get inactive expenses only
   */
  const getInactiveExpenses = computed(() => {
    return expenses.value.filter(e => !e.is_active)
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
    toggleExpenseActive,
    upsertCategory,
    deleteCategory,
    getRecurringExpenses,
    getUniqueExpenses,
    getActiveExpenses,
    getInactiveExpenses
  }
}
