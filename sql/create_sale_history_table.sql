-- Criação da tabela de histórico de vendas
CREATE TABLE sale_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  action_type text NOT NULL CHECK (action_type IN ('created', 'updated', 'whatsapp_sent', 'receipt_generated', 'status_changed', 'deleted')),
  description text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  user_name text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para melhor performance
CREATE INDEX idx_sale_history_sale_id ON sale_history(sale_id);
CREATE INDEX idx_sale_history_created_at ON sale_history(created_at DESC);
CREATE INDEX idx_sale_history_action_type ON sale_history(action_type);

-- Políticas RLS
ALTER TABLE sale_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read sale history" ON sale_history
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert sale history" ON sale_history
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Não permitir UPDATE ou DELETE no histórico (imutável)
