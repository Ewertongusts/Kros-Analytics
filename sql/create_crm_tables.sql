-- Tabela para Configurações (Apenas 1 registro esperado)
CREATE TABLE crm_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  api_url text NOT NULL DEFAULT 'https://api.legendaryhub.com.br/api/messages/send',
  api_token text NOT NULL DEFAULT '',
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela para Modelos de Mensagem
CREATE TABLE message_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  body text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserção da configuração padrão (se não existir)
INSERT INTO crm_settings (api_url, api_token) VALUES ('https://api.legendaryhub.com.br/api/messages/send', '') ON CONFLICT DO NOTHING;

-- Políticas RLS
ALTER TABLE crm_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read/write for authenticated users only" ON crm_settings
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable read/write for authenticated users only" ON message_templates
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
