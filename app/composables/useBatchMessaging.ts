import { ref } from 'vue'

export const useBatchMessaging = () => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const formatDate = (date: string) => {
    if (!date) return '-'
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
  }

  const compileTemplate = (tmplBody: string, payment: any) => {
    let msg = tmplBody || ''
    msg = msg.replace(/\{\{empresa\}\}/g, payment.company_name)
    msg = msg.replace(/\{\{valor\}\}/g, formatCurrency(payment.amount))
    msg = msg.replace(/\{\{vencimento\}\}/g, formatDate(payment.due_date))
    msg = msg.replace(/\{\{plano\}\}/g, payment.plan_name)
    return msg
  }

  const isWithinSkipLimit = (lastSentDate: string, skipDays: number) => {
    if (!lastSentDate) return false
    
    const lastDate = new Date(lastSentDate)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - lastDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays <= skipDays
  }

  const fetchLastSentRecords = async (payments: any[]) => {
    if (payments.length === 0) return {}
    
    const supabase = useSupabaseClient()
    const records: Record<string, any> = {}
    
    for (const p of payments) {
      try {
        const { data } = await (supabase as any)
          .from('message_logs')
          .select('created_at')
          .eq('company_name', p.company_name)
          .or('status.ilike.%Sucesso%,status.ilike.%Enviado%')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        
        if (data) records[p.id] = data
      } catch (e) {
        // Ignora erros de registros não encontrados
      }
    }
    
    return records
  }

  const sendMessage = async (number: string, body: string) => {
    const response = await fetch('/api/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number, body })
    })

    if (!response.ok) {
      throw new Error(await response.text() || 'Erro na resposta da API')
    }

    return response
  }

  const logMessage = async (data: {
    company_id?: string
    company_name: string
    whatsapp: string
    message_body: string
    status: string
    payment_id?: string
  }) => {
    const supabase = useSupabaseClient()
    
    await (supabase as any).from('message_logs').insert({
      ...data,
      is_cron: false
    })
  }

  return {
    formatCurrency,
    formatDate,
    compileTemplate,
    isWithinSkipLimit,
    fetchLastSentRecords,
    sendMessage,
    logMessage
  }
}
