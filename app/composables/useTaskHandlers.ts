import { ref } from 'vue'
import type { Task } from '~/composables/useTasks'

export const useTaskHandlers = () => {
  const { tasks, loading, createTask, updateTask, deleteTask: removeTask, moveTask: moveTaskStatus, fetchTasks } = useTasks()

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

  const handleSaveTask = async (taskData: Task) => {
    loadingAction.value = true

    let res
    if (selectedTask.value?.id) {
      res = await updateTask(selectedTask.value.id, taskData)
    } else {
      res = await createTask(taskData)
    }

    if (res.success) {
      closeTaskModal()
    } else {
      alert('Erro ao salvar: ' + res.error)
    }

    loadingAction.value = false
  }

  const moveTask = async (task: Task, newStatus: 'todo' | 'in_progress' | 'done') => {
    if (!task.id) return
    await moveTaskStatus(task.id, newStatus)
  }

  const deleteTask = async (id: string) => {
    const confirmed = await confirm('Deseja realmente deletar esta tarefa?', 'Deletar tarefa')
    if (!confirmed) return
    await removeTask(id)
  }

  return {
    tasks,
    loading,
    fetchTasks,
    isTaskModalOpen,
    selectedTask,
    loadingAction,
    openTaskModal,
    closeTaskModal,
    handleSaveTask,
    moveTask,
    deleteTask
  }
}
