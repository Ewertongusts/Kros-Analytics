export const useSaleActions = () => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (date: string) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const shareViaWhatsApp = (sale: any) => {
    let text = `🛍️ *RESUMO DA VENDA*\n\n`
    text += `👤 *Cliente:* ${sale.representative_name || sale.name || '—'}\n`
    if (sale.name && sale.representative_name) text += `🏢 *Empresa:* ${sale.name}\n`
    if (sale.plan_name) text += `📦 *Item:* ${sale.plan_name}\n`
    if (sale.custom_name) text += `✨ *Nome:* ${sale.custom_name}\n`
    
    text += `\n💰 *VALORES*\n`
    text += `Valor: ${formatCurrency(sale.monthly_price)}\n`
    
    if (sale.discount_value > 0) {
      text += `Desconto: -${formatCurrency(sale.discount_value)}\n`
      text += `*Valor Final: ${formatCurrency(sale.final_value)}*\n`
    }
    
    if (sale.down_payment > 0) {
      text += `Entrada: ${formatCurrency(sale.down_payment)}\n`
    }
    
    if (sale.interest_rate > 0) {
      text += `Juros: ${sale.interest_type}\n`
    }
    
    text += `\n💳 *PAGAMENTO*\n`
    text += `Forma: ${sale.payment_type || '—'}\n`
    
    if (sale.installments > 1) {
      text += `Parcelas: ${sale.installments}x\n`
      if (sale.installments_payment_type) {
        text += `Parcelas em: ${sale.installments_payment_type}\n`
      }
    }
    
    if (sale.payment_status) {
      const status = sale.payment_status === 'paid' ? '✅ Pago' : 
                     sale.payment_status === 'pending' ? '⏳ Pendente' : 
                     '📅 Agendado'
      text += `Status: ${status}\n`
    }
    
    if (sale.payment_date) {
      text += `Data: ${formatDate(sale.payment_date)}\n`
    }
    
    if (sale.created_by_name) {
      text += `\n👤 *Criado por:* ${sale.created_by_name}\n`
    }
    
    if (sale.notes) {
      text += `\n📝 *Observações:*\n${sale.notes}\n`
    }
    
    const phone = sale.whatsapp?.replace(/\D/g, '') || ''
    if (phone) {
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
      window.open(url, '_blank')
    } else {
      alert('WhatsApp não cadastrado para este cliente')
    }
  }

  const copySaleInfo = async (sale: any) => {
    let text = `RESUMO DA VENDA\n\n`
    text += `Cliente: ${sale.representative_name || sale.name || '—'}\n`
    if (sale.name && sale.representative_name) text += `Empresa: ${sale.name}\n`
    if (sale.plan_name) text += `Item: ${sale.plan_name}\n`
    if (sale.custom_name) text += `Nome: ${sale.custom_name}\n`
    text += `Valor: ${formatCurrency(sale.monthly_price)}\n`
    if (sale.discount_value > 0) text += `Desconto: -${formatCurrency(sale.discount_value)}\n`
    if (sale.final_value) text += `Valor Final: ${formatCurrency(sale.final_value)}\n`
    text += `Status: ${sale.payment_status === 'paid' ? 'Pago' : sale.payment_status === 'pending' ? 'Pendente' : 'Agendado'}\n`
    if (sale.created_by_name) text += `Criado por: ${sale.created_by_name}\n`
    
    try {
      await navigator.clipboard.writeText(text)
      alert('Informações copiadas!')
    } catch (err) {
      alert('Erro ao copiar informações')
    }
  }

  return {
    shareViaWhatsApp,
    copySaleInfo,
    formatCurrency,
    formatDate
  }
}
