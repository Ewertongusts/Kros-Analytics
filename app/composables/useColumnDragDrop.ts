import { ref } from 'vue'
import type { KanbanColumn } from './useKanbanColumns'

export const useColumnDragDrop = () => {
  const draggedColumnId = ref<string | null>(null)
  const dragOverColumnId = ref<string | null>(null)
  const dragOverSide = ref<'left' | 'right' | null>(null)
  const isDraggingColumn = ref(false)

  const handleColumnDragStart = (columnId: string, e: DragEvent) => {
    draggedColumnId.value = columnId
    isDraggingColumn.value = true

    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('column-drag', columnId)
      const emptyImage = new Image()
      e.dataTransfer.setDragImage(emptyImage, 0, 0)
    }
  }

  const handleColumnDragOver = (columnId: string, e: DragEvent, columnsRef: any) => {
    if (e.dataTransfer?.types.includes('column-drag')) {
      e.preventDefault()
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move'
      }
      
      const target = e.currentTarget as HTMLElement
      const rect = target.getBoundingClientRect()
      const midpoint = rect.width / 2
      
      const newSide = e.clientX >= rect.left + midpoint ? 'right' : 'left'
      
      dragOverColumnId.value = columnId
      dragOverSide.value = newSide
    }
  }

  const handleColumnDragLeave = () => {
    dragOverColumnId.value = null
    dragOverSide.value = null
  }

  const handleColumnDrop = (
    targetColumnId: string,
    columnsRef: any,
    moveColumn: (columnId: string, newPosition: number) => void,
    e: DragEvent
  ) => {
    if (!e.dataTransfer?.types.includes('column-drag')) {
      return
    }

    const columns = columnsRef.value || columnsRef

    if (!draggedColumnId.value || draggedColumnId.value === targetColumnId) {
      draggedColumnId.value = null
      dragOverColumnId.value = null
      dragOverSide.value = null
      isDraggingColumn.value = false
      return
    }

    const draggedIndex = columns.findIndex(c => c.column_id === draggedColumnId.value)
    const targetIndex = columns.findIndex(c => c.column_id === targetColumnId)

    if (draggedIndex !== -1 && targetIndex !== -1) {
      let newPosition = targetIndex
      
      if (dragOverSide.value === 'right') {
        newPosition = targetIndex + 1
      }
      else if (dragOverSide.value === 'left') {
        newPosition = targetIndex
      }
      
      if (draggedIndex < newPosition) {
        newPosition = newPosition - 1
      }
      
      moveColumn(draggedColumnId.value, newPosition)
    }

    draggedColumnId.value = null
    dragOverColumnId.value = null
    dragOverSide.value = null
    isDraggingColumn.value = false
  }

  const handleColumnDragEnd = () => {
    draggedColumnId.value = null
    dragOverColumnId.value = null
    dragOverSide.value = null
    isDraggingColumn.value = false
  }

  return {
    draggedColumnId,
    dragOverColumnId,
    dragOverSide,
    isDraggingColumn,
    handleColumnDragStart,
    handleColumnDragOver,
    handleColumnDragLeave,
    handleColumnDrop,
    handleColumnDragEnd
  }
}
