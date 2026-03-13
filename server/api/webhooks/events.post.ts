import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Validar token de segurança
  const token = getHeader(event, 'x-webhook-token')
  const validToken = process.env.WEBHOOK_TOKEN
  
  if (!token || token !== validToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
  
  try {
    const client = await serverSupabaseClient(event)
    
    // Registrar evento recebido
    const { error } = await client.from('webhook_events').insert({
      event_type: body.event_type,
      source_system: body.source_system,
      payload: body.payload,
      processed: false,
      received_at: new Date().toISOString()
    } as any)
    
    if (error) {
      console.error('Erro ao registrar webhook:', error)
      throw error
    }
    
    // Processar evento baseado no tipo
    await processWebhookEvent(body, client)
    
    return {
      success: true,
      message: 'Evento recebido e processado'
    }
  } catch (err: any) {
    console.error('Erro ao processar webhook:', err)
    throw createError({
      statusCode: 500,
      statusMessage: err.message
    })
  }
})

const processWebhookEvent = async (event: any, client: any) => {
  switch (event.event_type) {
    case 'customer.created':
      await handleCustomerCreated(event.payload, client)
      break
    case 'customer.updated':
      await handleCustomerUpdated(event.payload, client)
      break
    case 'customer.deleted':
      await handleCustomerDeleted(event.payload, client)
      break
    case 'payment.received':
      await handlePaymentReceived(event.payload, client)
      break
    case 'payment.failed':
      await handlePaymentFailed(event.payload, client)
      break
    default:
      console.log('Evento desconhecido:', event.event_type)
  }
}

const handleCustomerCreated = async (payload: any, client: any) => {
  // Criar cliente no sistema
  await client.from('companies').insert({
    name: payload.name,
    representative_name: payload.contact_name,
    email: payload.email,
    whatsapp: payload.phone,
    is_active: true,
    external_id: payload.id,
    external_source: payload.source
  })
}

const handleCustomerUpdated = async (payload: any, client: any) => {
  // Atualizar cliente
  await client
    .from('companies')
    .update({
      name: payload.name,
      representative_name: payload.contact_name,
      email: payload.email,
      whatsapp: payload.phone
    })
    .eq('external_id', payload.id)
}

const handleCustomerDeleted = async (payload: any, client: any) => {
  // Deletar cliente
  await client
    .from('companies')
    .delete()
    .eq('external_id', payload.id)
}

const handlePaymentReceived = async (payload: any, client: any) => {
  // Atualizar pagamento como recebido
  await client
    .from('payments')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      payment_method: payload.method
    })
    .eq('external_id', payload.id)
}

const handlePaymentFailed = async (payload: any, client: any) => {
  // Atualizar pagamento como falho
  await client
    .from('payments')
    .update({
      status: 'failed',
      failure_reason: payload.reason
    })
    .eq('external_id', payload.id)
}
