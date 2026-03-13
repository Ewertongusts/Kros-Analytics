import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    // Validar token
    const token = getHeader(event, 'x-webhook-token')
    const expectedToken = process.env.WEBHOOK_TOKEN

    if (!token || token !== expectedToken) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token inválido ou ausente'
      })
    }

    const body = await readBody(event)

    if (!body || !body.event_type) {
      throw createError({
        statusCode: 400,
        statusMessage: 'event_type é obrigatório'
      })
    }

    const client = await serverSupabaseClient(event)

    // Registrar evento recebido
    const { data: eventRecord, error: eventError } = await client
      .from('webhook_events')
      .insert({
        event_type: body.event_type,
        source_system: body.source_system || 'external_crm',
        payload: body.payload || {},
        processed: false
      } as any)
      .select()
      .single()

    if (eventError) {
      console.error('Erro ao registrar evento:', eventError)
      throw eventError
    }

    // Processar evento baseado no tipo
    let processedData: any = null
    let success = false

    try {
      if (body.event_type === 'lead.created' || body.event_type === 'customer.created') {
        processedData = await processLeadCreated(client, body.payload)
        success = true
      } else if (body.event_type === 'lead.updated' || body.event_type === 'customer.updated') {
        processedData = await processLeadUpdated(client, body.payload)
        success = true
      } else if (body.event_type === 'payment.received') {
        processedData = await processPaymentReceived(client, body.payload)
        success = true
      } else {
        console.log('Evento não processado:', body.event_type)
      }

      // Marcar como processado
      await client
        .from('webhook_events')
        .update({ processed: success, processed_at: new Date().toISOString() })
        .eq('id', eventRecord.id)

      return {
        success: true,
        message: 'Evento recebido e processado',
        event_id: eventRecord.id,
        processed_data: processedData
      }
    } catch (processError: any) {
      console.error('Erro ao processar evento:', processError)

      // Marcar como erro
      await client
        .from('webhook_events')
        .update({ processed: false, processed_at: new Date().toISOString() })
        .eq('id', eventRecord.id)

      throw createError({
        statusCode: 500,
        statusMessage: `Erro ao processar evento: ${processError.message}`
      })
    }
  } catch (err: any) {
    console.error('Erro no webhook receiver:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message
    })
  }
})

async function processLeadCreated(client: any, payload: any) {
  if (!payload.name && !payload.email && !payload.whatsapp) {
    throw new Error('Nome, email ou whatsapp é obrigatório')
  }

  // Formatar telefone com 55 se necessário
  let whatsapp = payload.whatsapp || ''
  if (whatsapp && !whatsapp.startsWith('55')) {
    whatsapp = '55' + whatsapp.replace(/\D/g, '')
  }

  const { data: company, error } = await client
    .from('companies')
    .insert({
      name: payload.name || payload.email || 'Lead sem nome',
      representative_name: payload.representative_name || payload.name,
      email: payload.email || null,
      whatsapp: whatsapp || null,
      phone: payload.phone || null,
      is_active: true,
      tags: payload.tags || ['lead_crm'],
      notes: payload.notes || `Importado do CRM em ${new Date().toLocaleString('pt-BR')}`,
      segment: payload.segment || null,
      document: payload.document || null
    } as any)
    .select()
    .single()

  if (error) throw error

  return {
    action: 'created',
    company_id: company.id,
    company_name: company.name
  }
}

async function processLeadUpdated(client: any, payload: any) {
  if (!payload.id && !payload.email && !payload.whatsapp) {
    throw new Error('ID, email ou whatsapp é obrigatório para atualizar')
  }

  let query = client.from('companies')

  if (payload.id) {
    query = query.eq('id', payload.id)
  } else if (payload.email) {
    query = query.eq('email', payload.email)
  } else if (payload.whatsapp) {
    query = query.eq('whatsapp', payload.whatsapp)
  }

  // Formatar telefone
  let whatsapp = payload.whatsapp
  if (whatsapp && !whatsapp.startsWith('55')) {
    whatsapp = '55' + whatsapp.replace(/\D/g, '')
  }

  const updateData: any = {}
  if (payload.name) updateData.name = payload.name
  if (payload.representative_name) updateData.representative_name = payload.representative_name
  if (payload.email) updateData.email = payload.email
  if (whatsapp) updateData.whatsapp = whatsapp
  if (payload.phone) updateData.phone = payload.phone
  if (payload.tags) updateData.tags = payload.tags
  if (payload.segment) updateData.segment = payload.segment
  if (payload.notes) updateData.notes = payload.notes

  const { data: company, error } = await query
    .update(updateData)
    .select()
    .single()

  if (error) throw error

  return {
    action: 'updated',
    company_id: company.id,
    company_name: company.name
  }
}

async function processPaymentReceived(client: any, payload: any) {
  if (!payload.company_id && !payload.email && !payload.whatsapp) {
    throw new Error('company_id, email ou whatsapp é obrigatório')
  }

  let companyId = payload.company_id

  // Se não tiver company_id, buscar por email ou whatsapp
  if (!companyId) {
    let query = client.from('companies').select('id')

    if (payload.email) {
      query = query.eq('email', payload.email)
    } else if (payload.whatsapp) {
      query = query.eq('whatsapp', payload.whatsapp)
    }

    const { data: companies } = await query.limit(1)
    if (!companies || companies.length === 0) {
      throw new Error('Empresa não encontrada')
    }
    companyId = companies[0].id
  }

  // Registrar pagamento
  const { data: payment, error } = await client
    .from('payments')
    .insert({
      company_id: companyId,
      amount: payload.amount,
      status: 'paid',
      paid_at: new Date().toISOString(),
      plan_name: payload.plan_name || 'Pagamento CRM',
      notes: payload.notes || `Pagamento recebido do CRM em ${new Date().toLocaleString('pt-BR')}`
    } as any)
    .select()
    .single()

  if (error) throw error

  return {
    action: 'payment_recorded',
    payment_id: payment.id,
    company_id: companyId,
    amount: payment.amount
  }
}
