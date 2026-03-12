import { ref } from 'vue'

export const useCollectionBatchActions = () => {
  const isBatchMsgModalOpen = ref(false)
  const isBatchPaidModalOpen = ref(false)
  const isBatchPendingModalOpen = ref(false)
  const selectedPaymentsForBatch = ref<any[]>([])

  const openBatchMsgModal = (payments: any[]) => {
    selectedPaymentsForBatch.value = payments
    isBatchMsgModalOpen.value = true
  }

  const openBatchPaidModal = (payments: any[]) => {
    selectedPaymentsForBatch.value = payments
    isBatchPaidModalOpen.value = true
  }

  const openBatchPendingModal = (payments: any[]) => {
    selectedPaymentsForBatch.value = payments
    isBatchPendingModalOpen.value = true
  }

  const closeBatchModals = () => {
    isBatchMsgModalOpen.value = false
    isBatchPaidModalOpen.value = false
    isBatchPendingModalOpen.value = false
    selectedPaymentsForBatch.value = []
  }

  return {
    isBatchMsgModalOpen,
    isBatchPaidModalOpen,
    isBatchPendingModalOpen,
    selectedPaymentsForBatch,
    openBatchMsgModal,
    openBatchPaidModal,
    openBatchPendingModal,
    closeBatchModals
  }
}
