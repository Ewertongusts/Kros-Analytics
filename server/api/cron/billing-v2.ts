/**
 * CRON Billing v2 - Sistema melhorado de automação de mensagens
 * Suporta múltiplos horários, segmentação e relatórios
 */

import { cronSchedules, globalCronConfig, shouldSendMessages, calculateDaysUntilDue } from '~/server/config/cronConfig'

interface CronResult {
  success: boolean
  message: string
  schedule_id: string
  processed_count: number
  sent_count: number
  failed_count: number
  skipped_count: number
  logs: any[]
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

    // Obter schedule_id da query
    const scheduleId = getQuery(event).schedule_id as string
    if (!scheduleId) {
      throw createError({
        statusCode: 400,
        message: 'schedule_id é obrigatório'
      })
    }

    // Encontrar schedule
    const schedule = cronSchedules.find(s => s.id === scheduleId)
    if (!schedule) {
      throw createError({
        statusCode: 404,
        message: `Schedule não encontrado: ${scheduleId}`
      })
    }

    if (!schedule.enabled) {
      return {
        success: false,
        message: `Schedule desativado: ${schedule.name}`,
        schedule_id: scheduleId,
        processed_count: 0,
        sent_count: 0,
        failed_count: 0,
        skipped_count: 0,
        logs: [],
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    }

    // Verificar se deve enviar mensagens
    const sendCheck = shouldSendMessages()
    if (!sendCheck.allowed) {
      return {
        success: false,
        message: `Envios não permitidos: ${sendCheck.reason}`,
        schedule_id: scheduleId,
        processed_count: 0,
        sent_count: 0,
        failed_count: 0,
        skipped_count: 0,
        logs: [],
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    }

    const supabase = useSupabaseClient()
    const results: any[] = []
    let sentCount = 0
    let failedCount = 0
    let skippedCount = 0

    // Buscar pagamentos com base nos filtros
    let query = (supabase.from('payments') as any)
      .select(`
        id,
        amount,
        due_date,
        plan_name,
        cron_message,
        auto_billing_enabled,
        status,
        companies!inner(
          id,
          name,
          representative_name,
          whatsapp,
          is_active,
          monthly_price
        )
      `)

    // Aplicar filtros
    if (schedule.filters.onlyActive) {
      query = query.eq('companies.is_active', true)
    }

    if (schedule.filters.paymentStatus.length > 0) {
      query = query.in('status', schedule.filters.paymentStatus)
    }

    const { data: payments, error: paymentsError } = await query.order('due_date', { ascending: true })

    if (paymentsError) {
      console.error('[CRON v2] Erro ao buscar pagamentos:', paymentsError)
      throw paymentsError
    }

    // Processar pagamentos
    for (const payment of payments || []) {
      try {
        const company = payment.companies
        if (!company || !company.whatsapp) {
          skippedCount++
          results.push({
            payment_id: payment.id,
            company_name: company?.name || 'Desconhecido',
            status: 'Pulado - Sem WhatsApp',
            reason: 'Empresa não possui WhatsApp configurado'
          })
          continue
        }

        // Verificar se deve excluir auto-billing
        if (schedule.filters.excludeAutoBilling && payment.auto_billing_enabled) {
          skippedCount++
          results.push({
            payment_id: payment.id,
            company_name: company.name,
            status: 'Pulado - Auto-billing ativo',
            reason: 'Empresa tem cobrança automática ativada'
          })
          continue
        }

        // Calcular dias até vencimento
        const daysUntilDue = calculateDaysUntilDue(payment.due_date)

        // Verificar se está dentro do filtro de dias
        if (daysUntilDue < schedule.filters.daysUntilDue.min || daysUntilDue > schedule.filters.daysUntilDue.max) {
          skippedCount++
          continue
        }

        // Preparar mensagem
        let messageBody = payment.cron_message || schedule.template

        // Substituir variáveis
        const valorMoeda = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(payment.amount || 0)

        const dataVencimento = new Date(payment.due_date).toLocaleDateString('pt-BR')
        const diasRestantes = Math.abs(daysUntilDue)

        messageBody = messageBody
          .replace(/{empresa}/g, company.name)
          .replace(/{plano}/g, payment.plan_name || 'Plano')
          .replace(/{valor}/g, valorMoeda)
          .replace(/{vencimento}/g, dataVencimento)
          .replace(/{dias_restantes}/g, diasRestantes.toString())
          .replace(/{link_pagamento}/g, 'https://seu-link-de-pagamento.com') // TODO: Implementar link dinâmico

        // Enviar mensagem
        const rawNum = company.whatsapp.replace(/\D/g, '')
        const response = await fetch('https://api.z-api.io/instances/YOUR_INSTANCE/token/YOUR_TOKEN/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: rawNum,
            message: messageBody
          })
        })

        if (response.ok) {
          sentCount++
          results.push({
            payment_id: payment.id,
            company_name: company.name,
            status: 'Sucesso - Enviado (CRON v2)',
            schedule: schedule.name,
            days_until_due: daysUntilDue
          })

          // Log no banco
          await (supabase.from('message_logs') as any).insert({
            company_name: company.name,
            company_id: company.id,
            whatsapp: rawNum,
            message_body: messageBody,
            status: 'Sucesso - Enviado (CRON v2)',
            is_cron: true,
            log_type: 'cron_billing',
            payment_id: payment.id,
            schedule_id: scheduleId,
            created_at: new Date().toISOString()
          })
        } else {
          failedCount++
          const errorText = await response.text()
          results.push({
            payment_id: payment.id,
            company_name: company.name,
            status: `Erro de Envio (CRON v2): ${response.statusText}`,
            error: errorText
          })

          // Log de erro
          await (supabase.from('message_logs') as any).insert({
            company_name: company.name,
            company_id: company.id,
            whatsapp: rawNum,
            message_body: messageBody,
            status: `Erro de Envio (CRON v2): ${response.statusText}`,
            is_cron: true,
            log_type: 'cron_billing',
            payment_id: payment.id,
            schedule_id: scheduleId,
            created_at: new Date().toISOString()
          })
        }

        // Respeitar limite de mensagens por dia
        if (sentCount >= schedule.filters.maxMessagesPerDay) {
          console.log(`[CRON v2] Limite de ${schedule.filters.maxMessagesPerDay} mensagens atingido`)
          break
        }
      } catch (err: any) {
        failedCount++
        console.error(`[CRON v2] Erro ao processar pagamento ${payment.id}:`, err)
        results.push({
          payment_id: payment.id,
          company_name: payment.companies?.name || 'Desconhecido',
          status: `Erro: ${err.message}`,
          error: err
        })
      }
    }

    // Gerar relatório
    const executionTime = Date.now() - startTime
    const report = {
      success: true,
      message: `CRON v2 executado com sucesso: ${schedule.name}`,
      schedule_id: scheduleId,
      processed_count: payments?.length || 0,
      sent_count: sentCount,
      failed_count: failedCount,
      skipped_count: skippedCount,
      logs: results,
      execution_time_ms: executionTime,
      timestamp: new Date().toISOString()
    }

    // Log do relatório
    if (globalCronConfig.logging.enabled && globalCronConfig.logging.generateDailyReport) {
      await (supabase.from('cron_reports') as any).insert({
        schedule_id: scheduleId,
        schedule_name: schedule.name,
        processed_count: report.processed_count,
        sent_count: sentCount,
        failed_count: failedCount,
        skipped_count: skippedCount,
        execution_time_ms: executionTime,
        report_data: report,
        created_at: new Date().toISOString()
      })
    }

    console.log(`[CRON v2] ${schedule.name} - Enviadas: ${sentCount}, Falhadas: ${failedCount}, Puladas: ${skippedCount}`)

    return report
  } catch (error: any) {
    console.error('[CRON v2] Erro fatal:', error)
    return {
      success: false,
      message: `Erro ao executar CRON: ${error.message}`,
      schedule_id: 'unknown',
      processed_count: 0,
      sent_count: 0,
      failed_count: 0,
      skipped_count: 0,
      logs: [],
      execution_time_ms: Date.now() - startTime,
      timestamp: new Date().toISOString()
    }
  }
})
