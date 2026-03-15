import { describe, it, expect, beforeEach } from 'vitest'
import { useKanban2Selection } from '~/composables/kanban2/useKanban2Selection'

describe('useKanban2Selection', () => {
  let selection: ReturnType<typeof useKanban2Selection>

  beforeEach(() => {
    selection = useKanban2Selection()
  })

  describe('Initial State', () => {
    it('should initialize with empty selection', () => {
      expect(selection.selectedTaskIds.value.size).toBe(0)
      expect(selection.selectionCount.value).toBe(0)
      expect(selection.hasSelection.value).toBe(false)
      expect(selection.selectedIds.value).toEqual([])
    })

    it('should have readonly selectedTaskIds', () => {
      expect(() => {
        selection.selectedTaskIds.value = new Set()
      }).toThrow()
    })
  })

  describe('toggleSelection', () => {
    it('should add task to selection', () => {
      selection.toggleSelection('task-1')
      expect(selection.isSelected('task-1')).toBe(true)
      expect(selection.selectionCount.value).toBe(1)
    })

    it('should remove task from selection', () => {
      selection.toggleSelection('task-1')
      expect(selection.isSelected('task-1')).toBe(true)

      selection.toggleSelection('task-1')
      expect(selection.isSelected('task-1')).toBe(false)
      expect(selection.selectionCount.value).toBe(0)
    })

    it('should handle multiple toggles', () => {
      selection.toggleSelection('task-1')
      selection.toggleSelection('task-2')
      selection.toggleSelection('task-3')

      expect(selection.selectionCount.value).toBe(3)
      expect(selection.isSelected('task-1')).toBe(true)
      expect(selection.isSelected('task-2')).toBe(true)
      expect(selection.isSelected('task-3')).toBe(true)
    })

    it('should toggle correctly', () => {
      selection.toggleSelection('task-1')
      selection.toggleSelection('task-1')
      selection.toggleSelection('task-1')

      expect(selection.isSelected('task-1')).toBe(true)
      expect(selection.selectionCount.value).toBe(1)
    })
  })

  describe('selectAll', () => {
    it('should select all tasks', () => {
      const taskIds = ['task-1', 'task-2', 'task-3']
      selection.selectAll(taskIds)

      expect(selection.selectionCount.value).toBe(3)
      taskIds.forEach(id => {
        expect(selection.isSelected(id)).toBe(true)
      })
    })

    it('should clear previous selection', () => {
      selection.toggleSelection('task-1')
      selection.selectAll(['task-2', 'task-3'])

      expect(selection.isSelected('task-1')).toBe(false)
      expect(selection.isSelected('task-2')).toBe(true)
      expect(selection.isSelected('task-3')).toBe(true)
      expect(selection.selectionCount.value).toBe(2)
    })

    it('should handle empty array', () => {
      selection.toggleSelection('task-1')
      selection.selectAll([])

      expect(selection.selectionCount.value).toBe(0)
      expect(selection.isSelected('task-1')).toBe(false)
    })
  })

  describe('clearSelection', () => {
    it('should clear all selections', () => {
      selection.selectAll(['task-1', 'task-2', 'task-3'])
      selection.clearSelection()

      expect(selection.selectionCount.value).toBe(0)
      expect(selection.hasSelection.value).toBe(false)
      expect(selection.selectedIds.value).toEqual([])
    })

    it('should handle clearing empty selection', () => {
      selection.clearSelection()
      expect(selection.selectionCount.value).toBe(0)
    })
  })

  describe('isSelected', () => {
    it('should return true for selected task', () => {
      selection.toggleSelection('task-1')
      expect(selection.isSelected('task-1')).toBe(true)
    })

    it('should return false for unselected task', () => {
      expect(selection.isSelected('task-1')).toBe(false)
    })

    it('should return false after deselection', () => {
      selection.toggleSelection('task-1')
      selection.toggleSelection('task-1')
      expect(selection.isSelected('task-1')).toBe(false)
    })
  })

  describe('Computed Properties', () => {
    it('selectionCount should update correctly', () => {
      expect(selection.selectionCount.value).toBe(0)

      selection.toggleSelection('task-1')
      expect(selection.selectionCount.value).toBe(1)

      selection.toggleSelection('task-2')
      expect(selection.selectionCount.value).toBe(2)

      selection.toggleSelection('task-1')
      expect(selection.selectionCount.value).toBe(1)
    })

    it('hasSelection should reflect selection state', () => {
      expect(selection.hasSelection.value).toBe(false)

      selection.toggleSelection('task-1')
      expect(selection.hasSelection.value).toBe(true)

      selection.clearSelection()
      expect(selection.hasSelection.value).toBe(false)
    })

    it('selectedIds should return array of selected IDs', () => {
      selection.selectAll(['task-1', 'task-2', 'task-3'])
      const ids = selection.selectedIds.value

      expect(Array.isArray(ids)).toBe(true)
      expect(ids).toContain('task-1')
      expect(ids).toContain('task-2')
      expect(ids).toContain('task-3')
      expect(ids.length).toBe(3)
    })
  })

  describe('invertSelection', () => {
    it('should invert selection', () => {
      const allIds = ['task-1', 'task-2', 'task-3', 'task-4']
      selection.selectAll(['task-1', 'task-2'])

      selection.invertSelection(allIds)

      expect(selection.isSelected('task-1')).toBe(false)
      expect(selection.isSelected('task-2')).toBe(false)
      expect(selection.isSelected('task-3')).toBe(true)
      expect(selection.isSelected('task-4')).toBe(true)
      expect(selection.selectionCount.value).toBe(2)
    })

    it('should handle invert on empty selection', () => {
      const allIds = ['task-1', 'task-2', 'task-3']
      selection.invertSelection(allIds)

      expect(selection.selectionCount.value).toBe(3)
      allIds.forEach(id => {
        expect(selection.isSelected(id)).toBe(true)
      })
    })

    it('should handle invert on full selection', () => {
      const allIds = ['task-1', 'task-2', 'task-3']
      selection.selectAll(allIds)

      selection.invertSelection(allIds)

      expect(selection.selectionCount.value).toBe(0)
    })
  })

  describe('removeFromSelection', () => {
    it('should remove task from selection', () => {
      selection.selectAll(['task-1', 'task-2', 'task-3'])
      selection.removeFromSelection('task-2')

      expect(selection.isSelected('task-2')).toBe(false)
      expect(selection.selectionCount.value).toBe(2)
    })

    it('should handle removing non-selected task', () => {
      selection.selectAll(['task-1', 'task-2'])
      selection.removeFromSelection('task-3')

      expect(selection.selectionCount.value).toBe(2)
    })
  })

  describe('addToSelection', () => {
    it('should add task to selection', () => {
      selection.addToSelection('task-1')
      expect(selection.isSelected('task-1')).toBe(true)
    })

    it('should not duplicate if already selected', () => {
      selection.addToSelection('task-1')
      selection.addToSelection('task-1')

      expect(selection.selectionCount.value).toBe(1)
    })

    it('should add to existing selection', () => {
      selection.selectAll(['task-1', 'task-2'])
      selection.addToSelection('task-3')

      expect(selection.selectionCount.value).toBe(3)
      expect(selection.isSelected('task-3')).toBe(true)
    })
  })

  describe('selectMultiple', () => {
    it('should select multiple tasks', () => {
      selection.selectMultiple(['task-1', 'task-2', 'task-3'])

      expect(selection.selectionCount.value).toBe(3)
      expect(selection.isSelected('task-1')).toBe(true)
      expect(selection.isSelected('task-2')).toBe(true)
      expect(selection.isSelected('task-3')).toBe(true)
    })

    it('should add to existing selection', () => {
      selection.selectAll(['task-1'])
      selection.selectMultiple(['task-2', 'task-3'])

      expect(selection.selectionCount.value).toBe(3)
    })

    it('should handle empty array', () => {
      selection.selectAll(['task-1'])
      selection.selectMultiple([])

      expect(selection.selectionCount.value).toBe(1)
    })
  })

  describe('deselectMultiple', () => {
    it('should deselect multiple tasks', () => {
      selection.selectAll(['task-1', 'task-2', 'task-3', 'task-4'])
      selection.deselectMultiple(['task-1', 'task-2'])

      expect(selection.selectionCount.value).toBe(2)
      expect(selection.isSelected('task-1')).toBe(false)
      expect(selection.isSelected('task-2')).toBe(false)
      expect(selection.isSelected('task-3')).toBe(true)
      expect(selection.isSelected('task-4')).toBe(true)
    })

    it('should handle deselecting non-selected tasks', () => {
      selection.selectAll(['task-1', 'task-2'])
      selection.deselectMultiple(['task-3', 'task-4'])

      expect(selection.selectionCount.value).toBe(2)
    })
  })

  describe('State Immutability', () => {
    it('should prevent direct mutation of selectedTaskIds', () => {
      expect(() => {
        selection.selectedTaskIds.value = new Set()
      }).toThrow()
    })

    it('should prevent adding to selectedTaskIds directly', () => {
      expect(() => {
        selection.selectedTaskIds.value.add('task-1')
      }).toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid toggles', () => {
      for (let i = 0; i < 100; i++) {
        selection.toggleSelection('task-1')
      }

      expect(selection.isSelected('task-1')).toBe(false)
      expect(selection.selectionCount.value).toBe(0)
    })

    it('should handle many selections', () => {
      const taskIds = Array.from({ length: 1000 }, (_, i) => `task-${i}`)
      selection.selectAll(taskIds)

      expect(selection.selectionCount.value).toBe(1000)
      expect(selection.isSelected('task-500')).toBe(true)
    })

    it('should handle duplicate IDs in selectMultiple', () => {
      selection.selectMultiple(['task-1', 'task-1', 'task-1'])

      expect(selection.selectionCount.value).toBe(1)
      expect(selection.isSelected('task-1')).toBe(true)
    })
  })
})
