-- Create kanban_columns table
CREATE TABLE IF NOT EXISTS public.kanban_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  column_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#8b5cf6',
  status VARCHAR(255) NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, column_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_kanban_columns_user_id ON public.kanban_columns(user_id);
CREATE INDEX IF NOT EXISTS idx_kanban_columns_position ON public.kanban_columns(position);

-- Enable RLS
ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own columns
CREATE POLICY "Users can view their own columns"
ON public.kanban_columns
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can insert their own columns
CREATE POLICY "Users can insert their own columns"
ON public.kanban_columns
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own columns
CREATE POLICY "Users can update their own columns"
ON public.kanban_columns
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own columns
CREATE POLICY "Users can delete their own columns"
ON public.kanban_columns
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
