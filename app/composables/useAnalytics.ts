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

    const fetchStats = async (force = false) => {
        if (isFetching.value && !force) return

        isFetching.value = true
        loading.value = true

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

                const now = new Date()
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
            const { data: paymentsData, error: paymentsError } = await (supabase.from('payments') as any)
                .select('id, company_id, amount, status, due_date, paid_at, plan_name, auto_billing_enabled, cron_message, companies!inner(id, name, whatsapp, is_active, tags)')
                .eq('companies.is_active', true)
                .order('due_date', { ascending: true })

            if (paymentsData) {
                const payments = (paymentsData as any[]).map(p => {
                    const companyInfo = companiesMap.get(p.company_id)
                    return {
                        ...p,
                        company_ltv: companyInfo?.ltv || 0,
                        company_created_at: companyInfo?.created_at || p.due_date,
                        company_rep: companyInfo?.representative_name || ''
                    }
                })
                const now = new Date()
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
                const currentMonth = now.getMonth()
                const currentYear = now.getFullYear()

                // Recebido no mês atual (considerando a data de pagamento)
                stats.value.receivedMonth = payments
                    .filter(p => p.status === 'paid' && p.paid_at && new Date(p.paid_at) >= startOfMonth)
                    .reduce((acc, p) => acc + Number(p.amount || 0), 0)

                // A receber (pendente) deste mês + Atrasados
                const pendingThisMonth = payments.filter(p => {
                    if (p.status !== 'pending' && p.status !== 'overdue') return false
                    const dueDate = new Date(p.due_date)
                    // Inclui tudo que vence até o final deste mês
                    const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0)
                    return dueDate <= endOfCurrentMonth
                })

                stats.value.pendingAmount = pendingThisMonth
                    .reduce((acc, p) => acc + Number(p.amount || 0), 0)

                stats.value.paidPaymentsCount = payments.filter(p => p.status === 'paid').length
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
