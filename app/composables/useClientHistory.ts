import { ref, computed } from 'vue'

export const useClientHistory = () => {
  const supabase = useSupabaseClient()
  const loading = ref(false)

  const fetchClientHistory = async (companyId: string) => {
    loading.value = true
    try {
      console.log('🔍 [useClientHistory] Buscando histórico do cliente:', companyId)

      // 1. Buscar assinaturas
      console.log('📋 [useClientHistory] Iniciando busca de assinaturas...')
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('customer_id', companyId)
        .order('created_at', { ascending: false })

      if (subError) {
        console.error('❌ [useClientHistory] Erro ao buscar assinaturas:', subError)
      } else {
        console.log('✅ [useClientHistory] Assinaturas encontradas:', subscriptions?.length || 0)
        console.log('📊 [useClientHistory] Dados das assinaturas:', subscriptions)
      }

      // 2. Buscar a empresa principal
      console.log('🏢 [useClientHistory] Buscando empresa com ID:', companyId)
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single()

      if (companyError) {
        console.error('❌ [useClientHistory] Erro ao buscar empresa:', companyError)
      } else {
        console.log('✅ [useClientHistory] Empresa encontrada:', company?.name || 'N/A')
      }
      const companyData = company as any
      console.log('📋 [useClientHistory] Dados da empresa:', companyData)

      // 2b. Buscar TODAS as vendas (produtos e serviços) associadas a este cliente
      // Nota: Vendas são armazenadas na tabela sales com sale_type
      // Precisamos buscar todas as vendas onde name ou representative_name corresponde ao cliente
      const customerName = companyData?.representative_name || companyData?.name
      console.log('🔎 [useClientHistory] Buscando vendas para cliente:', customerName)
      const { data: allSales, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .or(`representative_name.eq.${customerName},name.eq.${customerName}`)
        .in('sale_type', ['produto', 'servico', 'personalizado'])
        .order('created_at', { ascending: false })

      if (salesError) {
        console.error('❌ [useClientHistory] Erro ao buscar vendas:', salesError)
      } else {
        console.log('✅ [useClientHistory] Vendas encontradas:', allSales?.length || 0)
        console.log('📊 [useClientHistory] Dados das vendas:', allSales)
      }

      // Calcular totais de vendas por tipo
      const productSales = allSales?.filter((s: any) => s.sale_type === 'produto') || []
      const serviceSales = allSales?.filter((s: any) => s.sale_type === 'servico') || []
      
      console.log('📦 [useClientHistory] Produtos encontrados:', productSales.length)
      console.log('🛠️ [useClientHistory] Serviços encontrados:', serviceSales.length)
      
      const productValue = productSales.reduce((sum: number, s: any) => sum + (s.monthly_price || 0), 0)
      const serviceValue = serviceSales.reduce((sum: number, s: any) => sum + (s.monthly_price || 0), 0)

      // 3. Buscar histórico de pagamentos (auditoria)
      console.log('💳 [useClientHistory] Buscando histórico de pagamentos...')
      const { data: paymentHistory, error: histError } = await supabase
        .from('payment_history')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (histError) {
        console.error('❌ [useClientHistory] Erro ao buscar histórico:', histError)
      } else {
        console.log('✅ [useClientHistory] Histórico encontrado:', paymentHistory?.length || 0)
      }

      // 4. Buscar tarefas associadas
      console.log('✓ [useClientHistory] Buscando tarefas...')
      const { data: tasks, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (taskError) {
        console.error('❌ [useClientHistory] Erro ao buscar tarefas:', taskError)
      } else {
        console.log('✅ [useClientHistory] Tarefas encontradas:', tasks?.length || 0)
      }

      // Calcular estatísticas de assinaturas
      const activeSubscriptions = subscriptions?.filter((s: any) => s.status === 'active') || []
      const suspendedSubscriptions = subscriptions?.filter((s: any) => s.status === 'suspended') || []
      
      console.log('📊 [useClientHistory] Assinaturas ativas:', activeSubscriptions.length)
      console.log('📊 [useClientHistory] Assinaturas suspensas:', suspendedSubscriptions.length)
      
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

      console.log('📊 [useClientHistory] Estatísticas calculadas:', stats)
      console.log('📋 [useClientHistory] Assinaturas finais:', subscriptions)
      console.log('💰 [useClientHistory] Empresa final:', company)

      const result = {
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
      
      console.log('✅ [useClientHistory] Resultado final:', result)
      return result
    } catch (err: any) {
      console.error('❌ [useClientHistory] Erro ao buscar histórico do cliente:', err)
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
