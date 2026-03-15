import { ref, computed, toRef } from 'vue'
import type { Task } from './useTasks'
import { useTasks } from './useTasks'

export const useTaskHandlers = () => {
  const { tasks, loading, createTask, updateTask, deleteTask: deleteTaskApi, fetchTasks } = useTasks()
  
  // ✅ Use toRef to maintain reactivity
  const tasksRef = toRef(tasks)
  
  const isTaskModalOpen = ref(false)
  const selectedTask = ref<Task | null>(null)
  const loadingAction = ref(false)

  const openTaskModal = (task?: Task) => {
    selectedTask.value = task || null
    isTaskModalOpen.value = true
  }

  const closeTaskModal = () => {
    isTaskModalOpen.value = false
    selectedTask.value = null
  }

  const handleSaveTask = async (taskData: Partial<Task>) => {
    loadingAction.value = true
    try {
      if (selectedTask.value?.id) {
        await updateTask(selectedTask.value.id, taskData)
      } else {
        await createTask(taskData as Task)
      }
      await fetchTasks()
      closeTaskModal()
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error)
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

  const moveTask = async (taskId: string, newStatus: 'todo' | 'in_progress' | 'done') => {
    const task = tasksRef.value.find(t => t.id === taskId)
    if (task) {
      await updateTask(taskId, { status: newStatus })
      await fetchTasks()
    }
  }

  return {
    tasks: tasksRef,
    loading,
    fetchTasks,
    isTaskModalOpen,
    selectedTask,
    loadingAction,
    openTaskModal,
    closeTaskModal,
    handleSaveTask,
    deleteTask,
    moveTask
  }
}
