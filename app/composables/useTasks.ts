import { ref, watch } from 'vue'

export interface Task {
  id?: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'alta' | 'media' | 'baixa'
  due_date?: string
  company_id?: string
  assigned_to?: string
  column_id?: string
  position?: number
  created_at?: string
  updated_at?: string
}

export const useTasks = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const tasks = ref<Task[]>([])
  const loading = ref(false)

  const fetchTasks = async () => {
    loading.value = true
    try {
      const query = (supabase.from('tasks') as any)
        .select('*')
        .order('status', { ascending: true })
        .order('position', { ascending: true })

      const { data, error } = await query

      if (error) throw error
      
      tasks.value = data || []
    } catch (err: any) {
      // Erro ao buscar tarefas
    } finally {
      loading.value = false
    }
  }

  const createTask = async (task: Task) => {
    try {
      const userId = user.value?.id || user.value?.sub
      
      if (!userId) {
        throw new Error('Usuário não autenticado')
      }

      const taskData = {
        title: task.title,
        description: task.description || null,
        status: task.status || 'todo',
        priority: task.priority || 'media',
        due_date: task.due_date ? new Date(task.due_date).toISOString() : null,
        company_id: task.company_id || null,
        assigned_to: task.assigned_to || null,
        column_id: task.column_id || null,
        position: task.position || 0,
        created_by: userId,
        created_at: new Date().toISOString()
      }

      const { data, error } = await (supabase.from('tasks') as any)
        .insert([taskData])
        .select()
        .single()

      if (error) throw error
      
      tasks.value.push(data)
      return { success: true, data }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.description !== undefined) updateData.description = updates.description || null
      if (updates.status !== undefined) updateData.status = updates.status
      if (updates.priority !== undefined) updateData.priority = updates.priority
      if (updates.due_date !== undefined) updateData.due_date = updates.due_date ? new Date(updates.due_date).toISOString() : null
      if (updates.company_id !== undefined) updateData.company_id = updates.company_id || null
      if (updates.assigned_to !== undefined) updateData.assigned_to = updates.assigned_to || null
      if (updates.position !== undefined) updateData.position = updates.position
      if (updates.column_id !== undefined) updateData.column_id = updates.column_id || null

      const { error } = await (supabase.from('tasks') as any)
        .update(updateData)
        .eq('id', id)

      if (error) throw error
      
      return { success: true }
    } catch (err: any) {
      console.error('Erro ao atualizar tarefa:', err)
      return { success: false, error: err.message }
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const { error } = await (supabase.from('tasks') as any)
        .delete()
        .eq('id', id)

      if (error) throw error
      
      return { success: true }
    } catch (err: any) {
      console.error('Erro ao deletar tarefa:', err)
      return { success: false, error: err.message }
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
