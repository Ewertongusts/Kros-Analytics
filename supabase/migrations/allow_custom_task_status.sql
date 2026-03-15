-- Remove CHECK constraint from status column to allow custom statuses
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;

-- Add a more flexible constraint (optional - just to ensure it's not null)
ALTER TABLE public.tasks ALTER COLUMN status SET NOT NULL;

-- Update default value to remain 'todo'
ALTER TABLE public.tasks ALTER COLUMN status SET DEFAULT 'todo';
