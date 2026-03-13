export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  
  if (method === 'GET') {
    return await getWebhookConfigs()
  } else if (method === 'POST') {
    return await createWebhookConfig(event)
  } else if (method === 'PUT') {
    return await updateWebhookConfig(event)
  } else if (method === 'DELETE') {
    return await deleteWebhookConfig(event)
  }
})

const getWebhookConfigs = async () => {
  const supabase = useSupabaseClient()
  
  const { data, error } = await supabase
    .from('webhook_configs')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  
  return data
}

const createWebhookConfig = async (event: any) => {
  const body = await readBody(event)
  const supabase = useSupabaseClient()
  
  // Gerar token seguro
  const token = generateSecureToken()
  
  const { data, error } = await supabase
    .from('webhook_configs')
    .insert({
      name: body.name,
      url: body.url,
      event_types: body.event_types,
      token: token,
      active: true
    })
    .select()
    .single()
  
  if (error) throw error
  
  return {
    ...data,
    token: token // Retornar token apenas na criação
  }
}

const updateWebhookConfig = async (event: any) => {
  const body = await readBody(event)
  const supabase = useSupabaseClient()
  
  const { data, error } = await supabase
    .from('webhook_configs')
    .update({
      name: body.name,
      url: body.url,
      event_types: body.event_types,
      active: body.active
    })
    .eq('id', body.id)
    .select()
    .single()
  
  if (error) throw error
  
  return data
}

const deleteWebhookConfig = async (event: any) => {
  const body = await readBody(event)
  const supabase = useSupabaseClient()
  
  const { error } = await supabase
    .from('webhook_configs')
    .delete()
    .eq('id', body.id)
  
  if (error) throw error
  
  return { success: true }
}

const generateSecureToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}
