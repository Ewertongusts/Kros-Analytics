import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // 1. Camada de Segurança (Validação do Token)
  const authHeader = getHeader(event, 'authorization') || getHeader(event, 'Authorization')
  
  // A senha secreta deve ser configurada no seu arquivo .env como CRON_SECRET=minhasenha
  const cronSecret = process.env.CRON_SECRET || 'kros-cron-secret-123'
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    throw createError({
      statusCode: 401,
      message: 'Não Autorizado: Token do CRON incorreto ou ausente'
    })
  }

  // 2. Conexão Segura ao Banco de Dados usando o client do Nitro/Nuxt autenticado
  const supabase = await serverSupabaseClient(event)

  try {
    // 3. Captura do Motor de Envio (Integrações com o Legendary Hub CRM)
    const { data: crmData, error: crmError } = await supabase
      .from('crm_settings')
      .select('*')
      .limit(1)
      .single()

    const crmSettings: any = crmData

    if (crmError || !crmSettings || !crmSettings.api_url || !crmSettings.api_token) {
        throw new Error('Configurações da API de CRM estão incompletas. Preencha no painel Config. API.')
    }

    // Buscando o Template Dinâmico salvo no banco
    const { data: templates } = await supabase
      .from('message_templates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      
    const lastTemplate: any = templates?.[0]
    const templateMsg = lastTemplate?.body || 'Olá {{empresa}}!\nSeu plano {{plano}} de R$ {{valor}} vence no dia {{vencimento}}.'

    // 4. A Varredura Diária (Limita a buscar pendentes/atrasados com vencimento no limite de hoje pra trás e botão de automação ativado)
    const today = new Date().toISOString().split('T')[0]
    
    const { data: payments, error: paymentsError } = await (supabase.from('payments') as any)
      .select('id, amount, due_date, plan_name, cron_message, companies!inner(name, whatsapp)')
      .in('status', ['pending', 'overdue'])
      .lte('due_date', today)
      .eq('auto_billing_enabled', true) // Filtro verificando o novo botão 

    if (paymentsError) throw paymentsError

    const results = []

    // 5. O Loop de Disparos de Mensagens
    for (const payment of payments || []) {
      const company = payment.companies as any
      const rawNum = company.whatsapp ? company.whatsapp.replace(/\D/g, '') : ''

      if (!rawNum) {
        results.push({ id: payment.id, company: company.name, status: 'Ignorado (Sem WhatsApp)' })
        continue
      }

      // Formatação no padrão do Brasil e Compilação
      const dataVencimentoBR = payment.due_date.split('-').reverse().join('/')
      const valorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payment.amount || 0)

      let messageBody = payment.cron_message ? payment.cron_message : templateMsg
      messageBody = messageBody.replace(/\{\{empresa\}\}/g, company.name)
      messageBody = messageBody.replace(/\{\{valor\}\}/g, valorMoeda)
      messageBody = messageBody.replace(/\{\{vencimento\}\}/g, dataVencimentoBR)
      messageBody = messageBody.replace(/\{\{plano\}\}/g, payment.plan_name || 'Individual')

      // Disparo POST Real para a API configurada
      try {
        const payload = {
            number: rawNum,
            body: messageBody
        }

        const response = await fetch(crmSettings.api_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${crmSettings.api_token}`
          },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
           throw new Error(`Falha na resposta do CRM: ${response.status} ${response.statusText}`)
        }

        results.push({ id: payment.id, company: company.name, status: 'Sucesso - Enviado' })
        await (supabase as any).from('message_logs').insert({
           company_name: company.name,
           whatsapp: rawNum,
           message_body: messageBody,
           status: 'Sucesso - Enviado (CRON)',
           is_cron: true,
           payment_id: payment.id
        })
      } catch (err: any) {
        results.push({ id: payment.id, company: company.name, status: 'Erro de Envio', error: err.message })
        await (supabase as any).from('message_logs').insert({
           company_name: company.name,
           whatsapp: rawNum,
           message_body: messageBody,
           status: `Erro de Envio (CRON): ${err.message}`,
           is_cron: true,
           payment_id: payment.id
        })
      }
    }

    return {
      success: true,
      message: 'CRON executado com sucesso e varredura concluída.',
      processed_count: (payments || []).length,
      logs: results
    }

  } catch (error: any) {
    console.error('[CRON Billing API] Erro fatal:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
