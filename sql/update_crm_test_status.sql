-- Adiciona campos de rastreamento de teste nas configurações do CRM
ALTER TABLE crm_settings 
ADD COLUMN IF NOT EXISTS last_test_status text,
ADD COLUMN IF NOT EXISTS last_test_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS last_test_response text;

-- Adiciona coluna de tipo nos logs de mensagem para distinguir testes de cobranças reais
ALTER TABLE message_logs 
ADD COLUMN IF NOT EXISTS log_type text DEFAULT 'billing';

-- Atualiza políticas se necessário (geralmente não precisa se for apenas novas colunas)
