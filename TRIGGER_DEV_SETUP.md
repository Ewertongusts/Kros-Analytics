# Setup Trigger.dev para CRON de Cobrança

Você já tem uma conta no Trigger.dev. Agora é só conectar o job.

## Passo 1: Instalar dependências

```bash
npm install
```

## Passo 2: Obter API Key do Trigger.dev

1. Acesse: https://cloud.trigger.dev/
2. Vá para **Settings** → **API Keys**
3. Copie sua **API Key**

## Passo 3: Configurar variáveis de ambiente

Adicione ao seu `.env.local`:

```env
TRIGGER_API_KEY=seu_api_key_aqui
TRIGGER_PROJECT_ID=legendary-7441
```

## Passo 4: Deploy do job

Execute:

```bash
npm run trigger:deploy
```

Isso vai:
1. Compilar o job
2. Fazer upload para Trigger.dev
3. Ativar o job

## Passo 5: Verificar no painel

1. Acesse: https://cloud.trigger.dev/
2. Vá para **Jobs**
3. Procure por **"billing-scheduled-cron"**
4. Você deve ver as execuções a cada minuto

## Como funciona

O job `server/jobs/billing-cron.ts`:
- Executa a cada **1 minuto**
- Chama a API `/api/cron/billing-scheduled`
- Registra logs no Trigger.dev
- Retry automático em caso de falha

## Logs

Para ver os logs em tempo real:

```bash
npm run trigger:dev
```

Isso abre um dashboard local onde você vê cada execução.

## Próximos passos

1. Teste agendando uma cobrança no painel
2. Aguarde 1 minuto
3. Verifique se a mensagem foi enviada
4. Veja os logs no Trigger.dev

## Troubleshooting

**Job não está executando:**
- Verificar se API Key está correta
- Verificar se `CRON_SECRET` está configurado
- Verificar logs no Trigger.dev

**Erro ao fazer deploy:**
- Verificar se `trigger.config.ts` está correto
- Verificar se `@trigger.dev/sdk` está instalado
