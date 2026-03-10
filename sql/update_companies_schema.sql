-- Atualização da tabela companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS representative_name TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS notes TEXT;

-- Atualização da tabela subscriptions
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'Mensal'; -- Único, Mensal, Trimestral, Semestral, Anual
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS billing_day INTEGER DEFAULT 5; -- Dia do pagamento (1-31)
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS instalment_count INTEGER DEFAULT 1;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS instalment_value NUMERIC DEFAULT 0;
