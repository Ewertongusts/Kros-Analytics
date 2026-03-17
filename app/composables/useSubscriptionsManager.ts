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
  last_alert_at?: string | null
  cron_enabled?: boolean
  cron_period?: string | null
  cron_scheduled_time?: string | null
  cron_next_execution?: string | null
  cron_message?: string | null
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
      console.log('🔍 [useSubscriptionsManager] fetchSubscriptions: buscando dados do banco...')
      
      let query = supabase
        .from('subscriptions')
        .select(`
          *,
          customer:companies!customer_id(id, name, email, tags, representative_name, whatsapp, payments(id, cron_enabled, cron_period, cron_scheduled_time, cron_next_execution, cron_message)),
          plan:plans!plan_id(id, name, price, billing_cycle)
        `)
      
      // Remover filtro por user_id pois a tabela subscriptions não tem essa coluna
      // if (user.value) {
      //   query = query.eq('user_id', user.value.id)
      // }
      
      const { data, error: err } = await query.order('created_at', { ascending: false })
      
      if (err) {
        console.error('❌ [useSubscriptionsManager] Erro na query:', err)
        throw err
      }
      
      console.log('✅ [useSubscriptionsManager] fetchSubscriptions: dados recebidos:', data?.length)
      
      // Limpar array primeiro para forçar reatividade
      subscriptions.value = []
      
      // Aguardar próximo tick
      await new Promise(resolve => setTimeout(resolve, 0))
      
      // Atualizar com novos dados
      subscriptions.value = (data || []).map((sub: any) => {
        // Pegar o primeiro pagamento (mais recente) para obter dados de CRON
        const latestPayment = sub.customer?.payments?.[0]
        
        return {
          ...sub,
          customer_name: sub.customer?.representative_name || sub.customer?.name,
          customer_actual_name: sub.customer?.name,
          customer_email: sub.customer?.email,
          customer_whatsapp: sub.customer?.whatsapp || '',
          tags: sub.customer?.tags || [],
          plan_name: sub.plan?.name,
          plan_billing_cycle: sub.plan?.billing_cycle,
          last_alert_at: null, // Será preenchido depois
          // Adicionar dados de CRON do pagamento
          cron_enabled: latestPayment?.cron_enabled || false,
          cron_period: latestPayment?.cron_period || null,
          cron_scheduled_time: latestPayment?.cron_scheduled_time || null,
          cron_next_execution: latestPayment?.cron_next_execution || null,
          cron_message: latestPayment?.cron_message || null
        }
      })
      
      // Buscar last_alert_at de payments para cada assinatura
      for (let i = 0; i < subscriptions.value.length; i++) {
        try {
          const { data: payment } = await supabase
            .from('payments')
            .select('last_alert_at')
            .eq('company_id', subscriptions.value[i].customer_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
          
          if (payment && payment.last_alert_at) {
            subscriptions.value[i].last_alert_at = payment.last_alert_at
            console.log(`📅 [fetchSubscriptions] ${subscriptions.value[i].customer_name}: last_alert_at = ${payment.last_alert_at}`)
          }
        } catch (err) {
          // Ignorar erro se não encontrar pagamento
          console.log(`⚠️ [fetchSubscriptions] ${subscriptions.value[i].customer_name}: sem pagamentos`)
        }
      }
      
      console.log('✅ [useSubscriptionsManager] fetchSubscriptions: subscriptions.value atualizado:', subscriptions.value.length)
      console.log('📋 [useSubscriptionsManager] Dados das assinaturas:', subscriptions.value)
      console.log('🤖 [useSubscriptionsManager] CRON por assinatura:')
      subscriptions.value.forEach((sub, idx) => {
        console.log(`  [${idx}] ${sub.customer_name}: cron_enabled=${sub.cron_enabled}, period=${sub.cron_period}, time=${sub.cron_scheduled_time}`)
      })
      console.log('🏷️ [useSubscriptionsManager] Tags por assinatura:')
      subscriptions.value.forEach((sub, idx) => {
        console.log(`  [${idx}] ${sub.customer_name}: ${sub.tags?.length || 0} tags -`, sub.tags)
      })
      console.log('📱 [useSubscriptionsManager] WhatsApp por assinatura:')
      subscriptions.value.forEach((sub, idx) => {
        console.log(`  [${idx}] ${sub.customer_name}: WhatsApp = "${sub.customer_whatsapp}"`)
      })
      
      return { success: true, data: subscriptions.value }
    } catch (err: any) {
      console.error('❌ [useSubscriptionsManager] Erro ao buscar assinaturas:', err)
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
