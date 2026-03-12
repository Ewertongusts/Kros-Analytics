<template>
  <div class="min-h-screen p-8 md:p-12">
    <div class="max-w-7xl mx-auto space-y-8">
      <UiKLoader 
        v-if="loadingAnalytics || loadingFinance" 
        message="Processando Despesas e Custos..." 
      />

      <div v-else class="space-y-8 animate-in fade-in duration-700">
        <BlocksKPageHeader title="Despesas" subtitle="Controle de Custos e Saídas">
          <template #actions>
            <div class="flex items-center gap-3">
              <button 
                @click="isModalOpen = true"
                class="px-6 py-3 bg-kros-blue hover:bg-kros-blue/80 text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-kros-blue/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                Nova Despesa
              </button>
              <button 
                @click="() => fetchStats()"
                class="p-3 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-xl transition-all border border-transparent hover:border-white/10"
                title="Sincronizar Dados"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><path d="M22 3v5h-5"/></svg>
              </button>
            </div>
          </template>
        </BlocksKPageHeader>
        
        <div class="space-y-12 animate-in fade-in duration-500">
          <BlocksKFinanceExpenses :expenses="stats.transactionsList" />
        </div>
        
        <BlocksKGlobalFooter />
      </div>

      <BlocksKExpenseModal 
        v-if="isModalOpen" 
        :is-open="isModalOpen" 
        :submitting="loadingFinance"
        @close="isModalOpen = false" 
        @save="handleSaveExpense" 
      />

      <BlocksKFinanceAutoBillingModal 
        v-if="isAutoBillingModalOpen"
        :is-open="isAutoBillingModalOpen"
        :payment="autoBillingTargetPayment"
        @close="isAutoBillingModalOpen = false"
        @confirm="handleConfirmAutoBilling"
      />

      <BlocksKFinanceLogsModal 
        v-if="isLogsModalOpen"
        :is-open="isLogsModalOpen"
        :payment-id="logsTargetPaymentId"
        @close="isLogsModalOpen = false"
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
const { loading: loadingFinance, saveExpense, confirmPayment, toggleAutoBilling, processRecords } = useFinance()

const isModalOpen = ref(false)
const activeTab = ref('expenses')
const tabs = [
  { id: 'expenses', name: 'Saídas' },
  { id: 'plans', name: 'Planos' },
  { id: 'calendar', name: 'Calendário' },
  { id: 'settings', name: 'Config. API' }
]

const financialRecords = computed(() => processRecords(stats.value.paymentsList))

const handleSaveExpense = async (data: any) => {
  const res = await saveExpense(data)
  if (res.success) {
    isModalOpen.value = false
  } else {
    alert('Erro ao salvar: ' + res.error)
  }
}

const handleTogglePaymentStatus = async (payment: any) => {
  const isPaid = payment.status === 'Pago'
  const action = isPaid ? 'estornar para PENDENTE' : 'confirmar RECEBIMENTO'
  
  if (!confirm(`Deseja ${action} o pagamento de ${payment.company_name}?`)) return
  
  const res = await confirmPayment(payment.id, payment.status)
  if (res.success) {
    // Silent update via fetchStats
    await fetchStats(true, true)
  } else {
    alert('Erro ao processar: ' + res.error)
  }
}

const isAutoBillingModalOpen = ref(false)
const autoBillingTargetPayment = ref<any>(null)
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

onMounted(async () => {
  await fetchStats()
})
</script>
