import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  
  if (!formData) {
    throw createError({
      statusCode: 400,
      message: 'Nenhum arquivo enviado'
    })
  }

  const phoneNumberField = formData.find(field => field.name === 'phoneNumber')
  const imageField = formData.find(field => field.name === 'image')

  if (!phoneNumberField || !imageField) {
    throw createError({
      statusCode: 400,
      message: 'Campos obrigatórios ausentes'
    })
  }

  const phoneNumber = phoneNumberField.data.toString()
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
  const testMessage = `Teste de Envio de Arquivo - ${new Date().toLocaleString('pt-BR')}`
  
  try {
    // Valida tamanho do arquivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024
    if (imageField.data.length > maxSize) {
      throw new Error('Arquivo muito grande. Tamanho máximo: 5MB')
    }

    // Converte a imagem para base64 data URL
    const base64 = imageField.data.toString('base64')
    const mimeType = imageField.type || 'image/jpeg'
    const dataUrl = `data:${mimeType};base64,${base64}`

    // Envia via API usando JSON com data URL
    const response = await fetch(crmSettings.api_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${crmSettings.api_token}`
      },
      body: JSON.stringify({
        number: cleanNumber,
        body: testMessage,
        url: dataUrl
      })
    })

    const responseText = `Status: ${response.status} ${response.statusText}`
    const resultStatus = response.ok ? 'success' : 'error'

    // 2. Log in database
    await supabase.from('message_logs').insert({
      company_name: 'SISTEMA (TESTE ARQUIVO)',
      whatsapp: cleanNumber,
      message_body: `${testMessage}\nArquivo: ${imageField.filename}`,
      status: response.ok ? 'Sucesso - Teste Arquivo OK' : `Erro - ${responseText}`,
      is_cron: false,
      log_type: 'test_file'
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
    console.error('Erro ao processar arquivo:', err)
    const errorMsg = err.message || 'Falha na conexão com a API'
    
    await supabase.from('crm_settings').update({
      last_test_status: 'error',
      last_test_at: new Date().toISOString(),
      last_test_response: errorMsg
    }).eq('id', crmSettings.id)

    throw createError({
      statusCode: 500,
      message: errorMsg
    })
  }
})
