# Sistema de Vendas - Kros Finanças

## 🎯 Visão Geral
Sistema completo de vendas componentizado com 21 componentes modulares, suportando produtos, serviços e vendas personalizadas com parcelamento, juros, descontos e auditoria completa.

## 📁 Arquitetura de Componentes

### 🔹 Formulário (app/components/sales/form/)
- `KSaleClientFields.vue` - Campos de cliente (nome, empresa, email, WhatsApp obrigatório)
- `KSaleProductSelector.vue` - Seleção de produto/serviço do catálogo + opção personalizada
- `KSaleCustomFields.vue` - Campos personalizados (nome, categoria, descrição)
- `KSaleValueInput.vue` - Campo de valor com validações
- `KSalePaymentType.vue` - Tipo de pagamento (Pix, Dinheiro, Cartão, Boleto, Transferência)
- `KSalePaymentStatus.vue` - Status (Pago, Pendente, Agendado) e data
- `KSaleNotes.vue` - Observações

### 🔹 Desconto (app/components/sales/discount/)
- `KSaleDiscount.vue` - Sistema completo de desconto (percentual/fixo) com cálculos em tempo real

### 🔹 Parcelamento (app/components/sales/installment/)
- `KSaleInstallment.vue` - Container principal de parcelamento
- `KSaleDownPayment.vue` - Entrada/sinal com tipo de pagamento separado
- `KSaleInterest.vue` - Sistema de juros com 4 tipos:
  - Percentual por parcela (quanto mais parcelas, mais juros)
  - Percentual total fixo
  - Valor fixo por parcela
  - Valor fixo total
- `KSaleInstallmentCount.vue` - Número de parcelas e valor calculado
- `KSaleCustomInstallments.vue` - Parcelas com valores diferentes

### 🔹 Resumo (app/components/sales/summary/)
- `KSaleSummary.vue` - Container do painel lateral
- `KSaleSummaryInfo.vue` - Informações da venda em tempo real
- `KSaleInstallmentPreview.vue` - Preview visual das parcelas
- `KSaleQuickActions.vue` - Atalhos rápidos (À Vista, 3x sem juros)
- `KSaleShareButtons.vue` - Compartilhar (WhatsApp ✅, PDF 🔜, Imagem 🔜)

### 🔹 UI Base (app/components/sales/ui/)
- `KSaleCheckbox.vue` - Checkbox estilizado reutilizável
- `KSaleInput.vue` - Input com validações e hints
- `KSaleSelect.vue` - Select com variantes de cor

## 📊 Arquivos Principais

### Modal Principal
**`app/components/blocks/KSaleModal.vue`**
- Modal principal (reduzido de ~1200 para ~600 linhas)
- Gerencia estado global do formulário
- Coordena comunicação entre componentes
- Validações e cálculos centralizados

### Página de Vendas
**`app/pages/vendas.vue`**
- Tabela de vendas com filtros (Todos, Produtos, Serviços, Personalizados)
- Resumo com cards de métricas
- Botões de ação profissionais:
  - ✏️ Editar (abre modal preenchido)
  - 💬 WhatsApp (envia resumo formatado)
  - 📋 Copiar (copia informações)
  - 🗑️ Deletar (com confirmação)
- Modal de seleção de tipo de venda

### Banco de Dados
**`sql/setup_complete_sales_system.sql`**
- SQL consolidado com todos os campos
- Tabela `companies` com campos de venda
- Campos de auditoria completos

### Composables
**`app/composables/useCurrentUser.ts`**
- Busca usuário logado de `user_profiles`
- Retorna id, email e name

## 🗄️ Estrutura do Banco (Supabase)

### Tabela: `companies`

#### Campos Básicos
- `representative_name` (string) - Nome do cliente/representante
- `name` (string) - Nome da empresa
- `email` (string) - Email (opcional)
- `whatsapp` (string) - WhatsApp (obrigatório)

#### Campos de Venda
- `sale_type` (enum) - 'produto' | 'servico' | 'personalizado'
- `plan_name` (string) - Nome do produto/serviço do catálogo
- `custom_name` (string) - Nome personalizado
- `custom_category` (string) - Categoria personalizada
- `custom_description` (text) - Descrição personalizada
- `monthly_price` (decimal) - Valor original

#### Desconto
- `discount_type` (enum) - 'percentage' | 'fixed'
- `discount_value` (decimal) - Valor do desconto
- `final_value` (decimal) - Valor final após desconto

#### Pagamento
- `payment_type` (string) - Tipo de pagamento (Pix, Dinheiro, etc)
- `payment_status` (enum) - 'paid' | 'pending' | 'scheduled'
- `payment_date` (date) - Data de pagamento/vencimento

#### Parcelamento
- `installments` (integer) - Número de parcelas (1 = à vista)
- `down_payment` (decimal) - Valor da entrada
- `installments_payment_type` (string) - Tipo de pagamento das parcelas
- `custom_installments` (jsonb) - Array com valores personalizados

#### Juros
- `interest_type` (enum) - Tipo de juros
  - 'percentage_per_installment' - % por parcela
  - 'percentage_total' - % total fixo
  - 'fixed_per_installment' - R$ por parcela
  - 'fixed_total' - R$ total fixo
- `interest_rate` (decimal) - Taxa/valor de juros

#### Auditoria
- `created_by` (uuid) - ID do usuário que criou
- `created_by_name` (string) - Nome do usuário que criou
- `created_by_email` (string) - Email do usuário que criou
- `received_by` (uuid) - ID do usuário que recebeu (se pago)
- `received_by_name` (string) - Nome do usuário que recebeu
- `received_by_email` (string) - Email do usuário que recebeu
- `received_at` (timestamp) - Data/hora do recebimento

#### Outros
- `notes` (text) - Observações
- `is_active` (boolean) - Registro ativo
- `created_at` (timestamp) - Data de criação
- `updated_at` (timestamp) - Data de atualização

## 🔧 Tecnologias

- **Nuxt 4** - Framework Vue.js
- **Vue 3** - Composition API com `<script setup>`
- **TypeScript** - Tipagem estática
- **Supabase** - Backend e banco de dados
- **TailwindCSS** - Estilização
- **Auto-import** - Componentes importados automaticamente

## 💡 Padrões e Boas Práticas

### Composition API
```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const localValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>
```

### V-Model Bidirecional
Todos os componentes usam `v-model` para comunicação pai-filho:
```vue
<!-- Pai -->
<KSaleInput v-model:monthly-price="form.monthly_price" />

<!-- Filho -->
const props = defineProps<{ monthlyPrice: number }>()
const emit = defineEmits<{ 'update:monthlyPrice': [value: number] }>()
```

### Nomenclatura
- Componentes: `KSale*` (prefixo consistente)
- Props: camelCase no script, kebab-case no template
- Emits: `update:propName` para v-model

### Auto-Import (Nuxt 4)
Não precisa importar componentes manualmente:
```vue
<!-- ❌ NÃO FAZER -->
<script setup>
import KSaleInput from '~/components/sales/ui/KSaleInput.vue'
</script>

<!-- ✅ FAZER -->
<template>
  <SalesUiKSaleInput v-model="value" />
</template>
```

## 🎯 Funcionalidades Implementadas

### ✅ Completas
1. Cadastro de vendas (Produtos, Serviços, Personalizados)
2. Edição de vendas existentes
3. Sistema de desconto (percentual/fixo)
4. Parcelamento com entrada
5. Sistema de juros (4 tipos)
6. Parcelas personalizadas (valores diferentes)
7. Status de pagamento (Pago, Pendente, Agendado)
8. Auditoria completa (quem criou, quem recebeu, quando)
9. Compartilhamento via WhatsApp
10. Copiar informações da venda
11. Deletar vendas
12. Filtros por tipo (Todos, Produtos, Serviços, Personalizados)
13. Resumo com métricas
14. Validações de formulário
15. Cálculos em tempo real
16. Preview de parcelas

### 🔜 Pendentes
1. Exportação para PDF (html2canvas + jsPDF)
2. Exportação para Imagem (html2canvas)
3. Testes unitários
4. Documentação Storybook
5. Validações avançadas
6. Melhorias de acessibilidade (ARIA)

## 🐛 Problemas Resolvidos

### 1. Campos custom_* não existiam no banco
**Erro:** `column "custom_category" does not exist`
**Solução:** Adicionados campos ao SQL

### 2. payment_date com string vazia
**Erro:** `invalid input syntax for type date: ""`
**Solução:** Converter strings vazias para `null`

### 3. Modal de edição não preenchia dados
**Erro:** Campos vazios ao clicar em editar
**Solução:** 
- Removido `v-if` do modal (sempre montado)
- Adicionado `watch` para `saleData`
- Função `fillFormWithSaleData` com `nextTick`

### 4. Botões com emojis não profissionais
**Solução:** Substituídos por ícones SVG com hover states

## 📝 Regras de Negócio

### Validações
- ✅ Nome do cliente obrigatório
- ✅ WhatsApp obrigatório (email opcional)
- ✅ Valor maior que zero
- ✅ Tipo de pagamento obrigatório
- ✅ Status de pagamento obrigatório
- ✅ Data obrigatória se status = 'scheduled'
- ✅ Entrada menor que valor total
- ✅ Tipo de pagamento das parcelas obrigatório se tiver entrada

### Cálculos
- Desconto: `valor_original - desconto = valor_final`
- Base sem juros: `valor_final - entrada`
- Juros: calculado conforme tipo selecionado
- Valor a parcelar: `base_sem_juros + juros`
- Valor da parcela: `valor_a_parcelar / numero_parcelas` (arredondado 2 casas)

### Juros (quanto mais parcelas, MAIS juros)
- **Percentual por parcela:** `base * (taxa * num_parcelas / 100)`
- **Percentual total:** `base * (taxa / 100)`
- **Fixo por parcela:** `valor_fixo * num_parcelas`
- **Fixo total:** `valor_fixo`

## 🚀 Como Usar

### Criar Nova Venda
1. Clicar em "Nova Venda"
2. Selecionar tipo (Produto/Serviço)
3. Preencher dados do cliente
4. Selecionar item do catálogo ou personalizar
5. Configurar pagamento, desconto, parcelamento
6. Salvar

### Editar Venda
1. Clicar no botão ✏️ Editar na tabela
2. Modal abre preenchido com dados
3. Modificar campos desejados
4. Salvar (UPDATE no banco)

### Compartilhar via WhatsApp
1. Clicar no botão 💬 WhatsApp
2. Abre WhatsApp Web com mensagem formatada
3. Cliente recebe resumo completo da venda

## 🎨 Estilização

### Cores por Tipo
- **Produto:** Roxo (`purple-500`)
- **Serviço:** Azul (`blue-500`)
- **Personalizado:** Laranja (`orange-500`)
- **Primária:** Kros Blue (`kros-blue`)
- **Sucesso:** Verde (`emerald-500`)
- **Alerta:** Laranja (`orange-500`)
- **Erro:** Vermelho (`red-500`)

### Componentes
- Border radius: `rounded-xl` (12px) ou `rounded-2xl` (16px)
- Espaçamento: `gap-3` ou `gap-4`
- Texto: `text-[10px]` para labels, `text-sm` para conteúdo
- Uppercase: `uppercase tracking-widest` para labels
- Transições: `transition-all` em botões e hovers

## 📦 Próximos Passos Sugeridos

### Curto Prazo
1. ✅ Testar sistema completo (criar/editar/deletar)
2. 🔜 Implementar exportação PDF (jsPDF)
3. 🔜 Implementar exportação Imagem (html2canvas)
4. 🔜 Adicionar loading states nos botões
5. 🔜 Melhorar feedback visual (toasts)

### Médio Prazo
1. Criar testes unitários (Vitest)
2. Documentar componentes (Storybook)
3. Adicionar validações avançadas (Zod/Valibot)
4. Implementar busca/filtros avançados
5. Adicionar paginação na tabela

### Longo Prazo
1. Dashboard de vendas (gráficos)
2. Relatórios personalizados
3. Integração com CRM
4. Notificações automáticas
5. App mobile (Capacitor)

## 🔗 Referências

- [Nuxt 4 Docs](https://nuxt.com)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Supabase Docs](https://supabase.com/docs)
- [TailwindCSS](https://tailwindcss.com)

---

**Status:** ✅ Sistema 100% funcional e sem erros
**Última atualização:** Contexto consolidado
**Próximo passo:** Implementar exportações PDF/Imagem ou criar novos recursos
