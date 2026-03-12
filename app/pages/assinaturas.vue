<template>
  <LayoutsKPageLayout>
    <UiKSkeleton v-if="loadingAnalytics || loadingFinance" type="table" :rows="5" />

    <div v-else class="space-y-6 mb-20 animate-in fade-in duration-700">
      <SubscriptionsKSubscriptionsHeader 
        :show-charts="showCharts" 
        @toggle-charts="showCharts = !showCharts" 
      />

      <SubscriptionsKSubscriptionsCharts 
        :show="showCharts" 
        :payments="stats.paymentsList" 
      />

      <SubscriptionsKSubscriptionsContent
        v-model:active-tab="activeSubTab"
        :financial-records="financialRecords"
        :payment-history="paymentHistory"
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
      
      <BlocksKGlobalFooter />
    </div>

    <SubscriptionsKSubscriptionsModals
      :auto-billing-modal="autoBillingModal"
      :batch-auto-billing-modal="batchAutoBillingModal"
      :logs-modal="logsModal"
      :payment-modal="paymentModal"
      :history-modal="historyModal"
      :loading="loadingFinance"
      @close-autobilling="autoBillingModal.isOpen = false"
      @confirm-autobilling="handleConfirmAutoBilling"
      @close-batch-autobilling="batchAutoBillingModal.isOpen = false"
      @confirm-batch-autobilling="handleConfirmBatchAutoBilling"
      @close-logs="logsModal.isOpen = false"
      @close-payment="paymentModal.isOpen = false"
      @confirm-payment="handleConfirmPayment"
      @close-history="historyModal.isOpen = false"
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

const {
  activeSubTab,
  showCharts,
  autoBillingModal,
  batchAutoBillingModal,
  logsModal,
  paymentModal,
  historyModal,
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
  handleBatchMarkPending
} = useSubscriptions()

onMounted(async () => {
  await fetchStats()
})
</script>
