-- Ver colunas da tabela expense_categories
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'expense_categories'
ORDER BY ordinal_position;
