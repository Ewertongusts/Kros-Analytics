-- ==========================================================
-- SCRIPT DE INICIALIZAÇÃO KROS ANALYTICS
-- ==========================================================

-- 1. TABELA WHITE LABEL (Branding do Sistema)
CREATE TABLE IF NOT EXISTS white_label_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    system_name text NOT NULL DEFAULT 'Kros',
    logo_url text,
    favicon_url text,
    primary_color text NOT NULL DEFAULT '#007BFF',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA DE EMPRESAS (Entidades)
CREATE TABLE IF NOT EXISTS companies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    document text, -- CNPJ/CPF
    logo_url text,
    segment text,
    status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA DE CATEGORIAS
CREATE TABLE IF NOT EXISTS categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('income', 'expense')),
    color text DEFAULT '#6366f1',
    icon text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA DE TRANSAÇÕES (Financeiro)
CREATE TABLE IF NOT EXISTS transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
    category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
    description text NOT NULL,
    amount decimal(12,2) NOT NULL,
    type text NOT NULL CHECK (type IN ('income', 'expense')),
    status text DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
    due_date date NOT NULL,
    paid_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- CONFIGURAÇÕES DE SEGURANÇA (RLS)
-- ==========================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE white_label_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: white_label_settings (Público lê, Autenticado edita)
CREATE POLICY "Leitura pública para White Label" ON white_label_settings FOR SELECT USING (true);
CREATE POLICY "Admin pode gerenciar White Label" ON white_label_settings ALL USING (auth.role() = 'authenticated');

-- POLÍTICAS: companies (Acesso apenas aos próprios dados)
CREATE POLICY "Usuários veem suas próprias empresas" ON companies FOR ALL USING (auth.uid() = user_id);

-- POLÍTICAS: categories
CREATE POLICY "Usuários veem suas próprias categorias" ON categories FOR ALL USING (auth.uid() = user_id);

-- POLÍTICAS: transactions
CREATE POLICY "Usuários veem suas próprias transações" ON transactions FOR ALL USING (auth.uid() = user_id);

-- ==========================================================
-- DADOS INICIAIS
-- ==========================================================

-- Inserir White Label padrão
INSERT INTO white_label_settings (system_name, primary_color)
SELECT 'Kros', '#007BFF'
WHERE NOT EXISTS (SELECT 1 FROM white_label_settings LIMIT 1);
