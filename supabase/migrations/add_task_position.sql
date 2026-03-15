-- Add position column to tasks table for ordering within columns
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_status_position ON tasks(status, position);
