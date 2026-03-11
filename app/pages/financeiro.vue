<template>
  <div class="min-h-screen p-8 md:p-12">
    <div class="max-w-7xl mx-auto space-y-8">
      <UiKLoader 
        v-if="loadingAnalytics || loadingFinance" 
        message="Processando Fluxo Financeiro..." 
      />

      <div v-else class="space-y-8 animate-in fade-in duration-700">
        <BlocksKFinanceHeader @sync="fetchStats" @add-expense="isModalOpen = true" />
        
        <!-- TABS -->
        <UiKTabs 
          v-model="activeTab" 
          :tabs="tabs" 
        />

        <!-- TAB VIEWS -->
        <div v-if="activeTab === 'overview'" class="space-y-12 animate-in fade-in duration-500">
          <BlocksKFinanceMetrics :stats="stats" />
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <BlocksKFinanceCollectionBoard :payments="financialRecords" @toggle-status="handleTogglePaymentStatus" @toggle-autobilling="handleToggleAutoBilling" @open-logs="handleOpenLogs" />
              <BlocksKFinanceExpenses :expenses="stats.transactionsList" />
          </div>
        </div>

        <div v-if="activeTab === 'collections'" class="space-y-12 animate-in fade-in duration-500">
          <BlocksKFinanceCollectionBoard :payments="financialRecords" @toggle-status="handleTogglePaymentStatus" @toggle-autobilling="handleToggleAutoBilling" @open-logs="handleOpenLogs" />
        </div>

        <div v-if="activeTab === 'expenses'" class="space-y-12 animate-in fade-in duration-500">
          <BlocksKFinanceExpenses :expenses="stats.transactionsList" />
        </div>

        <div v-if="activeTab === 'plans'" class="space-y-12 animate-in fade-in duration-500">
          <BlocksKFinancePlans />
        </div>

        <div v-if="activeTab === 'calendar'" class="space-y-12 animate-in fade-in duration-500">
          <div class="flex flex-col items-center justify-center py-20 opacity-40">
             <div class="p-6 bg-white/5 rounded-full mb-4">
                <div class="w-12 h-12 border-2 border-dashed border-white/20 rounded-xl animate-spin"></div>
             </div>
             <h3 class="font-bold uppercase tracking-widest text-[10px] text-white">Calendário em construção</h3>
             <p class="text-[9px] text-white/30 mt-2">Estamos integrando com o motor de agendamentos</p>
          </div>
        </div>

        <div v-if="activeTab === 'settings'" class="space-y-12 animate-in fade-in duration-500">
          <BlocksKFinanceCrmSettings />
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
const activeTab = ref('overview')
const tabs = [
  { id: 'overview', name: 'Visão Geral' },
  { id: 'collections', name: 'Cobranças' },
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
