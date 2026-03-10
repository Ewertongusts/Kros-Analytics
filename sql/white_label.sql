-- Tabela de Configurações White Label
CREATE TABLE IF NOT EXISTS white_label_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  system_name text NOT NULL DEFAULT 'Kros',
  logo_url text,
  favicon_url text,
  primary_color text NOT NULL DEFAULT '#007BFF',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE white_label_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (Leitura pública, Escrita apenas para usuários autenticados)
CREATE POLICY "Allow public read for white_label_settings" ON white_label_settings FOR SELECT USING (true);
CREATE POLICY "Allow update for authenticated users on white_label_settings" ON white_label_settings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow insert for authenticated users on white_label_settings" ON white_label_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Inserir configuração inicial se não existir
INSERT INTO white_label_settings (system_name, primary_color)
SELECT 'Kros', '#007BFF'
WHERE NOT EXISTS (SELECT 1 FROM white_label_settings LIMIT 1);
