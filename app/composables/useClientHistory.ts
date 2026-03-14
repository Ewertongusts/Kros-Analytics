import { ref, computed } from 'vue'

export const useClientHistory = () => {
  const supabase = useSupabaseClient()
  const loading = ref(false)

  // Função para calcular próximo vencimento baseado em start_date e due_day
  const calculateNextBillingDate = (startDate: string, dueDay: number): string => {
    if (!startDate || !dueDay) return ''
    
    const start = new Date(startDate)
    const today = new Date()
    
    // Começar do mês atual
    let nextBilling = new Date(today.getFullYear(), today.getMonth(), dueDay)
    
    // Se o dia de vencimento já passou este mês, ir para o próximo mês
    if (nextBilling < today) {
      nextBilling = new Date(today.getFullYear(), today.getMonth() + 1, dueDay)
    }
    
    // Garantir que não seja antes da data de início
    if (nextBilling < start) {
      nextBilling = new Date(start.getFullYear(), start.getMonth(), dueDay)
      if (nextBilling < start) {
        nextBilling = new Date(start.getFullYear(), start.getMonth() + 1, dueDay)
      }
    }
    
    // Formatar como YYYY-MM-DD
    const year = nextBilling.getFullYear()
    const month = String(nextBilling.getMonth() + 1).padStart(2, '0')
    const day = String(nextBilling.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  }

  const fetchClientHistory = async (companyId: string) => {
    loading.value = true
    try {
      console.log('🔍 [useClientHistory] Buscando histórico do cliente:', companyId)

      // 1. Buscar assinaturas com dados do plano
      console.log('📋 [useClientHistory] Iniciando busca de assinaturas...')
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plan:plan_id(id, name)
        `)
        .eq('customer_id', companyId)
        .order('created_at', { ascending: false })

      if (subError) {
        console.error('❌ [useClientHistory] Erro ao buscar assinaturas:', subError)
      } else {
        console.log('✅ [useClientHistory] Assinaturas encontradas:', subscriptions?.length || 0)
        // Debug: mostrar todos os campos de cada assinatura
        subscriptions?.forEach((sub: any) => {
          console.log(`📌 [useClientHistory] Assinatura: ${sub.plan?.name || 'N/A'}`)
          console.log('   Campos:', Object.keys(sub).join(', '))
          console.log('   Valores:', {
            id: sub.id,
            customer_id: sub.customer_id,
            plan_id: sub.plan_id,
            status: sub.status,
            amount: sub.amount,
            start_date: sub.start_date,
            end_date: sub.end_date,
            next_billing_date: sub.next_billing_date,
            renewal_date: sub.renewal_date,
            billing_date: sub.billing_date,
            created_at: sub.created_at,
            updated_at: sub.updated_at,
            plan: sub.plan
          })
        })
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
      
      // Buscar por representative_name
      const { data: salesByRep, error: repError } = await supabase
        .from('sales')
        .select('*')
        .eq('representative_name', customerName)
        .in('sale_type', ['produto', 'servico', 'personalizado'])
        .order('created_at', { ascending: false })

      // Buscar por name
      const { data: salesByName, error: nameError } = await supabase
        .from('sales')
        .select('*')
        .eq('name', customerName)
        .in('sale_type', ['produto', 'servico', 'personalizado'])
        .order('created_at', { ascending: false })

      // Combinar resultados e remover duplicatas
      const allSalesArray = [...(salesByRep || []), ...(salesByName || [])]
      const allSales = Array.from(new Map(allSalesArray.map(item => [item.id, item])).values())

      if (repError) {
        console.error('❌ [useClientHistory] Erro ao buscar vendas por representative_name:', repError)
      }
      if (nameError) {
        console.error('❌ [useClientHistory] Erro ao buscar vendas por name:', nameError)
      }
      
      console.log('✅ [useClientHistory] Vendas encontradas:', allSales?.length || 0)
      console.log('📊 [useClientHistory] Dados das vendas:', allSales)
      
      // Debug: mostrar payment_status de cada venda
      allSales?.forEach((sale: any) => {
        console.log(`📌 [useClientHistory] Venda: ${sale.plan_name || sale.custom_name} - Status: ${sale.payment_status}`)
      })

      // Calcular totais de vendas por tipo
      const productSales = allSales?.filter((s: any) => s.sale_type === 'produto') || []
      const serviceSales = allSales?.filter((s: any) => s.sale_type === 'servico') || []
      
      // Calcular vendas pagas e pendentes por tipo
      const paidProductSales = productSales.filter((s: any) => s.payment_status === 'paid')
      const paidServiceSales = serviceSales.filter((s: any) => s.payment_status === 'paid')
      const pendingProductSales = productSales.filter((s: any) => s.payment_status === 'pending')
      const pendingServiceSales = serviceSales.filter((s: any) => s.payment_status === 'pending')
      
      console.log('📦 [useClientHistory] Produtos encontrados:', productSales.length)
      console.log('🛠️ [useClientHistory] Serviços encontrados:', serviceSales.length)
      console.log('✅ [useClientHistory] Produtos pagos:', paidProductSales.length)
      console.log('✅ [useClientHistory] Serviços pagos:', paidServiceSales.length)
      console.log('⏳ [useClientHistory] Produtos pendentes:', pendingProductSales.length)
      console.log('⏳ [useClientHistory] Serviços pendentes:', pendingServiceSales.length)
      
      const productValue = productSales.reduce((sum: number, s: any) => sum + (s.monthly_price || 0), 0)
      const serviceValue = serviceSales.reduce((sum: number, s: any) => sum + (s.monthly_price || 0), 0)
      const paidProductValue = paidProductSales.reduce((sum: number, s: any) => sum + (s.monthly_price || 0), 0)
      const paidServiceValue = paidServiceSales.reduce((sum: number, s: any) => sum + (s.monthly_price || 0), 0)
      const pendingProductValue = pendingProductSales.reduce((sum: number, s: any) => sum + (s.monthly_price || 0), 0)
      const pendingServiceValue = pendingServiceSales.reduce((sum: number, s: any) => sum + (s.monthly_price || 0), 0)

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
      
      // Adicionar payment_status e próximo vencimento às assinaturas baseado nas vendas
      const subscriptionsWithPaymentStatus = subscriptions?.map((sub: any) => {
        // Procurar venda associada a esta assinatura usando o nome do plano
        const planName = sub.plan?.name || sub.plan_name
        const associatedSale = allSales?.find((sale: any) => 
          sale.plan_name === planName || 
          (sale.custom_name && sale.custom_name === planName)
        )
        
        // Calcular próximo vencimento
        const nextBillingDate = calculateNextBillingDate(sub.start_date, sub.due_day)
        
        return {
          ...sub,
          plan_name: planName,
          payment_status: associatedSale?.payment_status || 'pending',
          next_billing_date: nextBillingDate
        }
      }) || []
      
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
        subscriptionLTV,
        // Vendas pagas por tipo
        paidProductValue,
        paidServiceValue,
        // Vendas pendentes por tipo
        pendingProductValue,
        pendingServiceValue
      }

      console.log('📊 [useClientHistory] Estatísticas calculadas:', stats)
      console.log('📋 [useClientHistory] Assinaturas finais:', subscriptions)
      console.log('💰 [useClientHistory] Empresa final:', company)

      const result = {
        success: true,
        data: {
          subscriptions: subscriptionsWithPaymentStatus,
          payments: subscriptionsWithPaymentStatus,
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
