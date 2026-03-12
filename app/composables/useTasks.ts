import { ref } from 'vue'

export interface Task {
  id?: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  due_date?: string
  company_id?: string
  payment_id?: string
  assigned_to?: string
  tags?: string[]
  created_at?: string
  updated_at?: string
}

export const useTasks = () => {
  const supabase = useSupabaseClient()
  const tasks = ref<Task[]>([])
  const loading = ref(false)

  const fetchTasks = async () => {
    loading.value = true
    try {
      const { data, error } = await (supabase.from('tasks') as any)
        .select(`
          *,
          companies (name),
          payments (amount, due_date)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      tasks.value = data || []
    } catch (err: any) {
      console.error('Erro ao buscar tarefas:', err)
    } finally {
      loading.value = false
    }
  }

  const createTask = async (task: Task) => {
    loading.value = true
    try {
      const user = useSupabaseUser()
      const { data, error } = await (supabase.from('tasks') as any)
        .insert([{
          ...task,
          user_id: user.value?.id,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      await fetchTasks()
      return { success: true, data }
    } catch (err: any) {
      console.error('Erro ao criar tarefa:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    loading.value = true
    try {
      const { error } = await (supabase.from('tasks') as any)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
      await fetchTasks()
      return { success: true }
    } catch (err: any) {
      console.error('Erro ao atualizar tarefa:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const deleteTask = async (id: string) => {
    loading.value = true
    try {
      const { error } = await (supabase.from('tasks') as any)
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchTasks()
      return { success: true }
    } catch (err: any) {
      console.error('Erro ao deletar tarefa:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const moveTask = async (id: string, newStatus: 'todo' | 'in_progress' | 'done') => {
    return updateTask(id, { status: newStatus })
  }

  return {
    tasks,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    moveTask
  }
}
