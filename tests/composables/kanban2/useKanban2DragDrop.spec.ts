import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useKanban2DragDrop } from '~/composables/kanban2/useKanban2DragDrop'
import type { Task } from '~/composables/useTasks'

describe('useKanban2DragDrop', () => {
  let dragDrop: ReturnType<typeof useKanban2DragDrop>

  const mockTask: Task = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    column_id: 'column-1',
    status: 'todo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  beforeEach(() => {
    dragDrop = useKanban2DragDrop()
  })

  describe('Initial State', () => {
    it('should initialize with empty drag state', () => {
      expect(dragDrop.dragState.value.isDragging).toBe(false)
      expect(dragDrop.dragState.value.taskId).toBeNull()
      expect(dragDrop.dragState.value.fromColumnId).toBeNull()
      expect(dragDrop.dragState.value.toColumnId).toBeNull()
      expect(dragDrop.dragState.value.position).toBeNull()
      expect(dragDrop.dragState.value.isDropping).toBe(false)
    })

    it('should have readonly dragState', () => {
      expect(() => {
        dragDrop.dragState.value = {} as any
      }).toThrow()
    })
  })

  describe('startDrag', () => {
    it('should start drag correctly', () => {
      dragDrop.startDrag(mockTask, 'column-1')

      expect(dragDrop.dragState.value.isDragging).toBe(true)
      expect(dragDrop.dragState.value.taskId).toBe('task-1')
      expect(dragDrop.dragState.value.fromColumnId).toBe('column-1')
      expect(dragDrop.dragState.value.toColumnId).toBeNull()
      expect(dragDrop.dragState.value.position).toBeNull()
      expect(dragDrop.dragState.value.isDropping).toBe(false)
    })

    it('should handle task without id', () => {
      const taskWithoutId = { ...mockTask, id: undefined }
      dragDrop.startDrag(taskWithoutId, 'column-1')

      expect(dragDrop.dragState.value.isDragging).toBe(true)
      expect(dragDrop.dragState.value.taskId).toBeNull()
    })

    it('should overwrite previous drag state', () => {
      dragDrop.startDrag(mockTask, 'column-1')
      dragDrop.startDrag({ ...mockTask, id: 'task-2' }, 'column-2')

      expect(dragDrop.dragState.value.taskId).toBe('task-2')
      expect(dragDrop.dragState.value.fromColumnId).toBe('column-2')
    })
  })

  describe('moveDrag', () => {
    beforeEach(() => {
      dragDrop.startDrag(mockTask, 'column-1')
    })

    it('should update position when dragging', () => {
      dragDrop.moveDrag('column-2', 'above')

      expect(dragDrop.dragState.value.toColumnId).toBe('column-2')
      expect(dragDrop.dragState.value.position).toBe('above')
    })

    it('should handle position change from above to below', () => {
      dragDrop.moveDrag('column-2', 'above')
      expect(dragDrop.dragState.value.position).toBe('above')

      dragDrop.moveDrag('column-2', 'below')
      expect(dragDrop.dragState.value.position).toBe('below')
    })

    it('should not update if not dragging', () => {
      dragDrop.resetDrag()
      dragDrop.moveDrag('column-2', 'above')

      expect(dragDrop.dragState.value.toColumnId).toBeNull()
      expect(dragDrop.dragState.value.position).toBeNull()
    })

    it('should handle column change', () => {
      dragDrop.moveDrag('column-2', 'below')
      expect(dragDrop.dragState.value.toColumnId).toBe('column-2')

      dragDrop.moveDrag('column-3', 'above')
      expect(dragDrop.dragState.value.toColumnId).toBe('column-3')
    })
  })

  describe('completeDrop', () => {
    beforeEach(() => {
      dragDrop.startDrag(mockTask, 'column-1')
    })

    it('should complete drop without race conditions', async () => {
      dragDrop.moveDrag('column-2', 'below')

      let moveTaskCalled = false
      let receivedParams: any = null

      const mockMoveTask = vi.fn(async (taskId, fromColumnId, toColumnId, position) => {
        moveTaskCalled = true
        receivedParams = { taskId, fromColumnId, toColumnId, position }
      })

      await dragDrop.completeDrop(mockMoveTask)

      expect(moveTaskCalled).toBe(true)
      expect(receivedParams).toEqual({
        taskId: 'task-1',
        fromColumnId: 'column-1',
        toColumnId: 'column-2',
        position: 'below'
      })
      expect(dragDrop.dragState.value.isDragging).toBe(false)
    })

    it('should reset state after successful drop', async () => {
      dragDrop.moveDrag('column-2', 'above')

      await dragDrop.completeDrop(async () => {})

      expect(dragDrop.dragState.value.isDragging).toBe(false)
      expect(dragDrop.dragState.value.taskId).toBeNull()
      expect(dragDrop.dragState.value.toColumnId).toBeNull()
      expect(dragDrop.dragState.value.position).toBeNull()
      expect(dragDrop.dragState.value.isDropping).toBe(false)
    })

    it('should reset state even if moveTask throws error', async () => {
      dragDrop.moveDrag('column-2', 'below')

      const mockMoveTask = vi.fn(async () => {
        throw new Error('Move failed')
      })

      await expect(dragDrop.completeDrop(mockMoveTask)).rejects.toThrow('Move failed')

      expect(dragDrop.dragState.value.isDragging).toBe(false)
      expect(dragDrop.dragState.value.taskId).toBeNull()
    })

    it('should not complete drop if not dragging', async () => {
      dragDrop.resetDrag()

      const mockMoveTask = vi.fn()
      await dragDrop.completeDrop(mockMoveTask)

      expect(mockMoveTask).not.toHaveBeenCalled()
    })

    it('should use default values if toColumnId is null', async () => {
      dragDrop.moveDrag('column-2', 'below')
      dragDrop.dragState.value.toColumnId = null

      const mockMoveTask = vi.fn()
      await dragDrop.completeDrop(mockMoveTask)

      expect(mockMoveTask).toHaveBeenCalledWith(
        'task-1',
        'column-1',
        'column-1', // Usa fromColumnId como fallback
        'below'
      )
    })
  })

  describe('resetDrag', () => {
    beforeEach(() => {
      dragDrop.startDrag(mockTask, 'column-1')
      dragDrop.moveDrag('column-2', 'above')
    })

    it('should reset all state to initial values', () => {
      dragDrop.resetDrag()

      expect(dragDrop.dragState.value.isDragging).toBe(false)
      expect(dragDrop.dragState.value.taskId).toBeNull()
      expect(dragDrop.dragState.value.fromColumnId).toBeNull()
      expect(dragDrop.dragState.value.toColumnId).toBeNull()
      expect(dragDrop.dragState.value.position).toBeNull()
      expect(dragDrop.dragState.value.isDropping).toBe(false)
    })
  })

  describe('cancelDrag', () => {
    beforeEach(() => {
      dragDrop.startDrag(mockTask, 'column-1')
      dragDrop.moveDrag('column-2', 'above')
    })

    it('should cancel drag and reset state', () => {
      dragDrop.cancelDrag()

      expect(dragDrop.dragState.value.isDragging).toBe(false)
      expect(dragDrop.dragState.value.taskId).toBeNull()
    })
  })

  describe('State Immutability', () => {
    it('should prevent direct mutation of dragState', () => {
      expect(() => {
        dragDrop.dragState.value.isDragging = true
      }).toThrow()
    })

    it('should prevent adding new properties to dragState', () => {
      expect(() => {
        (dragDrop.dragState.value as any).newProperty = 'value'
      }).toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid startDrag calls', () => {
      dragDrop.startDrag(mockTask, 'column-1')
      dragDrop.startDrag({ ...mockTask, id: 'task-2' }, 'column-2')
      dragDrop.startDrag({ ...mockTask, id: 'task-3' }, 'column-3')

      expect(dragDrop.dragState.value.taskId).toBe('task-3')
      expect(dragDrop.dragState.value.fromColumnId).toBe('column-3')
    })

    it('should handle rapid moveDrag calls', () => {
      dragDrop.startDrag(mockTask, 'column-1')

      dragDrop.moveDrag('column-2', 'above')
      dragDrop.moveDrag('column-3', 'below')
      dragDrop.moveDrag('column-4', 'above')

      expect(dragDrop.dragState.value.toColumnId).toBe('column-4')
      expect(dragDrop.dragState.value.position).toBe('above')
    })

    it('should handle empty string columnIds', () => {
      dragDrop.startDrag(mockTask, '')
      expect(dragDrop.dragState.value.fromColumnId).toBe('')

      dragDrop.moveDrag('', 'below')
      expect(dragDrop.dragState.value.toColumnId).toBe('')
    })
  })
})
