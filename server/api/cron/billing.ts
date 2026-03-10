import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // Configuração básica para proteger a rota de acessos indevidos (Ideal para produção)
  // const query = getQuery(event)
  // if (query.cron_secret !== process.env.CRON_SECRET) {
  //   throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  // }

  try {
    const supabase = await serverSupabaseServiceRole(event)

    // 1. Obter a configuração do CRM
    const { data: crmSettings, error: crmErr } = await supabase
      .from('crm_settings')
      .select('*')
      .limit(1)
      .single()
      
    if (crmErr || !crmSettings?.api_url) {
      return { status: 400, message: 'CRM não configurado no banco de dados' }
    }

    // 2. Obter o template padrão (Pegaremos o mais recente para fins automáticos)
    const { data: templates } = await supabase
      .from('message_templates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)

    const template = templates?.[0]
    if (!template) {
       return { status: 400, message: 'Nenhum template de mensagem configurado' }
    }

    // 3. Buscar empresas ativas cujo vencimento (billing_day) é hoje
    const today = new Date().getDate()
    
    const { data: companies, error: compErr } = await supabase
      .from('companies')
      .select('*')
      .eq('is_active', true)
      .eq('billing_day', today)

    if (compErr || !companies?.length) {
      return { status: 200, message: `Nenhuma cobrança para o dia ${today}`, processed: 0 }
    }

    let processedCount = 0

    // 4. Compilar a mensagem e enviar para cada cliente ativo de hoje
    for (const company of companies) {
       if (!company.whatsapp) continue;

       const rawNum = company.whatsapp.replace(/\D/g, '')
       let msg = template.body

       // Compilando variáveis
       msg = msg.replace(/\{\{empresa\}\}/g, company.name)
       msg = msg.replace(/\{\{valor\}\}/g, new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(company.monthly_price || 0))
       
       const dueDate = new Date()
       dueDate.setDate(company.billing_day || today)
       msg = msg.replace(/\{\{vencimento\}\}/g, new Intl.DateTimeFormat('pt-BR').format(dueDate))
       msg = msg.replace(/\{\{plano\}\}/g, company.plan_name || 'Individual')

       // Disparo HTTP para API de Mensagens
       try {
         const response = await fetch(crmSettings.api_url, {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${crmSettings.api_token}`
           },
           body: JSON.stringify({
             number: rawNum,
             body: msg
           })
         })

         if (response.ok) {
           processedCount++
         } else {
           console.error(`Falha ao cobrar ${company.name}: HTTP ${response.status}`)
         }
       } catch(err) {
         console.error(`Erro de rede ao cobrar ${company.name}`, err)
       }
    }

    return { 
      status: 200, 
      message: 'Cobranças automáticas processadas com sucesso', 
      processed: processedCount, 
      total_found: companies.length 
    }

  } catch (error: any) {
    console.error('CRON Billing Error:', error)
    return { status: 500, message: error.message }
  }
})
