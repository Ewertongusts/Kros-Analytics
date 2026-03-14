import { ref, computed } from 'vue'

export interface PaymentRecord {
  id: string
  expense_occurrence_id: string
  user_id: string
  amount: number
  payment_date: string // DATE format: YYYY-MM-DD
  payment_method?: string // 'debit', 'credit', 'transfer', 'cash', 'check', etc
  notes?: string
  created_at: string
}

export const usePaymentRecords = () => {
  const supabase = useSupabaseClient()
  const records = ref<PaymentRecord[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch all payment records for the current user
   * Optionally filter by date range or payment method
   */
  const fetchRecords = async (filters?: {
    startDate?: string
    endDate?: string
    paymentMethod?: string
  }) => {
    loading.value = true
    error.value = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      let query = supabase
        .from('payment_records')
        .select('*')
        .eq('user_id', user.id)

      if (filters?.startDate) {
        query = query.gte('payment_date', filters.startDate)
      }

      if (filters?.endDate) {
        query = query.lte('payment_date', filters.endDate)
      }

      if (filters?.paymentMethod) {
        query = query.eq('payment_method', filters.paymentMethod)
      }

      query = query.order('payment_date', { ascending: false })

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      records.value = data || []
    } catch (e: any) {
      error.value = e.message
      console.error('Erro ao buscar registros de pagamento:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a payment record
   * Called when marking an occurrence as paid
   */
  const createRecord = async (record: Omit<PaymentRecord, 'id' | 'user_id' | 'created_at'>) => {
    loading.value = true
    error.value = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const payload = {
        ...record,
        user_id: user.id
      }

      const { data, error: createError } = await supabase
        .from('payment_records')
        .insert([payload])
        .select()
        .single()

      if (createError) throw createError

      await fetchRecords()
      return { success: true, data }
    } catch (e: any) {
      error.value = e.message
      console.error('Erro ao criar registro de pagamento:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Update a payment record
   */
  const updateRecord = async (id: string, updates: Partial<PaymentRecord>) => {
    loading.value = true
    error.value = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { data, error: updateError } = await supabase
        .from('payment_records')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      await fetchRecords()
      return { success: true, data }
    } catch (e: any) {
      error.value = e.message
      console.error('Erro ao atualizar registro de pagamento:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a payment record
   */
  const deleteRecord = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { error: deleteError } = await supabase
        .from('payment_records')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      await fetchRecords()
      return { success: true }
    } catch (e: any) {
      error.value = e.message
      console.error('Erro ao deletar registro de pagamento:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Get total amount paid in a period
   */
  const getTotalPaid = computed(() => {
    return records.value.reduce((sum, r) => sum + r.amount, 0)
  })

  /**
   * Get average payment amount
   */
  const getAveragePayment = computed(() => {
    if (records.value.length === 0) return 0
    return getTotalPaid.value / records.value.length
  })

  /**
   * Get payment records grouped by month
   */
  const getRecordsByMonth = computed(() => {
    const grouped: Record<string, PaymentRecord[]> = {}
    records.value.forEach(r => {
      const date = new Date(r.payment_date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(r)
    })
    return grouped
  })

  /**
   * Get payment records grouped by payment method
   */
  const getRecordsByMethod = computed(() => {
    const grouped: Record<string, PaymentRecord[]> = {}
    records.value.forEach(r => {
      const method = r.payment_method || 'Não especificado'
      if (!grouped[method]) {
        grouped[method] = []
      }
      grouped[method].push(r)
    })
    return grouped
  })

  /**
   * Get total paid by payment method
   */
  const getTotalByMethod = computed(() => {
    const totals: Record<string, number> = {}
    records.value.forEach(r => {
      const method = r.payment_method || 'Não especificado'
      if (!totals[method]) {
        totals[method] = 0
      }
      totals[method] += r.amount
    })
    return totals
  })

  /**
   * Get total paid by month
   */
  const getTotalByMonth = computed(() => {
    const totals: Record<string, number> = {}
    records.value.forEach(r => {
      const date = new Date(r.payment_date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!totals[key]) {
        totals[key] = 0
      }
      totals[key] += r.amount
    })
    return totals
  })

  /**
   * Get highest payment amount
   */
  const getHighestPayment = computed(() => {
    if (records.value.length === 0) return 0
    return Math.max(...records.value.map(r => r.amount))
  })

  /**
   * Get lowest payment amount
   */
  const getLowestPayment = computed(() => {
    if (records.value.length === 0) return 0
    return Math.min(...records.value.map(r => r.amount))
  })

  return {
    records,
    loading,
    error,
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    getTotalPaid,
    getAveragePayment,
    getRecordsByMonth,
    getRecordsByMethod,
    getTotalByMethod,
    getTotalByMonth,
    getHighestPayment,
    getLowestPayment
  }
}
