export const useAnalytics = () => {
    const supabase = useSupabaseClient()

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

    const loading = ref(true)

    const fetchStats = async () => {
        loading.value = true

        // 1. MRR
        const { data: mrrData } = await supabase.from('subscriptions').select('monthly_price').eq('is_active', true)
        stats.value.mrr = (mrrData as any[])?.reduce((acc, curr) => acc + Number(curr.monthly_price), 0) || 0

        // 2. Clientes e Empresas
        const { data: companiesData } = await supabase.from('companies').select('id, is_active, created_at')
        if (companiesData) {
            const companies = companiesData as any[]
            stats.value.totalClients = companies.length
            stats.value.activeCompanies = companies.filter(c => c.is_active).length
            stats.value.inactiveCompanies = companies.filter(c => !c.is_active).length

            const startOfMonth = new Date()
            startOfMonth.setDate(1)
            startOfMonth.setHours(0, 0, 0, 0)
            stats.value.newClients = companies.filter(c => new Date(c.created_at) >= startOfMonth).length
        }

        // 3. Usuários Ativos
        const { count: userCount } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('is_active', true)
        stats.value.activeUsers = userCount || 0

        // 4. Financeiro (Pagamentos)
        const startOfMonthP = new Date()
        startOfMonthP.setDate(1)

        const { data: paymentsData } = await supabase.from('payments').select('amount, status, paid_at')
        if (paymentsData) {
            const payments = paymentsData as any[]
            stats.value.receivedMonth = payments
                .filter(p => p.status === 'paid' && p.paid_at && new Date(p.paid_at) >= startOfMonthP)
                .reduce((acc, curr) => acc + Number(curr.amount), 0)

            stats.value.pendingAmount = payments
                .filter(p => p.status === 'pending')
                .reduce((acc, curr) => acc + Number(curr.amount), 0)

            stats.value.paidPaymentsCount = payments.filter(p => p.status === 'paid').length
            stats.value.pendingPaymentsCount = payments.filter(p => p.status === 'pending').length
            stats.value.paymentsList = payments
        }

        // 5. Custos Operacionais
        const { data: transData } = await supabase.from('transactions').select('*').eq('type', 'expense')
        if (transData) {
            stats.value.totalExpenses = (transData as any[])?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
            stats.value.transactionsList = transData
        }

        // 6. LTV Médio Simples
        if (stats.value.totalClients > 0) {
            const totalIncome = (paymentsData as any[])?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
            stats.value.ltv = totalIncome / stats.value.totalClients
        }


        loading.value = false
    }

    return {
        stats,
        loading,
        fetchStats
    }
}
