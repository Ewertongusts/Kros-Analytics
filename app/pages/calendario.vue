<template>
  <LayoutsKPageLayout>
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
