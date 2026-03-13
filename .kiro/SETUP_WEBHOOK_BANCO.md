# Setup do Webhook - Passo a Passo

## Passo 1: Criar as Tabelas no Supabase

1. Abra **Supabase** (https://supabase.com)
2. Vá em **SQL Editor**
3. Clique em **New Query**
4. Cole este SQL:

```sql
-- Tabela para armazenar eventos de webhook
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(255) NOT NULL,
  source_system VARCHAR(255) NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  received_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela para armazenar configurações de webhook
CREATE TABLE IF NOT EXISTS webhook_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  event_types TEXT[] NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  token VARCHAR(255) NOT NULL,
  retry_count INT DEFAULT 3,
  timeout_seconds INT DEFAULT 30,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela para armazenar tentativas de envio de webhook
CREATE TABLE IF NOT EXISTS webhook_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_config_id UUID REFERENCES webhook_configs(id),
  event_id UUID REFERENCES webhook_events(id),
  status_code INT,
  response TEXT,
  attempt_number INT,
  next_retry_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_source_system ON webhook_events(source_system);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_received_at ON webhook_events(received_at);
CREATE INDEX IF NOT EXISTS idx_webhook_attempts_webhook_config_id ON webhook_attempts(webhook_config_id);
CREATE INDEX IF NOT EXISTS idx_webhook_attempts_event_id ON webhook_attempts(event_id);
```

5. Clique em **Run**
6. Aguarde a mensagem de sucesso

## Passo 2: Configurar Variáveis de Ambiente

1. Abra o arquivo `.env` na raiz do projeto
2. Adicione:

```env
WEBHOOK_TOKEN=seu-token-super-secreto-aqui
```

Gere um token seguro:
```bash
node -e "console.log(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))"
```

Exemplo:
```env
WEBHOOK_TOKEN=abc123xyz789def456ghi789
```

3. Salve o arquivo
4. **Reinicie o servidor** (Ctrl+C e `npm run dev`)

## Passo 3: Testar

1. Abra http://localhost:3000/ajustes?tab=webhooks
2. Clique em "🧪 Enviar Evento Teste"
3. Você deve ver:
   - ✅ Mensagem de sucesso
   - ✅ Evento aparecendo na aba "Eventos"
   - ✅ Log aparecendo na aba "Logs"

## Passo 4: Criar um Webhook

1. Na aba "Configurações", clique em "+ Novo Webhook"
2. Preencha:
   - **Nome**: Whatsmew CRM
   - **URL**: https://seu-crm.com/webhook
   - **Eventos**: Selecione os eventos que quer receber
   - **Ativo**: Marque a caixa
3. Clique em "Salvar"

## Passo 5: Configurar no Whatsmew

1. Abra seu Whatsmew
2. Configure o webhook para enviar para:
   ```
   https://seu-projeto.vercel.app/api/webhooks/events
   ```
3. Adicione o header:
   ```
   x-webhook-token: seu-token-super-secreto-aqui
   ```

## Troubleshooting

### Erro 500 ao criar webhook
- Verifique se as tabelas foram criadas no Supabase
- Verifique se o SQL foi executado sem erros
- Tente novamente

### Erro "Unauthorized" (401)
- Verifique se o token no `.env` está correto
- Reinicie o servidor
- Verifique se não há espaços extras

### Evento teste não aparece
- Verifique se a tabela `webhook_events` existe
- Verifique os logs do console (F12)
- Tente recarregar a página

## Próximos Passos

✅ Criar as tabelas no Supabase
✅ Configurar WEBHOOK_TOKEN no .env
✅ Testar com evento de teste
✅ Criar webhook
✅ Configurar no Whatsmew
✅ Receber leads em tempo real!
