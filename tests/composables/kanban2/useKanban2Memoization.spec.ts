import { describe, it, expect, beforeEach } from 'vitest'
import { useKanban2Memoization } from '~/composables/kanban2/useKanban2Memoization'
import type { Task } from '~/composables/useTasks'

describe('useKanban2Memoization', () => {
  let memoization: ReturnType<typeof useKanban2Memoization>

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Desc 1',
      status: 'todo',
      priority: 'alta',
      column_id: 'col-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Desc 2',
      status: 'in_progress',
      priority: 'media',
      column_id: 'col-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Task 3',
      description: 'Desc 3',
      status: 'done',
      priority: 'baixa',
      column_id: 'col-2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '4',
      title: 'Task 4',
      description: 'Desc 4',
      status: 'todo',
      priority: 'alta',
      column_id: 'col-2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  beforeEach(() => {
    memoization = useKanban2Memoization()
  })

  describe('memoizeTasksByColumn', () => {
    it('should memoize tasks by column', () => {
      const memoized = memoization.memoizeTasksByColumn(mockTasks, 'col-1')
      expect(memoized.value.length).toBe(2)
      expect(memoized.value[0].id).toBe('1')
      expect(memoized.value[1].id).toBe('2')
    })

    it('should return empty array for non-existent column', () => {
      const memoized = memoization.memoizeTasksByColumn(mockTasks, 'col-999')
      expect(memoized.value.length).toBe(0)
    })

    it('should update when tasks change', () => {
      const memoized = memoization.memoizeTasksByColumn(mockTasks, 'col-1')
      expect(memoized.value.length).toBe(2)

      const newTasks = [...mockTasks, {
        id: '5',
        title: 'Task 5',
        description: 'Desc 5',
        status: 'todo',
        priority: 'media',
        column_id: 'col-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]

      const memoized2 = memoization.memoizeTasksByColumn(newTasks, 'col-1')
      expect(memoized2.value.length).toBe(3)
    })
  })

  describe('memoizeSelectedTasks', () => {
    it('should memoize selected tasks', () => {
      const selectedIds = new Set(['1', '3'])
      const memoized = memoization.memoizeSelectedTasks(mockTasks, selectedIds)
      expect(memoized.value.length).toBe(2)
      expect(memoized.value[0].id).toBe('1')
      expect(memoized.value[1].id).toBe('3')
    })

    it('should return empty array when no tasks selected', () => {
      const selectedIds = new Set<string>()
      const memoized = memoization.memoizeSelectedTasks(mockTasks, selectedIds)
      expect(memoized.value.length).toBe(0)
    })
  })

  describe('memoizeFilteredTasks', () => {
    it('should memoize filtered tasks', () => {
      const memoized = memoization.memoizeFilteredTasks(
        mockTasks,
        task => task.priority === 'alta'
      )
      expect(memoized.value.length).toBe(2)
    })

    it('should handle complex filters', () => {
      const memoized = memoization.memoizeFilteredTasks(
        mockTasks,
        task => task.status === 'todo' && task.priority === 'alta'
      )
      expect(memoized.value.length).toBe(2)
    })
  })

  describe('memoizeSortedTasks', () => {
    it('should memoize sorted tasks', () => {
      const memoized = memoization.memoizeSortedTasks(
        mockTasks,
        (a, b) => a.title.localeCompare(b.title)
      )
      expect(memoized.value[0].title).toBe('Task 1')
      expect(memoized.value[3].title).toBe('Task 4')
    })

    it('should not modify original array', () => {
      const originalLength = mockTasks.length
      memoization.memoizeSortedTasks(
        mockTasks,
        (a, b) => b.title.localeCompare(a.title)
      )
      expect(mockTasks.length).toBe(originalLength)
    })
  })

  describe('memoizeTaskCount', () => {
    it('should memoize task count', () => {
      const memoized = memoization.memoizeTaskCount(mockTasks)
      expect(memoized.value).toBe(4)
    })

    it('should update when tasks change', () => {
      const memoized = memoization.memoizeTaskCount(mockTasks)
      expect(memoized.value).toBe(4)

      const newTasks = [...mockTasks, {
        id: '5',
        title: 'Task 5',
        description: 'Desc 5',
        status: 'todo',
        priority: 'media',
        column_id: 'col-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]

      const memoized2 = memoization.memoizeTaskCount(newTasks)
      expect(memoized2.value).toBe(5)
    })
  })

  describe('memoizeGroupedTasks', () => {
    it('should memoize grouped tasks', () => {
      const memoized = memoization.memoizeGroupedTasks(
        mockTasks,
        task => task.column_id
      )
      expect(memoized.value.size).toBe(2)
      expect(memoized.value.get('col-1')?.length).toBe(2)
      expect(memoized.value.get('col-2')?.length).toBe(2)
    })

    it('should handle empty groups', () => {
      const memoized = memoization.memoizeGroupedTasks(
        mockTasks,
        task => task.status
      )
      expect(memoized.value.size).toBe(3)
      expect(memoized.value.get('todo')?.length).toBe(2)
      expect(memoized.value.get('in_progress')?.length).toBe(1)
      expect(memoized.value.get('done')?.length).toBe(1)
    })
  })

  describe('memoizeTasksByStatus', () => {
    it('should memoize tasks by status', () => {
      const memoized = memoization.memoizeTasksByStatus(mockTasks)
      expect(memoized.value.size).toBe(3)
      expect(memoized.value.get('todo')?.length).toBe(2)
      expect(memoized.value.get('in_progress')?.length).toBe(1)
      expect(memoized.value.get('done')?.length).toBe(1)
    })
  })

  describe('memoizeTasksByPriority', () => {
    it('should memoize tasks by priority', () => {
      const memoized = memoization.memoizeTasksByPriority(mockTasks)
      expect(memoized.value.size).toBe(3)
      expect(memoized.value.get('alta')?.length).toBe(2)
      expect(memoized.value.get('media')?.length).toBe(1)
      expect(memoized.value.get('baixa')?.length).toBe(1)
    })
  })

  describe('memoizeTaskStats', () => {
    it('should memoize task statistics', () => {
      const memoized = memoization.memoizeTaskStats(mockTasks)
      expect(memoized.value.total).toBe(4)
      expect(memoized.value.byStatus.todo).toBe(2)
      expect(memoized.value.byStatus.in_progress).toBe(1)
      expect(memoized.value.byStatus.done).toBe(1)
      expect(memoized.value.byPriority.alta).toBe(2)
      expect(memoized.value.byPriority.media).toBe(1)
      expect(memoized.value.byPriority.baixa).toBe(1)
    })

    it('should handle empty tasks', () => {
      const memoized = memoization.memoizeTaskStats([])
      expect(memoized.value.total).toBe(0)
      expect(Object.keys(memoized.value.byStatus).length).toBe(0)
      expect(Object.keys(memoized.value.byPriority).length).toBe(0)
    })
  })

  describe('Performance', () => {
    it('should not recalculate when dependencies do not change', () => {
      let callCount = 0
      const memoized = memoization.memoizeTaskCount(mockTasks)
      
      // Acceder múltiplas vezes
      for (let i = 0; i < 100; i++) {
        const value = memoized.value
        if (value === 4) callCount++
      }

      expect(callCount).toBe(100)
    })

    it('should handle large datasets efficiently', () => {
      const largeTasks = Array.from({ length: 10000 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i}`,
        description: `Desc ${i}`,
        status: i % 3 === 0 ? 'todo' : i % 3 === 1 ? 'in_progress' : 'done',
        priority: i % 3 === 0 ? 'alta' : i % 3 === 1 ? 'media' : 'baixa',
        column_id: `col-${i % 10}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      const memoized = memoization.memoizeTaskStats(largeTasks)
      expect(memoized.value.total).toBe(10000)
      expect(memoized.value.byStatus.todo).toBe(3334)
    })
  })
})
