-- Add description column to sales table to store product/service description from catalog
ALTER TABLE sales ADD COLUMN IF NOT EXISTS description TEXT;

-- Add comment
COMMENT ON COLUMN sales.description IS 'Descrição do produto/serviço do catálogo no momento da venda';
