<template>
  <LayoutsKPageLayout>
    <UiKLoader 
      v-if="loadingAnalytics || loadingFinance" 
      message="Processando Despesas e Custos..." 
    />

    <div v-else class="space-y-8 animate-in fade-in duration-700">
      <BlocksKPageHeader title="Despesas" subtitle="Controle de Custos e Saídas">
        <template #actions>
          <div class="flex items-center gap-3">
            <UiKButtonPrimary 
              icon="plus"
              @click="isModalOpen = true"
            >
              Nova Despesa
            </UiKButtonPrimary>
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
  </LayoutsKPageLayout>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useFinanceHandlers } from '~/composables/useFinanceHandlers'

definePageMeta({
  middleware: 'auth'
})

const { stats, loading: loadingAnalytics, fetchStats } = useAnalytics()
const { processRecords } = useFinance()

const {
  loadingFinance,
  isModalOpen,
  isAutoBillingModalOpen,
  autoBillingTargetPayment,
  isLogsModalOpen,
  logsTargetPaymentId,
  handleSaveExpense,
  handleTogglePaymentStatus,
  handleOpenLogs,
  handleToggleAutoBilling,
  handleConfirmAutoBilling
} = useFinanceHandlers()

const financialRecords = computed(() => processRecords(stats.value.paymentsList))

const handleSaveExpenseWrapper = async (data: any) => {
  await handleSaveExpense(data)
}

const handleTogglePaymentStatusWrapper = async (payment: any) => {
  await handleTogglePaymentStatus(payment, fetchStats)
}

onMounted(async () => {
  await fetchStats()
})
</script>
