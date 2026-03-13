-- Tabela de histórico de ações em pagamentos/assinaturas
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'created', 'updated', 'paid', 'reversed', 'auto_billing_enabled', 'auto_billing_disabled', 'tag_added', 'tag_removed', 'batch_paid', 'batch_reversed', 'message_sent'
  description TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  metadata JSONB, -- dados extras como: old_value, new_value, tags, message_template, etc
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_payment_history_payment_id ON payment_history(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_company_id ON payment_history(company_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON payment_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_history_action_type ON payment_history(action_type);

-- RLS Policies
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários autenticados podem visualizar histórico" ON payment_history;
CREATE POLICY "Usuários autenticados podem visualizar histórico"
  ON payment_history FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Usuários autenticados podem inserir histórico" ON payment_history;
CREATE POLICY "Usuários autenticados podem inserir histórico"
  ON payment_history FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Comentários
COMMENT ON TABLE payment_history IS 'Histórico de todas as ações realizadas em pagamentos e assinaturas';
COMMENT ON COLUMN payment_history.action_type IS 'Tipo de ação: created, updated, paid, reversed, auto_billing_enabled, auto_billing_disabled, tag_added, tag_removed, batch_paid, batch_reversed, message_sent';
COMMENT ON COLUMN payment_history.metadata IS 'Dados adicionais em JSON: old_value, new_value, tags, message_template, batch_count, etc';
