import { ref } from 'vue'
import type { Task } from './useTasks'

export const useTaskDragDrop = () => {
  const draggedTask = ref<Task | null>(null)
  const dragSource = ref<string>('')
  const dragOverTaskId = ref<string | null>(null)
  const dragOverPosition = ref<'above' | 'below' | null>(null)
  let dragOverTimeoutId: ReturnType<typeof setTimeout> | null = null

  const handleDragStart = (task: Task, source: string) => {
    draggedTask.value = task
    dragSource.value = source
  }

  const handleDragEnd = () => {
    draggedTask.value = null
    dragSource.value = ''
    dragOverTaskId.value = null
    dragOverPosition.value = null
    if (dragOverTimeoutId) clearTimeout(dragOverTimeoutId)
  }

  const handleDragOver = (
    e: DragEvent,
    taskId?: string,
    moveTaskFn?: (taskId: string, columnId: string, targetTaskId?: string, position?: 'above' | 'below') => void
  ) => {
    try {
      e.preventDefault()
      e.dataTransfer!.dropEffect = 'move'
      
      // Limpar timeout anterior
      if (dragOverTimeoutId) clearTimeout(dragOverTimeoutId)
      
      // Se houver um taskId, detectar se está acima ou abaixo
      if (taskId && e.currentTarget && draggedTask.value && moveTaskFn) {
        try {
          const target = e.currentTarget as HTMLElement
          const rect = target.getBoundingClientRect()
          
          // Usar 35% do topo para "acima" (mais generoso)
          const threshold = rect.top + (rect.height * 0.35)
          
          // Comparar clientY com o threshold
          const newPosition = e.clientY < threshold ? 'above' : 'below'
          
          // Só atualizar se mudou de tarefa ou de posição (evita piscar)
          if (dragOverTaskId.value !== taskId || dragOverPosition.value !== newPosition) {
            dragOverTaskId.value = taskId
            dragOverPosition.value = newPosition
            
            // IMPORTANTE: Reordenar DURANTE o drag para abrir espaço
            const columnId = draggedTask.value.column_id || 'orphan'
            moveTaskFn(draggedTask.value.id!, columnId, taskId, newPosition)
          }
        } catch (innerError) {
          console.error('❌ [handleDragOver] Erro ao processar drag over:', innerError)
        }
      }
      
      // Timeout de 5s para limpar indicadores se drag for interrompido
      dragOverTimeoutId = setTimeout(() => {
        dragOverTaskId.value = null
        dragOverPosition.value = null
      }, 5000)
    } catch (error) {
      console.error('❌ [handleDragOver] Erro geral:', error)
    }
  }

  const handleDragLeave = () => {
    dragOverTaskId.value = null
    dragOverPosition.value = null
    if (dragOverTimeoutId) clearTimeout(dragOverTimeoutId)
  }

  const handleDrop = (
    e: DragEvent,
    targetStatus: 'todo' | 'in_progress' | 'done' | string,
    moveTask: (taskId: string, status: string, targetTaskId?: string, position?: 'above' | 'below') => void
  ) => {
    try {
      e.preventDefault()
      if (draggedTask.value) {
        console.log('🎯 [handleDrop] Executando drop:', { taskId: draggedTask.value.id, targetStatus })
        moveTask(
          draggedTask.value.id!,
          targetStatus,
          dragOverTaskId.value || undefined,
          dragOverPosition.value || undefined
        )
        console.log('✅ [handleDrop] Drop executado')
        handleDragEnd()
      }
    } catch (error) {
      console.error('❌ [handleDrop] Erro:', error)
      handleDragEnd()
    }
  }

  return {
    draggedTask,
    dragSource,
    dragOverTaskId,
    dragOverPosition,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop
  }
}
