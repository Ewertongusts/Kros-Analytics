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
    // Só processar se for um drag de coluna
    if (e.dataTransfer?.types.includes('column-drag')) {
      e.preventDefault()
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move'
      }
      
      // Detectar em qual lado da coluna o cursor está (50% da largura)
      const target = e.currentTarget as HTMLElement
      const rect = target.getBoundingClientRect()
      const midpoint = rect.width / 2
      
      // Se está na metade DIREITA (depois de 50%), inserir à direita (after)
      // Se está na metade ESQUERDA (antes de 50%), inserir à esquerda (before)
      const newSide = e.clientX >= rect.left + midpoint ? 'right' : 'left'
      
      console.log('🎯 handleColumnDragOver:', { columnId, clientX: e.clientX, rectLeft: rect.left, midpoint, newSide })
      
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
    // Só processar se for um drag de coluna
    if (!e.dataTransfer?.types.includes('column-drag')) {
      console.log('❌ Não é um drag de coluna')
      return
    }

    // Acessar o valor do ref
    const columns = columnsRef.value || columnsRef

    console.log('🎯 handleColumnDrop chamado:', {
      draggedColumnId: draggedColumnId.value,
      targetColumnId,
      dragOverSide: dragOverSide.value,
      columnsLength: columns.length
    })

    if (!draggedColumnId.value || draggedColumnId.value === targetColumnId) {
      console.log('⚠️ Drag inválido ou mesmo alvo')
      draggedColumnId.value = null
      dragOverColumnId.value = null
      dragOverSide.value = null
      isDraggingColumn.value = false
      return
    }

    const draggedIndex = columns.findIndex(c => c.column_id === draggedColumnId.value)
    const targetIndex = columns.findIndex(c => c.column_id === targetColumnId)

    console.log('📍 Índices:', { draggedIndex, targetIndex, draggedColumnId: draggedColumnId.value })

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Calcular a nova posição baseado no lado onde o cursor está
      let newPosition = targetIndex
      
      // Se está no lado direito, inserir após a coluna alvo
      if (dragOverSide.value === 'right') {
        newPosition = targetIndex + 1
      }
      // Se está no lado esquerdo, inserir antes da coluna alvo
      else if (dragOverSide.value === 'left') {
        newPosition = targetIndex
      }
      
      // Se a coluna está sendo movida para trás de si mesma, ajustar
      if (draggedIndex < newPosition) {
        newPosition = newPosition - 1
      }
      
      console.log('🚀 Chamando moveColumn:', { draggedColumnId: draggedColumnId.value, newPosition })
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
