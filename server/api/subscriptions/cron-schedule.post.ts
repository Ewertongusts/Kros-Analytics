import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const supabase = await serverSupabaseClient(event)

    const { paymentId, period, scheduledTime, nextExecution, message, action } = body

    if (!paymentId) {
      throw createError({
        statusCode: 400,
        message: 'paymentId é obrigatório'
      })
    }

    if (action === 'disable') {
      // Desativar CRON
      const { error } = await supabase
        .from('payments')
        .update({
          cron_enabled: false,
          cron_period: null,
          cron_scheduled_time: null,
          cron_next_execution: null
        })
        .eq('id', paymentId)

      if (error) throw error

      return {
        success: true,
        message: 'Cobrança automática desativada'
      }
    }

    // Ativar/Atualizar CRON
    if (!period || !scheduledTime || !nextExecution || !message) {
      throw createError({
        statusCode: 400,
        message: 'period, scheduledTime, nextExecution e message são obrigatórios'
      })
    }

    const { error } = await supabase
      .from('payments')
      .update({
        cron_enabled: true,
        cron_period: period,
        cron_scheduled_time: scheduledTime,
        cron_next_execution: nextExecution,
        cron_message: message
      })
      .eq('id', paymentId)

    if (error) throw error

    return {
      success: true,
      message: 'Cobrança agendada com sucesso',
      scheduledTime,
      nextExecution
    }
  } catch (err: any) {
    console.error('[CRON Schedule] Erro:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Erro ao agendar cobrança'
    })
  }
})
