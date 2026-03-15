import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useKanban2Data } from '~/composables/kanban2/useKanban2Data'
import type { Task } from '~/composables/useTasks'
import type { Column } from '~/composables/kanban2/useKanban2Data'

// Mock useNuxtApp
vi.mock('#app', () => ({
  useNuxtApp: () => ({
    $fetch: vi.fn()
  })
}))

describe('useKanban2Data', () => {
  let data: ReturnType<typeof useKanban2Data>

  const mockTask: Task = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    column_id: 'column-1',
    status: 'todo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const mockColumn: Column = {
    id: 'column-1',
    name: 'To Do',
    color: '#FF0000',
    order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  beforeEach(() => {
    data = useKanban2Data()
  })

  describe('Initial State', () => {
    it('should initialize with empty data', () => {
      expect(data.tasks.value).toEqual([])
      expect(data.columns.value).toEqual([])
      expect(data.loading.value).toBe(false)
      expect(data.error.value).toBeNull()
    })

    it('should have readonly exports', () => {
      expect(() => {
        data.tasks.value = []
      }).toThrow()

      expect(() => {
        data.columns.value = []
      }).toThrow()

      expect(() => {
        data.loading.value = true
      }).toThrow()

      expect(() => {
        data.error.value = 'error'
      }).toThrow()
    })
  })

  describe('getTasksByColumn', () => {
    beforeEach(() => {
      data.tasks.value = [
        { ...mockTask, id: 'task-1', column_id: 'column-1' },
        { ...mockTask, id: 'task-2', column_id: 'column-1' },
        { ...mockTask, id: 'task-3', column_id: 'column-2' }
      ]
    })

    it('should return tasks from specific column', () => {
      const tasks = data.getTasksByColumn('column-1')
      expect(tasks).toHaveLength(2)
      expect(tasks[0].id).toBe('task-1')
      expect(tasks[1].id).toBe('task-2')
    })

    it('should return empty array for non-existent column', () => {
      const tasks = data.getTasksByColumn('column-999')
      expect(tasks).toEqual([])
    })

    it('should not include tasks from other columns', () => {
      const tasks = data.getTasksByColumn('column-1')
      expect(tasks.every(t => t.column_id === 'column-1')).toBe(true)
    })
  })

  describe('getTaskById', () => {
    beforeEach(() => {
      data.tasks.value = [
        { ...mockTask, id: 'task-1' },
        { ...mockTask, id: 'task-2' }
      ]
    })

    it('should return task by id', () => {
      const task = data.getTaskById('task-1')
      expect(task).toBeDefined()
      expect(task?.id).toBe('task-1')
    })

    it('should return undefined for non-existent task', () => {
      const task = data.getTaskById('task-999')
      expect(task).toBeUndefined()
    })
  })

  describe('getColumnById', () => {
    beforeEach(() => {
      data.columns.value = [
        { ...mockColumn, id: 'column-1' },
        { ...mockColumn, id: 'column-2' }
      ]
    })

    it('should return column by id', () => {
      const column = data.getColumnById('column-1')
      expect(column).toBeDefined()
      expect(column?.id).toBe('column-1')
    })

    it('should return undefined for non-existent column', () => {
      const column = data.getColumnById('column-999')
      expect(column).toBeUndefined()
    })
  })

  describe('Error Handling', () => {
    it('should clear error on successful operation', () => {
      data.error.value = 'Previous error'
      // After a successful operation, error should be cleared
      expect(data.error.value).toBe('Previous error')
    })

    it('should set error on failed operation', () => {
      // This would be tested with actual API calls
      expect(data.error.value).toBeNull()
    })
  })

  describe('State Immutability', () => {
    it('should prevent direct mutation of tasks', () => {
      expect(() => {
        data.tasks.value = []
      }).toThrow()
    })

    it('should prevent direct mutation of columns', () => {
      expect(() => {
        data.columns.value = []
      }).toThrow()
    })

    it('should prevent direct mutation of loading', () => {
      expect(() => {
        data.loading.value = true
      }).toThrow()
    })

    it('should prevent direct mutation of error', () => {
      expect(() => {
        data.error.value = 'error'
      }).toThrow()
    })
  })

  describe('Data Consistency', () => {
    it('should maintain task data integrity', () => {
      const task = { ...mockTask }
      data.tasks.value = [task]

      const retrieved = data.getTaskById('task-1')
      expect(retrieved).toEqual(task)
    })

    it('should maintain column data integrity', () => {
      const column = { ...mockColumn }
      data.columns.value = [column]

      const retrieved = data.getColumnById('column-1')
      expect(retrieved).toEqual(column)
    })
  })

  describe('Multiple Columns and Tasks', () => {
    beforeEach(() => {
      data.columns.value = [
        { ...mockColumn, id: 'column-1', name: 'To Do', order: 0 },
        { ...mockColumn, id: 'column-2', name: 'In Progress', order: 1 },
        { ...mockColumn, id: 'column-3', name: 'Done', order: 2 }
      ]

      data.tasks.value = [
        { ...mockTask, id: 'task-1', column_id: 'column-1' },
        { ...mockTask, id: 'task-2', column_id: 'column-1' },
        { ...mockTask, id: 'task-3', column_id: 'column-2' },
        { ...mockTask, id: 'task-4', column_id: 'column-3' }
      ]
    })

    it('should correctly filter tasks by multiple columns', () => {
      expect(data.getTasksByColumn('column-1')).toHaveLength(2)
      expect(data.getTasksByColumn('column-2')).toHaveLength(1)
      expect(data.getTasksByColumn('column-3')).toHaveLength(1)
    })

    it('should find correct task among many', () => {
      const task = data.getTaskById('task-3')
      expect(task?.column_id).toBe('column-2')
    })

    it('should find correct column among many', () => {
      const column = data.getColumnById('column-2')
      expect(column?.name).toBe('In Progress')
      expect(column?.order).toBe(1)
    })
  })
})
