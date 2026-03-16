import { ref } from 'vue'
import type { Task } from './useTasks'
import { useTasks } from './useTasks'

export const useTaskHandlers = () => {
  const { tasks, loading, createTask, updateTask, deleteTask: deleteTaskApi, fetchTasks } = useTasks()
  
  const isTaskModalOpen = ref(false)
  const selectedTask = ref<Task | null>(null)
  const loadingAction = ref(false)
  const defaultColumnId = ref<string>('')

  const openTaskModal = (task?: Task, columnId?: string) => {
    selectedTask.value = task || null
    defaultColumnId.value = columnId || ''
    isTaskModalOpen.value = true
  }

  const closeTaskModal = () => {
    isTaskModalOpen.value = false
    selectedTask.value = null
    defaultColumnId.value = ''
  }

  const handleSaveTask = async (taskData: Partial<Task>) => {
    console.log('💾 Salvando tarefa:', taskData)
    loadingAction.value = true
    try {
      if (selectedTask.value?.id) {
        console.log('✏️ Atualizando tarefa existente:', selectedTask.value.id)
        await updateTask(selectedTask.value.id, taskData)
      } else {
        console.log('➕ Criando nova tarefa')
        // Se for nova tarefa, usar o column_id padrão
        const tasksInColumn = defaultColumnId.value 
          ? tasks.value.filter(t => t.column_id === defaultColumnId.value)
          : []
        const newPosition = tasksInColumn.length
        
        const newTask = { 
          ...taskData, 
          column_id: defaultColumnId.value || undefined,
          position: newPosition
        } as Task
        console.log('📋 Dados da nova tarefa:', newTask)
        const result = await createTask(newTask)
        console.log('✅ Resultado da criação:', result)
      }
      // Não fazer fetch - as tarefas já estão no estado local
      console.log('✅ Tarefa salva com sucesso')
      closeTaskModal()
    } catch (error) {
      console.error('❌ Erro ao salvar tarefa:', error)
    } finally {
      loadingAction.value = false
    }
  }

  const deleteTask = async (id: string) => {
    loadingAction.value = true
    try {
      await deleteTaskApi(id)
      // Não fazer fetch - remover do estado local
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value.splice(index, 1)
      }
      console.log('✅ Tarefa deletada com sucesso')
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error)
    } finally {
      loadingAction.value = false
    }
  }

  const moveTask = (
    taskId: string,
    newColumnId: string,
    targetTaskId?: string,
    position?: 'above' | 'below'
  ) => {
    try {
      console.log('🔄 [moveTask] Iniciando movimento:', { taskId, newColumnId, targetTaskId, position })
      
      const task = tasks.value.find(t => t.id === taskId)
      if (!task) {
        console.warn('⚠️ [moveTask] Task não encontrada:', taskId)
        return
      }

      console.log('✅ [moveTask] Task encontrada:', { id: task.id, title: task.title, currentColumn: task.column_id })

      // Se está mudando de coluna, atualizar o column_id localmente primeiro
      if (task.column_id !== newColumnId) {
        console.log('📍 [moveTask] Mudando de coluna:', { from: task.column_id, to: newColumnId })
        
        task.column_id = newColumnId
        console.log('✅ [moveTask] column_id atualizado localmente')
        
        // Atualizar no banco em background (sem bloquear UI)
        // Usar Promise.resolve para evitar unhandled rejection
        Promise.resolve().then(() => {
          try {
            return updateTask(taskId, { column_id: newColumnId })
          } catch (dbError) {
            console.error('❌ [moveTask] Erro ao atualizar banco:', dbError)
            // Não re-throw para evitar unhandled rejection
          }
        }).catch(err => {
          console.error('❌ [moveTask] Erro na promise:', err)
          // Silenciar o erro para evitar reload
        })
      } else {
        console.log('ℹ️ [moveTask] Nenhuma mudança necessária')
      }
      
      console.log('✅ [moveTask] Movimento completado')
    } catch (error) {
      console.error('❌ [moveTask] Erro geral:', error)
      console.error('❌ [moveTask] Stack:', (error as any)?.stack)
    }
  }

  const duplicateTask = async (task: Task) => {
    console.log('🔄 Duplicando tarefa:', task)
    loadingAction.value = true
    try {
      // Criar cópia da tarefa sem o ID e com título modificado
      const duplicatedTask: Task = {
        title: `${task.title} (cópia)`,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date,
        company_id: task.company_id,
        assigned_to: task.assigned_to,
        column_id: task.column_id,
        position: task.position
      }
      
      console.log('📝 Dados da tarefa duplicada:', duplicatedTask)
      const result = await createTask(duplicatedTask)
      console.log('✅ Resultado da criação:', result)
      // Não fazer fetch - a tarefa já está no estado local
      console.log('✅ Tarefa duplicada com sucesso')
    } catch (error) {
      console.error('❌ Erro ao duplicar tarefa:', error)
    } finally {
      loadingAction.value = false
    }
  }

  return {
    tasks,
    loading,
    fetchTasks,
    isTaskModalOpen,
    selectedTask,
    loadingAction,
    defaultColumnId,
    openTaskModal,
    closeTaskModal,
    handleSaveTask,
    deleteTask,
    moveTask,
    duplicateTask
  }
}
