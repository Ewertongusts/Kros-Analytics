import { ref, computed } from 'vue'
import type { Task } from './useTasks'

export const useTaskOrdering = () => {
  const supabase = useSupabaseClient()
  const taskOrder = ref<{ [key: string]: number }>({})

  const getTaskPosition = (taskId: string): number => {
    return taskOrder.value[taskId] ?? 0
  }

  const setTaskPosition = (taskId: string, position: number) => {
    taskOrder.value[taskId] = position
  }

  const reorderTasks = (tasks: Task[], targetIndex: number, draggedTaskId: string): Task[] => {
    // Encontrar o índice da tarefa arrastada
    const draggedIndex = tasks.findIndex(t => t.id === draggedTaskId)
    if (draggedIndex === -1) return tasks

    // Criar novo array sem a tarefa arrastada
    const newTasks = tasks.filter(t => t.id !== draggedTaskId)
    
    // Inserir a tarefa na nova posição
    const draggedTask = tasks[draggedIndex]
    newTasks.splice(targetIndex, 0, draggedTask)

    return newTasks
  }

  const updateTaskPositions = async (tasks: Task[]) => {
    try {
      // Atualizar posições no banco de dados
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i]
        if (task.id) {
          await supabase
            .from('tasks')
            .update({ position: i })
            .eq('id', task.id)
        }
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar posições das tarefas:', error)
    }
  }

  return {
    taskOrder,
    getTaskPosition,
    setTaskPosition,
    reorderTasks,
    updateTaskPositions
  }
}
