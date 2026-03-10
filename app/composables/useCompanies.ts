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
        .select(`
          *,
          tags,
          subscriptions (
            plan_name,
            monthly_price,
            is_active,
            billing_cycle,
            billing_day,
            instalment_count,
            instalment_value
          )
        `)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      companies.value = (data as any[]).map(company => ({
        ...company,
        plan_name: company.subscriptions?.[0]?.plan_name || 'Nenhum',
        monthly_price: company.subscriptions?.[0]?.monthly_price || 0,
        billing_cycle: company.subscriptions?.[0]?.billing_cycle || 'Mensal',
        billing_day: company.subscriptions?.[0]?.billing_day || 1,
        instalment_count: company.subscriptions?.[0]?.instalment_count || 1,
        instalment_value: company.subscriptions?.[0]?.instalment_value || 0
      }))
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const upsertCompany = async (company: Partial<Company>) => {
    loading.value = true
    try {
      const { data: companyData, error: companyError } = await (supabase.from('companies') as any)
        .upsert({
          id: company.id || undefined,
          name: company.name,
          is_active: company.is_active,
          email: company.email,
          whatsapp: company.whatsapp,
          representative_name: company.representative_name,
          notes: company.notes,
          tags: company.tags || []
        })
        .select()
        .single()

      if (companyError) throw companyError

      if (company.plan_name || company.monthly_price) {
        const { error: subError } = await (supabase.from('subscriptions') as any)
          .upsert({
            company_id: companyData.id,
            plan_name: company.plan_name,
            monthly_price: company.monthly_price,
            is_active: company.is_active,
            billing_cycle: company.billing_cycle,
            billing_day: company.billing_day,
            instalment_count: company.instalment_count,
            instalment_value: company.instalment_value,
            start_date: companyData.created_at || new Date().toISOString()
          })

        if (subError) throw subError
      }

      await fetchCompanies()
      return { success: true }
    } catch (e: any) {
      error.value = e.message
      // Tratamento para nome duplicado
      if (e.code === '23505' || e.message?.includes('companies_name_unique')) {
        return { success: false, error: 'Já existe uma empresa cadastrada com este nome.' }
      }
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  const deleteCompany = async (id: string) => {
    loading.value = true
    try {
      const { error: deleteError } = await (supabase.from('companies') as any)
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      await fetchCompanies()
      return { success: true }
    } catch (e: any) {
      error.value = e.message
      if (e.message?.includes('violates foreign key constraint')) {
        return { success: false, error: 'Não é possível excluir: existem dados vinculados a esta empresa.' }
      }
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
