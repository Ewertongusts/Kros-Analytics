---
inclusion: auto
---

# 🏗️ Hierarquia de Arquitetura - Ordem de Desenvolvimento

Este documento define a ordem ideal para desenvolver funcionalidades em um sistema SaaS.

---

## 📊 Análise do Seu Projeto Atual

### ✅ O que você fez (ordem atual):
1. Login, recuperação de senha, criar conta
2. Conexão com Supabase
3. Dashboard
4. Configurações
5. Outras features (vendas, despesas, etc)

### ⚠️ Problema Identificado:
- Dashboard foi criado ANTES de definir o modelo de dados
- Agora o dashboard não reflete as novas tabelas (subscriptions, customers)
- Isso causa retrabalho e refatoração

---

## 🎯 Hierarquia Ideal de Desenvolvimento

### 🔴 CAMADA 1: Fundação (Faça PRIMEIRO)
**Objetivo:** Estabelecer a base do sistema

#### 1.1 Autenticação Básica
```
✅ Login
✅ Logout
✅ Recuperação de senha
✅ Criar conta
```

#### 1.2 Estrutura do Projeto
```
✅ Configurar Nuxt + Tailwind + Supabase
✅ Criar .kiro/steering.md
✅ Criar .kiro/project-rules.md
✅ Criar .kiro/database-schema.md (vazio)
```

#### 1.3 Layout Base
```
✅ Sidebar/Menu
✅ Header
✅ Footer
✅ Página de erro 404
```

**⏱️ Tempo estimado:** 2-3 dias

---

### 🟠 CAMADA 2: Modelo de Dados (Faça SEGUNDO)
**Objetivo:** Definir TODA a estrutura de dados ANTES de criar features

#### 2.1 Planejamento do Banco
```
📋 Listar TODAS as entidades do sistema:
   - Usuários
   - Clientes/Empresas
   - Planos
   - Assinaturas
   - Pagamentos
   - Vendas
   - Produtos
   - Tags
   - Histórico
   - Configurações
```

#### 2.2 Criar Tabelas Principais
```sql
-- Ordem de criação (respeitar dependências):

1. users (já vem do Supabase Auth)
2. companies (clientes/empresas)
3. tags (categorização)
4. plans (planos de assinatura)
5. subscriptions (assinaturas - depende de companies + plans)
6. payments (pagamentos - depende de subscriptions)
7. sales (vendas - depende de companies)
8. products (produtos)
9. expenses (despesas)
10. payment_history (histórico de ações)
```

#### 2.3 Atualizar database-schema.md
```
✅ Documentar TODAS as tabelas
✅ Documentar relacionamentos
✅ Documentar regras de negócio
✅ Criar queries comuns
```

#### 2.4 Criar Composables Base
```typescript
// Criar composables para TODAS as entidades:
useCustomers.ts
usePlans.ts
useSubscriptions.ts
usePayments.ts
useSales.ts
useProducts.ts
useTags.ts
useExpenses.ts
```

**⏱️ Tempo estimado:** 3-5 dias  
**⚠️ CRÍTICO:** NÃO pule esta etapa! É a base de tudo.

---

### 🟡 CAMADA 3: CRUD Básico (Faça TERCEIRO)
**Objetivo:** Criar operações básicas para cada entidade

#### 3.1 Ordem de Implementação (do mais simples ao mais complexo):

```
1. Tags (mais simples)
   ├── Listar tags
   ├── Criar tag
   ├── Editar tag
   └── Deletar tag

2. Planos
   ├── Listar planos
   ├── Criar plano
   ├── Editar plano
   └── Deletar plano

3. Clientes
   ├── Listar clientes
   ├── Criar cliente
   ├── Editar cliente
   ├── Deletar cliente
   └── Buscar cliente

4. Produtos (se aplicável)
   ├── Listar produtos
   ├── Criar produto
   ├── Editar produto
   └── Deletar produto

5. Assinaturas (mais complexo - depende de clientes + planos)
   ├── Listar assinaturas
   ├── Criar assinatura
   ├── Editar assinatura
   ├── Cancelar assinatura
   └── Suspender assinatura

6. Vendas (complexo - depende de clientes + produtos)
   ├── Listar vendas
   ├── Criar venda
   ├── Editar venda
   └── Cancelar venda

7. Despesas
   ├── Listar despesas
   ├── Criar despesa
   ├── Editar despesa
   └── Deletar despesa
```

**⏱️ Tempo estimado:** 5-7 dias  
**💡 Dica:** Teste cada CRUD completamente antes de passar para o próximo

---

### 🟢 CAMADA 4: Dashboard e Analytics (Faça QUARTO)
**Objetivo:** Criar visualizações baseadas nos dados reais

#### 4.1 Definir Métricas
```
📊 Listar TODAS as métricas que o dashboard deve mostrar:
   - Total de clientes ativos
   - Total de assinaturas ativas
   - Receita mensal recorrente (MRR)
   - Receita anual recorrente (ARR)
   - Taxa de churn
   - Vendas do mês
   - Despesas do mês
   - Lucro líquido
   - Gráfico de evolução de receita
   - Gráfico de novos clientes
   - Próximos vencimentos
   - Assinaturas a vencer
```

#### 4.2 Criar Composable de Analytics
```typescript
// useAnalytics.ts
- fetchDashboardMetrics()
- fetchRevenueChart()
- fetchCustomersChart()
- fetchUpcomingPayments()
```

#### 4.3 Criar Componentes de Dashboard
```
KDashboardMetrics.vue (cards de métricas)
KDashboardRevenueChart.vue (gráfico de receita)
KDashboardCustomersChart.vue (gráfico de clientes)
KDashboardUpcomingPayments.vue (próximos vencimentos)
```

**⏱️ Tempo estimado:** 3-4 dias  
**✅ Vantagem:** Dashboard reflete dados reais desde o início!

---

### 🔵 CAMADA 5: Features Avançadas (Faça QUINTO)
**Objetivo:** Adicionar funcionalidades complexas

#### 5.1 Automações
```
- Cobrança automática
- Envio de mensagens WhatsApp
- Lembretes de vencimento
- Renovação automática de assinaturas
```

#### 5.2 Relatórios
```
- Relatório de vendas
- Relatório de assinaturas
- Relatório financeiro
- Exportação (PDF, Excel, CSV)
```

#### 5.3 Integrações
```
- API de pagamento (Stripe, Mercado Pago)
- API de WhatsApp
- CRM externo
- Contabilidade
```

#### 5.4 Configurações Avançadas
```
- White label
- Permissões de usuário
- Webhooks
- API pública
```

**⏱️ Tempo estimado:** 7-10 dias

---

### 🟣 CAMADA 6: Otimizações (Faça POR ÚLTIMO)
**Objetivo:** Melhorar performance e UX

#### 6.1 Performance
```
- Cache de queries
- Lazy loading
- Paginação
- Índices no banco
```

#### 6.2 UX/UI
```
- Animações
- Loading states
- Empty states
- Skeleton loaders
```

#### 6.3 SEO e Acessibilidade
```
- Meta tags
- Open Graph
- ARIA labels
- Teclado navigation
```

**⏱️ Tempo estimado:** 3-5 dias

---

## 🎯 Aplicando ao Seu Projeto Atual

### Situação Atual:
```
✅ CAMADA 1: Fundação (completa)
⚠️ CAMADA 2: Modelo de Dados (parcial - em refatoração)
✅ CAMADA 3: CRUD Básico (completo)
⚠️ CAMADA 4: Dashboard (desatualizado - precisa refatorar)
🔄 CAMADA 5: Features Avançadas (em andamento)
❌ CAMADA 6: Otimizações (não iniciada)
```

### 🔧 Plano de Correção:

#### Fase 1: Finalizar Modelo de Dados (URGENTE)
```
1. ✅ Criar tabela subscriptions
2. ✅ Atualizar tabela companies
3. ✅ Criar composables (useCustomers, useSubscriptionsManager)
4. ✅ Atualizar database-schema.md
5. ⏳ Migrar dados antigos (se necessário)
6. ⏳ Testar todos os composables
```

#### Fase 2: Refatorar Dashboard
```
1. Atualizar useAnalytics.ts para usar novas tabelas
2. Refatorar KDashboardMetrics para mostrar:
   - Total de clientes (companies)
   - Total de assinaturas ativas (subscriptions)
   - MRR (subscriptions.amount)
   - Próximos vencimentos (subscriptions.due_day)
3. Atualizar gráficos para usar dados corretos
4. Testar todas as métricas
```

#### Fase 3: Ajustar Features Existentes
```
1. ✅ Página de assinaturas (já atualizada)
2. ✅ Página de clientes (já criada)
3. ⏳ Página de vendas (verificar se usa companies corretamente)
4. ⏳ Página de despesas (verificar relacionamentos)
5. ⏳ Configurações (verificar se tudo funciona)
```

#### Fase 4: Continuar Features Avançadas
```
1. Automações
2. Relatórios
3. Integrações
```

---

## 📋 Checklist para Próximos Projetos

### Antes de Começar:
```
[ ] Definir TODAS as entidades do sistema
[ ] Criar diagrama ER (relacionamentos)
[ ] Planejar estrutura de pastas
[ ] Criar .kiro/steering.md com roadmap completo
```

### Ordem de Desenvolvimento:
```
[ ] CAMADA 1: Autenticação + Layout (2-3 dias)
[ ] CAMADA 2: Modelo de Dados COMPLETO (3-5 dias)
[ ] CAMADA 3: CRUD Básico de TODAS entidades (5-7 dias)
[ ] CAMADA 4: Dashboard com dados reais (3-4 dias)
[ ] CAMADA 5: Features Avançadas (7-10 dias)
[ ] CAMADA 6: Otimizações (3-5 dias)
```

### Regras de Ouro:
```
✅ NUNCA crie dashboard antes do modelo de dados
✅ SEMPRE documente o banco em database-schema.md
✅ SEMPRE crie composables antes de componentes
✅ SEMPRE teste CRUD completo antes de avançar
✅ SEMPRE siga a ordem de dependências
```

---

## 🚨 Erros Comuns a Evitar

### ❌ Erro 1: Dashboard Primeiro
```
Problema: Criar dashboard antes de definir dados
Resultado: Dashboard com dados fake ou desatualizados
Solução: SEMPRE criar modelo de dados primeiro
```

### ❌ Erro 2: Pular Planejamento do Banco
```
Problema: Criar tabelas conforme necessidade
Resultado: Relacionamentos ruins, refatoração constante
Solução: Planejar TODAS as tabelas no início
```

### ❌ Erro 3: Features Antes de CRUD
```
Problema: Criar automações antes de CRUD básico
Resultado: Não tem dados para automatizar
Solução: CRUD completo primeiro, features depois
```

### ❌ Erro 4: Não Documentar
```
Problema: Não atualizar database-schema.md
Resultado: Perder tempo descobrindo estrutura
Solução: Atualizar documentação sempre
```

### ❌ Erro 5: Não Testar
```
Problema: Criar tudo e testar no final
Resultado: Bugs difíceis de rastrear
Solução: Testar cada camada antes de avançar
```

---

## 📊 Estimativa de Tempo Total

### Projeto Pequeno (MVP):
```
CAMADA 1: 2 dias
CAMADA 2: 3 dias
CAMADA 3: 5 dias
CAMADA 4: 3 dias
Total: ~13 dias (2-3 semanas)
```

### Projeto Médio (SaaS Completo):
```
CAMADA 1: 3 dias
CAMADA 2: 5 dias
CAMADA 3: 7 dias
CAMADA 4: 4 dias
CAMADA 5: 10 dias
CAMADA 6: 5 dias
Total: ~34 dias (6-8 semanas)
```

### Projeto Grande (Enterprise):
```
CAMADA 1: 5 dias
CAMADA 2: 10 dias
CAMADA 3: 15 dias
CAMADA 4: 7 dias
CAMADA 5: 20 dias
CAMADA 6: 10 dias
Total: ~67 dias (12-16 semanas)
```

---

## 🎯 Próximos Passos para Seu Projeto

### Imediato (Esta Semana):
```
1. ✅ Finalizar refatoração de subscriptions
2. ⏳ Refatorar dashboard para usar novas tabelas
3. ⏳ Testar fluxo completo de assinaturas
4. ⏳ Atualizar analytics para MRR correto
```

### Curto Prazo (Próximas 2 Semanas):
```
1. Verificar todas as páginas usam dados corretos
2. Criar relatórios baseados em subscriptions
3. Implementar automações de cobrança
4. Adicionar validações e verificações
```

### Médio Prazo (Próximo Mês):
```
1. Integrações com APIs externas
2. Sistema de notificações
3. Relatórios avançados
4. Otimizações de performance
```

---

**Criado em:** 2026-03-12  
**Última Atualização:** 2026-03-12  
**Status:** 📘 Guia Ativo
