-- Decouple columns from status - allow tasks to be in any column independently
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS column_id VARCHAR(255);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_column_id ON tasks(column_id);

-- Add foreign key constraint (optional, depends on your setup)
-- ALTER TABLE tasks ADD CONSTRAINT fk_tasks_column_id 
-- FOREIGN KEY (column_id) REFERENCES kanban_columns(column_id);
