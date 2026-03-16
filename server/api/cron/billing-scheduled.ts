/**
 * CRON Billing Scheduled - Executa cobranças nos horários agendados
 * Respeita os períodos (manhã, tarde, noite) e horários aleatórios
 */

import { serverSupabaseClient } from '#supabase/server'

interface CronResult {
  success: boolean
  message: string
  processed_count: number
  sent_count: number
  failed_count: number
  execution_time_ms: number
  timestamp: string
}

export default defineEventHandler(async (event): Promise<CronResult> => {
  const startTime = Date.now()

  try {
    // Validar token
    const authHeader = getHeader(event, 'authorization') || getHeader(event, 'Authorization')
    const cronSecret = process.env.CRON_SECRET || 'kros-cron-secret-123'

    if (authHeader !== `Bearer ${cronSecret}`) {
      throw createError({
        statusCode: 401,
        message: 'Não Autorizado: Token do CRON incorreto ou ausente'
      })
    }

    const supabase = await serverSupabaseClient(event)
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    console.log(`[CRON Scheduled] Executando às ${currentTime}`)

    // Buscar pagamentos agendados para AGORA (com margem de 5 minutos)
    const { data: payments, error: paymentsError } = await (supabase.from('payments') as any)
      .select(`
        id,
        amount,
        due_date,
        plan_name,
        cron_message,
        cron_period,
        cron_scheduled_time,
        cron_next_execution,
        companies!inner(
          id,
          name,
          whatsapp,
          is_active
        )
      `)
      .eq('cron_enabled', true)
      .eq('status', 'pending')
      .lte('cron_next_execution', now.toISOString())

    if (paymentsError) {
      console.error('[CRON Scheduled] Erro ao buscar pagamentos:', paymentsError)
      throw paymentsError
    }

    console.log(`[CRON Scheduled] Encontrados ${payments?.length || 0} pagamentos para enviar`)

    const results: any[] = []
    let sentCount = 0
    let failedCount = 0

    // Buscar configurações de CRM
    const { data: crmData } = await (supabase.from('crm_settings') as any)
      .select('*')
      .limit(1)
      .single()

    if (!crmData || !crmData.api_url || !crmData.api_token) {
      throw new Error('Configurações da API de CRM estão incompletas')
    }

    // Buscar template padrão
    const { data: templates } = await (supabase.from('message_templates') as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)

    const defaultTemplate = templates?.[0]?.body || 'Olá {{empresa}}!\nSeu plano {{plano}} de R$ {{valor}} vence no dia {{vencimento}}.'

    // Processar cada pagamento
    for (const payment of payments || []) {
      try {
        const company = payment.companies as any

        if (!company || !company.whatsapp) {
          results.push({
            payment_id: payment.id,
            company_name: company?.name || 'Desconhecido',
            status: 'Pulado - Sem WhatsApp'
          })
          continue
        }

        // Preparar mensagem
        let messageBody = payment.cron_message || defaultTemplate

        // Substituir variáveis
        const valorMoeda = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(payment.amount || 0)

        const dataVencimento = new Date(payment.due_date).toLocaleDateString('pt-BR')

        messageBody = messageBody
          .replace(/\{\{empresa\}\}/g, company.name)
          .replace(/\{\{valor\}\}/g, valorMoeda)
          .replace(/\{\{vencimento\}\}/g, dataVencimento)
          .replace(/\{\{plano\}\}/g, payment.plan_name || 'Plano')

        // Enviar mensagem
        const rawNum = company.whatsapp.replace(/\D/g, '')

        const response = await fetch(crmData.api_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${crmData.api_token}`
          },
          body: JSON.stringify({
            number: rawNum,
            body: messageBody
          })
        })

        if (response.ok) {
          sentCount++
          results.push({
            payment_id: payment.id,
            company_name: company.name,
            status: 'Sucesso - Enviado',
            scheduled_time: payment.cron_scheduled_time,
            period: payment.cron_period
          })

          // Log no banco
          await (supabase.from('message_logs') as any).insert({
            company_name: company.name,
            company_id: company.id,
            whatsapp: rawNum,
            message_body: messageBody,
            status: 'Sucesso - Enviado (CRON Scheduled)',
            is_cron: true,
            log_type: 'cron_billing_scheduled',
            payment_id: payment.id,
            created_at: new Date().toISOString()
          })

          // Gerar novo horário para próxima execução (mesmo período)
          const nextTime = generateRandomTimeInPeriod(payment.cron_period || 'morning')
          const nextExecution = calculateNextExecutionDate(nextTime)

          // Atualizar próxima execução
          await (supabase.from('payments') as any)
            .update({
              cron_scheduled_time: nextTime,
              cron_next_execution: nextExecution.toISOString()
            })
            .eq('id', payment.id)
        } else {
          failedCount++
          const errorText = await response.text()
          results.push({
            payment_id: payment.id,
            company_name: company.name,
            status: `Erro de Envio: ${response.statusText}`,
            error: errorText
          })

          // Log de erro
          await (supabase.from('message_logs') as any).insert({
            company_name: company.name,
            company_id: company.id,
            whatsapp: rawNum,
            message_body: messageBody,
            status: `Erro de Envio (CRON Scheduled): ${response.statusText}`,
            is_cron: true,
            log_type: 'cron_billing_scheduled',
            payment_id: payment.id,
            created_at: new Date().toISOString()
          })
        }
      } catch (err: any) {
        failedCount++
        console.error(`[CRON Scheduled] Erro ao processar pagamento ${payment.id}:`, err)
        results.push({
          payment_id: payment.id,
          company_name: (payment.companies as any)?.name || 'Desconhecido',
          status: `Erro: ${err.message}`
        })
      }
    }

    const executionTime = Date.now() - startTime

    console.log(`[CRON Scheduled] Finalizado: ${sentCount} enviadas, ${failedCount} falhadas em ${executionTime}ms`)

    return {
      success: true,
      message: `CRON Scheduled executado com sucesso`,
      processed_count: payments?.length || 0,
      sent_count: sentCount,
      failed_count: failedCount,
      execution_time_ms: executionTime,
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    console.error('[CRON Scheduled] Erro fatal:', error)
    return {
      success: false,
      message: `Erro ao executar CRON: ${error.message}`,
      processed_count: 0,
      sent_count: 0,
      failed_count: 0,
      execution_time_ms: Date.now() - startTime,
      timestamp: new Date().toISOString()
    }
  }
})

/**
 * Gera um horário aleatório dentro de um período
 */
function generateRandomTimeInPeriod(period: string): string {
  const periodConfig: { start: number; end: number } = 
    period === 'afternoon' ? { start: 11, end: 14 } :
    period === 'evening' ? { start: 14, end: 19 } :
    { start: 7, end: 11 } // morning default

  const totalMinutes = (periodConfig.end - periodConfig.start) * 60
  const randomMinutes = Math.floor(Math.random() * totalMinutes)
  const hour = periodConfig.start + Math.floor(randomMinutes / 60)
  const minute = randomMinutes % 60

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

/**
 * Calcula a próxima data de execução
 */
function calculateNextExecutionDate(time: string): Date {
  const parts = (time ?? '09:00').split(':')
  const hour = parseInt(parts[0] ?? '9', 10)
  const minute = parseInt(parts[1] ?? '0', 10)
  const next = new Date()
  next.setHours(hour, minute, 0, 0)

  // Se já passou hoje, agendar para amanhã
  if (next < new Date()) {
    next.setDate(next.getDate() + 1)
  }

  return next
}
