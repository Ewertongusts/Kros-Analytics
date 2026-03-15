import { ref, computed } from 'vue'
import type { Task } from '~/composables/useTasks'

export type SortField = 'title' | 'priority' | 'due_date' | 'created_at' | 'assigned_to'
export type SortOrder = 'asc' | 'desc'

export const useTaskSorting = () => {
  const sortField = ref<SortField>('created_at')
  const sortOrder = ref<SortOrder>('desc')

  const priorityOrder = { alta: 3, media: 2, baixa: 1 }

  const sortTasks = (tasks: Task[]): Task[] => {
    const sorted = [...tasks]

    sorted.sort((a, b) => {
      let aValue: any = a[sortField.value]
      let bValue: any = b[sortField.value]

      // Handle priority sorting
      if (sortField.value === 'priority') {
        aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
        bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
      }

      // Handle date sorting
      if (sortField.value === 'due_date' || sortField.value === 'created_at') {
        aValue = aValue ? new Date(aValue).getTime() : 0
        bValue = bValue ? new Date(bValue).getTime() : 0
      }

      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      // Compare
      if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }

  const toggleSort = (field: SortField) => {
    if (sortField.value === field) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortField.value = field
      sortOrder.value = 'desc'
    }
  }

  return {
    sortField,
    sortOrder,
    sortTasks,
    toggleSort
  }
}
