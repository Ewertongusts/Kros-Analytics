# Configuração de Webhook para CRM

## URL do Webhook

```
https://seu-dominio.com/api/webhooks/events
```

## Headers Obrigatórios

```
x-webhook-token: <seu-token-aqui>
Content-Type: application/json
```

## Eventos Suportados

### 1. Cliente Criado
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

### 2. Cliente Atualizado
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

### 3. Cliente Deletado
```json
{
  "event_type": "customer.deleted",
  "source_system": "n8N",
  "payload": {
    "id": "123"
  }
}
```

### 4. Pagamento Recebido
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

### 5. Pagamento Falhou
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

## Configuração no n8N

1. **Tipo**: Webhooks
2. **Nome**: n8N
3. **URL**: `https://seu-dominio.com/api/webhooks/events`
4. **Eventos a enviar**:
   - ✅ Enviar quando ticket estiver aberto
   - ✅ Enviar quando ticket estiver pendente
   - ✅ Enviar tags do ticket
   - ✅ Enviar setores
   - ✅ Enviar mensagem do próprio bot

## Resposta Esperada

```json
{
  "success": true,
  "message": "Evento recebido e processado"
}
```

## Tratamento de Erros

- **401**: Token inválido ou ausente
- **400**: Payload inválido
- **500**: Erro ao processar evento

## Fluxo de Processamento

1. Evento recebido no webhook
2. Token validado
3. Evento armazenado em `webhook_events`
4. Processamento baseado no tipo de evento
5. Dados sincronizados com o banco de dados

## Monitoramento

Você pode acompanhar os eventos recebidos em:
- Tabela: `webhook_events`
- Filtrar por: `event_type`, `source_system`, `processed`

## Segurança

- Token é obrigatório em todas as requisições
- Eventos são validados antes de processar
- Histórico completo de eventos é mantido
- Tentativas de retry são registradas
