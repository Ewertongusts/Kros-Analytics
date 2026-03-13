import { ref } from 'vue'

export const useFinanceHandlers = () => {
  const { loading: loadingFinance, saveExpense, confirmPayment, toggleAutoBilling } = useFinance()

  const isModalOpen = ref(false)
  const isAutoBillingModalOpen = ref(false)
  const autoBillingTargetPayment = ref<any>(null)
  const isLogsModalOpen = ref(false)
  const logsTargetPaymentId = ref<string | null>(null)

  const handleSaveExpense = async (data: any) => {
    const res = await saveExpense(data)
    if (res.success) {
      isModalOpen.value = false
      return true
    } else {
      alert('Erro ao salvar: ' + res.error)
      return false
    }
  }

  const handleTogglePaymentStatus = async (payment: any, fetchStats: Function) => {
    const isPaid = payment.status === 'Pago'
    const action = isPaid ? 'estornar para PENDENTE' : 'confirmar RECEBIMENTO'

    const confirmed = await confirm(`Deseja ${action} o pagamento de ${payment.company_name}?`, 'Confirmar ação')
    if (!confirmed) return

    const res = await confirmPayment(payment.id, payment.status)
    if (res.success) {
      await fetchStats(true, true)
    } else {
      alert('Erro ao processar: ' + res.error)
    }
  }

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

  return {
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
  }
}
