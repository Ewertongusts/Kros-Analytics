-- Criar tabela subscriptions separada
-- Esta tabela gerencia assinaturas de clientes com planos

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  
  -- Informações da assinatura
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'trial', 'suspended', 'cancelled')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  due_day INTEGER NOT NULL DEFAULT 10 CHECK (due_day >= 1 AND due_day <= 31),
  
  -- Valores
  amount DECIMAL(10, 2) NOT NULL,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  
  -- Automação
  auto_billing_enabled BOOLEAN DEFAULT false,
  auto_billing_message TEXT,
  
  -- Observações e metadados
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Índices
  CONSTRAINT subscriptions_customer_plan_unique UNIQUE (customer_id, plan_id, status)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_start_date ON subscriptions(start_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_due_day ON subscriptions(due_day);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON subscriptions(created_at);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- Comentários para documentação
COMMENT ON TABLE subscriptions IS 'Assinaturas de clientes com planos recorrentes';
COMMENT ON COLUMN subscriptions.customer_id IS 'Referência ao cliente (companies)';
COMMENT ON COLUMN subscriptions.plan_id IS 'Referência ao plano contratado';
COMMENT ON COLUMN subscriptions.status IS 'Status da assinatura: active, pending, trial, suspended, cancelled';
COMMENT ON COLUMN subscriptions.start_date IS 'Data de início da assinatura';
COMMENT ON COLUMN subscriptions.end_date IS 'Data de término (se cancelada)';
COMMENT ON COLUMN subscriptions.due_day IS 'Dia de vencimento mensal (1-31)';
COMMENT ON COLUMN subscriptions.amount IS 'Valor da assinatura';
COMMENT ON COLUMN subscriptions.discount_percent IS 'Desconto percentual aplicado';
COMMENT ON COLUMN subscriptions.discount_amount IS 'Desconto em valor fixo';
COMMENT ON COLUMN subscriptions.auto_billing_enabled IS 'Se cobrança automática está ativa';
COMMENT ON COLUMN subscriptions.auto_billing_message IS 'Mensagem personalizada para cobrança automática';
COMMENT ON COLUMN subscriptions.notes IS 'Observações sobre a assinatura';
COMMENT ON COLUMN subscriptions.metadata IS 'Dados adicionais em formato JSON';

-- RLS Policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários autenticados podem ver todas as assinaturas
CREATE POLICY "Authenticated users can view subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Usuários autenticados podem criar assinaturas
CREATE POLICY "Authenticated users can create subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Usuários autenticados podem atualizar assinaturas
CREATE POLICY "Authenticated users can update subscriptions"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Usuários autenticados podem deletar assinaturas
CREATE POLICY "Authenticated users can delete subscriptions"
  ON subscriptions FOR DELETE
  TO authenticated
  USING (true);
