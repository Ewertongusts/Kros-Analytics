import { ref, computed } from 'vue'

export interface Priority {
  id: string
  name: string
  label: string
  color: string
  bgColor: string
  textColor: string
  order: number
}

export const useTaskPriorities = () => {
  const priorities = ref<Priority[]>([
    {
      id: 'alta',
      name: 'alta',
      label: 'Alta',
      color: '#ef4444',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-400',
      order: 1
    },
    {
      id: 'media',
      name: 'media',
      label: 'Média',
      color: '#f59e0b',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-400',
      order: 2
    },
    {
      id: 'baixa',
      name: 'baixa',
      label: 'Baixa',
      color: '#3b82f6',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
      order: 3
    }
  ])

  const loading = ref(false)

  const fetchPriorities = async () => {
    loading.value = true
    try {
      const supabase = useSupabaseClient()
      const { data, error } = await supabase
        .from('task_priorities')
        .select('*')
        .order('order', { ascending: true })

      if (error) throw error

      if (data && data.length > 0) {
        priorities.value = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          label: p.label,
          color: p.color,
          bgColor: `bg-[${p.color}]/10`,
          textColor: `text-[${p.color}]`,
          order: p.order
        }))
      }
    } catch (error) {
      console.error('Erro ao buscar prioridades:', error)
    } finally {
      loading.value = false
    }
  }

  const getPriorityById = (id: string) => {
    return priorities.value.find(p => p.id === id)
  }

  const getPriorityColor = (priorityId: string) => {
    const priority = getPriorityById(priorityId)
    return priority?.color || '#6b7280'
  }

  const getPriorityBgClass = (priorityId: string) => {
    const priority = getPriorityById(priorityId)
    return priority?.bgColor || 'bg-gray-500/10'
  }

  const getPriorityTextClass = (priorityId: string) => {
    const priority = getPriorityById(priorityId)
    return priority?.textColor || 'text-gray-400'
  }

  const updatePriority = async (priorityId: string, updates: any) => {
    try {
      const supabase = useSupabaseClient()
      const { error } = await (supabase
        .from('task_priorities') as any)
        .update(updates)
        .eq('id', priorityId)

      if (error) throw error

      const index = priorities.value.findIndex(p => p.id === priorityId)
      if (index !== -1) {
        priorities.value[index] = { ...priorities.value[index], ...updates } as Priority
      }

      return { success: true }
    } catch (error) {
      console.error('Erro ao atualizar prioridade:', error)
      return { success: false, error }
    }
  }

  return {
    priorities,
    loading,
    fetchPriorities,
    getPriorityById,
    getPriorityColor,
    getPriorityBgClass,
    getPriorityTextClass,
    updatePriority
  }
}
