import { ref, computed } from 'vue'

export const useBulkTaskTransfer = () => {
  const isBulkTransferModalOpen = ref(false)

  const openBulkTransferModal = () => {
    isBulkTransferModalOpen.value = true
  }

  const closeBulkTransferModal = () => {
    isBulkTransferModalOpen.value = false
  }

  // Usar o composable useTaskSelection para gerenciar seleção
  // Este composable apenas gerencia o modal de transferência
  const selectedTaskIds = ref<string[]>([])
  const selectedCount = computed(() => selectedTaskIds.value.length)

  const clearSelection = () => {
    selectedTaskIds.value = []
  }

  return {
    isBulkTransferModalOpen,
    selectedTaskIds,
    selectedCount,
    openBulkTransferModal,
    closeBulkTransferModal,
    clearSelection
  }
}
