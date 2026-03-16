export const useSubscriptions = (fetchSubscriptionsFn?: () => Promise<any>) => {
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
    // Mostrar TODAS as faturas (pendentes e pagas) na aba Faturas
    return stats.value.paymentsList.filter(record => (record as any).sale_type === 'plano' || !(record as any).sale_type)
  })

  // Handlers
  const handleOpenIndividualHistory = (companyId: string) => {
    historyModal.value.history = stats.value.paymentsList.filter(
      p => p.company_id === companyId && p.status === 'Pago'
    )
    historyModal.value.isOpen = true
  }

  const generateInvoiceModal = ref({ isOpen: false, payment: null as any })

  const handleTogglePaymentStatus = async (payment: any) => {
    console.log('💵 [handleTogglePaymentStatus] Botão $ clicado')
    console.log('💵 [handleTogglePaymentStatus] Payment:', payment)
    console.log('💵 [handleTogglePaymentStatus] Abrindo modal de gerar fatura')
    
    // Abre modal de gerar fatura
    generateInvoiceModal.value.payment = payment
    generateInvoiceModal.value.isOpen = true
    
    console.log('💵 [handleTogglePaymentStatus] Modal state:', generateInvoiceModal.value)
  }

  const handleGenerateInvoice = async () => {
    if (!generateInvoiceModal.value.payment) return
    
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    
    try {
      const subscription = generateInvoiceModal.value.payment
      console.log('💰 [handleGenerateInvoice] Gerando fatura para:', subscription.company_name)
      console.log('💰 [handleGenerateInvoice] Dados da assinatura:', {
        customer_id: subscription.customer_id,
        company_id: subscription.company_id,
        plan_name: subscription.plan_name,
        amount: subscription.amount
      })
      
      // Usar customer_id (da assinatura) ou company_id (se vier de outro lugar)
      const companyId = subscription.customer_id || subscription.company_id
      
      if (!companyId) {
        throw new Error('ID da empresa não encontrado na assinatura')
      }
      
      // 1. Criar fatura na tabela payments com status='pending'
      const { data: newInvoice, error: invoiceError } = await supabase
        .from('payments')
        .insert({
          company_id: companyId,
          plan_name: subscription.plan_name,
          amount: subscription.amount,
          due_date: new Date().toISOString(),
          status: 'pending',
          notes: `Fatura gerada automaticamente para ${subscription.company_name}`
        } as any)
        .select()
        .single()
      
      if (invoiceError) {
        console.error('❌ [handleGenerateInvoice] Erro ao criar fatura:', invoiceError)
        throw invoiceError
      }
      
      console.log('✅ [handleGenerateInvoice] Fatura criada:', (newInvoice as any)?.id)
      
      // 2. Registrar em payment_history com action_type='invoice_generated'
      const { error: histError } = await supabase.from('payment_history').insert({
        company_id: companyId,
        payment_id: (newInvoice as any).id,
        action_type: 'invoice_generated',
        description: `Fatura gerada para ${subscription.company_name} (${subscription.plan_name}) - R$ ${subscription.amount}`,
        user_id: user.value?.id,
        user_name: user.value?.user_metadata?.name || 'Sistema',
        metadata: {
          amount: subscription.amount,
          plan_name: subscription.plan_name,
          company_name: subscription.company_name,
          generated_at: new Date().toISOString()
        }
      } as any)
      
      if (histError) {
        console.error('❌ [handleGenerateInvoice] Erro ao registrar em payment_history:', histError)
      }
      
      console.log('✅ [handleGenerateInvoice] Registro criado em payment_history')
      
      // 3. Fechar modal e atualizar UI
      generateInvoiceModal.value.isOpen = false
      generateInvoiceModal.value.payment = null
      success('Fatura gerada', `Fatura criada para ${subscription.company_name}`)
      
      // 4. Atualizar dados
      await new Promise(resolve => setTimeout(resolve, 300))
      await fetchStats(true, false)
      
      if (fetchSubscriptionsFn) {
        await fetchSubscriptionsFn()
      }
      
      console.log('✅ [handleGenerateInvoice] Dados atualizados')
    } catch (err: any) {
      console.error('❌ [handleGenerateInvoice] Erro ao gerar fatura:', err)
      error('Erro ao gerar fatura', err.message)
    }
  }

  const handleConfirmPayment = async (data: any) => {
    if (!paymentModal.value.payment) return
    
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    
    try {
      const payment = paymentModal.value.payment
      console.log('💳 [handleConfirmPayment] Iniciando pagamento:', payment.company_name)
      
      // 1. Atualizar status do pagamento em 'payments'
      const res = await confirmPayment(payment.id, 'Pendente', {
        amount: data.amount,
        notes: data.notes
      })

      if (!res.success) {
        error('Erro ao confirmar pagamento', res.error)
        return
      }
      
      console.log('✅ [handleConfirmPayment] Pagamento confirmado em payments')

      // 2. Registrar em payment_history com action_type='paid'
      const { error: histError } = await supabase.from('payment_history').insert({
        company_id: payment.company_id,
        action_type: 'paid',
        description: `Pagamento de ${payment.company_name} (${payment.plan_name}) foi confirmado - R$ ${data.amount}`,
        user_id: user.value?.id,
        user_name: user.value?.user_metadata?.name || 'Sistema',
        metadata: {
          amount: data.amount,
          notes: data.notes,
          plan_name: payment.plan_name,
          payment_type: data.type,
          paid_at: new Date().toISOString()
        }
      } as any)

      if (histError) {
        console.error('❌ [handleConfirmPayment] Erro ao registrar em payment_history:', histError)
        error('Erro ao registrar pagamento no histórico', histError.message)
        return
      }
      
      console.log('✅ [handleConfirmPayment] Registro criado em payment_history')

      // 3. Fechar modal e atualizar UI
      paymentModal.value.isOpen = false
      paymentModal.value.payment = null
      success('Pagamento confirmado', `${payment?.company_name || 'Empresa'} marcado como pago`)
      
      console.log('🔄 [handleConfirmPayment] Atualizando dados...')
      
      // Aguardar um pouco para garantir que o banco processou
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 4. Atualizar dados - forçar refresh completo (SEM silent mode para garantir reatividade)
      console.log('🔄 [handleConfirmPayment] Chamando fetchStats com force=true, silent=false')
      await fetchStats(true, false)
      
      // 5. Atualizar subscriptions se a função foi fornecida (DEPOIS de fetchStats)
      if (fetchSubscriptionsFn) {
        console.log('🔄 [handleConfirmPayment] Atualizando subscriptions...')
        await fetchSubscriptionsFn()
      }
      
      console.log('✅ [handleConfirmPayment] Dados atualizados')
    } catch (err: any) {
      console.error('❌ [handleConfirmPayment] Erro ao confirmar pagamento:', err)
      error('Erro ao confirmar pagamento', err.message)
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
    const addedTags = tags.filter((t: string) => !oldTags.includes(t))
    const removedTags = oldTags.filter((t: string) => !tags.includes(t))

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
        // Registrar no histórico
        await addHistoryEntry({
          payment_id: payment.id,
          company_id: payment.company_id,
          action_type: 'auto_billing_disabled',
          description: `Cobrança automática desativada para ${payment.company_name}`,
          metadata: { plan_name: payment.plan_name }
        })
        // Atualizar dados
        await fetchStats(true, false)
      }
    } else {
      autoBillingModal.value.payment = payment
      autoBillingModal.value.isOpen = true
    }
  }

  const handleConfirmAutoBilling = async (cronData: any) => {
    const payment = autoBillingModal.value.payment
    if (!payment) return

    autoBillingModal.value.isOpen = false

    try {
      // Se é desativar
      if (cronData.action === 'disable') {
        console.log('🔴 [handleConfirmAutoBilling] Desativando CRON para payment:', payment.id)
        const res = await $fetch('/api/subscriptions/cron-schedule', {
          method: 'POST',
          body: {
            paymentId: payment.id,
            action: 'disable'
          }
        })

        console.log('✅ [handleConfirmAutoBilling] Resposta da API:', res)
        success('Cobrança desativada', 'Automação foi desativada com sucesso')
        console.log('🔄 [handleConfirmAutoBilling] Chamando fetchStats e fetchSubscriptions...')
        await Promise.all([fetchStats(true, false), fetchSubscriptionsFn?.()])
        console.log('✅ [handleConfirmAutoBilling] Dados atualizados')
        return
      }

      // Se é ativar/agendar
      console.log('🟢 [handleConfirmAutoBilling] Agendando CRON para payment:', payment.id)
      console.log('🟢 [handleConfirmAutoBilling] Dados:', cronData)
      
      const res = await $fetch('/api/subscriptions/cron-schedule', {
        method: 'POST',
        body: {
          paymentId: payment.id,
          period: cronData.period,
          scheduledTime: cronData.scheduledTime,
          nextExecution: cronData.nextExecution,
          message: cronData.message
        }
      })

      console.log('✅ [handleConfirmAutoBilling] Resposta da API:', res)

      success(
        'Cobrança agendada',
        `Será enviada às ${cronData.scheduledTime} no período ${cronData.period}`
      )

      await addHistoryEntry({
        payment_id: payment.id,
        company_id: payment.company_id,
        action_type: 'cron_scheduled',
        description: `Cobrança automática agendada para ${payment.company_name} às ${cronData.scheduledTime}`,
        metadata: {
          plan_name: payment.plan_name,
          period: cronData.period,
          scheduled_time: cronData.scheduledTime,
          next_execution: cronData.nextExecution
        }
      })

      console.log('🔄 [handleConfirmAutoBilling] Chamando fetchStats e fetchSubscriptions...')
      await Promise.all([fetchStats(true, false), fetchSubscriptionsFn?.()])
      console.log('✅ [handleConfirmAutoBilling] Dados atualizados')
    } catch (err: any) {
      error('Erro ao agendar', err.message || 'Não foi possível agendar a cobrança')
    }
  }

  const handleBatchAutoBilling = (payments: any[]) => {
    batchAutoBillingModal.value.payments = payments
    batchAutoBillingModal.value.isOpen = true
  }

  const handleConfirmBatchAutoBilling = async (cronData: any) => {
    const payments = batchAutoBillingModal.value.payments
    if (!payments.length) return

    batchAutoBillingModal.value.isOpen = false

    try {
      let successes = 0
      let errors = 0
      const successCompanies: string[] = []
      const failedCompanies: string[] = []

      // Registrar INÍCIO
      await addHistoryEntry({
        action_type: 'batch_cron_scheduled_started',
        description: `Iniciado agendamento de cobrança automática para ${payments.length} empresa(s)`,
        metadata: {
          total_count: payments.length,
          companies: payments.map(p => p.company_name),
          period: cronData.period
        }
      })

      // Agendar cada uma
      for (const p of payments) {
        try {
          await $fetch('/api/subscriptions/cron-schedule', {
            method: 'POST',
            body: {
              paymentId: p.id,
              period: cronData.period,
              scheduledTime: cronData.scheduledTime,
              nextExecution: cronData.nextExecution,
              message: cronData.message
            }
          })

          successes++
          successCompanies.push(p.company_name)

          await addHistoryEntry({
            payment_id: p.id,
            company_id: p.company_id,
            action_type: 'cron_scheduled',
            description: `Cobrança automática agendada para ${p.company_name} (ação em massa)`,
            metadata: {
              plan_name: p.plan_name,
              period: cronData.period,
              scheduled_time: cronData.scheduledTime,
              batch: true
            }
          })
        } catch (err: any) {
          errors++
          failedCompanies.push(p.company_name)
        }
      }

      // Registrar FINALIZAÇÃO
      await addHistoryEntry({
        action_type: 'batch_cron_scheduled_completed',
        description: `Agendamento em massa finalizado: ${successes} agendadas, ${errors} falharam`,
        metadata: {
          total_count: payments.length,
          success_count: successes,
          error_count: errors,
          success_companies: successCompanies,
          failed_companies: failedCompanies,
          period: cronData.period
        }
      })

      if (errors > 0) {
        warning(
          'Agendamento parcial',
          `Agendadas para ${successes} empresas. ${errors} erros.`
        )
      } else {
        success(
          'Cobranças agendadas',
          `${payments.length} empresas agendadas para ${cronData.scheduledTime}`
        )
      }

      await fetchStats(true, false)
    } catch (err: any) {
      error('Erro ao agendar em massa', err.message)
    }
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
    
    // Aguardar um pouco para garantir que o banco processou
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Atualizar dados - forçar refresh completo (SEM silent mode)
    await fetchStats(true, false)
    
    // Atualizar subscriptions se a função foi fornecida
    if (fetchSubscriptionsFn) {
      await fetchSubscriptionsFn()
    }
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
    
    // Aguardar um pouco para garantir que o banco processou
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Atualizar dados - forçar refresh completo (SEM silent mode)
    await fetchStats(true, false)
    
    // Atualizar subscriptions se a função foi fornecida
    if (fetchSubscriptionsFn) {
      await fetchSubscriptionsFn()
    }
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
      } as any)
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
    generateInvoiceModal,
    historyModal,
    timelineModal,
    
    // Computed
    financialRecords,
    paymentHistory,
    
    // Methods
    fetchStats,
    handleOpenIndividualHistory,
    handleTogglePaymentStatus,
    handleGenerateInvoice,
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
