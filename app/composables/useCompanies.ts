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
      const { data, error: fetchError } = await (supabase.from('companies') as any)
        .select(`*`)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      companies.value = (data as any[]).map(company => ({
        ...company,
        // Garantir valores padrão caso venham nulos
        plan_name: company.plan_name || 'Individual',
        monthly_price: Number(company.monthly_price || 0),
        billing_cycle: company.billing_cycle || 'Mensal',
        billing_day: company.billing_day || 1,
        tags: company.tags || []
      }))
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
        const dueDate = new Date(now.getFullYear(), now.getMonth(), billingDay)
        const dueDateStr = dueDate.toISOString().split('T')[0]

        const { data: pendingPayments } = await (supabase.from('payments') as any)
          .select('id, status')
          .eq('company_id', companyData.id)
          .in('status', ['pending', 'overdue'])

        if (pendingPayments && pendingPayments.length > 0) {
          for (const pay of pendingPayments) {
            await (supabase.from('payments') as any)
              .update({ 
                amount: company.monthly_price,
                plan_name: company.plan_name || 'Individual'
              })
              .eq('id', pay.id)
          }
        } 
        
        const { data: monthPayment } = await (supabase.from('payments') as any)
          .select('id')
          .eq('company_id', companyData.id)
          .eq('due_date', dueDateStr)
          .maybeSingle()

        if (!monthPayment) {
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
      // 1. Apagar pagamentos vinculados
      await (supabase.from('payments') as any).delete().eq('company_id', id)

      // 2. Apagar transações vinculadas (não existem mais assinaturas isoladas)
      // await (supabase.from('transactions') as any).delete().eq('company_id', id)

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
