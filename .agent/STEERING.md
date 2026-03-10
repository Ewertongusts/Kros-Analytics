# 🚀 Agent Steering & Project Rules: Kros Analytics

Este documento atua como o "cérebro" e conjunto de regras fundamentais para o desenvolvimento do projeto **Kros Analytics**. Todo agente de IA deve seguir estas diretrizes para manter a consistência e qualidade do código.

## 🎯 Objetivo do Projeto
O **Kros Analytics** é um sistema de gestão financeira e empresarial focado no acompanhamento de crescimento para empresas de **SaaS** e **CRM**. O objetivo é consolidar métricas críticas de performance para facilitar a tomada de decisão.

### Métricas Principais:
- **MRR** (Monthly Recurring Revenue - Receita Recurrente Mensal).
- **LTV** (Lifetime Value - Valor Médio de Vida do Cliente).
- **Churn Rate** (Taxa de Cancelamento).
- **Crescimento Mensal** e **Custos Operacionais**.

---

## 🛠️ Stack Tecnológica
- **Framework**: Nuxt 4 (Utilizando a estrutura moderna `/app`).
- **Estilização**: Tailwind CSS (Vanilla + Configurações Customizadas).
- **Banco de Dados**: Supabase (PostgreSQL + RLS ativo).
- **Tipografia**: Inter (Google Fonts) com visual premium fintech.

---

## 🏗️ Regras Arquiteturais (Inquebráveis)

### 1. 100% Componentizado
Esta é a regra de ouro do projeto. **NUNCA** escreva lógica complexa ou grandes blocos de template diretamente no arquivo de página (`pages/`).
- Toda seção da interface deve ser um componente independente na pasta `app/components/Blocks` ou `app/components/UI`.
- As páginas devem atuar apenas como "orquestradores", chamando os componentes e passando os dados necessários.

### 2. Estrutura de Pastas (App Directory)
- **`app/pages/`**: Contém apenas a estrutura de rotas e orquestração de componentes.
- **`app/components/`**: Contém todos os elementos visuais.
- **`app/composables/`**: Centraliza toda a lógica de negócio, chamadas ao Supabase e estados reativos (ex: `useAnalytics.ts`).
  - *Finalidade*: Manter as páginas limpas e facilitar a manutenção e testes.

### 3. Sistema de Design & Aparência
- Siga rigorosamente as cores e configurações definidas no `tailwind.config.ts`.
- Priorize uma estética **Premium Dark Fintech**: fundos profundos, bordas sutilmente iluminadas, glassmorphism e micro-animações.
- Use a fonte **Inter** com `letter-spacing` negativo para um visual profissional.

---

## 🧭 Comportamento do Agente
Ao sugerir novos recursos ou refatorar código, o agente deve:
1. Sempre verificar se a lógica pode ser extraída para um `composable`.
2. Criar novos componentes para qualquer novo bloco visual.
3. Garantir que as permissões de banco (RLS) sejam mantidas.
4. Manter a paridade visual com os componentes já criados (`KStatCard`, `RevenueChart`, etc).

---
*Este documento deve ser consultado no início de cada nova sessão de desenvolvimento.*
