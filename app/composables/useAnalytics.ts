const stats = ref({
    mrr: 0,
    ltv: 0,
    newClients: 0,
    receivedMonth: 0,
    totalClients: 0,
    activeUsers: 0,
    activeCompanies: 0,
    inactiveCompanies: 0,
    paidPaymentsCount: 0,
    pendingPaymentsCount: 0,
    pendingAmount: 0,
    totalExpenses: 0,
    paymentsList: [] as any[],
    transactionsList: [] as any[]
})

const loading = ref(false)
const isFetching = ref(false)

export const useAnalytics = () => {
    const supabase = useSupabaseClient()

    const fetchStats = async (force = false, silent = false) => {
        if (isFetching.value && !force) return

        isFetching.value = true
        if (!silent) loading.value = true
        const now = new Date()
        now.setHours(0, 0, 0, 0)

        try {
            // 1. EMPRESAS (fonte principal de dados)
            // Agora buscando também os pagamentos para calcular o LTV individual
            const { data: companiesData } = await (supabase.from('companies') as any)
                .select(`
                    id, is_active, created_at, monthly_price, whatsapp, name, email, 
                    representative_name, tags, plan_name, billing_cycle, billing_day,
                    payments (amount, status)
                `)

            const companiesMap = new Map()

            if (companiesData) {
                const companies = (companiesData as any[]).map(c => {
                    // LTV Individual = soma de todos os pagamentos 'paid' desta empresa específica
                    const companyLtv = (c.payments || [])
                        .filter((p: any) => p.status === 'paid')
                        .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0)
                    
                    const enriched = { ...c, ltv: companyLtv }
                    companiesMap.set(c.id, enriched)
                    return enriched
                })

                const activeCompanies = companies.filter(c => c.is_active)

                stats.value.totalClients = companies.length
                stats.value.activeCompanies = activeCompanies.length
                stats.value.inactiveCompanies = companies.filter(c => !c.is_active).length

                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
                stats.value.newClients = activeCompanies.filter(c => new Date(c.created_at) >= startOfMonth).length

                stats.value.mrr = activeCompanies
                    .reduce((acc, c) => acc + Number(c.monthly_price || 0), 0)

                // LTV Médio Global
                if (activeCompanies.length > 0) {
                    const totalIncome = activeCompanies.reduce((acc, c) => acc + Number(c.monthly_price || 0), 0)
                    stats.value.ltv = totalIncome / activeCompanies.length
                } else {
                    stats.value.ltv = 0
                }
            }

            // 2. PAGAMENTOS - só de empresas ATIVAS
            console.log('🔍 [fetchStats] Iniciando busca de pagamentos...')
            console.log('🔍 [fetchStats] Filtros: companies.is_active = true')
            
            const { data: paymentsData, error: paymentsError } = await (supabase.from('payments') as any)
                .select('id, company_id, amount, status, due_date, paid_at, plan_name, notes, auto_billing_enabled, cron_enabled, cron_message, companies!inner(id, name, whatsapp, is_active, tags, billing_cycle)')
                .eq('companies.is_active', true)
                .order('due_date', { ascending: true })

            if (paymentsData) {
                
                // 2.1 Buscar últimos logs para identificar o último alerta
                const { data: logsData } = await supabase
                    .from('message_logs')
                    .select('payment_id, created_at')
                    .order('created_at', { ascending: false })

                const lastAlertsMap = new Map()
                if (logsData) {
                    (logsData as any[]).forEach(log => {
                        if (!lastAlertsMap.has(log.payment_id)) {
                            lastAlertsMap.set(log.payment_id, log.created_at)
                        }
                    })
                }

                // 2.2 Buscar payment_history para verificar pagamentos do ciclo atual
                const { data: paymentHistoryData } = await supabase
                    .from('payment_history')
                    .select('company_id, action_type, created_at')
                    .in('action_type', ['paid', 'payment_received'])

                console.log(`📋 [fetchStats] payment_history records encontrados: ${paymentHistoryData?.length || 0}`)
                if (paymentHistoryData && paymentHistoryData.length > 0) {
                    console.log(`📋 [fetchStats] Primeiros registros:`, paymentHistoryData.slice(0, 3))
                    console.log(`📋 [fetchStats] Company IDs encontrados:`, [...new Set(paymentHistoryData.map((ph: any) => ph.company_id))])
                }

                // Mapear payment_history por company_id e ciclo
                const paymentHistoryMap = new Map()
                if (paymentHistoryData) {
                    (paymentHistoryData as any[]).forEach(ph => {
                        const key = `${ph.company_id}-${new Date(ph.created_at).toISOString().split('T')[0]}`
                        if (!paymentHistoryMap.has(ph.company_id)) {
                            paymentHistoryMap.set(ph.company_id, [])
                        }
                        paymentHistoryMap.get(ph.company_id).push(ph)
                    })
                }
                console.log(`📊 [fetchStats] paymentHistoryMap size: ${paymentHistoryMap.size}`)
                console.log(`📊 [fetchStats] paymentHistoryMap keys:`, Array.from(paymentHistoryMap.keys()))

                // Função para calcular período de cobrança
                const calculateBillingPeriod = (billingCycle: string) => {
                    const today = new Date()
                    const currentDay = today.getDate()
                    const currentMonth = today.getMonth()
                    const currentYear = today.getFullYear()
                    
                    let cycleStart: Date
                    let cycleEnd: Date
                    
                    switch (billingCycle?.toLowerCase()) {
                        case 'mensal':
                            cycleStart = new Date(currentYear, currentMonth, 1)
                            cycleEnd = new Date(currentYear, currentMonth + 1, 1)
                            break
                        case 'trimestral':
                            const quarterMonth = Math.floor(currentMonth / 3) * 3
                            cycleStart = new Date(currentYear, quarterMonth, 1)
                            cycleEnd = new Date(currentYear, quarterMonth + 3, 1)
                            break
                        case 'semestral':
                            const semiMonth = Math.floor(currentMonth / 6) * 6
                            cycleStart = new Date(currentYear, semiMonth, 1)
                            cycleEnd = new Date(currentYear, semiMonth + 6, 1)
                            break
                        case 'anual':
                            cycleStart = new Date(currentYear, 0, 1)
                            cycleEnd = new Date(currentYear + 1, 0, 1)
                            break
                        default:
                            cycleStart = new Date(currentYear, currentMonth, 1)
                            cycleEnd = new Date(currentYear, currentMonth + 1, 1)
                    }
                    
                    return { cycleStart, cycleEnd }
                }

                const payments = (paymentsData as any[]).map(p => {
                    // Debug log
                    console.log(`📦 [fetchStats] Payment ${p.id}: cron_enabled=${p.cron_enabled}, auto_billing_enabled=${p.auto_billing_enabled}`)
                    
                    const companyInfo = companiesMap.get(p.company_id)
                    let enrichedStatus = p.status

                    // Verificar se há pagamento neste ciclo
                    const billingCycle = p.companies?.billing_cycle || companyInfo?.billing_cycle || 'Mensal'
                    const { cycleStart, cycleEnd } = calculateBillingPeriod(billingCycle)
                    
                    const companyPaymentHistory = paymentHistoryMap.get(p.company_id) || []
                    
                    const paidThisCycle = companyPaymentHistory.some((ph: any) => {
                        const phDate = new Date(ph.created_at)
                        return phDate >= cycleStart && phDate < cycleEnd && ph.action_type === 'paid'
                    })

                    // IMPORTANTE: Priorizar o status do banco quando paid_at é null (indica estorno)
                    // Se paid_at é null E status é pending, significa que foi estornado
                    if (p.status === 'pending' && !p.paid_at) {
                        // Foi estornado - usar status do banco
                        enrichedStatus = 'Pendente'
                    } else if (p.status === 'paid' || paidThisCycle) {
                        enrichedStatus = 'Pago'
                    } else if (p.due_date) {
                        const dueDateString = p.due_date.includes('T') ? p.due_date : `${p.due_date}T12:00:00`
                        const dueDate = new Date(dueDateString)
                        if (dueDate < now) {
                            const diffTime = now.getTime() - dueDate.getTime()
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                            if (diffDays >= 30) {
                                enrichedStatus = 'Churn'
                            } else {
                                enrichedStatus = 'Atrasado'
                            }
                        } else {
                            enrichedStatus = 'Pendente'
                        }
                    } else {
                        enrichedStatus = 'Pendente'
                    }

                    return {
                        ...p,
                        status: enrichedStatus,
                        last_alert_at: lastAlertsMap.get(p.id) || null,
                        company_ltv: companyInfo?.ltv || 0,
                        company_created_at: companyInfo?.created_at || p.due_date,
                        company_rep: companyInfo?.representative_name || '',
                        // Debug: ensure cron_enabled is preserved
                        cron_enabled: p.cron_enabled || false
                    }
                })
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
                const currentMonth = now.getMonth()
                const currentYear = now.getFullYear()

                // Recebido no mês atual (considerando a data de pagamento)
                stats.value.receivedMonth = payments
                    .filter(p => p.status === 'Pago' && p.paid_at && new Date(p.paid_at) >= startOfMonth)
                    .reduce((acc, p) => acc + Number(p.amount || 0), 0)

                // A receber (pendente) deste mês + Atrasados
                const pendingThisMonth = payments.filter(p => {
                    if (p.status !== 'Pendente' && p.status !== 'Atrasado') return false
                    const dueDate = new Date(p.due_date)
                    // Inclui tudo que vence até o final deste mês
                    const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0)
                    return dueDate <= endOfCurrentMonth
                })

                stats.value.pendingAmount = pendingThisMonth
                    .reduce((acc, p) => acc + Number(p.amount || 0), 0)

                stats.value.paidPaymentsCount = payments.filter(p => p.status === 'Pago').length
                stats.value.pendingPaymentsCount = pendingThisMonth.length
                stats.value.paymentsList = payments
            }

            // 3. CUSTOS OPERACIONAIS (Transactions)
            // Coluna de data correta é "occurred_at" (não created_at)
            const { data: transData } = await (supabase.from('transactions') as any)
                .select('id, description, amount, category, type, occurred_at')
                .order('occurred_at', { ascending: false })

            if (transData) {
                const expenses = (transData as any[]).filter(t => t.type === 'expense')
                stats.value.totalExpenses = expenses.reduce((acc, t) => acc + Number(t.amount || 0), 0)
                stats.value.transactionsList = expenses
            }

            // 4. USUÁRIOS ATIVOS (user_profiles)
            try {
                const { count } = await (supabase.from('user_profiles') as any)
                    .select('*', { count: 'exact', head: true })
                    .eq('is_active', true)
                stats.value.activeUsers = count || 0
            } catch {
                stats.value.activeUsers = 0
            }

        } catch (err) {
            console.error('Erro ao sincronizar métricas:', err)
        } finally {
            loading.value = false
            isFetching.value = false
        }
    }

    return {
        stats,
        loading,
        fetchStats
    }
}
