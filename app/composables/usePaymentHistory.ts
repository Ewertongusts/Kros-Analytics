import { ref, computed } from 'vue'

export interface PaymentRecord {
  id: string
  expense_id: string
  user_id: string
  amount: number
  paid_date: string
  payment_method?: string
  notes?: string
  created_at: string
}

export interface PaymentFilters {
  search: string
  category: string
  expenseType: 'all' | 'unique' | 'recurring'
  dateRange: { start: string; end: string } | null
}

export const usePaymentHistory = () => {
  const supabase = useSupabaseClient()
  const payments = ref<PaymentRecord[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchPaymentHistory = async () => {
    loading.value = true
    error.value = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error: fetchError } = await (supabase.from('payment_history') as any)
        .select('*')
        .eq('user_id', user.id)
        .order('paid_date', { ascending: false })

      if (fetchError) throw fetchError
      
      payments.value = data || []
      console.log('✅ Payment history fetched:', payments.value.length, 'records')
    } catch (e: any) {
      error.value = e.message
      console.error('❌ Erro ao buscar histórico de pagamentos:', e)
    } finally {
      loading.value = false
    }
  }

  const recordPayment = async (expenseId: string, amount: number, paymentMethod?: string, notes?: string) => {
    loading.value = true
    error.value = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const payload = {
        expense_id: expenseId,
        user_id: user.id,
        amount,
        paid_date: new Date().toISOString(),
        payment_method: paymentMethod || null,
        notes: notes || null
      }

      console.log('📝 Recording payment:', payload)

      const { data, error: insertError } = await (supabase.from('payment_history') as any)
        .insert([payload])
        .select()
        .single()

      if (insertError) throw insertError

      console.log('✅ Payment recorded successfully')
      await fetchPaymentHistory()
      return { success: true, data }
    } catch (e: any) {
      error.value = e.message
      console.error('❌ Erro ao registrar pagamento:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  const deletePaymentRecord = async (paymentId: string) => {
    loading.value = true
    error.value = null
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      console.log('🗑️ Deleting payment record:', paymentId)

      const { error: deleteError } = await (supabase.from('payment_history') as any)
        .delete()
        .eq('id', paymentId)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      console.log('✅ Payment record deleted')
      await fetchPaymentHistory()
      return { success: true }
    } catch (e: any) {
      error.value = e.message
      console.error('❌ Erro ao deletar registro de pagamento:', e)
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  const getPaymentSummary = computed(() => {
    if (payments.value.length === 0) {
      return {
        totalPaid: 0,
        count: 0,
        average: 0,
        byCategory: {}
      }
    }

    const totalPaid = payments.value.reduce((sum, p) => sum + p.amount, 0)
    const count = payments.value.length
    const average = totalPaid / count

    return {
      totalPaid,
      count,
      average,
      byCategory: {}
    }
  })

  return {
    payments,
    loading,
    error,
    fetchPaymentHistory,
    recordPayment,
    deletePaymentRecord,
    getPaymentSummary
  }
}
