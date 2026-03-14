# Despesas Recorrentes - Setup e Configuração

## Funcionalidade Implementada

A página de despesas agora suporta despesas recorrentes que são criadas automaticamente em intervalos regulares.

---

## Como Funciona

### 1. Criar Despesa Recorrente

No formulário de nova despesa:

1. Preencha os dados normalmente (descrição, categoria, valor, etc)
2. Marque o checkbox "Despesa Recorrente"
3. Selecione a frequência:
   - **Diária**: Cria uma nova despesa todos os dias
   - **Semanal**: Cria uma nova despesa a cada 7 dias
   - **Mensal**: Cria uma nova despesa a cada mês
   - **Anual**: Cria uma nova despesa a cada ano
4. Clique em "Criar"

### 2. Processamento Automático

O cron job `/api/cron/recurring-expenses` verifica diariamente:
- Todas as despesas marcadas como recorrentes
- Se a próxima data de criação chegou
- Se sim, cria uma nova despesa automaticamente

---

## Configuração do Cron Job

### Opção 1: Vercel Cron (Recomendado)

Se você usa Vercel, configure no `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/recurring-expenses",
      "schedule": "0 0 * * *"
    }
  ]
}
```

Isso executa o cron job todos os dias à meia-noite.

### Opção 2: Chamar Manualmente

Você pode chamar o endpoint manualmente:

```bash
curl -X POST https://seu-dominio.com/api/cron/recurring-expenses
```

### Opção 3: Usar um Serviço Externo

Use serviços como:
- **EasyCron**: https://www.easycron.com/
- **Cron-job.org**: https://cron-job.org/
- **AWS EventBridge**
- **Google Cloud Scheduler**

Configure para chamar: `POST https://seu-dominio.com/api/cron/recurring-expenses`

---

## Estrutura de Dados

### Campo: is_recurring
```typescript
is_recurring: boolean  // true = despesa recorrente
```

### Campo: recurring_frequency
```typescript
recurring_frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
```

### Exemplo de Despesa Recorrente
```json
{
  "id": "uuid",
  "description": "Servidor AWS",
  "category_id": "uuid",
  "amount": 150.00,
  "status": "pending",
  "is_recurring": true,
  "recurring_frequency": "monthly",
  "created_at": "2026-03-13T00:00:00Z",
  "notes": "Gerada automaticamente de despesa recorrente"
}
```

---

## Fluxo de Funcionamento

```
1. Usuário cria despesa com is_recurring = true
   ↓
2. Despesa é salva no banco com recurring_frequency
   ↓
3. Cron job executa diariamente
   ↓
4. Para cada despesa recorrente:
   - Calcula próxima data (baseado em recurring_frequency)
   - Se próxima data <= hoje:
     - Cria nova despesa com status 'pending'
     - Adiciona nota: "Gerada automaticamente de despesa recorrente"
   ↓
5. Usuário vê nova despesa na tabela
```

---

## Exemplos de Uso

### Despesa Mensal (Aluguel)
```
Descrição: Aluguel do escritório
Valor: 2.000,00
Frequência: Mensal
Data: 01/03/2026

Resultado:
- 01/03/2026: Cria despesa
- 01/04/2026: Cria despesa
- 01/05/2026: Cria despesa
- ...
```

### Despesa Semanal (Limpeza)
```
Descrição: Limpeza do escritório
Valor: 150,00
Frequência: Semanal
Data: 13/03/2026 (quinta-feira)

Resultado:
- 13/03/2026: Cria despesa
- 20/03/2026: Cria despesa
- 27/03/2026: Cria despesa
- ...
```

### Despesa Anual (Licença)
```
Descrição: Renovação de licença de software
Valor: 500,00
Frequência: Anual
Data: 13/03/2026

Resultado:
- 13/03/2026: Cria despesa
- 13/03/2027: Cria despesa
- 13/03/2028: Cria despesa
- ...
```

---

## Gerenciar Despesas Recorrentes

### Editar
1. Clique no botão editar na despesa
2. Modifique os dados (incluindo frequência)
3. Clique em "Atualizar"

### Pausar
1. Edite a despesa
2. Desmarque "Despesa Recorrente"
3. Clique em "Atualizar"

### Deletar
1. Clique no botão deletar
2. Confirme a exclusão
- A despesa será deletada (não afeta futuras recorrências)

---

## Notas Importantes

### Criação de Despesas
- Novas despesas são criadas com status **pending**
- Você pode marcar como pago normalmente
- A próxima recorrência será criada independentemente

### Datas
- A próxima data é calculada a partir da data da última despesa
- Se você deletar uma despesa, a próxima será criada normalmente
- Se você editar a data, a próxima será calculada a partir da nova data

### Performance
- O cron job é otimizado para grandes volumes
- Usa índices no banco para performance
- Processa apenas despesas que precisam ser criadas

### Segurança
- Apenas despesas do usuário autenticado são processadas
- RLS garante isolamento de dados
- Cada despesa criada tem user_id do proprietário

---

## Troubleshooting

### Despesas não estão sendo criadas
1. Verifique se o cron job está configurado
2. Verifique se a despesa tem `is_recurring = true`
3. Verifique se a próxima data já passou
4. Verifique os logs do servidor

### Muitas despesas sendo criadas
1. Verifique a frequência configurada
2. Verifique se o cron job está rodando múltiplas vezes
3. Verifique os logs para duplicatas

### Erro ao criar despesa recorrente
1. Verifique se a categoria existe
2. Verifique se o usuário tem permissão
3. Verifique os logs do servidor

---

## Próximas Melhorias

- [ ] Dashboard de despesas recorrentes
- [ ] Alertas antes de criar despesa
- [ ] Histórico de recorrências
- [ ] Pausar/retomar recorrências
- [ ] Limite de recorrências (máximo de X vezes)
- [ ] Integração com webhooks

---

## Arquivos Relacionados

- `app/composables/useExpenses.ts` - Composable com lógica
- `app/components/blocks/KExpensesManagement.vue` - Componente UI
- `server/api/cron/recurring-expenses.post.ts` - Cron job
- `server/migrations/create_expense_tables.sql` - Schema do banco

