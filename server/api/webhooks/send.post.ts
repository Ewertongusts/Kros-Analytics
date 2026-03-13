import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    const client = await serverSupabaseClient(event)

    // Buscar webhook configurado
    const { data: webhooks, error: webhookError } = await client
      .from('webhook_configs')
      .select('*')
      .eq('active', true)
      .limit(1)

    if (webhookError || !webhooks || webhooks.length === 0) {
      throw new Error('Nenhum webhook configurado')
    }

    const webhook = webhooks[0]

    // Preparar payload
    const payload = {
      event_type: body.event_type,
      source_system: 'kroz',
      payload: body.payload,
      timestamp: new Date().toISOString()
    }

    // Enviar para o webhook
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-token': webhook.token
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Webhook retornou ${response.status}`)
    }

    // Registrar tentativa bem-sucedida
    await client.from('webhook_attempts').insert({
      webhook_config_id: webhook.id,
      status_code: response.status,
      response: 'Sucesso',
      attempt_number: 1
    } as any)

    return {
      success: true,
      message: 'Evento enviado com sucesso'
    }
  } catch (err: any) {
    console.error('Erro ao enviar webhook:', err)
    throw createError({
      statusCode: 500,
      statusMessage: err.message
    })
  }
})
