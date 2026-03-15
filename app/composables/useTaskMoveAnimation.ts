import { ref, computed } from 'vue'
import type { Task } from '~/composables/useTasks'

export const useTaskMoveAnimation = () => {
  const movingTaskId = ref<string | null>(null)
  const sourceColumn = ref<string | null>(null)
  const targetColumn = ref<string | null>(null)

  const isMoving = computed(() => movingTaskId.value !== null)

  const startMove = (taskId: string, from: string, to: string) => {
    movingTaskId.value = taskId
    sourceColumn.value = from
    targetColumn.value = to

    // Auto-reset after animation completes
    setTimeout(() => {
      movingTaskId.value = null
      sourceColumn.value = null
      targetColumn.value = null
    }, 300)
  }

  const getTaskAnimationClass = (taskId: string, columnStatus: string) => {
    if (movingTaskId.value !== taskId) return ''
    if (columnStatus === sourceColumn.value) return 'task-move-out'
    if (columnStatus === targetColumn.value) return 'task-move-in'
    return ''
  }

  return {
    movingTaskId,
    sourceColumn,
    targetColumn,
    isMoving,
    startMove,
    getTaskAnimationClass
  }
}
