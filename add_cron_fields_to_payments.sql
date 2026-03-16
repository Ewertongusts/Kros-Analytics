-- Adicionar campos de CRON à tabela payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS cron_enabled BOOLEAN DEFAULT false;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS cron_period VARCHAR(20);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS cron_scheduled_time TIME;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS cron_next_execution TIMESTAMP;

-- Criar índice para melhorar performance de queries
CREATE INDEX IF NOT EXISTS idx_payments_cron_enabled ON payments(cron_enabled);
CREATE INDEX IF NOT EXISTS idx_payments_cron_next_execution ON payments(cron_next_execution) WHERE cron_enabled = true;
