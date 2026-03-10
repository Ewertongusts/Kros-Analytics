import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
     const body = await readBody(event)
     
     // 1. Obter configs do Supabase para ter a URL da API e Token com segurança
     const supabase = await serverSupabaseServiceRole(event)
     const { data: crmSettings, error: crmErr } = await supabase
      .from('crm_settings')
      .select('*')
      .limit(1)
      .single()
      
     const settings = crmSettings as any
      
     if (crmErr || !settings?.api_url) {
        throw createError({ statusCode: 400, statusMessage: 'CRM não configurado no banco de dados' })
     }
     
     // 2. Disparar a requisição de dentro do nosso servidor usando as configs
     const response = await fetch(settings.api_url, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${settings.api_token}`
       },
       body: JSON.stringify(body)
     })

     if (!response.ok) {
        const errorText = await response.text()
        console.error('Erro retornado pela API do Legendaryhub:', errorText)
        throw createError({ statusCode: response.status, statusMessage: `Erro da API externa: ${response.statusText}` })
     }

     // 3. Sucesso!
     return { success: true }
  } catch (error: any) {
     console.error('Erro no Proxy Send Message:', error)
     throw createError({ statusCode: 500, statusMessage: error.message || 'Server error' })
  }
})
