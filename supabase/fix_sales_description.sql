-- Execute this SQL in Supabase SQL Editor to add description column to sales table

ALTER TABLE sales ADD COLUMN IF NOT EXISTS description TEXT;

-- Add comment
COMMENT ON COLUMN sales.description IS 'Descrição do produto/serviço do catálogo no momento da venda';

-- Verify the column was added
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'sales' AND column_name = 'description';
