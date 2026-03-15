import { ref, computed } from 'vue'

export interface DragState {
  isDragging: boolean
  draggedTaskId: string | null
  sourceColumn: string | null
  targetColumn: string | null
  dragX: number
  dragY: number
  offsetX: number
  offsetY: number
  draggedTask: any | null
}

export interface PreviewPosition {
  x: number
  y: number
  visible: boolean
}

export const useDragAnimations = () => {
  const dragState = ref<DragState>({
    isDragging: false,
    draggedTaskId: null,
    sourceColumn: null,
    targetColumn: null,
    dragX: 0,
    dragY: 0,
    offsetX: 0,
    offsetY: 0,
    draggedTask: null
  })

  const startDrag = (
    event: DragEvent,
    taskId: string,
    sourceColumn: string,
    task?: any
  ) => {
    dragState.value.isDragging = true
    dragState.value.draggedTaskId = taskId
    dragState.value.sourceColumn = sourceColumn
    dragState.value.targetColumn = sourceColumn
    dragState.value.draggedTask = task || null

    // Calcular offset do mouse em relação ao elemento
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    dragState.value.offsetX = event.clientX - rect.left
    dragState.value.offsetY = event.clientY - rect.top

    // Definir imagem de drag customizada com preview melhorado
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/html', (event.target as HTMLElement).innerHTML)

      // Criar preview de drag customizado
      const dragPreview = document.createElement('div')
      dragPreview.style.position = 'fixed'
      dragPreview.style.top = '-9999px'
      dragPreview.style.left = '-9999px'
      dragPreview.style.pointerEvents = 'none'
      dragPreview.style.zIndex = '9999'
      dragPreview.style.width = rect.width + 'px'
      dragPreview.style.maxWidth = '400px'
      
      // Clonar o elemento com estilos
      const clone = (event.target as HTMLElement).cloneNode(true) as HTMLElement
      clone.style.opacity = '0.95'
      clone.style.transform = 'scale(1.05) rotate(3deg)'
      clone.style.boxShadow = '0 25px 50px rgba(59, 130, 246, 0.5), 0 0 30px rgba(59, 130, 246, 0.3)'
      clone.style.borderRadius = '0.75rem'
      clone.style.border = '2px solid rgba(59, 130, 246, 0.6)'
      clone.style.filter = 'brightness(1.1)'
      
      dragPreview.appendChild(clone)
      document.body.appendChild(dragPreview)

      event.dataTransfer.setDragImage(dragPreview, rect.width / 2, rect.height / 2)

      setTimeout(() => {
        try {
          document.body.removeChild(dragPreview)
        } catch (e) {
          // Element already removed
        }
      }, 0)
    }
  }

  const updateDragPosition = (event: DragEvent | MouseEvent) => {
    dragState.value.dragX = event.clientX
    dragState.value.dragY = event.clientY
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (dragState.value.isDragging) {
      updateDragPosition(event)
    }
  }

  const setTargetColumn = (columnName: string) => {
    dragState.value.targetColumn = columnName
  }

  const endDrag = () => {
    dragState.value.isDragging = false
    dragState.value.draggedTaskId = null
    dragState.value.sourceColumn = null
    dragState.value.targetColumn = null
  }

  // Verificar se um card está sendo arrastado
  const isCardDragging = (taskId: string): boolean => {
    return dragState.value.isDragging && dragState.value.draggedTaskId === taskId
  }

  // Verificar se uma coluna é a origem
  const isSourceColumn = (columnName: string): boolean => {
    return dragState.value.sourceColumn === columnName && dragState.value.isDragging
  }

  // Verificar se uma coluna é o alvo
  const isTargetColumn = (columnName: string): boolean => {
    return dragState.value.targetColumn === columnName && dragState.value.isDragging
  }

  // Obter classe de animação para o card
  const getCardAnimationClass = (taskId: string, columnName: string): string => {
    if (!dragState.value.isDragging) return ''

    if (dragState.value.draggedTaskId === taskId) {
      return 'dragging-card'
    }

    if (dragState.value.sourceColumn === columnName && dragState.value.draggedTaskId !== taskId) {
      return 'card-leaving-source'
    }

    if (dragState.value.targetColumn === columnName && dragState.value.sourceColumn !== columnName) {
      return 'card-entering-target'
    }

    return ''
  }

  // Obter classe de animação para a coluna
  const getColumnAnimationClass = (columnName: string): string => {
    if (!dragState.value.isDragging) return ''

    if (dragState.value.sourceColumn === columnName) {
      return 'column-source-active'
    }

    if (dragState.value.targetColumn === columnName) {
      return 'column-target-active'
    }

    return 'column-inactive'
  }

  return {
    dragState,
    startDrag,
    updateDragPosition,
    handleMouseMove,
    setTargetColumn,
    endDrag,
    isCardDragging,
    isSourceColumn,
    isTargetColumn,
    getCardAnimationClass,
    getColumnAnimationClass
  }
}
