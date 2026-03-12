<template>
  <div class="min-h-screen p-8 md:p-12">
    <div class="max-w-7xl mx-auto space-y-8">
      <UiKLoader 
        v-if="loadingAnalytics || loadingFinance" 
        message="Sincronizando Agenda Global..." 
      />

      <div v-else class="space-y-8 animate-in fade-in duration-500">
        <BlocksKPageHeader title="Calendário" subtitle="Agendamentos e Compromissos" />
        
        <div class="min-h-[60vh] flex flex-col items-center justify-center">
          <div class="flex flex-col items-center justify-center py-20 opacity-40">
             <div class="p-8 bg-white/5 rounded-3xl mb-6">
                <div class="w-16 h-16 border-4 border-dashed border-kros-blue/40 rounded-2xl animate-[spin_4s_linear_infinite]"></div>
             </div>
             <p class="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-4 px-6 py-2 bg-white/5 rounded-full">Integrando com Motor de Agendamentos</p>
          </div>
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
const { loading: loadingFinance, saveExpense, togglePaymentStatus, toggleAutoBilling, processRecords } = useFinance()

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
  
  const res = await togglePaymentStatus(payment)
  if (res.success) {
    alert(res.isPaid ? 'Pagamento recebido com sucesso!' : 'Pagamento estornado com sucesso!')
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
