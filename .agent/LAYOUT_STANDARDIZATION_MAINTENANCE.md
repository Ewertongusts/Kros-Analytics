# Layout Standardization - Maintenance Guide

## Como Manter a Padronização

### 1. Ao Adicionar Novas Páginas
Sempre use a estrutura padrão:

```vue
<template>
  <LayoutsKPageLayout>
    <UiKSkeleton v-if="loading" type="table" :rows="5" />

    <div v-else class="space-y-4 mb-20 animate-in fade-in duration-700">
      <!-- Header com Tabs -->
      <div class="flex items-center justify-between gap-4 mb-6">
        <!-- Abas -->
        <div class="flex items-center gap-2 border-b border-white/10">
          <button 
            :style="activeTab === tab.id ? { 
              color: `var(--kros-blue, #FF0000)`, 
              borderColor: `var(--kros-blue, #FF0000)` 
            } : {}"
          >
            {{ tab.label }}
          </button>
        </div>
        
        <!-- Botões -->
        <div class="flex items-center gap-2">
          <button>Indicadores</button>
          <button>Novo</button>
        </div>
      </div>

      <!-- Cards de Resumo -->
      <div v-if="showMetrics" class="grid grid-cols-4 gap-4">
        <!-- Cards -->
      </div>

      <!-- Filtros -->
      <div class="flex items-center gap-3">
        <!-- Filtros -->
      </div>

      <!-- Conteúdo -->
      <div>
        <!-- Tabela ou conteúdo principal -->
      </div>

      <BlocksKGlobalFooter />
    </div>
  </LayoutsKPageLayout>
</template>
```

### 2. Espaçamentos Obrigatórios
```
✅ CORRETO:
- space-y-4 entre seções
- mb-6 após header
- mb-20 antes do footer
- gap-3 ou gap-4 em componentes
- p-6 em cards

❌ ERRADO:
- space-y-0 (muito compacto)
- space-y-8 (muito espaçado)
- px-6 em componentes filhos (deixar para KPageLayout)
- gap-2 em componentes principais
```

### 3. Cores White Label
```
✅ CORRETO:
- Abas ativas: color: `var(--kros-blue, #FF0000)`
- Botões primários: backgroundColor: `var(--kros-blue, #007BFF)`
- Sempre incluir fallback color

❌ ERRADO:
- Cores hardcoded: color: '#FF0000'
- Sem fallback: color: `var(--kros-blue)`
- Usar classes como text-red-500 ou bg-blue-500
```

### 4. Estrutura de Header
```
✅ CORRETO:
<div class="flex items-center justify-between gap-4 mb-6">
  <div class="flex items-center gap-2 border-b border-white/10">
    <!-- Abas -->
  </div>
  <div class="flex items-center gap-2">
    <!-- Botões -->
  </div>
</div>

❌ ERRADO:
- Abas em dropdown
- Botões em linha vertical
- Sem border-b
- Sem mb-6
```

### 5. Filtros em Linha Única
```
✅ CORRETO:
<div class="flex items-center gap-3">
  <input class="flex-1" />
  <select />
  <input type="date" />
  <button>Limpar</button>
  <button>Exportar</button>
</div>

❌ ERRADO:
- Filtros em dropdown
- Filtros em grid
- Filtros em múltiplas linhas
- Sem flex-1 no input de busca
```

### 6. Cards de Resumo
```
✅ CORRETO:
<div class="grid grid-cols-4 gap-4">
  <div class="p-6 rounded-2xl bg-white/5 border border-white/10">
    <p class="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">
      Label
    </p>
    <p class="text-2xl font-black text-white">{{ value }}</p>
    <p class="text-[10px] text-white/40 mt-2">Descrição</p>
  </div>
</div>

❌ ERRADO:
- grid-cols-3 ou grid-cols-2
- gap-2 ou gap-6
- p-4 ou p-8
- rounded-lg ou rounded-3xl
- bg-white/10 ou bg-white/20
```

## Checklist para Code Review

Ao revisar PRs, verificar:

- [ ] Usa `<LayoutsKPageLayout>`?
- [ ] Tem `space-y-4` entre seções?
- [ ] Header tem `mb-6`?
- [ ] Abas usam white label com fallback?
- [ ] Botões primários usam white label?
- [ ] Filtros estão em linha única?
- [ ] Cards de resumo têm 4 colunas?
- [ ] Padding horizontal é `px-6`?
- [ ] Padding top é `pt-6`?
- [ ] Footer tem `mb-20`?

## Componentes Reutilizáveis (Futuros)

Para reduzir duplicação, considerar criar:

1. **KPageHeader.vue**
   - Props: tabs, showMetrics, onTabChange, onMetricsToggle
   - Reduz duplicação de header

2. **KSummaryCards.vue**
   - Props: cards (array com label, value, description)
   - Reduz duplicação de cards

3. **KFiltersBar.vue**
   - Props: filters (array com tipo, placeholder, value)
   - Reduz duplicação de filtros

## Exemplo de Novo Componente Reutilizável

```vue
<!-- KPageHeader.vue -->
<template>
  <div class="flex items-center justify-between gap-4 mb-6">
    <div class="flex items-center gap-2 border-b border-white/10">
      <button 
        v-for="tab in tabs"
        :key="tab.id"
        @click="$emit('tab-change', tab.id)"
        :style="activeTab === tab.id ? { 
          color: `var(--kros-blue, #FF0000)`, 
          borderColor: `var(--kros-blue, #FF0000)` 
        } : {}"
      >
        {{ tab.label }}
      </button>
    </div>
    
    <div class="flex items-center gap-2">
      <slot name="buttons" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tabs: Array<{ id: string; label: string }>
  activeTab: string
}>()

defineEmits<{
  'tab-change': [id: string]
}>()
</script>
```

## Testes Recomendados

1. **Visual Regression Testing**
   - Comparar screenshots antes/depois
   - Verificar em diferentes resoluções

2. **Responsividade**
   - Desktop (1920px)
   - Tablet (768px)
   - Mobile (375px)

3. **White Label**
   - Testar com diferentes cores primárias
   - Verificar fallback colors

4. **Acessibilidade**
   - Verificar contraste de cores
   - Testar navegação por teclado
   - Testar com leitores de tela

## Documentação para Desenvolvedores

Adicionar ao README:

```markdown
## Layout Standardization

Todas as páginas principais seguem um padrão visual consistente:

### Estrutura Base
- Use `<LayoutsKPageLayout>` como wrapper
- Espaçamento: `space-y-4` entre seções
- Padding: `pt-6 px-6` no layout base

### Header
- Abas com white label: `color: var(--kros-blue, #FF0000)`
- Botões primários: `backgroundColor: var(--kros-blue, #007BFF)`
- Estrutura: Abas à esquerda, botões à direita

### Filtros
- Sempre em linha única
- Input de busca com `flex-1`
- Espaçamento: `gap-3`

### Cards de Resumo
- Grid 4 colunas: `grid-cols-4`
- Espaçamento: `gap-4`
- Padding: `p-6`

Ver `.agent/LAYOUT_STANDARDIZATION_COMPLETE.md` para detalhes completos.
```

## Status

✅ **Padronização Completa**
- Assinaturas: Padronizado
- Vendas: Padronizado
- Despesas: Padronizado
- Pronto para produção
