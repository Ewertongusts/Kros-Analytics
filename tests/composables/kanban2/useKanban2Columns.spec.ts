import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useKanban2Columns } from '~/composables/kanban2/useKanban2Columns'
import type { Column } from '~/composables/kanban2/useKanban2Data'

describe('useKanban2Columns', () => {
  let columns: ReturnType<typeof useKanban2Columns>

  const mockColumn: Column = {
    id: 'column-1',
    name: 'To Do',
    color: '#FF0000',
    order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  beforeEach(() => {
    columns = useKanban2Columns()
  })

  describe('Initial State', () => {
    it('should initialize with empty columns', () => {
      expect(columns.columns.value).toEqual([])
      expect(columns.loading.value).toBe(false)
      expect(columns.error.value).toBeNull()
    })

    it('should have readonly exports', () => {
      expect(() => {
        columns.columns.value = []
      }).toThrow()

      expect(() => {
        columns.loading.value = true
      }).toThrow()

      expect(() => {
        columns.error.value = 'error'
      }).toThrow()
    })
  })

  describe('addColumn', () => {
    it('should add column locally without function', async () => {
      const newColumn = await columns.addColumn('New Column', '#0000FF')

      expect(newColumn.name).toBe('New Column')
      expect(newColumn.color).toBe('#0000FF')
      expect(columns.columns.value).toHaveLength(1)
      expect(columns.columns.value[0].id).toBe(newColumn.id)
    })

    it('should validate empty name', async () => {
      await expect(columns.addColumn('')).rejects.toThrow('Nome da coluna é obrigatório')
      expect(columns.error.value).toBe('Nome da coluna é obrigatório')
    })

    it('should validate whitespace name', async () => {
      await expect(columns.addColumn('   ')).rejects.toThrow('Nome da coluna é obrigatório')
    })

    it('should validate name length', async () => {
      const longName = 'a'.repeat(101)
      await expect(columns.addColumn(longName)).rejects.toThrow(
        'Nome da coluna não pode ter mais de 100 caracteres'
      )
    })

    it('should use provided function', async () => {
      const mockAddFn = vi.fn(async (name: string, color?: string) => ({
        ...mockColumn,
        name,
        color
      }))

      const newColumn = await columns.addColumn('Test', '#FF0000', mockAddFn)

      expect(mockAddFn).toHaveBeenCalledWith('Test', '#FF0000')
      expect(columns.columns.value).toHaveLength(1)
    })

    it('should set correct order for new column', async () => {
      await columns.addColumn('Column 1')
      await columns.addColumn('Column 2')
      await columns.addColumn('Column 3')

      expect(columns.columns.value[0].order).toBe(0)
      expect(columns.columns.value[1].order).toBe(1)
      expect(columns.columns.value[2].order).toBe(2)
    })

    it('should handle function error', async () => {
      const mockAddFn = vi.fn(async () => {
        throw new Error('API Error')
      })

      await expect(columns.addColumn('Test', undefined, mockAddFn)).rejects.toThrow('API Error')
      expect(columns.error.value).toBe('API Error')
    })
  })

  describe('updateColumn', () => {
    beforeEach(async () => {
      await columns.addColumn('Original Name', '#FF0000')
    })

    it('should update column locally', async () => {
      const columnId = columns.columns.value[0].id
      await columns.updateColumn(columnId, { name: 'Updated Name' })

      expect(columns.columns.value[0].name).toBe('Updated Name')
    })

    it('should validate name length on update', async () => {
      const columnId = columns.columns.value[0].id
      const longName = 'a'.repeat(101)

      await expect(columns.updateColumn(columnId, { name: longName })).rejects.toThrow(
        'Nome da coluna não pode ter mais de 100 caracteres'
      )
    })

    it('should use provided function', async () => {
      const columnId = columns.columns.value[0].id
      const mockUpdateFn = vi.fn(async () => {})

      await columns.updateColumn(columnId, { name: 'New Name' }, mockUpdateFn)

      expect(mockUpdateFn).toHaveBeenCalledWith(columnId, { name: 'New Name' })
    })

    it('should update timestamp', async () => {
      const columnId = columns.columns.value[0].id
      const oldTimestamp = columns.columns.value[0].updated_at

      await new Promise(resolve => setTimeout(resolve, 10))
      await columns.updateColumn(columnId, { name: 'Updated' })

      expect(columns.columns.value[0].updated_at).not.toBe(oldTimestamp)
    })
  })

  describe('deleteColumn', () => {
    beforeEach(async () => {
      await columns.addColumn('Column 1')
      await columns.addColumn('Column 2')
      await columns.addColumn('Column 3')
    })

    it('should delete column', async () => {
      const columnId = columns.columns.value[1].id
      await columns.deleteColumn(columnId)

      expect(columns.columns.value).toHaveLength(2)
      expect(columns.columns.value.some(c => c.id === columnId)).toBe(false)
    })

    it('should reorder after delete', async () => {
      const columnId = columns.columns.value[1].id
      await columns.deleteColumn(columnId)

      expect(columns.columns.value[0].order).toBe(0)
      expect(columns.columns.value[1].order).toBe(1)
    })

    it('should use provided function', async () => {
      const columnId = columns.columns.value[0].id
      const mockDeleteFn = vi.fn(async () => {})

      await columns.deleteColumn(columnId, mockDeleteFn)

      expect(mockDeleteFn).toHaveBeenCalledWith(columnId)
    })

    it('should handle function error', async () => {
      const columnId = columns.columns.value[0].id
      const mockDeleteFn = vi.fn(async () => {
        throw new Error('Delete failed')
      })

      await expect(columns.deleteColumn(columnId, mockDeleteFn)).rejects.toThrow('Delete failed')
      expect(columns.columns.value).toHaveLength(3) // Not deleted
    })
  })

  describe('reorderColumns', () => {
    beforeEach(async () => {
      await columns.addColumn('Column 1')
      await columns.addColumn('Column 2')
      await columns.addColumn('Column 3')
    })

    it('should reorder columns', async () => {
      const ids = [
        columns.columns.value[2].id,
        columns.columns.value[0].id,
        columns.columns.value[1].id
      ]

      await columns.reorderColumns(ids)

      expect(columns.columns.value[0].id).toBe(ids[0])
      expect(columns.columns.value[1].id).toBe(ids[1])
      expect(columns.columns.value[2].id).toBe(ids[2])
    })

    it('should update order property', async () => {
      const ids = [
        columns.columns.value[2].id,
        columns.columns.value[0].id,
        columns.columns.value[1].id
      ]

      await columns.reorderColumns(ids)

      expect(columns.columns.value[0].order).toBe(0)
      expect(columns.columns.value[1].order).toBe(1)
      expect(columns.columns.value[2].order).toBe(2)
    })

    it('should validate column count', async () => {
      const ids = [columns.columns.value[0].id, columns.columns.value[1].id] // Missing one

      await expect(columns.reorderColumns(ids)).rejects.toThrow('IDs de colunas não correspondem')
    })

    it('should use provided function', async () => {
      const ids = [
        columns.columns.value[1].id,
        columns.columns.value[0].id,
        columns.columns.value[2].id
      ]
      const mockReorderFn = vi.fn(async () => {})

      await columns.reorderColumns(ids, mockReorderFn)

      expect(mockReorderFn).toHaveBeenCalledWith(ids)
    })
  })

  describe('moveColumn', () => {
    beforeEach(async () => {
      await columns.addColumn('Column 1')
      await columns.addColumn('Column 2')
      await columns.addColumn('Column 3')
    })

    it('should move column to new position', () => {
      const columnId = columns.columns.value[0].id
      columns.moveColumn(columnId, 2)

      expect(columns.columns.value[2].id).toBe(columnId)
    })

    it('should update order after move', () => {
      columns.moveColumn(columns.columns.value[0].id, 2)

      expect(columns.columns.value[0].order).toBe(0)
      expect(columns.columns.value[1].order).toBe(1)
      expect(columns.columns.value[2].order).toBe(2)
    })

    it('should handle invalid column id', () => {
      columns.moveColumn('invalid-id', 1)

      expect(columns.error.value).toBe('Posição inválida')
    })

    it('should handle invalid position', () => {
      columns.moveColumn(columns.columns.value[0].id, 10)

      expect(columns.error.value).toBe('Posição inválida')
    })
  })

  describe('getColumnById', () => {
    beforeEach(async () => {
      await columns.addColumn('Test Column')
    })

    it('should return column by id', () => {
      const columnId = columns.columns.value[0].id
      const column = columns.getColumnById(columnId)

      expect(column).toBeDefined()
      expect(column?.id).toBe(columnId)
    })

    it('should return undefined for non-existent column', () => {
      const column = columns.getColumnById('invalid-id')
      expect(column).toBeUndefined()
    })
  })

  describe('getColumnIndex', () => {
    beforeEach(async () => {
      await columns.addColumn('Column 1')
      await columns.addColumn('Column 2')
      await columns.addColumn('Column 3')
    })

    it('should return correct index', () => {
      const columnId = columns.columns.value[1].id
      const index = columns.getColumnIndex(columnId)

      expect(index).toBe(1)
    })

    it('should return -1 for non-existent column', () => {
      const index = columns.getColumnIndex('invalid-id')
      expect(index).toBe(-1)
    })
  })

  describe('Computed Properties', () => {
    beforeEach(async () => {
      await columns.addColumn('Column 1')
      await columns.addColumn('Column 2')
      await columns.addColumn('Column 3')
    })

    it('sortedColumns should return sorted columns', () => {
      const sorted = columns.sortedColumns.value
      expect(sorted[0].order).toBe(0)
      expect(sorted[1].order).toBe(1)
      expect(sorted[2].order).toBe(2)
    })

    it('columnCount should return correct count', () => {
      expect(columns.columnCount.value).toBe(3)
    })

    it('columnCount should update after add', async () => {
      await columns.addColumn('Column 4')
      expect(columns.columnCount.value).toBe(4)
    })

    it('columnCount should update after delete', async () => {
      const columnId = columns.columns.value[0].id
      await columns.deleteColumn(columnId)
      expect(columns.columnCount.value).toBe(2)
    })
  })

  describe('columnExists', () => {
    beforeEach(async () => {
      await columns.addColumn('Test Column')
    })

    it('should return true for existing column', () => {
      const columnId = columns.columns.value[0].id
      expect(columns.columnExists(columnId)).toBe(true)
    })

    it('should return false for non-existent column', () => {
      expect(columns.columnExists('invalid-id')).toBe(false)
    })
  })

  describe('clearColumns', () => {
    beforeEach(async () => {
      await columns.addColumn('Column 1')
      await columns.addColumn('Column 2')
    })

    it('should clear all columns', () => {
      columns.clearColumns()

      expect(columns.columns.value).toEqual([])
      expect(columns.error.value).toBeNull()
    })
  })

  describe('State Immutability', () => {
    it('should prevent direct mutation of columns', () => {
      expect(() => {
        columns.columns.value = []
      }).toThrow()
    })

    it('should prevent direct mutation of loading', () => {
      expect(() => {
        columns.loading.value = true
      }).toThrow()
    })

    it('should prevent direct mutation of error', () => {
      expect(() => {
        columns.error.value = 'error'
      }).toThrow()
    })
  })
})
