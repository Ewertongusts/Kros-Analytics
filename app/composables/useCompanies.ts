import { ref } from 'vue'

export interface Company {
  id?: string
  name: string
  is_active: boolean
  created_at?: string
  plan_name?: string
  monthly_price?: number
  email?: string
  whatsapp?: string
  phone?: string
  representative_name?: string
  notes?: string
  billing_cycle?: string
  billing_day?: number
  instalment_count?: number
  instalment_value?: number
  tags?: string[]
  ltv?: number
  document?: string
  birthday?: string
  segment?: string
  sales_rep?: string
  website?: string
  address_zipcode?: string
  address_street?: string
  address_number?: string
  address_complement?: string
  address_neighborhood?: string
  address_city?: string
  address_state?: string
}

export const useCompanies = () => {
  const supabase = useSupabaseClient()
  const companies = ref<Company[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchCompanies = async () => {
    loading.value = true
    error.value = null
    console.log('🔄 [useCompanies] Iniciando fetch de contatos...')
    try {
      // Buscamos as empresas - query simples e rápida
      const { data, error: fetchError } = await (supabase.from('companies') as any)
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('❌ [useCompanies] Erro do Supabase:', fetchError)
        throw fetchError
      }
      
      console.log('✅ [useCompanies] Dados recebidos do Supabase:', data?.length || 0, 'contatos')
      
      // Validação: garantir que temos dados
      if (!data || !Array.isArray(data)) {
        console.error('❌ [useCompanies] Dados inválidos:', typeof data, Array.isArray(data))
        throw new Error('Dados inválidos retornados do Supabase')
      }
      
      // Processar dados sem fazer queries adicionais
      const processedCompanies = (data as any[]).map((company) => ({
        ...company,
        plan_name: company.plan_name || 'Individual',
        monthly_price: Number(company.monthly_price || 0),
        billing_cycle: company.billing_cycle || 'Mensal',
        billing_day: company.billing_day || 1,
        tags: company.tags || [],
        ltv: 0 // LTV será calculado quando necessário
      }))
      
      // Validação: garantir que temos pelo menos um array
      if (!Array.isArray(processedCompanies)) {
        console.error('❌ [useCompanies] Erro ao processar companies - não é array')
        throw new Error('Erro ao processar companies')
      }
      
      // Atribuir dados de forma segura
      companies.value = processedCompanies
      console.log('✅ [useCompanies] Contatos carregados:', companies.value.length)
      console.log('✅ [useCompanies] Primeiro contato:', companies.value[0]?.name || 'N/A')
      
      // Validação final: confirmar que dados foram atribuídos
      if (!companies.value || companies.value.length === 0) {
        console.warn('⚠️ [useCompanies] Nenhuma empresa encontrada no banco')
      }
    } catch (e: any) {
      console.error('❌ [useCompanies] Erro ao buscar empresas:', e.message)
      error.value = e.message
      // Garantir que companies nunca fica undefined
      if (!companies.value) {
        companies.value = []
      }
    } finally {
      loading.value = false
    }
  }

  const upsertCompany = async (company: Partial<Company>) => {
    loading.value = true
    error.value = null
    console.log('Iniciando upsert da empresa:', company)
    
    try {
      const user = useSupabaseUser()
      
      const payload: any = {
        name: company.name,
        is_active: company.is_active,
        email: company.email || null,
        whatsapp: company.whatsapp,
        phone: company.phone || null,
        representative_name: company.representative_name,
        notes: company.notes || null,
        tags: company.tags || [],
        plan_name: company.plan_name || null,
        monthly_price: company.monthly_price || null,
        billing_cycle: company.billing_cycle || null,
        billing_day: company.billing_day || null,
        document: company.document || null,
        birthday: company.birthday || null,
        segment: company.segment || null,
        sales_rep: company.sales_rep || null,
        website: company.website || null,
        address_zipcode: company.address_zipcode || null,
        address_street: company.address_street || null,
        address_number: company.address_number || null,
        address_complement: company.address_complement || null,
        address_neighborhood: company.address_neighborhood || null,
        address_city: company.address_city || null,
        address_state: company.address_state || null
      }

      // Se for edição, mandamos o ID. Se for nova, deixamos o banco gerar.
      if (company.id) {
        payload.id = company.id
      }

      // Tenta anexar o user_id se estiver logado para evitar falha de segurança
      if (user.value) {
        payload.user_id = user.value.id
      }

      const isNew = !company.id
      const { data: companyData, error: companyError } = await (supabase.from('companies') as any)
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single()

      if (companyError) {
        console.error('Erro retornado pelo Supabase (Companies):', companyError)
        throw companyError
      }

      console.log('Empresa salva com sucesso:', companyData)

      // Enviar webhook para CRM
      try {
        const eventType = isNew ? 'customer.created' : 'customer.updated'
        await $fetch('/api/webhooks/send', {
          method: 'POST',
          body: {
            event_type: eventType,
            payload: {
              id: companyData.id,
              name: companyData.name,
              email: companyData.email,
              whatsapp: companyData.whatsapp,
              phone: companyData.phone,
              representative_name: companyData.representative_name,
              document: companyData.document,
              is_active: companyData.is_active,
              plan_name: companyData.plan_name,
              monthly_price: companyData.monthly_price,
              tags: companyData.tags,
              created_at: companyData.created_at
            }
          }
        })
        console.log(`✅ Webhook enviado: ${eventType}`)
      } catch (webhookError: any) {
        console.warn(`⚠️ Erro ao enviar webhook: ${webhookError.message}`)
        // Não falhar a operação se o webhook falhar
      }

      // Se empresa foi inativada, cancelar cobranças pendentes
      if (!company.is_active) {
        await (supabase.from('payments') as any)
          .update({ status: 'cancelled' })
          .eq('company_id', companyData.id)
          .eq('status', 'pending')
      }

      // Sincronizar cobranças
      if (company.is_active && company.monthly_price && Number(company.monthly_price) > 0) {
        const now = new Date()
        const billingDay = company.billing_day || 1
        
        // Determina os limites do mês atual para evitar criar 2 cobranças no mesmo mês
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth()
        
        // Formatação direta de data local (YYYY-MM-DD) sem interferência do UTC
        const mm = String(currentMonth + 1).padStart(2, '0')
        const dd = String(billingDay).padStart(2, '0')
        const dueDateStr = `${currentYear}-${mm}-${dd}`
        
        // Limites do mês para busca
        const startOfMonthStr = `${currentYear}-${mm}-01`
        
        const nextY = currentMonth === 11 ? currentYear + 1 : currentYear
        const nextM = String((currentMonth + 1) % 12 + 1).padStart(2, '0')
        const nextMonthStr = `${nextY}-${nextM}-01`

        // 1. Atualizar amount de TODOS os pendentes e data do(s) MÊS ATUAL
        const { data: pendingPayments } = await (supabase.from('payments') as any)
          .select('id, status, due_date')
          .eq('company_id', companyData.id)
          .in('status', ['pending', 'overdue'])

        if (pendingPayments && pendingPayments.length > 0) {
          for (const pay of pendingPayments) {
            const isCurrentMonth = pay.due_date >= startOfMonthStr && pay.due_date < nextMonthStr
            
            const updatePayload: any = { 
              amount: company.monthly_price,
              plan_name: company.plan_name || 'Individual'
            }
            
            // Se for deste mês e o cliente trocou de dia, move a data do boleto
            if (isCurrentMonth) {
               updatePayload.due_date = dueDateStr
            }

            await (supabase.from('payments') as any)
              .update(updatePayload)
              .eq('id', pay.id)
          }
        } 
        
        // 2. Verifica se JÁ EXISTE QUALQUER pagamento gerado neste mês (mesmo que já pago)
        const { data: monthPayment } = await (supabase.from('payments') as any)
          .select('id')
          .eq('company_id', companyData.id)
          .gte('due_date', startOfMonthStr)
          .lt('due_date', nextMonthStr)
          .limit(1)

        // Só cria um novo pendente se o mês estiver complementamente limpo de pagamentos
        if (!monthPayment || monthPayment.length === 0) {
          const { data: newPayment } = await (supabase.from('payments') as any).insert({
            company_id: companyData.id,
            amount: company.monthly_price,
            status: 'pending',
            due_date: dueDateStr,
            plan_name: company.plan_name || 'Individual'
          }).select().single()

          // Enviar webhook para CRM quando assinatura é gerada
          try {
            await $fetch('/api/webhooks/send', {
              method: 'POST',
              body: {
                event_type: 'subscription.created',
                payload: {
                  id: newPayment?.id,
                  company_id: companyData.id,
                  company_name: companyData.name,
                  representative_name: companyData.representative_name,
                  plan_name: company.plan_name || 'Individual',
                  amount: company.monthly_price,
                  due_date: dueDateStr,
                  status: 'pending',
                  created_at: new Date().toISOString()
                }
              }
            })
            console.log('✅ Webhook enviado: subscription.created')
          } catch (webhookError: any) {
            console.warn(`⚠️ Erro ao enviar webhook: ${webhookError.message}`)
          }
        }
      }

      await fetchCompanies()
      
      // Registrar no histórico
      const actionType = isNew ? 'company_created' : 'company_updated'
      const description = isNew 
        ? `Cliente "${companyData.representative_name || companyData.name}" foi cadastrado`
        : `Cliente "${companyData.representative_name || companyData.name}" foi atualizado`
      
      await supabase.from('payment_history').insert({
        company_id: companyData.id,
        action_type: actionType,
        description: description,
        user_id: user.value?.id,
        user_name: user.value?.email?.split('@')[0] || 'Sistema',
        metadata: {
          company_name: companyData.name,
          representative_name: companyData.representative_name,
          whatsapp: companyData.whatsapp,
          email: companyData.email,
          plan_name: companyData.plan_name,
          monthly_price: companyData.monthly_price,
          is_active: companyData.is_active,
          tags: companyData.tags
        }
      })
      
      return { success: true }
    } catch (e: any) {
      console.error('FATAL ERROR em upsertCompany:', e)
      error.value = e.message
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  const deleteCompany = async (id: string) => {
    loading.value = true
    try {
      // Buscar dados da empresa antes de deletar para o log
      const { data: companyData } = await (supabase.from('companies') as any)
        .select('name, representative_name, whatsapp, email, id')
        .eq('id', id)
        .single()
      
      const user = useSupabaseUser()
      
      // 1. Apagar pagamentos vinculados
      await (supabase.from('payments') as any).delete().eq('company_id', id)

      // 2. Apagar transações vinculadas (não existem mais assinaturas isoladas)
      // await (supabase.from('transactions') as any).delete().eq('company_id', id)

      // 3. Registrar no histórico antes de deletar
      await supabase.from('payment_history').insert({
        company_id: id,
        action_type: 'company_deleted',
        description: `Cliente "${companyData?.representative_name || companyData?.name || 'Desconhecido'}" foi excluído`,
        user_id: user.value?.id,
        user_name: user.value?.email?.split('@')[0] || 'Sistema',
        metadata: {
          company_name: companyData?.name,
          representative_name: companyData?.representative_name,
          whatsapp: companyData?.whatsapp,
          email: companyData?.email,
          deleted_at: new Date().toISOString()
        }
      })

      // 4. Agora apagar a empresa
      const { error: deleteError } = await (supabase.from('companies') as any)
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // 5. Enviar webhook para CRM
      try {
        await $fetch('/api/webhooks/send', {
          method: 'POST',
          body: {
            event_type: 'customer.deleted',
            payload: {
              id: companyData?.id,
              name: companyData?.name,
              representative_name: companyData?.representative_name,
              email: companyData?.email,
              whatsapp: companyData?.whatsapp,
              deleted_at: new Date().toISOString()
            }
          }
        })
        console.log('✅ Webhook enviado: customer.deleted')
      } catch (webhookError: any) {
        console.warn(`⚠️ Erro ao enviar webhook: ${webhookError.message}`)
        // Não falhar a operação se o webhook falhar
      }

      await fetchCompanies()
      return { success: true }
    } catch (e: any) {
      error.value = e.message
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  return {
    companies,
    loading,
    error,
    fetchCompanies,
    upsertCompany,
    deleteCompany
  }
}
