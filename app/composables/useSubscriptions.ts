export const useSubscriptions = () => {
  const { stats, fetchStats } = useAnalytics()
  const { confirmPayment, toggleAutoBilling, processRecords } = useFinance()
  const { upsertCompany } = useCompanies()
  const { success, error, warning } = useToast()
  const { addHistoryEntry, fetchAllHistory } = usePaymentHistory()

  const activeSubTab = ref('operational')
  const showCharts = ref(false)

  // Modal states
  const autoBillingModal = ref({ isOpen: false, payment: null as any })
  const batchAutoBillingModal = ref({ isOpen: false, payments: [] as any[] })
  const logsModal = ref({ isOpen: false, paymentId: null as string | null })
  const paymentModal = ref({ isOpen: false, payment: null as any })
  const historyModal = ref({ isOpen: false, history: [] as any[] })
  const timelineModal = ref({ isOpen: false, history: [] as any[], loading: false })

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
        // Registrar no histórico
        await addHistoryEntry({
          payment_id: payment.id,
          company_id: payment.company_id,
          action_type: 'reversed',
          description: `Pagamento de ${payment.company_name} foi estornado para PENDENTE`,
          metadata: { amount: payment.amount, plan_name: payment.plan_name }
        })
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
      const payment = paymentModal.value.payment
      paymentModal.value.isOpen = false
      paymentModal.value.payment = null
      success('Pagamento confirmado', `${payment?.company_name || 'Empresa'} marcado como pago`)
      
      // Registrar no histórico
      await addHistoryEntry({
        payment_id: payment.id,
        company_id: payment.company_id,
        action_type: 'paid',
        description: `Pagamento de ${payment.company_name} foi confirmado`,
        metadata: { amount: data.amount, notes: data.notes, plan_name: payment.plan_name }
      })
      
      await fetchStats(true, true)
    } else {
      error('Erro ao confirmar pagamento', res.error)
    }
  }

  const handleUpdateCompanyTags = async ({ companyId, tags }: { companyId: string, tags: string[] }) => {
    console.log('=== handleUpdateCompanyTags CHAMADO ===')
    console.log('Company ID:', companyId)
    console.log('Tags:', tags)
    console.log('financialRecords.value:', financialRecords.value.length)
    
    const payment = financialRecords.value.find(p => p.company_id === companyId)
    if (!payment) {
      console.log('ERRO: Payment não encontrado para company_id:', companyId)
      return
    }
    
    console.log('Payment encontrado:', payment.company_name)

    const oldTags = payment.tags || []
    const addedTags = tags.filter(t => !oldTags.includes(t))
    const removedTags = oldTags.filter(t => !tags.includes(t))

    const res = await upsertCompany({
      id: companyId,
      name: payment.company_name,
      is_active: true,
      tags: tags
    })

    if (res.success) {
      success('Tags atualizadas', `Tags de ${payment.company_name} foram atualizadas`)
      
      // Registrar tags adicionadas
      for (const tag of addedTags) {
        await addHistoryEntry({
          company_id: companyId,
          action_type: 'tag_added',
          description: `Tag "${tag}" adicionada em ${payment.company_name}`,
          metadata: { tag_name: tag }
        })
      }
      
      // Registrar tags removidas
      for (const tag of removedTags) {
        await addHistoryEntry({
          company_id: companyId,
          action_type: 'tag_removed',
          description: `Tag "${tag}" removida de ${payment.company_name}`,
          metadata: { tag_name: tag }
        })
      }
      
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
        await addHistoryEntry({
          payment_id: payment.id,
          company_id: payment.company_id,
          action_type: 'auto_billing_disabled',
          description: `Cobrança automática desativada para ${payment.company_name}`,
          metadata: { plan_name: payment.plan_name }
        })
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
      await addHistoryEntry({
        payment_id: payment.id,
        company_id: payment.company_id,
        action_type: 'auto_billing_enabled',
        description: `Cobrança automática ativada para ${payment.company_name}`,
        metadata: { plan_name: payment.plan_name, custom_message: customMessage }
      })
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
    
    // Registrar INÍCIO da ativação em massa
    await addHistoryEntry({
      action_type: 'batch_autobilling_started',
      description: `Iniciada ativação de cobrança automática para ${payments.length} empresa(s)`,
      metadata: { 
        total_count: payments.length,
        companies: payments.map(p => p.company_name),
        custom_message: customMessage
      }
    })
    
    let errors = 0
    let successes = 0
    const successCompanies: string[] = []
    const failedCompanies: string[] = []
    
    for (const p of payments) {
      const res = await toggleAutoBilling(p.id, true, customMessage)
      if (!res.success) {
        errors++
        failedCompanies.push(p.company_name)
      } else {
        successes++
        successCompanies.push(p.company_name)
        
        // Registrar individualmente
        await addHistoryEntry({
          payment_id: p.id,
          company_id: p.company_id,
          action_type: 'auto_billing_enabled',
          description: `Cobrança automática ativada para ${p.company_name} (ação em massa)`,
          metadata: { plan_name: p.plan_name, custom_message: customMessage, batch: true }
        })
      }
    }

    // Registrar FINALIZAÇÃO da ativação em massa
    await addHistoryEntry({
      action_type: 'batch_autobilling_completed',
      description: `Ativação em massa finalizada: ${successes} ativadas, ${errors} falharam`,
      metadata: { 
        total_count: payments.length,
        success_count: successes,
        error_count: errors,
        success_companies: successCompanies,
        failed_companies: failedCompanies,
        custom_message: customMessage
      }
    })

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
    
    // Registrar ação em massa
    await addHistoryEntry({
      action_type: 'batch_paid',
      description: `${successes} pagamentos marcados como PAGO em massa`,
      metadata: { batch_count: successes, errors }
    })
    
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
    
    // Registrar ação em massa
    await addHistoryEntry({
      action_type: 'batch_reversed',
      description: `${successes} pagamentos estornados para PENDENTE em massa`,
      metadata: { batch_count: successes, errors }
    })
    
    await fetchStats(true, false)
  }

  const handleOpenTimeline = async () => {
    timelineModal.value.isOpen = true
    timelineModal.value.loading = true
    const res = await fetchAllHistory(200)
    if (res.success) {
      timelineModal.value.history = res.data || []
    }
    timelineModal.value.loading = false
    
    // Registrar visualização do histórico
    try {
      const supabase = useSupabaseClient()
      const user = useSupabaseUser()
      
      await supabase.from('payment_history').insert({
        action_type: 'history_viewed',
        description: 'Histórico de ações visualizado',
        user_id: user.value?.id,
        user_name: user.value?.email?.split('@')[0] || 'Sistema',
        metadata: {
          record_count: timelineModal.value.history.length,
          viewed_at: new Date().toISOString()
        }
      })
    } catch (err) {
      console.error('Erro ao registrar visualização:', err)
    }
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
    timelineModal,
    
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
    handleBatchMarkPending,
    handleOpenTimeline
  }
}
