import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useKanban2LazyLoading } from '~/composables/kanban2/useKanban2LazyLoading'
import type { Task } from '~/composables/useTasks'

describe('useKanban2LazyLoading', () => {
  let lazyLoading: ReturnType<typeof useKanban2LazyLoading>

  const mockTasks: Task[] = Array.from({ length: 150 }, (_, i) => ({
    id: `task-${i}`,
    title: `Task ${i}`,
    description: `Description ${i}`,
    status: 'todo',
    priority: 'media',
    column_id: 'col-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }))

  beforeEach(() => {
    lazyLoading = useKanban2LazyLoading()
  })

  describe('Initial State', () => {
    it('should initialize with empty state', () => {
      expect(lazyLoading.loadedTasks.value.length).toBe(0)
      expect(lazyLoading.isLoading.value).toBe(false)
      expect(lazyLoading.hasMore.value).toBe(true)
      expect(lazyLoading.error.value).toBeNull()
    })

    it('should have correct page size', () => {
      expect(lazyLoading.PAGE_SIZE).toBe(50)
    })
  })

  describe('loadNextPage', () => {
    it('should load next page of tasks', async () => {
      const mockFetch = vi.fn(async (page: number, pageSize: number) => {
        return mockTasks.slice(page * pageSize, (page + 1) * pageSize)
      })

      await lazyLoading.loadNextPage(mockFetch)

      expect(lazyLoading.loadedTasks.value.length).toBe(50)
      expect(lazyLoading.currentPageNumber.value).toBe(1)
      expect(mockFetch).toHaveBeenCalledWith(0, 50)
    })

    it('should load multiple pages', async () => {
      const mockFetch = vi.fn(async (page: number, pageSize: number) => {
        return mockTasks.slice(page * pageSize, (page + 1) * pageSize)
      })

      await lazyLoading.loadNextPage(mockFetch)
      await lazyLoading.loadNextPage(mockFetch)

      expect(lazyLoading.loadedTasks.value.length).toBe(100)
      expect(lazyLoading.currentPageNumber.value).toBe(2)
    })

    it('should set hasMore to false when less than page size returned', async () => {
      const mockFetch = vi.fn(async (page: number, pageSize: number) => {
        // Retornar menos que page size
        return mockTasks.slice(page * pageSize, (page + 1) * pageSize).slice(0, 30)
      })

      await lazyLoading.loadNextPage(mockFetch)

      expect(lazyLoading.hasMore.value).toBe(false)
    })

    it('should not load if already loading', async () => {
      const mockFetch = vi.fn(async () => {
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 100))
        return mockTasks.slice(0, 50)
      })

      // Iniciar primeiro carregamento
      const promise1 = lazyLoading.loadNextPage(mockFetch)
      
      // Tentar carregar novamente enquanto está carregando
      const promise2 = lazyLoading.loadNextPage(mockFetch)

      await promise1
      await promise2

      // Deve ter sido chamado apenas uma vez
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should not load if no more tasks', async () => {
      const mockFetch = vi.fn(async () => [])

      await lazyLoading.loadNextPage(mockFetch)
      expect(lazyLoading.hasMore.value).toBe(false)

      // Tentar carregar novamente
      await lazyLoading.loadNextPage(mockFetch)

      // Deve ter sido chamado apenas uma vez
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should handle errors', async () => {
      const mockFetch = vi.fn(async () => {
        throw new Error('Network error')
      })

      await expect(lazyLoading.loadNextPage(mockFetch)).rejects.toThrow('Network error')
      expect(lazyLoading.error.value).toBe('Network error')
      expect(lazyLoading.isLoading.value).toBe(false)
    })
  })

  describe('loadInitial', () => {
    it('should reset and load initial page', async () => {
      const mockFetch = vi.fn(async (page: number, pageSize: number) => {
        return mockTasks.slice(page * pageSize, (page + 1) * pageSize)
      })

      // Carregar primeira página
      await lazyLoading.loadInitial(mockFetch)
      expect(lazyLoading.loadedTasks.value.length).toBe(50)

      // Carregar segunda página
      await lazyLoading.loadNextPage(mockFetch)
      expect(lazyLoading.loadedTasks.value.length).toBe(100)

      // Reset e carregar inicial novamente
      await lazyLoading.loadInitial(mockFetch)
      expect(lazyLoading.loadedTasks.value.length).toBe(50)
      expect(lazyLoading.currentPageNumber.value).toBe(1)
    })
  })

  describe('reset', () => {
    it('should reset all state', async () => {
      const mockFetch = vi.fn(async (page: number, pageSize: number) => {
        return mockTasks.slice(page * pageSize, (page + 1) * pageSize)
      })

      await lazyLoading.loadNextPage(mockFetch)
      expect(lazyLoading.loadedTasks.value.length).toBe(50)

      lazyLoading.reset()

      expect(lazyLoading.loadedTasks.value.length).toBe(0)
      expect(lazyLoading.currentPageNumber.value).toBe(0)
      expect(lazyLoading.hasMore.value).toBe(true)
      expect(lazyLoading.error.value).toBeNull()
    })
  })

  describe('shouldLoadMore', () => {
    it('should return true when scroll > 80%', () => {
      expect(lazyLoading.shouldLoadMore(85)).toBe(true)
    })

    it('should return false when scroll < 80%', () => {
      expect(lazyLoading.shouldLoadMore(75)).toBe(false)
    })

    it('should return false when loading', async () => {
      const mockFetch = vi.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return mockTasks.slice(0, 50)
      })

      const promise = lazyLoading.loadNextPage(mockFetch)
      expect(lazyLoading.shouldLoadMore(85)).toBe(false)
      await promise
    })

    it('should return false when no more tasks', async () => {
      const mockFetch = vi.fn(async () => [])
      await lazyLoading.loadNextPage(mockFetch)

      expect(lazyLoading.shouldLoadMore(85)).toBe(false)
    })
  })

  describe('calculateScrollPercentage', () => {
    it('should calculate scroll percentage correctly', () => {
      const percentage = lazyLoading.calculateScrollPercentage(100, 1000, 500)
      expect(percentage).toBe(60) // (100 + 500) / 1000 * 100
    })

    it('should return 0 when scroll height is 0', () => {
      const percentage = lazyLoading.calculateScrollPercentage(100, 0, 500)
      expect(percentage).toBe(0)
    })

    it('should handle edge cases', () => {
      const percentage1 = lazyLoading.calculateScrollPercentage(0, 1000, 500)
      expect(percentage1).toBe(50)

      const percentage2 = lazyLoading.calculateScrollPercentage(500, 1000, 500)
      expect(percentage2).toBe(100)
    })
  })

  describe('Computed Properties', () => {
    it('should track loaded count', async () => {
      const mockFetch = vi.fn(async (page: number, pageSize: number) => {
        return mockTasks.slice(page * pageSize, (page + 1) * pageSize)
      })

      expect(lazyLoading.loadedCount.value).toBe(0)

      await lazyLoading.loadNextPage(mockFetch)
      expect(lazyLoading.loadedCount.value).toBe(50)

      await lazyLoading.loadNextPage(mockFetch)
      expect(lazyLoading.loadedCount.value).toBe(100)
    })

    it('should track current page number', async () => {
      const mockFetch = vi.fn(async (page: number, pageSize: number) => {
        return mockTasks.slice(page * pageSize, (page + 1) * pageSize)
      })

      expect(lazyLoading.currentPageNumber.value).toBe(0)

      await lazyLoading.loadNextPage(mockFetch)
      expect(lazyLoading.currentPageNumber.value).toBe(1)

      await lazyLoading.loadNextPage(mockFetch)
      expect(lazyLoading.currentPageNumber.value).toBe(2)
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid load requests', async () => {
      const mockFetch = vi.fn(async (page: number, pageSize: number) => {
        return mockTasks.slice(page * pageSize, (page + 1) * pageSize)
      })

      // Tentar carregar múltiplas vezes rapidamente
      await Promise.all([
        lazyLoading.loadNextPage(mockFetch),
        lazyLoading.loadNextPage(mockFetch),
        lazyLoading.loadNextPage(mockFetch)
      ])

      // Deve ter sido chamado apenas uma vez
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should handle empty results', async () => {
      const mockFetch = vi.fn(async () => [])

      await lazyLoading.loadNextPage(mockFetch)

      expect(lazyLoading.loadedTasks.value.length).toBe(0)
      expect(lazyLoading.hasMore.value).toBe(false)
    })

    it('should handle large datasets', async () => {
      const largeMockTasks = Array.from({ length: 5000 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i}`,
        description: `Description ${i}`,
        status: 'todo',
        priority: 'media',
        column_id: 'col-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      const mockFetch = vi.fn(async (page: number, pageSize: number) => {
        return largeMockTasks.slice(page * pageSize, (page + 1) * pageSize)
      })

      // Carregar 10 páginas
      for (let i = 0; i < 10; i++) {
        await lazyLoading.loadNextPage(mockFetch)
      }

      expect(lazyLoading.loadedTasks.value.length).toBe(500)
      expect(lazyLoading.hasMore.value).toBe(true)
    })
  })
})
