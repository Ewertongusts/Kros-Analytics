-- Migration: Update existing tasks with column_id based on status
-- This migration assigns column_id to tasks that don't have one

BEGIN;

-- Update tasks with status 'todo' to use col_todo
UPDATE tasks 
SET column_id = 'col_todo'
WHERE column_id IS NULL AND status = 'todo';

-- Update tasks with status 'in_progress' to use col_in_progress
UPDATE tasks 
SET column_id = 'col_in_progress'
WHERE column_id IS NULL AND status = 'in_progress';

-- Update tasks with status 'done' to use col_done
UPDATE tasks 
SET column_id = 'col_done'
WHERE column_id IS NULL AND status = 'done';

-- For any remaining tasks without column_id, default to col_todo
UPDATE tasks 
SET column_id = 'col_todo'
WHERE column_id IS NULL;

COMMIT;
