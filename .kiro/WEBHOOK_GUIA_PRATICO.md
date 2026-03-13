# Webhook - Guia Prático

## O que é?
Um webhook é como um "ouvinte" que fica esperando eventos do seu CRM (n8N). Quando algo acontece lá (cliente criado, pagamento recebido), ele avisa seu sistema aqui.

## Como funciona?

```
n8N (seu CRM)
    ↓
    Envia evento para: https://seu-site.com/api/webhooks/events
    ↓
Sistema recebe e processa
    ↓
Dados sincronizados no banco
```

## Passo 1: Configurar o Banco de Dados

1. Abra Supabase (seu banco de dados)
2. Vá em "SQL Editor"
3. Cole o conteúdo do arquivo: `server/migrations/webhook_events.sql`
4. Clique em "Run"

Isso cria 3 tabelas:
- `webhook_events` - Armazena os eventos recebidos
- `webhook_configs` - Configurações do webhook
- `webhook_attempts` - Tentativas de envio

## Passo 2: Configurar a Variável de Ambiente

1. Abra o arquivo `.env` na raiz do projeto
2. Adicione esta linha:

```
WEBHOOK_TOKEN=seu-token-super-secreto-aqui
```

Gere um token seguro (copie e cole no terminal):
```bash
node -e "console.log(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))"
```

Exemplo:
```
WEBHOOK_TOKEN=abc123def456ghi789jkl
```

## Passo 3: Configurar no n8N

1. Abra seu n8N
2. Crie um novo workflow ou edite um existente
3. Adicione um nó "Webhook"
4. Configure assim:

**URL:**
```
https://seu-dominio.com/api/webhooks/events
```

**Headers:**
```
x-webhook-token: abc123def456ghi789jkl
Content-Type: application/json
```

**Body (exemplo de cliente criado):**
```json
{
  "event_type": "customer.created",
  "source_system": "n8N",
  "payload": {
    "id": "123",
    "name": "Empresa XYZ",
    "contact_name": "João Silva",
    "email": "joao@empresa.com",
    "phone": "11987654321",
    "source": "crm"
  }
}
```

## Passo 4: Testar

1. No n8N, clique em "Test"
2. Vá para Supabase → SQL Editor
3. Execute:
```sql
SELECT * FROM webhook_events ORDER BY received_at DESC LIMIT 5;
```

Se aparecer um evento, funcionou! ✅

## Eventos Disponíveis

### Cliente Criado
```json
{
  "event_type": "customer.created",
  "source_system": "n8N",
  "payload": {
    "id": "123",
    "name": "Empresa XYZ",
    "contact_name": "João Silva",
    "email": "joao@empresa.com",
    "phone": "11987654321",
    "source": "crm"
  }
}
```

### Cliente Atualizado
```json
{
  "event_type": "customer.updated",
  "source_system": "n8N",
  "payload": {
    "id": "123",
    "name": "Empresa XYZ Atualizada",
    "contact_name": "João Silva",
    "email": "joao@empresa.com",
    "phone": "11987654321"
  }
}
```

### Cliente Deletado
```json
{
  "event_type": "customer.deleted",
  "source_system": "n8N",
  "payload": {
    "id": "123"
  }
}
```

### Pagamento Recebido
```json
{
  "event_type": "payment.received",
  "source_system": "n8N",
  "payload": {
    "id": "pay_123",
    "customer_id": "123",
    "amount": 1500.00,
    "method": "credit_card",
    "date": "2024-03-13"
  }
}
```

### Pagamento Falhou
```json
{
  "event_type": "payment.failed",
  "source_system": "n8N",
  "payload": {
    "id": "pay_123",
    "customer_id": "123",
    "reason": "Cartão recusado"
  }
}
```

## Monitorar Eventos

Para ver os eventos que chegaram:

**Supabase → SQL Editor:**
```sql
-- Ver últimos eventos
SELECT * FROM webhook_events ORDER BY received_at DESC LIMIT 20;

-- Ver apenas eventos processados
SELECT * FROM webhook_events WHERE processed = true;

-- Ver eventos com erro
SELECT * FROM webhook_events WHERE processed = false;
```

## Troubleshooting

### "Unauthorized" (401)
- Verifique se o token no `.env` é igual ao do header `x-webhook-token`
- Reinicie o servidor após mudar o `.env`

### Evento recebido mas não processado
- Verifique se as tabelas `companies` e `payments` existem
- Verifique se o `external_id` está sendo enviado

### Dados não aparecem no sistema
- Verifique se o `event_type` está correto
- Verifique se o `payload` tem todos os campos obrigatórios

## Resumo dos Arquivos

| Arquivo | O que faz |
|---------|-----------|
| `server/api/webhooks/events.post.ts` | Recebe os eventos |
| `server/migrations/webhook_events.sql` | Cria as tabelas no banco |
| `.env` | Armazena o token secreto |
| `WEBHOOK_SETUP.md` | Documentação técnica |

## Próximos Passos

1. ✅ Aplicar a migração SQL no Supabase
2. ✅ Adicionar `WEBHOOK_TOKEN` no `.env`
3. ✅ Configurar o webhook no n8N
4. ✅ Testar enviando um evento
5. ✅ Monitorar na tabela `webhook_events`

Pronto! Seu webhook está funcionando.
