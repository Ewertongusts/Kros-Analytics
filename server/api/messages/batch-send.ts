import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const {
    payments,
    templates,
    selectedTemplateIds,
    manualMessage,
    settings,
    skipRecent,
    skipRecentDays,
    userId,
    userEmail
  } = body

  if (!payments?.length || !settings?.api_url || !selectedTemplateIds?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Dados inválidos'
    })
  }

  // Iniciar em background
  processBatchInBackground({
    payments,
    templates,
    selectedTemplateIds,
    manualMessage,
    settings,
    skipRecent,
    skipRecentDays,
    userId,
    userEmail,
    event
  }).catch(err => console.error('Erro background:', err))

  return {
    success: true,
    message: 'Campanha iniciada',
    campaignId: `batch_${Date.now()}`
  }
})

async function processBatchInBackground(params: any) {
  const { payments, templates, selectedTemplateIds, manualMessage, settings, skipRecent, skipRecentDays, userId, userEmail, event } = params

  try {
    const supabase = serverSupabaseClient(event)
    console.log('🚀 Iniciando batch com', payments.length, 'pagamentos')

    const activeTemplates = templates.filter(t => t?.id && selectedTemplateIds.includes(t.id))

    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i]
      console.log(`📱 [${i + 1}/${payments.length}]`, payment.company_name)

      try {
        const rawNum = payment.company_whatsapp?.replace(/\D/g, '') || ''
        if (!rawNum || rawNum.length < 10) continue

        let msg = manualMessage
        if (selectedTemplateIds.length > 1 && activeTemplates.length > 0) {
          const tmpl = activeTemplates[Math.floor(Math.random() * activeTemplates.length)]
          if (tmpl) msg = tmpl.body
        }

        const compiled = msg
          .replace(/\{company_name\}/g, payment.company_name)
          .replace(/\{value\}/g, payment.value)
          .replace(/\{due_date\}/g, payment.due_date)

        console.log(`📤 Enviando para ${rawNum}`)
        
        const res = await fetch(settings.api_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ number: rawNum, message: compiled })
        })

        if (!res.ok) throw new Error(`API error: ${res.statusText}`)

        console.log(`✅ Enviado para ${payment.company_name}`)

        await supabase.from('message_logs').insert({
          company_id: payment.company_id,
          company_name: payment.company_name,
          whatsapp: rawNum,
          message_body: compiled,
          status: 'Sucesso - Background',
          payment_id: payment.id
        })

        await supabase
          .from('payments')
          .update({ last_alert_at: new Date().toISOString() })
          .eq('company_id', payment.company_id)

      } catch (err: any) {
        console.error(`❌ Erro em ${payment.company_name}:`, err.message)
      }

      const delay = Math.floor(Math.random() * 15000) + 15000
      await new Promise(r => setTimeout(r, delay))
    }

    console.log('✅ Batch finalizado')
  } catch (err: any) {
    console.error('❌ Erro geral:', err)
  }
}
