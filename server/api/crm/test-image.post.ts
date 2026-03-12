import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { phoneNumber, imageUrl } = body
  
  const supabase = await serverSupabaseClient(event)
  
  // 1. Get CRM Settings
  const { data: crmSettings, error: crmError } = await supabase
    .from('crm_settings')
    .select('*')
    .limit(1)
    .single()

  if (crmError || !crmSettings || !crmSettings.api_url || !crmSettings.api_token) {
    throw createError({
      statusCode: 400,
      message: 'Configurações de API inválidas ou incompletas.'
    })
  }

  const cleanNumber = phoneNumber.replace(/\D/g, '')
  const testMessage = `Teste de Envio de Imagem - ${new Date().toLocaleString('pt-BR')}`
  
  try {
    // Cria FormData para enviar imagem
    const formData = new FormData()
    formData.append('number', cleanNumber)
    formData.append('body', testMessage)
    formData.append('url', imageUrl)

    const response = await fetch(crmSettings.api_url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${crmSettings.api_token}`
      },
      body: formData
    })

    const responseText = `Status: ${response.status} ${response.statusText}`
    const resultStatus = response.ok ? 'success' : 'error'

    // 2. Log in database
    await supabase.from('message_logs').insert({
      company_name: 'SISTEMA (TESTE IMAGEM)',
      whatsapp: cleanNumber,
      message_body: `${testMessage}\nImagem: ${imageUrl}`,
      status: response.ok ? 'Sucesso - Teste Imagem OK' : `Erro - ${responseText}`,
      is_cron: false,
      log_type: 'test_image'
    })

    // 3. Update CrmSettings with last test result
    await supabase.from('crm_settings').update({
      last_test_status: resultStatus,
      last_test_at: new Date().toISOString(),
      last_test_response: responseText
    }).eq('id', crmSettings.id)

    return {
      success: response.ok,
      status: response.status,
      message: responseText
    }
  } catch (err: any) {
    const errorMsg = err.message || 'Falha na conexão com a API'
    
    await supabase.from('crm_settings').update({
      last_test_status: 'error',
      last_test_at: new Date().toISOString(),
      last_test_response: errorMsg
    }).eq('id', crmSettings.id)

    return {
      success: false,
      message: errorMsg
    }
  }
})
