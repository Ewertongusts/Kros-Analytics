import { ref } from 'vue'
import type { Task } from './useTasks'

export const useTaskDragDrop = () => {
  const draggedTask = ref<Task | null>(null)
  const dragSource = ref<string>('')
  const dragOverTaskId = ref<string | null>(null)
  const dragOverPosition = ref<'above' | 'below' | null>(null)
  let dragOverTimeoutId: ReturnType<typeof setTimeout> | null = null
  let dragOverDebounceId: ReturnType<typeof setTimeout> | null = null
  let lastDragOverTaskId: string | null = null
  let lastDragOverPosition: 'above' | 'below' | null = null

  const handleDragStart = (task: Task, source: string) => {
    console.log('[TASK-DRAG-DROP] 🚀 handleDragStart', {
      taskId: task.id,
      taskTitle: task.title,
      source,
      timestamp: new Date().toISOString()
    })
    draggedTask.value = task
    dragSource.value = source
    console.log('[TASK-DRAG-DROP] ✅ Drag started', {
      draggedTask: draggedTask.value,
      dragSource: dragSource.value
    })
  }

  const handleDragEnd = () => {
    console.log('[TASK-DRAG-DROP] 🏁 handleDragEnd CALLED', {
      draggedTaskId: draggedTask.value?.id,
      dragSource: dragSource.value,
      dragOverTaskId: dragOverTaskId.value,
      dragOverPosition: dragOverPosition.value,
      timestamp: new Date().toISOString(),
      stackTrace: new Error().stack?.split('\n').slice(1, 4).join(' | ')
    })
    draggedTask.value = null
    dragSource.value = ''
    dragOverTaskId.value = null
    dragOverPosition.value = null
    lastDragOverTaskId = null
    lastDragOverPosition = null
    if (dragOverTimeoutId) clearTimeout(dragOverTimeoutId)
    if (dragOverDebounceId) clearTimeout(dragOverDebounceId)
    console.log('[TASK-DRAG-DROP] ✅ Drag ended - state reset', {
      dragOverTaskId: dragOverTaskId.value,
      dragOverPosition: dragOverPosition.value
    })
  }

  const handleDragOver = (
    e: DragEvent,
    taskId?: string,
    moveTaskFn?: (taskId: string, columnId: string, targetTaskId?: string, position?: 'above' | 'below') => void
  ) => {
    try {
      e.preventDefault()
      e.dataTransfer!.dropEffect = 'move'
      
      if (dragOverTimeoutId) clearTimeout(dragOverTimeoutId)
      
      if (taskId && e.currentTarget) {
        try {
          const target = e.currentTarget as HTMLElement
          const rect = target.getBoundingClientRect()
          
          const threshold = rect.top + (rect.height * 0.40)
          const newPosition = e.clientY < threshold ? 'above' : 'below'
          
          console.log('[TASK-DRAG-DROP] 📍 handleDragOver', {
            taskId,
            newPosition,
            clientY: e.clientY,
            threshold,
            rectTop: rect.top,
            rectHeight: rect.height,
            draggedTaskId: draggedTask.value?.id,
            timestamp: new Date().toISOString()
          })
          
          if (lastDragOverTaskId !== taskId || lastDragOverPosition !== newPosition) {
            console.log('[TASK-DRAG-DROP] 🔄 Position changed', {
              oldTaskId: lastDragOverTaskId,
              newTaskId: taskId,
              oldPosition: lastDragOverPosition,
              newPosition
            })
            lastDragOverTaskId = taskId
            lastDragOverPosition = newPosition
            
            if (dragOverDebounceId) clearTimeout(dragOverDebounceId)
            dragOverDebounceId = setTimeout(() => {
              dragOverTaskId.value = taskId
              dragOverPosition.value = newPosition
              console.log('[TASK-DRAG-DROP] ✅ Drag over state updated', {
                dragOverTaskId: dragOverTaskId.value,
                dragOverPosition: dragOverPosition.value
              })
            }, 100)
          }
        } catch (innerError) {
          console.error('[TASK-DRAG-DROP] ❌ Error processing drag over:', innerError)
        }
      }
      
      dragOverTimeoutId = setTimeout(() => {
        dragOverTaskId.value = null
        dragOverPosition.value = null
        lastDragOverTaskId = null
        lastDragOverPosition = null
      }, 5000)
    } catch (error) {
      console.error('[TASK-DRAG-DROP] ❌ General drag over error:', error)
    }
  }

  const handleDragLeave = () => {
    console.log('[TASK-DRAG-DROP] 👋 handleDragLeave', {
      dragOverTaskId: dragOverTaskId.value,
      dragOverPosition: dragOverPosition.value,
      timestamp: new Date().toISOString()
    })
    dragOverTaskId.value = null
    dragOverPosition.value = null
    lastDragOverTaskId = null
    lastDragOverPosition = null
    if (dragOverTimeoutId) clearTimeout(dragOverTimeoutId)
    if (dragOverDebounceId) clearTimeout(dragOverDebounceId)
    console.log('[TASK-DRAG-DROP] ✅ Drag leave - state cleared')
  }

  const handleDrop = (
    e: DragEvent,
    targetStatus: 'todo' | 'in_progress' | 'done' | string,
    moveTask: (taskId: string, status: string, targetTaskId?: string, position?: 'above' | 'below') => void
  ) => {
    try {
      e.preventDefault()
      
      console.log('[TASK-DRAG-DROP] 💧 handleDrop CALLED', {
        draggedTaskId: draggedTask.value?.id,
        draggedTaskTitle: draggedTask.value?.title,
        dragSource: dragSource.value,
        targetStatus,
        dragOverTaskId: dragOverTaskId.value,
        dragOverPosition: dragOverPosition.value,
        timestamp: new Date().toISOString(),
        stackTrace: new Error().stack?.split('\n').slice(1, 3).join(' | ')
      })
      
      if (draggedTask.value) {
        console.log('[TASK-DRAG-DROP] 📤 About to call moveTask with positioning', {
          taskId: draggedTask.value.id,
          targetStatus,
          targetTaskId: dragOverTaskId.value,
          position: dragOverPosition.value,
          hasTargetTaskId: !!dragOverTaskId.value,
          hasPosition: !!dragOverPosition.value
        })
        
        moveTask(
          draggedTask.value.id!,
          targetStatus,
          dragOverTaskId.value || undefined,
          dragOverPosition.value || undefined
        )
        
        console.log('[TASK-DRAG-DROP] ✅ moveTask called successfully')
        handleDragEnd()
      } else {
        console.warn('[TASK-DRAG-DROP] ⚠️ No dragged task found')
      }
    } catch (error) {
      console.error('[TASK-DRAG-DROP] ❌ Error processing drop:', error)
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
