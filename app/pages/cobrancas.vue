<template>
  <div class="min-h-screen p-8 md:p-12">
    <div class="max-w-7xl mx-auto space-y-8">
      <UiKLoader 
        v-if="loadingAnalytics || loadingFinance" 
        message="Processando Fluxo Financeiro..." 
      />

      <div v-else class="space-y-6 mb-20 animate-in fade-in duration-700">
        <!-- Botão para mostrar/ocultar (sempre visível no topo) -->
        <div class="flex justify-end">
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
        </div>

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

const activeSubTab = ref('operational')
const isIndividualHistoryModalOpen = ref(false)
const individualHistoryData = ref<any[]>([])
const isPaymentModalOpen = ref(false)
const paymentToConfirm = ref<any>(null)
const showCharts = ref(false)

const financialRecords = computed(() => processRecords(stats.value.paymentsList))
const paymentHistory = computed(() => {
  // Filtrar por status 'Pago' (já enriquecido) ao invés de 'paid' (do banco)
  const history = stats.value.paymentsList.filter(p => p.status === 'Pago')
  console.log('📊 Payment History:', history.length, 'pagamentos')
  console.log('📊 Pagamentos com paid_at:', history.filter(p => p.paid_at).length)
  console.log('📊 Detalhes:', history.map(p => ({ 
    name: p.companies?.name, 
    status: p.status, 
    paid_at: p.paid_at,
    amount: p.amount 
  })))
  return history
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
    if (!res.success) alert('Erro ao processar: ' + res.error)
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
    await fetchStats(true, true) // force=true, silent=true
  } else {
    alert('Erro ao confirmar pagamento: ' + res.error)
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
    // Atualização silenciosa: sem tela de loading
    await fetchStats(true, true) 
  } else {
    alert('Erro ao atualizar tags: ' + res.error)
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
    if (!res.success) alert('Erro ao desativar: ' + res.error)
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
  if (!res.success) alert('Erro ao ativar: ' + res.error)
}

const handleBatchAutoBilling = (payments: any[]) => {
  batchAutoBillingTargetPayments.value = payments
  isBatchAutoBillingModalOpen.value = true
}

const handleConfirmBatchAutoBilling = async (customMessage: string) => {
  const payments = batchAutoBillingTargetPayments.value
  if (!payments.length) return

  isBatchAutoBillingModalOpen.value = false
  
  // Processar em massa
  let errors = 0
  for (const p of payments) {
    const res = await toggleAutoBilling(p.id, true, customMessage)
    if (!res.success) errors++
  }

  if (errors > 0) {
    alert(`Automação ativada com ${errors} erros em algumas empresas.`)
  } else {
    alert(`Automação ativada com sucesso para ${payments.length} empresas!`)
  }
  
  await fetchStats(true, true)
}

const handleBatchMarkPaid = async (payments: any[]) => {
  if (!payments.length) return
  
  console.log('🔵 Iniciando pagamento em massa:', payments.length, 'pagamentos')
  
  let errors = 0
  let successes = 0
  
  for (const payment of payments) {
    console.log('🔵 Processando:', payment.company_name, 'Status atual:', payment.status, 'ID:', payment.id)
    
    // Passa o status atual do payment (que pode ser Pendente, Atrasado, etc)
    // A função confirmPayment vai inverter: se não for 'Pago', marca como 'paid'
    const res = await confirmPayment(payment.id, payment.status, {
      amount: payment.amount, // Valor total
      notes: 'Pagamento em massa'
    })
    
    console.log('🔵 Resultado:', res)
    
    if (!res.success) {
      console.error('❌ Erro ao processar:', payment.company_name, res.error)
      errors++
    } else {
      console.log('✅ Sucesso:', payment.company_name)
      successes++
    }
  }

  console.log('🔵 Finalizado. Sucessos:', successes, 'Erros:', errors)

  if (errors > 0) {
    alert(`${successes} pagamentos marcados com sucesso. ${errors} erros.`)
  } else {
    alert(`${payments.length} pagamentos marcados como pago com sucesso!`)
  }
  
  console.log('🔵 Atualizando stats...')
  // Force refresh sem loading para atualizar a lista
  await fetchStats(true, false)
  console.log('🔵 Stats atualizados!')
}

const handleBatchMarkPending = async (payments: any[]) => {
  if (!payments.length) return
  
  let errors = 0
  let successes = 0
  
  for (const payment of payments) {
    // Passa 'Pago' como status atual para que confirmPayment inverta para 'pending'
    const res = await confirmPayment(payment.id, 'Pago')
    
    if (!res.success) {
      errors++
    } else {
      successes++
    }
  }

  if (errors > 0) {
    alert(`${successes} pagamentos estornados com sucesso. ${errors} erros.`)
  } else {
    alert(`${payments.length} pagamentos estornados com sucesso!`)
  }
  
  await fetchStats(true, false)
}

onMounted(async () => {
  await fetchStats()
})
</script>
