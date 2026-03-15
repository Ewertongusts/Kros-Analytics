import { ref } from 'vue'
import type { Task } from './useTasks'

export const useTaskDragDrop = () => {
  const draggedTask = ref<Task | null>(null)
  const dragSource = ref<string>('')

  const handleDragStart = (task: Task, source: string) => {
    draggedTask.value = task
    dragSource.value = source
  }

  const handleDragEnd = () => {
    draggedTask.value = null
    dragSource.value = ''
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.dataTransfer!.dropEffect = 'move'
  }

  const handleDrop = async (
    e: DragEvent,
    targetStatus: 'todo' | 'in_progress' | 'done',
    moveTask: (taskId: string, status: 'todo' | 'in_progress' | 'done') => Promise<void>
  ) => {
    e.preventDefault()
    if (draggedTask.value) {
      await moveTask(draggedTask.value.id!, targetStatus)
      handleDragEnd()
    }
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
