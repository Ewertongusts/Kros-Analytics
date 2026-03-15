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
      console.log('🔍 Iniciando busca de tarefas...')
      console.log('👤 Usuário atual:', user.value?.id)
      const query = (supabase.from('tasks') as any)
        .select('*')
        .order('status', { ascending: true })
        .order('position', { ascending: true })

      const { data, error } = await query

      if (error) {
        console.error('❌ Erro ao buscar tarefas:', error)
        throw error
      }
      console.log('✅ Tarefas recebidas do banco:', data?.length || 0, data)
      tasks.value = data || []
      console.log('📦 tasks.value atualizado:', tasks.value.length)
    } catch (err: any) {
      console.error('❌ Erro ao buscar tarefas:', err)
    } finally {
      loading.value = false
    }
  }

  const createTask = async (task: Task) => {
    loading.value = true
    try {
      console.log('👤 Verificando usuário...', user.value)
      
      // O ID do usuário pode estar em user.value.id ou user.value.sub
      const userId = user.value?.id || user.value?.sub
      
      if (!userId) {
        console.error('❌ Usuário não autenticado - ID não encontrado')
        throw new Error('Usuário não autenticado')
      }

      console.log('✅ ID do usuário encontrado:', userId)

      const taskData = {
        title: task.title,
        description: task.description || null,
        status: task.status || 'todo',
        priority: task.priority || 'media',
        due_date: task.due_date ? new Date(task.due_date).toISOString() : null,
        company_id: task.company_id || null,
        assigned_to: task.assigned_to || null,
        created_by: userId,
        created_at: new Date().toISOString()
      }

      console.log('📤 Enviando tarefa para o banco:', taskData)

      const { data, error } = await (supabase.from('tasks') as any)
        .insert([taskData])
        .select()
        .single()

      if (error) {
        console.error('❌ Erro do Supabase ao criar tarefa:', error)
        throw error
      }
      
      console.log('✅ Tarefa criada com sucesso:', data)
      await fetchTasks()
      return { success: true, data }
    } catch (err: any) {
      console.error('❌ Erro ao criar tarefa:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    loading.value = true
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

      const { error } = await (supabase.from('tasks') as any)
        .update(updateData)
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
