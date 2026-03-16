<template>
  <LayoutsKPageLayout>
    <UiKSkeleton v-if="loadingAnalytics || loadingFinance" type="table" :rows="5" />

    <div v-else class="space-y-4 mb-20 animate-in fade-in duration-700">
      <SubscriptionsKSubscriptionsContent
        v-model:active-tab="activeSubTab"
        :key="`content-${refreshKey}-${subscriptions.length}-${subscriptions.map(s => s.status).join(',')}`"
        :financial-records="adaptedSubscriptions"
        :payment-history="paymentHistory"
        :show-charts="showCharts"
        :selected-history-ids="selectedHistoryIds"
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
        @create-subscription="subscriptionModal.isOpen = true"
        @open-timeline="handleOpenTimeline"
        @toggle-charts="showCharts = !showCharts"
        @pay="handlePayInvoice"
        @reverse="handleReverseInvoice"
        @toggle-history-select="handleToggleHistorySelect"
        @batch-pay-history="handleBatchPayHistory"
        @batch-reverse-history="handleBatchReverseHistory"
        @clear-history-selection="selectedHistoryIds = []"
        @sync="handleSync"
        @config="navigateTo('/clientes')"
        @open-client-details="handleOpenClientDetails"
        @open-plan-details="handleOpenPlanDetails"
        @update-payments="handleUpdatePayments"
        @export="(format) => { exportPayments(subscriptions, format); success('Exportado com sucesso', `Arquivo ${format.toUpperCase()} baixado`) }"
      />
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
    
    <!-- Modal de Gerar Fatura -->
    <BlocksKGenerateInvoiceModal
      :is-open="generateInvoiceModal.isOpen"
      :payment="generateInvoiceModal.payment"
      @close="generateInvoiceModal.isOpen = false"
      @confirm="handleGenerateInvoice"
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

    <ClientsKClientDetailsModal
      :is-open="clientDetailsModal.isOpen"
      :company="clientDetailsModal.company"
      @close="clientDetailsModal.isOpen = false"
      @edit="handleEditClient"
      @toggle-status="handleToggleClientStatus"
    />

    <!-- Modal de Detalhes do Plano -->
    <SalesKSaleDetailsCard
      :is-open="planDetailsModal.isOpen"
      :item-name="planDetailsModal.payment?.plan_name"
      :item-type="'Assinatura'"
      :item-description="planDetailsModal.payment?.plan_notes"
      :item-price="planDetailsModal.payment?.amount || 0"
      :notes="planDetailsModal.payment?.notes"
      :client-name="planDetailsModal.payment?.customer_name"
      :sale-value="planDetailsModal.payment?.amount || 0"
      :payment-status="planDetailsModal.payment?.status"
      :sale-date="planDetailsModal.payment?.created_at"
      :plan-category="planDetailsModal.payment?.plan_category"
      :plan-notes="planDetailsModal.payment?.plan_notes"
      @close="planDetailsModal.isOpen = false"
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
const { calculatePaymentStatus, getStatusLabel, getStatusClass, getStatusIcon } = useSubscriptionStatus()

const { subscriptions, fetchSubscriptions } = useSubscriptionsManager()
const { 
  batchProgressModal, 
  batchDeleteModal,
  handleBatchMarkPaid,
  handleBatchMarkPending,
  handleBatchSuspend,
  handleBatchReactivate,
  handleBatchCancel,
  handleBatchDelete,
  handleConfirmBatchDelete,
  handleConfirmBatchAutoBilling
} = useBatchOperations(async () => {
  // Callback executado após deletar assinaturas
  await Promise.all([fetchStats(), fetchSubscriptions()])
})

const refreshKey = ref(0)
const selectedHistoryIds = ref<string[]>([])

const subscriptionModal = reactive({
  isOpen: false,
  editingSubscription: null as any
})

const clientDetailsModal = reactive({
  isOpen: false,
  company: null as any
})

const planDetailsModal = reactive({
  isOpen: false,
  payment: null as any
})

const {
  activeSubTab,
  showCharts,
  autoBillingModal,
  batchAutoBillingModal,
  logsModal,
  paymentModal,
  generateInvoiceModal,
  historyModal,
  timelineModal,
  financialRecords,
  paymentHistory,
  fetchStats,
  handleOpenIndividualHistory,
  handleTogglePaymentStatus,
  handleGenerateInvoice,
  handleConfirmPayment,
  handleOpenLogs,
  handleToggleAutoBilling,
  handleConfirmAutoBilling,
  handleBatchAutoBilling,
  handleOpenTimeline
} = useSubscriptions(fetchSubscriptions)

const handleSubscriptionCreated = async () => {
  subscriptionModal.isOpen = false
  subscriptionModal.editingSubscription = null
  await Promise.all([fetchStats(), fetchSubscriptions()])
  success('Assinatura salva', 'Assinatura salva com sucesso')
}

const handleBatchTagProgress = (data: any) => {
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
      return
    }
    
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
    
  } catch (err: any) {
  }
}

const handleSync = async () => {
  await fetchSubscriptions()
  await nextTick()
  refreshKey.value++
}

const handleUpdatePayments = (updatedPayments: any[]) => {
  // Atualizar apenas as tags dos subscriptions que foram modificados
  updatedPayments.forEach(updatedPayment => {
    const sub = subscriptions.value.find(s => s.id === updatedPayment.id)
    if (sub) {
      // Usar Object.assign para manter a reatividade
      Object.assign(sub, { tags: updatedPayment.tags })
    }
  })
}

// Handlers para ações em massa no histórico
const handleToggleHistorySelect = (id: string) => {
  const index = selectedHistoryIds.value.indexOf(id)
  if (index > -1) {
    selectedHistoryIds.value.splice(index, 1)
  } else {
    selectedHistoryIds.value.push(id)
  }
}

const handleBatchPayHistory = async () => {
  const selectedPayments = paymentHistory.value.filter(p => selectedHistoryIds.value.includes(p.id))
  const pendingPayments = selectedPayments.filter(p => p.status === 'pending' || p.status === 'Pendente')
  
  if (pendingPayments.length === 0) {
    error('Nenhuma fatura pendente', 'Selecione faturas pendentes para receber')
    return
  }
  
  for (const payment of pendingPayments) {
    await handlePayInvoice(payment)
  }
  
  selectedHistoryIds.value = []
  success('Pagamentos recebidos', `${pendingPayments.length} fatura(s) marcada(s) como paga(s)`)
}

const handleBatchReverseHistory = async () => {
  const selectedPayments = paymentHistory.value.filter(p => selectedHistoryIds.value.includes(p.id))
  const paidPayments = selectedPayments.filter(p => p.status === 'paid' || p.status === 'Pago')
  
  if (paidPayments.length === 0) {
    error('Nenhuma fatura paga', 'Selecione faturas pagas para estornar')
    return
  }
  
  for (const payment of paidPayments) {
    await handleReverseInvoice(payment)
  }
  
  selectedHistoryIds.value = []
  success('Pagamentos estornados', `${paidPayments.length} fatura(s) estornada(s)`)
}

// Watcher para forçar re-render quando tags mudam
watch(() => subscriptions.value.map(s => s.tags?.length || 0).join(','), () => {
  refreshKey.value++
}, { deep: true })

// Watcher para forçar re-render quando stats.paymentsList muda (pagamentos atualizados)
watch(() => stats.value.paymentsList?.length || 0, (newLength, oldLength) => {
  if (newLength !== oldLength) {
    refreshKey.value++
  }
})

// Watcher adicional para mudanças nos status dos pagamentos
watch(() => stats.value.paymentsList?.map(p => `${p.id}-${p.status}`).join(','), (newVal, oldVal) => {
  if (newVal !== oldVal) {
    refreshKey.value++
  }
}, { deep: true })

const handleDeleteSuccess = (id: string) => {
  // Remover do array local usando o composable
  subscriptions.value = subscriptions.value.filter(s => s.id !== id)
}



const handleEditSubscription = (subscription: any) => {
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
    
    // Calcular status de pagamento baseado nas faturas
    const paymentStatus = calculatePaymentStatus(sub, paymentHistory.value)
    
    return {
      ...sub,
      company_name: sub.customer_name || 'Cliente não vinculado',
      company_actual_name: sub.customer_actual_name || 'Empresa não vinculada',
      company_id: sub.customer_id,
      company_whatsapp: sub.customer_whatsapp || '', // WhatsApp do cliente
      plan_name: sub.plan_name || 'Plano não vinculado',
      tags: sub.tags || [], // Garantir que tags sejam incluídas
      due_date: nextDueDate.toISOString().split('T')[0], // Próximo vencimento calculado
      due_day: sub.due_day, // Manter due_day para filtros
      start_date: sub.start_date, // Data de início da assinatura
      subscription_status: sub.status, // Status da assinatura (active, suspended, cancelled, trial)
      payment_status: paymentStatus, // Status de pagamento calculado (paid_up, pending, overdue, etc)
      payment_status_label: getStatusLabel(paymentStatus), // Label em português
      payment_status_class: getStatusClass(paymentStatus), // Classes CSS
      payment_status_icon: getStatusIcon(paymentStatus), // Ícone
      status: sub.status, // Manter status original para o modal
      last_alert_at: sub.last_alert_at || null, // Data e hora do último alerta
      _key: `${sub.id}-${sub.status}-${paymentStatus}-${sub.updated_at || Date.now()}` // Key única para forçar re-render
    }
  })
  
  return adapted
})

onMounted(async () => {
  await Promise.all([fetchStats(), fetchSubscriptions()])
  
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
  }
})

const handleOpenClientDetails = async (payment: any) => {
  try {
    // Buscar o cliente completo pelo customer_id (que é o company_id nas assinaturas)
    const supabase = useSupabaseClient()
    const customerId = payment.customer_id || payment.company_id
    
    const { data: customer, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', customerId)
      .single()
    
    if (error || !customer) {
      // Fallback: usar dados do pagamento
      clientDetailsModal.company = {
        id: customerId,
        name: payment.company_actual_name || payment.name,
        representative_name: payment.company_name || payment.representative_name,
        email: payment.email,
        phone: payment.phone,
        whatsapp: payment.whatsapp,
        created_at: payment.created_at,
        updated_at: payment.updated_at,
        is_active: payment.is_active,
        notes: payment.notes
      }
    } else {
      clientDetailsModal.company = customer
    }
  } catch (err) {
  }
  clientDetailsModal.isOpen = true
}

const handleOpenPlanDetails = async (payment: any) => {
  try {
    const supabase = useSupabaseClient()
    
    // Buscar detalhes do plano
    let planCategory = null
    let planDescription = null
    
    if (payment.plan_name) {
      const { data: planData } = await supabase
        .from('plans')
        .select('category, description')
        .eq('name', payment.plan_name)
        .limit(1)
      
      if (planData && planData.length > 0) {
        planCategory = planData[0].category
        planDescription = planData[0].description
      }
    }
    
    // Preparar dados para o modal
    const modalData = {
      plan_name: payment.plan_name,
      customer_name: payment.customer_name,
      amount: payment.amount,
      status: payment.status,
      created_at: payment.created_at,
      notes: payment.notes,
      plan_category: planCategory,
      plan_notes: planDescription
    }
    
    planDetailsModal.payment = modalData
    planDetailsModal.isOpen = true
  } catch (err) {
    planDetailsModal.payment = payment
    planDetailsModal.isOpen = true
  }
}

const handleEditClient = () => {
  // Navegar para página de edição de cliente
  navigateTo(`/clientes`)
}

const handleToggleClientStatus = async () => {
  // Implementar toggle de status do cliente se necessário
  clientDetailsModal.isOpen = false
}

const handlePayInvoice = (payment: any) => {
  // Abrir modal de receber pagamento
  paymentModal.value.payment = payment
  paymentModal.value.isOpen = true
}

const handleReverseInvoice = async (payment: any) => {
  const { confirm, success, error } = useToast()
  
  const confirmed = await confirm(
    `Deseja estornar o pagamento de ${payment.companies?.name}? O status voltará para PENDENTE.`,
    'Estornar Pagamento'
  )
  
  if (!confirmed) return
  
  try {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    
    // 1. Atualizar status para pending e limpar paid_at
    const { error: updateError } = await supabase
      .from('payments')
      .update({ 
        status: 'pending',
        paid_at: null
      })
      .eq('id', payment.id)
    
    if (updateError) throw updateError
    
    // 2. Registrar em payment_history com action_type='reversed'
    await supabase.from('payment_history').insert({
      company_id: payment.company_id,
      payment_id: payment.id,
      action_type: 'reversed',
      description: `Pagamento de ${payment.companies?.name} foi estornado - R$ ${payment.amount}`,
      user_id: user.value?.id,
      user_name: user.value?.user_metadata?.name || 'Sistema',
      metadata: {
        amount: payment.amount,
        plan_name: payment.plan_name,
        reversed_at: new Date().toISOString()
      }
    })
    
    success('Pagamento estornado', `${payment.companies?.name} voltou para PENDENTE`)
    
    // 3. Atualizar dados
    await new Promise(resolve => setTimeout(resolve, 300))
    await fetchStats(true, false)
    await fetchSubscriptions()
  } catch (err: any) {
    error('Erro ao estornar', err.message)
  }
}

</script>
