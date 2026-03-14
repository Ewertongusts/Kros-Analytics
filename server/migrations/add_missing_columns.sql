-- Adicionar colunas faltantes em expense_categories
ALTER TABLE expense_categories 
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#6B7280';
