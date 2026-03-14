-- ============================================================================
-- FIX: Adicionar coluna 'is_active' à tabela 'categories'
-- ============================================================================

-- Verificar se a coluna já existe
-- Se não existir, adicionar

ALTER TABLE categories
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Se a tabela categories não tiver RLS habilitado, habilitar
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Criar policies se não existirem
DROP POLICY IF EXISTS "Users can view their own categories" ON categories;
CREATE POLICY "Users can view their own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create categories" ON categories;
CREATE POLICY "Users can create categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
CREATE POLICY "Users can update their own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;
CREATE POLICY "Users can delete their own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- ✅ PRONTO!
-- A coluna 'is_active' foi adicionada à tabela 'categories'
-- ============================================================================
