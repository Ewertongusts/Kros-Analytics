import { ref } from 'vue'

export type SaleHistoryAction = 'created' | 'updated' | 'whatsapp_sent' | 'receipt_generated' | 'status_changed' | 'deleted'

export type SaleHistoryEntry = {
  id: string
  sale_id: string
  action_type: SaleHistoryAction
  description: string
  user_id?: string
  user_name?: string
  metadata?: Record<string, any>
  created_at: string
}

export const useSaleHistory = () => {
  const supabase = useSupabaseClient()
  const history = ref<SaleHistoryEntry[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchHistory = async (saleId: string) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('sale_history')
        .select('*')
        .eq('sale_id', saleId)
        .order('created_at', { ascending: false })
      
      if (err) throw err
      history.value = data || []
    } catch (err: any) {
      console.error('Erro ao buscar histórico:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const addHistoryEntry = async (
    saleId: string,
    actionType: SaleHistoryAction,
    description: string,
    metadata?: Record<string, any>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error: err } = await supabase
        .from('sale_history')
        .insert({
          sale_id: saleId,
          action_type: actionType,
          description,
          user_id: user?.id,
          user_name: user?.user_metadata?.full_name || user?.email || 'Usuário',
          metadata: metadata || {}
        })
      
      if (err) throw err
    } catch (err: any) {
      console.error('Erro ao adicionar entrada no histórico:', err)
    }
  }

  return {
    history,
    loading,
    error,
    fetchHistory,
    addHistoryEntry
  }
}
