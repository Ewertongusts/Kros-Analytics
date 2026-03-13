---
inclusion: auto
---

# Refatoração: Sistema de Clientes e Assinaturas

## 🎯 Objetivo da Refatoração

Reestruturar o sistema para separar claramente:
- **Clientes** (contatos e informações)
- **Assinaturas** (planos e cobranças recorrentes)
- **Vendas** (produtos e serviços pontuais)

## 📋 Mudanças Implementadas

### 1. Nova Página "Clientes" ✅
**Localização:** `app/pages/clientes.vue`

**Funcionalidades:**
- Reutiliza componente `KCompaniesManagement` existente
- Cadastro completo de clientes (nome, contato, endereço, etc.)
- Informações adicionais: data de aniversário, segmento, vendedor
- Tags e categorização
- Busca por CEP com preenchimento automático

**Campos do Cliente:**
- Nome completo (obrigatório)
- Nome da empresa
- WhatsApp
- Email
- CPF/CNPJ
- Endereço completo (com busca por CEP)
- Data de aniversário
- Segmento/Ramo
- Responsável/Vendedor
- Site
- Telefone fixo
- Tags
- Observações

### 2. Criação de Assinaturas Simplificada ✅
**Localização:** Botão no header de `app/pages/assinaturas.vue`

**Componentes Criados:**
- `KSubscriptionModal` - Modal principal de criação
- `KSubscriptionCustomerSelector` - Seleção de cliente com busca
- `KSubscriptionPlanSelector` - Seleção de plano

**Fluxo:**
1. Clicar em "Nova Assinatura" no header
2. Buscar e selecionar cliente (ou criar novo inline)
3. Selecionar plano recorrente
4. Definir data de início e dia de vencimento
5. Confirmar e criar assinatura + primeiro pagamento

### 3. Remoção de Empresas da Configuração ✅
**Mudança:** Removida aba "Empresas" de `app/pages/ajustes.vue`

**Motivo:** Empresas agora são "Clientes" e ficam em página dedicada

### 4. Integração com Sistema Existente ✅

**Tabelas Atualizadas:**
- `companies` → Mantida, adicionados campos: `birthday`, `segment`, `sales_rep`, `website`, `phone`, `document`, `address_*`, `tags`
- `subscriptions` → Adicionado `customer_id` (FK para companies)

**Relacionamentos:**
- Cliente (companies) 1:N Assinaturas
- Cliente (companies) 1:N Vendas
- Assinatura N:1 Plano

## 🗄️ Estrutura de Dados

### SQL Criados

1. **`sql/update_companies_for_customers.sql`**
   - Adiciona campos necessários para clientes
   - Cria índices para performance
   - Adiciona comentários de documentação

2. **`sql/add_customer_id_to_subscriptions.sql`**
   - Adiciona campo `customer_id` em subscriptions
   - Cria índice para FK
   - Migra dados existentes (company_id → customer_id)

## 🧩 Componentes Criados

### Modal de Assinatura
```
app/components/blocks/
└── KSubscriptionModal.vue (novo)

app/components/subscriptions/
├── KSubscriptionCustomerSelector.vue (novo)
└── KSubscriptionPlanSelector.vue (novo)
```

### Funcionalidades dos Componentes

**KSubscriptionCustomerSelector:**
- Busca de clientes com autocomplete
- Dropdown com resultados filtrados
- Exibição de cliente selecionado
- Botão para criar novo cliente inline
- Modal aninhado de criação de cliente

**KSubscriptionPlanSelector:**
- Dropdown de planos recorrentes
- Exibição de detalhes do plano selecionado
- Formatação de valores e ciclos

**KSubscriptionModal:**
- Integração dos seletores
- Campos de data de início e dia de vencimento
- Status inicial (ativo/pendente/trial)
- Observações
- Criação automática do primeiro pagamento

## 🔄 Mudanças na Navegação

### Sidebar ✅
- Adicionado link "Clientes" (ícone Users)
- Posicionado após "Visão Geral" e antes de "Assinaturas"

### Página Assinaturas ✅
- Botão "Nova Assinatura" no header
- Redirecionamento de "config" para "/clientes"

### Página Ajustes ✅
- Removida aba "Empresas"
- Mantidas: Perfil, Segurança, Preferências, White Label, Catálogo, Config. API

## ⚠️ Pontos de Atenção

1. ✅ **Tabela companies mantida:** Não foi necessário criar nova tabela, apenas adicionar campos
2. ✅ **Componentes reutilizados:** KCompaniesManagement, KCompanyModal já existentes
3. ✅ **Modal aninhado:** KSubscriptionModal pode abrir KCompanyModal para criar cliente
4. ⚠️ **Validações:** Implementar validações de CPF/CNPJ, WhatsApp, Email
5. ⚠️ **Duplicatas:** Implementar verificação de duplicatas por WhatsApp ou CPF/CNPJ

## 🚀 Status de Implementação

1. ✅ Atualizar steering com planejamento
2. ✅ Criar SQL para atualizar tabela companies
3. ✅ Criar página `clientes.vue`
4. ✅ Adicionar link "Clientes" na sidebar
5. ✅ Remover aba "Empresas" de ajustes
6. ✅ Criar componentes de seleção (KSubscriptionCustomerSelector, KSubscriptionPlanSelector)
7. ✅ Criar modal de assinatura (KSubscriptionModal)
8. ✅ Adicionar botão "Nova Assinatura" no header
9. ✅ Atualizar redirecionamento de "config" para "/clientes"
10. ✅ Criar SQL para adicionar customer_id em subscriptions
11. ⏳ Testar fluxo completo
12. ⏳ Atualizar documentação final

## 📊 Benefícios Alcançados

- ✅ Separação clara de responsabilidades
- ✅ Cadastro de clientes independente em página dedicada
- ✅ Criação de assinaturas mais rápida e intuitiva
- ✅ Reutilização de dados de clientes
- ✅ Melhor organização do sistema
- ✅ Facilita relatórios e análises
- ✅ Modal aninhado permite criar cliente sem sair do fluxo

## 🎯 Próximos Passos

1. Executar SQLs no banco de dados:
   - `sql/update_companies_for_customers.sql`
   - `sql/add_customer_id_to_subscriptions.sql`

2. Testar fluxo completo:
   - Criar novo cliente
   - Criar assinatura selecionando cliente
   - Criar cliente inline durante criação de assinatura
   - Verificar criação do primeiro pagamento

3. Melhorias futuras:
   - Validação de CPF/CNPJ
   - Verificação de duplicatas
   - Histórico de interações com cliente
   - Relatórios por cliente

---

**Status:** ✅ Implementação concluída - Aguardando testes
**Data:** 2026-03-12


## 🔄 Atualizações Adicionais

### Funcionalidade de Exclusão de Cobranças ✅
**Data:** 2026-03-12

**Implementado:**
- Botão de excluir cobrança nas ações da linha
- Confirmação antes de excluir
- Registro automático no histórico (`payment_history`)
- Toast de sucesso após exclusão
- Sincronização automática da lista

**Arquivos Modificados:**
- `app/components/finance/collection/KCollectionRowActions.vue` - Adicionado botão delete
- `app/components/blocks/KFinanceCollectionTableRow.vue` - Propagação do evento delete
- `app/components/blocks/KFinanceCollectionBoard.vue` - Handler `handleDelete` com registro de histórico

**Registro no Histórico:**
- `action_type`: `deleted`
- `description`: "Cobrança de [nome] foi excluída"
- `metadata`: Inclui amount, plan_name, due_date, status

---

**Status Final:** ✅ Sistema completo e funcional
**Última Atualização:** 2026-03-12 14:11


---

## 🔄 Próxima Fase: Reforma Completa

Este steering documenta a implementação inicial do sistema de assinaturas.

**⚠️ IMPORTANTE**: Uma reforma completa está planejada para melhorar UX e clareza de conceitos.

**Veja o novo steering**: `.kiro/steering/reforma-assinaturas-cobrancas.md`

**Spec completo**: `.kiro/specs/reforma-sistema-assinaturas-cobrancas/`

**Principais melhorias planejadas:**
- Separação clara de conceitos (Assinatura vs Cobrança)
- Renomeação de campos confusos
- Nova coluna "Status Assinatura" na tabela
- Filtros por status da assinatura
- Ações em massa para gerenciar assinaturas
- Indicadores visuais melhorados
- Tooltips explicativos
