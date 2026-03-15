import { ref, computed } from 'vue'

export const useTaskSelection = () => {
  const selectedTaskIds = ref<Set<string>>(new Set())

  const toggleTaskSelection = (taskId: string) => {
    if (selectedTaskIds.value.has(taskId)) {
      selectedTaskIds.value.delete(taskId)
    } else {
      selectedTaskIds.value.add(taskId)
    }
  }

  const isTaskSelected = (taskId: string) => {
    return selectedTaskIds.value.has(taskId)
  }

  const selectAll = (taskIds: string[]) => {
    taskIds.forEach(id => selectedTaskIds.value.add(id))
  }

  const deselectAll = () => {
    selectedTaskIds.value.clear()
  }

  const selectedCount = computed(() => selectedTaskIds.value.size)

  const getSelectedTaskIds = () => Array.from(selectedTaskIds.value)

  return {
    selectedTaskIds,
    toggleTaskSelection,
    isTaskSelected,
    selectAll,
    deselectAll,
    selectedCount,
    getSelectedTaskIds
  }
}
