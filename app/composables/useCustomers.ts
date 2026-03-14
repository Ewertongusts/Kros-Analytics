import { ref } from 'vue'
import { useWhatsAppConfig } from './useWhatsAppConfig'

export type Customer = {
  id?: string
  name: string
  representative_name?: string
  email?: string
  whatsapp?: string
  phone?: string
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
  tags?: string[]
  is_active?: boolean
  created_at?: string
  created_by?: string
}

export const useCustomers = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const customers = ref<Customer[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchCustomers = async () => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (err) throw err
      customers.value = data || []
      return { success: true, data }
    } catch (err: any) {
      console.error('Erro ao buscar clientes:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const fetchCustomerById = async (id: string) => {
    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single()
      
      if (err) throw err
      return { success: true, data }
    } catch (err: any) {
      console.error('Erro ao buscar cliente:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const searchCustomers = async (query: string) => {
    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('companies')
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,document.ilike.%${query}%`)
        .order('name', { ascending: true })
        .limit(20)
      
      if (err) throw err
      return { success: true, data: data || [] }
    } catch (err: any) {
      console.error('Erro ao buscar clientes:', err)
      return { success: false, error: err.message, data: [] }
    } finally {
      loading.value = false
    }
  }

  const createCustomer = async (customer: Customer) => {
    loading.value = true
    try {
      const { normalizeWhatsApp } = useWhatsAppConfig()
      
      const { data, error: err } = await (supabase
        .from('companies')
        .insert([{
          name: customer.name,
          representative_name: customer.representative_name || customer.name,
          email: customer.email || null,
          phone: customer.phone || null,
          whatsapp: customer.whatsapp ? normalizeWhatsApp(customer.whatsapp) : null,
          document: customer.document || null,
          birthday: customer.birthday || null,
          segment: customer.segment || null,
          sales_rep: customer.sales_rep || null,
          website: customer.website || null,
          address_zipcode: customer.address_zipcode || null,
          address_street: customer.address_street || null,
          address_number: customer.address_number || null,
          address_complement: customer.address_complement || null,
          address_neighborhood: customer.address_neighborhood || null,
          address_city: customer.address_city || null,
          address_state: customer.address_state || null,
          tags: customer.tags || [],
          is_active: customer.is_active !== false,
          created_by: user.value?.id,
          created_at: new Date().toISOString()
        }] as any)
        .select()
        .single() as any)
      
      if (err) throw err
      customers.value.unshift(data)
      return { success: true, data }
    } catch (err: any) {
      console.error('Erro ao criar cliente:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    loading.value = true
    try {
      const { normalizeWhatsApp } = useWhatsAppConfig()
      
      // Normalizar WhatsApp se estiver sendo atualizado
      const normalizedUpdates = {
        ...updates,
        whatsapp: updates.whatsapp ? normalizeWhatsApp(updates.whatsapp) : updates.whatsapp
      }
      
      const { data, error: err } = await (supabase as any)
        .from('companies')
        .update(normalizedUpdates)
        .eq('id', id)
        .select()
        .single()
      
      if (err) throw err
      const index = customers.value.findIndex(c => c.id === id)
      if (index !== -1) {
        customers.value[index] = data
      }
      return { success: true, data }
    } catch (err: any) {
      console.error('Erro ao atualizar cliente:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const deleteCustomer = async (id: string) => {
    loading.value = true
    try {
      const { error: err } = await supabase
        .from('companies')
        .delete()
        .eq('id', id)
      
      if (err) throw err
      customers.value = customers.value.filter(c => c.id !== id)
      return { success: true }
    } catch (err: any) {
      console.error('Erro ao remover cliente:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const updateCustomerTags = async (id: string, tags: string[]) => {
    return updateCustomer(id, { tags })
  }

  const toggleCustomerStatus = async (id: string, isActive: boolean) => {
    return updateCustomer(id, { is_active: isActive })
  }

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    fetchCustomerById,
    searchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    updateCustomerTags,
    toggleCustomerStatus
  }
}
