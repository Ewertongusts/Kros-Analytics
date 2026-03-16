import { reactive } from 'vue'

export const useBatchOperations = (onBatchDeleteComplete?: () => Promise<void>) => {
  const { success, error: showError } = useToast()
  const { fetchSubscriptions, batchDelete } = useSubscriptionsManager()

  const batchProgressModal = reactive({
    isOpen: false,
    title: '',
    total: 0,
    processed: 0,
    successCount: 0,
    failureCount: 0,
    currentItem: ''
  })

  const batchDeleteModal = reactive({
    isOpen: false,
    subscriptions: [] as any[]
  })

  const closeBatchProgressModal = () => {
    batchProgressModal.isOpen = false
  }

  const closeBatchDeleteModal = () => {
    batchDeleteModal.isOpen = false
    batchDeleteModal.subscriptions = []
  }



  const handleConfirmBatchDelete = async () => {
    batchProgressModal.title = 'Excluindo Assinaturas'
    batchProgressModal.total = batchDeleteModal.subscriptions.length
    batchProgressModal.processed = 0
    batchProgressModal.successCount = 0
    batchProgressModal.failureCount = 0
    batchProgressModal.isOpen = true

    const ids = batchDeleteModal.subscriptions.map(s => s.id)
    console.log('🗑️ [handleConfirmBatchDelete] Iniciando exclusão de', ids.length, 'assinaturas:', ids)
    
    const result = await batchDelete(ids, (current) => {
      console.log('🗑️ [handleConfirmBatchDelete] Progresso:', current, '/', batchDeleteModal.subscriptions.length)
      batchProgressModal.processed = current
    })

    console.log('🗑️ [handleConfirmBatchDelete] Resultado:', result)
    
    batchProgressModal.successCount = result.successCount
    batchProgressModal.failureCount = result.failureCount
    batchProgressModal.processed = batchDeleteModal.subscriptions.length

    closeBatchDeleteModal()

    await new Promise(resolve => setTimeout(resolve, 1000))
    batchProgressModal.isOpen = false

    if (result.failureCount > 0) {
      showError('Erro parcial', `${result.successCount} apagadas, ${result.failureCount} erros`)
    } else {
      success('Assinaturas apagadas', `${result.successCount} assinaturas foram apagadas permanentemente`)
    }

    await fetchSubscriptions()
    
    // Chamar callback se fornecido (para atualizar stats e outros dados)
    if (onBatchDeleteComplete) {
      await onBatchDeleteComplete()
    }
  }

  const handleBatchDelete = (subs: any[]) => {
    batchDeleteModal.subscriptions = subs
    batchDeleteModal.isOpen = true
  }

  const handleConfirmBatchAutoBilling = async () => {
    const { batchAutoBillingModal } = useSubscriptions()
    const paymentCount = batchAutoBillingModal.value?.payments?.length || 0

    batchProgressModal.title = 'Ativando Cobrança Automática'
    batchProgressModal.total = paymentCount
    batchProgressModal.processed = 0
    batchProgressModal.successCount = 0
    batchProgressModal.failureCount = 0
    batchProgressModal.isOpen = true

    const progressInterval = 300
    for (let i = 0; i < paymentCount; i++) {
      batchProgressModal.processed = i + 1
      await new Promise(resolve => setTimeout(resolve, progressInterval))
    }

    batchProgressModal.successCount = paymentCount
    batchProgressModal.failureCount = 0
    batchProgressModal.processed = paymentCount

    await new Promise(resolve => setTimeout(resolve, 1000))
    batchProgressModal.isOpen = false
  }

  return {
    batchProgressModal,
    batchDeleteModal,
    closeBatchProgressModal,
    closeBatchDeleteModal,
    handleBatchDelete,
    handleConfirmBatchDelete,
    handleConfirmBatchAutoBilling
  }
}