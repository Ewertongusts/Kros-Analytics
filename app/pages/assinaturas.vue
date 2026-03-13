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
        :financial-records="adaptedSubscriptions"
        :payment-history="paymentHistory"
        @toggle-status="handleTogglePaymentStatus"
        @toggle-autobilling="handleToggleAutoBilling"
        @batch-autobilling="handleBatchAutoBilling"
        @batch-mark-paid="handleBatchMarkPaid"
        @batch-mark-pending="handleBatchMarkPending"
        @batch-delete="handleBatchDelete"
        @delete-success="handleDeleteSuccess"
        @edit-subscription="handleEditSubscription"
        @open-logs="handleOpenLogs"
        @update-company-tags="handleUpdateCompanyTags"
        @open-history="handleOpenIndividualHistory"
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

// Novo composable para gerenciar assinaturas
const { subscriptions, loading: loadingSubscriptions, fetchSubscriptions, deleteSubscription } = useSubscriptionsManager()

const subscriptionModal = reactive({
  isOpen: false,
  editingSubscription: null as any
})

const batchDeleteModal = reactive({
  isOpen: false,
  subscriptions: [] as any[]
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
  handleUpdateCompanyTags,
  handleOpenLogs,
  handleToggleAutoBilling,
  handleConfirmAutoBilling,
  handleBatchAutoBilling,
  handleConfirmBatchAutoBilling,
  handleBatchMarkPaid,
  handleBatchMarkPending,
  handleOpenTimeline
} = useSubscriptions()

const handleSubscriptionCreated = async () => {
  subscriptionModal.isOpen = false
  subscriptionModal.editingSubscription = null
  await Promise.all([fetchStats(), fetchSubscriptions()])
  success('Assinatura salva', 'Assinatura salva com sucesso')
}

const handleSync = async () => {
  console.log('handleSync chamado - recarregando assinaturas')
  await fetchSubscriptions()
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

const handleConfirmBatchDelete = async () => {
  const { error: showError } = useToast()
  
  let deleted = 0
  let errors = 0
  
  console.log('Iniciando exclusão de', batchDeleteModal.subscriptions.length, 'assinaturas')
  
  for (const sub of batchDeleteModal.subscriptions) {
    console.log('Apagando assinatura:', sub.id)
    const result = await deleteSubscription(sub.id)
    if (result.success) {
      deleted++
      console.log('Assinatura apagada com sucesso:', sub.id)
    } else {
      errors++
      console.error('Erro ao apagar assinatura:', sub.id, result.error)
    }
  }
  
  console.log('Exclusão concluída:', deleted, 'apagadas,', errors, 'erros')
  
  // Fechar modal
  batchDeleteModal.isOpen = false
  batchDeleteModal.subscriptions = []
  
  // Mostrar resultado
  if (errors > 0) {
    showError('Erro parcial', `${deleted} apagadas, ${errors} erros`)
  } else {
    success('Assinaturas apagadas', `${deleted} assinaturas foram apagadas permanentemente`)
  }
  
  console.log('Assinaturas restantes:', subscriptions.value.length)
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
      due_date: nextDueDate.toISOString().split('T')[0], // Próximo vencimento calculado
      due_day: sub.due_day, // Manter due_day para filtros
      status: sub.status === 'active' ? 'Pendente' : 'Pago'
    }
  })
  
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
