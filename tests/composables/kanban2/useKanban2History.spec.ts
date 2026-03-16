import { describe, it, expect, beforeEach } from 'vitest'
import { useKanban2History } from '~/composables/kanban2/useKanban2History'
import type { HistoryAction } from '~/composables/kanban2/useKanban2History'

describe('useKanban2History', () => {
  let history: ReturnType<typeof useKanban2History>

  beforeEach(() => {
    history = useKanban2History()
  })

  it('should initialize with empty history', () => {
    expect(history.history.value.length).toBe(0)
    expect(history.currentHistoryIndex.value).toBe(-1)
  })

  it('should add action to history', () => {
    const action: HistoryAction = {
      type: 'CREATE',
      data: { id: '1', title: 'Test Task' },
      timestamp: Date.now(),
      description: 'Create task'
    }

    history.addAction(action)

    expect(history.history.value.length).toBe(1)
    expect(history.history.value[0]).toEqual(action)
    expect(history.currentHistoryIndex.value).toBe(0)
  })

  it('should add multiple actions to history', () => {
    const action1: HistoryAction = {
      type: 'CREATE',
      data: { id: '1', title: 'Task 1' },
      timestamp: Date.now(),
      description: 'Create task 1'
    }

    const action2: HistoryAction = {
      type: 'UPDATE',
      data: { id: '1', title: 'Task 1 Updated' },
      timestamp: Date.now(),
      description: 'Update task 1'
    }

    history.addAction(action1)
    history.addAction(action2)

    expect(history.history.value.length).toBe(2)
    expect(history.currentHistoryIndex.value).toBe(1)
  })

  it('should undo action', () => {
    const action: HistoryAction = {
      type: 'CREATE',
      data: { id: '1', title: 'Test Task' },
      timestamp: Date.now(),
      description: 'Create task'
    }

    history.addAction(action)
    expect(history.currentHistoryIndex.value).toBe(0)
    
    const undoneAction = history.undo()
    expect(undoneAction).toBeNull() // Undo retorna null quando não há ação anterior
    expect(history.currentHistoryIndex.value).toBe(-1)
  })

  it('should undo and redo actions', () => {
    const action1: HistoryAction = {
      type: 'CREATE',
      data: { id: '1', title: 'Task 1' },
      timestamp: Date.now(),
      description: 'Create task 1'
    }

    const action2: HistoryAction = {
      type: 'UPDATE',
      data: { id: '1', title: 'Task 1 Updated' },
      timestamp: Date.now(),
      description: 'Update task 1'
    }

    history.addAction(action1)
    history.addAction(action2)

    // Undo last action
    history.undo()
    expect(history.currentHistoryIndex.value).toBe(0)

    // Redo
    const redoneAction = history.redo()
    expect(redoneAction).toEqual(action2)
    expect(history.currentHistoryIndex.value).toBe(1)
  })

  it('should check canUndo correctly', () => {
    expect(history.canUndo.value).toBe(false)

    const action: HistoryAction = {
      type: 'CREATE',
      data: { id: '1', title: 'Test Task' },
      timestamp: Date.now(),
      description: 'Create task'
    }

    history.addAction(action)
    expect(history.canUndo.value).toBe(false) // Can't undo first action

    const action2: HistoryAction = {
      type: 'UPDATE',
      data: { id: '1', title: 'Updated' },
      timestamp: Date.now(),
      description: 'Update task'
    }
    history.addAction(action2)
    expect(history.canUndo.value).toBe(true) // Can undo now

    history.undo()
    expect(history.canUndo.value).toBe(false) // Can't undo first action
  })

  it('should check canRedo correctly', () => {
    expect(history.canRedo.value).toBe(false)

    const action: HistoryAction = {
      type: 'CREATE',
      data: { id: '1', title: 'Test Task' },
      timestamp: Date.now(),
      description: 'Create task'
    }

    history.addAction(action)
    expect(history.canRedo.value).toBe(false)

    const action2: HistoryAction = {
      type: 'UPDATE',
      data: { id: '1', title: 'Updated' },
      timestamp: Date.now(),
      description: 'Update task'
    }
    history.addAction(action2)
    expect(history.canRedo.value).toBe(false)

    history.undo()
    expect(history.canRedo.value).toBe(true)

    history.redo()
    expect(history.canRedo.value).toBe(false)
  })

  it('should return current action', () => {
    const action: HistoryAction = {
      type: 'CREATE',
      data: { id: '1', title: 'Test Task' },
      timestamp: Date.now(),
      description: 'Create task'
    }

    expect(history.currentAction.value).toBeNull()

    history.addAction(action)
    expect(history.currentAction.value).toEqual(action)

    const action2: HistoryAction = {
      type: 'UPDATE',
      data: { id: '1', title: 'Updated' },
      timestamp: Date.now(),
      description: 'Update task'
    }
    history.addAction(action2)
    expect(history.currentAction.value).toEqual(action2)

    history.undo()
    expect(history.currentAction.value).toEqual(action)
  })

  it('should clear history', () => {
    const action: HistoryAction = {
      type: 'CREATE',
      data: { id: '1', title: 'Test Task' },
      timestamp: Date.now(),
      description: 'Create task'
    }

    history.addAction(action)
    expect(history.history.value.length).toBe(1)

    history.clearHistory()
    expect(history.history.value.length).toBe(0)
    expect(history.currentHistoryIndex.value).toBe(-1)
  })

  it('should limit history size to max', () => {
    // Add more than max history size (50)
    for (let i = 0; i < 60; i++) {
      const action: HistoryAction = {
        type: 'CREATE',
        data: { id: `${i}`, title: `Task ${i}` },
        timestamp: Date.now(),
        description: `Create task ${i}`
      }
      history.addAction(action)
    }

    expect(history.history.value.length).toBe(50)
  })

  it('should remove future actions when adding after undo', () => {
    const action1: HistoryAction = {
      type: 'CREATE',
      data: { id: '1', title: 'Task 1' },
      timestamp: Date.now(),
      description: 'Create task 1'
    }

    const action2: HistoryAction = {
      type: 'UPDATE',
      data: { id: '1', title: 'Task 1 Updated' },
      timestamp: Date.now(),
      description: 'Update task 1'
    }

    const action3: HistoryAction = {
      type: 'DELETE',
      data: { id: '1' },
      timestamp: Date.now(),
      description: 'Delete task 1'
    }

    history.addAction(action1)
    history.addAction(action2)
    history.undo()

    // Add new action after undo
    history.addAction(action3)

    expect(history.history.value.length).toBe(2)
    expect(history.history.value[1]).toEqual(action3)
  })

  it('should track history size', () => {
    expect(history.historySize.value).toBe(0)

    const action: HistoryAction = {
      type: 'CREATE',
      data: { id: '1', title: 'Test Task' },
      timestamp: Date.now(),
      description: 'Create task'
    }

    history.addAction(action)
    expect(history.historySize.value).toBe(1)
  })

  it('should support different action types', () => {
    const createAction: HistoryAction = {
      type: 'CREATE',
      data: { id: '1', title: 'Task 1' },
      timestamp: Date.now(),
      description: 'Create task'
    }

    const updateAction: HistoryAction = {
      type: 'UPDATE',
      data: { id: '1', title: 'Updated' },
      timestamp: Date.now(),
      description: 'Update task'
    }

    const deleteAction: HistoryAction = {
      type: 'DELETE',
      data: { id: '1' },
      timestamp: Date.now(),
      description: 'Delete task'
    }

    const moveAction: HistoryAction = {
      type: 'MOVE',
      data: { id: '1', fromColumn: 'col-1', toColumn: 'col-2' },
      timestamp: Date.now(),
      description: 'Move task'
    }

    history.addAction(createAction)
    history.addAction(updateAction)
    history.addAction(deleteAction)
    history.addAction(moveAction)

    expect(history.history.value.length).toBe(4)
    expect(history.history.value[0].type).toBe('CREATE')
    expect(history.history.value[1].type).toBe('UPDATE')
    expect(history.history.value[2].type).toBe('DELETE')
    expect(history.history.value[3].type).toBe('MOVE')
  })
})
