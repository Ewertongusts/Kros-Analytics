import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  
  if (method === 'GET') {
    return await getWebhookConfigs(event)
  } else if (method === 'POST') {
    return await createWebhookConfig(event)
  } else if (method === 'PUT') {
    return await updateWebhookConfig(event)
  } else if (method === 'DELETE') {
    return await deleteWebhookConfig(event)
  }
})

const getWebhookConfigs = async (event: any) => {
  try {
    const supabase = await serverSupabaseClient(event)
    
    const { data, error } = await supabase
      .from('webhook_configs')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return data || []
  } catch (err: any) {
    console.error('Erro ao buscar webhooks:', err)
    return []
  }
}

const createWebhookConfig = async (event: any) => {
  try {
    const body = await readBody(event)
    const supabase = await serverSupabaseClient(event)
    
    // Gerar token seguro
    const token = generateSecureToken()
    
    const { error } = await supabase
      .from('webhook_configs')
      .insert({
        name: body.name,
        url: body.url,
        event_types: body.event_types,
        token: token,
        active: true
      } as any)
    
    if (error) {
      console.error('Erro ao inserir webhook:', error)
      throw error
    }
    
    return {
      success: true,
      message: 'Webhook criado com sucesso',
      token: token
    }
  } catch (err: any) {
    console.error('Erro em createWebhookConfig:', err)
    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Erro ao criar webhook'
    })
  }
}

const updateWebhookConfig = async (event: any) => {
  try {
    const body = await readBody(event)
    const supabase = await serverSupabaseClient(event)
    
    const { error } = await supabase
      .from('webhook_configs')
      .update({
        name: body.name,
        url: body.url,
        event_types: body.event_types,
        active: body.active
      } as any)
      .eq('id', body.id)
    
    if (error) throw error
    
    return { success: true }
  } catch (err: any) {
    console.error('Erro em updateWebhookConfig:', err)
    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Erro ao atualizar webhook'
    })
  }
}

const deleteWebhookConfig = async (event: any) => {
  try {
    const body = await readBody(event)
    const supabase = await serverSupabaseClient(event)
    
    const { error } = await supabase
      .from('webhook_configs')
      .delete()
      .eq('id', body.id)
    
    if (error) throw error
    
    return { success: true }
  } catch (err: any) {
    console.error('Erro em deleteWebhookConfig:', err)
    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Erro ao deletar webhook'
    })
  }
}

const generateSecureToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}
