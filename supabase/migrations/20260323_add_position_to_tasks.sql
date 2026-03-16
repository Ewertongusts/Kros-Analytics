-- Add position and column_id columns to tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS position NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS column_id VARCHAR(255);

-- Create index for position
CREATE INDEX IF NOT EXISTS idx_tasks_column_id_position ON public.tasks(column_id, position);

-- Update existing tasks to have default position based on creation order
UPDATE public.tasks 
SET position = ROW_NUMBER() OVER (PARTITION BY column_id ORDER BY created_at ASC) - 1
WHERE position = 0 OR position IS NULL;
