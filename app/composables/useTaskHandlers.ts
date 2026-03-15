import { ref } from 'vue'
import type { Task } from './useTasks'
import { useTasks } from './useTasks'

export const useTaskHandlers = () => {
  const { tasks, loading, createTask, updateTask, deleteTask: deleteTaskApi, fetchTasks } = useTasks()
  
  const isTaskModalOpen = ref(false)
  const selectedTask = ref<Task | null>(null)
  const loadingAction = ref(false)
  const defaultStatus = ref<'todo' | 'in_progress' | 'done'>('todo')

  const openTaskModal = (task?: Task, status?: 'todo' | 'in_progress' | 'done') => {
    selectedTask.value = task || null
    defaultStatus.value = status || 'todo'
    isTaskModalOpen.value = true
  }

  const closeTaskModal = () => {
    isTaskModalOpen.value = false
    selectedTask.value = null
    defaultStatus.value = 'todo'
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
        // Se for nova tarefa, usar o status padrão da coluna
        const tasksInStatus = tasks.value.filter(t => t.status === (taskData.status || defaultStatus.value))
        const newPosition = tasksInStatus.length
        
        const newTask = { 
          ...taskData, 
          status: taskData.status || defaultStatus.value,
          position: newPosition
        } as Task
        console.log('📋 Dados da nova tarefa:', newTask)
        const result = await createTask(newTask)
        console.log('✅ Resultado da criação:', result)
      }
      console.log('🔄 Buscando tarefas atualizadas...')
      await fetchTasks()
      console.log('📊 Tarefas após fetch:', tasks.value.length, tasks.value)
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
      await fetchTasks()
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error)
    } finally {
      loadingAction.value = false
    }
  }

  const moveTask = async (
    taskId: string,
    newStatus: 'todo' | 'in_progress' | 'done' | string,
    targetTaskId?: string,
    position?: 'above' | 'below'
  ) => {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return

    // Se está movendo para a mesma coluna com reordenação
    if (task.status === newStatus && targetTaskId && position) {
      const tasksInStatus = tasks.value.filter(t => t.status === newStatus)
      const targetIndex = tasksInStatus.findIndex(t => t.id === targetTaskId)
      
      if (targetIndex !== -1) {
        // Calcular a nova posição
        let newPosition = targetIndex
        if (position === 'below') {
          newPosition = targetIndex + 1
        }

        // Reordenar localmente
        const draggedIndex = tasksInStatus.findIndex(t => t.id === taskId)
        if (draggedIndex !== -1) {
          const reordered = tasksInStatus.filter(t => t.id !== taskId)
          reordered.splice(newPosition, 0, task)

          // Atualizar posições no banco
          for (let i = 0; i < reordered.length; i++) {
            const reorderedTask = reordered[i]
            if (reorderedTask?.id) {
              await updateTask(reorderedTask.id, { position: i })
            }
          }
        }
      }
    } else {
      // Se está mudando de coluna, apenas atualizar o status
      await updateTask(taskId, { status: newStatus as 'todo' | 'in_progress' | 'done' })
    }

    await fetchTasks()
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
        assigned_to: task.assigned_to
      }
      
      console.log('📝 Dados da tarefa duplicada:', duplicatedTask)
      const result = await createTask(duplicatedTask)
      console.log('✅ Resultado da criação:', result)
      await fetchTasks()
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
    defaultStatus,
    openTaskModal,
    closeTaskModal,
    handleSaveTask,
    deleteTask,
    moveTask,
    duplicateTask
  }
}
