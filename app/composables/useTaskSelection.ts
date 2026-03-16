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

  const selectColumnTasks = (taskIds: string[]) => {
    taskIds.forEach(id => selectedTaskIds.value.add(id))
  }

  const deselectColumnTasks = (taskIds: string[]) => {
    taskIds.forEach(id => selectedTaskIds.value.delete(id))
  }

  const toggleColumnTasks = (taskIds: string[]) => {
    const allSelected = taskIds.every(id => selectedTaskIds.value.has(id))
    if (allSelected) {
      deselectColumnTasks(taskIds)
    } else {
      selectColumnTasks(taskIds)
    }
  }

  const isColumnFullySelected = (taskIds: string[]) => {
    return taskIds.length > 0 && taskIds.every(id => selectedTaskIds.value.has(id))
  }

  const isColumnPartiallySelected = (taskIds: string[]) => {
    if (taskIds.length === 0) return false
    const hasSome = taskIds.some(id => selectedTaskIds.value.has(id))
    const hasAll = taskIds.every(id => selectedTaskIds.value.has(id))
    const result = hasSome && !hasAll
    console.log(`  isColumnPartiallySelected: hasSome=${hasSome}, hasAll=${hasAll}, result=${result}`)
    return result
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
    selectColumnTasks,
    deselectColumnTasks,
    toggleColumnTasks,
    isColumnFullySelected,
    isColumnPartiallySelected,
    deselectAll,
    selectedCount,
    getSelectedTaskIds
  }
}
