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
            // A tabela companies já tem plan_name e monthly_price integrados
            const { data: companiesData } = await (supabase.from('companies') as any)
                .select('id, is_active, created_at, monthly_price, whatsapp, name, email, representative_name, tags, plan_name, billing_cycle, billing_day')

            if (companiesData) {
                const companies = companiesData as any[]
                const activeCompanies = companies.filter(c => c.is_active)

                stats.value.totalClients = companies.length
                stats.value.activeCompanies = activeCompanies.length
                stats.value.inactiveCompanies = companies.filter(c => !c.is_active).length

                const now = new Date()
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
                // Clientes novos = só empresas ativas criadas este mês
                stats.value.newClients = activeCompanies.filter(c => new Date(c.created_at) >= startOfMonth).length

                // MRR = somente empresas ATIVAS
                stats.value.mrr = activeCompanies
                    .reduce((acc, c) => acc + Number(c.monthly_price || 0), 0)

                // LTV = receita media por cliente ativo
                if (activeCompanies.length > 0) {
                    const totalIncome = activeCompanies.reduce((acc, c) => acc + Number(c.monthly_price || 0), 0)
                    stats.value.ltv = totalIncome / activeCompanies.length
                } else {
                    stats.value.ltv = 0
                }
            }

            // 2. PAGAMENTOS - só de empresas ATIVAS
            const { data: paymentsData } = await (supabase.from('payments') as any)
                .select('id, company_id, amount, status, due_date, paid_at, plan_name, companies!inner(id, name, whatsapp, is_active, tags)')
                .eq('companies.is_active', true)
                .order('due_date', { ascending: true })

            if (paymentsData) {
                const payments = paymentsData as any[]
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
