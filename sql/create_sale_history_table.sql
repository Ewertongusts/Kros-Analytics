-- Tabela de histórico de ações em vendas
CREATE TABLE IF NOT EXISTS sale_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'whatsapp_sent'
  description TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  metadata JSONB, -- dados extras como: product_name, amount, customer_name, old_value, new_value, etc
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_sale_history_sale_id ON sale_history(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_history_created_at ON sale_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sale_history_action_type ON sale_history(action_type);

-- RLS Policies
ALTER TABLE sale_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários autenticados podem visualizar histórico de vendas" ON sale_history;
CREATE POLICY "Usuários autenticados podem visualizar histórico de vendas"
  ON sale_history FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Usuários autenticados podem inserir histórico de vendas" ON sale_history;
CREATE POLICY "Usuários autenticados podem inserir histórico de vendas"
  ON sale_history FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Comentários
COMMENT ON TABLE sale_history IS 'Histórico de todas as ações realizadas em vendas';
COMMENT ON COLUMN sale_history.action_type IS 'Tipo de ação: created, updated, deleted, whatsapp_sent';
COMMENT ON COLUMN sale_history.metadata IS 'Dados adicionais em JSON: product_name, amount, customer_name, old_value, new_value, etc';
