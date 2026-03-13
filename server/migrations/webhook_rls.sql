-- Desativar RLS nas tabelas de webhook
ALTER TABLE webhook_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_configs DISABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_attempts DISABLE ROW LEVEL SECURITY;

-- Ou, se preferir manter RLS, criar políticas permissivas:
-- ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all for webhook_events" ON webhook_events FOR ALL USING (true) WITH CHECK (true);

-- ALTER TABLE webhook_configs ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all for webhook_configs" ON webhook_configs FOR ALL USING (true) WITH CHECK (true);

-- ALTER TABLE webhook_attempts ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all for webhook_attempts" ON webhook_attempts FOR ALL USING (true) WITH CHECK (true);
