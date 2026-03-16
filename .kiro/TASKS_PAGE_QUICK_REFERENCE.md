# Tasks Page - Quick Reference

## File Structure
```
app/
├── pages/
│   └── tarefas.vue                    # Page wrapper (renders KTasksPage)
└── components/
    ├── tasks/
    │   ├── KTasksPage.vue             # ✨ MAIN CONTAINER (rewritten)
    │   ├── KTasksViewToggle.vue       # View mode toggle
    │   ├── KTasksBulkActionsBar.vue   # Bulk actions
    │   ├── KTasksListView.vue         # List view
    │   ├── KTasksGridViewContainer.vue # Grid view
    │   ├── KTasksCalendarView.vue     # Calendar view
    │   ├── KRenameColumnModal.vue     # Rename column modal
    │   └── kanban/
    │       └── KTasksKanbanColumn.vue # (not used in new implementation)
    └── blocks/
        └── KTaskModal.vue             # Task create/edit modal
```

## Key Functions in KTasksPage.vue

### Column Management
```typescript
handleAddColumn()           // Create new column
handleRenameColumn()        // Open rename modal
handleSaveColumnName()      // Save column name and color
handleDeleteColumn()        // Delete column
```

### Task Management
```typescript
openTaskModal()             // Open task modal (create/edit)
closeTaskModal()            // Close task modal
handleSaveTask()            // Save task (from modal)
deleteTask()                // Delete single task
handleDeleteTask()          // Delete task from list view
deleteSelectedTasks()       // Delete multiple selected tasks
```

### Helpers
```typescript
getTasksInColumn()          // Get tasks in a column (sorted)
formatDate()                // Format date for display
```

### History
```typescript
undo()                      // Undo last action (Ctrl+Z)
redo()                      // Redo last action (Ctrl+Y)
```

## Composables Used

| Composable | Purpose | Key Functions |
|-----------|---------|---------------|
| `useTaskHandlers` | Task CRUD | createTask, updateTask, deleteTask, fetchTasks |
| `useKanbanColumns` | Column management | addColumn, updateColumn, deleteColumn, fetchColumns |
| `useTaskSelection` | Bulk selection | toggleTaskSelection, selectAll, deselectAll |
| `useTaskHistory` | Undo/Redo | addToHistory, undo, redo |
| `useCompanies` | Company data | fetchCompanies |
| `useTags` | Tag definitions | fetchTags |

## UI Components Used

| Component | Purpose |
|-----------|---------|
| `LayoutsKPageLayout` | Page layout wrapper |
| `UiKLoader` | Loading indicator |
| `TasksKTasksViewToggle` | View mode toggle |
| `TasksKTasksListView` | List view |
| `TasksKTasksGridViewContainer` | Grid view |
| `TasksKTasksCalendarView` | Calendar view |
| `TasksKTasksBulkActionsBar` | Bulk actions bar |
| `BlocksKTaskModal` | Task modal |
| `TasksKRenameColumnModal` | Rename column modal |

## View Modes

| Mode | Component | Features |
|------|-----------|----------|
| Kanban | Inline in KTasksPage | Columns, cards, drag-drop ready |
| List | KTasksListView | Table with filters and selection |
| Grid | KTasksGridViewContainer | Card grid with selection |
| Calendar | KTasksCalendarView | Calendar view of tasks |

## Event Flow

### Creating a Task
1. User clicks "+" button in column header
2. `openTaskModal(undefined, columnId)` called
3. Task modal opens with column pre-selected
4. User fills form and clicks "Salvar"
5. `handleSaveTask()` called
6. Task created via `useTaskHandlers`
7. Modal closes, tasks refreshed

### Editing a Task
1. User clicks task card
2. `openTaskModal(task)` called
3. Task modal opens with task data
4. User modifies and clicks "Salvar"
5. `handleSaveTask()` called
6. Task updated via `useTaskHandlers`
7. Modal closes, tasks refreshed

### Deleting a Task
1. User clicks "X" button on card
2. `deleteTask(taskId)` called
3. Task deleted via `useTaskHandlers`
4. Tasks refreshed

### Creating a Column
1. User clicks "Nova Coluna" button
2. `handleAddColumn()` called
3. Prompt for column name
4. Column created via `useKanbanColumns`
5. Columns refreshed

### Renaming a Column
1. User clicks edit button in column header
2. `handleRenameColumn()` called
3. Rename modal opens
4. User enters new name and color
5. `handleSaveColumnName()` called
6. Column updated via `useKanbanColumns`
7. Modal closes, columns refreshed

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Cmd+Z | Undo (Mac) |
| Cmd+Y | Redo (Mac) |

## Real-time Updates

The component subscribes to Supabase `postgres_changes` on the `tasks` table:
- Any change triggers `handlerFetchTasks()`
- Tasks are refreshed automatically
- No manual refresh needed

## Styling

### Tailwind Classes Used
- `flex`, `gap-3`, `overflow-x-auto` - Horizontal scroll layout
- `w-[280px]` - Column width
- `bg-[#1a1a1c]` - Dark background
- `border-white/5` - Subtle borders
- `hover:bg-white/10` - Hover effects
- `transition-all` - Smooth animations

### Custom Scrollbar
- Thin scrollbar (5px)
- Transparent track
- Semi-transparent thumb
- Hover effect

## Performance Considerations

- Tasks are sorted by position within each column
- No unnecessary re-renders (Vue 3 reactivity)
- Proper cleanup on unmount
- Real-time sync doesn't block UI
- Modals are rendered conditionally

## Error Handling

- Try-catch in onMounted for initialization
- Error logging to console
- Graceful fallbacks
- User confirmations for destructive actions

## Future Improvements

1. **Drag-drop** - Add drag-drop between columns
2. **Virtualization** - For 100+ tasks per column
3. **Filters** - Advanced filtering options
4. **Search** - Global task search
5. **Keyboard shortcuts** - More shortcuts for power users
6. **Animations** - Smooth transitions for CRUD operations

---

**Last Updated**: March 15, 2026
**Status**: ✅ Production Ready
