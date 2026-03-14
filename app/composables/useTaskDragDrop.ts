import { ref } from 'vue'
import type { Task } from '~/composables/useTasks'

export const useTaskDragDrop = () => {
  const draggedTask = ref<Task | null>(null)
  const dragSource = ref<string | null>(null)

  const handleDragStart = (task: Task, source: string) => {
    draggedTask.value = task
    dragSource.value = source
  }

  const handleDragEnd = () => {
    draggedTask.value = null
    dragSource.value = null
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.dataTransfer!.dropEffect = 'move'
  }

  const handleDrop = async (
    e: DragEvent,
    targetStatus: 'todo' | 'in_progress' | 'done',
    moveTask: (task: Task, status: 'todo' | 'in_progress' | 'done') => Promise<void>
  ) => {
    e.preventDefault()
    
    if (draggedTask.value && dragSource.value !== targetStatus) {
      await moveTask(draggedTask.value, targetStatus)
    }
    
    handleDragEnd()
  }

  return {
    draggedTask,
    dragSource,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop
  }
}
