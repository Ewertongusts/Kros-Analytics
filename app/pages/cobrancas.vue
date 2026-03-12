<template>
  <div class="min-h-screen p-8 md:p-12">
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Skeleton Loading -->
      <UiKSkeleton v-if="loadingAnalytics || loadingFinance" type="table" :rows="5" />

      <div v-else class="space-y-6 mb-20 animate-in fade-in duration-700">
        <BlocksKPageHeader title="Cobranças" subtitle="Gestão de Recebimentos e Automação">
          <template #actions>
            <button 
            @click="showCharts = !showCharts"
            class="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/10 transition-all flex items-center gap-2 text-white/70 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="20" x2="12" y2="10"></line>
              <line x1="18" y1="20" x2="18" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="16"></line>
            </svg>
            <span class="text-[10px] font-bold uppercase tracking-widest">{{ showCharts ? 'Ocultar' : 'Indicadores' }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="['transition-transform', showCharts ? 'rotate-180' : '']">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
          </template>
        </BlocksKPageHeader>

        <!-- SUMMARY CARDS E GRÁFICOS (Ocultos por padrão) -->
        <div v-if="showCharts" class="space-y-6 animate-in fade-in duration-500">
          <BlocksKFinanceCollectionSummary :payments="stats.paymentsList" />
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BlocksKFinanceEvolutionChart :payments="stats.paymentsList" />
            <BlocksKFinanceDistributionChart :payments="stats.paymentsList" />
          </div>
        </div>

        <div class="space-y-4 animate-in fade-in duration-500">
          <div v-if="activeSubTab === 'operational'">
            <BlocksKFinanceCollectionBoard 
              v-model:active-sub-tab="activeSubTab"
              :payments="financialRecords" 
              @toggle-status="handleTogglePaymentStatus" 
              @toggle-autobilling="handleToggleAutoBilling" 
              @batch-autobilling="handleBatchAutoBilling"
              @batch-mark-paid="handleBatchMarkPaid"
              @batch-mark-pending="handleBatchMarkPending"
              @open-logs="handleOpenLogs"
              @update-company-tags="handleUpdateCompanyTags"
              @open-history="handleOpenIndividualHistory"
              @sync="() => fetchStats()"
              @config="navigateTo('/ajustes?tab=companies')"
              @export="(format) => { exportPayments(financialRecords, format); success('Exportado com sucesso', `Arquivo ${format.toUpperCase()} baixado`) }"
            />
          </div>
          <div v-else-if="activeSubTab === 'history'">
            <BlocksKFinanceHistoryBoard 
              v-model:active-sub-tab="activeSubTab"
              :history="paymentHistory" 
              @sync="() => fetchStats()"
              @config="navigateTo('/ajustes?tab=companies')"
            />
          </div>
          <div v-else-if="activeSubTab === 'logs'">
            <BlocksKFinanceLogsBoard 
              v-model:active-sub-tab="activeSubTab"
            />
          </div>
        </div>
        
        <BlocksKGlobalFooter />
      </div>


      <BlocksKFinanceAutoBillingModal 
        v-if="isAutoBillingModalOpen"
        :is-open="isAutoBillingModalOpen"
        :payment="autoBillingTargetPayment"
        @close="isAutoBillingModalOpen = false"
        @confirm="handleConfirmAutoBilling"
      />

      <BlocksKFinanceBatchAutoBillingModal 
        v-if="isBatchAutoBillingModalOpen"
        :is-open="isBatchAutoBillingModalOpen"
        :payments="batchAutoBillingTargetPayments"
        @close="isBatchAutoBillingModalOpen = false"
        @confirm="handleConfirmBatchAutoBilling"
      />

      <BlocksKFinanceLogsModal 
        v-if="isLogsModalOpen"
        :is-open="isLogsModalOpen"
        :payment-id="logsTargetPaymentId"
        @close="isLogsModalOpen = false"
      />

      <BlocksKPaymentConfirmationModal 
        v-if="isPaymentModalOpen"
        :is-open="isPaymentModalOpen"
        :payment="paymentToConfirm"
        :loading="loadingFinance"
        @close="isPaymentModalOpen = false"
        @confirm="handleConfirmPayment"
      />

      <BlocksKFinanceIndividualHistoryModal 
        v-if="isIndividualHistoryModalOpen"
        :is-open="isIndividualHistoryModalOpen"
        :history="individualHistoryData"
        @close="isIndividualHistoryModalOpen = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'

definePageMeta({
  middleware: 'auth'
})

const { stats, loading: loadingAnalytics, fetchStats } = useAnalytics()
const { loading: loadingFinance, confirmPayment, toggleAutoBilling, processRecords } = useFinance()
const { upsertCompany } = useCompanies()
const { success, error, warning } = useToast()
const { exportPayments } = useExport()

const activeSubTab = ref('operational')
const isIndividualHistoryModalOpen = ref(false)
const individualHistoryData = ref<any[]>([])
const isPaymentModalOpen = ref(false)
const paymentToConfirm = ref<any>(null)
const showCharts = ref(false)

const financialRecords = computed(() => processRecords(stats.value.paymentsList))
const paymentHistory = computed(() => {
  return stats.value.paymentsList.filter(p => p.status === 'Pago')
})

const handleOpenIndividualHistory = (companyId: string) => {
  individualHistoryData.value = stats.value.paymentsList.filter(p => p.company_id === companyId && p.status === 'Pago')
  isIndividualHistoryModalOpen.value = true
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
    // Abrir modal de confirmação para pagamento total/parcial
    paymentToConfirm.value = payment
    isPaymentModalOpen.value = true
  }
}

const handleConfirmPayment = async (data: any) => {
  if (!paymentToConfirm.value) return
  
  const res = await confirmPayment(paymentToConfirm.value.id, 'Pendente', {
    amount: data.amount,
    notes: data.notes
  })

  if (res.success) {
    isPaymentModalOpen.value = false
    paymentToConfirm.value = null
    success('Pagamento confirmado', `${paymentToConfirm.value?.company_name || 'Empresa'} marcado como pago`)
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
    await fetchStats(true, true)
    success('Tags atualizadas', `Tags de ${payment.company_name} foram atualizadas`)
  } else {
    error('Erro ao atualizar tags', res.error)
  }
}

const isAutoBillingModalOpen = ref(false)
const isBatchAutoBillingModalOpen = ref(false)
const autoBillingTargetPayment = ref<any>(null)
const batchAutoBillingTargetPayments = ref<any[]>([])
const isLogsModalOpen = ref(false)
const logsTargetPaymentId = ref<string | null>(null)

const handleOpenLogs = (paymentId?: string) => {
    logsTargetPaymentId.value = paymentId || null
    isLogsModalOpen.value = true
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
    autoBillingTargetPayment.value = payment
    isAutoBillingModalOpen.value = true
  }
}

const handleConfirmAutoBilling = async (customMessage: string) => {
  const payment = autoBillingTargetPayment.value
  if (!payment) return

  isAutoBillingModalOpen.value = false
  const res = await toggleAutoBilling(payment.id, true, customMessage)
  if (!res.success) {
    error('Erro ao ativar', res.error)
  } else {
    success('Automação ativada', `Cobrança automática de ${payment.company_name} foi ativada`)
  }
}

const handleBatchAutoBilling = (payments: any[]) => {
  batchAutoBillingTargetPayments.value = payments
  isBatchAutoBillingModalOpen.value = true
}

const handleConfirmBatchAutoBilling = async (customMessage: string) => {
  const payments = batchAutoBillingTargetPayments.value
  if (!payments.length) return

  isBatchAutoBillingModalOpen.value = false
  
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

onMounted(async () => {
  await fetchStats()
})
</script>
