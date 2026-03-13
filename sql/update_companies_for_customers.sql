-- Atualização da tabela companies para suportar sistema de clientes
-- Adiciona campos necessários para cadastro completo de clientes

-- Adicionar campos que podem estar faltando
ALTER TABLE companies ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS segment TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS sales_rep TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS document TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address_zipcode TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address_street TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address_number TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address_complement TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address_neighborhood TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address_city TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address_state TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_companies_birthday ON companies(birthday);
CREATE INDEX IF NOT EXISTS idx_companies_segment ON companies(segment);
CREATE INDEX IF NOT EXISTS idx_companies_document ON companies(document);
CREATE INDEX IF NOT EXISTS idx_companies_tags ON companies USING GIN(tags);

-- Comentários para documentação
COMMENT ON COLUMN companies.birthday IS 'Data de aniversário do cliente';
COMMENT ON COLUMN companies.segment IS 'Segmento ou ramo de atividade';
COMMENT ON COLUMN companies.sales_rep IS 'Responsável ou vendedor';
COMMENT ON COLUMN companies.document IS 'CPF ou CNPJ do cliente';
COMMENT ON COLUMN companies.tags IS 'Tags para categorização do cliente';
