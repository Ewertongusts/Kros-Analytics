# Tasks Kanban - Columns Fix

## Problem
Tasks were appearing in the list view but not in the kanban view. The kanban view showed only one empty column ("asdsada") with no tasks.

## Root Causes

### 1. Missing Columns in Database
The `kanban_columns` table was empty or didn't have columns for the user. The old implementation didn't filter by `user_id`, so it was trying to fetch all columns without proper filtering.

### 2. Tasks Without column_id
Old tasks didn't have `column_id` set, so they weren't being displayed in any kanban column.

### 3. No Default Columns
When a user had no columns, the system didn't create default columns automatically.

## Solution

### 1. Fixed useKanbanColumns.ts
- Added `user_id` filter to all queries (fetchColumns, updateColumn, deleteColumn, moveColumn)
- Added automatic creation of default columns when none exist:
  - "A Fazer" (col_todo) - Blue
  - "Em Progresso" (col_in_progress) - Amber
  - "Concluído" (col_done) - Green

```typescript
// If no columns found, create defaults
if (!data || data.length === 0) {
  const defaultColumns = [
    { column_id: 'col_todo', name: 'A Fazer', color: '#3b82f6', status: 'todo', position: 0 },
    { column_id: 'col_in_progress', name: 'Em Progresso', color: '#f59e0b', status: 'in_progress', position: 1 },
    { column_id: 'col_done', name: 'Concluído', color: '#10b981', status: 'done', position: 2 }
  ]
}
```

### 2. Fixed useTasks.ts
- Added automatic column assignment based on task status
- Tasks without `column_id` are now assigned to the default column matching their status:
  - status: 'todo' → column_id: 'col_todo'
  - status: 'in_progress' → column_id: 'col_in_progress'
  - status: 'done' → column_id: 'col_done'

```typescript
// Assign default column_id based on status if not set
const processedTasks = (data || []).map(task => {
  if (!task.column_id) {
    if (task.status === 'todo') {
      task.column_id = 'col_todo'
    } else if (task.status === 'in_progress') {
      task.column_id = 'col_in_progress'
    } else if (task.status === 'done') {
      task.column_id = 'col_done'
    }
  }
  return task
})
```

## How It Works Now

### On First Load
1. User opens `/tarefas` page
2. `fetchColumns()` is called
3. If no columns exist in database:
   - Creates 3 default columns (A Fazer, Em Progresso, Concluído)
   - Saves them to database
4. `fetchTasks()` is called
5. All tasks are loaded and assigned to columns based on their status
6. Kanban view displays all columns with their tasks

### On Subsequent Loads
1. User opens `/tarefas` page
2. `fetchColumns()` fetches existing columns from database
3. `fetchTasks()` fetches tasks and assigns them to columns
4. Kanban view displays columns and tasks

## Files Modified

### app/composables/useKanbanColumns.ts
- Added `user_id` filter to `fetchColumns()` query
- Added automatic default column creation
- Added `user_id` filter to `updateColumn()` query
- Added `user_id` filter to `deleteColumn()` query
- Added `user_id` filter to `moveColumn()` query

### app/composables/useTasks.ts
- Added automatic `column_id` assignment in `fetchTasks()` based on task status

## Testing

### Manual Testing
1. Open `/tarefas` page
2. Verify kanban view shows 3 columns:
   - "A Fazer" (blue)
   - "Em Progresso" (amber)
   - "Concluído" (green)
3. Verify all tasks appear in their respective columns based on status
4. Verify list view still works
5. Verify grid view still works
6. Verify calendar view still works

### Expected Behavior
- Tasks with status 'todo' appear in "A Fazer" column
- Tasks with status 'in_progress' appear in "Em Progresso" column
- Tasks with status 'done' appear in "Concluído" column
- Can create new columns
- Can rename columns
- Can delete columns
- Can create new tasks
- Can edit tasks
- Can delete tasks

## Database Schema

### kanban_columns table
```sql
CREATE TABLE kanban_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  column_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  status TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, column_id)
);
```

### tasks table (relevant columns)
```sql
ALTER TABLE tasks ADD COLUMN column_id TEXT;
ALTER TABLE tasks ADD COLUMN position INTEGER DEFAULT 0;
```

## Performance Notes
- Default columns are created only once per user
- Column queries are filtered by user_id for security and performance
- Task column assignment happens in memory (no database updates)
- Existing tasks are not modified in database (only in memory)

## Future Improvements
1. Add migration to update existing tasks with column_id in database
2. Add drag-drop between columns
3. Add column reordering
4. Add custom column creation UI
5. Add column color picker

---

**Status**: ✅ FIXED - Kanban now displays columns and tasks correctly
**Date**: March 15, 2026
