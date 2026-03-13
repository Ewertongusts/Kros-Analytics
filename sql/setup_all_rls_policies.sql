-- ============================================
-- CORREÇÃO COMPLETA DE RLS PARA TODAS AS TABELAS
-- ============================================
-- Execute este script para corrigir o RLS de todas as tabelas do sistema
-- Use sempre que precisar reconfigurar as políticas de segurança

-- ============================================
-- TABELA: plans (Catálogo de Produtos)
-- ============================================
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to read plans" ON plans;
DROP POLICY IF EXISTS "Allow authenticated users to insert plans" ON plans;
DROP POLICY IF EXISTS "Allow authenticated users to update plans" ON plans;
DROP POLICY IF EXISTS "Allow authenticated users to delete plans" ON plans;
CREATE POLICY "Allow authenticated users to read plans" ON plans FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert plans" ON plans FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update plans" ON plans FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete plans" ON plans FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================
-- TABELA: plan_categories (Categorias de Planos)
-- ============================================
ALTER TABLE plan_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to read plan categories" ON plan_categories;
DROP POLICY IF EXISTS "Allow authenticated users to insert plan categories" ON plan_categories;
DROP POLICY IF EXISTS "Allow authenticated users to update plan categories" ON plan_categories;
DROP POLICY IF EXISTS "Allow authenticated users to delete plan categories" ON plan_categories;
CREATE POLICY "Allow authenticated users to read plan categories" ON plan_categories FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert plan categories" ON plan_categories FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update plan categories" ON plan_categories FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete plan categories" ON plan_categories FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================
-- TABELA: companies (Empresas/Vendas)
-- ============================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to read companies" ON companies;
DROP POLICY IF EXISTS "Allow authenticated users to insert companies" ON companies;
DROP POLICY IF EXISTS "Allow authenticated users to update companies" ON companies;
DROP POLICY IF EXISTS "Allow authenticated users to delete companies" ON companies;
CREATE POLICY "Allow authenticated users to read companies" ON companies FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert companies" ON companies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update companies" ON companies FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete companies" ON companies FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================
-- TABELA: payments (Pagamentos/Assinaturas)
-- ============================================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to read payments" ON payments;
DROP POLICY IF EXISTS "Allow authenticated users to insert payments" ON payments;
DROP POLICY IF EXISTS "Allow authenticated users to update payments" ON payments;
DROP POLICY IF EXISTS "Allow authenticated users to delete payments" ON payments;
CREATE POLICY "Allow authenticated users to read payments" ON payments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert payments" ON payments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update payments" ON payments FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete payments" ON payments FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================
-- TABELA: message_logs (Logs de Mensagens)
-- ============================================
ALTER TABLE message_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to read message logs" ON message_logs;
DROP POLICY IF EXISTS "Allow authenticated users to insert message logs" ON message_logs;
CREATE POLICY "Allow authenticated users to read message logs" ON message_logs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert message logs" ON message_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- TABELA: message_templates (Modelos de Mensagem)
-- ============================================
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to read message templates" ON message_templates;
DROP POLICY IF EXISTS "Allow authenticated users to insert message templates" ON message_templates;
DROP POLICY IF EXISTS "Allow authenticated users to update message templates" ON message_templates;
DROP POLICY IF EXISTS "Allow authenticated users to delete message templates" ON message_templates;
CREATE POLICY "Allow authenticated users to read message templates" ON message_templates FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert message templates" ON message_templates FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update message templates" ON message_templates FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete message templates" ON message_templates FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================
-- TABELA: tag_definitions (Tags de Negócio)
-- ============================================
ALTER TABLE tag_definitions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to read tag definitions" ON tag_definitions;
DROP POLICY IF EXISTS "Allow authenticated users to insert tag definitions" ON tag_definitions;
DROP POLICY IF EXISTS "Allow authenticated users to update tag definitions" ON tag_definitions;
DROP POLICY IF EXISTS "Allow authenticated users to delete tag definitions" ON tag_definitions;
CREATE POLICY "Allow authenticated users to read tag definitions" ON tag_definitions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert tag definitions" ON tag_definitions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update tag definitions" ON tag_definitions FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete tag definitions" ON tag_definitions FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================
-- TABELA: white_label_settings (Configurações White Label)
-- ============================================
ALTER TABLE white_label_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to read white label settings" ON white_label_settings;
DROP POLICY IF EXISTS "Allow authenticated users to insert white label settings" ON white_label_settings;
DROP POLICY IF EXISTS "Allow authenticated users to update white label settings" ON white_label_settings;
CREATE POLICY "Allow authenticated users to read white label settings" ON white_label_settings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert white label settings" ON white_label_settings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update white label settings" ON white_label_settings FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- TABELA: crm_settings (Configurações CRM)
-- ============================================
ALTER TABLE crm_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to read crm settings" ON crm_settings;
DROP POLICY IF EXISTS "Allow authenticated users to insert crm settings" ON crm_settings;
DROP POLICY IF EXISTS "Allow authenticated users to update crm settings" ON crm_settings;
CREATE POLICY "Allow authenticated users to read crm settings" ON crm_settings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert crm settings" ON crm_settings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update crm settings" ON crm_settings FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- TABELA: sale_history (Histórico de Vendas)
-- ============================================
ALTER TABLE sale_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to read sale history" ON sale_history;
DROP POLICY IF EXISTS "Allow authenticated users to insert sale history" ON sale_history;
CREATE POLICY "Allow authenticated users to read sale history" ON sale_history FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert sale history" ON sale_history FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- TABELA: transactions (Despesas)
-- ============================================
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to read transactions" ON transactions;
DROP POLICY IF EXISTS "Allow authenticated users to insert transactions" ON transactions;
DROP POLICY IF EXISTS "Allow authenticated users to update transactions" ON transactions;
DROP POLICY IF EXISTS "Allow authenticated users to delete transactions" ON transactions;
CREATE POLICY "Allow authenticated users to read transactions" ON transactions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to update transactions" ON transactions FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to delete transactions" ON transactions FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================
-- TABELA: payment_history (Histórico de Assinaturas)
-- ============================================
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to read payment history" ON payment_history;
DROP POLICY IF EXISTS "Allow authenticated users to insert payment history" ON payment_history;
CREATE POLICY "Allow authenticated users to read payment history" ON payment_history FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users to insert payment history" ON payment_history FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- TABELA: subscriptions (se existir)
-- ============================================
-- Descomente se a tabela existir no seu banco
-- ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Allow authenticated users to read subscriptions" ON subscriptions;
-- DROP POLICY IF EXISTS "Allow authenticated users to insert subscriptions" ON subscriptions;
-- DROP POLICY IF EXISTS "Allow authenticated users to update subscriptions" ON subscriptions;
-- DROP POLICY IF EXISTS "Allow authenticated users to delete subscriptions" ON subscriptions;
-- CREATE POLICY "Allow authenticated users to read subscriptions" ON subscriptions FOR SELECT USING (auth.uid() IS NOT NULL);
-- CREATE POLICY "Allow authenticated users to insert subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
-- CREATE POLICY "Allow authenticated users to update subscriptions" ON subscriptions FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
-- CREATE POLICY "Allow authenticated users to delete subscriptions" ON subscriptions FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Verificar quantos registros existem em cada tabela
SELECT 'plans' as tabela, COUNT(*) as total FROM plans
UNION ALL
SELECT 'plan_categories', COUNT(*) FROM plan_categories
UNION ALL
SELECT 'companies', COUNT(*) FROM companies
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'message_templates', COUNT(*) FROM message_templates
UNION ALL
SELECT 'tag_definitions', COUNT(*) FROM tag_definitions
UNION ALL
SELECT 'white_label_settings', COUNT(*) FROM white_label_settings
UNION ALL
SELECT 'crm_settings', COUNT(*) FROM crm_settings
UNION ALL
SELECT 'sale_history', COUNT(*) FROM sale_history
UNION ALL
SELECT 'payment_history', COUNT(*) FROM payment_history
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions;
