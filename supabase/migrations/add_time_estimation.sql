-- Add time estimation columns to tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS estimated_days DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS time_unit VARCHAR(20) DEFAULT 'hours' CHECK (time_unit IN ('hours', 'days'));

-- Create index for filtering by estimation
CREATE INDEX IF NOT EXISTS idx_tasks_estimated_hours ON public.tasks(estimated_hours);
CREATE INDEX IF NOT EXISTS idx_tasks_estimated_days ON public.tasks(estimated_days);
