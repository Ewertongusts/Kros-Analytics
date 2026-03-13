import { ref } from 'vue'

export interface PaymentHistoryEntry {
  id: string
  payment_id?: string
  company_id?: string
  action_type: string
  description: string
  user_id?: string
  user_name?: string
  metadata?: any
  created_at: string
}

export const usePaymentHistory = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const history = ref<PaymentHistoryEntry[]>([])
  const loading = ref(false)

  const addHistoryEntry = async (entry: {
    payment_id?: string
    company_id?: string
    action_type: string
    description: string
    metadata?: any
  }) => {
    try {
      const userName = user.value?.user_metadata?.full_name || user.value?.email || 'Sistema'
      
      const { error } = await supabase
        .from('payment_history')
        .insert([{
          payment_id: entry.payment_id,
          company_id: entry.company_id,
          action_type: entry.action_type,
          description: entry.description,
          user_id: user.value?.id,
          user_name: userName,
          metadata: entry.metadata || {}
        }])

      if (error) throw error
      return { success: true }
    } catch (err: any) {
      console.error('Erro ao adicionar entrada no histórico:', err)
      return { success: false, error: err.message }
    }
  }

  const fetchPaymentHistory = async (paymentId: string) => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('payment_id', paymentId)
        .order('created_at', { ascending: false })

      if (error) throw error
      history.value = data || []
      return { success: true, data }
    } catch (err: any) {
      console.error('Erro ao buscar histórico:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const fetchCompanyHistory = async (companyId: string) => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (error) throw error
      history.value = data || []
      return { success: true, data }
    } catch (err: any) {
      console.error('Erro ao buscar histórico:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const fetchAllHistory = async (limit = 100) => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      history.value = data || []
      return { success: true, data }
    } catch (err: any) {
      console.error('Erro ao buscar histórico:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  return {
    history,
    loading,
    addHistoryEntry,
    fetchPaymentHistory,
    fetchCompanyHistory,
    fetchAllHistory
  }
}
