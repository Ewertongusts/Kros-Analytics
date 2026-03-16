# Setup CRON - Local, Vercel ou Trigger.dev

## 🚀 Opção 1: Rodar LOCAL (Agora)

### Passo 1: Instalar dependências
```bash
npm install
```

### Passo 2: Iniciar servidor
```bash
npm run dev
```

### Passo 3: Ver logs

Você verá nos logs:
```
[Init CRON] Iniciando scheduler em modo desenvolvimento...
[CRON Scheduler] Iniciando scheduler...
[CRON Scheduler] ✅ Scheduler iniciado (executa a cada minuto)
[CRON Scheduler] ⏰ Executando às 14:30:00
[CRON Scheduler] ✅ Sucesso: enviadas: 0, falhadas: 0, processadas: 0, tempo: 245ms
```

### Passo 4: Testar

1. Vá para **Assinaturas**
2. Clique no ícone de CRON em uma assinatura
3. Selecione um período (Manhã/Tarde/Noite)
4. Customize a mensagem
5. Clique em **"Agendar Cobrança"**
6. Aguarde 1 minuto
7. Verifique os logs - deve aparecer a mensagem sendo enviada

---

## 🌐 Opção 2: Deploy no Vercel (Depois)

### Passo 1: Conectar repositório

1. Acesse: https://vercel.com/
2. Clique em **"New Project"**
3. Selecione seu repositório GitHub

### Passo 2: Configurar variáveis de ambiente

No painel do Vercel, vá para **Settings** → **Environment Variables**

Adicione:
```
CRON_SECRET=kros-cron-secret-123
NUXT_PUBLIC_API_URL=https://seu-dominio.vercel.app
```

### Passo 3: Deploy

```bash
git push
```

Vercel vai fazer deploy automaticamente.

### Passo 4: Verificar CRON

1. No painel do Vercel, vá para **Deployments** → **Cron Jobs**
2. Você deve ver `/api/cron/billing` executando a cada minuto
3. Clique para ver os logs

---

## 🔧 Opção 3: Trigger.dev (Avançado)

Se você já tem Trigger.dev configurado:

### Passo 1: Deploy do job

```bash
npm run trigger:deploy
```

### Passo 2: Verificar

Acesse: https://cloud.trigger.dev/

Você deve ver o job `billing-scheduled-cron` executando.

---

## 📊 Comparação

| Opção | Setup | Custo | Logs | Melhor para |
|-------|-------|-------|------|------------|
| **Local** | 2 min | Grátis | Console | Desenvolvimento |
| **Vercel** | 5 min | Grátis | Dashboard | Produção simples |
| **Trigger.dev** | 10 min | Grátis (tier) | Avançado | Produção com retry |

---

## 🐛 Troubleshooting

### Mensagens não estão sendo enviadas

1. Verificar se `cron_enabled = true` no banco
2. Verificar se `cron_next_execution <= agora`
3. Verificar se API de CRM está configurada
4. Verificar logs

### CRON não está executando

**Local:**
- Verificar se servidor está rodando
- Verificar se `NODE_ENV=development`

**Vercel:**
- Verificar se `vercel.json` está no repositório
- Verificar se variáveis de ambiente estão configuradas
- Verificar logs no painel do Vercel

**Trigger.dev:**
- Verificar se job foi deployado
- Verificar se API Key está correta

---

## 🎯 Próximos passos

1. **Agora**: Teste local com `npm run dev`
2. **Depois**: Faça deploy no Vercel com `git push`
3. **Futuro**: Migre para Trigger.dev se precisar de mais controle

---

## 📝 Notas

- O CRON executa a cada **1 minuto**
- Horários são aleatórios dentro do período escolhido
- Cada execução é registrada em `message_logs`
- Retry automático em caso de falha
