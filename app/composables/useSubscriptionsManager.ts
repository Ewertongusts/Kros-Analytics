import { ref } from 'vue'

export type Subscription = {
  id?: string
  customer_id: string
  plan_id: string
  status: 'active' | 'pending' | 'trial' | 'suspended' | 'cancelled'
  start_date: string
  end_date?: string
  due_day: number
  amount: number
  discount_percent?: number
  discount_amount?: number
  auto_billing_enabled?: boolean
  auto_billing_message?: string
  notes?: string
  metadata?: any
  created_at?: string
  created_by?: string
  updated_at?: string
  updated_by?: string
}

export type SubscriptionWithDetails = Subscription & {
  customer_name?: string
  customer_email?: string
  plan_name?: string
  plan_billing_cycle?: string
}

export const useSubscriptionsManager = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const subscriptions = ref<SubscriptionWithDetails[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchSubscriptions = async () => {
    loading.value = true
    error.value = null
    try {
      console.log('fetchSubscriptions: buscando dados do banco...')
      const { data, error: err } = await supabase
        .from('subscriptions')
        .select(`
          *,
          customer:companies!customer_id(id, name, email, tags, representative_name),
          plan:plans!plan_id(id, name, price, billing_cycle)
        `)
        .order('created_at', { ascending: false })
      
      if (err) throw err
      
      console.log('fetchSubscriptions: dados recebidos:', data?.length)
      
      // Limpar array primeiro para forçar reatividade
      subscriptions.value = []
      
      // Aguardar próximo tick
      await new Promise(resolve => setTimeout(resolve, 0))
      
      // Atualizar com novos dados
      subscriptions.value = (data || []).map((sub: any) => ({
        ...sub,
        customer_name: sub.customer?.representative_name || sub.customer?.name,
        customer_actual_name: sub.customer?.name,
        customer_email: sub.customer?.email,
        tags: sub.customer?.tags || [],
        plan_name: sub.plan?.name,
        plan_billing_cycle: sub.plan?.billing_cycle
      }))
      
      console.log('fetchSubscriptions: subscriptions.value atualizado:', subscriptions.value.length)
      
      return { success: true, data: subscriptions.value }
    } catch (err: any) {
      console.error('Erro ao buscar assinaturas:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const fetchSubscriptionById = async (id: string) => {
    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('subscriptions')
        .select(`
          *,
          customer:companies!customer_id(id, name, email, representative_name),
          plan:plans!plan_id(id, name, price, billing_cycle)
        `)
        .eq('id', id)
        .single()
      
      if (err) throw err
      return { success: true, data }
    } catch (err: any) {
      console.error('Erro ao buscar assinatura:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const fetchCustomerSubscriptions = async (customerId: string) => {
    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plan:plans!plan_id(id, name, price, billing_cycle)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
      
      if (err) throw err
      return { success: true, data: data || [] }
    } catch (err: any) {
      console.error('Erro ao buscar assinaturas do cliente:', err)
      return { success: false, error: err.message, data: [] }
    } finally {
      loading.value = false
    }
  }

  const createSubscription = async (subscription: Subscription) => {
    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('subscriptions')
        .insert([{
          customer_id: subscription.customer_id,
          plan_id: subscription.plan_id,
          status: subscription.status || 'active',
          start_date: subscription.start_date,
          end_date: subscription.end_date || null,
          due_day: subscription.due_day,
          amount: subscription.amount,
          discount_percent: subscription.discount_percent || 0,
          discount_amount: subscription.discount_amount || 0,
          auto_billing_enabled: subscription.auto_billing_enabled || false,
          auto_billing_message: subscription.auto_billing_message || null,
          notes: subscription.notes || null,
          metadata: subscription.metadata || {},
          created_by: user.value?.id,
          created_at: new Date().toISOString()
        }])
        .select(`
          *,
          customer:companies!customer_id(id, name, email, representative_name),
          plan:plans!plan_id(id, name, price, billing_cycle)
        `)
        .single()
      
      if (err) throw err
      
      const newSub = {
        ...data,
        customer_name: data.customer?.representative_name || data.customer?.name,
        customer_actual_name: data.customer?.name,
        customer_email: data.customer?.email,
        plan_name: data.plan?.name,
        plan_billing_cycle: data.plan?.billing_cycle
      }
      
      subscriptions.value.unshift(newSub)
      return { success: true, data: newSub }
    } catch (err: any) {
      console.error('Erro ao criar assinatura:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
    loading.value = true
    try {
      const updateData: any = {
        ...updates,
        updated_by: user.value?.id,
        updated_at: new Date().toISOString()
      }
      
      const { data, error: err } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          customer:companies!customer_id(id, name, email, representative_name),
          plan:plans!plan_id(id, name, price, billing_cycle)
        `)
        .single()
      
      if (err) throw err
      
      const updatedSub = {
        ...data,
        customer_name: data.customer?.representative_name || data.customer?.name,
        customer_actual_name: data.customer?.name,
        customer_email: data.customer?.email,
        plan_name: data.plan?.name,
        plan_billing_cycle: data.plan?.billing_cycle
      }
      
      const index = subscriptions.value.findIndex(s => s.id === id)
      if (index !== -1) {
        subscriptions.value[index] = updatedSub
      }
      
      return { success: true, data: updatedSub }
    } catch (err: any) {
      console.error('Erro ao atualizar assinatura:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const cancelSubscription = async (id: string, reason?: string) => {
    const result = await updateSubscription(id, {
      status: 'cancelled',
      end_date: new Date().toISOString().split('T')[0],
      notes: reason ? `Cancelada: ${reason}` : 'Cancelada'
    })
    
    if (result.success) {
      const sub = result.data
      const { addHistoryEntry } = usePaymentHistory()
      await addHistoryEntry({
        payment_id: id,
        company_id: sub.customer_id,
        action_type: 'subscription_cancelled',
        description: `Assinatura cancelada${reason ? `: ${reason}` : ''}`,
        metadata: {
          subscription_id: id,
          plan_name: sub.plan_name,
          customer_name: sub.customer_name,
          cancelled_at: new Date().toISOString()
        }
      })
    }
    
    return result
  }

  const suspendSubscription = async (id: string, reason?: string) => {
    const result = await updateSubscription(id, {
      status: 'suspended',
      notes: reason ? `Suspensa: ${reason}` : 'Suspensa'
    })
    
    if (result.success) {
      const sub = result.data
      const { addHistoryEntry } = usePaymentHistory()
      await addHistoryEntry({
        payment_id: id,
        company_id: sub.customer_id,
        action_type: 'subscription_suspended',
        description: `Assinatura suspensa${reason ? `: ${reason}` : ''}`,
        metadata: {
          subscription_id: id,
          plan_name: sub.plan_name,
          customer_name: sub.customer_name,
          suspended_at: new Date().toISOString()
        }
      })
    }
    
    return result
  }

  const reactivateSubscription = async (id: string) => {
    const result = await updateSubscription(id, {
      status: 'active',
      end_date: undefined
    })
    
    if (result.success) {
      const sub = result.data
      const { addHistoryEntry } = usePaymentHistory()
      await addHistoryEntry({
        payment_id: id,
        company_id: sub.customer_id,
        action_type: 'subscription_reactivated',
        description: 'Assinatura reativada',
        metadata: {
          subscription_id: id,
          plan_name: sub.plan_name,
          customer_name: sub.customer_name,
          reactivated_at: new Date().toISOString()
        }
      })
    }
    
    return result
  }

  const deleteSubscription = async (id: string) => {
    loading.value = true
    try {
      console.log('deleteSubscription: apagando', id)
      console.log('Array antes:', subscriptions.value.length)
      
      // Buscar dados da assinatura antes de deletar para o log
      const subToDelete = subscriptions.value.find(s => s.id === id)
      
      const { error: err } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
      
      if (err) throw err
      
      // Registrar no histórico
      if (subToDelete) {
        const { addHistoryEntry } = usePaymentHistory()
        await addHistoryEntry({
          payment_id: id,
          company_id: subToDelete.customer_id,
          action_type: 'subscription_deleted',
          description: 'Assinatura deletada permanentemente',
          metadata: {
            subscription_id: id,
            plan_name: subToDelete.plan_name,
            customer_name: subToDelete.customer_name,
            deleted_at: new Date().toISOString()
          }
        })
      }
      
      // Forçar reatividade criando novo array
      subscriptions.value = subscriptions.value.filter(s => s.id !== id)
      
      console.log('Array depois:', subscriptions.value.length)
      return { success: true }
    } catch (err: any) {
      console.error('Erro ao remover assinatura:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const toggleAutoBilling = async (id: string, enabled: boolean, message?: string) => {
    const result = await updateSubscription(id, {
      auto_billing_enabled: enabled,
      auto_billing_message: message || null
    })
    
    if (result.success) {
      const sub = result.data
      const { addHistoryEntry } = usePaymentHistory()
      await addHistoryEntry({
        payment_id: id,
        company_id: sub.customer_id,
        action_type: enabled ? 'auto_billing_enabled' : 'auto_billing_disabled',
        description: `Cobrança automática ${enabled ? 'ativada' : 'desativada'}`,
        metadata: {
          subscription_id: id,
          plan_name: sub.plan_name,
          customer_name: sub.customer_name,
          auto_billing_enabled: enabled,
          message: message || null
        }
      })
    }
    
    return result
  }

  // Ações em massa com callback de progresso
  const batchSuspend = async (ids: string[], reason?: string, onProgress?: (current: number, total: number, item?: any) => void) => {
    const results = {
      success: true,
      successCount: 0,
      failureCount: 0,
      errors: [] as Array<{ id: string, error: string }>
    }
    
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i]
      if (onProgress) onProgress(i, ids.length, id)
      
      const result = await suspendSubscription(id, reason)
      if (result.success) {
        results.successCount++
      } else {
        results.failureCount++
        results.errors.push({ id, error: result.error || 'Erro desconhecido' })
      }
    }
    
    if (onProgress) onProgress(ids.length, ids.length)
    results.success = results.failureCount === 0
    return results
  }

  const batchReactivate = async (ids: string[], onProgress?: (current: number, total: number, item?: any) => void) => {
    const results = {
      success: true,
      successCount: 0,
      failureCount: 0,
      errors: [] as Array<{ id: string, error: string }>
    }
    
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i]
      if (onProgress) onProgress(i, ids.length, id)
      
      const result = await reactivateSubscription(id)
      if (result.success) {
        results.successCount++
      } else {
        results.failureCount++
        results.errors.push({ id, error: result.error || 'Erro desconhecido' })
      }
    }
    
    if (onProgress) onProgress(ids.length, ids.length)
    results.success = results.failureCount === 0
    return results
  }

  const batchCancel = async (ids: string[], reason?: string, onProgress?: (current: number, total: number, item?: any) => void) => {
    const results = {
      success: true,
      successCount: 0,
      failureCount: 0,
      errors: [] as Array<{ id: string, error: string }>
    }
    
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i]
      if (onProgress) onProgress(i, ids.length, id)
      
      const result = await cancelSubscription(id, reason)
      if (result.success) {
        results.successCount++
      } else {
        results.failureCount++
        results.errors.push({ id, error: result.error || 'Erro desconhecido' })
      }
    }
    
    if (onProgress) onProgress(ids.length, ids.length)
    results.success = results.failureCount === 0
    return results
  }

  const batchDelete = async (ids: string[], onProgress?: (current: number, total: number, item?: any) => void) => {
    const results = {
      success: true,
      successCount: 0,
      failureCount: 0,
      errors: [] as Array<{ id: string, error: string }>
    }
    
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i]
      if (onProgress) onProgress(i, ids.length, id)
      
      const result = await deleteSubscription(id)
      if (result.success) {
        results.successCount++
      } else {
        results.failureCount++
        results.errors.push({ id, error: result.error || 'Erro desconhecido' })
      }
    }
    
    if (onProgress) onProgress(ids.length, ids.length)
    results.success = results.failureCount === 0
    return results
  }

  return {
    subscriptions,
    loading,
    error,
    fetchSubscriptions,
    fetchSubscriptionById,
    fetchCustomerSubscriptions,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    suspendSubscription,
    reactivateSubscription,
    deleteSubscription,
    toggleAutoBilling,
    batchSuspend,
    batchReactivate,
    batchCancel,
    batchDelete
  }
}
