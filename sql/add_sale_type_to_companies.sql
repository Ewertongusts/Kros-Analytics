-- Adicionar campo sale_type à tabela companies
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS sale_type TEXT CHECK (sale_type IN ('plano', 'servico', 'produto', 'personalizado'));

-- Comentário
COMMENT ON COLUMN companies.sale_type IS 'Tipo de venda: plano, servico, produto ou personalizado';

-- Atualizar registros existentes para definir um tipo padrão baseado no plan_name
UPDATE companies 
SET sale_type = CASE 
  WHEN plan_name = 'Personalizado' THEN 'personalizado'
  ELSE 'plano'
END
WHERE sale_type IS NULL;
