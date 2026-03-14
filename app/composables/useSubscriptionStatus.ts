/**
 * Composable para calcular o status de pagamento de uma assinatura
 * baseado nas faturas geradas
 */

export type SubscriptionPaymentStatus = 
  | 'paid_up'    // Em dia - todas faturas pagas
  | 'pending'    // Pendente - tem fatura não paga mas não vencida
  | 'overdue'    // Em atraso - tem fatura vencida
  | 'active'     // Ativa - sem faturas geradas ainda
  | 'suspended'  // Suspensa - pausada manualmente
  | 'cancelled'  // Cancelada - encerrada

export const useSubscriptionStatus = () => {
  /**
   * Calcula o status de pagamento de uma assinatura baseado nas faturas
   * @param subscription - Dados da assinatura
   * @param invoices - Array de faturas relacionadas à assinatura
   * @returns Status calculado
   */
  const calculatePaymentStatus = (
    subscription: any,
    invoices: any[]
  ): SubscriptionPaymentStatus => {
    console.log(`🔍 [calculatePaymentStatus] Calculando para: ${subscription.customer_name}`)
    console.log(`📊 [calculatePaymentStatus] Total de faturas recebidas: ${invoices.length}`)
    
    // Se a assinatura está suspensa ou cancelada, retornar o status dela
    if (subscription.status === 'suspended') {
      console.log(`⏸ [calculatePaymentStatus] Assinatura suspensa`)
      return 'suspended'
    }
    if (subscription.status === 'cancelled') {
      console.log(`✕ [calculatePaymentStatus] Assinatura cancelada`)
      return 'cancelled'
    }
    
    // Filtrar apenas faturas desta assinatura (pelo company_id/customer_id)
    const customerId = subscription.customer_id || subscription.company_id
    console.log(`🔍 [calculatePaymentStatus] Filtrando por customer_id: ${customerId}`)
    
    const subscriptionInvoices = invoices.filter(
      inv => inv.company_id === customerId
    )
    
    console.log(`📋 [calculatePaymentStatus] Faturas desta assinatura: ${subscriptionInvoices.length}`)
    subscriptionInvoices.forEach((inv, idx) => {
      console.log(`  [${idx}] Status: ${inv.status}, Due: ${inv.due_date}, Amount: ${inv.amount}`)
    })
    
    // Se não tem faturas geradas ainda, está ativa
    if (subscriptionInvoices.length === 0) {
      console.log(`✓ [calculatePaymentStatus] Sem faturas → ACTIVE`)
      return 'active'
    }
    
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Zerar horas para comparação apenas de data
    
    // Verificar se tem alguma fatura vencida (pending e due_date < hoje)
    const hasOverdueInvoice = subscriptionInvoices.some(inv => {
      // Aceitar tanto 'pending' quanto 'Pendente'
      const isPending = inv.status === 'pending' || inv.status === 'Pendente'
      if (!isPending) return false
      
      const dueDate = new Date(inv.due_date)
      dueDate.setHours(0, 0, 0, 0)
      
      const isOverdue = dueDate < today
      if (isOverdue) {
        console.log(`⚠ [calculatePaymentStatus] Fatura vencida encontrada: ${inv.id}`)
      }
      return isOverdue
    })
    
    if (hasOverdueInvoice) {
      console.log(`⚠ [calculatePaymentStatus] Resultado: OVERDUE`)
      return 'overdue'
    }
    
    // Verificar se tem alguma fatura pendente (não vencida)
    const hasPendingInvoice = subscriptionInvoices.some(inv => {
      // Aceitar tanto 'pending' quanto 'Pendente'
      const isPending = inv.status === 'pending' || inv.status === 'Pendente'
      if (!isPending) return false
      
      const dueDate = new Date(inv.due_date)
      dueDate.setHours(0, 0, 0, 0)
      
      const isPendingNotOverdue = dueDate >= today
      if (isPendingNotOverdue) {
        console.log(`⏱ [calculatePaymentStatus] Fatura pendente encontrada: ${inv.id}`)
      }
      return isPendingNotOverdue
    })
    
    if (hasPendingInvoice) {
      console.log(`⏱ [calculatePaymentStatus] Resultado: PENDING`)
      return 'pending'
    }
    
    // Se chegou aqui, todas as faturas estão pagas
    console.log(`✓ [calculatePaymentStatus] Resultado: PAID_UP`)
    return 'paid_up'
  }
  
  /**
   * Retorna o label em português para o status
   */
  const getStatusLabel = (status: SubscriptionPaymentStatus): string => {
    const labels: Record<SubscriptionPaymentStatus, string> = {
      paid_up: 'Em Dia',
      pending: 'Pendente',
      overdue: 'Em Atraso',
      active: 'Ativa',
      suspended: 'Suspensa',
      cancelled: 'Cancelada'
    }
    
    return labels[status] || status
  }
  
  /**
   * Retorna a classe CSS para o status
   */
  const getStatusClass = (status: SubscriptionPaymentStatus): string => {
    const classes: Record<SubscriptionPaymentStatus, string> = {
      paid_up: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
      active: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      suspended: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
    
    return classes[status] || ''
  }
  
  /**
   * Retorna o ícone para o status
   */
  const getStatusIcon = (status: SubscriptionPaymentStatus): string => {
    const icons: Record<SubscriptionPaymentStatus, string> = {
      paid_up: '✓',
      pending: '⏱',
      overdue: '⚠',
      active: '●',
      suspended: '⏸',
      cancelled: '✕'
    }
    
    return icons[status] || ''
  }
  
  return {
    calculatePaymentStatus,
    getStatusLabel,
    getStatusClass,
    getStatusIcon
  }
}
