-- Allow NULL user_id for existing plans
ALTER TABLE plans ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies to allow viewing plans with NULL user_id (shared plans)
DROP POLICY IF EXISTS "Users can view their own plans" ON plans;
DROP POLICY IF EXISTS "Users can create plans" ON plans;
DROP POLICY IF EXISTS "Users can update their own plans" ON plans;
DROP POLICY IF EXISTS "Users can delete their own plans" ON plans;

-- New policies that allow viewing shared plans (NULL user_id) and own plans
CREATE POLICY "Users can view their own and shared plans" ON plans
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can create plans" ON plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans" ON plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans" ON plans
  FOR DELETE USING (auth.uid() = user_id);
