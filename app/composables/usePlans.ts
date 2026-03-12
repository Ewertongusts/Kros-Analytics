import { ref, onMounted } from 'vue'

export type PlanDefinition = {
  id?: string
  name: string
  type?: string
  category?: string
  description?: string
  price: number
  billing_cycle: string
  created_at?: string
}

export const usePlans = () => {
  const supabase = useSupabaseClient()
  const plans = ref<PlanDefinition[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchPlans = async () => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('plans')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (err) throw err
      plans.value = data || []
    } catch (err: any) {
      console.error('Erro ao buscar planos:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const createPlan = async (plan: PlanDefinition) => {
    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('plans')
        .insert([{
          name: plan.name,
          type: plan.type || 'Plano Recorrente',
          category: plan.category || null,
          description: plan.description || null,
          price: plan.price,
          billing_cycle: plan.billing_cycle
        }] as any)
        .select()
        .single()
      
      if (err) throw err
      plans.value.unshift(data)
      return data
    } catch (err: any) {
      console.error('Erro ao criar plano:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePlan = async (id: string, updates: Partial<PlanDefinition>) => {
    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('plans')
        // @ts-ignore
        .update(updates as any)
        .eq('id', id)
        .select()
        .single()
      
      if (err) throw err
      const index = plans.value.findIndex(p => p.id === id)
      if (index !== -1) {
        plans.value[index] = data
      }
      return data
    } catch (err: any) {
      console.error('Erro ao atualizar plano:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deletePlan = async (id: string) => {
    loading.value = true
    try {
      const { error: err } = await supabase
        .from('plans')
        .delete()
        .eq('id', id)
      
      if (err) throw err
      plans.value = plans.value.filter(p => p.id !== id)
    } catch (err: any) {
      console.error('Erro ao remover plano:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchPlans()
  })

  return {
    plans,
    loading,
    error,
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan
  }
}
