-- Add user_id column to plans table for proper multi-tenancy
ALTER TABLE plans ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_plans_user_id ON plans(user_id);

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Allow authenticated users to read plans" ON plans;
DROP POLICY IF EXISTS "Allow authenticated users to insert plans" ON plans;
DROP POLICY IF EXISTS "Allow authenticated users to update plans" ON plans;
DROP POLICY IF EXISTS "Allow authenticated users to delete plans" ON plans;

-- Create new RLS policies that filter by user_id
CREATE POLICY "Users can view their own plans" ON plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create plans" ON plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans" ON plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans" ON plans
  FOR DELETE USING (auth.uid() = user_id);
