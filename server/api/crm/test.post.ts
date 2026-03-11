import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { phoneNumber } = body
  
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
  const testMessage = `Teste de Conexão Kros Analytics - ${new Date().toLocaleString('pt-BR')}`
  
  try {
    const response = await fetch(crmSettings.api_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${crmSettings.api_token}`
      },
      body: JSON.stringify({
        number: cleanNumber,
        body: testMessage
      })
    })

    const responseText = `Status: ${response.status} ${response.statusText}`
    const resultStatus = response.ok ? 'success' : 'error'

    // 2. Log in database (Server side logic)
    await supabase.from('message_logs').insert({
      company_name: 'SISTEMA (TESTE API)',
      whatsapp: cleanNumber,
      message_body: testMessage,
      status: response.ok ? 'Sucesso - Teste OK (Server)' : `Erro - ${responseText}`,
      is_cron: false,
      log_type: 'test'
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
