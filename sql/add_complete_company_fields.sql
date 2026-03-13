-- Adicionar campos completos para cadastro de empresas/clientes
-- Campos de identificação e contato
ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone TEXT; -- Telefone fixo
ALTER TABLE companies ADD COLUMN IF NOT EXISTS website TEXT; -- Site da empresa
ALTER TABLE companies ADD COLUMN IF NOT EXISTS birthday DATE; -- Data de aniversário

-- Campos de endereço
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address_zipcode TEXT; -- CEP
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address_street TEXT; -- Rua/Avenida
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address_number TEXT; -- Número
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address_complement TEXT; -- Complemento
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address_neighborhood TEXT; -- Bairro
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address_city TEXT; -- Cidade
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address_state TEXT; -- Estado (UF)

-- Campo de responsável/vendedor
ALTER TABLE companies ADD COLUMN IF NOT EXISTS sales_rep TEXT; -- Representante/Vendedor responsável

-- Índices para melhor performance (apenas nas novas colunas)
CREATE INDEX IF NOT EXISTS idx_companies_birthday ON companies(birthday);
CREATE INDEX IF NOT EXISTS idx_companies_sales_rep ON companies(sales_rep);
CREATE INDEX IF NOT EXISTS idx_companies_address_zipcode ON companies(address_zipcode);

-- Comentários para documentação (apenas para novas colunas)
COMMENT ON COLUMN companies.phone IS 'Telefone fixo da empresa/cliente';
COMMENT ON COLUMN companies.website IS 'Site ou URL da empresa';
COMMENT ON COLUMN companies.birthday IS 'Data de aniversário do cliente/representante';
COMMENT ON COLUMN companies.address_zipcode IS 'CEP do endereço';
COMMENT ON COLUMN companies.address_street IS 'Rua, avenida ou logradouro';
COMMENT ON COLUMN companies.address_number IS 'Número do endereço';
COMMENT ON COLUMN companies.address_complement IS 'Complemento (apto, sala, etc)';
COMMENT ON COLUMN companies.address_neighborhood IS 'Bairro';
COMMENT ON COLUMN companies.address_city IS 'Cidade';
COMMENT ON COLUMN companies.address_state IS 'Estado (UF)';
COMMENT ON COLUMN companies.sales_rep IS 'Nome do representante/vendedor responsável';
