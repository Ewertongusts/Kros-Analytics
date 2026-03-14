import { ref, computed } from 'vue'

export interface Category {
  id: string
  user_id: string
  name: string
  color?: string
  icon?: string
  description?: string
  created_at: string
  updated_at: string
}

export const useCategories = () => {
  const supabase = useSupabaseClient()

  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch all categories for current user
  const fetchCategories = async () => {
    loading.value = true
    error.value = null

    try {
      console.log('📍 [useCategories] fetchCategories - START')
      
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      console.log('👤 [useCategories] fetchCategories - Auth:', { user: user?.id, authError })
      
      if (!user) {
        console.log('❌ [useCategories] fetchCategories - User not authenticated')
        throw new Error('Usuário não autenticado')
      }

      console.log('🔄 [useCategories] fetchCategories - Querying categories for user:', user.id)

      const { data, error: err } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

      console.log('📥 [useCategories] fetchCategories - Query result:', {
        hasError: !!err,
        error: err ? { code: err.code, message: err.message } : null,
        dataLength: data?.length,
        data: data
      })

      if (err) throw err

      console.log('✅ [useCategories] fetchCategories - Loaded:', data?.length || 0, 'categories')
      categories.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar categorias'
      console.error('❌ [useCategories] fetchCategories - ERROR:', err)
    } finally {
      loading.value = false
    }
  }

  // Create new category using UPSERT (more permissive than INSERT)
  const createCategory = async (name: string, color?: string, icon?: string, description?: string) => {
    loading.value = true
    error.value = null

    try {
      console.log('📍 [useCategories] createCategory - START')
      
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      console.log('👤 [useCategories] createCategory - Auth:', { user: user?.id, authError })
      
      if (!user) {
        console.log('❌ [useCategories] createCategory - User not authenticated')
        throw new Error('Usuário não autenticado')
      }

      const upsertData = {
        user_id: user.id,
        name,
        color,
      }
      
      console.log('📤 [useCategories] createCategory - Upsert data:', upsertData)

      console.log('🔄 [useCategories] createCategory - Calling supabase.upsert()...')
      
      const { data, error: err, status } = await (supabase.from('categories') as any)
        .upsert([upsertData], { onConflict: 'id' })
        .select()
        .single()

      console.log('📥 [useCategories] createCategory - Response:', {
        status,
        hasError: !!err,
        error: err ? { code: err.code, message: err.message, details: err.details, hint: (err as any).hint } : null,
        data: data
      })

      if (err) {
        throw err
      }

      console.log('✅ [useCategories] createCategory - Upsert successful')
      
      console.log('🔄 [useCategories] createCategory - Reloading categories...')
      await fetchCategories()
      
      console.log('✅ [useCategories] createCategory - COMPLETE')
      return data || null
    } catch (err) {
      console.error('❌ [useCategories] createCategory - EXCEPTION:', err)
      error.value = err instanceof Error ? err.message : 'Erro ao criar categoria'
      return null
    } finally {
      loading.value = false
    }
  }

  // Update category
  const updateCategory = async (id: string, updates: Partial<Category>) => {
    loading.value = true
    error.value = null

    try {
      console.log('📍 [useCategories] updateCategory - START:', { id, updates })
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      // Criar objeto com apenas os campos permitidos
      const updatePayload: Record<string, any> = {}
      if (updates.name) updatePayload.name = updates.name
      if (updates.color) updatePayload.color = updates.color

      const { data, error: err } = await (supabase
        .from('categories') as any)
        .update(updatePayload)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      console.log('📥 [useCategories] updateCategory - Response:', { hasError: !!err, data })

      if (err) throw err

      const index = categories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categories.value[index] = data
      }

      console.log('✅ [useCategories] updateCategory - COMPLETE')
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao atualizar categoria'
      console.error('❌ [useCategories] updateCategory - ERROR:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Delete category
  const deleteCategory = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      console.log('📍 [useCategories] deleteCategory - START:', { id })
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { error: err } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      console.log('📥 [useCategories] deleteCategory - Response:', { hasError: !!err })

      if (err) throw err

      categories.value = categories.value.filter(c => c.id !== id)
      
      console.log('✅ [useCategories] deleteCategory - COMPLETE')
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao deletar categoria'
      console.error('❌ [useCategories] deleteCategory - ERROR:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Get category by ID
  const getCategoryById = (id: string) => {
    return categories.value.find(c => c.id === id)
  }

  // Computed properties
  const categoryOptions = computed(() => {
    return categories.value.map(c => ({
      label: c.name,
      value: c.id,
      color: c.color,
      icon: c.icon,
    }))
  })

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    categoryOptions,
  }
}
