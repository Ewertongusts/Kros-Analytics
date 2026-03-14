-- Apenas adicionar a coluna user_id
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id UUID;
