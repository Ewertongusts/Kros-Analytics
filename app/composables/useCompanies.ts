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
  representative_name?: string
  notes?: string
  billing_cycle?: string
  billing_day?: number
  instalment_count?: number
  instalment_value?: number
  tags?: string[]
  ltv?: number
}

export const useCompanies = () => {
  const supabase = useSupabaseClient()
  const companies = ref<Company[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchCompanies = async () => {
    loading.value = true
    error.value = null
    try {
      // Buscamos as empresas e seus pagamentos marcados como 'paid' para o LTV
      const { data, error: fetchError } = await (supabase.from('companies') as any)
        .select(`
          *,
          payments (
            amount,
            status
          )
        `)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      
      companies.value = (data as any[]).map(company => {
        // Calcula o LTV: soma de todos os pagamentos com status 'paid'
        const ltv = (company.payments || [])
          .filter((p: any) => p.status === 'paid')
          .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0)

        return {
          ...company,
          plan_name: company.plan_name || 'Individual',
          monthly_price: Number(company.monthly_price || 0),
          billing_cycle: company.billing_cycle || 'Mensal',
          billing_day: company.billing_day || 1,
          tags: company.tags || [],
          ltv
        }
      })
    } catch (e: any) {
      console.error('Erro ao buscar empresas:', e.message)
      error.value = e.message
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
        email: company.email,
        whatsapp: company.whatsapp,
        representative_name: company.representative_name,
        notes: company.notes,
        tags: company.tags || [],
        plan_name: company.plan_name,
        monthly_price: company.monthly_price,
        billing_cycle: company.billing_cycle,
        billing_day: company.billing_day
      }

      // Se for edição, mandamos o ID. Se for nova, deixamos o banco gerar.
      if (company.id) {
        payload.id = company.id
      }

      // Tenta anexar o user_id se estiver logado para evitar falha de segurança
      if (user.value) {
        payload.user_id = user.value.id
      }

      const { data: companyData, error: companyError } = await (supabase.from('companies') as any)
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single()

      if (companyError) {
        console.error('Erro retornado pelo Supabase (Companies):', companyError)
        throw companyError
      }

      console.log('Empresa salva com sucesso:', companyData)

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
          await (supabase.from('payments') as any).insert({
            company_id: companyData.id,
            amount: company.monthly_price,
            status: 'pending',
            due_date: dueDateStr,
            plan_name: company.plan_name || 'Individual'
          })
        }
      }

      await fetchCompanies()
      
      // Registrar no histórico
      const isNew = !company.id
      await supabase.from('payment_history').insert({
        company_id: companyData.id,
        action_type: isNew ? 'company_created' : 'company_updated',
        description: isNew 
          ? `Cliente "${companyData.representative_name || companyData.name}" foi cadastrado`
          : `Cliente "${companyData.representative_name || companyData.name}" foi atualizado`,
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
        .select('name, representative_name, whatsapp, email')
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
