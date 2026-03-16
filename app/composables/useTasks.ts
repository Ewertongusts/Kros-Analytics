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
      console.log('🔄 [fetchTasks] Iniciando busca de tarefas')
      
      // Verificar autenticação de múltiplas formas
      const user = useSupabaseUser()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      console.log('👤 [fetchTasks] useSupabaseUser():', user.value?.id)
      console.log('👤 [fetchTasks] supabase.auth.getUser():', authUser?.id)
      
      // Se não há usuário autenticado, tentar buscar sem filtro de usuário
      if (!user.value && !authUser) {
        console.warn('⚠️ [fetchTasks] Usuário não autenticado, tentando buscar todas as tarefas')
      }

      const query = (supabase.from('tasks') as any)
        .select('*')
        .order('status', { ascending: true })
        .order('position', { ascending: true })

      console.log('📡 [fetchTasks] Executando query no Supabase')
      const { data, error } = await query

      if (error) {
        console.error('❌ [fetchTasks] Erro do Supabase:', error)
        throw error
      }
      
      console.log('✅ [fetchTasks] Dados recebidos:', data?.length || 0, 'tarefas')
      console.log('📋 [fetchTasks] Primeira tarefa:', data?.[0])
      tasks.value = data || []
    } catch (err: any) {
      console.error('❌ [fetchTasks] Erro geral:', err)
      // Erro ao buscar tarefas
    } finally {
      loading.value = false
      console.log('🏁 [fetchTasks] Busca finalizada')
    }
  }

  const createTask = async (task: Task) => {
    try {
      console.log('🆕 [createTask] Iniciando criação de tarefa:', task)
      
      // Verificar autenticação de múltiplas formas
      const user = useSupabaseUser()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      console.log('👤 [createTask] useSupabaseUser():', user.value?.id)
      console.log('👤 [createTask] supabase.auth.getUser():', authUser?.id)
      
      // Se não há usuário autenticado, criar tarefa localmente para desenvolvimento
      if (!user.value && !authUser) {
        console.warn('⚠️ [createTask] Usuário não autenticado - criando tarefa localmente')
        
        const newTask = {
          id: `temp-${Date.now()}`,
          title: task.title,
          description: task.description || null,
          status: task.status || 'todo',
          priority: task.priority || 'media',
          due_date: task.due_date ? task.due_date.split('T')[0] : null,
          company_id: task.company_id || null,
          assigned_to: task.assigned_to || null,
          column_id: task.column_id || null,
          position: task.position || 0,
          created_by: 'temp-user-dev',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        console.log('✅ [createTask] Tarefa criada localmente:', newTask)
        tasks.value.push(newTask)
        
        return { success: true, data: newTask }
      }

      const userId = user.value?.id || authUser?.id

      const taskData = {
        title: task.title,
        description: task.description || null,
        status: task.status || 'todo',
        priority: task.priority || 'media',
        due_date: task.due_date ? task.due_date.split('T')[0] : null,
        company_id: task.company_id || null,
        assigned_to: task.assigned_to || null,
        column_id: task.column_id || null,
        position: task.position || 0,
        created_by: userId,
        created_at: new Date().toISOString()
      }

      console.log('📝 [createTask] Dados para criação:', taskData)

      const { data, error } = await (supabase.from('tasks') as any)
        .insert([taskData])
        .select()
        .single()

      if (error) {
        console.error('❌ [createTask] Erro do Supabase:', error)
        console.error('❌ [createTask] Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return { success: false, error: error.message }
      }
      
      console.log('✅ [createTask] Tarefa criada com sucesso:', data)
      
      // Adicionar ao estado local
      if (data) {
        tasks.value.push(data)
        console.log('✅ [createTask] Tarefa adicionada ao estado local')
      }
      
      return { success: true, data }
    } catch (err: any) {
      console.error('❌ [createTask] Erro geral:', err)
      return { success: false, error: err.message }
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      console.log('🔄 [updateTask] Iniciando atualização:', { id, updates })
      
      // Verificar autenticação de múltiplas formas
      const user = useSupabaseUser()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      console.log('👤 [updateTask] useSupabaseUser():', user.value?.id)
      console.log('👤 [updateTask] supabase.auth.getUser():', authUser?.id)
      
      // Se não há usuário autenticado, atualizar localmente
      if (!user.value && !authUser) {
        console.warn('⚠️ [updateTask] Usuário não autenticado, atualizando localmente')
        
        const taskIndex = tasks.value.findIndex(t => t.id === id)
        if (taskIndex !== -1) {
          const updatedTask = { ...tasks.value[taskIndex], ...updates, updated_at: new Date().toISOString() }
          tasks.value[taskIndex] = updatedTask
          console.log('✅ [updateTask] Tarefa atualizada localmente:', updatedTask)
          return { success: true, data: updatedTask }
        } else {
          console.warn('⚠️ [updateTask] Tarefa não encontrada no estado local')
          return { success: false, error: 'Tarefa não encontrada' }
        }
      }

      // Criar objeto de atualização APENAS com campos básicos
      const updateData: any = {}

      // Apenas campos básicos que certamente existem
      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.description !== undefined) updateData.description = updates.description || null
      if (updates.status !== undefined) updateData.status = updates.status
      if (updates.priority !== undefined) updateData.priority = updates.priority
      if (updates.due_date !== undefined) updateData.due_date = updates.due_date ? updates.due_date.split('T')[0] : null
      
      // Sempre atualizar o timestamp
      updateData.updated_at = new Date().toISOString()

      console.log('📝 [updateTask] Dados para atualização (APENAS CAMPOS BÁSICOS):', updateData)

      // Fazer a atualização diretamente
      console.log('💾 [updateTask] Executando atualização no Supabase...')
      const { data, error } = await (supabase.from('tasks') as any)
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ [updateTask] Erro do Supabase:', error)
        console.error('❌ [updateTask] Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return { success: false, error: error.message }
      }
      
      console.log('✅ [updateTask] Dados retornados do Supabase:', data)
      
      // Atualizar o estado local com os dados retornados do banco
      const taskIndex = tasks.value.findIndex(t => t.id === id)
      if (taskIndex !== -1 && data) {
        tasks.value[taskIndex] = data
        console.log('✅ [updateTask] Estado local atualizado:', data)
      } else {
        console.warn('⚠️ [updateTask] Tarefa não encontrada no estado local ou dados vazios:', { taskIndex, data })
      }
      
      return { success: true, data }
    } catch (err: any) {
      console.error('❌ [updateTask] Erro geral:', err)
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
