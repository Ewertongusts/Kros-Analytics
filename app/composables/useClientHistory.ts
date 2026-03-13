import { ref, computed } from 'vue'

export const useClientHistory = () => {
  const supabase = useSupabaseClient()
  const loading = ref(false)

  const fetchClientHistory = async (companyId: string) => {
    loading.value = true
    try {
      console.log('Buscando histórico do cliente:', companyId)

      // 1. Buscar assinaturas ativas
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plan:plans!plan_id(id, name, price, billing_cycle)
        `)
        .eq('customer_id', companyId)
        .order('created_at', { ascending: false })

      if (subError) console.error('Erro ao buscar assinaturas:', subError)
      console.log('Assinaturas encontradas:', subscriptions?.length)

      // 2. Buscar pagamentos dos últimos 12 meses
      const { data: payments, error: payError } = await supabase
        .from('payments')
        .select('*')
        .eq('company_id', companyId)
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
        .order('due_date', { ascending: false })

      if (payError) console.error('Erro ao buscar pagamentos:', payError)
      console.log('Pagamentos encontrados:', payments?.length)

      // 3. Buscar histórico de pagamentos (auditoria)
      const { data: paymentHistory, error: histError } = await supabase
        .from('payment_history')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (histError) console.error('Erro ao buscar histórico:', histError)
      console.log('Histórico encontrado:', paymentHistory?.length)

      // 4. Buscar tarefas associadas
      const { data: tasks, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (taskError) console.error('Erro ao buscar tarefas:', taskError)
      console.log('Tarefas encontradas:', tasks?.length)

      // Calcular estatísticas
      const stats = {
        totalSubscriptions: subscriptions?.length || 0,
        activeSubscriptions: subscriptions?.filter((s: any) => s.status === 'active').length || 0,
        totalPayments: payments?.length || 0,
        paidPayments: payments?.filter((p: any) => p.status === 'paid').length || 0,
        pendingPayments: payments?.filter((p: any) => p.status === 'pending').length || 0,
        totalPaid: payments?.filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0,
        totalPending: payments?.filter((p: any) => p.status === 'pending').reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0,
        activeTasks: tasks?.filter((t: any) => t.status !== 'completed').length || 0
      }

      // Calcular LTV total das assinaturas
      const subscriptionLTV = subscriptions?.reduce((sum: number, s: any) => {
        if (s.status === 'active' || s.status === 'suspended') {
          const months = s.end_date ? 
            Math.ceil((new Date(s.end_date).getTime() - new Date(s.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30)) :
            12
          return sum + (s.amount * months)
        }
        return sum
      }, 0) || 0

      console.log('Estatísticas calculadas:', stats)

      return {
        success: true,
        data: {
          subscriptions: subscriptions || [],
          payments: payments || [],
          paymentHistory: paymentHistory || [],
          tasks: tasks || [],
          stats,
          subscriptionLTV
        }
      }
    } catch (err: any) {
      console.error('Erro ao buscar histórico do cliente:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    fetchClientHistory
  }
}
