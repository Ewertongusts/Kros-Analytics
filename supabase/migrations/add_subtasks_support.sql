-- Add parent_task_id column to tasks table for subtask support
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE;

-- Create index for parent_task_id for efficient querying
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON public.tasks(parent_task_id);

-- Add column to track subtask completion percentage
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS subtask_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_subtask_count INT DEFAULT 0;

-- Create a view to get subtask statistics
CREATE OR REPLACE VIEW task_subtask_stats AS
SELECT 
  t.id,
  COUNT(st.id) as total_subtasks,
  COUNT(CASE WHEN st.status = 'done' THEN 1 END) as completed_subtasks,
  CASE 
    WHEN COUNT(st.id) = 0 THEN 0
    ELSE ROUND((COUNT(CASE WHEN st.status = 'done' THEN 1 END)::numeric / COUNT(st.id)) * 100)
  END as completion_percentage
FROM public.tasks t
LEFT JOIN public.tasks st ON st.parent_task_id = t.id
GROUP BY t.id;
