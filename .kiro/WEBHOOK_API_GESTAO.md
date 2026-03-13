# API de Webhook - Guia de Uso na Gestão

## Visão Geral

A API de webhook permite que você gerencie e monitore os eventos recebidos do seu CRM (Whatsmew) diretamente na interface de gestão.

## Endpoints Disponíveis

### 1. Receber Eventos (POST)

**URL:**
```
POST /api/webhooks/events
```

**Headers:**
```
x-webhook-token: seu-token
Content-Type: application/json
```

**Body:**
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

**Resposta (Sucesso):**
```json
{
  "success": true,
  "message": "Evento recebido e processado"
}
```

**Resposta (Erro):**
```json
{
  "statusCode": 401,
  "statusMessage": "Unauthorized"
}
```

---

### 2. Listar Configurações (GET)

**URL:**
```
GET /api/webhooks/config
```

**Resposta:**
```json
[
  {
    "id": "uuid-123",
    "name": "Whatsmew CRM",
    "url": "https://seu-crm.com",
    "event_types": ["customer.created", "customer.updated"],
    "active": true,
    "token": "***",
    "created_at": "2024-03-13T10:00:00Z"
  }
]
```

---

### 3. Criar Configuração (POST)

**URL:**
```
POST /api/webhooks/config
```

**Body:**
```json
{
  "name": "Whatsmew CRM",
  "url": "https://seu-crm.com",
  "event_types": ["customer.created", "customer.updated", "customer.deleted"]
}
```

**Resposta:**
```json
{
  "id": "uuid-123",
  "name": "Whatsmew CRM",
  "url": "https://seu-crm.com",
  "event_types": ["customer.created", "customer.updated", "customer.deleted"],
  "active": true,
  "token": "abc123xyz789def456",
  "created_at": "2024-03-13T10:00:00Z"
}
```

---

### 4. Atualizar Configuração (PUT)

**URL:**
```
PUT /api/webhooks/config
```

**Body:**
```json
{
  "id": "uuid-123",
  "name": "Whatsmew CRM Atualizado",
  "url": "https://novo-crm.com",
  "event_types": ["customer.created"],
  "active": false
}
```

**Resposta:**
```json
{
  "id": "uuid-123",
  "name": "Whatsmew CRM Atualizado",
  "url": "https://novo-crm.com",
  "event_types": ["customer.created"],
  "active": false,
  "updated_at": "2024-03-13T11:00:00Z"
}
```

---

### 5. Deletar Configuração (DELETE)

**URL:**
```
DELETE /api/webhooks/config
```

**Body:**
```json
{
  "id": "uuid-123"
}
```

**Resposta:**
```json
{
  "success": true
}
```

---

## Eventos Suportados

### customer.created
Quando um novo lead chega do Whatsmew

```json
{
  "event_type": "customer.created",
  "source_system": "whatsmew",
  "payload": {
    "id": "lead_123",
    "name": "Empresa XYZ",
    "contact_name": "João Silva",
    "email": "joao@email.com",
    "phone": "11987654321",
    "source": "whatsapp"
  }
}
```

**O que acontece:**
- Cria um novo contato na tabela `companies`
- Armazena o `external_id` para sincronização futura

---

### customer.updated
Quando um lead é atualizado no Whatsmew

```json
{
  "event_type": "customer.updated",
  "source_system": "whatsmew",
  "payload": {
    "id": "lead_123",
    "name": "Empresa XYZ Atualizada",
    "contact_name": "João Silva",
    "email": "joao.silva@email.com",
    "phone": "11987654321"
  }
}
```

**O que acontece:**
- Atualiza o contato existente
- Busca pelo `external_id`

---

### customer.deleted
Quando um lead é deletado no Whatsmew

```json
{
  "event_type": "customer.deleted",
  "source_system": "whatsmew",
  "payload": {
    "id": "lead_123"
  }
}
```

**O que acontece:**
- Remove o contato do sistema

---

### payment.received
Quando um pagamento é recebido

```json
{
  "event_type": "payment.received",
  "source_system": "whatsmew",
  "payload": {
    "id": "pay_123",
    "customer_id": "lead_123",
    "amount": 1500.00,
    "method": "credit_card",
    "date": "2024-03-13"
  }
}
```

**O que acontece:**
- Marca o pagamento como `paid`
- Registra a data e método

---

### payment.failed
Quando um pagamento falha

```json
{
  "event_type": "payment.failed",
  "source_system": "whatsmew",
  "payload": {
    "id": "pay_123",
    "customer_id": "lead_123",
    "reason": "Cartão recusado"
  }
}
```

**O que acontece:**
- Marca o pagamento como `failed`
- Registra o motivo da falha

---

## Como Usar na Interface de Gestão

### 1. Monitorar Eventos Recebidos

Na página de **Gestão**, você pode ver:

```
Webhook Events
├── Total Recebidos: 1,234
├── Processados: 1,200
├── Com Erro: 34
└── Últimos Eventos:
    ├── customer.created - João Silva - 2 min atrás
    ├── customer.updated - Maria Santos - 5 min atrás
    └── payment.received - R$ 1.500,00 - 10 min atrás
```

### 2. Gerenciar Configurações

Na página de **Configurações → Webhooks**, você pode:

- ✅ Ver todas as configurações ativas
- ✅ Criar nova configuração
- ✅ Editar configuração existente
- ✅ Ativar/Desativar webhook
- ✅ Copiar token de segurança
- ✅ Deletar configuração

### 3. Testar Webhook

Botão "Testar" na interface:

```
[Testar Webhook]
  ↓
Envia evento de teste
  ↓
Mostra resultado em tempo real
```

### 4. Ver Logs de Eventos

Na página de **Logs → Webhooks**, você vê:

```
Data/Hora | Evento | Status | Payload
----------|--------|--------|--------
14:30:45  | customer.created | ✅ | João Silva
14:25:12  | customer.updated | ✅ | Maria Santos
14:20:00  | payment.received | ✅ | R$ 1.500,00
14:15:30  | customer.deleted | ❌ | Erro: ID não encontrado
```

---

## Exemplos de Uso

### Exemplo 1: Receber um Lead

**Whatsmew envia:**
```bash
curl -X POST https://seu-projeto.vercel.app/api/webhooks/events \
  -H "x-webhook-token: abc123xyz789def456" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "customer.created",
    "source_system": "whatsmew",
    "payload": {
      "id": "lead_001",
      "name": "Tech Solutions",
      "contact_name": "Carlos Mendes",
      "email": "carlos@techsolutions.com",
      "phone": "11999887766",
      "source": "whatsapp"
    }
  }'
```

**Sistema responde:**
```json
{
  "success": true,
  "message": "Evento recebido e processado"
}
```

**Na interface de gestão:**
- Lead aparece em **Contatos**
- Evento registrado em **Logs → Webhooks**
- Status: ✅ Processado

---

### Exemplo 2: Atualizar Lead

**Whatsmew envia:**
```bash
curl -X POST https://seu-projeto.vercel.app/api/webhooks/events \
  -H "x-webhook-token: abc123xyz789def456" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "customer.updated",
    "source_system": "whatsmew",
    "payload": {
      "id": "lead_001",
      "name": "Tech Solutions LTDA",
      "contact_name": "Carlos Mendes",
      "email": "carlos.mendes@techsolutions.com",
      "phone": "11999887766"
    }
  }'
```

**Na interface de gestão:**
- Dados do contato são atualizados
- Histórico registrado em **Logs**

---

### Exemplo 3: Registrar Pagamento

**Whatsmew envia:**
```bash
curl -X POST https://seu-projeto.vercel.app/api/webhooks/events \
  -H "x-webhook-token: abc123xyz789def456" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "payment.received",
    "source_system": "whatsmew",
    "payload": {
      "id": "pay_001",
      "customer_id": "lead_001",
      "amount": 2500.00,
      "method": "credit_card",
      "date": "2024-03-13"
    }
  }'
```

**Na interface de gestão:**
- Pagamento aparece em **Assinaturas**
- Status muda para "Pago"
- Data registrada

---

## Monitoramento em Tempo Real

### Dashboard de Webhooks

```
┌─────────────────────────────────────┐
│ WEBHOOK DASHBOARD                   │
├─────────────────────────────────────┤
│ Status: 🟢 Online                   │
│ Últimas 24h: 1,234 eventos          │
│ Taxa de sucesso: 97.2%              │
│ Tempo médio: 245ms                  │
├─────────────────────────────────────┤
│ Eventos por tipo:                   │
│ • customer.created: 450             │
│ • customer.updated: 320             │
│ • payment.received: 234             │
│ • payment.failed: 34                │
├─────────────────────────────────────┤
│ Últimos Eventos:                    │
│ ✅ customer.created - 30s atrás     │
│ ✅ payment.received - 2m atrás      │
│ ❌ customer.deleted - 5m atrás      │
└─────────────────────────────────────┘
```

---

## Troubleshooting

### Webhook não recebe eventos

1. Verifique se a URL está correta
2. Verifique se o token está correto
3. Verifique se o servidor está online
4. Teste com cURL

### Evento recebido mas não processado

1. Verifique o payload (JSON válido?)
2. Verifique se o `event_type` é suportado
3. Verifique os logs em **Logs → Webhooks**

### Erro 401 Unauthorized

1. Token inválido ou ausente
2. Verifique se o token no header é igual ao do `.env`
3. Redeploy após mudar token

---

## Resumo

| Ação | Endpoint | Método |
|------|----------|--------|
| Receber evento | `/api/webhooks/events` | POST |
| Listar configs | `/api/webhooks/config` | GET |
| Criar config | `/api/webhooks/config` | POST |
| Atualizar config | `/api/webhooks/config` | PUT |
| Deletar config | `/api/webhooks/config` | DELETE |

---

## Próximos Passos

1. ✅ Deploy no Vercel
2. ✅ Configurar webhook no Whatsmew
3. ✅ Testar com um lead real
4. ✅ Monitorar em tempo real na interface
5. ✅ Configurar alertas (opcional)

Pronto! Sua API de webhook está integrada e funcionando!
