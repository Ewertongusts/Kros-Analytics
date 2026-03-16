import { ref } from 'vue'
import type { KanbanColumn } from './useKanbanColumns'

export const useColumnDragDrop = () => {
  const draggedColumnId = ref<string | null>(null)
  const dragOverColumnId = ref<string | null>(null)
  const dragOverSide = ref<'left' | 'right' | null>(null)
  const isDraggingColumn = ref(false)
  let lastUpdateTime = 0
  let lastRecordedSide: 'left' | 'right' | null = null
  const DEBOUNCE_MS = 100 // Debounce de 100ms para evitar flickering

  const handleColumnDragStart = (columnId: string, e: DragEvent) => {
    draggedColumnId.value = columnId
    isDraggingColumn.value = true
    lastUpdateTime = 0
    lastRecordedSide = null

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
      
      const now = Date.now()
      
      // Só atualiza se passou tempo suficiente desde a última atualização
      if (now - lastUpdateTime < DEBOUNCE_MS) {
        return
      }
      
      const target = e.currentTarget as HTMLElement
      const rect = target.getBoundingClientRect()
      const relativeX = e.clientX - rect.left
      const normalizedX = relativeX / rect.width
      
      // Usa um threshold maior (40%) para evitar flickering no meio
      const newSide = normalizedX >= 0.4 ? 'right' : 'left'
      
      // Só atualiza se realmente mudou de lado
      if (newSide !== lastRecordedSide) {
        dragOverColumnId.value = columnId
        dragOverSide.value = newSide
        lastRecordedSide = newSide
        lastUpdateTime = now
      }
    }
  }

  const handleColumnDragLeave = () => {
    dragOverColumnId.value = null
    dragOverSide.value = null
    lastRecordedSide = null
    lastUpdateTime = 0
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
      lastRecordedSide = null
      lastUpdateTime = 0
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
    lastRecordedSide = null
    lastUpdateTime = 0
    isDraggingColumn.value = false
  }

  const handleColumnDragEnd = () => {
    draggedColumnId.value = null
    dragOverColumnId.value = null
    dragOverSide.value = null
    lastRecordedSide = null
    lastUpdateTime = 0
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
