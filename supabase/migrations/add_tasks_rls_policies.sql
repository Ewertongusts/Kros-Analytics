-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete all tasks" ON public.tasks;

-- Policy: Users can view all tasks
CREATE POLICY "Users can view all tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (true);

-- Policy: Users can insert their own tasks
CREATE POLICY "Users can insert their own tasks"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Policy: Users can update all tasks
CREATE POLICY "Users can update all tasks"
ON public.tasks
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Users can delete all tasks
CREATE POLICY "Users can delete all tasks"
ON public.tasks
FOR DELETE
TO authenticated
USING (true);
