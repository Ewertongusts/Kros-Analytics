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
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    
    // Registrar evento recebido
    const { error } = await supabase.from('webhook_events').insert({
      event_type: body.event_type,
      source_system: body.source_system,
      payload: body.payload,
      processed: false,
      received_at: new Date().toISOString(),
      user_id: user.value?.id
    })
    
    if (error) {
      console.error('Erro ao registrar webhook:', error)
      throw error
    }
    
    // Processar evento baseado no tipo
    await processWebhookEvent(body)
    
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

const processWebhookEvent = async (event: any) => {
  const supabase = useSupabaseClient()
  
  switch (event.event_type) {
    case 'customer.created':
      await handleCustomerCreated(event.payload)
      break
    case 'customer.updated':
      await handleCustomerUpdated(event.payload)
      break
    case 'customer.deleted':
      await handleCustomerDeleted(event.payload)
      break
    case 'payment.received':
      await handlePaymentReceived(event.payload)
      break
    case 'payment.failed':
      await handlePaymentFailed(event.payload)
      break
    default:
      console.log('Evento desconhecido:', event.event_type)
  }
  
  // Marcar como processado
  await supabase
    .from('webhook_events')
    .update({ processed: true, processed_at: new Date().toISOString() })
    .eq('id', event.id)
}

const handleCustomerCreated = async (payload: any) => {
  const supabase = useSupabaseClient()
  
  // Criar cliente no sistema
  await supabase.from('companies').insert({
    name: payload.name,
    representative_name: payload.contact_name,
    email: payload.email,
    whatsapp: payload.phone,
    is_active: true,
    external_id: payload.id,
    external_source: payload.source
  })
}

const handleCustomerUpdated = async (payload: any) => {
  const supabase = useSupabaseClient()
  
  // Atualizar cliente
  await supabase
    .from('companies')
    .update({
      name: payload.name,
      representative_name: payload.contact_name,
      email: payload.email,
      whatsapp: payload.phone
    })
    .eq('external_id', payload.id)
}

const handleCustomerDeleted = async (payload: any) => {
  const supabase = useSupabaseClient()
  
  // Deletar cliente
  await supabase
    .from('companies')
    .delete()
    .eq('external_id', payload.id)
}

const handlePaymentReceived = async (payload: any) => {
  const supabase = useSupabaseClient()
  
  // Atualizar pagamento como recebido
  await supabase
    .from('payments')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      payment_method: payload.method
    })
    .eq('external_id', payload.id)
}

const handlePaymentFailed = async (payload: any) => {
  const supabase = useSupabaseClient()
  
  // Atualizar pagamento como falho
  await supabase
    .from('payments')
    .update({
      status: 'failed',
      failure_reason: payload.reason
    })
    .eq('external_id', payload.id)
}
