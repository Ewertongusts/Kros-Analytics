export const useSaleActions = () => {
  const { success, error: showError, confirm } = useToast()
  const { addHistoryEntry } = useSaleHistory()

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

  const shareViaWhatsApp = async (sale: any) => {
    const rawPhone = sale.whatsapp || ''
    const phone = rawPhone.replace(/\D/g, '')
    
    if (!phone) {
      showError('WhatsApp não cadastrado', 'Este cliente não possui WhatsApp cadastrado')
      return
    }

    // Confirmação antes de enviar
    const clientName = sale.representative_name || sale.name || 'N/A'
    const confirmed = await confirm(
      `Deseja enviar o comprovante de venda para ${clientName}?`,
      'Confirmar envio via WhatsApp',
      'whatsapp'
    )
    
    if (!confirmed) return

    try {
      // Gera o comprovante como imagem em base64
      const { generateReceiptBlob } = useSaleReceipt()
      const blob = await generateReceiptBlob(sale)
      
      // Converte blob para base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
      })
      
      // Gera texto do comprovante
      const saleType = sale.sale_type === 'produto' ? 'PRODUTO' : sale.sale_type === 'servico' ? 'SERVIÇO' : 'PERSONALIZADO'
      const itemName = sale.plan_name || sale.custom_name || 'N/A'
      const itemDescription = sale.custom_description || ''
      const clientName = sale.representative_name || sale.name || 'N/A'
      
      let text = `🧾 *COMPROVANTE DE VENDA #${sale.id}*\n\n`
      text += `📋 Tipo: ${saleType}\n`
      text += `👤 Cliente: ${clientName}\n`
      text += `📦 Item: ${itemName}\n`
      if (itemDescription) {
        text += `📝 Descrição: ${itemDescription}\n`
      }
      text += `\n💰 Valor: ${formatCurrency(sale.final_value || sale.monthly_price)}\n`
      
      if (sale.discount_value > 0) {
        text += `🎁 Desconto: ${formatCurrency(sale.discount_value)}\n`
      }
      
      text += `💳 Pagamento: ${sale.payment_type || '—'}\n`
      text += `📊 Parcelas: ${sale.installments || 1}x\n\n`
      
      if (sale.payment_status) {
        const statusEmoji = sale.payment_status === 'paid' ? '✅' : 
                           sale.payment_status === 'pending' ? '⏳' : '📅'
        const statusText = sale.payment_status === 'paid' ? 'PAGO' : 
                          sale.payment_status === 'pending' ? 'PENDENTE' : 'AGENDADO'
        text += `${statusEmoji} Status: ${statusText}\n\n`
      }
      
      text += `_Comprovante detalhado na imagem acima_`
      
      // Envia através da API do sistema com imagem em base64
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          number: phone,
          body: text,
          url: base64
        })
      })

      if (!response.ok) {
        throw new Error(await response.text() || 'Erro ao enviar mensagem')
      }

      // Registra o log da mensagem
      const supabase = useSupabaseClient()
      const logData = {
        company_name: clientName,
        whatsapp: phone,
        message_body: `${text}\n\n[Imagem do comprovante anexada]`,
        status: `✅ Sucesso - Comprovante de Venda #${sale.id}`,
        is_cron: false,
        log_type: 'sale_receipt',
        // Não usar payment_id, usar company_name para identificar
        // Adicionar o ID da venda no status para buscar depois
      }
      
      console.log('Criando log com dados:', logData)
      const logResult = await supabase.from('message_logs').insert(logData)
      
      if (logResult.error) {
        console.error('ERRO ao criar log:', logResult.error)
      } else {
        console.log('Log criado com sucesso:', logResult)
      }

      // Registrar no histórico
      await addHistoryEntry(
        sale.id,
        'whatsapp_sent',
        `Comprovante enviado via WhatsApp para ${clientName}`,
        { phone, message_preview: text.substring(0, 100) }
      )

      success('Comprovante enviado', 'Imagem e texto enviados via WhatsApp')
    } catch (err: any) {
      console.error('Erro ao enviar via WhatsApp:', err)
      
      // Determina a mensagem de erro apropriada
      let errorMessage = 'Não foi possível enviar o comprovante'
      
      if (err.message?.includes('Bad Request') || err.message?.includes('400') || err.message?.includes('500')) {
        errorMessage = 'Número inválido ou WhatsApp não cadastrado'
      } else if (err.message?.includes('Network') || err.message?.includes('fetch')) {
        errorMessage = 'Erro de conexão com a API'
      }
      
      // Registra o erro no log
      try {
        const supabase = useSupabaseClient()
        await supabase.from('message_logs').insert({
          company_name: sale.representative_name || sale.name || 'N/A',
          whatsapp: phone,
          message_body: 'Erro ao gerar comprovante',
          status: `❌ Erro - ${errorMessage}`,
          is_cron: false,
          log_type: 'sale_receipt',
          payment_id: sale.id?.toString()
        } as any)
      } catch (logErr) {
        console.error('Erro ao registrar log:', logErr)
      }
      
      showError('Erro ao enviar', errorMessage)
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
