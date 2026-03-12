export const useSubscriptions = () => {
  const { stats, fetchStats } = useAnalytics()
  const { confirmPayment, toggleAutoBilling, processRecords } = useFinance()
  const { upsertCompany } = useCompanies()
  const { success, error, warning } = useToast()

  const activeSubTab = ref('operational')
  const showCharts = ref(false)

  // Modal states
  const autoBillingModal = ref({ isOpen: false, payment: null as any })
  const batchAutoBillingModal = ref({ isOpen: false, payments: [] as any[] })
  const logsModal = ref({ isOpen: false, paymentId: null as string | null })
  const paymentModal = ref({ isOpen: false, payment: null as any })
  const historyModal = ref({ isOpen: false, history: [] as any[] })

  // Computed
  const financialRecords = computed(() => {
    const records = processRecords(stats.value.paymentsList) as any[]
    return records.filter(record => record.sale_type === 'plano' || !record.sale_type)
  })

  const paymentHistory = computed(() => {
    const history = stats.value.paymentsList.filter(p => p.status === 'Pago')
    return history.filter(record => (record as any).sale_type === 'plano' || !(record as any).sale_type)
  })

  // Handlers
  const handleOpenIndividualHistory = (companyId: string) => {
    historyModal.value.history = stats.value.paymentsList.filter(
      p => p.company_id === companyId && p.status === 'Pago'
    )
    historyModal.value.isOpen = true
  }

  const handleTogglePaymentStatus = async (payment: any) => {
    const isPaid = payment.status === 'Pago'
    
    if (isPaid) {
      if (!confirm(`Deseja estornar o pagamento de ${payment.company_name} para PENDENTE?`)) return
      const res = await confirmPayment(payment.id, 'Pago')
      if (!res.success) {
        error('Erro ao processar', res.error)
      } else {
        success('Pagamento estornado', `${payment.company_name} marcado como pendente`)
      }
    } else {
      paymentModal.value.payment = payment
      paymentModal.value.isOpen = true
    }
  }

  const handleConfirmPayment = async (data: any) => {
    if (!paymentModal.value.payment) return
    
    const res = await confirmPayment(paymentModal.value.payment.id, 'Pendente', {
      amount: data.amount,
      notes: data.notes
    })

    if (res.success) {
      paymentModal.value.isOpen = false
      paymentModal.value.payment = null
      success('Pagamento confirmado', `${paymentModal.value.payment?.company_name || 'Empresa'} marcado como pago`)
      await fetchStats(true, true)
    } else {
      error('Erro ao confirmar pagamento', res.error)
    }
  }

  const handleUpdateCompanyTags = async ({ companyId, tags }: { companyId: string, tags: string[] }) => {
    const payment = financialRecords.value.find(p => p.company_id === companyId)
    if (!payment) return

    const res = await upsertCompany({
      id: companyId,
      name: payment.company_name,
      is_active: true,
      tags: tags
    })

    if (res.success) {
      success('Tags atualizadas', `Tags de ${payment.company_name} foram atualizadas`)
      // Recarregar em background para sincronizar
      setTimeout(() => fetchStats(true, true), 500)
    } else {
      error('Erro ao atualizar tags', res.error)
      // Recarregar para reverter a mudança otimista
      await fetchStats(true, false)
    }
  }

  const handleOpenLogs = (paymentId?: string) => {
    logsModal.value.paymentId = paymentId || null
    logsModal.value.isOpen = true
  }

  const handleToggleAutoBilling = async (payment: any) => {
    if (payment.auto_billing_enabled) {
      const res = await toggleAutoBilling(payment.id, false)
      if (!res.success) {
        error('Erro ao desativar', res.error)
      } else {
        success('Automação desativada', `Cobrança automática de ${payment.company_name} foi desativada`)
      }
    } else {
      autoBillingModal.value.payment = payment
      autoBillingModal.value.isOpen = true
    }
  }

  const handleConfirmAutoBilling = async (customMessage: string) => {
    const payment = autoBillingModal.value.payment
    if (!payment) return

    autoBillingModal.value.isOpen = false
    const res = await toggleAutoBilling(payment.id, true, customMessage)
    if (!res.success) {
      error('Erro ao ativar', res.error)
    } else {
      success('Automação ativada', `Cobrança automática de ${payment.company_name} foi ativada`)
    }
  }

  const handleBatchAutoBilling = (payments: any[]) => {
    batchAutoBillingModal.value.payments = payments
    batchAutoBillingModal.value.isOpen = true
  }

  const handleConfirmBatchAutoBilling = async (customMessage: string) => {
    const payments = batchAutoBillingModal.value.payments
    if (!payments.length) return

    batchAutoBillingModal.value.isOpen = false
    
    let errors = 0
    for (const p of payments) {
      const res = await toggleAutoBilling(p.id, true, customMessage)
      if (!res.success) errors++
    }

    if (errors > 0) {
      warning('Automação parcial', `Ativada para ${payments.length - errors} empresas. ${errors} erros.`)
    } else {
      success('Automação ativada', `Cobrança automática ativada para ${payments.length} empresas`)
    }
    
    await fetchStats(true, true)
  }

  const handleBatchMarkPaid = async (payments: any[]) => {
    if (!payments.length) return
    
    let errors = 0
    let successes = 0
    
    for (const payment of payments) {
      const res = await confirmPayment(payment.id, payment.status, {
        amount: payment.amount,
        notes: 'Pagamento em massa'
      })
      
      if (!res.success) {
        errors++
      } else {
        successes++
      }
    }

    if (errors > 0) {
      warning('Pagamento parcial', `${successes} pagamentos marcados. ${errors} erros.`)
    } else {
      success('Pagamentos confirmados', `${payments.length} pagamentos marcados como pago`)
    }
    
    await fetchStats(true, false)
  }

  const handleBatchMarkPending = async (payments: any[]) => {
    if (!payments.length) return
    
    let errors = 0
    let successes = 0
    
    for (const payment of payments) {
      const res = await confirmPayment(payment.id, 'Pago')
      
      if (!res.success) {
        errors++
      } else {
        successes++
      }
    }

    if (errors > 0) {
      warning('Estorno parcial', `${successes} pagamentos estornados. ${errors} erros.`)
    } else {
      success('Pagamentos estornados', `${payments.length} pagamentos marcados como pendente`)
    }
    
    await fetchStats(true, false)
  }

  return {
    // State
    activeSubTab,
    showCharts,
    autoBillingModal,
    batchAutoBillingModal,
    logsModal,
    paymentModal,
    historyModal,
    
    // Computed
    financialRecords,
    paymentHistory,
    
    // Methods
    fetchStats,
    handleOpenIndividualHistory,
    handleTogglePaymentStatus,
    handleConfirmPayment,
    handleUpdateCompanyTags,
    handleOpenLogs,
    handleToggleAutoBilling,
    handleConfirmAutoBilling,
    handleBatchAutoBilling,
    handleConfirmBatchAutoBilling,
    handleBatchMarkPaid,
    handleBatchMarkPending
  }
}
