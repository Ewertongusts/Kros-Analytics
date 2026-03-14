import { ref, computed } from 'vue'

export interface ExpenseOccurrence {
  id: string
  expense_id: string
  user_id: string
  occurrence_date: string // DATE format: YYYY-MM-DD
  due_date: string // DATE format: YYYY-MM-DD
  amount: number
  status: 'pending' | 'paid' | 'overdue'
  created_at: string
  updated_at: string
}

export const useExpenseOccurrences = () => {
  const supabase = useSupabaseClient()
  const occurrences = ref<ExpenseOccurrence[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch all expense occurrences for the current user
   * Optionally filter by status or date range
   */
  const fetchOccurrences = async (filters?: {
    status?: 'pending' | 'paid' | 'overdue'
    startDate?: string
    endDate?: string
    expenseId?: string
  }) => {
    loading.value = true
    error.value = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      let query = (supabase
        .from('expense_occurrences') as any)
        .select('*')
        .eq('user_id', user.id)

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.startDate) {
        query = query.gte('due_date', filters.startDate)
      }

      if (filters?.endDate) {
        query = query.lte('due_date', filters.endDate)
      }

      if (filters?.expenseId) {
        query = query.eq('expense_id', filters.expenseId)
      }

      query = query.order('due_date', { ascending: true })

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      occurrences.value = data || []
    } catch (e: any) {
      error.value = e.message
      console.error('Erro ao buscar ocorrências:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a single occurrence (usually called when creating a unique expense)
   */
  const createOccurrence = async (occurrence: Omit<ExpenseOccurrence, 'id' | 'created_at' | 'updated_at'>) => {
    loading.value = true
    error.value = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const payload: any = {
        ...occurrence,
        user_id: user.id,
        status: 'pending'
      }

      const { data, error: createError } = await (supabase
        .from('expense_occurrences') as any)
        .insert([payload])
        .select()
        .single()

      if (createError) throw createError

      await fetchOccurrences()
      return { success: true, data }
    } catch (e: any) {
      error.value = e.message
      console.error('Erro ao criar ocorrência:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Create multiple occurrences (for recurring expenses)
   * Generates occurrences for the next N months
   */
  const createRecurringOccurrences = async (
    expenseId: string,
    startDate: string,
    frequency: string,
    monthsAhead: number = 12
  ) => {
    loading.value = true
    error.value = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { data: expenseData, error: fetchError } = await (supabase
        .from('expenses') as any)
        .select('*')
        .eq('id', expenseId)
        .single()

      if (fetchError) throw fetchError

      const occurrencesToCreate: any[] = []
      const baseDate = new Date(startDate)

      for (let i = 0; i < monthsAhead; i++) {
        const occurrenceDate = new Date(baseDate)
        const dueDate = new Date(baseDate)

        // Calculate next occurrence based on frequency
        switch (frequency) {
          case 'daily':
            occurrenceDate.setDate(occurrenceDate.getDate() + i)
            dueDate.setDate(dueDate.getDate() + i)
            break
          case 'weekly':
            occurrenceDate.setDate(occurrenceDate.getDate() + i * 7)
            dueDate.setDate(dueDate.getDate() + i * 7)
            break
          case 'monthly':
            occurrenceDate.setMonth(occurrenceDate.getMonth() + i)
            dueDate.setMonth(dueDate.getMonth() + i)
            break
          case 'quarterly':
            occurrenceDate.setMonth(occurrenceDate.getMonth() + i * 3)
            dueDate.setMonth(dueDate.getMonth() + i * 3)
            break
          case 'semiannual':
            occurrenceDate.setMonth(occurrenceDate.getMonth() + i * 6)
            dueDate.setMonth(dueDate.getMonth() + i * 6)
            break
          case 'yearly':
            occurrenceDate.setFullYear(occurrenceDate.getFullYear() + i)
            dueDate.setFullYear(dueDate.getFullYear() + i)
            break
        }

        occurrencesToCreate.push({
          expense_id: expenseId,
          user_id: user.id,
          occurrence_date: occurrenceDate.toISOString().split('T')[0],
          due_date: dueDate.toISOString().split('T')[0],
          amount: expenseData.amount,
          status: 'pending'
        })
      }

      const { data, error: createError } = await (supabase
        .from('expense_occurrences') as any)
        .insert(occurrencesToCreate)
        .select()

      if (createError) throw createError

      await fetchOccurrences()
      return { success: true, data, count: data?.length || 0 }
    } catch (e: any) {
      error.value = e.message
      console.error('Erro ao criar ocorrências recorrentes:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Update occurrence status
   */
  const updateOccurrenceStatus = async (id: string, status: 'pending' | 'paid' | 'overdue') => {
    loading.value = true
    error.value = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { data, error: updateError } = await (supabase
        .from('expense_occurrences') as any)
        .update({ status })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      await fetchOccurrences()
      return { success: true, data }
    } catch (e: any) {
      error.value = e.message
      console.error('Erro ao atualizar status da ocorrência:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete an occurrence
   */
  const deleteOccurrence = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { error: deleteError } = await (supabase
        .from('expense_occurrences') as any)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      await fetchOccurrences()
      return { success: true }
    } catch (e: any) {
      error.value = e.message
      console.error('Erro ao deletar ocorrência:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Get pending occurrences (not yet paid)
   */
  const getPendingOccurrences = computed(() => {
    return occurrences.value.filter(o => o.status === 'pending')
  })

  /**
   * Get paid occurrences
   */
  const getPaidOccurrences = computed(() => {
    return occurrences.value.filter(o => o.status === 'paid')
  })

  /**
   * Get overdue occurrences
   */
  const getOverdueOccurrences = computed(() => {
    return occurrences.value.filter(o => o.status === 'overdue')
  })

  /**
   * Get total amount of pending occurrences
   */
  const getTotalPending = computed(() => {
    return getPendingOccurrences.value.reduce((sum, o) => sum + o.amount, 0)
  })

  /**
   * Get total amount of paid occurrences
   */
  const getTotalPaid = computed(() => {
    return getPaidOccurrences.value.reduce((sum, o) => sum + o.amount, 0)
  })

  /**
   * Get occurrences grouped by month
   */
  const getOccurrencesByMonth = computed(() => {
    const grouped: Record<string, ExpenseOccurrence[]> = {}
    occurrences.value.forEach(o => {
      const date = new Date(o.due_date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(o)
    })
    return grouped
  })

  return {
    occurrences,
    loading,
    error,
    fetchOccurrences,
    createOccurrence,
    createRecurringOccurrences,
    updateOccurrenceStatus,
    deleteOccurrence,
    getPendingOccurrences,
    getPaidOccurrences,
    getOverdueOccurrences,
    getTotalPending,
    getTotalPaid,
    getOccurrencesByMonth
  }
}
