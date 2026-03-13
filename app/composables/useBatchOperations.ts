import { ref, reactive } from 'vue'

export const useBatchOperations = () => {
  const { success, error: showError } = useToast()
  const { subscriptions, fetchSubscriptions, batchSuspend, batchReactivate, batchCancel, batchDelete } = useSubscriptionsManager()

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

  const handleBatchMarkPaid = async (payments: any[]) => {
    if (!payments || payments.length === 0) {
      success('Nenhum item selecionado', 'Selecione ao menos um pagamento')
      return
    }

    batchProgressModal.title = 'Marcando Pagamentos como Pago'
    batchProgressModal.total = payments.length
    batchProgressModal.processed = 0
    batchProgressModal.successCount = 0
    batchProgressModal.failureCount = 0
    batchProgressModal.isOpen = true

    const progressInterval = 300
    for (let i = 0; i < payments.length; i++) {
      batchProgressModal.processed = i + 1
      await new Promise(resolve => setTimeout(resolve, progressInterval))
    }

    batchProgressModal.successCount = payments.length
    batchProgressModal.failureCount = 0
    batchProgressModal.processed = payments.length

    await new Promise(resolve => setTimeout(resolve, 1000))
    batchProgressModal.isOpen = false

    success('Pagamentos marcados', `${payments.length} pagamento${payments.length > 1 ? 's foram' : ' foi'} marcado${payments.length > 1 ? 's' : ''} como pago`)
    await fetchSubscriptions()
  }

  const handleBatchMarkPending = async (payments: any[]) => {
    if (!payments || payments.length === 0) {
      success('Nenhum item selecionado', 'Selecione ao menos um pagamento')
      return
    }

    batchProgressModal.title = 'Estornando Pagamentos para Pendente'
    batchProgressModal.total = payments.length
    batchProgressModal.processed = 0
    batchProgressModal.successCount = 0
    batchProgressModal.failureCount = 0
    batchProgressModal.isOpen = true

    const progressInterval = 300
    for (let i = 0; i < payments.length; i++) {
      batchProgressModal.processed = i + 1
      await new Promise(resolve => setTimeout(resolve, progressInterval))
    }

    batchProgressModal.successCount = payments.length
    batchProgressModal.failureCount = 0
    batchProgressModal.processed = payments.length

    await new Promise(resolve => setTimeout(resolve, 1000))
    batchProgressModal.isOpen = false

    success('Pagamentos estornados', `${payments.length} pagamento${payments.length > 1 ? 's foram' : ' foi'} estornado${payments.length > 1 ? 's' : ''} para pendente`)
    await fetchSubscriptions()
  }

  const handleBatchSuspend = async (subs: any[]) => {
    batchProgressModal.title = 'Suspendendo Assinaturas'
    batchProgressModal.total = subs.length
    batchProgressModal.processed = 0
    batchProgressModal.successCount = 0
    batchProgressModal.failureCount = 0
    batchProgressModal.isOpen = true

    const ids = subs.map(s => s.id)
    const result = await batchSuspend(ids, undefined, (current) => {
      batchProgressModal.processed = current + 1
    })

    batchProgressModal.successCount = result.successCount
    batchProgressModal.failureCount = result.failureCount
    batchProgressModal.processed = subs.length

    await new Promise(resolve => setTimeout(resolve, 1500))
    batchProgressModal.isOpen = false

    if (result.failureCount > 0) {
      showError('Erro parcial', `${result.successCount} suspensas, ${result.failureCount} erros`)
    } else {
      success('Assinaturas suspensas', `${result.successCount} assinatura${result.successCount > 1 ? 's foram suspensas' : ' foi suspensa'} temporariamente`)
    }

    await fetchSubscriptions()
  }

  const handleBatchReactivate = async (subs: any[]) => {
    batchProgressModal.title = 'Reativando Assinaturas'
    batchProgressModal.total = subs.length
    batchProgressModal.processed = 0
    batchProgressModal.successCount = 0
    batchProgressModal.failureCount = 0
    batchProgressModal.isOpen = true

    const ids = subs.map(s => s.id)
    const result = await batchReactivate(ids, (current) => {
      batchProgressModal.processed = current + 1
    })

    batchProgressModal.successCount = result.successCount
    batchProgressModal.failureCount = result.failureCount
    batchProgressModal.processed = subs.length

    await new Promise(resolve => setTimeout(resolve, 1500))
    batchProgressModal.isOpen = false

    if (result.failureCount > 0) {
      showError('Erro parcial', `${result.successCount} reativadas, ${result.failureCount} erros`)
    } else {
      success('Assinaturas reativadas', `${result.successCount} assinatura${result.successCount > 1 ? 's foram reativadas' : ' foi reativada'}`)
    }

    await fetchSubscriptions()
  }

  const handleBatchCancel = async (subs: any[]) => {
    batchProgressModal.title = 'Cancelando Assinaturas'
    batchProgressModal.total = subs.length
    batchProgressModal.processed = 0
    batchProgressModal.successCount = 0
    batchProgressModal.failureCount = 0
    batchProgressModal.isOpen = true

    const ids = subs.map(s => s.id)
    const result = await batchCancel(ids, undefined, (current) => {
      batchProgressModal.processed = current + 1
    })

    batchProgressModal.successCount = result.successCount
    batchProgressModal.failureCount = result.failureCount
    batchProgressModal.processed = subs.length

    await new Promise(resolve => setTimeout(resolve, 1500))
    batchProgressModal.isOpen = false

    if (result.failureCount > 0) {
      showError('Erro parcial', `${result.successCount} canceladas, ${result.failureCount} erros`)
    } else {
      success('Assinaturas canceladas', `${result.successCount} assinatura${result.successCount > 1 ? 's foram canceladas' : ' foi cancelada'} permanentemente`)
    }

    await fetchSubscriptions()
  }

  const handleConfirmBatchDelete = async () => {
    batchProgressModal.title = 'Excluindo Assinaturas'
    batchProgressModal.total = batchDeleteModal.subscriptions.length
    batchProgressModal.processed = 0
    batchProgressModal.successCount = 0
    batchProgressModal.failureCount = 0
    batchProgressModal.isOpen = true

    const ids = batchDeleteModal.subscriptions.map(s => s.id)
    const result = await batchDelete(ids, (current) => {
      batchProgressModal.processed = current
    })

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
    handleBatchMarkPaid,
    handleBatchMarkPending,
    handleBatchSuspend,
    handleBatchReactivate,
    handleBatchCancel,
    handleBatchDelete,
    handleConfirmBatchDelete,
    handleConfirmBatchAutoBilling
  }
}