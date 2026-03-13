import { ref } from 'vue'

export const useSaleModals = () => {
  const isSelectTypeModalOpen = ref(false)
  const isSaleModalOpen = ref(false)
  const isReceiptModalOpen = ref(false)
  const isHistoryModalOpen = ref(false)
  const isTimelineModalOpen = ref(false)

  const selectedSaleType = ref('')
  const editingSale = ref<any>(null)
  const receiptSale = ref<any>(null)
  const historySale = ref<any>(null)
  const timelineHistory = ref<any[]>([])
  const timelineLoading = ref(false)

  const openSelectTypeModal = () => {
    isSelectTypeModalOpen.value = true
  }

  const closeSelectTypeModal = () => {
    isSelectTypeModalOpen.value = false
  }

  const openSaleModal = (sale?: any, saleType?: string) => {
    editingSale.value = sale || null
    selectedSaleType.value = saleType || ''
    isSaleModalOpen.value = true
  }

  const closeSaleModal = () => {
    isSaleModalOpen.value = false
    selectedSaleType.value = ''
    editingSale.value = null
  }

  const openReceiptModal = (sale: any) => {
    receiptSale.value = sale
    isReceiptModalOpen.value = true
  }

  const closeReceiptModal = () => {
    isReceiptModalOpen.value = false
    receiptSale.value = null
  }

  const openHistoryModal = (sale: any) => {
    historySale.value = sale
    isHistoryModalOpen.value = true
  }

  const closeHistoryModal = () => {
    isHistoryModalOpen.value = false
    historySale.value = null
  }

  const openTimelineModal = (history: any[] = []) => {
    timelineHistory.value = history
    isTimelineModalOpen.value = true
  }

  const closeTimelineModal = () => {
    isTimelineModalOpen.value = false
    timelineHistory.value = []
  }

  const setTimelineLoading = (loading: boolean) => {
    timelineLoading.value = loading
  }

  const setTimelineHistory = (history: any[]) => {
    timelineHistory.value = history
  }

  const selectSaleType = (type: string) => {
    selectedSaleType.value = type
    isSelectTypeModalOpen.value = false
    isSaleModalOpen.value = true
  }

  return {
    // Modal states
    isSelectTypeModalOpen,
    isSaleModalOpen,
    isReceiptModalOpen,
    isHistoryModalOpen,
    isTimelineModalOpen,
    
    // Data states
    selectedSaleType,
    editingSale,
    receiptSale,
    historySale,
    timelineHistory,
    timelineLoading,
    
    // Modal actions
    openSelectTypeModal,
    closeSelectTypeModal,
    openSaleModal,
    closeSaleModal,
    openReceiptModal,
    closeReceiptModal,
    openHistoryModal,
    closeHistoryModal,
    openTimelineModal,
    closeTimelineModal,
    
    // Data actions
    setTimelineLoading,
    setTimelineHistory,
    selectSaleType
  }
}
