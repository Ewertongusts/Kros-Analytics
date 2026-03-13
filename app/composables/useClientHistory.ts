import { ref, computed } from 'vue'

export const useClientHistory = () => {
  const supabase = useSupabaseClient()
  const loading = ref(false)

  const fetchClientHistory = async (companyId: string) => {
    loading.value = true
    try {
      console.log('🔍 Buscando histórico do cliente:', companyId)

      // 1. Buscar assinaturas
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plan:plans!plan_id(id, name, price, billing_cycle)
        `)
        .eq('customer_id', companyId)
        .order('created_at', { ascending: false })

      if (subError) console.error('❌ Erro ao buscar assinaturas:', subError)
      console.log('✅ Assinaturas encontradas:', subscriptions?.length || 0)

      // 2. Buscar a empresa principal
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single()

      if (companyError) console.error('❌ Erro ao buscar empresa:', companyError)
      const companyData = company as any
      console.log('✅ Empresa encontrada:', companyData?.name || 'N/A')

      // 2b. Buscar TODAS as vendas (produtos e serviços) associadas a este cliente
      // Nota: Vendas são armazenadas na tabela companies com sale_type
      // Precisamos buscar todas as vendas onde representative_name corresponde ao cliente
      const customerName = companyData?.representative_name || companyData?.name
      const { data: allSales, error: salesError } = await supabase
        .from('companies')
        .select('*')
        .eq('representative_name', customerName)
        .in('sale_type', ['produto', 'servico', 'personalizado'])
        .order('created_at', { ascending: false })

      if (salesError) console.error('❌ Erro ao buscar vendas:', salesError)
      console.log('✅ Vendas encontradas:', allSales?.length || 0, 'para cliente:', customerName)

      // Calcular totais de vendas por tipo
      const productSales = allSales?.filter((s: any) => s.sale_type === 'produto') || []
      const serviceSales = allSales?.filter((s: any) => s.sale_type === 'servico') || []
      
      const productValue = productSales.reduce((sum: number, s: any) => sum + (s.monthly_price || 0), 0)
      const serviceValue = serviceSales.reduce((sum: number, s: any) => sum + (s.monthly_price || 0), 0)

      // 3. Buscar histórico de pagamentos (auditoria)
      const { data: paymentHistory, error: histError } = await supabase
        .from('payment_history')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (histError) console.error('❌ Erro ao buscar histórico:', histError)
      console.log('✅ Histórico encontrado:', paymentHistory?.length || 0)

      // 4. Buscar tarefas associadas
      const { data: tasks, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (taskError) console.error('❌ Erro ao buscar tarefas:', taskError)
      console.log('✅ Tarefas encontradas:', tasks?.length || 0)

      // Calcular estatísticas de assinaturas
      const activeSubscriptions = subscriptions?.filter((s: any) => s.status === 'active') || []
      const suspendedSubscriptions = subscriptions?.filter((s: any) => s.status === 'suspended') || []
      
      // Contar pagamentos realizados do histórico
      const paidPayments = paymentHistory?.filter((p: any) => p.action_type === 'payment_received' || p.description?.includes('Pago')) || []
      
      // Calcular total pago e pendente baseado nas assinaturas
      const totalPaid = activeSubscriptions.reduce((sum: number, s: any) => sum + (s.amount || 0), 0)
      const totalPending = suspendedSubscriptions.reduce((sum: number, s: any) => sum + (s.amount || 0), 0)

      // Calcular LTV total das assinaturas
      const subscriptionLTV = subscriptions?.reduce((sum: number, s: any) => {
        if (s.status === 'active' || s.status === 'suspended') {
          const months = s.end_date ? 
            Math.ceil((new Date(s.end_date).getTime() - new Date(s.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30)) :
            12
          return sum + ((s.amount || 0) * months)
        }
        return sum
      }, 0) || 0

      // Calcular totais de vendas por tipo (baseado na empresa)
      const totalProductValue = productValue
      const totalServiceValue = serviceValue

      // Calcular total de assinaturas pagas (ativas)
      const totalPaidSubscriptions = activeSubscriptions.reduce((sum: number, s: any) => sum + (s.amount || 0), 0)

      const stats = {
        totalSubscriptions: subscriptions?.length || 0,
        activeSubscriptions: activeSubscriptions.length,
        totalPayments: paymentHistory?.length || 0,
        paidPayments: paidPayments.length,
        pendingPayments: subscriptions?.filter((s: any) => s.status === 'pending').length || 0,
        totalPaid,
        totalPending,
        activeTasks: tasks?.filter((t: any) => t.status !== 'completed').length || 0,
        // Novas métricas
        totalProductValue,
        totalServiceValue,
        totalPaidSubscriptions,
        subscriptionLTV
      }

      console.log('📊 Estatísticas calculadas:', stats)
      console.log('📋 Assinaturas:', subscriptions)
      console.log('💰 Empresa:', company)

      return {
        success: true,
        data: {
          subscriptions: subscriptions || [],
          payments: subscriptions || [],
          paymentHistory: paymentHistory || [],
          tasks: tasks || [],
          company: companyData || {},
          allSales: allSales || [],
          stats,
          subscriptionLTV
        }
      }
    } catch (err: any) {
      console.error('❌ Erro ao buscar histórico do cliente:', err)
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
