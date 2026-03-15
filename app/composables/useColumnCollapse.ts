import { ref, computed } from 'vue'

export type ColumnStatus = 'todo' | 'in_progress' | 'done'

export const useColumnCollapse = () => {
  const collapsedColumns = ref<Set<ColumnStatus>>(new Set())

  const toggleColumn = (status: ColumnStatus) => {
    if (collapsedColumns.value.has(status)) {
      collapsedColumns.value.delete(status)
    } else {
      collapsedColumns.value.add(status)
    }
  }

  const isCollapsed = (status: ColumnStatus) => {
    return collapsedColumns.value.has(status)
  }

  const expandAll = () => {
    collapsedColumns.value.clear()
  }

  const collapseAll = () => {
    collapsedColumns.value = new Set(['todo', 'in_progress', 'done'])
  }

  const toggleAll = () => {
    if (collapsedColumns.value.size === 0) {
      collapseAll()
    } else {
      expandAll()
    }
  }

  return {
    collapsedColumns,
    toggleColumn,
    isCollapsed,
    expandAll,
    collapseAll,
    toggleAll
  }
}
