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
        .from('expense_categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (fetchError) throw fetchError

      categories.value = data ? [...data] : []
      console.log('fetchCategories: categories.value updated:', categories.value.length, 'items')
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
        console.log('🗑️ [deleteCategory] Starting delete for category:', id)

        // Check if category has expenses
        console.log('📝 [deleteCategory] Checking for expenses in this category...')
        const { data: expensesInCategory, error: checkError } = await (supabase.from('transactions') as any)
          .select('id')
          .eq('category_id', id)
          .eq('type', 'expense')
          .limit(1)

        if (checkError) {
          console.error('❌ [deleteCategory] Error checking expenses:', checkError)
          throw checkError
        }

        console.log('📊 [deleteCategory] Expenses check result:', expensesInCategory?.length || 0, 'expenses found')

        if (expensesInCategory && expensesInCategory.length > 0) {
          console.warn('⚠️ [deleteCategory] Category has expenses, cannot delete')
          return { success: false, error: 'Categorias com despesas não podem ser deletadas' }
        }

        console.log('✅ [deleteCategory] No expenses found, proceeding with delete...')

        // Delete without user_id filter - categories can be shared
        console.log('🔥 [deleteCategory] Executing DELETE query for id:', id)
        const { error: deleteError, data: deleteData } = await (supabase.from('expense_categories') as any)
          .delete()
          .eq('id', id)

        console.log('📊 [deleteCategory] Delete response - Error:', deleteError, 'Data:', deleteData)

        if (deleteError) {
          console.error('❌ [deleteCategory] Delete error:', deleteError)
          throw deleteError
        }

        console.log('✅ [deleteCategory] Delete successful, fetching categories...')
        await fetchCategories()
        console.log('✅ [deleteCategory] Categories refreshed, new count:', categories.value.length)
        
        // Verify the category was actually deleted
        const { data: verifyData } = await (supabase.from('expense_categories') as any)
          .select('id')
          .eq('id', id)
          .limit(1)
        
        if (verifyData && verifyData.length > 0) {
          console.error('❌ [deleteCategory] VERIFICATION FAILED: Category still exists in database!')
          return { success: false, error: 'Falha ao deletar categoria - verifique as permissões' }
        }
        
        console.log('✅ [deleteCategory] VERIFICATION PASSED: Category successfully deleted from database')
        return { success: true }
      } catch (e: any) {
        error.value = e.message
        console.error('❌ [deleteCategory] Exception:', e)
        return { success: false, error: e.message }
      } finally {
        loading.value = false
        console.log('✓ [deleteCategory] Delete complete')
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

      const { data, error: updateError } = await supabase
        .from('expenses')
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
