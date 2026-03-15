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

  const handleDragOver = (e: DragEvent, taskId?: string) => {
    e.preventDefault()
    e.dataTransfer!.dropEffect = 'move'
    
    // Se houver um taskId, detectar se está acima ou abaixo
    if (taskId && e.currentTarget) {
      const target = e.currentTarget as HTMLElement
      const rect = target.getBoundingClientRect()
      const midpoint = rect.height / 2
      
      dragOverTaskId.value = taskId
      dragOverPosition.value = e.clientY < rect.top + midpoint ? 'above' : 'below'
    }
  }

  const handleDragLeave = () => {
    dragOverTaskId.value = null
    dragOverPosition.value = null
  }

  const handleDrop = async (
    e: DragEvent,
    targetStatus: 'todo' | 'in_progress' | 'done' | string,
    moveTask: (taskId: string, status: string, targetTaskId?: string, position?: 'above' | 'below') => Promise<void>
  ) => {
    e.preventDefault()
    if (draggedTask.value) {
      await moveTask(
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
