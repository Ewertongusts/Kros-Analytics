-- Corrigir estrutura da tabela plans
-- Execute este script ANTES do complete_migration_to_subscriptions.sql

-- Adicionar coluna id se não existir (algumas versões antigas podem não ter)
DO $$ 
BEGIN
  -- Verificar se a coluna id existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'plans' AND column_name = 'id'
  ) THEN
    -- Se não existe, adicionar
    ALTER TABLE plans ADD COLUMN id UUID DEFAULT gen_random_uuid();
    
    -- Criar constraint de primary key
    ALTER TABLE plans ADD PRIMARY KEY (id);
  END IF;
END $$;

-- Garantir que todas as colunas necessárias existem
ALTER TABLE plans ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Plano Recorrente';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2);
ALTER TABLE plans ADD COLUMN IF NOT EXISTS billing_cycle TEXT;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE plans ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Atualizar valores NULL para defaults
UPDATE plans SET type = 'Plano Recorrente' WHERE type IS NULL;
UPDATE plans SET billing_cycle = 'Mensal' WHERE billing_cycle IS NULL;
UPDATE plans SET created_at = NOW() WHERE created_at IS NULL;
UPDATE plans SET updated_at = NOW() WHERE updated_at IS NULL;

-- Tornar colunas obrigatórias NOT NULL (depois de preencher)
ALTER TABLE plans ALTER COLUMN name SET NOT NULL;
ALTER TABLE plans ALTER COLUMN price SET NOT NULL;
ALTER TABLE plans ALTER COLUMN billing_cycle SET NOT NULL;

-- Criar índice no nome para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_plans_name ON plans(name);

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Tabela plans corrigida com sucesso!';
END $$;
