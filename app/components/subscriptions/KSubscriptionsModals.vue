<template>
  <div>
    <BlocksKFinanceAutoBillingModal 
      v-if="autoBillingModal.isOpen"
      :is-open="autoBillingModal.isOpen"
      :payment="autoBillingModal.payment"
      @close="$emit('close-autobilling')"
      @confirm="$emit('confirm-autobilling', $event)"
    />

    <BlocksKFinanceBatchAutoBillingModal 
      v-if="batchAutoBillingModal.isOpen"
      :is-open="batchAutoBillingModal.isOpen"
      :payments="batchAutoBillingModal.payments"
      @close="$emit('close-batch-autobilling')"
      @confirm="$emit('confirm-batch-autobilling', $event)"
    />

    <BlocksKFinanceLogsModal 
      v-if="logsModal.isOpen"
      :is-open="logsModal.isOpen"
      :payment-id="logsModal.paymentId"
      @close="$emit('close-logs')"
    />

    <BlocksKPaymentConfirmationModal 
      v-if="paymentModal.isOpen"
      :is-open="paymentModal.isOpen"
      :payment="paymentModal.payment"
      :loading="loading"
      @close="$emit('close-payment')"
      @confirm="$emit('confirm-payment', $event)"
    />

    <BlocksKFinanceIndividualHistoryModal 
      v-if="historyModal.isOpen"
      :is-open="historyModal.isOpen"
      :history="historyModal.history"
      @close="$emit('close-history')"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  autoBillingModal: { isOpen: boolean; payment: any }
  batchAutoBillingModal: { isOpen: boolean; payments: any[] }
  logsModal: { isOpen: boolean; paymentId: string | null }
  paymentModal: { isOpen: boolean; payment: any }
  historyModal: { isOpen: boolean; history: any[] }
  loading: boolean
}>()

defineEmits<{
  'close-autobilling': []
  'confirm-autobilling': [message: string]
  'close-batch-autobilling': []
  'confirm-batch-autobilling': [message: string]
  'close-logs': []
  'close-payment': []
  'confirm-payment': [data: any]
  'close-history': []
}>()
</script>
