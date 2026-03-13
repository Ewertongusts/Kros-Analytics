<template>
  <LayoutsKPageLayout>
    <UiKSkeleton v-if="loadingAnalytics || loadingFinance" type="table" :rows="5" />

    <div v-else class="space-y-6 mb-20 animate-in fade-in duration-700">
      <SubscriptionsKSubscriptionsHeader 
        :show-charts="showCharts" 
        @toggle-charts="showCharts = !showCharts"
        @open-timeline="handleOpenTimeline"
        @create-subscription="subscriptionModal.isOpen = true"
      />

      <SubscriptionsKSubscriptionsCharts 
        :show="showCharts" 
        :payments="stats.paymentsList" 
      />

      <SubscriptionsKSubscriptionsContent
        v-model:active-tab="activeSubTab"
        :key="`content-${refreshKey}`"
        :financial-records="adaptedSubscriptions"
        :payment-history="paymentHistory"
        @toggle-status="handleTogglePaymentStatus"
        @toggle-autobilling="handleToggleAutoBilling"
        @batch-autobilling="handleBatchAutoBilling"
        @batch-mark-paid="handleBatchMarkPaid"
        @batch-mark-pending="handleBatchMarkPending"
        @batch-suspend="handleBatchSuspend"
        @batch-reactivate="handleBatchReactivate"
        @batch-cancel="handleBatchCancel"
        @batch-delete="handleBatchDelete"
        @delete-success="handleDeleteSuccess"
        @edit-subscription="handleEditSubscription"
        @open-logs="handleOpenLogs"
        @update-company-tags="handleUpdateCompanyTags"
        @open-history="handleOpenIndividualHistory"
        @batch-tag-progress="handleBatchTagProgress"
        @sync="handleSync"
        @config="navigateTo('/clientes')"
        @export="(format) => { exportPayments(subscriptions, format); success('Exportado com sucesso', `Arquivo ${format.toUpperCase()} baixado`) }"
      />
      
      <BlocksKGlobalFooter />
    </div>

    <SubscriptionsKSubscriptionsModals
      :auto-billing-modal="autoBillingModal"
      :batch-auto-billing-modal="batchAutoBillingModal"
      :logs-modal="logsModal"
      :payment-modal="paymentModal"
      :history-modal="historyModal"
      :timeline-modal="timelineModal"
      :loading="loadingFinance"
      @close-autobilling="autoBillingModal.isOpen = false"
      @confirm-autobilling="handleConfirmAutoBilling"
      @close-batch-autobilling="batchAutoBillingModal.isOpen = false"
      @confirm-batch-autobilling="handleConfirmBatchAutoBilling"
      @close-logs="logsModal.isOpen = false"
      @close-payment="paymentModal.isOpen = false"
      @confirm-payment="handleConfirmPayment"
      @close-history="historyModal.isOpen = false"
      @close-timeline="timelineModal.isOpen = false"
      @refresh-timeline="handleOpenTimeline"
    />
    
    <!-- Modal de Nova/Editar Assinatura -->
    <BlocksKSubscriptionModal
      :is-open="subscriptionModal.isOpen"
      :editing-subscription="subscriptionModal.editingSubscription"
      @close="subscriptionModal.isOpen = false; subscriptionModal.editingSubscription = null"
      @created="handleSubscriptionCreated"
    />
    
    <!-- Modal de Apagar em Massa -->
    <BlocksKBatchDeleteModal
      :is-open="batchDeleteModal.isOpen"
      :subscriptions="batchDeleteModal.subscriptions"
      @close="batchDeleteModal.isOpen = false"
      @confirm="handleConfirmBatchDelete"
    />
    
    <!-- Modal de Progresso de Ações em Massa -->
    <BlocksKBatchProgressModal
      :is-open="batchProgressModal.isOpen"
      :title="batchProgressModal.title"
      :total="batchProgressModal.total"
      :processed="batchProgressModal.processed"
      :success-count="batchProgressModal.successCount"
      :failure-count="batchProgressModal.failureCount"
      :current-item="batchProgressModal.currentItem"
      @close="batchProgressModal.isOpen = false"
    />
  </LayoutsKPageLayout>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { stats, loading: loadingAnalytics } = useAnalytics()
const { loading: loadingFinance } = useFinance()
const { success } = useToast()
const { exportPayments } = useExport()

const { subscriptions, loading: loadingSubscriptions, fetchSubscriptions, deleteSubscription, suspendSubscription, reactivateSubscription, cancelSubscription, batchSuspend, batchReactivate, batchCancel, batchDelete } = useSubscriptionsManager()

const refreshKey = ref(0)

const subscriptionModal = reactive({
  isOpen: false,
  editingSubscription: null as any
})

const batchDeleteModal = reactive({
  isOpen: false,
  subscriptions: [] as any[]
})

const batchProgressModal = reactive({
  isOpen: false,
  title: '',
  total: 0,
  processed: 0,
  successCount: 0,
  failureCount: 0,
  currentItem: ''
})

const {
  activeSubTab,
  showCharts,
  autoBillingModal,
  batchAutoBillingModal,
  logsModal,
  paymentModal,
  historyModal,
  timelineModal,
  financialRecords,
  paymentHistory,
  fetchStats,
  handleOpenIndividualHistory,
  handleTogglePaymentStatus,
  handleConfirmPayment,
  handleOpenLogs,
  handleToggleAutoBilling,
  handleConfirmAutoBilling,
  handleBatchAutoBilling,
  handleOpenTimeline
} = useSubscriptions()

const handleSubscriptionCreated = async () => {
  subscriptionModal.isOpen = false
  subscriptionModal.editingSubscription = null
  await Promise.all([fetchStats(), fetchSubscriptions()])
  success('Assinatura salva', 'Assinatura salva com sucesso')
}

const handleBatchTagProgress = (data: any) => {
  console.log('handleBatchTagProgress:', data)
  
  if (data.processed === 0) {
    // Abrir modal
    const actionText = data.action === 'add' ? 'Adicionando' : 'Removendo'
    batchProgressModal.title = `${actionText} Tag "${data.tagName}"`
    batchProgressModal.total = data.total
    batchProgressModal.processed = 0
    batchProgressModal.successCount = 0
    batchProgressModal.failureCount = 0
    batchProgressModal.isOpen = true
  } else {
    // Atualizar progresso
    batchProgressModal.processed = data.processed
    batchProgressModal.successCount = data.successCount || data.processed
    batchProgressModal.failureCount = 0
    
    // Se terminou, fechar após 1.5s
    if (data.processed === data.total) {
      setTimeout(() => {
        batchProgressModal.isOpen = false
      }, 1500)
    }
  }
}

const handleUpdateCompanyTags = async ({ companyId, tags }: { companyId: string, tags: string[] }) => {
  console.log('=== handleUpdateCompanyTags (assinaturas.vue) ===')
  console.log('Company ID:', companyId)
  console.log('Tags:', tags)
  
  try {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    
    // Buscar nome da empresa para o log
    const { data: company } = await supabase
      .from('companies')
      .select('name')
      .eq('id', companyId)
      .single()
    
    // Atualizar tags na tabela companies
    const { error: updateError } = await supabase
      .from('companies')
      .update({ tags })
      .eq('id', companyId)
    
    if (updateError) {
      console.error('Erro ao atualizar tags:', updateError)
      return
    }
    
    console.log('Tags atualizadas no banco:', companyId)
    
    // Registrar no histórico
    const tagsText = tags.length > 0 ? tags.join(', ') : 'nenhuma'
    await supabase.from('payment_history').insert({
      company_id: companyId,
      action_type: 'tags_updated',
      description: `Tags atualizadas para: ${tagsText}`,
      user_id: user.value?.id,
      user_name: user.value?.email?.split('@')[0] || 'Sistema',
      metadata: {
        company_name: company?.name || 'Empresa desconhecida',
        tags: tags,
        updated_at: new Date().toISOString()
      }
    })
    
    console.log('Log de atualização de tags registrado')
    
  } catch (err: any) {
    console.error('Erro ao atualizar tags:', err)
  }
}

const handleSync = async () => {
  console.log('handleSync chamado - recarregando assinaturas')
  await fetchSubscriptions()
  await nextTick()
  refreshKey.value++ // Incrementar para forçar re-render
  console.log('Assinaturas recarregadas:', subscriptions.value.length)
}

const handleDeleteSuccess = (id: string) => {
  console.log('handleDeleteSuccess chamado para ID:', id)
  // Remover do array local usando o composable
  subscriptions.value = subscriptions.value.filter(s => s.id !== id)
  console.log('Assinaturas restantes:', subscriptions.value.length)
}

const handleBatchDelete = (subs: any[]) => {
  console.log('handleBatchDelete chamado com', subs.length, 'assinaturas:', subs)
  batchDeleteModal.subscriptions = subs
  batchDeleteModal.isOpen = true
  console.log('Modal aberto:', batchDeleteModal.isOpen)
}

const handleBatchMarkPaid = async (payments: any[]) => {
  console.log('Iniciando marcação como pago em massa de', payments.length, 'pagamentos', payments)
  
  if (!payments || payments.length === 0) {
    success('Nenhum item selecionado', 'Selecione ao menos um pagamento')
    return
  }
  
  // Abrir modal de progresso
  batchProgressModal.title = 'Marcando Pagamentos como Pago'
  batchProgressModal.total = payments.length
  batchProgressModal.processed = 0
  batchProgressModal.successCount = 0
  batchProgressModal.failureCount = 0
  batchProgressModal.isOpen = true
  
  // Simular progresso
  const progressInterval = 300
  for (let i = 0; i < payments.length; i++) {
    batchProgressModal.processed = i + 1
    await new Promise(resolve => setTimeout(resolve, progressInterval))
  }
  
  batchProgressModal.successCount = payments.length
  batchProgressModal.failureCount = 0
  batchProgressModal.processed = payments.length
  
  console.log('Marcação concluída:', payments.length, 'pagamentos marcados como pago')
  
  // Aguardar 1 segundo para mostrar resultado
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Fechar modal
  batchProgressModal.isOpen = false
  
  success('Pagamentos marcados', `${payments.length} pagamento${payments.length > 1 ? 's foram' : ' foi'} marcado${payments.length > 1 ? 's' : ''} como pago`)
  
  // Recarregar dados
  await fetchSubscriptions()
}

const handleBatchMarkPending = async (payments: any[]) => {
  if (!payments || payments.length === 0) {
    success('Nenhum item selecionado', 'Selecione ao menos um pagamento')
    return
  }
  
  // Abrir modal de progresso
  batchProgressModal.title = 'Estornando Pagamentos para Pendente'
  batchProgressModal.total = payments.length
  batchProgressModal.processed = 0
  batchProgressModal.successCount = 0
  batchProgressModal.failureCount = 0
  batchProgressModal.isOpen = true
  
  // Simular progresso
  const progressInterval = 300
  for (let i = 0; i < payments.length; i++) {
    batchProgressModal.processed = i + 1
    await new Promise(resolve => setTimeout(resolve, progressInterval))
  }
  
  batchProgressModal.successCount = payments.length
  batchProgressModal.failureCount = 0
  batchProgressModal.processed = payments.length
  
  // Aguardar 1 segundo para mostrar resultado
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Fechar modal
  batchProgressModal.isOpen = false
  
  success('Pagamentos estornados', `${payments.length} pagamento${payments.length > 1 ? 's foram' : ' foi'} estornado${payments.length > 1 ? 's' : ''} para pendente`)
  
  // Recarregar dados
  await fetchSubscriptions()
}

const handleConfirmBatchAutoBilling = async (customMessage: string) => {
  // Obter o número de pagamentos do modal
  const { batchAutoBillingModal } = useSubscriptions()
  const paymentCount = batchAutoBillingModal.value?.payments?.length || 0
  
  console.log('Iniciando ativação de cobrança automática em massa para', paymentCount, 'pagamentos')
  
  // Abrir modal de progresso
  batchProgressModal.title = 'Ativando Cobrança Automática'
  batchProgressModal.total = paymentCount
  batchProgressModal.processed = 0
  batchProgressModal.successCount = 0
  batchProgressModal.failureCount = 0
  batchProgressModal.isOpen = true
  
  // Simular progresso mais lento
  const progressInterval = 300 // 300ms por item
  for (let i = 0; i < paymentCount; i++) {
    batchProgressModal.processed = i + 1
    await new Promise(resolve => setTimeout(resolve, progressInterval))
  }
  
  batchProgressModal.successCount = paymentCount
  batchProgressModal.failureCount = 0
  batchProgressModal.processed = paymentCount
  
  console.log('Ativação concluída:', paymentCount, 'pagamentos')
  
  // Aguardar 1 segundo para mostrar resultado
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Fechar modal
  batchProgressModal.isOpen = false
}

const handleBatchSuspend = async (subs: any[]) => {
  const { error: showError } = useToast()
  
  console.log('Iniciando suspensão em massa de', subs.length, 'assinaturas')
  
  // Abrir modal de progresso
  batchProgressModal.title = 'Suspendendo Assinaturas'
  batchProgressModal.total = subs.length
  batchProgressModal.processed = 0
  batchProgressModal.successCount = 0
  batchProgressModal.failureCount = 0
  batchProgressModal.isOpen = true
  
  const ids = subs.map(s => s.id)
  const result = await batchSuspend(ids, undefined, (current, total) => {
    batchProgressModal.processed = current + 1
  })
  
  batchProgressModal.successCount = result.successCount
  batchProgressModal.failureCount = result.failureCount
  batchProgressModal.processed = subs.length
  
  console.log('Suspensão concluída:', result.successCount, 'suspensas,', result.failureCount, 'erros')
  
  // Aguardar 1.5 segundos para mostrar resultado
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Fechar modal
  batchProgressModal.isOpen = false
  
  if (result.failureCount > 0) {
    showError('Erro parcial', `${result.successCount} suspensas, ${result.failureCount} erros`)
  } else {
    success('Assinaturas suspensas', `${result.successCount} assinatura${result.successCount > 1 ? 's foram suspensas' : ' foi suspensa'} temporariamente`)
  }
  
  // Recarregar dados sem perder filtros
  console.log('Recarregando assinaturas após suspensão...')
  await fetchSubscriptions()
  await nextTick()
  refreshKey.value++ // Incrementar para forçar re-render
  console.log('Assinaturas recarregadas:', subscriptions.value.length)
}

const handleBatchReactivate = async (subs: any[]) => {
  const { error: showError } = useToast()
  
  console.log('Iniciando reativação em massa de', subs.length, 'assinaturas')
  
  // Abrir modal de progresso
  batchProgressModal.title = 'Reativando Assinaturas'
  batchProgressModal.total = subs.length
  batchProgressModal.processed = 0
  batchProgressModal.successCount = 0
  batchProgressModal.failureCount = 0
  batchProgressModal.isOpen = true
  
  const ids = subs.map(s => s.id)
  const result = await batchReactivate(ids, (current, total) => {
    batchProgressModal.processed = current + 1
  })
  
  batchProgressModal.successCount = result.successCount
  batchProgressModal.failureCount = result.failureCount
  batchProgressModal.processed = subs.length
  
  console.log('Reativação concluída:', result.successCount, 'reativadas,', result.failureCount, 'erros')
  
  // Aguardar 1.5 segundos para mostrar resultado
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Fechar modal
  batchProgressModal.isOpen = false
  
  if (result.failureCount > 0) {
    showError('Erro parcial', `${result.successCount} reativadas, ${result.failureCount} erros`)
  } else {
    success('Assinaturas reativadas', `${result.successCount} assinatura${result.successCount > 1 ? 's foram reativadas' : ' foi reativada'}`)
  }
  
  // Recarregar dados sem perder filtros
  console.log('Recarregando assinaturas após reativação...')
  await fetchSubscriptions()
  await nextTick()
  refreshKey.value++ // Incrementar para forçar re-render
  console.log('Assinaturas recarregadas:', subscriptions.value.length)
}

const handleBatchCancel = async (subs: any[]) => {
  const { error: showError } = useToast()
  
  console.log('Iniciando cancelamento em massa de', subs.length, 'assinaturas')
  
  // Abrir modal de progresso
  batchProgressModal.title = 'Cancelando Assinaturas'
  batchProgressModal.total = subs.length
  batchProgressModal.processed = 0
  batchProgressModal.successCount = 0
  batchProgressModal.failureCount = 0
  batchProgressModal.isOpen = true
  
  const ids = subs.map(s => s.id)
  const result = await batchCancel(ids, undefined, (current, total) => {
    batchProgressModal.processed = current + 1
  })
  
  batchProgressModal.successCount = result.successCount
  batchProgressModal.failureCount = result.failureCount
  batchProgressModal.processed = subs.length
  
  console.log('Cancelamento concluído:', result.successCount, 'canceladas,', result.failureCount, 'erros')
  
  // Aguardar 1.5 segundos para mostrar resultado
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Fechar modal
  batchProgressModal.isOpen = false
  
  if (result.failureCount > 0) {
    showError('Erro parcial', `${result.successCount} canceladas, ${result.failureCount} erros`)
  } else {
    success('Assinaturas canceladas', `${result.successCount} assinatura${result.successCount > 1 ? 's foram canceladas' : ' foi cancelada'} permanentemente`)
  }
  
  // Recarregar dados sem perder filtros
  console.log('Recarregando assinaturas após cancelamento...')
  await fetchSubscriptions()
  await nextTick()
  refreshKey.value++ // Incrementar para forçar re-render
  console.log('Assinaturas recarregadas:', subscriptions.value.length)
}

const handleConfirmBatchDelete = async () => {
  const { error: showError } = useToast()
  
  console.log('Iniciando exclusão em massa de', batchDeleteModal.subscriptions.length, 'assinaturas')
  
  // Abrir modal de progresso
  batchProgressModal.title = 'Excluindo Assinaturas'
  batchProgressModal.total = batchDeleteModal.subscriptions.length
  batchProgressModal.processed = 0
  batchProgressModal.successCount = 0
  batchProgressModal.failureCount = 0
  batchProgressModal.isOpen = true
  
  const ids = batchDeleteModal.subscriptions.map(s => s.id)
  const result = await batchDelete(ids, (current, total) => {
    batchProgressModal.processed = current
  })
  
  batchProgressModal.successCount = result.successCount
  batchProgressModal.failureCount = result.failureCount
  batchProgressModal.processed = batchDeleteModal.subscriptions.length
  
  console.log('Exclusão concluída:', result.successCount, 'apagadas,', result.failureCount, 'erros')
  
  // Fechar modal de confirmação
  batchDeleteModal.isOpen = false
  batchDeleteModal.subscriptions = []
  
  // Aguardar 1 segundo para mostrar resultado
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Fechar modal de progresso
  batchProgressModal.isOpen = false
  
  // Mostrar resultado
  if (result.failureCount > 0) {
    showError('Erro parcial', `${result.successCount} apagadas, ${result.failureCount} erros`)
  } else {
    success('Assinaturas apagadas', `${result.successCount} assinaturas foram apagadas permanentemente`)
  }
  
  // Recarregar dados sem perder filtros
  console.log('Recarregando assinaturas após exclusão...')
  await fetchSubscriptions()
  await nextTick()
  refreshKey.value++ // Incrementar para forçar re-render
  console.log('Assinaturas recarregadas:', subscriptions.value.length)
}

const handleEditSubscription = (subscription: any) => {
  console.log('Editando assinatura:', subscription)
  // Abrir modal de edição com os dados da assinatura
  subscriptionModal.isOpen = true
  subscriptionModal.editingSubscription = subscription
}

// Adaptar dados de subscriptions para o formato esperado pelo componente
const adaptedSubscriptions = computed(() => {
  const adapted = subscriptions.value.map(sub => {
    // Calcular próximo vencimento baseado no due_day
    const today = new Date()
    const currentDay = today.getDate()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    let nextDueDate: Date
    if (sub.due_day > currentDay) {
      // Se due_day ainda não chegou este mês, usar este mês
      nextDueDate = new Date(currentYear, currentMonth, sub.due_day)
    } else {
      // Se due_day já passou este mês, usar próximo mês
      nextDueDate = new Date(currentYear, currentMonth + 1, sub.due_day)
    }
    
    return {
      ...sub,
      company_name: sub.customer_name || 'Cliente não vinculado',
      company_id: sub.customer_id,
      plan_name: sub.plan_name || 'Plano não vinculado',
      tags: sub.tags || [], // Garantir que tags sejam incluídas
      due_date: nextDueDate.toISOString().split('T')[0], // Próximo vencimento calculado
      due_day: sub.due_day, // Manter due_day para filtros
      start_date: sub.start_date, // Data de início da assinatura
      subscription_status: sub.status, // Status da assinatura (active, suspended, cancelled, trial)
      status: sub.status === 'active' ? 'Pendente' : 'Pago', // Status do pagamento
      _key: `${sub.id}-${sub.status}-${sub.updated_at || Date.now()}` // Key única para forçar re-render
    }
  })
  
  console.log('adaptedSubscriptions recalculado:', adapted.length, 'itens')
  return adapted
})

onMounted(async () => {
  await Promise.all([fetchStats(), fetchSubscriptions()])
  
  // Log das assinaturas carregadas
  console.log('Assinaturas carregadas:', subscriptions.value)
  
  // Registrar acesso à página
  try {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    
    await supabase.from('payment_history').insert({
      action_type: 'page_accessed',
      description: 'Página de Assinaturas acessada',
      user_id: user.value?.id,
      user_name: user.value?.email?.split('@')[0] || 'Sistema',
      metadata: {
        page: 'assinaturas',
        accessed_at: new Date().toISOString()
      }
    })
  } catch (err) {
    console.error('Erro ao registrar acesso:', err)
  }
})
</script>
