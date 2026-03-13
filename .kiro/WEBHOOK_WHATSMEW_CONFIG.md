# Configuração de Webhook com WhatsApp API (Whatsmew)

## Como Funciona

```
WhatsApp API (Whatsmew)
    ↓
Novo lead chega
    ↓
Whatsmew envia POST para: https://seu-site.com/api/webhooks/events
    ↓
Sistema recebe e cadastra automaticamente
    ↓
Lead aparece na página de Contatos
```

## Passo 1: Preparar o Banco de Dados

1. Abra **Supabase** (seu banco de dados)
2. Vá em **SQL Editor**
3. Cole este SQL:

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

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_source_system ON webhook_events(source_system);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_received_at ON webhook_events(received_at);
```

4. Clique em **Run**

## Passo 2: Configurar Token de Segurança

1. Abra o arquivo `.env` na raiz do projeto
2. Adicione:

```env
WEBHOOK_TOKEN=seu-token-super-secreto
```

**Gere um token seguro** (copie e cole no terminal):
```bash
node -e "console.log(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))"
```

Exemplo:
```env
WEBHOOK_TOKEN=abc123xyz789def456
```

## Passo 3: Configurar no Whatsmew

### URL do Webhook

Configure a URL para receber eventos:

```
https://seu-dominio.com/api/webhooks/events
```

### Headers Obrigatórios

```
x-webhook-token: abc123xyz789def456
Content-Type: application/json
```

### Eventos a Configurar

Configure o Whatsmew para enviar estes eventos:

1. **Novo Lead** (quando chegar uma mensagem)
2. **Atualização de Lead**
3. **Conversão** (quando virar cliente)

## Passo 4: Formato dos Dados

Quando um lead chegar, o Whatsmew deve enviar assim:

### Novo Lead

```json
{
  "event_type": "customer.created",
  "source_system": "whatsmew",
  "payload": {
    "id": "lead_123",
    "name": "João Silva",
    "contact_name": "João Silva",
    "email": "joao@email.com",
    "phone": "11987654321",
    "source": "whatsapp"
  }
}
```

### Atualização de Lead

```json
{
  "event_type": "customer.updated",
  "source_system": "whatsmew",
  "payload": {
    "id": "lead_123",
    "name": "João Silva",
    "contact_name": "João Silva",
    "email": "joao@email.com",
    "phone": "11987654321"
  }
}
```

## Passo 5: Testar

### Teste Manual

Use **Postman** ou **cURL** para testar:

```bash
curl -X POST https://seu-dominio.com/api/webhooks/events \
  -H "x-webhook-token: abc123xyz789def456" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "customer.created",
    "source_system": "whatsmew",
    "payload": {
      "id": "lead_123",
      "name": "João Silva",
      "contact_name": "João Silva",
      "email": "joao@email.com",
      "phone": "11987654321",
      "source": "whatsapp"
    }
  }'
```

### Verificar no Supabase

1. Abra **Supabase**
2. Vá em **SQL Editor**
3. Execute:

```sql
SELECT * FROM webhook_events ORDER BY received_at DESC LIMIT 10;
```

Se aparecer um evento, funcionou! ✅

### Verificar no Sistema

1. Abra a página de **Contatos** do seu sistema
2. O novo lead deve aparecer na tabela

## Passo 6: Monitorar Eventos

Para acompanhar os eventos que chegam:

```sql
-- Ver últimos eventos
SELECT * FROM webhook_events ORDER BY received_at DESC LIMIT 20;

-- Ver eventos processados com sucesso
SELECT * FROM webhook_events WHERE processed = true;

-- Ver eventos com erro
SELECT * FROM webhook_events WHERE processed = false;

-- Ver dados do payload
SELECT payload FROM webhook_events WHERE event_type = 'customer.created';
```

## Troubleshooting

### Erro 401 (Unauthorized)

**Problema:** Token inválido ou ausente

**Solução:**
1. Verifique se o token no `.env` é igual ao do header `x-webhook-token`
2. Reinicie o servidor após mudar o `.env`
3. Verifique se não há espaços extras no token

### Erro 400 (Bad Request)

**Problema:** Payload inválido

**Solução:**
1. Verifique se o JSON está bem formatado
2. Verifique se todos os campos obrigatórios estão presentes
3. Verifique se o `event_type` é um dos suportados

### Lead não aparece no sistema

**Problema:** Evento recebido mas não cadastrado

**Solução:**
1. Verifique se a tabela `companies` existe no Supabase
2. Verifique se o `phone` está no formato correto (apenas números)
3. Verifique se o `external_id` é único

## Campos Obrigatórios

Para cadastrar um lead, envie:

| Campo | Tipo | Obrigatório | Exemplo |
|-------|------|-------------|---------|
| `event_type` | string | ✅ | `customer.created` |
| `source_system` | string | ✅ | `whatsmew` |
| `payload.id` | string | ✅ | `lead_123` |
| `payload.name` | string | ✅ | `João Silva` |
| `payload.contact_name` | string | ✅ | `João Silva` |
| `payload.email` | string | ❌ | `joao@email.com` |
| `payload.phone` | string | ✅ | `11987654321` |
| `payload.source` | string | ❌ | `whatsapp` |

## Resumo

1. ✅ Aplicar SQL no Supabase
2. ✅ Adicionar `WEBHOOK_TOKEN` no `.env`
3. ✅ Configurar URL no Whatsmew: `https://seu-dominio.com/api/webhooks/events`
4. ✅ Adicionar header: `x-webhook-token: seu-token`
5. ✅ Testar enviando um evento
6. ✅ Verificar se o lead aparece em Contatos

Pronto! Seu sistema agora recebe leads em tempo real do WhatsApp.
