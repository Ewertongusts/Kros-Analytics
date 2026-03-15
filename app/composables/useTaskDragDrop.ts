import { ref } from 'vue'
import type { Task } from './useTasks'

export const useTaskDragDrop = () => {
  const draggedTask = ref<Task | null>(null)
  const dragSource = ref<string>('')
  const dragOverTaskId = ref<string | null>(null)
  const dragOverPosition = ref<'above' | 'below' | null>(null)

  const handleDragStart = (task: Task, source: string) => {
    draggedTask.value = task
    dragSource.value = source
  }

  const handleDragEnd = () => {
    draggedTask.value = null
    dragSource.value = ''
    dragOverTaskId.value = null
    dragOverPosition.value = null
  }

  const handleDragOver = (
    e: DragEvent,
    taskId?: string,
    moveTaskFn?: (taskId: string, columnId: string, targetTaskId?: string, position?: 'above' | 'below') => void
  ) => {
    e.preventDefault()
    e.dataTransfer!.dropEffect = 'move'
    
    // Se houver um taskId, detectar se está acima ou abaixo
    if (taskId && e.currentTarget && draggedTask.value && moveTaskFn) {
      const target = e.currentTarget as HTMLElement
      const rect = target.getBoundingClientRect()
      const midpoint = rect.top + (rect.height / 2)
      
      // Comparar clientY com o midpoint absoluto
      const newPosition = e.clientY < midpoint ? 'above' : 'below'
      
      // Só atualizar se mudou de tarefa ou de posição (evita piscar)
      if (dragOverTaskId.value !== taskId || dragOverPosition.value !== newPosition) {
        dragOverTaskId.value = taskId
        dragOverPosition.value = newPosition
        
        // IMPORTANTE: Reordenar DURANTE o drag para abrir espaço
        const columnId = draggedTask.value.column_id || 'orphan'
        moveTaskFn(draggedTask.value.id!, columnId, taskId, newPosition)
      }
    }
  }

  const handleDragLeave = () => {
    dragOverTaskId.value = null
    dragOverPosition.value = null
  }

  const handleDrop = (
    e: DragEvent,
    targetStatus: 'todo' | 'in_progress' | 'done' | string,
    moveTask: (taskId: string, status: string, targetTaskId?: string, position?: 'above' | 'below') => void
  ) => {
    e.preventDefault()
    if (draggedTask.value) {
      moveTask(
        draggedTask.value.id!,
        targetStatus,
        dragOverTaskId.value || undefined,
        dragOverPosition.value || undefined
      )
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
