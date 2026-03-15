import { ref, computed } from 'vue'
import type { Task } from '~/composables/useTasks'

export const useTaskBulkActions = () => {
  const selectedTasks = ref<Set<string>>(new Set())

  const toggleTaskSelection = (taskId: string) => {
    if (selectedTasks.value.has(taskId)) {
      selectedTasks.value.delete(taskId)
    } else {
      selectedTasks.value.add(taskId)
    }
  }

  const selectAll = (tasks: Task[]) => {
    selectedTasks.value = new Set(tasks.map(t => t.id!))
  }

  const deselectAll = () => {
    selectedTasks.value.clear()
  }

  const isSelected = (taskId: string) => {
    return selectedTasks.value.has(taskId)
  }

  const selectedCount = computed(() => selectedTasks.value.size)

  const getSelectedTaskIds = () => {
    return Array.from(selectedTasks.value)
  }

  return {
    selectedTasks,
    toggleTaskSelection,
    selectAll,
    deselectAll,
    isSelected,
    selectedCount,
    getSelectedTaskIds
  }
}
