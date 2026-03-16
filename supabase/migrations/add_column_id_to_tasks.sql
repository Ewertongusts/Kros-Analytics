-- Add column_id to tasks table for Kanban 2
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS column_id UUID REFERENCES public.kanban_columns(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_column_id ON public.tasks(column_id);

-- Add order column for task ordering within columns
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS task_order INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_tasks_order ON public.tasks(task_order);
