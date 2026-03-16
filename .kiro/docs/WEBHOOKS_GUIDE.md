# 🔗 Webhooks Guide

## O Que São Webhooks?

Webhooks são eventos que disparam quando algo acontece no sistema. Exemplo:
- Tarefa criada → Enviar notificação
- Tarefa movida → Atualizar integração externa
- Tarefa concluída → Enviar para CRM

## Webhooks Disponíveis

### Task Created
```
Event: task.created
Payload: {
  id: string
  title: string
  column_id: string
  created_at: string
}
```

### Task Updated
```
Event: task.updated
Payload: {
  id: string
  title: string
  column_id: string
  position: number
  updated_at: string
}
```

### Task Deleted
```
Event: task.deleted
Payload: {
  id: string
  deleted_at: string
}
```

### Task Moved
```
Event: task.moved
Payload: {
  id: string
  from_column_id: string
  to_column_id: string
  position: number
  moved_at: string
}
```

## Configuração

### 1. Registrar Webhook
```typescript
// Em app/composables/useTasks.ts
const registerWebhook = async (event: string, url: string) => {
  await supabase
    .from('webhooks')
    .insert({
      event,
      url,
      active: true
    })
}
```

### 2. Disparar Webhook
```typescript
const triggerWebhook = async (event: string, payload: any) => {
  // Buscar webhooks registrados
  const { data: webhooks } = await supabase
    .from('webhooks')
    .select('*')
    .eq('event', event)
    .eq('active', true)
  
  // Enviar para cada URL
  for (const webhook of webhooks) {
    await fetch(webhook.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  }
}
```

## Integrações Comuns

### Slack
```typescript
const sendToSlack = async (task: Task) => {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({
      text: `Nova tarefa: ${task.title}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${task.title}*\n${task.description}`
          }
        }
      ]
    })
  })
}
```

### Discord
```typescript
const sendToDiscord = async (task: Task) => {
  await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({
      content: `Nova tarefa: ${task.title}`,
      embeds: [
        {
          title: task.title,
          description: task.description,
          color: 3447003
        }
      ]
    })
  })
}
```

### Google Calendar
```typescript
const addToCalendar = async (task: Task) => {
  // Usar Google Calendar API
  // Criar evento com due_date da tarefa
}
```

## Retry Logic

Se webhook falhar:
```typescript
const retryWebhook = async (webhook: Webhook, payload: any, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await fetch(webhook.url, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      return
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
}
```

## Segurança

### Validar Origem
```typescript
const validateWebhookOrigin = (req: Request) => {
  const signature = req.headers.get('x-webhook-signature')
  const payload = req.body
  
  const hash = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex')
  
  return signature === hash
}
```

### Rate Limiting
```typescript
const rateLimit = new Map()

const checkRateLimit = (url: string) => {
  const count = rateLimit.get(url) || 0
  if (count > 100) throw new Error('Rate limit exceeded')
  rateLimit.set(url, count + 1)
}
```

## Monitoramento

### Logs
```typescript
const logWebhook = async (event: string, url: string, status: number) => {
  await supabase
    .from('webhook_logs')
    .insert({
      event,
      url,
      status,
      timestamp: new Date()
    })
}
```

### Dashboard
Ver status dos webhooks em tempo real:
- Últimos eventos disparados
- Taxa de sucesso/falha
- Latência média

---

**Última atualização:** 2026-03-16
