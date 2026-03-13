# Deploy no Vercel - Guia Completo

## Por que Vercel?

- ✅ Grátis
- ✅ Fácil de usar
- ✅ Suporta Nuxt/Node.js
- ✅ URL pública (necessária para webhooks)
- ✅ Deploy automático do GitHub

## Passo 1: Preparar o Projeto

### 1.1 Criar arquivo `vercel.json`

Na raiz do projeto, crie o arquivo `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".output/public",
  "framework": "nuxt"
}
```

### 1.2 Verificar `package.json`

Certifique-se que tem estes scripts:

```json
{
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev",
    "preview": "nuxt preview",
    "start": "node .output/server/index.mjs"
  }
}
```

## Passo 2: Fazer Push no GitHub

1. Abra o terminal na pasta do projeto
2. Execute:

```bash
git add .
git commit -m "Preparar para deploy no Vercel"
git push origin main
```

## Passo 3: Conectar ao Vercel

### 3.1 Criar Conta

1. Acesse https://vercel.com
2. Clique em "Sign Up"
3. Escolha "Continue with GitHub"
4. Autorize o Vercel

### 3.2 Importar Projeto

1. Clique em "Add New..." → "Project"
2. Selecione seu repositório do GitHub
3. Clique em "Import"

### 3.3 Configurar Variáveis de Ambiente

1. Na página do projeto, vá em **Settings** → **Environment Variables**
2. Adicione estas variáveis:

```
WEBHOOK_TOKEN=seu-token-super-secreto
SUPABASE_URL=sua-url-supabase
SUPABASE_KEY=sua-chave-supabase-publica
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

**Como encontrar essas chaves:**

- Abra **Supabase**
- Vá em **Settings** → **API**
- Copie:
  - `Project URL` → `SUPABASE_URL`
  - `anon public` → `SUPABASE_KEY`
  - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### 3.4 Deploy

1. Clique em **Deploy**
2. Aguarde (leva 2-5 minutos)
3. Quando terminar, você terá uma URL como: `https://seu-projeto.vercel.app`

## Passo 4: Configurar Webhook no Whatsmew

Agora use a URL do Vercel:

### URL do Webhook

```
https://seu-projeto.vercel.app/api/webhooks/events
```

### Headers

```
x-webhook-token: seu-token-super-secreto
Content-Type: application/json
```

## Passo 5: Testar

### Teste com cURL

```bash
curl -X POST https://seu-projeto.vercel.app/api/webhooks/events \
  -H "x-webhook-token: seu-token-super-secreto" \
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

```sql
SELECT * FROM webhook_events ORDER BY received_at DESC LIMIT 5;
```

## Passo 6: Usar Domínio Customizado (Opcional)

Se quiser usar seu próprio domínio:

1. No Vercel, vá em **Settings** → **Domains**
2. Adicione seu domínio
3. Siga as instruções para configurar DNS

Exemplo: `https://api.seudominio.com/api/webhooks/events`

## Troubleshooting

### Erro 502 Bad Gateway

**Problema:** Deploy falhou

**Solução:**
1. Verifique os logs no Vercel (clique em "Deployments")
2. Verifique se todas as variáveis de ambiente estão configuradas
3. Tente fazer novo deploy

### Erro 401 Unauthorized

**Problema:** Token inválido

**Solução:**
1. Verifique se o token no Vercel é igual ao do header
2. Verifique se não há espaços extras
3. Redeploy após mudar variáveis

### Webhook não recebe eventos

**Problema:** URL não está acessível

**Solução:**
1. Teste a URL no navegador: `https://seu-projeto.vercel.app/api/webhooks/events`
2. Deve retornar erro 405 (Method Not Allowed) - isso é normal
3. Verifique se o Whatsmew consegue acessar a URL

## Resumo do Deploy

1. ✅ Criar `vercel.json`
2. ✅ Push no GitHub
3. ✅ Conectar ao Vercel
4. ✅ Adicionar variáveis de ambiente
5. ✅ Deploy
6. ✅ Configurar webhook no Whatsmew
7. ✅ Testar

## URLs Importantes

| O quê | URL |
|------|-----|
| Vercel | https://vercel.com |
| Seu Projeto | https://seu-projeto.vercel.app |
| Webhook | https://seu-projeto.vercel.app/api/webhooks/events |
| Supabase | https://supabase.com |

## Próximos Passos

1. Deploy no Vercel
2. Configurar webhook no Whatsmew
3. Testar com um lead real
4. Verificar se aparece em Contatos

Pronto! Seu sistema está online e recebendo leads em tempo real!
