-- Adicionar índices para melhorar performance de queries por sale_type
CREATE INDEX IF NOT EXISTS idx_companies_sale_type ON companies(sale_type);
CREATE INDEX IF NOT EXISTS idx_companies_sale_type_active ON companies(sale_type, is_active);

-- Comentários
COMMENT ON INDEX idx_companies_sale_type IS 'Índice para filtrar empresas por tipo de venda';
COMMENT ON INDEX idx_companies_sale_type_active IS 'Índice composto para filtrar por tipo de venda e status ativo';
