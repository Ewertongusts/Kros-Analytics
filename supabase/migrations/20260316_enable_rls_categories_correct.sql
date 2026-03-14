-- Re-enable RLS on expense_categories with correct policies
-- Allow all authenticated users to view all active categories
-- But only allow users to modify their own categories

ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

-- Policy: Allow viewing all active categories (no user_id filter needed)
CREATE POLICY "Users can view all active expense categories" ON expense_categories
  FOR SELECT USING (is_active = true);

-- Policy: Allow creating categories (must set user_id to current user)
CREATE POLICY "Users can create expense categories" ON expense_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Allow updating own categories
CREATE POLICY "Users can update their own expense categories" ON expense_categories
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Allow deleting own categories
CREATE POLICY "Users can delete their own expense categories" ON expense_categories
  FOR DELETE USING (auth.uid() = user_id);
