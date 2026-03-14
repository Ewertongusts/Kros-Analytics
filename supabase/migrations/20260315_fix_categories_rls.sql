-- Disable RLS on expense_categories to allow all authenticated users to view all categories
ALTER TABLE expense_categories DISABLE ROW LEVEL SECURITY;
